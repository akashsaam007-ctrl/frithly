import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { and, db, eq, gt, members, otpCodes, sessions, users, workspaces } from '@frithly/db';
import { otpCode, safeEqual, sha256, token } from '@frithly/core';
import { sendSystemMail } from './mailer';

const COOKIE = 'fr_s';
const SESSION_DAYS = 30;
const CODE_MINUTES = 10;

export const normEmail = (e: string) => e.trim().toLowerCase();
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

/** Send a 6-digit sign-in code. Max 5 codes per email per hour. */
export async function sendCode(rawEmail: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = normEmail(rawEmail);
  if (!validEmail(email)) return { ok: false, error: 'Enter a valid email address.' };
  const hourAgo = new Date(Date.now() - 3_600_000);
  const recent = await db.select({ id: otpCodes.id }).from(otpCodes).where(and(eq(otpCodes.email, email), gt(otpCodes.createdAt, hourAgo)));
  if (recent.length >= 5) return { ok: false, error: 'Too many codes requested. Try again in an hour.' };
  const code = otpCode();
  await db.insert(otpCodes).values({ email, codeHash: sha256(`${email}:${code}`), expiresAt: new Date(Date.now() + CODE_MINUTES * 60_000) });
  await sendSystemMail(email, `${code} is your Frithly code`, `Your Frithly sign-in code is ${code}\n\nIt works for ${CODE_MINUTES} minutes. If you didn't ask for it, ignore this email.`);
  return { ok: true };
}

/** Check the code; creates the user on first sign-in. Max 5 tries per code. */
export async function verifyCode(rawEmail: string, rawCode: string): Promise<{ ok: true; isNew: boolean } | { ok: false; error: string }> {
  const email = normEmail(rawEmail);
  const code = rawCode.replace(/\D/g, '');
  const [row] = await db.select().from(otpCodes)
    .where(and(eq(otpCodes.email, email), gt(otpCodes.expiresAt, new Date())))
    .orderBy(otpCodes.createdAt).limit(10)
    .then((r) => r.filter((x) => !x.usedAt).slice(-1));
  if (!row) return { ok: false, error: 'That code has expired. Ask for a new one.' };
  if (row.attempts >= 5) return { ok: false, error: 'Too many wrong tries. Ask for a new code.' };
  if (!safeEqual(row.codeHash, sha256(`${email}:${code}`))) {
    await db.update(otpCodes).set({ attempts: row.attempts + 1 }).where(eq(otpCodes.id, row.id));
    return { ok: false, error: 'That code is not right. Check the latest email.' };
  }
  await db.update(otpCodes).set({ usedAt: new Date() }).where(eq(otpCodes.id, row.id));
  let [u] = await db.select().from(users).where(eq(users.email, email));
  const isNew = !u;
  if (!u) [u] = await db.insert(users).values({ email }).returning();
  const t = token(32);
  await db.insert(sessions).values({ id: sha256(t), userId: u.id, expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) });
  (await cookies()).set(COOKIE, t, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 86_400 });
  return { ok: true, isNew };
}

export async function signOut() {
  const c = await cookies();
  const t = c.get(COOKIE)?.value;
  if (t) await db.delete(sessions).where(eq(sessions.id, sha256(t)));
  c.delete(COOKIE);
}

export async function currentUser() {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  const [r] = await db.select({ u: users, s: sessions }).from(sessions).innerJoin(users, eq(users.id, sessions.userId)).where(and(eq(sessions.id, sha256(t)), gt(sessions.expiresAt, new Date())));
  return r?.u ?? null;
}

async function load() {
  const user = await currentUser();
  if (!user) redirect('/login');
  const [m] = await db.select({ ws: workspaces }).from(members).innerJoin(workspaces, eq(workspaces.id, members.workspaceId)).where(eq(members.userId, user.id)).limit(1);
  return { user, ws: m?.ws ?? null };
}

/** Signed-in user and their (possibly missing) workspace. For onboarding. */
export const requireUser = load;

/** Signed-in user plus an onboarded workspace. Redirects to sign-in or onboarding as needed. */
export async function requireWorkspace() {
  const { user, ws } = await load();
  if (!ws || !ws.onboardedAt) redirect('/onboarding');
  return { user, ws };
}

export type WS = typeof workspaces.$inferSelect;
