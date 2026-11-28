import { and, companies, contacts, db, desc, domainMail, drafts, eq, inArray, isNotNull, isNull, monthKey, opportunities, signals, usage, users, workspaces } from '@frithly/db';
import { PLANS, TRIAL_RELEASE_DAYS, planLimits, signalScore, type PlanKey } from '@frithly/core';
import { discoverHiring, findEmail, findPeople, pickContact, scanSite, summarizeSite, writeEmail } from '@frithly/engine';
import { bumpUsage, log, todayIn } from '../lib';

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

    await topUp(ws, n);
    const pick = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(and(eq(opportunities.workspaceId, ws.id), eq(opportunities.status, 'new'), isNull(opportunities.releasedOn)))
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

  let contact = opp.contactId ? (await db.select().from(contacts).where(eq(contacts.id, opp.contactId)))[0] : undefined;
  if (!contact) {
    const people = await findPeople(co.domain);
    const p = pickContact(people, ws.profile?.titles ?? []);
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
      signal: { type: sig.type, label: sig.label, detail: sig.detail },
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
      const [co] = await db.insert(companies).values({ workspaceId: ws.id, domain: f.domain, name: f.name, industry: f.industry, size: f.size, country: f.country, source: 'discovery' })
        .onConflictDoNothing().returning();
      if (!co) continue; // already watched; the scanner handles it
      const [sig] = await db.insert(signals).values({ workspaceId: ws.id, companyId: co.id, type: 'hiring', label: `Hiring a ${f.jobTitle}`, url: f.jobUrl, fingerprint: `ts:${f.jobId}` })
        .onConflictDoNothing().returning();
      if (sig) await db.insert(opportunities).values({ workspaceId: ws.id, companyId: co.id, signalId: sig.id, score: signalScore('hiring', (Date.now() - f.postedAt.getTime()) / 86_400_000, 0.6) }).onConflictDoNothing();
    }
    log('release', 'discovered', { ws: ws.id, n: found.length });
  } catch (e) {
    log('release', 'discovery failed', { error: (e as Error).message });
  }
}
