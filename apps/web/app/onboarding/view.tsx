'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogoMark, Ico } from '@/components/icons';
import { finishOnboarding, readSite, type OnboardInput } from './actions';

const IND = ['SaaS', 'Fintech', 'Developer tools', 'Security', 'Logistics', 'Healthtech', 'Retail', 'Manufacturing', 'Agencies', 'Data'];
const SIZE = ['1-10', '11-50', '51-200', '201-1000', '1000+'];
const GEO = ['India', 'United States', 'United Kingdom', 'Europe', 'Middle East', 'Singapore', 'Australia'];
const MOMENTS: [string, string, string][] = [
  ['LEADERSHIP', 'New leaders', 'A new VP or Head of reviews tools and vendors in their first 90 days.'],
  ['HIRING_PAIN', 'Hiring and team-building', 'First hires in a function, roles stuck open 45+ days, migrations named in job posts.'],
  ['COMPETITOR_PAIN', 'Using a competitor', 'Job posts that name a tool you replace.'],
  ['TECH_SHIFT', 'Tool and tech changes', 'Tools added or dropped, new API or docs sites, launches, pricing changes.'],
  ['UPMARKET_PREP', 'Going upmarket', 'SSO, SOC 2, status pages and enterprise sales hires.'],
  ['EXPANSION', 'Funding and new regions', 'Fresh rounds and new country sites.'],
];

