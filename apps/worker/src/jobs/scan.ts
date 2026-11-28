import {
  and, asc, companies, db, desc, drafts, enrollments, eq, gte, inArray, isNull, jobPostings, lt, or, opportunities, signals, snapshots, workspaces,
} from '@frithly/db';
import {
  DEFAULT_GATE, SECURITY_GATEWAYS, SUBTYPES, classifySubdomain, evaluate, headcountDrop, isRepost, jobSignals, sha256,
  type Candidate, type Subtype,
} from '@frithly/core';
import { certSubdomains, detectAts, dnsState, fetchJobs, githubStack, hnLaunches, newsByQuery, scanSite, triageSignals } from '@frithly/engine';
import { log } from '../lib';

const ACTIVE_PLANS = ['trial', 'starter', 'pro', 'agency'] as const;

/** Companies not scanned in the last 24 hours, oldest first. */
export async function dueCompanies(limit = 50) {
  const cutoff = new Date(Date.now() - 24 * 3_600_000);
  return db
    .select({ id: companies.id })
    .from(companies)
    .innerJoin(workspaces, eq(workspaces.id, companies.workspaceId))
    .where(and(or(isNull(companies.lastScannedAt), lt(companies.lastScannedAt, cutoff)), inArray(workspaces.plan, [...ACTIVE_PLANS]), eq(companies.isAgency, false)))
    .orderBy(asc(companies.lastScannedAt))
    .limit(limit);
}

/** Delta memory. Returns the previous payload when content changed, `unchanged` otherwise. First sight stores a baseline. */
async function snapshot<T>(companyId: string, source: string, payload: T): Promise<{ status: 'first' | 'changed' | 'unchanged'; prev?: T; prevAt?: Date }> {
  const hash = sha256(JSON.stringify(payload));
  const [last] = await db.select().from(snapshots).where(and(eq(snapshots.companyId, companyId), eq(snapshots.source, source))).orderBy(desc(snapshots.capturedAt)).limit(1);
  if (last?.hash === hash) return { status: 'unchanged' };
  await db.insert(snapshots).values({ companyId, source, hash, payload: payload as unknown });
  return last ? { status: 'changed', prev: last.payload as T, prevAt: last.capturedAt } : { status: 'first' };
}

async function lastSnapshotAt(companyId: string, source: string) {
  const [last] = await db.select({ at: snapshots.capturedAt }).from(snapshots).where(and(eq(snapshots.companyId, companyId), eq(snapshots.source, source))).orderBy(desc(snapshots.capturedAt)).limit(1);
  return last?.at ?? null;
}

const daysSince = (d: Date | null) => (d ? (Date.now() - d.getTime()) / 86_400_000 : Infinity);

