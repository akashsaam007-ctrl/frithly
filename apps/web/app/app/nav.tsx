'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  ['/app', 'Today'],
  ['/app/companies', 'Companies'],
  ['/app/inbox', 'Inbox'],
  ['/app/tasks', 'Tasks'],
  ['/app/settings', 'Settings'],
  ['/app/billing', 'Plan & billing'],
] as const;

export function Nav() {
  const path = usePathname();
  return (
    <>
      {ITEMS.map(([href, label]) => {
        const on = href === '/app' ? path === '/app' || path.startsWith('/app/o/') : path.startsWith(href);
        return <Link key={href} href={href} className={`nav${on ? ' on' : ''}`}>{label}</Link>;
      })}
    </>
  );
}
