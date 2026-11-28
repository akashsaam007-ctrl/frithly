'use server';
import { redirect } from 'next/navigation';
import {
  and, companies, contacts, credits, db, deals, desc, drafts, enrollments, eq, inArray, invites, isNull, lookups, mailboxes, members,
  messages, opportunities, sequences, signals, suppressions, tasks, users, workspaces,
} from '@/lib/db';
import { ADDONS, SEQ_PRESETS, SUBTYPES, checkEmail, encrypt, planLimits, type ReplyClass, type SeqStep } from '@frithly/core';
import { sendMail, testSmtpImap, writeEmail, type MailboxRow } from '@frithly/engine';
import { requireWorkspace, type WS } from '@/lib/auth';
import { creditsLeft, planKey, todayIn, tzOf } from '@/lib/ctx';
import { enqueue } from '@/lib/queue';
import { importCompanies, normDomain } from '@/lib/companies';
import { ADDON_PRICE, checkoutUrl, portalUrl, stripe } from '@/lib/billing';
import { sendSystemMail } from '@/lib/mailer';

type R = Promise<{ msg?: string; err?: string }>;
const DAY = 86_400_000;

/* ---------- helpers ---------- */
async function oppCtx(ws: WS, id: string) {
  const [r] = await db.select({ o: opportunities, c: companies, ct: contacts, s: signals })
    .from(opportunities).innerJoin(companies, eq(companies.id, opportunities.companyId))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId)).leftJoin(signals, eq(signals.id, opportunities.signalId))
    .where(and(eq(opportunities.id, id), eq(opportunities.workspaceId, ws.id)));
  return r;
}
const checkBase = (ws: WS, r: NonNullable<Awaited<ReturnType<typeof oppCtx>>>) => ({
  companyName: r.c.name, domain: r.c.domain, contactRole: r.ct?.role ?? null, signalLabel: r.s?.label ?? null,
  emailStatus: r.ct?.emailStatus ?? 'none', signature: ws.sending?.signature, postalAddress: ws.sending?.postalAddress, optOutLine: ws.sending?.optOutLine,
});
async function spend(ws: WS, n: number, reason: string) {
  const { left } = await creditsLeft(ws);
  if (left < n) return false;
  await db.insert(credits).values({ workspaceId: ws.id, delta: -n, reason });
  return true;
}
async function upsertDraft(oppId: string, step: number, subject: string, body: string, approved = false) {
  await db.insert(drafts).values({ opportunityId: oppId, stepIndex: step, subject, body, approvedAt: approved ? new Date() : null })
    .onConflictDoUpdate({ target: [drafts.opportunityId, drafts.stepIndex], set: { subject, body, ...(approved ? { approvedAt: new Date() } : {}) } });
}
async function draftFor(ws: WS, r: NonNullable<Awaited<ReturnType<typeof oppCtx>>>) {
  if (!r.ct || !ws.profile) return null;
  const [owner] = await db.select().from(users).where(eq(users.id, ws.ownerId));
  const stack = await db.select().from(signals).where(and(eq(signals.companyId, r.c.id), eq(signals.verified, true))).orderBy(desc(signals.baseWeight)).limit(6);
  return writeEmail({
    senderName: owner?.name ?? ws.name, senderCompany: ws.name, offer: ws.profile.offer, proofPoint: ws.profile.proofPoint,
    company: { name: r.c.name, domain: r.c.domain, industry: r.c.industry }, contact: { name: r.ct.name, role: r.ct.role },
    signal: { type: r.s?.type ?? 'import', label: r.s?.label ?? '', detail: r.s?.evidence ?? r.s?.detail },
    stack: stack.filter((x) => x.category !== 'DISQUALIFIER').map((x) => ({ label: x.label, evidence: x.evidence ?? '' })),
    hypothesis: r.o.hypothesis, angle: r.o.angle,
    step: { index: 0, brief: 'Signal, what it usually causes, proof, one easy question' },
  }, checkBase(ws, r));
}

export async function clearNotes(): R {
  const { ws } = await requireWorkspace();
  await db.update(workspaces).set({ prefs: { ...ws.prefs, notesClearedAt: new Date().toISOString() } }).where(eq(workspaces.id, ws.id));
  return {};
}

