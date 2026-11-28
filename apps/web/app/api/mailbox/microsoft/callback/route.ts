import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { count, db, eq, mailboxes } from '@/lib/db';
import { encrypt, planLimits, safeEqual, type PlanKey } from '@frithly/core';
import { msExchangeCode, msMe } from '@frithly/engine';
import { requireWorkspace } from '@/lib/auth';

export async function GET(req: Request) {
  const { ws } = await requireWorkspace();
  const url = new URL(req.url);
  const back = (q: string) => NextResponse.redirect(new URL(`/app/settings?${q}`, process.env.APP_URL));
  const state = (await cookies()).get('fr_ms')?.value ?? '';
  const code = url.searchParams.get('code');
  if (!code || !state || !safeEqual(state, url.searchParams.get('state') ?? '')) return back('e=Microsoft+sign-in+was+cancelled+or+expired');
  const lim = planLimits((ws.plan === 'expired' ? 'trial' : ws.plan) as PlanKey, ws.addons);
  const [{ n }] = await db.select({ n: count() }).from(mailboxes).where(eq(mailboxes.workspaceId, ws.id));
  if (n >= lim.mailboxes) return back('e=Mailbox+limit+reached+for+your+plan');
  try {
    const t = await msExchangeCode(code, `${process.env.APP_URL}/api/mailbox/microsoft/callback`);
    const me = await msMe(t.access_token);
    const email = (me.mail ?? me.userPrincipalName).toLowerCase();
    await db.insert(mailboxes).values({ workspaceId: ws.id, email, fromName: me.displayName ?? null, provider: 'microsoft', config: {}, secretEnc: encrypt(t.refresh_token) })
      .onConflictDoUpdate({ target: [mailboxes.workspaceId, mailboxes.email], set: { secretEnc: encrypt(t.refresh_token), status: 'active', lastError: null } });
  } catch (e) {
    return back(`e=${encodeURIComponent((e as Error).message)}`);
  }
  return back('saved=mailbox');
}
