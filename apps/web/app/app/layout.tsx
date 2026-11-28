import Link from 'next/link';
import { requireWorkspace } from '@/lib/auth';
import { Nav } from './nav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { ws } = await requireWorkspace();
  const trialLeft = ws.plan === 'trial' && ws.trialEndsAt ? Math.max(0, Math.ceil((ws.trialEndsAt.getTime() - Date.now()) / 86_400_000)) : null;
  return (
    <div className="shell">
      <aside className="rail">
        <Link href="/app" className="brand"><img src="/logo.png" alt="" />Frithly</Link>
        <Nav />
        <span className="sp" />
        {ws.plan === 'expired' ? (
          <Link href="/app/billing" className="pill r">Trial ended · choose a plan</Link>
        ) : trialLeft !== null ? (
          <Link href="/app/billing" className="pill v">Trial · {trialLeft} days left</Link>
        ) : (
          <span className="pill g">{ws.plan[0].toUpperCase() + ws.plan.slice(1)}</span>
        )}
        <form action="/api/auth/signout" method="post"><button className="btn gh s" style={{ width: '100%', marginTop: 8 }}>Sign out</button></form>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
