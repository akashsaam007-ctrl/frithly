import { and, db, deals, enrollments, eq, gte, inArray, messages, opportunities, signals } from '@/lib/db';
import { SUBTYPES, type Subtype } from '@frithly/core';
import { requireWorkspace } from '@/lib/auth';
import { AnalyticsView } from './view';

const NOT_REPLY = ['bounce', 'out_of_office'];

export default async function Analytics({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { ws } = await requireWorkspace();
  const days = [7, 30, 90].includes(Number((await searchParams).p)) ? Number((await searchParams).p) : 30;
  const since = new Date(Date.now() - days * 86_400_000);
  const weeksSince = new Date(Date.now() - 8 * 7 * 86_400_000);
  const [enr, msgs, dls] = await Promise.all([
    db.select({ e: enrollments, s: signals.subtype }).from(enrollments).innerJoin(opportunities, eq(opportunities.id, enrollments.opportunityId)).leftJoin(signals, eq(signals.id, opportunities.signalId))
      .where(and(eq(enrollments.workspaceId, ws.id), gte(enrollments.createdAt, new Date(Date.now() - 90 * 86_400_000)))),
    db.select({ d: messages.direction, c: messages.classification, at: messages.at, e: messages.enrollmentId }).from(messages).where(and(eq(messages.workspaceId, ws.id), gte(messages.at, weeksSince < since ? weeksSince : since))),
    db.select().from(deals).where(eq(deals.workspaceId, ws.id)),
  ]);
  const inP = (d: Date) => d >= since;
  const started = enr.filter((x) => x.e.startedAt && inP(x.e.startedAt));
  const sent = msgs.filter((m) => m.d === 'out' && inP(m.at));
  const replies = msgs.filter((m) => m.d === 'in' && !NOT_REPLY.includes(m.c ?? '') && inP(m.at));
  const repliedEnr = new Set(msgs.filter((m) => m.d === 'in' && !NOT_REPLY.includes(m.c ?? '')).map((m) => m.e));
  const meetings = dls.filter((d) => ['Meeting', 'Proposal', 'Won'].includes(d.stage) && inP(d.updatedAt));
  const won = dls.filter((d) => d.stage === 'Won' && inP(d.updatedAt));
  // Weekly buckets, oldest first
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = new Date(Date.now() - (7 - i) * 7 * 86_400_000), start = new Date(end.getTime() - 7 * 86_400_000);
    const w = (m: (typeof msgs)[number]) => m.at > start && m.at <= end;
    return { label: start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), sent: msgs.filter((m) => m.d === 'out' && w(m)).length, replies: msgs.filter((m) => m.d === 'in' && !NOT_REPLY.includes(m.c ?? '') && w(m)).length };
  });
  // Reply rate by the signal that put the company on the list (last 90 days)
  const by = new Map<string, { n: number; r: number }>();
  for (const x of enr.filter((y) => y.e.startedAt)) { const k = x.s ?? 'manual'; const v = by.get(k) ?? { n: 0, r: 0 }; v.n++; if (repliedEnr.has(x.e.id)) v.r++; by.set(k, v); }
  const bySignal = [...by.entries()].map(([k, v]) => ({ label: k === 'manual' ? 'Looked up by you' : SUBTYPES[k as Subtype]?.label ?? k, n: v.n, rate: v.n ? (v.r / v.n) * 100 : 0 })).sort((a, b) => b.rate - a.rate).slice(0, 8);
  const sentP = new Set(sent.map((m) => m.e));
  return <AnalyticsView days={days} totals={{
    contacted: started.length, sent: sent.length, replies: replies.length,
    replyRate: sentP.size ? (replies.length / sentP.size) * 100 : 0, meetings: meetings.length, won: won.length, wonValue: won.reduce((a, d) => a + d.valueUsd, 0),
  }} weeks={weeks} bySignal={bySignal} />;
}