/* ---------- Today ---------- */
export async function approve(id: string, subject?: string, body?: string): R {
  const { ws } = await requireWorkspace();
  if (ws.plan === 'expired') return { err: 'Your trial has ended. Choose a plan in Billing to keep sending.' };
  const r = await oppCtx(ws, id);
  if (!r || !['new', 'saved'].includes(r.o.status)) return { err: 'This company was already handled.' };
  const [d] = await db.select().from(drafts).where(and(eq(drafts.opportunityId, id), eq(drafts.stepIndex, 0)));
  const sj = subject ?? d?.subject ?? '', bd = body ?? d?.body ?? '';
  if (!sj || !bd) return { err: 'There’s no draft yet. It’s written once we find the right person.' };
  const failed = checkEmail({ ...checkBase(ws, r), subject: sj, body: bd }).filter((c) => !c.pass);
  if (failed.length) return { err: `${r.c.name} can’t be approved yet: ${failed[0].label.toLowerCase()}.` };
  const [hit] = await db.select().from(suppressions).where(and(inArray(suppressions.email, [r.ct!.email!.toLowerCase(), `@${r.c.domain}`])));
  if (hit && (hit.workspaceId === ws.id || hit.workspaceId === null)) return { err: `${r.c.name} is on your do-not-contact list.` };
  await upsertDraft(id, 0, sj, bd, true);
  await db.update(opportunities).set({ status: 'approved', actedAt: new Date() }).where(eq(opportunities.id, id));
  return { msg: `${r.c.name} approved. Email 1 goes out in the next sending window.` };
}

export async function approveMany(ids: string[]): R {
  let ok = 0; const bad: string[] = [];
  for (const id of ids) { const r = await approve(id); if (r.err) bad.push(r.err); else ok++; }
  return ok ? { msg: `${ok} approved. They go out in the next sending window.${bad.length ? ` ${bad.length} couldn’t be approved.` : ''}` } : { err: bad[0] ?? 'Nothing approved.' };
}

export async function skip(id: string, nofit = false): R {
  const { ws } = await requireWorkspace();
  const r = await oppCtx(ws, id);
  if (!r) return {};
  await db.update(opportunities).set({ status: nofit ? 'nofit' : 'skipped', actedAt: new Date() }).where(eq(opportunities.id, id));
  await db.update(companies).set({ cooldownUntil: new Date(Date.now() + (nofit ? 180 : 45) * DAY) }).where(eq(companies.id, r.c.id));
  if (nofit && r.o.releasedOn) {
    // Replace it with the next best account from the pool.
    const [next] = await db.select({ id: opportunities.id }).from(opportunities)
      .where(and(eq(opportunities.workspaceId, ws.id), eq(opportunities.status, 'new'), isNull(opportunities.releasedOn))).orderBy(desc(opportunities.score)).limit(1);
    if (next) {
      await db.update(opportunities).set({ releasedOn: todayIn(tzOf(ws)) }).where(eq(opportunities.id, next.id));
      await enqueue('enrich-opportunity', { oppId: next.id }, next.id).catch(() => null);
    }
    return { msg: `${r.c.name} marked not a fit.${next ? ' We added another company.' : ''}` };
  }
  return { msg: `${r.c.name} skipped.` };
}

export async function restore(id: string): R {
  const { ws } = await requireWorkspace();
  const r = await oppCtx(ws, id);
  if (!r) return {};
  const [e] = await db.select().from(enrollments).where(eq(enrollments.opportunityId, id));
  if (e) {
    const sent = await db.select({ id: messages.id }).from(messages).where(eq(messages.enrollmentId, e.id)).limit(1);
    if (sent.length) return { err: 'The first email already went out, so this can’t be undone. Stop it from Outreach instead.' };
    await db.delete(enrollments).where(eq(enrollments.id, e.id));
  }
  await db.update(drafts).set({ approvedAt: null }).where(eq(drafts.opportunityId, id));
  await db.update(opportunities).set({ status: 'new', actedAt: null }).where(eq(opportunities.id, id));
  await db.update(companies).set({ cooldownUntil: null }).where(eq(companies.id, r.c.id));
  return { msg: `${r.c.name} moved back to new.` };
}

