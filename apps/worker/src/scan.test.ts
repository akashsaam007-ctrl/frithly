/**
 * Signal engine against a real Postgres with the web stubbed out:
 * collectors → delta snapshots → triage → scoring gate → opportunity.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const DB = process.env.TEST_DATABASE_URL;
const d = DB ? describe : describe.skip;

const dnsTxt: string[][] = [];
vi.mock('node:dns', async (orig) => {
  const real = await orig<typeof import('node:dns')>();
  return { ...real, promises: { ...real.promises, resolveTxt: async () => dnsTxt, resolveMx: async () => [{ exchange: 'acme-test.mail.protection.outlook.com', priority: 0 }] } };
});
const triage = vi.fn(async (_c: unknown, items: { id: string }[]) => ({ verdicts: items.map((i) => ({ id: i.id, verified: true, reason: 'ok' })), staffingAgency: false }));
vi.mock('@frithly/engine', async (orig) => ({ ...(await orig<object>()), triageSignals: (c: unknown, i: { id: string }[]) => triage(c, i) }));

const day = 86_400_000;
const iso = (n: number) => new Date(Date.now() - n * day).toISOString();
const rss = (items: { title: string; at: string }[]) =>
  `<?xml version="1.0"?><rss><channel>${items.map((i, k) => `<item><title>${i.title} - Wire</title><link>https://news.test/${k}</link><pubDate>${new Date(i.at).toUTCString()}</pubDate><source>Wire</source></item>`).join('')}</channel></rss>`;

function fakeFetch(url: string): Response {
  const u = new URL(url);
  if (u.pathname === '/robots.txt') return new Response('', { status: 404 });
  if (u.host === 'boards-api.greenhouse.io') return Response.json({ jobs: [
    { id: 11, title: 'Founding RevOps Lead', location: { name: 'Bengaluru' }, updated_at: iso(3), first_published: iso(3), absolute_url: 'https://acme.test/jobs/11', content: '&lt;p&gt;You will own our CRM. We are migrating from HubSpot this quarter.&lt;/p&gt;' },
  ] });
  if (u.host === 'acme.test' && u.pathname === '/') return new Response('<html><head><title>Acme | Billing</title><meta name="viewport" content="x"><meta name="description" content="x"></head><body>Acme billing</body></html>');
  if (u.host === 'crt.sh') return Response.json([{ name_value: 'sso.acme.test', not_before: iso(5).slice(0, 19) }, { name_value: 'cdn.acme.test', not_before: iso(200).slice(0, 19) }]);
  if (u.host === 'news.google.com') return new Response(u.search.includes('appoints') ? rss([{ title: 'Acme appoints Jane Doe as VP Sales', at: iso(2) }]) : rss([]));
  if (u.host === 'hn.algolia.com') return Response.json({ hits: [] });
  return new Response('not found', { status: 404 });
}

d('signal engine', () => {
  let companyId = '';
  beforeAll(async () => {
    process.env.DATABASE_URL = DB;
    process.env.ANTHROPIC_API_KEY = 'test';
    process.env.SCANNER_MIN_GAP_MS = '0';
    vi.stubGlobal('fetch', vi.fn(async (input: string | URL) => fakeFetch(String(input))));
    const { db, sql, users, workspaces, companies } = await import('@frithly/db');
    await db.execute(sql`truncate users, workspaces, suppressions, domain_mail cascade`);
    const [u] = await db.insert(users).values({ email: 'a@b.test' }).returning();
    const [ws] = await db.insert(workspaces).values({ name: 'B', ownerId: u.id, plan: 'pro', onboardedAt: new Date(),
      profile: { offer: 'x', proofPoint: '', industries: [], sizes: [], countries: [], keywords: [], titles: ['VP Sales'], hiringRoles: ['RevOps'], competitors: ['HubSpot'] } }).returning();
    const [co] = await db.insert(companies).values({ workspaceId: ws.id, domain: 'acme.test', name: 'Acme', ats: { provider: 'greenhouse', slug: 'acme' } }).returning();
    companyId = co.id;
  });
  afterAll(async () => { const { client } = await import('@frithly/db'); await client().end(); vi.unstubAllGlobals(); });

  it('collects, triages and promotes a stacked account', async () => {
    const { scanCompany } = await import('./jobs/scan');
    await scanCompany(companyId);
    const { db, signals, opportunities, eq } = await import('@frithly/db');
    const s = await db.select().from(signals).where(eq(signals.companyId, companyId));
    expect(s.map((x) => x.subtype).sort()).toEqual(['COMPETITOR_IN_JOB', 'FIRST_IN_FUNCTION', 'MIGRATION', 'NEW_LEADER', 'ROLE_MATCH', 'SSO_SUBDOMAIN']);
    expect(s.every((x) => x.verified === true)).toBe(true);
    expect(s.find((x) => x.subtype === 'COMPETITOR_IN_JOB')!.evidence).toContain('migrating from HubSpot');
    const [o] = await db.select().from(opportunities).where(eq(opportunities.companyId, companyId));
    // 45 competitor + 40 leader + 35 first-in-function (best hiring subtypes each) + 35 migration + 30 sso + 10 role
    expect(o.score).toBe(195);
    expect(o.activeSignals).toBe(6);
    expect(o.combo).toBe('New sales leader + sales team buildout');
    expect(o.promotedBy).toBe('combo');
  });

  it('spends nothing on a second run when nothing changed', async () => {
    const before = triage.mock.calls.length;
    const { scanCompany } = await import('./jobs/scan');
    const { db, companies, eq } = await import('@frithly/db');
    await db.update(companies).set({ lastScannedAt: null }).where(eq(companies.id, companyId));
    await scanCompany(companyId);
    expect(triage.mock.calls.length).toBe(before);
  });

  it('turns a DNS change into a signal (first sight is baseline only)', async () => {
    dnsTxt.push(['hubspot-developer-verification=abc']);
    const { scanCompany } = await import('./jobs/scan');
    await scanCompany(companyId);
    const { db, signals, eq, and } = await import('@frithly/db');
    const s = await db.select().from(signals).where(and(eq(signals.companyId, companyId), eq(signals.subtype, 'TECH_ADOPTION')));
    expect(s.map((x) => x.evidence)).toEqual(['Added HubSpot domain verification']);
  });

  it('drops an unreleased account from the pool on layoffs', async () => {
    const { db, signals, opportunities, eq } = await import('@frithly/db');
    await db.insert(signals).values({ workspaceId: (await db.select().from(opportunities))[0].workspaceId, companyId, type: 'disqualifier', label: 'Layoffs', fingerprint: 'LAYOFF:t', category: 'DISQUALIFIER', subtype: 'LAYOFF', evidence: 'Acme lays off 20%', eventDate: new Date(), baseWeight: 0, verified: true });
    const { evaluateCompany } = await import('./jobs/scan');
    const e = await evaluateCompany(companyId);
    expect(e?.suppressed).toBe('Layoffs or restructuring');
    expect(await db.select().from(opportunities).where(eq(opportunities.companyId, companyId))).toHaveLength(0);
  });
});
