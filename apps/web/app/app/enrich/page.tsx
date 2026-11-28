import { companies, contacts, db, desc, eq, lookups, opportunities, signals } from '@/lib/db';
import { SUBTYPES, type Subtype } from '@frithly/core';
import { requireWorkspace } from '@/lib/auth';
import { creditsLeft, resetDay } from '@/lib/ctx';
import { EnrichView } from './view';

export default async function Enrich() {
  const { ws } = await requireWorkspace();
  const cr = await creditsLeft(ws);
  const rows = await db.select({ l: lookups, c: companies, o: opportunities, ct: contacts }).from(lookups)
    .innerJoin(companies, eq(companies.id, lookups.companyId))
    .leftJoin(opportunities, eq(opportunities.companyId, companies.id))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId))
    .where(eq(lookups.workspaceId, ws.id)).orderBy(desc(lookups.at)).limit(100);
  const sigs = rows.length ? await db.select().from(signals).where(eq(signals.workspaceId, ws.id)) : [];
  return <EnrichView credits={cr.left} resets={resetDay()} rows={rows.map(({ l, c, o, ct }) => ({
    id: l.id, at: l.at.toISOString(), company: c.name, domain: c.domain, companyId: c.id, oppId: o?.id ?? null, scanned: !!c.lastScannedAt,
    contact: ct ? { name: ct.name, role: ct.role, email: ct.email, status: ct.emailStatus } : null,
    signals: sigs.filter((s) => s.companyId === c.id && s.verified && s.category !== 'DISQUALIFIER').slice(0, 3).map((s) => SUBTYPES[s.subtype as Subtype]?.label ?? s.label),
  }))} />;
}
