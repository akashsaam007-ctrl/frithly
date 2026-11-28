import nodemailer from 'nodemailer';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { decrypt, encrypt } from '@frithly/core';

export interface SmtpConfig {
  smtpHost: string; smtpPort: number; smtpSecure: boolean;
  imapHost: string; imapPort: number; imapSecure: boolean;
  user: string;
}

export interface MailboxRow {
  id: string;
  email: string;
  fromName: string | null;
  provider: 'smtp' | 'microsoft';
  config: Record<string, unknown>;
  secretEnc: string;
  imapCursor: number | null;
  lastPolledAt: Date | null;
}

export interface OutMail {
  to: string;
  subject: string;
  text: string;
  inReplyTo?: string | null;
  references?: string[];
  /** Graph id of the message we are replying to (Microsoft only). */
  replyToProviderId?: string | null;
  headers?: Record<string, string>;
}

export interface Sent { messageId: string; providerId?: string; newSecretEnc?: string }

/* ---------- Microsoft Graph ---------- */
const MS_SCOPES = 'offline_access https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/User.Read';

export function msAuthUrl(state: string, redirectUri: string) {
  const p = new URLSearchParams({
    client_id: process.env.MS_CLIENT_ID ?? '', response_type: 'code', redirect_uri: redirectUri,
    response_mode: 'query', scope: MS_SCOPES, state, prompt: 'select_account',
  });
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${p}`;
}

async function msToken(body: Record<string, string>) {
  const r = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: process.env.MS_CLIENT_ID ?? '', client_secret: process.env.MS_CLIENT_SECRET ?? '', scope: MS_SCOPES, ...body }),
  });
  const d = (await r.json()) as { access_token?: string; refresh_token?: string; error_description?: string };
  if (!d.access_token) throw new Error(`Microsoft sign-in failed: ${d.error_description ?? r.status}`);
  return d as { access_token: string; refresh_token: string };
}

export const msExchangeCode = (code: string, redirectUri: string) => msToken({ grant_type: 'authorization_code', code, redirect_uri: redirectUri });

async function msAccess(mb: MailboxRow) {
  const t = await msToken({ grant_type: 'refresh_token', refresh_token: decrypt(mb.secretEnc) });
  return { access: t.access_token, newSecretEnc: t.refresh_token ? encrypt(t.refresh_token) : undefined };
}

async function graph<T>(access: string, path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...init,
    headers: { authorization: `Bearer ${access}`, 'content-type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!r.ok) throw new Error(`Graph ${r.status}: ${(await r.text()).slice(0, 300)}`);
  return (r.status === 202 || r.status === 204 ? {} : await r.json()) as T;
}

export async function msMe(access: string) {
  return graph<{ mail?: string; userPrincipalName: string; displayName?: string }>(access, '/me');
}

/* ---------- Send ---------- */
export async function sendMail(mb: MailboxRow, m: OutMail): Promise<Sent> {
  if (mb.provider === 'microsoft') {
    const { access, newSecretEnc } = await msAccess(mb);
    const headers = Object.entries(m.headers ?? {}).filter(([k]) => /^x-/i.test(k)).map(([name, value]) => ({ name, value }));
    let draft: { id: string; internetMessageId: string };
    if (m.replyToProviderId) {
      draft = await graph(access, `/me/messages/${m.replyToProviderId}/createReply`, { method: 'POST', body: '{}' });
      await graph(access, `/me/messages/${draft.id}`, { method: 'PATCH', body: JSON.stringify({ body: { contentType: 'Text', content: m.text } }) });
    } else {
      draft = await graph(access, '/me/messages', {
        method: 'POST',
        body: JSON.stringify({
          subject: m.subject,
          body: { contentType: 'Text', content: m.text },
          toRecipients: [{ emailAddress: { address: m.to } }],
          ...(headers.length ? { internetMessageHeaders: headers } : {}),
        }),
      });
    }
    await graph(access, `/me/messages/${draft.id}/send`, { method: 'POST' });
    return { messageId: draft.internetMessageId, providerId: draft.id, newSecretEnc };
  }
  const c = mb.config as unknown as SmtpConfig;
  const t = nodemailer.createTransport({ host: c.smtpHost, port: c.smtpPort, secure: c.smtpSecure, auth: { user: c.user, pass: decrypt(mb.secretEnc) } });
  const info = await t.sendMail({
    from: mb.fromName ? { name: mb.fromName, address: mb.email } : mb.email,
    to: m.to,
    subject: m.subject,
    text: m.text,
    inReplyTo: m.inReplyTo ?? undefined,
    references: m.references,
    headers: m.headers,
  });
  return { messageId: info.messageId };
}

/** Log in to SMTP and IMAP without sending anything. Throws with a readable message. */
export async function testSmtpImap(c: SmtpConfig, password: string) {
  const t = nodemailer.createTransport({ host: c.smtpHost, port: c.smtpPort, secure: c.smtpSecure, auth: { user: c.user, pass: password } });
  await t.verify().catch((e: Error) => { throw new Error(`Sending (SMTP) login failed: ${e.message}`); });
  const imap = new ImapFlow({ host: c.imapHost, port: c.imapPort, secure: c.imapSecure, auth: { user: c.user, pass: password }, logger: false });
  await imap.connect().catch((e: Error) => { throw new Error(`Reading (IMAP) login failed: ${e.message}`); });
  await imap.logout();
}

/* ---------- Read replies ---------- */
export interface InMail {
  messageId: string; providerId?: string; inReplyTo: string | null; references: string[];
  from: string; to: string; subject: string; text: string; at: Date;
}

export async function fetchInbox(mb: MailboxRow): Promise<{ mails: InMail[]; cursor: number | null; polledAt: Date; newSecretEnc?: string }> {
  const polledAt = new Date();
  const since = mb.lastPolledAt ?? new Date(Date.now() - 3 * 86_400_000);
  if (mb.provider === 'microsoft') {
    const { access, newSecretEnc } = await msAccess(mb);
    const q = new URLSearchParams({
      $filter: `receivedDateTime ge ${new Date(since.getTime() - 10 * 60_000).toISOString()}`,
      $select: 'id,internetMessageId,subject,from,toRecipients,body,receivedDateTime,internetMessageHeaders',
      $top: '50',
    });
    const d = await graph<{ value: { id: string; internetMessageId: string; subject: string; from?: { emailAddress: { address: string } }; toRecipients: { emailAddress: { address: string } }[]; body: { content: string; contentType: string }; receivedDateTime: string; internetMessageHeaders?: { name: string; value: string }[] }[] }>(
      access, `/me/mailFolders/inbox/messages?${q}`, { headers: { Prefer: 'outlook.body-content-type="text"' } },
    );
    const mails = d.value.map((v) => {
      const h = (n: string) => v.internetMessageHeaders?.find((x) => x.name.toLowerCase() === n)?.value ?? null;
      return {
        messageId: v.internetMessageId, providerId: v.id,
        inReplyTo: h('in-reply-to'), references: (h('references') ?? '').split(/\s+/).filter(Boolean),
        from: v.from?.emailAddress.address ?? '', to: v.toRecipients[0]?.emailAddress.address ?? mb.email,
        subject: v.subject ?? '', text: v.body.content, at: new Date(v.receivedDateTime),
      };
    });
    return { mails, cursor: mb.imapCursor, polledAt, newSecretEnc };
  }
  const c = mb.config as unknown as SmtpConfig;
  const imap = new ImapFlow({ host: c.imapHost, port: c.imapPort, secure: c.imapSecure, auth: { user: c.user, pass: decrypt(mb.secretEnc) }, logger: false });
  await imap.connect();
  const mails: InMail[] = [];
  let cursor = mb.imapCursor;
  const lock = await imap.getMailboxLock('INBOX');
  try {
    const range = cursor ? { uid: `${cursor + 1}:*` } : { since };
    for await (const msg of imap.fetch(range, { uid: true, source: true }, { uid: true })) {
      if (cursor && msg.uid <= cursor) continue;
      if (!msg.source) continue;
      const p = await simpleParser(msg.source);
      const refs = Array.isArray(p.references) ? p.references : p.references ? [p.references] : [];
      mails.push({
        messageId: p.messageId ?? `uid-${msg.uid}@${c.imapHost}`,
        inReplyTo: p.inReplyTo ?? null,
        references: refs,
        from: p.from?.value[0]?.address ?? '',
        to: mb.email,
        subject: p.subject ?? '',
        text: (p.text ?? '').slice(0, 20000),
        at: p.date ?? new Date(),
      });
      cursor = Math.max(cursor ?? 0, msg.uid);
    }
  } finally {
    lock.release();
    await imap.logout();
  }
  return { mails, cursor, polledAt };
}

/** Drop the quoted earlier thread so classification only sees the new reply. */
export function stripQuoted(text: string) {
  const lines = text.split(/\r?\n/);
  const cut = lines.findIndex((l) => /^On .+wrote:$/.test(l.trim()) || /^-{2,}\s*Original Message/i.test(l) || /^From: /.test(l) || l.startsWith('>'));
  return (cut > 0 ? lines.slice(0, cut) : lines).join('\n').trim();
}
