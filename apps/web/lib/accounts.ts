import 'server-only';
import {
  and, companies, contacts, db, deals, desc, drafts, enrollments, eq, gte, inArray, messages, opportunities, sequences, signals, type SQL,
} from '@/lib/db';
import { SUBTYPES, decay, footer, type Subtype } from '@frithly/core';
import type { WS } from '@/lib/auth';

export type Timing = 'Act today' | 'This week' | 'Soon';
const CAT_FILTER: Record<string, string> = { LEADERSHIP: 'lead', EXPANSION: 'fund', HIRING_PAIN: 'hire', TECH_SHIFT: 'tool', COMPETITOR_PAIN: 'tool', UPMARKET_PREP: 'upmarket' };
export const CHIP: Record<string, string> = { LEADERSHIP: 'lav', EXPANSION: 'pin', HIRING_PAIN: 'pea', TECH_SHIFT: 'mint', COMPETITOR_PAIN: 'li', UPMARKET_PREP: 'gray', DISQUALIFIER: 'pin' };

export interface Account {
  id: string; status: string; score: number; promotedBy: string | null; combo: string | null;
  persona: string | null; hypothesis: string | null; angle: string | null; releasedOn: string | null;
  company: { id: string; name: string; domain: string; industry: string | null; size: string | null; country: string | null };
  contact: { id: string; name: string; role: string | null; email: string | null; emailStatus: string; linkedin: string | null } | null;
  contacts: { id: string; name: string; role: string | null; email: string | null; emailStatus: string; linkedin: string | null }[];
  signals: { id: string; subtype: string; label: string; category: string; evidence: string; url: string | null; eventDate: string; points: number; weight: number; verified: boolean | null; counted: boolean; daysLeft: number }[];
  main: { label: string; category: string; evidence: string } | null;
  filter: string; timing: Timing;
  draft: { subject: string; body: string; approved: boolean } | null;
  pending: { step: number; subject: string; body: string } | null;
  enrollment: { status: string; step: number; reason: string | null } | null;
  deal: { stage: string } | null;
  activity: { t: string; w: string }[];
  base: { companyName: string; domain: string; contactRole: string | null; signalLabel: string | null; emailStatus: string; signature: string; postalAddress: string; optOutLine: string };
  footer: string;
  seq: { channel: string; day: number }[];
}

