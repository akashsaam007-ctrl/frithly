import {
  and, asc, companies, contacts, db, drafts, enrollments, eq, isNull, lte, mailboxes, messages, opportunities, sequences, signals, tasks, users, workspaces,
} from '@frithly/db';
import { SEQ_PRESETS, addDays, allPass, checkEmail, dailyCap, footer, nextInWindow, inWindow, sendGapMs, token, unsubscribeHeaders } from '@frithly/core';
import { sendMail, writeEmail, type MailboxRow } from '@frithly/engine';
import { bumpUsage, isSuppressed, log, todayIn, windowOf } from '../lib';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';

async function defaultSequence(workspaceId: string) {
  const [s] = await db.select().from(sequences).where(and(eq(sequences.workspaceId, workspaceId), eq(sequences.isDefault, true)));
  if (s) return s;
  const [n] = await db.insert(sequences).values({ workspaceId, name: SEQ_PRESETS.mix.name, steps: SEQ_PRESETS.mix.steps, isDefault: true }).returning();
  return n;
}

/** Approved opportunities get an enrollment. They wait if no mailbox is connected yet. */
export async function enrollApproved() {
  const rows = await db
    .select({ opp: opportunities })
    .from(opportunities)
    .leftJoin(enrollments, eq(enrollments.opportunityId, opportunities.id))
    .where(and(eq(opportunities.status, 'approved'), isNull(enrollments.id)))
    .limit(200);
  for (const { opp } of rows) {
    const seq = await defaultSequence(opp.workspaceId);
    const hasMb = (await db.select({ id: mailboxes.id }).from(mailboxes).where(and(eq(mailboxes.workspaceId, opp.workspaceId), eq(mailboxes.status, 'active'))).limit(1)).length > 0;
    await db.insert(enrollments).values({
      workspaceId: opp.workspaceId, opportunityId: opp.id, sequenceId: seq.id,
      status: hasMb ? 'active' : 'waiting_mailbox', nextRunAt: new Date(), unsubToken: token(18),
    }).onConflictDoNothing();
    await db.update(opportunities).set({ status: 'sequencing' }).where(eq(opportunities.id, opp.id));
  }
  // Wake waiting enrollments once a mailbox exists.
  const waiting = await db.select({ e: enrollments }).from(enrollments).where(eq(enrollments.status, 'waiting_mailbox')).limit(500);
  for (const { e } of waiting) {
    const [mb] = await db.select({ id: mailboxes.id }).from(mailboxes).where(and(eq(mailboxes.workspaceId, e.workspaceId), eq(mailboxes.status, 'active'))).limit(1);
    if (mb) await db.update(enrollments).set({ status: 'active', nextRunAt: new Date() }).where(eq(enrollments.id, e.id));
  }
}

/** Pick a mailbox with room today. Sticky per enrollment so a thread stays on one sender. */
async function pickMailbox(workspaceId: string, preferred: string | null, tz: string) {
  const today = todayIn(tz);
  const list = await db.select().from(mailboxes).where(and(eq(mailboxes.workspaceId, workspaceId), eq(mailboxes.status, 'active')));
  const room = (m: typeof mailboxes.$inferSelect) => {
    const day = Math.floor((Date.now() - m.warmupStartedAt.getTime()) / 86_400_000) + 1;
    const used = m.sentDay === today ? m.sentToday : 0;
    return dailyCap(day, m.capMax) - used;
  };
  const ready = (m: typeof mailboxes.$inferSelect) => room(m) > 0 && (!m.nextSendAt || m.nextSendAt <= new Date());
  if (preferred) {
    const p = list.find((m) => m.id === preferred);
    if (p) return ready(p) ? p : null; // wait for the same mailbox
  }
  return list.filter(ready).sort((a, b) => room(b) - room(a))[0] ?? null;
}

export async function runDue() {
  const due = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.status, 'active'), lte(enrollments.nextRunAt, new Date())))
    .orderBy(asc(enrollments.nextRunAt))
    .limit(100);
  for (const e of due) {
    try {
      await runStep(e);
    } catch (err) {
      log('send', 'step failed', { enrollment: e.id, error: (err as Error).message });
      await db.update(enrollments).set({ nextRunAt: new Date(Date.now() + 30 * 60_000) }).where(eq(enrollments.id, e.id));
    }
  }
}

