import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { and, companies, db, desc, enrollments, eq, messages, opportunities } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { ago } from '../ui';

const LABEL: Record<string, [string, string]> = {
  interested: ['g', 'Interested'], meeting: ['g', 'Wants a meeting'], referral: ['v', 'Referred you'],
  not_interested: ['', 'Not interested'], optout: ['r', 'Opted out'], out_of_office: ['a', 'Out of office'], bounce: ['r', 'Bounced'], other: ['', 'Reply'],
};

async function mark(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  const st = String(fd.get('status')) as 'meeting' | 'won' | 'lost' | 'replied';
  if (!['meeting', 'won', 'lost', 'replied'].includes(st)) return;
  await db.update(opportunities).set({ status: st }).where(and(eq(opportunities.id, String(fd.get('opp'))), eq(opportunities.workspaceId, ws.id)));
  revalidatePath('/app/inbox');
}

export default async function Inbox() {
  const { ws } = await requireWorkspace();
  const rows = await db
    .select({ m: messages, o: opportunities, c: companies })
    .from(messages)
    .innerJoin(enrollments, eq(enrollments.id, messages.enrollmentId))
    .innerJoin(opportunities, eq(opportunities.id, enrollments.opportunityId))
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .where(and(eq(messages.workspaceId, ws.id), eq(messages.direction, 'in')))
    .orderBy(desc(messages.at))
    .limit(100);
  return (
    <>
      <div className="head"><div><h1>Inbox</h1><p className="mut">Replies to your outreach. Any reply stops the follow-ups; a “no” or opt-out also adds them to do-not-contact.</p></div></div>
      <div className="stack">
        {rows.map(({ m, o, c }) => {
          const [cls, lab] = LABEL[m.classification ?? 'other'] ?? LABEL.other;
          return (
            <div key={m.id} className="card stack">
              <div className="row"><strong>{c.name}</strong><span className="mut">{m.fromAddr}</span><span className={`pill ${cls}`}>{lab}</span><span className="sp" /><span className="mut">{ago(m.at)}</span></div>
              <div className="sm"><strong>{m.subject}</strong></div>
              <p className="sm" style={{ whiteSpace: 'pre-wrap' }}>{m.body.split(/\nOn .+wrote:/)[0].slice(0, 1200)}</p>
              <form action={mark} className="row">
                <input type="hidden" name="opp" value={o.id} />
                <span className="mut">Stage: {o.status}</span><span className="sp" />
                <button className="btn s" name="status" value="meeting">Meeting booked</button>
                <button className="btn s" name="status" value="won">Won</button>
                <button className="btn gh s" name="status" value="lost">Lost</button>
                <Link className="btn gh s" href={`/app/o/${o.id}`}>Open</Link>
              </form>
            </div>
          );
        })}
        {!rows.length && <div className="card mut">No replies yet. They show up here within five minutes of landing in your mailbox.</div>}
      </div>
    </>
  );
}
