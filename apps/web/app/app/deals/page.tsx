import { companies, contacts, db, deals, eq, opportunities } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { DealsView } from './view';

export default async function Deals({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const { ws } = await requireWorkspace();
  const sp = await searchParams;
  const rows = await db.select({ d: deals, c: companies, ct: contacts }).from(deals)
    .innerJoin(companies, eq(companies.id, deals.companyId))
    .leftJoin(opportunities, eq(opportunities.id, deals.opportunityId))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId))
    .where(eq(deals.workspaceId, ws.id));
  const cos = await db.select({ id: companies.id, name: companies.name }).from(companies).where(eq(companies.workspaceId, ws.id)).orderBy(companies.name);
  return <DealsView deals={rows.map(({ d, c, ct }) => ({ id: d.id, stage: d.stage, value: d.valueUsd, note: d.note, updated: d.updatedAt.toISOString(), company: c.name, contact: ct ? `${ct.name}${ct.role ? ` · ${ct.role}` : ''}` : '' }))} companies={cos} openNew={!!sp.new} />;
}