async function runStep(e: typeof enrollments.$inferSelect) {
  const [ctx] = await db
    .select({ opp: opportunities, co: companies, ct: contacts, ws: workspaces, seq: sequences, sig: signals })
    .from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .innerJoin(workspaces, eq(workspaces.id, opportunities.workspaceId))
    .innerJoin(sequences, eq(sequences.id, e.sequenceId))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId))
    .leftJoin(signals, eq(signals.id, opportunities.signalId))
    .where(eq(opportunities.id, e.opportunityId));
  const stop = (reason: string, status: 'stopped' | 'done' = 'stopped') =>
    db.update(enrollments).set({ status, stoppedReason: reason, nextRunAt: null }).where(eq(enrollments.id, e.id));
  if (!ctx) return stop('missing data');
  const { opp, co, ct, ws, seq, sig } = ctx;
  if (!['trial', 'starter', 'pro', 'agency'].includes(ws.plan)) return db.update(enrollments).set({ status: 'paused', stoppedReason: 'plan inactive' }).where(eq(enrollments.id, e.id));
  if (['replied', 'meeting', 'won', 'lost'].includes(opp.status)) return stop(`opportunity ${opp.status}`);

  const step = seq.steps[e.stepIndex];
  if (!step) return stop('sequence finished', 'done');
  const advance = async (extra: Partial<typeof enrollments.$inferInsert> = {}) => {
    const next = seq.steps[e.stepIndex + 1];
    const started = extra.startedAt ?? e.startedAt ?? new Date();
    await db.update(enrollments).set({
      ...extra,
      stepIndex: e.stepIndex + 1,
      status: next ? 'active' : 'done',
      stoppedReason: next ? null : 'sequence finished',
      nextRunAt: next ? nextInWindow(addDays(started, next.day), windowOf(ws)) : null,
    }).where(eq(enrollments.id, e.id));
  };

  // LinkedIn and calls are tasks for the user (assisted mode is the default).
  if (step.channel !== 'email') {
    const title = step.channel === 'linkedin_invite' ? `Connect with ${ct?.name ?? 'contact'} on LinkedIn`
      : step.channel === 'linkedin_message' ? `Message ${ct?.name ?? 'contact'} on LinkedIn` : `Call ${ct?.name ?? 'contact'} at ${co.name}`;
    await db.insert(tasks).values({ workspaceId: ws.id, opportunityId: opp.id, enrollmentId: e.id, type: step.channel, title, note: `${step.brief}${ct?.linkedinUrl ? `\n${ct.linkedinUrl}` : ''}` });
    return advance();
  }

  if (!ct?.email) return stop('no email address');
  if (ct.emailStatus !== 'valid' && !(ct.emailStatus === 'catch_all' && process.env.ALLOW_CATCH_ALL === '1')) return stop(`email ${ct.emailStatus}`);
  if (await isSuppressed(ws.id, ct.email)) return stop('do not contact');
  const s = ws.sending;
  if (!s?.postalAddress?.trim() || !s?.optOutLine?.trim()) return db.update(enrollments).set({ status: 'paused', stoppedReason: 'add postal address and opt-out line' }).where(eq(enrollments.id, e.id));

  const win = windowOf(ws);
  if (!inWindow(new Date(), win)) {
    return db.update(enrollments).set({ nextRunAt: nextInWindow(new Date(), win) }).where(eq(enrollments.id, e.id));
  }
  const mb = await pickMailbox(ws.id, e.mailboxId, win.tz);
  if (!mb) return db.update(enrollments).set({ nextRunAt: new Date(Date.now() + 15 * 60_000) }).where(eq(enrollments.id, e.id));

  // Subject and body: step 1 is the approved draft; follow-ups are written now and must pass the checks.
  const prev = await db.select().from(messages).where(and(eq(messages.enrollmentId, e.id), eq(messages.direction, 'out'))).orderBy(asc(messages.at));
  let subject: string, body: string;
  const [d] = await db.select().from(drafts).where(and(eq(drafts.opportunityId, opp.id), eq(drafts.stepIndex, e.stepIndex)));
  if (d?.approvedAt) {
    subject = d.subject; body = d.body;
  } else if (e.stepIndex === 0) {
    return stop('first email not approved');
  } else {
    const [owner] = await db.select().from(users).where(eq(users.id, ws.ownerId));
    const checkBase = { companyName: co.name, domain: co.domain, contactRole: ct.role, signalLabel: sig?.label, emailStatus: ct.emailStatus, signature: s.signature, postalAddress: s.postalAddress, optOutLine: s.optOutLine };
    const w = await writeEmail({
      senderName: owner?.name ?? ws.name, senderCompany: ws.name, offer: ws.profile?.offer ?? '', proofPoint: ws.profile?.proofPoint ?? '',
      company: { name: co.name, domain: co.domain, industry: co.industry }, contact: { name: ct.name, role: ct.role },
      signal: { type: sig?.type ?? 'import', label: sig?.label ?? '', detail: sig?.detail },
      step: { index: e.stepIndex, brief: step.brief, sameThread: step.sameThread },
      previous: prev.map((p) => ({ subject: p.subject, body: p.body })),
    }, checkBase);
    await bumpUsage(ws.id, 'aiDrafts');
    // Follow-ups in the same thread may use a short subject; judge everything else.
    const checks = checkEmail({ ...checkBase, subject: step.sameThread ? 'same thread reply' : w.subject, body: w.body });
    if (!allPass(checks)) {
      await db.insert(drafts).values({ opportunityId: opp.id, stepIndex: e.stepIndex, subject: w.subject, body: w.body }).onConflictDoUpdate({ target: [drafts.opportunityId, drafts.stepIndex], set: { subject: w.subject, body: w.body } });
      await db.insert(tasks).values({ workspaceId: ws.id, opportunityId: opp.id, enrollmentId: e.id, type: 'review', title: `Review follow-up ${e.stepIndex + 1} to ${ct.name}`, note: checks.filter((c) => !c.pass).map((c) => c.label).join('; ') });
      return db.update(enrollments).set({ status: 'paused', stoppedReason: 'follow-up needs review' }).where(eq(enrollments.id, e.id));
    }
    subject = w.subject; body = w.body;
  }

  const first = prev[0];
  const last = prev[prev.length - 1];
  const threaded = step.sameThread && first;
  const finalSubject = threaded ? (/^re:/i.test(first.subject) ? first.subject : `Re: ${first.subject}`) : subject;
  const text = `${body.trim()}\n\n${footer(s.signature, s.postalAddress, s.optOutLine)}`;
  const sent = await sendMail(mb as unknown as MailboxRow, {
    to: ct.email,
    subject: finalSubject,
    text,
    inReplyTo: threaded ? last.messageId : null,
    references: threaded ? prev.map((p) => p.messageId!).filter(Boolean) : undefined,
    replyToProviderId: threaded ? last.providerId : null,
    headers: unsubscribeHeaders(APP_URL, e.unsubToken, mb.email),
  });

  const today = todayIn(win.tz);
  await db.insert(messages).values({ workspaceId: ws.id, enrollmentId: e.id, mailboxId: mb.id, direction: 'out', messageId: sent.messageId, providerId: sent.providerId, fromAddr: mb.email, toAddr: ct.email, subject: finalSubject, body: text });
  await db.update(mailboxes).set({
    sentDay: today, sentToday: mb.sentDay === today ? mb.sentToday + 1 : 1,
    nextSendAt: new Date(Date.now() + sendGapMs()), lastError: null,
    ...(sent.newSecretEnc ? { secretEnc: sent.newSecretEnc } : {}),
  }).where(eq(mailboxes.id, mb.id));
  await advance({ mailboxId: mb.id, threadMessageId: e.threadMessageId ?? sent.messageId, startedAt: e.startedAt ?? new Date() });
  log('send', 'sent', { to: ct.email, step: e.stepIndex });
}

