'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { ShellCtx } from '@/lib/ctx';
import { clearNotes } from '@/app/app/actions';
import { Ico, LogoMark } from './icons';

export const NAV: ([string, string, string] | 0)[] = [
  ['today', 'Today', '/app'], ['inbox', 'Inbox', '/app/inbox'], ['companies', 'Companies', '/app/companies'], ['people', 'People', '/app/people'],
  ['deals', 'Deals', '/app/deals'], ['tasks', 'Tasks', '/app/tasks'], 0, ['enrich', 'Find & enrich', '/app/enrich'], ['outreach', 'Outreach', '/app/outreach'],
  ['analytics', 'Analytics', '/app/analytics'], 0, ['integrations', 'Integrations', '/app/integrations'], ['settings', 'Settings', '/app/settings'], ['billing', 'Billing', '/app/billing'],
];
const fmt = (n: number) => n.toLocaleString('en-US');

interface Toast { t: string; undo?: () => void | Promise<unknown> }
interface Shell {
  ctx: ShellCtx;
  toast: (t: string, undo?: Toast['undo']) => void;
  /** Run a server action, refresh the page data, show its message. */
  run: <T extends { msg?: string; err?: string } | void>(fn: () => Promise<T>, undo?: Toast['undo']) => Promise<T>;
  pending: boolean;
  openPalette: () => void;
  modal: React.ReactNode; setModal: (m: React.ReactNode) => void;
}
const C = createContext<Shell | null>(null);
export const useShell = () => useContext(C)!;