export async function saveDraft(id: string, step: number, subject: string, body: string): R {
  const { ws } = await requireWorkspace();
  if (!(await oppCtx(ws, id))) return {};
  await upsertDraft(id, step, subject, body);
  return {};
}

export async function rewriteDraft(id: string): R {
  const { ws } = await requireWorkspace();
  const r = await oppCtx(ws, id);
  if (!r?.ct) return { err: 'We need a contact before writing a draft.' };
  if (!process.env.ANTHROPIC_API_KEY) return { err: 'Drafting is off: no Anthropic API key is set.' };
  const w = await draftFor(ws, r);
  if (!w?.subject) return { err: 'The rewrite didn’t come back. Try again.' };
  await upsertDraft(id, 0, w.subject, w.body);
  return { msg: 'Draft rewritten.' };
}

/** Approve a follow-up that's waiting (approval mode "every email"). */
export async function approveFollowup(id: string, step: number, subject: string, body: string): R {
  const { ws } = await requireWorkspace();
  const r = await oppCtx(ws, id);
  if (!r) return {};
  const failed = checkEmail({ ...checkBase(ws, r), subject: subject || 'same thread reply', body }).filter((c) => !c.pass);
  if (failed.length) return { err: `Fix first: ${failed[0].label.toLowerCase()}.` };
  await upsertDraft(id, step, subject, body, true);
  await db.update(tasks).set({ doneAt: new Date() }).where(and(eq(tasks.opportunityId, id), eq(tasks.type, 'review'), isNull(tasks.doneAt)));
  await db.update(enrollments).set({ status: 'active', stoppedReason: null, nextRunAt: new Date() }).where(and(eq(enrollments.opportunityId, id), eq(enrollments.status, 'paused')));
  return { msg: `Follow-up ${step + 1} approved. It sends in the next window.` };
}

export async function useContact(oppId: string, contactId: string): R {
  const { ws } = await requireWorkspace();
  const r = await oppCtx(ws, oppId);
  const [ct] = await db.select().from(contacts).where(and(eq(contacts.id, contactId), eq(contacts.workspaceId, ws.id)));
  if (!r || !ct) return {};
  if (ct.emailStatus === 'valid') {
    await db.update(opportunities).set({ contactId: ct.id }).where(eq(opportunities.id, oppId));
    await db.delete(drafts).where(and(eq(drafts.opportunityId, oppId), eq(drafts.stepIndex, 0)));
    const r2 = await oppCtx(ws, oppId);
    const w = r2 && process.env.ANTHROPIC_API_KEY ? await draftFor(ws, r2) : null;
    if (w?.subject) await upsertDraft(oppId, 0, w.subject, w.body);
    return { msg: `Now writing to ${ct.name}.` };
  }
  if (!(await spend(ws, 1, `Email for ${ct.name} at ${r.c.name} [contact:${ct.id}]`))) return { err: 'Not enough lookup credits this month.' };
  await enqueue('find-email', { contactId: ct.id, makeMain: true }, `${ct.id}:main`).catch(() => null);
  return { msg: `Finding ${ct.name}’s email. 1 credit used. The draft updates in a minute.` };
}

export async function findEmail(contactId: string): R {
  const { ws } = await requireWorkspace();
  const [ct] = await db.select({ ct: contacts, c: companies.name }).from(contacts).innerJoin(companies, eq(companies.id, contacts.companyId)).where(and(eq(contacts.id, contactId), eq(contacts.workspaceId, ws.id)));
  if (!ct) return {};
  if (!(await spend(ws, 1, `Email for ${ct.ct.name} at ${ct.c} [contact:${ct.ct.id}]`))) return { err: 'Not enough lookup credits this month.' };
  await enqueue('find-email', { contactId }, contactId).catch(() => null);
  return { msg: `Looking up ${ct.ct.name}’s email. 1 credit used.` };
}

/* ---------- Inbox ---------- */
export async function markRead(id: string): R {
  const { ws } = await requireWorkspace();
  await db.update(messages).set({ readAt: new Date() }).where(and(eq(messages.id, id), eq(messages.workspaceId, ws.id), isNull(messages.readAt)));
  return {};
}