export function Onboarding({ initial, microsoft }: { initial: OnboardInput; microsoft: boolean }) {
  const router = useRouter();
  const [st, setSt] = useState(0);
  const [f, setF] = useState<OnboardInput>({ ...initial, tz: initial.tz || Intl.DateTimeFormat().resolvedOptions().timeZone });
  const [err, setErr] = useState('');
  const [reading, setReading] = useState(false);
  const [pct, setPct] = useState(10);
  const set = <K extends keyof OnboardInput>(k: K, v: OnboardInput[K]) => setF((x) => ({ ...x, [k]: v }));
  const tog = (k: 'industries' | 'sizes' | 'countries' | 'watch', v: string) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);
  const dots = <div className="row g6">{[0, 1, 2, 3].map((i) => <span key={i} style={{ height: 5, flex: 1, borderRadius: 3, background: i <= st ? 'var(--acc)' : '#EEEBF5' }} />)}</div>;
  const finish = async (thenMailbox: boolean) => {
    setErr('');
    const r = await finishOnboarding(f);
    if (r.err) { setErr(r.err); return; }
    setSt(4);
    const t = setInterval(() => setPct((p) => Math.min(100, p + 18)), 260);
    setTimeout(() => { clearInterval(t); router.push(thenMailbox ? '/app/outreach?mailbox=1' : '/app?welcome=1'); router.refresh(); }, 1600);
  };
  useEffect(() => { if (st === 1 && !f.titles) set('titles', 'Founder, CEO, Head of Sales'); }, [st]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="ob"><div className="obc fin">
      <div className="logo" style={{ padding: 0 }}><LogoMark />Frithly</div>
      {st < 4 && dots}
      {err && <div className="err">{err}</div>}
      {st === 0 && <>
        <h1 style={{ fontSize: 28 }}>Let’s find your first companies</h1>
        <p className="mut" style={{ margin: 0 }}>Tell us where you work. We’ll read your site to understand what you sell.</p>
        <form className="col g12" onSubmit={async (e) => { e.preventDefault(); if (!f.sells && f.site) { setReading(true); const r = await readSite(f.site); setReading(false); setF((x) => ({ ...x, company: x.company || r.name || '', sells: x.sells || r.sells || '' })); if (r.sells) return; } setSt(1); }}>
          <label className="lb">Your website<input className="inp" value={f.site} onChange={(e) => set('site', e.target.value)} required placeholder="yourcompany.com" style={{ fontSize: 16, padding: 12 }} /></label>
          <div className="grid"><label className="lb">Your name<input className="inp" value={f.name} onChange={(e) => set('name', e.target.value)} required /></label><label className="lb">Company name<input className="inp" value={f.company} onChange={(e) => set('company', e.target.value)} /></label></div>
          <label className="lb">What you sell, in one line<input className="inp" value={f.sells} onChange={(e) => set('sells', e.target.value)} placeholder={reading ? 'Reading your site…' : 'Leave empty and we’ll read your site'} /></label>
          <label className="lb">One proof point (a real result, optional)<input className="inp" value={f.proof} onChange={(e) => set('proof', e.target.value)} placeholder="Helped Northwind book 12 meetings in month one" /></label>
          <button className="btn p" disabled={reading} style={{ alignSelf: 'flex-start', padding: '11px 18px' }}>{reading ? 'Reading your site…' : f.sells ? 'Continue' : 'Read my site'}</button>
        </form>
      </>}
      {st === 1 && <>
        <h1 style={{ fontSize: 28 }}>Who do you sell to?</h1>
        <p className="mut" style={{ margin: 0 }}>Pick everything that fits. You can change this later in Settings.</p>
        <div className="col g8"><span className="xs b mut">Industries</span><div className="row wrap g8">{IND.map((x) => <button key={x} className={`opt ${f.industries.includes(x) ? 'on' : ''}`} onClick={() => tog('industries', x)}>{x}</button>)}</div></div>
        <div className="col g8"><span className="xs b mut">Company size</span><div className="row wrap g8">{SIZE.map((x) => <button key={x} className={`opt ${f.sizes.includes(x) ? 'on' : ''}`} onClick={() => tog('sizes', x)}>{x} people</button>)}</div></div>
        <div className="col g8"><span className="xs b mut">Where</span><div className="row wrap g8">{GEO.map((x) => <button key={x} className={`opt ${f.countries.includes(x) ? 'on' : ''}`} onClick={() => tog('countries', x)}>{x}</button>)}</div></div>
        <label className="lb">Who you email (job titles)<input className="inp" value={f.titles} onChange={(e) => set('titles', e.target.value)} /></label>
        <label className="lb">Roles that, when they hire for them, mean they need you<input className="inp" value={f.roles} onChange={(e) => set('roles', e.target.value)} placeholder="SDR, Account Executive, RevOps" /></label>
        <div className="row g8"><button className="btn" onClick={() => setSt(0)}>Back</button><button className="btn p" onClick={() => setSt(2)}>Continue</button></div>
      </>}
      {st === 2 && <>
        <h1 style={{ fontSize: 28 }}>Pick the moments to watch for</h1>
        <p className="mut" style={{ margin: 0 }}>Frithly checks for these every day and brings you the companies where they line up.</p>
        <div className="col g8">{MOMENTS.map(([k, n, why]) => <button key={k} className={`opt ${f.watch.includes(k) ? 'on' : ''}`} aria-pressed={f.watch.includes(k)} onClick={() => tog('watch', k)} style={{ fontWeight: 400 }}><span className="chip lav">{n}</span><span className="sm mut f1">{why}</span><span className="b">{f.watch.includes(k) ? '✓' : ''}</span></button>)}</div>
        <label className="lb">Competitors (we look for them in job posts)<input className="inp" value={f.competitors} onChange={(e) => set('competitors', e.target.value)} placeholder="Apollo, Outreach, Clay" /></label>
        <label className="lb">Companies you already want to watch (optional, one website per line)<textarea className="inp" rows={3} value={f.companies} onChange={(e) => set('companies', e.target.value)} placeholder={'acme.io\nnorthwind.com'} /></label>
        <div className="row g8"><button className="btn" onClick={() => setSt(1)}>Back</button><button className="btn p" onClick={() => setSt(3)}>Continue</button></div>
      </>}
      {st === 3 && <>
        <h1 style={{ fontSize: 28 }}>Connect the inbox you send from</h1>
        <p className="mut" style={{ margin: 0 }}>Emails go from your own mailbox, so replies come straight to you. The inbox you already use is ready today; a brand-new sending domain needs 2–3 weeks to warm up.</p>
        <div className="grid">
          <label className="lb">Business postal address · required<input className="inp" value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="Street, city, PIN" /></label>
          <label className="lb">Opt-out line<input className="inp" value={f.optout} onChange={(e) => set('optout', e.target.value)} /></label>
        </div>
        <div className="col g8">
          {microsoft && <button className="opt" onClick={async () => { await finish(false); window.location.href = '/api/mailbox/microsoft/start'; }}><Ico k="mail" /> Continue with Microsoft</button>}
          <button className="opt" onClick={() => finish(true)}><Ico k="mail" /> Google Workspace, Zoho or another provider</button>
        </div>
        <div className="row g8"><button className="btn" onClick={() => setSt(2)}>Back</button><button className="btn ml" onClick={() => finish(false)}>Skip for now</button></div>
      </>}
      {st === 4 && (
        <div className="col g12" style={{ alignItems: 'center', textAlign: 'center', padding: '20px 0' }}>
          <LogoMark />
          <h1 style={{ fontSize: 26 }}>Building your first list…</h1>
          <p className="mut" style={{ margin: 0 }}>Checking job posts, news and company sites{f.industries.length ? ` for ${f.industries.join(', ')}` : ''}.</p>
          <div className="bar" style={{ width: '100%', maxWidth: 360 }}><i style={{ width: `${pct}%` }} /></div>
        </div>
      )}
    </div></div>
  );
}
