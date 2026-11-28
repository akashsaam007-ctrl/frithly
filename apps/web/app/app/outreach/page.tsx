import { and, companies, db, enrollments, eq, inArray, mailboxes, opportunities, sequences } from '@/lib/db';
import { SEQ_PRESETS, dailyCap, planLimits } from '@frithly/core';
import { requireWorkspace } from '@/lib/auth';
import { planKey } from '@/lib/ctx';
import { domainHealth } from '@/lib/dns-health';
import { OutreachView } from './view';

export default async function Outreach({ searchParams }: { searchParams: Promise<{ mailbox?: string; saved?: string; e?: string }> }) {
  const { ws } = await requireWorkspace();
  const sp = await searchParams;
  const [seq] = await db.select().from(sequences).where(and(eq(sequences.workspaceId, ws.id), eq(sequences.isDefault, true)));
  const mbs = await db.select().from(mailboxes).where(eq(mailboxes.workspaceId, ws.id));
  const health = await Promise.all(mbs.map((m) => domainHealth(m.email.split('@')[1])));
  const queue = await db.select({ c: companies.name, e: enrollments, mb: mailboxes.email }).from(enrollments)
    .innerJoin(opportunities, eq(opportunities.id, enrollments.opportunityId)).innerJoin(companies, eq(companies.id, opportunities.companyId))
    .leftJoin(mailboxes, eq(mailboxes.id, enrollments.mailboxId))
    .where(and(eq(enrollments.workspaceId, ws.id), inArray(enrollments.status, ['active', 'waiting_mailbox', 'paused']))).orderBy(enrollments.nextRunAt).limit(30);
  const lim = planLimits(planKey(ws), ws.addons);
  const s = ws.sending;
  return <OutreachView
    steps={(seq?.steps ?? SEQ_PRESETS.mix.steps).map((x) => ({ channel: x.channel as never, day: x.day, brief: x.brief }))}
    mailboxes={mbs.map((m, i) => { const day = Math.floor((Date.now() - m.warmupStartedAt.getTime()) / 86_400_000) + 1; return { id: m.id, email: m.email, provider: m.provider, status: m.status, day, cap: dailyCap(day, m.capMax), max: m.capMax, error: m.lastError, dns: health[i] }; })}
    limit={lim.mailboxes} approval={ws.prefs?.approval ?? 'every'} linkedinAuto={lim.linkedinAuto}
    window={s ? `${s.days.map((d) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d - 1]).join(', ')} · ${s.startHour}:00–${s.endHour}:00 ${s.tz}` : 'Not set'}
    queue={queue.map((q) => ({ company: q.c, step: q.e.stepIndex + 1, status: q.e.status, reason: q.e.stoppedReason, next: q.e.nextRunAt?.toISOString() ?? null, mailbox: q.mb }))}
    microsoft={!!process.env.MS_CLIENT_ID} openMailbox={!!sp.mailbox} flash={sp.e ?? (sp.saved ? 'Mailbox connected.' : null)} />;
}