export async function setReplyType(id: string, cls: ReplyClass): R {
  const { ws } = await requireWorkspace();
  const [m] = await db.update(messages).set({ classification: cls }).where(and(eq(messages.id, id), eq(messages.workspaceId, ws.id))).returning();
  if (m && (cls === 'not_interested' || cls === 'optout')) {
    await db.insert(suppressions).values({ workspaceId: ws.id, email: m.fromAddr, reason: cls }).onConflictDoNothing();
    if (cls === 'optout') await db.insert(suppressions).values({ workspaceId: null, email: m.fromAddr, reason: cls }).onConflictDoNothing();
    return { msg: `${m.fromAddr} added to do-not-contact.` };
  }
  return { msg: 'Reply type updated.' };
}

export async function sendReply(msgId: string, text: string): R {
  const { ws } = await requireWorkspace();
  const [m] = await db.select().from(messages).where(and(eq(messages.id, msgId), eq(messages.workspaceId, ws.id)));
  if (!m || !text.trim()) return {};
  const [mb] = m.mailboxId ? await db.select().from(mailboxes).where(eq(mailboxes.id, m.mailboxId)) : [];
  if (!mb) return { err: 'The mailbox this reply came to isn’t connected any more.' };
  const thread = await db.select().from(messages).where(eq(messages.enrollmentId, m.enrollmentId!)).orderBy(messages.at);
  const s = ws.sending;
  const full = `${text.trim()}\n\n${s?.signature ?? ''}`.trim();
  try {
    const sent = await sendMail(mb as unknown as MailboxRow, {
      to: m.fromAddr, subject: /^re:/i.test(m.subject) ? m.subject : `Re: ${m.subject}`, text: full,
      inReplyTo: m.messageId, references: thread.map((x) => x.messageId!).filter(Boolean), replyToProviderId: m.providerId,
    });
    await db.insert(messages).values({ workspaceId: ws.id, enrollmentId: m.enrollmentId, mailboxId: mb.id, direction: 'out', messageId: sent.messageId, providerId: sent.providerId, inReplyTo: m.messageId, fromAddr: mb.email, toAddr: m.fromAddr, subject: /^re:/i.test(m.subject) ? m.subject : `Re: ${m.subject}`, body: full });
    if (sent.newSecretEnc) await db.update(mailboxes).set({ secretEnc: sent.newSecretEnc }).where(eq(mailboxes.id, mb.id));
  } catch (e) {
    return { err: `Couldn’t send: ${(e as Error).message}` };
  }
  return { msg: `Reply sent from ${mb.email}.` };
}

async function upsertDeal(ws: WS, oppId: string, stage: string, note?: string) {
  const r = await oppCtx(ws, oppId);
  if (!r) return null;
  const [d] = await db.insert(deals).values({ workspaceId: ws.id, companyId: r.c.id, opportunityId: oppId, stage, note })
    .onConflictDoUpdate({ target: [deals.workspaceId, deals.companyId], set: { stage, updatedAt: new Date(), ...(note ? { note } : {}) } }).returning();
  return { d, r };
}
export async function bookMeeting(oppId: string): R {
  const { ws } = await requireWorkspace();
  const x = await upsertDeal(ws, oppId, 'Meeting', 'Meeting booked');
  if (!x) return {};
  await db.update(opportunities).set({ status: 'meeting' }).where(eq(opportunities.id, oppId));
  return { msg: `${x.r.c.name} moved to Meeting in Deals.` };
}
export async function toDeal(oppId: string): R {
  const { ws } = await requireWorkspace();
  const x = await upsertDeal(ws, oppId, 'Replied', 'From inbox');
  return x ? { msg: `${x.r.c.name} added to Deals.` } : {};
}
export async function snoozeReply(oppId: string, who: string): R {
  const { ws } = await requireWorkspace();
  const r = await oppCtx(ws, oppId);
  if (!r) return {};
  const due = new Date(Date.now() + 30 * DAY);
  await db.insert(tasks).values({ workspaceId: ws.id, opportunityId: oppId, type: 'custom', title: `Check back with ${who} at ${r.c.name}`, dueAt: due });
  return { msg: `Task added for ${due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.` };
}

