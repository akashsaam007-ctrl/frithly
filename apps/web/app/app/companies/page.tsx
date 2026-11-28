import { companies, count, db, desc, eq, notExistsOpp, signals } from '@/lib/companies-q';
import { requireWorkspace } from '@/lib/auth';
import { loadAccounts } from '@/lib/accounts';
import { CompaniesView } from './view';

export default async function Companies({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const { ws } = await requireWorkspace();
  const sp = await searchParams;
  const accounts = await loadAccounts(ws, undefined, 500);
  // Watched companies with no qualifying signals yet.
  const watching = await db.select({ c: companies, n: count(signals.id) }).from(companies)
    .leftJoin(signals, eq(signals.companyId, companies.id))
    .where(notExistsOpp(ws.id)).groupBy(companies.id).orderBy(desc(companies.createdAt)).limit(1000);
  return <CompaniesView accounts={accounts} watching={watching.map(({ c, n }) => ({ id: c.id, name: c.name, domain: c.domain, industry: c.industry, size: c.size, country: c.country, signals: n, scanned: c.lastScannedAt?.toISOString() ?? null, source: c.source }))} open={sp.open ?? null} />;
}
