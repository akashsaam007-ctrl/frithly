import { and, count, db, eq, gte, inArray, isNotNull, mailboxes, messages, opportunities, or, deals } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { loadAccounts } from '@/lib/accounts';
import { startsPerDay, todayIn, tzOf } from '@/lib/ctx';
import { TodayView } from './today-view';

export default async function Today({ searchParams }: { searchParams: Promise<{ top5?: string; welcome?: string }> }) {
  const { ws } = await requireWorkspace();
  const sp = await searchParams;
  const today = todayIn(tzOf(ws));
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
  // Today: everything released today, plus anything from the last week still waiting for you.
  const accounts = await loadAccounts(ws, and(isNotNull(opportunities.releasedOn), or(eq(opportunities.releasedOn, today), and(gte(opportunities.releasedOn, weekAgo), inArray(opportunities.status, ['new', 'saved'])))), 120);
  const [mbs, [sent], [reps], [meet]] = await Promise.all([
    db.select().from(mailboxes).where(eq(mailboxes.workspaceId, ws.id)),
    db.select({ n: count() }).from(messages).where(and(eq(messages.workspaceId, ws.id), eq(messages.direction, 'out'))),
    db.select({ n: count() }).from(messages).where(and(eq(messages.workspaceId, ws.id), eq(messages.direction, 'in'))),
    db.select({ n: count() }).from(deals).where(and(eq(deals.workspaceId, ws.id), inArray(deals.stage, ['Meeting', 'Proposal', 'Won']))),
  ]);
  const steps: [string, boolean][] = [['Mailbox connected', mbs.length > 0], ['First email sent', sent.n > 0], ['First reply', reps.n > 0], ['First meeting', meet.n > 0]];
  return <TodayView accounts={accounts} steps={steps} mailboxes={mbs.length} perDay={startsPerDay(mbs)} openTop5={!!sp.top5} welcome={!!sp.welcome} />;
}