/* ---------- Deals ---------- */
export async function moveDeal(id: string, stage: string): R {
  const { ws } = await requireWorkspace();
  const [d] = await db.update(deals).set({ stage, updatedAt: new Date() }).where(and(eq(deals.id, id), eq(deals.workspaceId, ws.id))).returning();
  if (d?.opportunityId) {
    const st = stage === 'Won' ? 'won' : stage === 'Lost' ? 'lost' : stage === 'Meeting' || stage === 'Proposal' ? 'meeting' : 'replied';
    await db.update(opportunities).set({ status: st }).where(eq(opportunities.id, d.opportunityId));
  }
  return { msg: `Moved to ${stage}.` };
}
export async function newDeal(companyId: string, value: number, stage: string): R {
  const { ws } = await requireWorkspace();
  const [c] = await db.select().from(companies).where(and(eq(companies.id, companyId), eq(companies.workspaceId, ws.id)));
  if (!c) return {};
  const [o] = await db.select().from(opportunities).where(and(eq(opportunities.workspaceId, ws.id), eq(opportunities.companyId, c.id)));
  await db.insert(deals).values({ workspaceId: ws.id, companyId: c.id, opportunityId: o?.id, stage, valueUsd: Math.max(0, Math.round(value) || 0), note: 'Added by you' })
    .onConflictDoUpdate({ target: [deals.workspaceId, deals.companyId], set: { stage, valueUsd: Math.max(0, Math.round(value) || 0), updatedAt: new Date() } });
  return { msg: 'Deal added.' };
}
export async function updateDeal(id: string, value: number, note: string): R {
  const { ws } = await requireWorkspace();
  await db.update(deals).set({ valueUsd: Math.max(0, Math.round(value) || 0), note, updatedAt: new Date() }).where(and(eq(deals.id, id), eq(deals.workspaceId, ws.id)));
  return { msg: 'Deal updated.' };
}

/* ---------- Tasks ---------- */
export async function addTask(title: string, companyId: string, dueDays: number): R {
  const { ws } = await requireWorkspace();
  if (!title.trim()) return {};
  let opp: string | undefined;
  if (companyId) { const [o] = await db.select().from(opportunities).where(and(eq(opportunities.workspaceId, ws.id), eq(opportunities.companyId, companyId))); opp = o?.id; }
  await db.insert(tasks).values({ workspaceId: ws.id, opportunityId: opp, type: 'custom', title: title.trim(), dueAt: new Date(Date.now() + dueDays * DAY) });
  return { msg: 'Task added.' };
}
export async function setTaskDone(id: string, done: boolean): R {
  const { ws } = await requireWorkspace();
  const [t] = await db.update(tasks).set({ doneAt: done ? new Date() : null }).where(and(eq(tasks.id, id), eq(tasks.workspaceId, ws.id))).returning();
  return t && done ? { msg: 'Task done.' } : {};
}
export async function deleteTask(id: string): R {
  const { ws } = await requireWorkspace();
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.workspaceId, ws.id)));
  return { msg: 'Task deleted.' };
}

/* ---------- Find & enrich ---------- */
export async function lookupCompany(raw: string): R {
  const { ws } = await requireWorkspace();
  const domain = normDomain(raw);
  if (!domain) return { err: 'That doesn’t look like a company website.' };
  if (!(await spend(ws, 2, `Lookup: ${domain}`))) return { err: 'Not enough lookup credits this month.' };
  await importCompanies(ws.id, domain, 'manual');
  const [c] = await db.select().from(companies).where(and(eq(companies.workspaceId, ws.id), eq(companies.domain, domain)));
  await db.insert(lookups).values({ workspaceId: ws.id, companyId: c.id });
  await enqueue('lookup-company', { companyId: c.id }, `${c.id}:lookup`).catch(() => null);
  return { msg: `Looking up ${domain}. 2 credits used. It shows here in a minute or two.` };
}
export async function bulkLookup(list: string[]): R {
  const { ws } = await requireWorkspace();
  const ds = [...new Set(list.map(normDomain).filter(Boolean) as string[])];
  const { left } = await creditsLeft(ws);
  if (left < ds.length * 2) return { err: `That needs ${ds.length * 2} credits; you have ${left}.` };
  for (const d of ds) await lookupCompany(d);
  return { msg: `${ds.length} companies looked up. ${ds.length * 2} credits used.` };
}
export async function addToWatchlist(text: string): R {
  const { ws } = await requireWorkspace();
  const r = await importCompanies(ws.id, text);
  const fresh = await db.select({ id: companies.id }).from(companies).where(and(eq(companies.workspaceId, ws.id), isNull(companies.lastScannedAt)));
  for (const c of fresh) await enqueue('scan-company', { companyId: c.id }, c.id).catch(() => null);
  return { msg: `${r.added} companies added to your watchlist. We check them every day.` };
}

