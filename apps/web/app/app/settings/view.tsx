'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUBTYPES, type Subtype } from '@frithly/core/scoring';
import type { Profile, Sending } from '@frithly/db/types';
import { TopBar, useShell } from '@/components/shell';
import { Ico } from '@/components/icons';
import { addDnc, cancelInvite, invite, removeDnc, removeMember, restartOnboarding, saveProfile, saveSignals } from '../actions';

const TABS: [string, string][] = [['profile', 'Profile'], ['signals', 'Signals'], ['dnc', 'Do-not-contact'], ['team', 'Team'], ['data', 'Your data']];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CATS: [string, string][] = [['LEADERSHIP', 'Leadership'], ['HIRING_PAIN', 'Hiring'], ['COMPETITOR_PAIN', 'Competitors'], ['TECH_SHIFT', 'Tools and tech'], ['UPMARKET_PREP', 'Going upmarket'], ['EXPANSION', 'Growth']];

export function SettingsView(p: { tab: string; me: string; ownerId: string; seats: number; ws: { name: string; website: string; profile: Profile | null; sending: Sending | null; unwatched: string[]; sender: string }; dnc: { id: string; email: string; reason: string; at: string }[]; team: { id: string; name: string; email: string; role: string }[]; invites: { id: string; email: string }[] }) {
  const { run } = useShell();
  const router = useRouter();
  const [tab, setTab] = useState(p.tab);
  const [dn, setDn] = useState(''); const [ie, setIe] = useState('');
  const pr = p.ws.profile, s = p.ws.sending;
  const submit = (fn: (fd: FormData) => Promise<{ msg?: string; err?: string }>) => (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const fd = new FormData(e.currentTarget); run(() => fn(fd)); };
  let body: React.ReactNode = null;
  if (tab === 'profile') body = (
    <form className="card pad col g12" style={{ maxWidth: 760 }} onSubmit={submit(saveProfile)}>
      <p className="sm mut" style={{ margin: 0 }}>Frithly uses this to pick companies and write drafts. Your proof point goes into every first draft.</p>
      <div className="grid"><label className="lb">Company name<input className="inp" name="name" defaultValue={p.ws.name} /></label><label className="lb">Website<input className="inp" name="site" defaultValue={p.ws.website} /></label></div>
      <label className="lb">What you sell<input className="inp" name="sells" defaultValue={pr?.offer} /></label>
      <label className="lb">Proof point · one line, real result<textarea className="inp" name="proof" rows={2} defaultValue={pr?.proofPoint} placeholder="e.g. We rebuilt Acme’s onboarding flow and trial-to-paid went from 9% to 14% in 6 weeks." /></label>
      <div className="grid"><label className="lb">Who you email (job titles)<input className="inp" name="titles" defaultValue={pr?.titles.join(', ')} /></label><label className="lb">Industries<input className="inp" name="industries" defaultValue={pr?.industries.join(', ')} /></label><label className="lb">Company sizes<input className="inp" name="sizes" defaultValue={pr?.sizes.join(', ')} placeholder="11-50, 51-200" /></label><label className="lb">Countries<input className="inp" name="countries" defaultValue={pr?.countries.join(', ')} /></label></div>
      <h3 style={{ marginTop: 6 }}>Sending</h3>
      <label className="lb">Signature<textarea className="inp" name="signature" rows={2} defaultValue={s?.signature} /></label>
      <div className="grid"><label className="lb">Postal address · required for cold email<input className="inp" name="address" defaultValue={s?.postalAddress} placeholder="Street, city, PIN" /></label><label className="lb">Opt-out line<input className="inp" name="optout" defaultValue={s?.optOutLine} /></label></div>
      <div className="grid">
        <label className="lb">Time zone<select className="inp" name="tz" defaultValue={s?.tz ?? 'UTC'}>{[...new Set([s?.tz ?? 'UTC', ...Intl.supportedValuesOf('timeZone')])].map((z) => <option key={z}>{z}</option>)}</select></label>
        <div className="row g8"><label className="lb">From<input className="inp" name="start" type="number" min={0} max={23} defaultValue={s?.startHour ?? 8} /></label><label className="lb">Until<input className="inp" name="end" type="number" min={1} max={24} defaultValue={s?.endHour ?? 17} /></label></div>
      </div>
      <div className="row wrap g8">{DAYS.map((d, i) => <label key={d} className="row g6 sm"><input type="checkbox" name="days" value={i + 1} defaultChecked={(s?.days ?? [1, 2, 3, 4, 5]).includes(i + 1)} style={{ accentColor: 'var(--acc)' }} />{d}</label>)}</div>
      <input type="hidden" name="sender" value={p.ws.sender} />
      <div><button className="btn p">Save profile</button></div>
    </form>
  );
  if (tab === 'signals') {
    const g = pr?.gate ?? {};
    body = (
      <form className="col g16" style={{ maxWidth: 900 }} onSubmit={submit(saveSignals)}>
        <div className="card pad col g12">
          <p className="sm mut" style={{ margin: 0 }}>A company reaches Today when its signals match a known pattern, one signal is strong enough on its own, or its signals add up to the minimum score across enough kinds. Newer signals count more: full points for 7 days, 65% to day 21, 35% to day 45, then nothing.</p>
          <div className="grid">
            <label className="lb">Competitors to look for in job posts<input className="inp" name="competitors" defaultValue={pr?.competitors?.join(', ')} placeholder="Apollo, Outreach, Clay" /></label>
            <label className="lb">Roles that point to a need<input className="inp" name="hiring" defaultValue={pr?.hiringRoles.join(', ')} placeholder="SDR, RevOps, Demand Generation" /></label>
            <label className="lb">Minimum score for a stack<input className="inp" name="minScore" type="number" min={20} max={200} defaultValue={g.minScore ?? 60} /></label>
            <label className="lb">Kinds of signal needed<input className="inp" name="minCategories" type="number" min={1} max={4} defaultValue={g.minCategories ?? 2} /></label>
            <label className="lb">Points for one signal to count alone<input className="inp" name="strongSingle" type="number" min={20} max={45} defaultValue={g.strongSingle ?? 35} /></label>
          </div>
          <label className="row g8 sm"><input type="checkbox" name="allowCombos" defaultChecked={g.allowCombos ?? true} style={{ accentColor: 'var(--acc)' }} />Known patterns qualify on their own (new sales leader + SDR hiring, funding + hiring, switching tools…)</label>
          <label className="row g8 sm"><input type="checkbox" name="allowSingle" defaultChecked={g.allowSingle ?? true} style={{ accentColor: 'var(--acc)' }} />Strong single signals qualify on their own</label>
          <p className="xs mut" style={{ margin: 0 }}>Companies are held back after layoffs, a sharp drop in job openings, if they’re a staffing agency, or for 45 days after you emailed or skipped them.</p>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="tw" style={{ border: 0, borderRadius: 0 }}><table className="tbl"><thead><tr><th>Signal</th><th>Kind</th><th>Points when fresh</th><th>Watch</th></tr></thead><tbody>
            {(Object.keys(SUBTYPES) as Subtype[]).filter((k) => SUBTYPES[k].category !== 'DISQUALIFIER').map((k) => (
              <tr key={k}><td>{SUBTYPES[k].label}</td><td className="sm mut">{CATS.find((c) => c[0] === SUBTYPES[k].category)?.[1]}</td><td><strong>{SUBTYPES[k].weight}</strong></td><td><label className="row g6 sm"><input type="checkbox" name="watch" value={k} defaultChecked={!p.ws.unwatched.includes(k)} style={{ accentColor: 'var(--acc)', width: 18, height: 18 }} /><span className="sr">Watch {SUBTYPES[k].label}</span></label></td></tr>
            ))}
          </tbody></table></div>
        </div>
        <div><button className="btn p">Save signal settings</button></div>
      </form>
    );
  }
  if (tab === 'dnc') body = (
    <div className="card pad col g12" style={{ maxWidth: 760 }}>
      <p className="sm mut" style={{ margin: 0 }}>Emails and domains here are never contacted. People who reply “no” are added automatically, and anyone who opts out is blocked for every Frithly user.</p>
      <form className="row g8" onSubmit={(e) => { e.preventDefault(); run(() => addDnc(dn)); setDn(''); }}><label className="sr" htmlFor="dn">Email or domain</label><input id="dn" className="inp f1" placeholder="name@company.com or company.com" value={dn} onChange={(e) => setDn(e.target.value)} required /><button className="btn p">Add</button></form>
      {p.dnc.map((d) => <div key={d.id} className="row sm" style={{ padding: '8px 0', borderTop: '1px solid var(--line2)' }}><span className="f1">{d.email.startsWith('@') ? `Everyone at ${d.email.slice(1)}` : d.email}</span><span className="chip gray">{({ manual: 'Added by you', not_interested: 'Said no', optout: 'Opted out', bounce: 'Bounced' } as Record<string, string>)[d.reason] ?? d.reason}</span><button className="btn s" onClick={() => run(() => removeDnc(d.id))}>Remove</button></div>)}
      {!p.dnc.length && <p className="sm mut" style={{ margin: 0 }}>Nobody yet.</p>}
    </div>
  );
  if (tab === 'team') body = (
    <div className="card pad col g12" style={{ maxWidth: 760 }}>
      <span className="sm mut">{p.team.length + p.invites.length} of {p.seats} seats used</span>
      {p.team.map((m) => <div key={m.id} className="row" style={{ padding: '8px 0', borderTop: '1px solid var(--line2)' }}><span className="av lav" style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 13 }}>{m.name[0]?.toUpperCase()}</span><div className="col f1"><strong className="sm">{m.name}</strong><span className="xs mut">{m.email}</span></div><span className="chip gray">{m.role}</span>{m.id !== p.ownerId && m.id !== p.me && <button className="btn s" onClick={() => run(() => removeMember(m.id))}>Remove</button>}</div>)}
      {p.invites.map((i) => <div key={i.id} className="row" style={{ padding: '8px 0', borderTop: '1px solid var(--line2)' }}><span className="av gray" style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 13 }}>{i.email[0]}</span><div className="col f1"><strong className="sm">{i.email}</strong><span className="xs mut">Invited · joins when they sign in</span></div><button className="btn s" onClick={() => run(() => cancelInvite(i.id))}>Cancel</button></div>)}
      <form className="row wrap g8" onSubmit={(e) => { e.preventDefault(); run(() => invite(ie)); setIe(''); }}><label className="sr" htmlFor="ie">Email</label><input id="ie" type="email" className="inp f1" placeholder="teammate@company.com" value={ie} onChange={(e) => setIe(e.target.value)} required style={{ minWidth: 220 }} /><button className="btn p" disabled={p.team.length + p.invites.length >= p.seats}>Invite</button></form>
    </div>
  );
  if (tab === 'data') body = (
    <div className="card pad col g12" style={{ maxWidth: 760 }}>
      <div className="row wrap"><div className="col f1"><strong>Export everything</strong><span className="sm mut">Companies, people, signals, emails, replies, deals and tasks as JSON.</span></div><a className="btn" href="/api/export/all"><Ico k="down" s={16} /> Export</a></div>
      <div className="row wrap" style={{ borderTop: '1px solid var(--line2)', paddingTop: 12 }}><div className="col f1"><strong>Show onboarding again</strong><span className="sm mut">Walk through setup from the start. Your data stays.</span></div><form action={restartOnboarding}><button className="btn">Start onboarding</button></form></div>
      <div className="row wrap" style={{ borderTop: '1px solid var(--line2)', paddingTop: 12 }}><div className="col f1"><strong>Delete your data</strong><span className="sm mut">Email privacy@frithly.com and we delete the workspace and everything in it within 30 days.</span></div></div>
    </div>
  );
  return (
    <>
      <TopBar title="Settings" sub="Make Frithly work your way" />
      <div className="content">
        <div className="tabs" role="tablist">{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); router.replace(`/app/settings?tab=${k}`, { scroll: false }); }}>{l}</button>)}</div>
        {body}
      </div>
    </>
  );
}
