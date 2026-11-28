import { and, companies, contacts, db, desc, domainMail, drafts, eq, inArray, isNotNull, isNull, ne, or, monthKey, opportunities, signals, usage, users, workspaces } from '@frithly/db';
import { PLANS, TRIAL_RELEASE_DAYS, matchCombo, planLimits, personaFor, type PlanKey } from '@frithly/core';
import { discoverHiring, findEmail, findPeople, pickContact, scanSite, summarizeSite, writeEmail, writeHypothesis } from '@frithly/engine';
import { bumpUsage, log, todayIn } from '../lib';
import { rescorePool } from './scan';

/**
 * Once a day per workspace (in its own time zone), move the best unreleased opportunities
 * into today's list. Trials get 100 companies over 14 days, in 5 drops.
 */
export async function releaseAll(enqueueEnrich: (oppId: string) => Promise<unknown>) {
  const all = await db.select().from(workspaces).where(inArray(workspaces.plan, ['trial', 'starter', 'pro', 'agency']));
  for (const ws of all) {
    if (!ws.onboardedAt) continue;
    const tz = ws.sending?.tz || 'UTC';
    const today = todayIn(tz);
    const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
    if (hour < 6) continue; // lists land in the morning

    const [already] = await db.select({ id: opportunities.id }).from(opportunities).where(and(eq(opportunities.workspaceId, ws.id), eq(opportunities.releasedOn, today))).limit(1);
    if (already) continue;

    if (ws.plan === 'trial' && ws.trialEndsAt && ws.trialEndsAt < new Date()) {
      await db.update(workspaces).set({ plan: 'expired' }).where(eq(workspaces.id, ws.id));
      continue;
    }

    const lim = planLimits(ws.plan as PlanKey, ws.addons);
    let n = lim.daily;
    if (ws.plan === 'trial') {
      const day = Math.floor((Date.now() - ws.createdAt.getTime()) / 86_400_000);
      // Drops due so far vs drops already made, so a missed day (no signals yet) catches up later.
      const due = TRIAL_RELEASE_DAYS.filter((d) => d <= day).length;
      const done = await db.selectDistinct({ d: opportunities.releasedOn }).from(opportunities).where(and(eq(opportunities.workspaceId, ws.id), isNotNull(opportunities.releasedOn)));
      if (done.length >= due) continue;
      n = Math.ceil(PLANS.trial.month / TRIAL_RELEASE_DAYS.length);
    }
    const [u] = await db.select().from(usage).where(and(eq(usage.workspaceId, ws.id), eq(usage.month, monthKey())));
    n = Math.min(n, lim.month - (u?.opportunities ?? 0));
    if (n <= 0) continue;

    await rescorePool(ws.id);
    await topUp(ws, n);
    const pick = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(and(eq(opportunities.workspaceId, ws.id), eq(opportunities.status, 'new'), isNull(opportunities.releasedOn), or(isNull(opportunities.promotedBy), ne(opportunities.promotedBy, 'manual'))))
      .orderBy(desc(opportunities.score))
      .limit(n);
    if (!pick.length) continue;
    await db.update(opportunities).set({ releasedOn: today }).where(inArray(opportunities.id, pick.map((p) => p.id)));
    await bumpUsage(ws.id, 'opportunities', pick.length);
    for (const p of pick) await enqueueEnrich(p.id);
    log('release', 'released', { ws: ws.id, n: pick.length });
  }
}