/* ---------- Outreach ---------- */
export async function saveSequence(steps: SeqStep[]): R {
  const { ws } = await requireWorkspace();
  const clean = steps.slice(0, 9).map((s, i) => ({ channel: s.channel, day: i === 0 ? 0 : Math.max(1, Math.min(60, Math.round(s.day))), brief: s.brief || 'Follow-up', sameThread: s.channel === 'email' && i > 0 }))
    .sort((a, b) => a.day - b.day);
  if (clean[0]?.channel !== 'email') return { err: 'The first step has to be an email.' };
  const [seq] = await db.select().from(sequences).where(and(eq(sequences.workspaceId, ws.id), eq(sequences.isDefault, true)));
  if (seq) await db.update(sequences).set({ steps: clean }).where(eq(sequences.id, seq.id));
  else await db.insert(sequences).values({ workspaceId: ws.id, name: 'Default', steps: clean, isDefault: true });
  return { msg: 'Sequence saved. New companies use it; running ones keep theirs.' };
}
export async function presetSequence(key: string): R {
  const p = SEQ_PRESETS[key];
  return p ? saveSequence(p.steps) : {};
}
export async function setApproval(mode: 'every' | 'first'): R {
  const { ws } = await requireWorkspace();
  await db.update(workspaces).set({ prefs: { ...ws.prefs, approval: mode } }).where(eq(workspaces.id, ws.id));
  return { msg: mode === 'every' ? 'You’ll approve every email, follow-ups included.' : 'You’ll approve first emails; follow-ups send on their own.' };
}
const PRESETS: Record<string, { smtpHost: string; smtpPort: number; smtpSecure: boolean; imapHost: string; imapPort: number; imapSecure: boolean }> = {
  google: { smtpHost: 'smtp.gmail.com', smtpPort: 465, smtpSecure: true, imapHost: 'imap.gmail.com', imapPort: 993, imapSecure: true },
  zoho: { smtpHost: 'smtp.zoho.in', smtpPort: 465, smtpSecure: true, imapHost: 'imap.zoho.in', imapPort: 993, imapSecure: true },
};
export async function addMailbox(f: { email: string; fromName: string; password: string; preset: string; smtpHost?: string; smtpPort?: string; imapHost?: string; user?: string; existing: boolean }): R {
  const { ws } = await requireWorkspace();
  const lim = planLimits(planKey(ws), ws.addons);
  const n = (await db.select({ id: mailboxes.id }).from(mailboxes).where(eq(mailboxes.workspaceId, ws.id))).length;
  if (n >= lim.mailboxes) return { err: `Your plan includes ${lim.mailboxes} mailbox${lim.mailboxes > 1 ? 'es' : ''}. Add one in Billing.` };
  const email = f.email.trim().toLowerCase();
  const port = Number(f.smtpPort || 465);
  const cfg = PRESETS[f.preset] ?? { smtpHost: f.smtpHost ?? '', smtpPort: port, smtpSecure: port === 465, imapHost: f.imapHost ?? '', imapPort: 993, imapSecure: true };
  const config = { ...cfg, user: f.user || email };
  try { await testSmtpImap(config, f.password); } catch (e) { return { err: (e as Error).message }; }
  // An inbox you already send from is warm: start it at full volume. A new domain ramps up over 3 weeks.
  const warm = f.existing ? new Date(Date.now() - 21 * DAY) : new Date();
  await db.insert(mailboxes).values({ workspaceId: ws.id, email, fromName: f.fromName || null, provider: 'smtp', config, secretEnc: encrypt(f.password), warmupStartedAt: warm })
    .onConflictDoUpdate({ target: [mailboxes.workspaceId, mailboxes.email], set: { config, secretEnc: encrypt(f.password), status: 'active', lastError: null } });
  return { msg: f.existing ? 'Mailbox connected. Ready to send today.' : 'Mailbox connected. Warm-up starts today.' };
}
export async function mailboxAct(id: string, act: 'pause' | 'resume' | 'remove'): R {
  const { ws } = await requireWorkspace();
  const w = and(eq(mailboxes.id, id), eq(mailboxes.workspaceId, ws.id));
  if (act === 'remove') await db.delete(mailboxes).where(w);
  else await db.update(mailboxes).set({ status: act === 'pause' ? 'paused' : 'active' }).where(w);
  return { msg: act === 'remove' ? 'Mailbox removed.' : act === 'pause' ? 'Mailbox paused.' : 'Mailbox resumed.' };
}

