import { asc, companies, db, eq, opportunities, tasks } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { TasksView } from './view';

export default async function Tasks() {
  const { ws } = await requireWorkspace();
  const rows = await db.select({ t: tasks, c: companies }).from(tasks)
    .leftJoin(opportunities, eq(opportunities.id, tasks.opportunityId)).leftJoin(companies, eq(companies.id, opportunities.companyId))
    .where(eq(tasks.workspaceId, ws.id)).orderBy(asc(tasks.dueAt)).limit(500);
  const cos = await db.select({ id: companies.id, name: companies.name }).from(companies).where(eq(companies.workspaceId, ws.id)).orderBy(companies.name);
  return <TasksView tasks={rows.map(({ t, c }) => ({ id: t.id, title: t.title, type: t.type, note: t.note, due: t.dueAt.toISOString(), done: !!t.doneAt, company: c?.name ?? null, oppId: t.opportunityId }))} companies={cos} />;
}
