import 'server-only';
import { cache } from 'react';
import {
  and, companies, count, credits, db, deals, eq, gte, inArray, isNotNull, isNull, lte, mailboxes, messages, monthKey, opportunities, sql, tasks, usage,
} from '@/lib/db';
import { PLANS, dailyCap, planLimits, type PlanKey } from '@frithly/core';
import { requireWorkspace, type WS } from '@/lib/auth';

export const planKey = (ws: WS): PlanKey => (ws.plan === 'expired' ? 'trial' : ws.plan) as PlanKey;
export const todayIn = (tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
export const tzOf = (ws: WS) => ws.sending?.tz || 'UTC';
const monthStart = () => { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)); };
export const resetDay = () => { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }); };

/** Lookup credits left this month. */
export async function creditsLeft(ws: WS) {
  const lim = planLimits(planKey(ws), ws.addons);
  const [r] = await db.select({ s: sql<number>`coalesce(sum(${credits.delta}),0)::int` }).from(credits).where(and(eq(credits.workspaceId, ws.id), gte(credits.at, monthStart())));
  return { left: lim.lookupCredits + (r?.s ?? 0), total: lim.lookupCredits };
}

/** How many new companies the connected mailboxes can start each day (5 touches per company). */
export function startsPerDay(mbs: (typeof mailboxes.$inferSelect)[]) {
  const total = mbs.filter((m) => m.status === 'active').reduce((a, m) => a + dailyCap(Math.floor((Date.now() - m.warmupStartedAt.getTime()) / 86_400_000) + 1, m.capMax), 0);
  return Math.floor(total / 5);
}

export interface Note { t: string; w: Date; href: string }

/** Everything the sidebar, top bar and command menu need. Cached per request. */
export const shellCtx = cache(async () => {
  const { user, ws } = await requireWorkspace();
  const lim = planLimits(planKey(ws), ws.addons);
  const today = todayIn(tzOf(ws));
  const [[u], cr, [todayNew], [unread], [due], mbs, staleDeals, reviews, coNames] = await Promise.all([
    db.select().from(usage).where(and(eq(usage.workspaceId, ws.id), eq(usage.month, monthKey()))),
    creditsLeft(ws),
    db.select({ n: count() }).from(opportunities).where(and(eq(opportunities.workspaceId, ws.id), isNotNull(opportunities.releasedOn), inArray(opportunities.status, ['new', 'saved']))),
    db.select({ n: count() }).from(messages).where(and(eq(messages.workspaceId, ws.id), eq(messages.direction, 'in'), isNull(messages.readAt))),
    db.select({ n: count() }).from(tasks).where(and(eq(tasks.workspaceId, ws.id), isNull(tasks.doneAt), lte(tasks.dueAt, new Date()))),
    db.select().from(mailboxes).where(eq(mailboxes.workspaceId, ws.id)),
    db.select({ d: deals, c: companies.name }).from(deals).innerJoin(companies, eq(companies.id, deals.companyId)).where(and(eq(deals.workspaceId, ws.id), lte(deals.updatedAt, new Date(Date.now() - 14 * 86_400_000)), inArray(deals.stage, ['Replied', 'Meeting', 'Proposal']))),
    db.select().from(tasks).where(and(eq(tasks.workspaceId, ws.id), eq(tasks.type, 'review'), isNull(tasks.doneAt))),
    db.select({ id: companies.id, name: companies.name, domain: companies.domain }).from(companies).where(eq(companies.workspaceId, ws.id)).limit(2000),
  ]);
  const recentReplies = await db.select({ m: messages, c: companies.name }).from(messages)
    .innerJoin(opportunities, sql`${opportunities.id} = (select opportunity_id from enrollments where enrollments.id = ${messages.enrollmentId})`)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .where(and(eq(messages.workspaceId, ws.id), eq(messages.direction, 'in'), isNull(messages.readAt))).limit(5);
  const cleared = ws.prefs?.notesClearedAt ? new Date(ws.prefs.notesClearedAt) : new Date(0);
  const notes: Note[] = [
    ...recentReplies.map((r) => ({ t: `${r.c} replied: ${r.m.classification?.replace('_', ' ') ?? 'reply'}`, w: r.m.at, href: '/app/inbox' })),
    ...mbs.filter((m) => m.lastError).map((m) => ({ t: `${m.email} has a connection problem`, w: m.lastPolledAt ?? m.createdAt, href: '/app/outreach' })),
    ...staleDeals.map((d) => ({ t: `${d.c} deal has had no activity for 14+ days`, w: d.d.updatedAt, href: '/app/deals' })),
    ...reviews.map((t) => ({ t: t.title, w: t.createdAt, href: '/app/tasks' })),
  ].filter((n) => n.w > cleared).sort((a, b) => b.w.getTime() - a.w.getTime()).slice(0, 12);
  const trialLeft = ws.plan === 'trial' && ws.trialEndsAt ? Math.max(0, Math.ceil((ws.trialEndsAt.getTime() - Date.now()) / 86_400_000)) : null;
  return {
    user: { name: user.name ?? user.email.split('@')[0], email: user.email },
    ws: { id: ws.id, name: ws.name, plan: ws.plan, planName: ws.plan === 'expired' ? 'Trial ended' : PLANS[planKey(ws)].name, seats: lim.seats, trialLeft },
    meter: { used: u?.opportunities ?? 0, limit: lim.month, credits: cr.left, creditsTotal: cr.total, resets: resetDay() },
    counts: { today: todayNew.n, inbox: unread.n, tasks: due.n },
    notes: notes.map((n) => ({ ...n, w: n.w.toISOString() })),
    companies: coNames,
    today,
    mailboxes: mbs.length,
  };
});
export type ShellCtx = Awaited<ReturnType<typeof shellCtx>>;