/** Find the right person, their verified email, and write the first email. */
export async function enrichOpportunity(oppId: string) {
  const [row] = await db
    .select({ opp: opportunities, co: companies, ws: workspaces, sig: signals })
    .from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .innerJoin(workspaces, eq(workspaces.id, opportunities.workspaceId))
    .leftJoin(signals, eq(signals.id, opportunities.signalId))
    .where(eq(opportunities.id, oppId));
  if (!row) return;
  const { opp, co, ws, sig } = row;

  // The stack behind this account, strongest first, and who owns the problem.
  const stack = (await db.select().from(signals).where(and(eq(signals.companyId, co.id), eq(signals.verified, true))))
    .filter((s) => s.category !== 'DISQUALIFIER' && s.eventDate && Date.now() - s.eventDate.getTime() <= 45 * 86_400_000)
    .sort((a, b) => (b.baseWeight ?? 0) - (a.baseWeight ?? 0)).slice(0, 6);
  let persona = opp.persona, hypothesis = opp.hypothesis, angle = opp.angle;
  if (!hypothesis && ws.profile && process.env.ANTHROPIC_API_KEY) {
    const active = stack.map((s) => ({ subtype: s.subtype as never, eventDate: s.eventDate!, verified: true, evidence: s.evidence, meta: s.meta ?? undefined, points: s.baseWeight ?? 0, category: s.category as never }));
    const combo = matchCombo(active);
    const h = await writeHypothesis({
      company: { name: co.name, domain: co.domain }, offer: ws.profile.offer, targetTitles: ws.profile.titles,
      combo, signals: stack.map((s) => ({ label: s.label, evidence: s.evidence ?? s.detail ?? '', eventDate: s.eventDate! })),
    });
    ({ persona, hypothesis, angle } = h);
    if (!persona) persona = personaFor({ combo, active })[0];
    await db.update(opportunities).set({ persona, hypothesis, angle }).where(eq(opportunities.id, opp.id));
  }

  let contact = opp.contactId ? (await db.select().from(contacts).where(eq(contacts.id, opp.contactId)))[0] : undefined;
  if (!contact) {
    const people = await findPeople(co.domain);
    // The user's own buyer titles come first; the persona the signals point to breaks ties.
    const p = pickContact(people, [...(ws.profile?.titles ?? []), ...(persona ? [persona] : [])]);
    if (!p) {
      log('enrich', 'no person found', { domain: co.domain });
      return;
    }
    const [cache] = await db.select().from(domainMail).where(eq(domainMail.domain, co.domain));
    const { found, learned } = await findEmail(p.name, co.domain, cache ?? {});
    await bumpUsage(ws.id, 'lookups');
    if (learned.mx !== undefined || learned.pattern) {
      await db.insert(domainMail).values({ domain: co.domain, mx: learned.mx ?? cache?.mx ?? null, catchAll: learned.catchAll ?? cache?.catchAll ?? null, pattern: learned.pattern ?? cache?.pattern ?? null })
        .onConflictDoUpdate({ target: domainMail.domain, set: { mx: learned.mx ?? cache?.mx ?? null, catchAll: learned.catchAll ?? cache?.catchAll ?? null, pattern: learned.pattern ?? cache?.pattern ?? null, checkedAt: new Date() } });
    }
    [contact] = await db.insert(contacts).values({
      workspaceId: ws.id, companyId: co.id, name: p.name, role: p.title, linkedinUrl: p.linkedin || null,
      email: found.email, emailStatus: found.status, source: found.source,
    }).returning();
    // Keep everyone else we found too, without spending lookups on their emails (People tab, "Use instead").
    const others = people.filter((x) => x.name !== p.name).slice(0, 8);
    if (others.length) await db.insert(contacts).values(others.map((x) => ({ workspaceId: ws.id, companyId: co.id, name: x.name, role: x.title, linkedinUrl: x.linkedin || null, source: 'team page' })));
    await db.update(opportunities).set({ contactId: contact.id }).where(eq(opportunities.id, opp.id));
  }

  const [existing] = await db.select({ id: drafts.id }).from(drafts).where(and(eq(drafts.opportunityId, opp.id), eq(drafts.stepIndex, 0)));
  if (existing || !ws.profile || !sig) return;

  const [owner] = await db.select().from(users).where(eq(users.id, ws.ownerId));
  const site = await scanSite(co.domain);
  const summary = site.ok ? await summarizeSite(co.domain, site.text) : '';
  const s = ws.sending;
  const draft = await writeEmail(
    {
      senderName: owner?.name ?? 'the team',
      senderCompany: ws.name,
      offer: ws.profile.offer,
      proofPoint: ws.profile.proofPoint,
      company: { name: co.name, domain: co.domain, industry: co.industry, siteSummary: summary },
      contact: { name: contact.name, role: contact.role },
      signal: { type: sig.type, label: sig.label, detail: sig.evidence ?? sig.detail },
      stack: stack.map((s) => ({ label: s.label, evidence: s.evidence ?? s.detail ?? '' })),
      hypothesis, angle,
      step: { index: 0, brief: 'Signal, what it usually causes, proof, one easy question' },
    },
    { companyName: co.name, domain: co.domain, contactRole: contact.role, signalLabel: sig.label, emailStatus: contact.emailStatus, signature: s?.signature, postalAddress: s?.postalAddress, optOutLine: s?.optOutLine },
  );
  if (draft.subject) {
    await db.insert(drafts).values({ opportunityId: opp.id, stepIndex: 0, subject: draft.subject, body: draft.body }).onConflictDoNothing();
    await bumpUsage(ws.id, 'aiDrafts');
  }
  log('enrich', 'done', { domain: co.domain, email: contact.emailStatus });
}

