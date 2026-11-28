/**
 * End-to-end test of approve → send → LinkedIn task → reply handling, against a real Postgres
 * (TEST_DATABASE_URL) and a local SMTP server. Skipped when no test database is configured.
 */
import { SMTPServer } from 'smtp-server';
import { simpleParser } from 'mailparser';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const DB = process.env.TEST_DATABASE_URL;
const d = DB ? describe : describe.skip;

d('outreach flow', () => {
  const received: { to: string; raw: string }[] = [];
  let srv: SMTPServer;
  let port = 0;
  let ids: Record<string, string> = {};

  beforeAll(async () => {
    process.env.DATABASE_URL = DB;
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 3).toString('base64');
    srv = new SMTPServer({
      authOptional: true, secure: false, disabledCommands: ['STARTTLS'],
      onAuth: (_a, _s, cb) => cb(null, { user: 'x' }),
      onData: (stream, session, cb) => {
        let raw = '';
        stream.on('data', (c) => (raw += c));
        stream.on('end', () => { received.push({ to: session.envelope.rcptTo[0].address, raw }); cb(); });
      },
    });
    await new Promise<void>((r) => srv.listen(0, '127.0.0.1', () => r()));
    port = (srv.server.address() as { port: number }).port;

    const { db, users, workspaces, companies, contacts, signals, opportunities, drafts, mailboxes, sql } = await import('@frithly/db');
    const { encrypt } = await import('@frithly/core');
    await db.execute(sql`truncate users, workspaces, suppressions cascade`);
    const [u] = await db.insert(users).values({ email: 'akash@brightline.test', name: 'Akash' }).returning();
    const [ws] = await db.insert(workspaces).values({
      name: 'Brightline', ownerId: u.id, plan: 'starter', onboardedAt: new Date(),
      profile: { offer: 'outbound lists', proofPoint: 'Northwind booked 12 meetings', industries: [], sizes: [], countries: [], keywords: [], titles: ['VP Sales'], hiringRoles: [] },
      sending: { signature: 'Akash\nBrightline', postalAddress: '14 MG Road, Bengaluru', optOutLine: 'Reply "no" and I will not email again.', tz: 'UTC', days: [1, 2, 3, 4, 5, 6, 7], startHour: 0, endHour: 24 },
    }).returning();
    const [co] = await db.insert(companies).values({ workspaceId: ws.id, domain: 'acme.test', name: 'Acme' }).returning();
    const [ct] = await db.insert(contacts).values({ workspaceId: ws.id, companyId: co.id, name: 'Priya Raman', role: 'VP Sales', email: 'priya@acme.test', emailStatus: 'valid' }).returning();
    const [sg] = await db.insert(signals).values({ workspaceId: ws.id, companyId: co.id, type: 'hiring', label: 'Hiring 3 SDRs', fingerprint: 'h1' }).returning();
    const [op] = await db.insert(opportunities).values({ workspaceId: ws.id, companyId: co.id, contactId: ct.id, signalId: sg.id, status: 'approved', score: 80 }).returning();
    await db.insert(drafts).values({ opportunityId: op.id, stepIndex: 0, subject: 'your three sdr roles', body: 'Hi Priya,\nSaw Acme is hiring three SDRs.\nWorth a look?', approvedAt: new Date() });
    await db.insert(mailboxes).values({
      workspaceId: ws.id, email: 'akash@brightline.test', fromName: 'Akash', provider: 'smtp', secretEnc: encrypt('pw'),
      config: { smtpHost: '127.0.0.1', smtpPort: port, smtpSecure: false, imapHost: '127.0.0.1', imapPort: 1, imapSecure: false, user: 'akash' },
    });
    ids = { ws: ws.id, op: op.id };
  });

  afterAll(async () => {
    srv.close();
    const { client } = await import('@frithly/db');
    await client().end();
  });

  it('sends the approved first email with footer and unsubscribe headers', async () => {
    const { enrollApproved, runDue } = await import('./jobs/send');
    await enrollApproved();
    await runDue();
    expect(received).toHaveLength(1);
    const p = await simpleParser(received[0].raw);
    expect(p.subject).toBe('your three sdr roles');
    expect(p.text).toContain('14 MG Road, Bengaluru');
    expect(p.text).toContain('Reply "no"');
    expect(received[0].raw).toMatch(/List-Unsubscribe: <http[^>]+\/u\//);
    expect(received[0].raw).toContain('List-Unsubscribe-Post: List-Unsubscribe=One-Click');
  });

  it('creates a LinkedIn task for the next step', async () => {
    const { db, enrollments, tasks, eq } = await import('@frithly/db');
    await db.update(enrollments).set({ nextRunAt: new Date(Date.now() - 1000) }).where(eq(enrollments.opportunityId, ids.op));
    const { runDue } = await import('./jobs/send');
    await runDue();
    const t = await db.select().from(tasks).where(eq(tasks.workspaceId, ids.ws));
    expect(t.map((x) => x.type)).toEqual(['linkedin_invite']);
  });

  it('a "no" reply stops the sequence and adds to do-not-contact', async () => {
    const { db, enrollments, messages, mailboxes, opportunities, suppressions, eq } = await import('@frithly/db');
    const [out] = await db.select().from(messages).where(eq(messages.direction, 'out'));
    const [mb] = await db.select().from(mailboxes);
    const { handleIncoming } = await import('./jobs/poll');
    await handleIncoming(mb, [{ messageId: '<r1@acme.test>', inReplyTo: out.messageId, references: [], from: 'Priya@acme.test', to: mb.email, subject: 'Re: your three sdr roles', text: 'No\n\nOn Mon, Akash wrote:\n> hi', at: new Date() }]);
    const [e] = await db.select().from(enrollments).where(eq(enrollments.opportunityId, ids.op));
    expect(e.status).toBe('stopped');
    const [op] = await db.select().from(opportunities).where(eq(opportunities.id, ids.op));
    expect(op.status).toBe('lost');
    const s = await db.select().from(suppressions);
    expect(s.map((x) => [x.email, x.workspaceId === null])).toEqual([['priya@acme.test', false]]);
    const { isSuppressed } = await import('./lib');
    expect(await isSuppressed(ids.ws, 'PRIYA@acme.test')).toBe(true);
  });

  it('an opt-out goes on the global list', async () => {
    const { suppress, isSuppressed } = await import('./lib');
    await suppress(ids.ws, 'ravi@other.test', 'optout', true);
    expect(await isSuppressed('00000000-0000-0000-0000-000000000000', 'ravi@other.test')).toBe(true);
  });
});
