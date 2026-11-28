import Link from 'next/link';
import { redirect } from 'next/navigation';
import { sendCode, verifyCode } from '@/lib/auth';

async function requestCode(fd: FormData) {
  'use server';
  const email = String(fd.get('email') ?? '');
  const r = await sendCode(email);
  if (!r.ok) redirect(`/login?e=${encodeURIComponent(r.error)}&email=${encodeURIComponent(email)}`);
  redirect(`/login?step=code&email=${encodeURIComponent(email)}`);
}

async function checkCode(fd: FormData) {
  'use server';
  const email = String(fd.get('email') ?? '');
  const r = await verifyCode(email, String(fd.get('code') ?? ''));
  if (!r.ok) redirect(`/login?step=code&e=${encodeURIComponent(r.error)}&email=${encodeURIComponent(email)}`);
  redirect('/app');
}

export default async function Login({ searchParams }: { searchParams: Promise<{ step?: string; email?: string; e?: string }> }) {
  const sp = await searchParams;
  const code = sp.step === 'code';
  return (
    <div className="center">
      <div className="authcard stack">
        <Link href="/" className="brand" style={{ padding: 0 }}><img src="/logo.png" alt="" />Frithly</Link>
        <h1 style={{ fontSize: 24 }}>{code ? 'Check your email' : 'Sign in or start your trial'}</h1>
        <p className="mut">{code ? `We sent a 6-digit code to ${sp.email}. It works for 10 minutes.` : 'We’ll email you a 6-digit code. No password needed.'}</p>
        {sp.e && <div className="err">{sp.e}</div>}
        {code ? (
          <form action={checkCode} className="stack">
            <input type="hidden" name="email" value={sp.email ?? ''} />
            <label>Code<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus /></label>
            <button className="btn pri lg">Continue</button>
            <Link className="mut" href={`/login?email=${encodeURIComponent(sp.email ?? '')}`}>Use a different email or send a new code</Link>
          </form>
        ) : (
          <form action={requestCode} className="stack">
            <label>Work email<input name="email" type="email" autoComplete="email" defaultValue={sp.email} required autoFocus /></label>
            <button className="btn pri lg">Email me a code</button>
          </form>
        )}
      </div>
    </div>
  );
}
