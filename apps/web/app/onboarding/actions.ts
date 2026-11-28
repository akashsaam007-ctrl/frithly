'use server';
import { companies, db, eq, members, sequences, users, workspaces } from '@/lib/db';
import { PLANS, SEQ_PRESETS, SUBTYPES, type Subtype } from '@frithly/core';
import { scanSite, summarizeSite } from '@frithly/engine';
import { requireUser } from '@/lib/auth';
import { importCompanies, normDomain } from '@/lib/companies';
import { enqueue } from '@/lib/queue';

/** Read the user's own site so "what you sell" starts filled in. */
export async function readSite(raw: string): Promise<{ name?: string; sells?: string }> {
  await requireUser();
  const d = normDomain(raw);
  if (!d) return {};
  const s = await scanSite(d).catch(() => null);
  if (!s?.ok) return {};
  const sells = process.env.ANTHROPIC_API_KEY ? await summarizeSite(d, s.text).catch(() => '') : '';
  return { name: s.name, sells };
}

export interface OnboardInput {
  site: string; name: string; company: string; sells: string; proof: string;
  industries: string[]; sizes: string[]; countries: string[]; titles: string; roles: string;
  watch: string[]; competitors: string; companies: string;
  address: string; optout: string; tz: string;
}
const list = (v: string) => v.split(',').map((x) => x.trim()).filter(Boolean);

export async function finishOnboarding(f: OnboardInput): Promise<{ err?: string }> {
  const { user, ws } = await requireUser();
  if (!f.sells.trim()) return { err: 'Tell us what you sell.' };
  if (!f.address.trim()) return { err: 'Add your business postal address. Anti-spam law needs it in every email.' };
  const site = normDomain(f.site);
  const company = f.company.trim() || (site ? site.split('.')[0].replace(/\b\w/g, (m) => m.toUpperCase()) : 'My company');
  const profile = {
    offer: f.sells.trim(), proofPoint: f.proof.trim(), industries: f.industries, sizes: f.sizes, countries: f.countries,
    titles: list(f.titles), hiringRoles: list(f.roles), competitors: list(f.competitors), keywords: [],
  };
  const sending = { signature: `${f.name.trim()}\n${company}`, postalAddress: f.address.trim(), optOutLine: f.optout.trim() || 'Not relevant? Just reply “no” and I won’t email you again.', tz: f.tz || 'UTC', days: [1, 2, 3, 4, 5], startHour: 9, endHour: 17 };
  // Watching is chosen by kind of signal; everything in an unchosen kind is switched off.
  const unwatched = (Object.keys(SUBTYPES) as Subtype[]).filter((k) => SUBTYPES[k].category !== 'DISQUALIFIER' && !f.watch.includes(SUBTYPES[k].category));
  await db.update(users).set({ name: f.name.trim() || null }).where(eq(users.id, user.id));
  let wsId = ws?.id;
  if (!wsId) {
    const [n] = await db.insert(workspaces).values({ name: company, website: site, ownerId: user.id, plan: 'trial', trialEndsAt: new Date(Date.now() + (PLANS.trial.trialDays ?? 14) * 86_400_000), profile, sending, prefs: { approval: 'every', unwatched } }).returning();
    wsId = n.id;
    await db.insert(members).values({ workspaceId: wsId, userId: user.id, role: 'owner' });
    await db.insert(sequences).values({ workspaceId: wsId, name: SEQ_PRESETS.mix.name, steps: SEQ_PRESETS.mix.steps, isDefault: true });
  } else {
    await db.update(workspaces).set({ name: company, website: site, profile, sending, prefs: { ...ws!.prefs, unwatched } }).where(eq(workspaces.id, wsId));
  }
  if (f.companies.trim()) await importCompanies(wsId, f.companies, 'onboarding');
  for (const c of await db.select({ id: companies.id }).from(companies).where(eq(companies.workspaceId, wsId))) await enqueue('scan-company', { companyId: c.id }, c.id).catch(() => null);
  await db.update(workspaces).set({ onboardedAt: new Date() }).where(eq(workspaces.id, wsId));
  return {};
}
