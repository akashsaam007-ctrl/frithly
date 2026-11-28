import { companies, contacts, db, deals, eq, messages, opportunities, signals, tasks } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';

const csv = (rows: unknown[][]) => rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { ws } = await requireWorkspace();
  const kind = (await params).kind;
  if (kind === 'companies') {
    const rows = await db.select({ c: companies, o: opportunities, ct: contacts }).from(companies)
      .leftJoin(opportunities, eq(opportunities.companyId, companies.id)).leftJoin(contacts, eq(contacts.id, opportunities.contactId)).where(eq(companies.workspaceId, ws.id));
    const body = csv([['Company', 'Website', 'Industry', 'Size', 'Country', 'Fit', 'Why now', 'Status', 'Contact', 'Role', 'Email', 'Email status'],
      ...rows.map(({ c, o, ct }) => [c.name, c.domain, c.industry, c.size, c.country, o?.score ?? '', o?.combo ?? '', o?.status ?? 'watching', ct?.name, ct?.role, ct?.email, ct?.emailStatus])]);
    return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="frithly-companies.csv"' } });
  }
  if (kind === 'people') {
    const rows = await db.select({ p: contacts, c: companies.name }).from(contacts).innerJoin(companies, eq(companies.id, contacts.companyId)).where(eq(contacts.workspaceId, ws.id));
    const body = csv([['Name', 'Role', 'Company', 'Email', 'Email status', 'LinkedIn'], ...rows.map(({ p, c }) => [p.name, p.role, c, p.email, p.emailStatus, p.linkedinUrl])]);
    return new Response(body, { headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': 'attachment; filename="frithly-people.csv"' } });
  }
  if (kind === 'all') {
    const [cos, opps, cts, sigs, msgs, dls, tks] = await Promise.all([
      db.select().from(companies).where(eq(companies.workspaceId, ws.id)), db.select().from(opportunities).where(eq(opportunities.workspaceId, ws.id)),
      db.select().from(contacts).where(eq(contacts.workspaceId, ws.id)), db.select().from(signals).where(eq(signals.workspaceId, ws.id)),
      db.select().from(messages).where(eq(messages.workspaceId, ws.id)), db.select().from(deals).where(eq(deals.workspaceId, ws.id)), db.select().from(tasks).where(eq(tasks.workspaceId, ws.id)),
    ]);
    return new Response(JSON.stringify({ workspace: { name: ws.name, profile: ws.profile, sending: ws.sending }, companies: cos, opportunities: opps, contacts: cts, signals: sigs, messages: msgs, deals: dls, tasks: tks }, null, 2), { headers: { 'content-type': 'application/json', 'content-disposition': 'attachment; filename="frithly-workspace.json"' } });
  }
  return new Response('Not found', { status: 404 });
}