export async function scanCompany(companyId: string) {
  const [co] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!co) return;
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, co.workspaceId));
  if (!ws) return;
  const profile = ws.profile;
  const cands: Candidate[] = [];
  const now = new Date();
  const patch: Partial<typeof companies.$inferInsert> = { lastScannedAt: now };
  const add = (subtype: Subtype, evidence: string, o: Partial<Candidate> = {}) =>
    cands.push({ subtype, evidence, eventDate: o.eventDate ?? now, fingerprint: o.fingerprint ?? `${subtype}:${sha256(evidence).slice(0, 16)}`, needsTriage: o.needsTriage ?? false, meta: o.meta, url: o.url });

  /* A. Job boards: track every post, then read titles and descriptions. */
  let ats = co.ats;
  if (!ats) { ats = await detectAts(co.domain); if (ats) patch.ats = ats; }
  if (ats) {
    const jobs = await fetchJobs(ats);
    const known = await db.select().from(jobPostings).where(eq(jobPostings.companyId, co.id));
    const byExt = new Map(known.map((k) => [k.extId, k]));
    const closed = known.filter((k) => k.closedAt).map((k) => ({ title: k.title, closedAt: k.closedAt! }));
    const live = new Set<string>();
    for (const j of jobs) {
      live.add(j.id);
      const prev = byExt.get(j.id);
      const firstSeen = prev?.firstSeen ?? (j.postedAt < now ? j.postedAt : now);
      if (!prev) {
        await db.insert(jobPostings).values({ companyId: co.id, extId: j.id, title: j.title, location: j.location, url: j.url, textHash: sha256(j.text ?? ''), postedAt: j.postedAt, firstSeen }).onConflictDoNothing();
        const repost = known.length ? isRepost(j.title, closed, now) : null;
        if (repost) add('STALE_ROLE', `“${repost.title}” closed and reposted as “${j.title}”`, { fingerprint: `STALE_ROLE:repost:${j.id}`, meta: { title: j.title }, url: j.url });
      } else {
        await db.update(jobPostings).set({ lastSeen: now, closedAt: null, title: j.title }).where(eq(jobPostings.id, prev.id));
      }
      cands.push(...jobSignals({ id: j.id, title: j.title, text: j.text, location: j.location, firstSeen, postedAt: j.postedAt }, {
        competitors: profile?.competitors ?? [], roles: profile?.hiringRoles ?? [], sizeBand: co.size, now, url: j.url,
      }));
    }
    const gone = known.filter((k) => !k.closedAt && !live.has(k.extId)).map((k) => k.id);
    if (gone.length) await db.update(jobPostings).set({ closedAt: now }).where(inArray(jobPostings.id, gone));

    // Layoff proxy: open roles fell more than 40% within 14 days.
    const history = await db.select().from(snapshots).where(and(eq(snapshots.companyId, co.id), eq(snapshots.source, 'ats_count'), gte(snapshots.capturedAt, new Date(now.getTime() - 14 * 86_400_000))));
    const drop = headcountDrop(history.map((h) => ({ count: (h.payload as { count: number }).count, at: h.capturedAt })), jobs.length, now);
    if (drop) add('HEADCOUNT_DROP', `Open roles fell from ${drop.peak} to ${drop.current} in two weeks`, { fingerprint: `HEADCOUNT_DROP:${now.toISOString().slice(0, 10)}` });
    await snapshot(co.id, 'ats_count', { count: jobs.length });
  }

  /* B. Website: pricing changes, site problems, GitHub org discovery. */
  const site = await scanSite(co.domain);
  if (site.ok) {
    if (site.name && co.name === co.domain) patch.name = site.name;
    if (!co.githubOrg && site.githubOrg) patch.githubOrg = site.githubOrg;
    if (site.pricingHash) {
      const s = await snapshot(co.id, 'pricing', site.pricingHash);
      if (s.status === 'changed') add('PRICING_CHANGE', 'Pricing page changed since the last check', { url: `https://${co.domain}/pricing` });
    }
    if (!co.siteHash && site.problems.length) add('SITE_HEALTH', site.problems.join('; '), { fingerprint: `SITE_HEALTH:${sha256(site.problems.join('|')).slice(0, 12)}`, url: `https://${co.domain}` });
    patch.siteHash = site.hash;
    patch.tech = site.tech;
  }

  /* C. DNS: vendor verifications added or removed, mail gateway and outbound senders. Baseline on first sight. */
  const dnsNow = await dnsState(co.domain);
  if (dnsNow) {
    const s = await snapshot(co.id, 'dns', dnsNow);
    if (s.status === 'changed' && s.prev) {
      for (const v of dnsNow.vendors.filter((x) => !s.prev!.vendors.includes(x))) add('TECH_ADOPTION', `Added ${v} domain verification`, { meta: { tool: v } });
      for (const v of s.prev.vendors.filter((x) => !dnsNow.vendors.includes(x))) add('TECH_REMOVAL', `Removed ${v} domain verification`, { meta: { tool: v } });
      if (dnsNow.mx !== s.prev.mx && SECURITY_GATEWAYS.includes(dnsNow.mx)) add('SECURITY_GATEWAY', `Mail moved from ${s.prev.mx} to ${dnsNow.mx}`);
      const newSenders = dnsNow.spf.filter((x) => !s.prev!.spf.includes(x) && /sendgrid|mailgun|mandrill|outreach|salesloft|hubspot|mailchimp|amazonses|apollo|instantly|lemlist/i.test(x));
      if (newSenders.length) add('OUTBOUND_INFRA', `New email senders authorised: ${newSenders.join(', ')}`);
    }
  }

  /* D. Certificates (every 3 days): new subdomains like sso., status., api., eu. */
  if (daysSince(await lastSnapshotAt(co.id, 'ssl')) >= 3) {
    const subs = await certSubdomains(co.domain);
    const s = await snapshot(co.id, 'ssl', subs.map((x) => x.name).sort());
    const prev = new Set(s.prev ?? []);
    for (const sub of subs) {
      // On first sight only genuinely recent ones count; after that, anything new since the last check.
      const fresh = s.status === 'first' ? daysSince(sub.firstSeen) <= 21 : s.status === 'changed' && !prev.has(sub.name);
      const t = fresh ? classifySubdomain(sub.name, co.domain) : null;
      if (t) add(t, `New subdomain ${sub.name}`, { eventDate: sub.firstSeen, fingerprint: `${t}:${sub.name}`, meta: { subdomain: sub.name } });
    }
  }

  /* E. GitHub (weekly): notable SDKs and clouds added or removed in public repos. */
  const org = patch.githubOrg ?? co.githubOrg;
  if (org && daysSince(await lastSnapshotAt(co.id, 'github')) >= 7) {
    const st = await githubStack(org);
    if (st) {
      const s = await snapshot(co.id, 'github', st.tools);
      if (s.status === 'changed' && s.prev) {
        for (const t of st.tools.filter((x) => !s.prev!.includes(x))) add('TECH_ADOPTION', `Started using ${t} in their public code`, { meta: { tool: t } });
        for (const t of s.prev.filter((x) => !st.tools.includes(x))) add('TECH_REMOVAL', `Stopped using ${t} in their public code`, { meta: { tool: t } });
      }
    }
  }

  /* F. News: one boolean query per category. Hacker News launches. */
  const name = patch.name ?? co.name;
  for (const q of ['leadership', 'compliance', 'expansion', 'layoff'] as const) {
    for (const n of (await newsByQuery(name, co.domain, q)).slice(0, 3)) {
      add(n.subtype, n.title, { eventDate: n.at, fingerprint: `${n.subtype}:news:${sha256(n.url).slice(0, 16)}`, needsTriage: true, meta: { title: n.title, source: n.source }, url: n.url });
    }
  }
  for (const h of (await hnLaunches(name, co.domain)).slice(0, 2)) add('LAUNCH', h.title, { eventDate: h.at, fingerprint: `LAUNCH:${h.url}`, url: h.url });

  await db.update(companies).set(patch).where(eq(companies.id, co.id));

  /* Save. Only rows that are new (by fingerprint) go to triage, so unchanged companies cost nothing. */
  const fresh: { id: string; subtype: Subtype; evidence: string; source: string }[] = [];
  for (const c of cands) {
    const d = SUBTYPES[c.subtype];
    const [row] = await db.insert(signals).values({
      workspaceId: co.workspaceId, companyId: co.id, type: d.category.toLowerCase(), label: d.label, detail: c.evidence.slice(0, 500), url: c.url,
      fingerprint: c.fingerprint, category: d.category, subtype: c.subtype, evidence: c.evidence.slice(0, 1000), eventDate: c.eventDate,
      baseWeight: d.weight, verified: c.needsTriage ? null : true, meta: c.meta,
    }).onConflictDoNothing().returning({ id: signals.id });
    if (row && c.needsTriage) fresh.push({ id: row.id, subtype: c.subtype, evidence: c.evidence, source: c.fingerprint.includes(':news:') ? 'news headline' : 'job post' });
  }
  if (fresh.length && process.env.ANTHROPIC_API_KEY) {
    const t = await triageSignals({ name, domain: co.domain }, fresh);
    for (const v of t.verdicts) if (fresh.some((f) => f.id === v.id)) await db.update(signals).set({ verified: !!v.verified }).where(eq(signals.id, v.id));
    if (t.staffingAgency) {
      await db.update(companies).set({ isAgency: true }).where(eq(companies.id, co.id));
      await db.insert(signals).values({ workspaceId: co.workspaceId, companyId: co.id, type: 'disqualifier', label: SUBTYPES.STAFFING_AGENCY.label, fingerprint: 'STAFFING_AGENCY', category: 'DISQUALIFIER', subtype: 'STAFFING_AGENCY', evidence: 'Job posts are for undisclosed clients', eventDate: now, baseWeight: 0, verified: true }).onConflictDoNothing();
    }
  }

  const e = await evaluateCompany(co.id);
  log('scan', 'company scanned', { domain: co.domain, candidates: cands.length, triaged: fresh.length, score: e?.score, promote: e?.promotedBy, suppressed: e?.suppressed });
}

