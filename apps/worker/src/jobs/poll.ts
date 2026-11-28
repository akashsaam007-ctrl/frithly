import { and, contacts, db, enrollments, eq, inArray, mailboxes, messages, opportunities } from '@frithly/db';
import { GLOBAL_SUPPRESS, STOP_AND_DNC, addDays, quickClassify, type ReplyClass } from '@frithly/core';
import { classifyReply, fetchInbox, stripQuoted, type InMail, type MailboxRow } from '@frithly/engine';
import { log, suppress } from '../lib';

export async function pollAll() {
  const list = await db.select().from(mailboxes).where(eq(mailboxes.status, 'active'));
  for (const mb of list) {
    try {
      await pollMailbox(mb);
    } catch (err) {
      log('poll', 'mailbox failed', { mailbox: mb.email, error: (err as Error).message });
      await db.update(mailboxes).set({ lastError: (err as Error).message.slice(0, 300) }).where(eq(mailboxes.id, mb.id));
    }
  }
}

async function pollMailbox(mb: typeof mailboxes.$inferSelect) {
  const { mails, cursor, polledAt, newSecretEnc } = await fetchInbox(mb as unknown as MailboxRow);
  await handleIncoming(mb, mails);
  await db.update(mailboxes).set({ imapCursor: cursor, lastPolledAt: polledAt, lastError: null, ...(newSecretEnc ? { secretEnc: newSecretEnc } : {}) }).where(eq(mailboxes.id, mb.id));
}

/** Match incoming mail to our outreach, classify it, and act (stop, do-not-contact, global opt-out). */
export async function handleIncoming(mb: typeof mailboxes.$inferSelect, mails: InMail[]) {
  for (const m of mails) {
    if (m.from.toLowerCase() === mb.email.toLowerCase()) continue;
    const [dupe] = await db.select({ id: messages.id }).from(messages).where(and(eq(messages.workspaceId, mb.workspaceId), eq(messages.messageId, m.messageId)));
    if (dupe) continue;

    // Match to one of our sent emails by thread headers, then by sender address.
    const ids = [m.inReplyTo, ...m.references].filter(Boolean) as string[];
    let enrollmentId: string | null = null;
    if (ids.length) {
      const [hit] = await db.select({ e: messages.enrollmentId }).from(messages).where(and(eq(messages.workspaceId, mb.workspaceId), eq(messages.direction, 'out'), inArray(messages.messageId, ids))).limit(1);
      enrollmentId = hit?.e ?? null;
    }
    if (!enrollmentId) {
      const [hit] = await db.select({ e: messages.enrollmentId }).from(messages).where(and(eq(messages.workspaceId, mb.workspaceId), eq(messages.direction, 'out'), eq(messages.toAddr, m.from.toLowerCase()))).limit(1);
      enrollmentId = hit?.e ?? null;
    }
    const fresh = stripQuoted(m.text);
    let cls: ReplyClass = quickClassify(m.subject, fresh);
    // Bounces come from the mail system; find which of our recipients failed.
    let target = m.from.toLowerCase();
    if (cls === 'bounce') {
      const addrs = [...new Set((m.text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? []).map((a) => a.toLowerCase()))];
      if (addrs.length) {
        const [hit] = await db.select({ e: messages.enrollmentId, to: messages.toAddr }).from(messages).where(and(eq(messages.workspaceId, mb.workspaceId), eq(messages.direction, 'out'), inArray(messages.toAddr, addrs))).limit(1);
        if (hit) { enrollmentId = hit.e; target = hit.to; }
      }
    }
    if (!enrollmentId) continue; // not a reply to our outreach; leave the person's inbox alone
    if (cls === 'other') cls = await classifyReply(fresh);

    await db.insert(messages).values({
      workspaceId: mb.workspaceId, enrollmentId, mailboxId: mb.id, direction: 'in', messageId: m.messageId, providerId: m.providerId,
      inReplyTo: m.inReplyTo, fromAddr: m.from.toLowerCase(), toAddr: m.to, subject: m.subject, body: m.text.slice(0, 20000), classification: cls, at: m.at,
    }).onConflictDoNothing();

    const [e] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId));
    if (!e) continue;
    if (cls === 'out_of_office') {
      // Keep the sequence but give them room.
      if (e.status === 'active' && e.nextRunAt) await db.update(enrollments).set({ nextRunAt: addDays(e.nextRunAt, 5) }).where(eq(enrollments.id, e.id));
      continue;
    }
    // Any real reply stops the sequence.
    await db.update(enrollments).set({ status: 'stopped', stoppedReason: `reply: ${cls}`, nextRunAt: null }).where(eq(enrollments.id, e.id));
    const status = cls === 'meeting' ? 'meeting' : STOP_AND_DNC.includes(cls) ? 'lost' : 'replied';
    await db.update(opportunities).set({ status }).where(eq(opportunities.id, e.opportunityId));
    if (STOP_AND_DNC.includes(cls)) {
      await suppress(mb.workspaceId, target, cls, GLOBAL_SUPPRESS.includes(cls));
      if (cls === 'bounce') await db.update(contacts).set({ emailStatus: 'invalid' }).where(and(eq(contacts.workspaceId, mb.workspaceId), eq(contacts.email, target)));
    }
    log('poll', 'reply', { mailbox: mb.email, cls });
  }
}
