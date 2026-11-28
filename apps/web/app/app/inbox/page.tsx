import { and, companies, contacts, db, desc, enrollments, eq, inArray, messages, opportunities, signals } from '@/lib/db';
import { SUBTYPES, type Subtype } from '@frithly/core';
import { requireWorkspace } from '@/lib/auth';
import { InboxView, type Reply } from './view';

export default async function Inbox() {
  const { ws } = await requireWorkspace();
  const rows = await db.select({ m: messages, o: opportunities, c: companies, ct: contacts })
    .from(messages).innerJoin(enrollments, eq(enrollments.id, messages.enrollmentId))
    .innerJoin(opportunities, eq(opportunities.id, enrollments.opportunityId))
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId))
    .where(and(eq(messages.workspaceId, ws.id), eq(messages.direction, 'in'))).orderBy(desc(messages.at)).limit(200);
  const enrIds = [...new Set(rows.map((r) => r.m.enrollmentId!))];
  const thread = enrIds.length ? await db.select().from(messages).where(inArray(messages.enrollmentId, enrIds)).orderBy(messages.at) : [];
  const sigIds = rows.map((r) => r.o.signalId).filter(Boolean) as string[];
  const sigs = sigIds.length ? await db.select().from(signals).where(inArray(signals.id, sigIds)) : [];
  const replies: Reply[] = rows.map(({ m, o, c, ct }) => {
    const s = sigs.find((x) => x.id === o.signalId);
    return {
      id: m.id, oppId: o.id, cls: m.classification ?? 'other', at: m.at.toISOString(), unread: !m.readAt, from: m.fromAddr, subject: m.subject, body: m.body,
      who: ct?.name ?? m.fromAddr, first: (ct?.name ?? m.fromAddr).split(/[ @]/)[0], role: ct?.role ?? '', company: c.name, domain: c.domain, industry: c.industry, size: c.size, country: c.country,
      why: s ? { label: SUBTYPES[s.subtype as Subtype]?.label ?? s.label, evidence: s.evidence ?? s.detail ?? '', category: s.category ?? '' } : null,
      combo: o.combo, status: o.status,
      thread: thread.filter((t) => t.enrollmentId === m.enrollmentId && t.at <= new Date(m.at.getTime() + 365 * 86_400_000)).map((t) => ({ id: t.id, out: t.direction === 'out', at: t.at.toISOString(), subject: t.subject, body: t.body, from: t.fromAddr })),
    };
  });
  return <InboxView replies={replies} signature={ws.sending?.signature ?? ''} />;
}