export function ShellRoot({ ctx, children }: { ctx: ShellCtx; children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [toastS, setToast] = useState<Toast | null>(null);
  const [pal, setPal] = useState(false);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<React.ReactNode>(null);
  const [pending, start] = useTransition();
  const tt = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toast = useCallback((t: string, undo?: Toast['undo']) => {
    setToast({ t, undo }); clearTimeout(tt.current); tt.current = setTimeout(() => setToast(null), 5000);
  }, []);
  const run: Shell['run'] = useCallback(async (fn, undo) => {
    const r = await fn();
    const res = r as { msg?: string; err?: string } | undefined;
    if (res?.err) toast(res.err); else if (res?.msg) toast(res.msg, undo);
    start(() => router.refresh());
    return r;
  }, [router, toast]);

  // Global keys: ⌘K, Esc, G then a letter, ?
  useEffect(() => {
    let g = false, gt: ReturnType<typeof setTimeout>;
    const h = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement)?.tagName ?? '');
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPal((p) => !p); return; }
      if (e.key === 'Escape') { setPal(false); setModal(null); setMenu(false); return; }
      if (typing || pal || modal) return;
      if (g) { g = false; const m: Record<string, string> = { t: '/app', i: '/app/inbox', c: '/app/companies', d: '/app/deals', a: '/app/analytics', s: '/app/settings' }; if (m[e.key]) router.push(m[e.key]); return; }
      if (e.key === 'g') { g = true; clearTimeout(gt); gt = setTimeout(() => (g = false), 900); return; }
      if (e.key === '?') setModal(<Keys />);
    };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [pal, modal, router]);
  useEffect(() => { setMenu(false); }, [path]);

  const value = useMemo(() => ({ ctx, toast, run, pending, openPalette: () => setPal(true), modal, setModal }), [ctx, toast, run, pending, modal]);
  const m = ctx.meter;
  const on = (href: string) => (href === '/app' ? path === '/app' : path.startsWith(href));
  const count = (k: string) => (k === 'today' ? ctx.counts.today : k === 'inbox' ? ctx.counts.inbox : k === 'tasks' ? ctx.counts.tasks : 0) || '';
  return (
    <C.Provider value={value}>
      <div className="app">
        <aside className={`side ${menu ? 'open' : ''}`} aria-label="Main">
          <div className="logo"><LogoMark />Frithly</div>
          <Link className="ws" href="/app/settings"><span className="wsa">{ctx.ws.name[0] ?? 'F'}</span><span className="col f1" style={{ lineHeight: 1.25 }}><strong className="sm ell">{ctx.ws.name}</strong><span className="xs mut">{ctx.ws.planName}{ctx.ws.trialLeft !== null ? ` · ${ctx.ws.trialLeft} days left` : ` · ${ctx.ws.seats} seat${ctx.ws.seats > 1 ? 's' : ''}`}</span></span></Link>
          <nav className="col" style={{ gap: 1 }}>
            {NAV.map((n, i) => n ? (
              <Link key={n[0]} className={`nv ${on(n[2]) ? 'on' : ''}`} href={n[2]} aria-current={on(n[2]) ? 'page' : undefined}><Ico k={n[0]} /><span>{n[1]}</span><span className="n">{count(n[0])}</span></Link>
            ) : <div key={i} className="sep" />)}
          </nav>
          <div className="col g8" style={{ marginTop: 'auto', paddingTop: 12 }}>
            <Link className="meter" href="/app/billing">
              <div className="row"><strong style={{ color: 'var(--ink)' }}>{fmt(m.used)} of {fmt(m.limit)}</strong><span className="ml">companies</span></div>
              <div className="bar"><i style={{ width: `${Math.min(100, (m.used / Math.max(1, m.limit)) * 100)}%` }} /></div>
              <div className="row"><strong style={{ color: 'var(--ink)' }}>{fmt(m.credits)} of {fmt(m.creditsTotal)}</strong><span className="ml">credits left</span></div>
              <div className="bar"><i style={{ width: `${Math.min(100, (m.credits / Math.max(1, m.creditsTotal)) * 100)}%`, background: '#B9A6FF' }} /></div>
              <span>Resets {m.resets}</span>
            </Link>
            <div className="row" style={{ padding: '4px 6px' }}>
              <span className="av lav" style={{ width: 30, height: 30, borderRadius: '50%', fontSize: 13 }}>{ctx.user.name[0]?.toUpperCase()}</span>
              <span className="col f1" style={{ lineHeight: 1.25 }}><strong className="sm ell">{ctx.user.name}</strong><span className="xs mut ell">{ctx.user.email}</span></span>
              <form action="/api/auth/signout" method="post"><button className="btn s" title="Sign out">Sign out</button></form>
            </div>
          </div>
        </aside>
        <main className="main" id="main">
          <MenuCtx.Provider value={() => setMenu((x) => !x)}>{children}</MenuCtx.Provider>
        </main>
      </div>
      {menu && <div className="scrim" style={{ zIndex: 24, padding: 0 }} onClick={() => setMenu(false)} />}
      {modal && <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>{modal}</div>}
      {pal && <Palette ctx={ctx} close={() => setPal(false)} onKeys={() => { setPal(false); setModal(<Keys />); }} />}
      {toastS && <div className="toast" role="status"><span>{toastS.t}</span>{toastS.undo && <button onClick={async () => { const u = toastS.undo; setToast(null); await u?.(); start(() => router.refresh()); }}>Undo</button>}</div>}
    </C.Provider>
  );
}

const MenuCtx = createContext<() => void>(() => {});

export function TopBar({ title, sub, right }: { title: string; sub?: React.ReactNode; right?: React.ReactNode }) {
  const { ctx, openPalette, run } = useShell();
  const toggleMenu = useContext(MenuCtx);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.pop,.ib')) setOpen(false); };
    document.addEventListener('click', h); return () => document.removeEventListener('click', h);
  }, [open]);
  return (
    <header className="top">
      <button className="ib menu-btn" onClick={toggleMenu} aria-label="Open menu"><Ico k="menu" /></button>
      <div className="col" style={{ minWidth: 0 }}><h1>{title}</h1>{sub && <span className="sm mut">{sub}</span>}</div>
      <button className="srch ml" onClick={openPalette}><Ico k="search" s={16} /><span className="f1 sm" style={{ textAlign: 'left' }}>Search or run a command</span><span className="kbd">⌘K</span></button>
      {right}
      <div style={{ position: 'relative' }}>
        <button className="ib" onClick={() => setOpen((o) => !o)} aria-label="Notifications" aria-expanded={open}><Ico k="bell" />{ctx.notes.length > 0 && <span className="dot" />}</button>
        {open && (
          <div className="pop fin">
            <div className="row" style={{ padding: '6px 8px' }}><strong>Notifications</strong>{ctx.notes.length > 0 && <button className="btn s ml" onClick={() => { setOpen(false); run(() => clearNotes()); }}>Clear all</button>}</div>
            {ctx.notes.length ? ctx.notes.map((n, i) => (
              <button key={i} className="pi" style={{ borderRadius: 8, flexDirection: 'column', gap: 2 }} onClick={() => { setOpen(false); router.push(n.href); }}><span className="sm">{n.t}</span><span className="xs mut">{new Date(n.w).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></button>
            )) : <p className="sm mut" style={{ padding: 8 }}>You’re all caught up.</p>}
          </div>
        )}
      </div>
    </header>
  );
}