/* ---------- Settings ---------- */
const list = (v: FormDataEntryValue | null) => String(v ?? '').split(',').map((x) => x.trim()).filter(Boolean);
export async function saveProfile(fd: FormData): R {
  const { ws } = await requireWorkspace();
  const p = ws.profile ?? { offer: '', proofPoint: '', industries: [], sizes: [], countries: [], keywords: [], titles: [], hiringRoles: [] };
  const sender = String(fd.get('sender') ?? '').trim();
  await db.update(workspaces).set({
    name: String(fd.get('name') ?? ws.name).trim() || ws.name,
    website: normDomain(String(fd.get('site') ?? '')) ?? ws.website,
    profile: { ...p, offer: String(fd.get('sells') ?? '').trim(), proofPoint: String(fd.get('proof') ?? '').trim(), industries: list(fd.get('industries')), countries: list(fd.get('countries')), sizes: list(fd.get('sizes')), titles: list(fd.get('titles')) },
    sending: {
      ...(ws.sending ?? { tz: 'UTC', days: [1, 2, 3, 4, 5], startHour: 8, endHour: 17, signature: '', postalAddress: '', optOutLine: '' }),
      signature: String(fd.get('signature') ?? '').trim() || `${sender}\n${ws.name}`,
      postalAddress: String(fd.get('address') ?? '').trim(), optOutLine: String(fd.get('optout') ?? '').trim(),
      tz: String(fd.get('tz') ?? ws.sending?.tz ?? 'UTC'),
      days: fd.getAll('days').map(Number).filter((d) => d >= 1 && d <= 7).length ? fd.getAll('days').map(Number) : [1, 2, 3, 4, 5],
      startHour: Number(fd.get('start') ?? 8), endHour: Number(fd.get('end') ?? 17),
    },
  }).where(eq(workspaces.id, ws.id));
  return { msg: 'Profile saved. New drafts use it.' };
}
export async function saveSignals(fd: FormData): R {
  const { ws } = await requireWorkspace();
  if (!ws.profile) return {};
  const n = (k: string, lo: number, hi: number, d: number) => { const v = Number(fd.get(k)); return Number.isFinite(v) && v >= lo && v <= hi ? v : d; };
  const watched = new Set(fd.getAll('watch').map(String));
  const unwatched = Object.keys(SUBTYPES).filter((k) => SUBTYPES[k as keyof typeof SUBTYPES].category !== 'DISQUALIFIER' && !watched.has(k));
  await db.update(workspaces).set({
    profile: {
      ...ws.profile, competitors: list(fd.get('competitors')), hiringRoles: list(fd.get('hiring')),
      gate: { minScore: n('minScore', 20, 200, 60), minCategories: n('minCategories', 1, 4, 2), strongSingle: n('strongSingle', 20, 45, 35), allowCombos: fd.get('allowCombos') === 'on', allowSingle: fd.get('allowSingle') === 'on' },
    },
    prefs: { ...ws.prefs, unwatched },
  }).where(eq(workspaces.id, ws.id));
  return { msg: 'Signal settings saved. They apply from the next scan.' };
}
export async function addDnc(v: string): R {
  const { ws } = await requireWorkspace();
  const added: string[] = [];
  for (const raw of v.split(/[\s,;]+/)) {
    const x = raw.trim().toLowerCase();
    if (!x) continue;
    const email = x.includes('@') ? x : `@${x.replace(/^@/, '')}`;
    await db.insert(suppressions).values({ workspaceId: ws.id, email, reason: 'manual' }).onConflictDoNothing();
    added.push(email.startsWith('@') ? x : email);
  }
  return added.length ? { msg: `${added.join(', ')} will never be contacted.` } : {};
}
export async function removeDnc(id: string): R {
  const { ws } = await requireWorkspace();
  await db.delete(suppressions).where(and(eq(suppressions.id, id), eq(suppressions.workspaceId, ws.id)));
  return { msg: 'Removed from do-not-contact.' };
}
export async function invite(email: string): R {
  const { user, ws } = await requireWorkspace();
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { err: 'Enter a valid email.' };
  const lim = planLimits(planKey(ws), ws.addons);
  const used = (await db.select({ u: members.userId }).from(members).where(eq(members.workspaceId, ws.id))).length + (await db.select({ id: invites.id }).from(invites).where(and(eq(invites.workspaceId, ws.id), isNull(invites.acceptedAt)))).length;
  if (used >= lim.seats) return { err: `All ${lim.seats} seats are in use. Add a seat in Billing.` };
  await db.insert(invites).values({ workspaceId: ws.id, email: e }).onConflictDoNothing();
  await sendSystemMail(e, `${user.name ?? user.email} invited you to ${ws.name} on Frithly`, `Join ${ws.name} on Frithly: ${process.env.APP_URL}/login?email=${encodeURIComponent(e)}\n\nSign in with this email address and you'll land in the workspace.`);
  return { msg: `Invite sent to ${e}.` };
}
export async function removeMember(userId: string): R {
  const { user, ws } = await requireWorkspace();
  if (userId === ws.ownerId || userId === user.id) return { err: 'The owner can’t be removed.' };
  await db.delete(members).where(and(eq(members.workspaceId, ws.id), eq(members.userId, userId)));
  return { msg: 'Removed from the workspace.' };
}
export async function cancelInvite(id: string): R {
  const { ws } = await requireWorkspace();
  await db.delete(invites).where(and(eq(invites.id, id), eq(invites.workspaceId, ws.id)));
  return { msg: 'Invite cancelled.' };
}
export async function restartOnboarding(): Promise<void> {
  const { ws } = await requireWorkspace();
  await db.update(workspaces).set({ onboardedAt: null }).where(eq(workspaces.id, ws.id));
  redirect('/onboarding');
}

