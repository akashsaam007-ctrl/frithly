import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { token } from '@frithly/core';
import { msAuthUrl } from '@frithly/engine';
import { requireWorkspace } from '@/lib/auth';

export async function GET() {
  await requireWorkspace();
  const state = token(16);
  (await cookies()).set('fr_ms', state, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' });
  const redirectUri = `${process.env.APP_URL}/api/mailbox/microsoft/callback`;
  return NextResponse.redirect(msAuthUrl(state, redirectUri));
}
