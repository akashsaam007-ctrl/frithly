import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { and, asc, db, enrollments, eq, isNull, lte, tasks } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';

async function done(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  const id = String(fd.get('id'));
  const [t] = await db.update(tasks).set({ doneAt: new Date() }).where(and(eq(tasks.id, id), eq(tasks.workspaceId, ws.id))).returning();
  // Finishing a follow-up review lets the sequence carry on.
  if (t?.type === 'review' && t.enrollmentId) await db.update(enrollments).set({ status: 'active', stoppedReason: null, nextRunAt: new Date() }).where(eq(enrollments.id, t.enrollmentId));
  revalidatePath('/app/tasks');
}

export default async function Tasks() {
  const { ws } = await requireWorkspace();
  const rows = await db.select().from(tasks).where(and(eq(tasks.workspaceId, ws.id), isNull(tasks.doneAt), lte(tasks.dueAt, new Date(Date.now() + 86_400_000)))).orderBy(asc(tasks.dueAt)).limit(200);
  const icon: Record<string, string> = { linkedin_invite: 'LinkedIn invite', linkedin_message: 'LinkedIn message', call_task: 'Call', review: 'Review', custom: 'Task' };
  return (
    <>
      <div className="head"><div><h1>Tasks</h1><p className="mut">LinkedIn steps and calls from your sequences. We prepare them; you do them yourself, so your LinkedIn account stays safe.</p></div></div>
      <div className="list">
        {rows.map((t) => (
          <div key={t.id} className="li" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
            <span className="pill v">{icon[t.type] ?? t.type}</span>
            <div><strong className="sm">{t.title}</strong>{t.note && <div className="mut" style={{ whiteSpace: 'pre-wrap' }}>{t.note.split('\n').map((l, i) => /^https?:\/\//.test(l) ? <a key={i} href={l} target="_blank" rel="noreferrer">{l}{'\n'}</a> : l + '\n')}</div>}</div>
            <div className="row">
              {t.opportunityId && <Link className="btn gh s" href={`/app/o/${t.opportunityId}`}>Open</Link>}
              <form action={done}><input type="hidden" name="id" value={t.id} /><button className="btn s">Done</button></form>
            </div>
          </div>
        ))}
        {!rows.length && <div className="li mut" style={{ gridTemplateColumns: '1fr' }}>Nothing due. Nice.</div>}
      </div>
    </>
  );
}