/* ---------- Billing ---------- */
export async function checkout(plan: 'starter' | 'pro' | 'starter_yearly' | 'pro_yearly'): Promise<void> {
  const { user, ws } = await requireWorkspace();
  redirect(await checkoutUrl(ws, user.email, plan));
}
export async function billingPortal(): Promise<void> {
  const { ws } = await requireWorkspace();
  if (!ws.stripeCustomerId) redirect('/app/billing');
  redirect(await portalUrl(ws.stripeCustomerId));
}
export async function addAddon(key: keyof typeof ADDON_PRICE): R {
  const { ws } = await requireWorkspace();
  const price = ADDON_PRICE[key]?.();
  if (!ws.stripeSubscriptionId) return { err: 'Choose a plan first.' };
  if (!price) return { err: 'This add-on isn’t set up in Stripe yet.' };
  const sub = await stripe().subscriptions.retrieve(ws.stripeSubscriptionId);
  const item = sub.items.data.find((i) => i.price.id === price);
  if (item) {
    if ((item.quantity ?? 1) >= ADDONS[key].max) return { err: 'That add-on is at its maximum.' };
    await stripe().subscriptionItems.update(item.id, { quantity: (item.quantity ?? 1) + 1, proration_behavior: 'create_prorations' });
  } else await stripe().subscriptionItems.create({ subscription: sub.id, price, quantity: 1, proration_behavior: 'create_prorations' });
  return { msg: `${ADDONS[key].name} added. It shows up within a minute.` };
}
export async function removeAddon(key: keyof typeof ADDON_PRICE): R {
  const { ws } = await requireWorkspace();
  const price = ADDON_PRICE[key]?.();
  if (!ws.stripeSubscriptionId || !price) return {};
  const sub = await stripe().subscriptions.retrieve(ws.stripeSubscriptionId);
  const item = sub.items.data.find((i) => i.price.id === price);
  if (!item) return {};
  if ((item.quantity ?? 1) > 1) await stripe().subscriptionItems.update(item.id, { quantity: (item.quantity ?? 1) - 1 });
  else await stripe().subscriptionItems.del(item.id);
  return { msg: `${ADDONS[key].name} removed from your next invoice.` };
}