/**
 * Score a company from its verified signals and keep its opportunity in step:
 * promote it into the pool, update it, drop it from the pool, or reopen it after cooldown.
 */
export async function evaluateCompany(companyId: string) {
  const [co] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!co) return null;
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, co.workspaceId));
  const since = new Date(Date.now() - DEFAULT_GATE.windowDays * 86_400_000);
  const rows = await db.select().from(signals).where(and(eq(signals.companyId, co.id), gte(signals.eventDate, since)));
  const ev = evaluate(
    rows.filter((r) => r.subtype).map((r) => ({ id: r.id, subtype: r.subtype as Subtype, eventDate: r.eventDate!, verified: r.verified, evidence: r.evidence, meta: r.meta ?? undefined })),
    { gate: ws?.profile?.gate, cooldownUntil: co.cooldownUntil },
  );
  const top = ev.active[0]?.id ?? null;
  const vals = { score: ev.score, signalId: top, activeSignals: ev.active.length, combo: ev.combo?.name ?? null, promotedBy: ev.promotedBy, evaluatedAt: new Date() };
  const [opp] = await db.select().from(opportunities).where(and(eq(opportunities.workspaceId, co.workspaceId), eq(opportunities.companyId, co.id)));

  if (!opp) {
    if (ev.promote) await db.insert(opportunities).values({ workspaceId: co.workspaceId, companyId: co.id, ...vals }).onConflictDoNothing();
  } else if (opp.status === 'new' && !opp.releasedOn) {
    if (ev.promote) await db.update(opportunities).set(vals).where(eq(opportunities.id, opp.id));
    else await db.delete(opportunities).where(eq(opportunities.id, opp.id)); // fell below the gate or suppressed
  } else if (['new', 'saved'].includes(opp.status)) {
    await db.update(opportunities).set({ ...vals, signalId: top ?? opp.signalId }).where(eq(opportunities.id, opp.id));
  } else if (['lost', 'skipped'].includes(opp.status) && ev.promote) {
    // Cooldown is over (evaluate checks it) and a fresh stack qualified: start again.
    await db.delete(drafts).where(eq(drafts.opportunityId, opp.id));
    await db.delete(enrollments).where(eq(enrollments.opportunityId, opp.id));
    await db.update(opportunities).set({ ...vals, status: 'new', releasedOn: null, contactId: null, persona: null, hypothesis: null, angle: null }).where(eq(opportunities.id, opp.id));
  }
  return ev;
}

/** Daily: re-score the unreleased pool so decay pushes stale accounts out before the list is picked. */
export async function rescorePool(workspaceId: string) {
  const pool = await db.select({ c: opportunities.companyId }).from(opportunities).where(and(eq(opportunities.workspaceId, workspaceId), eq(opportunities.status, 'new'), isNull(opportunities.releasedOn)));
  for (const p of pool) await evaluateCompany(p.c);
}