function Palette({ ctx, close, onKeys }: { ctx: ShellCtx; close: () => void; onKeys: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const items: [string, string, () => void][] = [
    ['Approve top 5', 'Action', () => router.push('/app?top5=1')],
    ['Connect a mailbox', 'Action', () => router.push('/app/outreach?mailbox=1')],
    ['New deal', 'Action', () => router.push('/app/deals?new=1')],
    ['Look up a company', 'Action', () => router.push('/app/enrich')],
    ['Keyboard shortcuts', 'Action', onKeys],
    ['Export companies', 'Action', () => { window.location.href = '/api/export/companies'; }],
    ...NAV.filter(Boolean).map((n) => { const [, l, h] = n as [string, string, string]; return [`Go to ${l}`, 'Page', () => router.push(h)] as [string, string, () => void]; }),
    ...ctx.companies.map((c) => [c.name, 'Company', () => router.push(`/app/companies?open=${c.id}`)] as [string, string, () => void]),
  ];
  const list = items.filter((x) => !q || x[0].toLowerCase().includes(q.toLowerCase())).slice(0, 12);
  const pick = (k: number) => { const it = list[k]; if (!it) return; close(); it[2](); };
  return (
    <div className="scrim" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="modal pal fin" role="dialog" aria-modal="true" aria-label="Command menu">
        <label className="sr" htmlFor="palq">Search</label>
        <input id="palq" autoFocus value={q} placeholder="Search companies, pages or actions" autoComplete="off"
          onChange={(e) => { setQ(e.target.value); setI(0); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(list.length - 1, x + 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
            if (e.key === 'Enter') { e.preventDefault(); pick(i); }
          }} />
        <div style={{ padding: '6px 0' }} role="listbox">
          {list.map((x, k) => <button key={k} className={`pi ${k === i ? 'on' : ''}`} role="option" aria-selected={k === i} onClick={() => pick(k)}><span>{x[0]}</span><span className="xs mut">{x[1]}</span></button>)}
          {!list.length && <p className="sm mut" style={{ padding: '8px 20px' }}>No results.</p>}
        </div>
        <div className="xs mut" style={{ padding: '8px 20px', borderTop: '1px solid var(--line2)' }}>↑ ↓ to move · Enter to run · Esc to close</div>
      </div>
    </div>
  );
}

export function Modal({ title, children, foot }: { title: string; children: React.ReactNode; foot: React.ReactNode }) {
  return (
    <div className="modal fin" role="dialog" aria-modal="true" aria-labelledby="mh">
      <div className="mh"><h2 id="mh" style={{ fontSize: 19 }}>{title}</h2></div>
      <div className="mb">{children}</div>
      <div className="mf">{foot}</div>
    </div>
  );
}

function Keys() {
  const { setModal } = useShell();
  const K = [['⌘K / Ctrl K', 'Search and commands'], ['J / K', 'Next / previous company'], ['A', 'Approve'], ['S', 'Skip'], ['N', 'Not a fit'], ['G then T', 'Go to Today'], ['G then I', 'Go to Inbox'], ['?', 'This list'], ['Esc', 'Close']];
  return (
    <Modal title="Keyboard shortcuts" foot={<button className="btn" onClick={() => setModal(null)}>Close</button>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }} className="sm">
        {K.map((k) => [<span key={k[0]} className="kbd" style={{ justifySelf: 'start', fontSize: 12.5, padding: '1px 7px' }}>{k[0]}</span>, <span key={k[1]}>{k[1]}</span>])}
      </div>
    </Modal>
  );
}
