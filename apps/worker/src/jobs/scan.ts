import { and, asc, companies, db, eq, isNull, lt, opportunities, or, signals, workspaces } from '@frithly/db';
import { signalScore, type SignalType } from '@frithly/core';
import { detectAts, fetchJobs, hiringSignal, scanNews, scanSite } from '@frithly/engine';
import { log } from '../lib';

/** Companies not scanned in the last 24 hours, oldest first. */
export async function dueCompanies(limit = 50) {
  const cutoff = new Date(Date.now() - 24 * 3_600_000);
  return db
    .select({ id: companies.id })
    .from(companies)
    .innerJoin(workspaces, eq(workspaces.id, companies.workspaceId))
    .where(and(or(isNull(companies.lastScannedAt), lt(companies.lastScannedAt, cutoff)), or(eq(workspaces.plan, 'trial'), eq(workspaces.plan, 'starter'), eq(workspaces.plan, 'pro'), eq(workspaces.plan, 'agency'))))
    .orderBy(asc(companies.lastScannedAt))
    .limit(limit);
}

interface NewSignal { type: SignalType; label: string; detail?: string; url?: string; fingerprint: string; ageDays: number }

export async function scanCompany(companyId: string) {
  const [co] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!co) return;
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, co.workspaceId));
  const profile = ws?.profile;
  const found: NewSignal[] = [];
  const patch: Partial<typeof companies.$inferInsert> = { lastScannedAt: new Date() };

  // 1. Hiring, from the company's public job board.
  let ats = co.ats;
  if (!ats) {
    ats = await detectAts(co.domain);
    if (ats) patch.ats = ats;
  }
  if (ats) {
    const jobs = await fetchJobs(ats);
    const h = hiringSignal(jobs, profile?.hiringRoles ?? []);
    if (h) {
      const newest = Math.min(...jobs.map((j) => (Date.now() - j.postedAt.getTime()) / 86_400_000));
      found.push({ type: 'hiring', ...h, ageDays: Math.max(0, newest) });
    }
  }

  // 2. Website: changes since last scan, tech stack changes, obvious problems.
  const site = await scanSite(co.domain);
  if (site.ok) {
    if (site.name && co.name === co.domain) patch.name = site.name;
    if (co.siteHash && site.hash && co.siteHash !== site.hash) {
      found.push({ type: 'site', label: 'Changed their website', detail: site.pricingText ? 'Homepage or pricing page changed since last week' : 'Homepage changed since last week', url: `https://${co.domain}`, fingerprint: `site:${site.hash}`, ageDays: 0 });
    }
    const added = site.tech.filter((t) => co.tech.length && !co.tech.includes(t));
    if (added.length) found.push({ type: 'tech', label: `Started using ${added[0]}`, detail: `New on their site: ${added.join(', ')}`, url: `https://${co.domain}`, fingerprint: `tech:${added.sort().join(',')}`, ageDays: 0 });
    if (!co.siteHash && site.problems.length) {
      found.push({ type: 'site', label: site.problems[0], detail: site.problems.join('; '), url: `https://${co.domain}`, fingerprint: `health:${site.problems.join('|')}`, ageDays: 3 });
    }
    patch.siteHash = site.hash;
    patch.tech = site.tech;
  }

  // 3. News: funding rounds and notable announcements.
  for (const n of (await scanNews(patch.name ?? co.name, co.domain)).slice(0, 2)) {
    found.push({ type: n.kind, label: n.title.replace(/\s+-\s+[^-]+$/, ''), detail: n.source ? `Reported by ${n.source}` : undefined, url: n.url, fingerprint: `news:${n.url}`, ageDays: (Date.now() - n.at.getTime()) / 86_400_000 });
  }

  await db.update(companies).set(patch).where(eq(companies.id, co.id));

  const fit = fitScore(co, profile);
  for (const s of found) {
    const [row] = await db
      .insert(signals)
      .values({ workspaceId: co.workspaceId, companyId: co.id, type: s.type, label: s.label.slice(0, 200), detail: s.detail, url: s.url, fingerprint: s.fingerprint })
      .onConflictDoNothing()
      .returning({ id: signals.id });
    if (!row) continue;
    const score = signalScore(s.type, s.ageDays, fit);
    // One opportunity per company; a stronger new signal lifts it, a skipped one is left alone.
    const [opp] = await db.select().from(opportunities).where(and(eq(opportunities.workspaceId, co.workspaceId), eq(opportunities.companyId, co.id)));
    if (!opp) await db.insert(opportunities).values({ workspaceId: co.workspaceId, companyId: co.id, signalId: row.id, score });
    else if (opp.status === 'new' && !opp.releasedOn && score > opp.score) await db.update(opportunities).set({ signalId: row.id, score }).where(eq(opportunities.id, opp.id));
  }
  log('scan', 'company scanned', { domain: co.domain, signals: found.length });
}

function fitScore(co: typeof companies.$inferSelect, p?: (typeof workspaces.$inferSelect)['profile']) {
  if (!p) return 0.5;
  let s = 0, n = 0;
  const m = (want: string[], have?: string | null) => { if (!want?.length) return; n++; if (have && want.some((w) => have.toLowerCase().includes(w.toLowerCase()))) s++; };
  m(p.industries, co.industry);
  m(p.sizes, co.size);
  m(p.countries, co.country);
  return n ? s / n : 0.5;
}
