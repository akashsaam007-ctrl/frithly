import { companies, contacts, db, desc, eq, opportunities } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { PeopleView } from './view';

export default async function People() {
  const { ws } = await requireWorkspace();
  const rows = await db.select({ p: contacts, c: companies, o: opportunities.contactId }).from(contacts)
    .innerJoin(companies, eq(companies.id, contacts.companyId))
    .leftJoin(opportunities, eq(opportunities.companyId, companies.id))
    .where(eq(contacts.workspaceId, ws.id)).orderBy(desc(contacts.createdAt)).limit(2000);
  return <PeopleView people={rows.map(({ p, c, o }) => ({ id: p.id, name: p.name, role: p.role, email: p.email, status: p.emailStatus, linkedin: p.linkedinUrl, company: c.name, companyId: c.id, main: o === p.id }))} />;
}