export async function loadAccounts(ws: WS, where: SQL | undefined, limit = 200): Promise<Account[]> {
  const rows = await db.select({ o: opportunities, c: companies }).from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .where(and(eq(opportunities.workspaceId, ws.id), where)).orderBy(desc(opportunities.score)).limit(limit);
  if (!rows.length) return [];
  const oppIds = rows.map((r) => r.o.id), coIds = rows.map((r) => r.c.id);
  const since = new Date(Date.now() - 60 * 86_400_000);
  const [cts, sigs, drs, enrs, dls, [seq]] = await Promise.all([
    db.select().from(contacts).where(inArray(contacts.companyId, coIds)),
    db.select().from(signals).where(and(inArray(signals.companyId, coIds), gte(signals.eventDate, since))),
    db.select().from(drafts).where(inArray(drafts.opportunityId, oppIds)),
    db.select().from(enrollments).where(inArray(enrollments.opportunityId, oppIds)),
    db.select().from(deals).where(and(eq(deals.workspaceId, ws.id), inArray(deals.companyId, coIds))),
    db.select().from(sequences).where(and(eq(sequences.workspaceId, ws.id), eq(sequences.isDefault, true))),
  ]);
  const msgs = enrs.length ? await db.select().from(messages).where(inArray(messages.enrollmentId, enrs.map((e) => e.id))) : [];
  const s = ws.sending;
  const foot = footer(s?.signature ?? '', s?.postalAddress ?? '', s?.optOutLine ?? '');
  const off = new Set(ws.prefs?.unwatched ?? []);

  return rows.map(({ o, c }) => {
    const ct = cts.find((x) => x.id === o.contactId) ?? null;
    const mine = sigs.filter((x) => x.companyId === c.id && x.subtype && x.eventDate);
    // Same rule as scoring: strongest verified instance of each subtype counts.
    const pts = (x: (typeof mine)[number]) => (x.verified && x.category !== 'DISQUALIFIER' && !off.has(x.subtype!) ? Math.round((x.baseWeight ?? 0) * decay(x.eventDate!)) : 0);
    const best = new Map<string, (typeof mine)[number]>();
    for (const x of mine) if (pts(x) > 0 && (!best.has(x.subtype!) || pts(x) > pts(best.get(x.subtype!)!))) best.set(x.subtype!, x);
    const counted = new Set([...best.values()].map((x) => x.id));
    const sg = mine.map((x) => ({
      id: x.id, subtype: x.subtype!, label: SUBTYPES[x.subtype as Subtype]?.label ?? x.label, category: x.category ?? '', evidence: x.evidence ?? x.detail ?? '',
      url: x.url, eventDate: x.eventDate!.toISOString(), points: pts(x), weight: x.baseWeight ?? 0, verified: x.verified,
      counted: counted.has(x.id) || (x.category === 'DISQUALIFIER' && !!x.verified),
      daysLeft: Math.max(0, 45 - Math.floor((Date.now() - x.eventDate!.getTime()) / 86_400_000)),
    })).sort((a, b) => Number(b.counted) - Number(a.counted) || b.points - a.points || b.eventDate.localeCompare(a.eventDate));
    const top = sg.find((x) => x.counted && x.points) ?? null;
    const freshest = Math.min(...sg.filter((x) => x.counted && x.points).map((x) => 45 - x.daysLeft), 99);
    const timing: Timing = freshest <= 7 && (o.score >= 45 || o.promotedBy === 'combo' || o.promotedBy === 'single') ? 'Act today' : freshest <= 21 ? 'This week' : 'Soon';
    const d0 = drs.find((d) => d.opportunityId === o.id && d.stepIndex === 0);
    const e = enrs.find((x) => x.opportunityId === o.id) ?? null;
    const pend = e ? drs.filter((d) => d.opportunityId === o.id && d.stepIndex > 0 && !d.approvedAt && d.stepIndex === e.stepIndex)[0] : undefined;
    const ms = e ? msgs.filter((m) => m.enrollmentId === e.id) : [];
    const activity = [
      ...(top ? [{ t: `Signal spotted: ${top.label} · ${top.evidence.slice(0, 80)}`, w: top.eventDate }] : []),
      ...(ct ? [{ t: `Contact found: ${ct.name}${ct.emailStatus === 'valid' ? ', email checked' : ''}`, w: ct.createdAt.toISOString() }] : []),
      ...(d0 ? [{ t: 'First draft written', w: d0.createdAt.toISOString() }] : []),
      ...(d0?.approvedAt ? [{ t: `Approved · ${(seq?.steps.length ?? 0)}-step sequence`, w: d0.approvedAt.toISOString() }] : []),
      ...ms.map((m) => ({ t: m.direction === 'out' ? `Sent: ${m.subject}` : `Reply from ${m.fromAddr}${m.classification ? ` · ${m.classification.replace('_', ' ')}` : ''}`, w: m.at.toISOString() })),
      ...(o.actedAt && ['skipped', 'nofit'].includes(o.status) ? [{ t: o.status === 'nofit' ? 'Marked not a fit' : 'Skipped', w: o.actedAt.toISOString() }] : []),
    ].sort((a, b) => b.w.localeCompare(a.w));
    const mapCt = (x: (typeof cts)[number]) => ({ id: x.id, name: x.name, role: x.role, email: x.email, emailStatus: x.emailStatus, linkedin: x.linkedinUrl });
    return {
      id: o.id, status: o.status, score: o.score, promotedBy: o.promotedBy, combo: o.combo, persona: o.persona, hypothesis: o.hypothesis, angle: o.angle, releasedOn: o.releasedOn,
      company: { id: c.id, name: c.name, domain: c.domain, industry: c.industry, size: c.size, country: c.country },
      contact: ct ? mapCt(ct) : null,
      contacts: cts.filter((x) => x.companyId === c.id).map(mapCt),
      signals: sg,
      main: top ? { label: o.combo ?? top.label, category: top.category, evidence: top.evidence } : null,
      filter: CAT_FILTER[top?.category ?? ''] ?? 'other', timing,
      draft: d0 ? { subject: d0.subject, body: d0.body, approved: !!d0.approvedAt } : null,
      pending: pend ? { step: pend.stepIndex, subject: pend.subject, body: pend.body } : null,
      enrollment: e ? { status: e.status, step: e.stepIndex, reason: e.stoppedReason } : null,
      deal: dls.find((x) => x.companyId === c.id) ? { stage: dls.find((x) => x.companyId === c.id)!.stage } : null,
      activity,
      base: { companyName: c.name, domain: c.domain, contactRole: ct?.role ?? null, signalLabel: top?.label ?? null, emailStatus: ct?.emailStatus ?? 'none', signature: s?.signature ?? '', postalAddress: s?.postalAddress ?? '', optOutLine: s?.optOutLine ?? '' },
      footer: foot,
      seq: (seq?.steps ?? []).map((x) => ({ channel: x.channel, day: x.day })),
    };
  });
}