/** If the user's own list has fewer fresh matches than today's release needs, add companies hiring for their roles. */
async function topUp(ws: typeof workspaces.$inferSelect, need: number) {
  if (!process.env.THEIRSTACK_API_KEY || !ws.profile?.hiringRoles.length) return;
  const pool = await db.select({ id: opportunities.id }).from(opportunities)
    .where(and(eq(opportunities.workspaceId, ws.id), eq(opportunities.status, 'new'), isNull(opportunities.releasedOn))).limit(need * 2);
  if (pool.length >= need * 2) return;
  try {
    const found = await discoverHiring(ws.profile.hiringRoles, ws.profile.countries, Math.min(100, need * 3));
    for (const f of found) {
      // Added to the watchlist only; the scanner decides whether they qualify.
      await db.insert(companies).values({ workspaceId: ws.id, domain: f.domain, name: f.name, industry: f.industry, size: f.size, country: f.country, source: 'discovery' }).onConflictDoNothing();
    }
    log('release', 'discovered', { ws: ws.id, n: found.length });
  } catch (e) {
    log('release', 'discovery failed', { error: (e as Error).message });
  }
}

/** Find (or re-check) one contact's email. With makeMain, they become the person this company is written to. */
export async function findContactEmail(contactId: string, makeMain = false) {
  const [ct] = await db.select().from(contacts).where(eq(contacts.id, contactId));
  if (!ct) return;
  const [co] = await db.select().from(companies).where(eq(companies.id, ct.companyId));
  if (!co) return;
  const [cache] = await db.select().from(domainMail).where(eq(domainMail.domain, co.domain));
  const { found, learned } = await findEmail(ct.name, co.domain, cache ?? {});
  if (learned.pattern || learned.mx !== undefined) {
    await db.insert(domainMail).values({ domain: co.domain, mx: learned.mx ?? cache?.mx ?? null, catchAll: learned.catchAll ?? cache?.catchAll ?? null, pattern: learned.pattern ?? cache?.pattern ?? null })
      .onConflictDoUpdate({ target: domainMail.domain, set: { mx: learned.mx ?? cache?.mx ?? null, catchAll: learned.catchAll ?? cache?.catchAll ?? null, pattern: learned.pattern ?? cache?.pattern ?? null, checkedAt: new Date() } });
  }
  await db.update(contacts).set({ email: found.email, emailStatus: found.status, source: found.source }).where(eq(contacts.id, ct.id));
  if (makeMain) {
    const [opp] = await db.select().from(opportunities).where(and(eq(opportunities.workspaceId, ct.workspaceId), eq(opportunities.companyId, ct.companyId)));
    if (opp && ['new', 'saved'].includes(opp.status)) {
      await db.update(opportunities).set({ contactId: ct.id }).where(eq(opportunities.id, opp.id));
      await db.delete(drafts).where(and(eq(drafts.opportunityId, opp.id), eq(drafts.stepIndex, 0)));
      await enrichOpportunity(opp.id); // writes a new first draft for this person
    }
  }
  log('enrich', 'email lookup', { contact: ct.name, status: found.status });
}

/** Find & enrich: scan a company the user typed in, then find the person and write a draft — outside the daily list. */
export async function lookupCompany(companyId: string, scan: (id: string) => Promise<unknown>) {
  await scan(companyId);
  const [co] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!co) return;
  let [opp] = await db.select().from(opportunities).where(and(eq(opportunities.workspaceId, co.workspaceId), eq(opportunities.companyId, co.id)));
  if (!opp) [opp] = await db.insert(opportunities).values({ workspaceId: co.workspaceId, companyId: co.id, promotedBy: 'manual' }).returning();
  else if (!opp.promotedBy) await db.update(opportunities).set({ promotedBy: 'manual' }).where(eq(opportunities.id, opp.id));
  await enrichOpportunity(opp.id);
}
