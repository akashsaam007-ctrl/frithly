'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Channel, SeqStep } from '@frithly/core/sequences';
import { Modal, TopBar, useShell } from '@/components/shell';
import { Ico } from '@/components/icons';
import { when } from '@/components/ui';
import { addMailbox, mailboxAct, presetSequence, saveSequence, setApproval } from '../actions';

interface Mb { id: string; email: string; provider: string; status: string; day: number; cap: number; max: number; error: string | null; dns: [boolean, boolean, boolean] }
interface Q { company: string; step: number; status: string; reason: string | null; next: string | null; mailbox: string | null }
const CH: [Channel, string][] = [['email', 'Email'], ['linkedin_invite', 'LinkedIn invite'], ['linkedin_message', 'LinkedIn message'], ['call_task', 'Call']];
const DNS_HELP = ['SPF: add a TXT record on your domain that includes your email provider (for Google: v=spf1 include:_spf.google.com ~all).', 'DKIM: turn on DKIM signing in your email admin console and add the TXT record it gives you.', 'DMARC: add a TXT record at _dmarc.yourdomain.com, for example v=DMARC1; p=none; rua=mailto:you@yourdomain.com'];

export function OutreachView(p: { steps: SeqStep[]; mailboxes: Mb[]; limit: number; approval: string; linkedinAuto: boolean; window: string; queue: Q[]; microsoft: boolean; openMailbox: boolean; flash: string | null }) {
  const { run, setModal, toast } = useShell();
  const router = useRouter();
  const [steps, setSteps] = useState(p.steps);
  const [dirty, setDirty] = useState(false);
  // Take fresh data from the server, but never over edits you haven't saved.
  const key = JSON.stringify(p.steps);
  useEffect(() => { if (!dirty) setSteps(p.steps); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const li = steps.some((s) => s.channel !== 'email');
  const upd = (i: number, x: Partial<SeqStep>) => { setSteps(steps.map((s, k) => (k === i ? { ...s, ...x } : s))); setDirty(true); };
  const connect = () => setModal(<Connect microsoft={p.microsoft} full={p.mailboxes.length >= p.limit} limit={p.limit} />);
  useEffect(() => { if (p.openMailbox) { connect(); router.replace('/app/outreach'); } if (p.flash) toast(p.flash); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <TopBar title="Outreach" sub={`Sending from your own mailboxes · ${p.mailboxes.length} connected · ${p.window}`} right={<button className="btn" onClick={connect}><Ico k="plus" s={16} /> Connect mailbox</button>} />
      <div className="content"><div className="row wrap g20" style={{ alignItems: 'flex-start' }}>
        <section className="card" style={{ flex: '999 1 560px', minWidth: 0, overflow: 'hidden' }} aria-label="Sequence">
          <div className="row wrap" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)' }}>
            <div className="col"><h2 style={{ fontSize: 17 }}>Default sequence</h2><span className="sm mut">{li ? 'Email + LinkedIn' : 'Email only'} · {steps.length} touches over {steps[steps.length - 1]?.day ?? 0} days · stops on any reply</span></div>
            <div className="seg ml" role="group" aria-label="Preset"><button className={li ? 'on' : ''} onClick={() => run(() => presetSequence('mix'))}>Email + LinkedIn</button><button className={!li ? 'on' : ''} onClick={() => run(() => presetSequence('email'))}>Email only</button></div>
          </div>
          <ol style={{ margin: 0, padding: '18px 20px', listStyle: 'none' }} className="col">
            {steps.map((s, i) => (
              <li key={i} className="row" style={{ alignItems: 'stretch', gap: 14 }}>
                <div className="col" style={{ alignItems: 'center', width: 34, flex: 'none' }}><span className={`av ${s.channel === 'email' ? 'lav' : 'li'}`} style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 13 }}>{i + 1}</span><span style={{ flex: 1, width: 2, background: i < steps.length - 1 ? '#ECE9F2' : 'transparent', minHeight: 12 }} /></div>
                <div className="card row wrap g8" style={{ flex: 1, minWidth: 0, padding: '10px 12px', marginBottom: 10, borderRadius: 12 }}>
                  <label className="sr" htmlFor={`sc${i}`}>Channel</label>
                  <select id={`sc${i}`} className="inp" value={s.channel} disabled={i === 0} onChange={(e) => upd(i, { channel: e.target.value as Channel })} style={{ width: 'auto', padding: '6px 8px' }}>{CH.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                  <label className="row g6 sm mut" htmlFor={`sd${i}`}>Day<input id={`sd${i}`} type="number" min={0} max={60} className="inp" value={s.day} disabled={i === 0} onChange={(e) => upd(i, { day: Math.max(1, Math.min(60, +e.target.value || 1)) })} style={{ width: 70, padding: '6px 8px' }} /></label>
                  <label className="sr" htmlFor={`sb${i}`}>What this step does</label>
                  <input id={`sb${i}`} className="inp f1" value={s.brief} onChange={(e) => upd(i, { brief: e.target.value })} style={{ minWidth: 180, padding: '6px 8px' }} />
                  <span className="xs mut hide-md">{s.channel !== "email" ? (s.channel === 'call_task' ? 'A task for you' : p.linkedinAuto ? 'Sends automatically' : 'You send in one click') : i === 0 ? 'You approve this one' : p.approval === 'every' ? 'You approve · same thread' : 'Same thread'}</span>
                  {i > 0 && <button className="ib" style={{ width: 30, height: 30 }} onClick={() => { setSteps(steps.filter((_, k) => k !== i)); setDirty(true); }} aria-label={`Remove step ${i + 1}`}><Ico k="x" s={14} /></button>}
                </div>
              </li>
            ))}
          </ol>
          <div className="row wrap sm mut" style={{ padding: '12px 20px', borderTop: '1px solid var(--line2)' }}>
            <span>During a trial, follow-ups run closer together so the sequence ends inside 14 days.</span>
            <button className="btn s ml" disabled={steps.length >= 9} onClick={() => { const l = steps[steps.length - 1]; setSteps([...steps, { channel: 'email', day: (l?.day ?? 0) + 4, brief: 'A different angle, or ask if someone else owns this' }]); setDirty(true); }}><Ico k="plus" s={14} /> Add step</button>
            {dirty && <button className="btn s p" onClick={async () => { const r = await run(() => saveSequence([...steps].sort((a, b) => a.day - b.day))); if (!r.err) setDirty(false); }}>Save sequence</button>}
          </div>
        </section>
        <div className="col g20" style={{ flex: '1 1 380px', minWidth: 0 }}>
          <section className="card pad col g12" aria-label="Mailboxes">
            <div className="row"><h2 style={{ fontSize: 17 }}>Mailboxes</h2><span className="sm mut ml">{p.mailboxes.length} of {p.limit} on your plan</span></div>
            {p.mailboxes.map((m) => {
              const ready = m.cap >= m.max;
              return (
                <div key={m.id} className="col g8" style={{ border: '1px solid var(--line2)', borderRadius: 12, padding: 12 }}>
                  <div className="row"><strong className="sm ell f1">{m.email}</strong><span className={`chip ${m.status !== 'active' ? 'gray' : ready ? 'mint' : 'lav'}`}>{m.status !== 'active' ? 'Paused' : ready ? 'Ready' : `Warm-up · day ${m.day} of 21`}</span></div>
                  <div className="bar" style={{ margin: 0 }}><i style={{ width: `${Math.min(100, (m.cap / m.max) * 100)}%`, background: ready ? 'var(--ok)' : 'var(--acc)' }} /></div>
                  {m.error && <span className="xs" style={{ color: 'var(--bad)' }}>Connection problem: {m.error}</span>}
                  <div className="row wrap xs mut">
                    <span>{ready ? `${m.max} a day` : `${m.cap} a day now → ${m.max}`}</span>
                    <span className="row g4 ml">{(['SPF', 'DKIM', 'DMARC'] as const).map((l, i) => m.dns[i] ? <span key={l} className="chip mint" style={{ borderRadius: 5 }}>{l} ✓</span> : <button key={l} className="chip pea" style={{ border: 0, borderRadius: 5 }} onClick={() => setModal(<Modal title={`Set up ${l} for ${m.email.split('@')[1]}`} foot={<button className="btn" onClick={() => setModal(null)}>Close</button>}><p style={{ margin: 0 }}>{DNS_HELP[i]}</p><p className="sm mut" style={{ margin: 0 }}>DNS changes can take up to an hour to show here. Missing records hurt delivery.</p></Modal>)}>{l} · fix</button>)}</span>
                    <button className="btn s" onClick={() => run(() => mailboxAct(m.id, m.status === 'active' ? 'pause' : 'resume'))}>{m.status === 'active' ? 'Pause' : 'Resume'}</button>
                    <button className="btn s" onClick={() => run(() => mailboxAct(m.id, 'remove'))}>Remove</button>
                  </div>
                </div>
              );
            })}
            {!p.mailboxes.length && <div className="empty">No mailbox yet. Approved emails wait safely until you connect one.</div>}
          </section>
          <section className="card pad col g8" aria-label="Approval">
            <h2 style={{ fontSize: 17, marginBottom: 4 }}>How much you approve</h2>
            {([['every', 'Approve every email', 'You review each first email and its follow-ups. Recommended while you start.'], ['first', 'Approve the first email only', 'Follow-ups that pass every check send on their own and stop on any reply.'], ['auto', 'Autopilot within limits', 'Sends companies that pass every check, inside your daily caps. Coming later.']] as const).map(([k, l, d]) => (
              <label key={k} className={`opt ${p.approval === k ? 'on' : ''}`} style={{ fontWeight: 400, alignItems: 'flex-start', opacity: k === 'auto' ? 0.6 : 1 }}>
                <input type="radio" name="appr" checked={p.approval === k} disabled={k === 'auto'} onChange={() => run(() => setApproval(k as 'every' | 'first'))} style={{ marginTop: 4, accentColor: 'var(--acc)' }} />
                <span><strong>{l}</strong><br /><span className="sm mut">{d}</span></span>
              </label>
            ))}
          </section>
          <section className="card pad col g8" aria-label="Queue">
            <div className="row"><h2 style={{ fontSize: 17 }}>Up next</h2><span className="sm mut ml">{p.queue.length} in progress</span></div>
            {p.queue.length ? p.queue.map((q, i) => (
              <div key={i} className="row sm" style={{ padding: '6px 0', borderTop: '1px solid var(--line2)' }}>
                <span><strong>{q.company}</strong> · step {q.step}</span>
                <span className="ml mut ell">{q.status === 'waiting_mailbox' ? 'Waiting for a mailbox' : q.status === 'paused' ? q.reason : q.next ? `${when(q.next)}${q.mailbox ? ` · ${q.mailbox}` : ''}` : ''}</span>
              </div>
            )) : <p className="sm mut" style={{ margin: 0 }}>Nothing queued. Approve companies on Today.</p>}
          </section>
        </div>
      </div></div>
    </>
  );
}

function Connect({ microsoft, full, limit }: { microsoft: boolean; full: boolean; limit: number }) {
  const { run, setModal } = useShell();
  const [existing, setExisting] = useState<boolean | null>(null);
  const [f, setF] = useState({ email: '', fromName: '', password: '', preset: 'google', smtpHost: '', smtpPort: '465', imapHost: '', user: '' });
  if (full) return <Modal title="Connect a mailbox" foot={<><button className="btn" onClick={() => setModal(null)}>Close</button><a className="btn p" href="/app/billing">Go to Billing</a></>}><p className="sm" style={{ margin: 0, color: 'var(--warn)' }}>You’re using all {limit} mailboxes on your plan. Add an extra mailbox in Billing.</p></Modal>;
  if (existing === null) return (
    <Modal title="Connect a mailbox" foot={<button className="btn" onClick={() => setModal(null)}>Cancel</button>}>
      <button className="opt" onClick={() => setExisting(true)}><span className="col"><strong>The inbox you already send from</strong><span className="sm mut" style={{ fontWeight: 400 }}>Ready today. Sends up to 40 a day from the start.</span></span><span className="chip mint ml">Recommended</span></button>
      <button className="opt" onClick={() => setExisting(false)}><span className="col"><strong>A new sending domain</strong><span className="sm mut" style={{ fontWeight: 400 }}>Keeps cold email off your main domain. Starts at 10 a day and builds up over 2–3 weeks.</span></span></button>
    </Modal>
  );
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title={existing ? 'Connect the inbox you send from' : 'Connect a new sending mailbox'} foot={<><button className="btn" onClick={() => setExisting(null)}>Back</button><button className="btn p" disabled={!f.email || !f.password} onClick={async () => { const r = await run(() => addMailbox({ ...f, existing: !!existing })); if (!r.err) setModal(null); }}>Test and connect</button></>}>
      {microsoft && <a className="opt" href="/api/mailbox/microsoft/start"><Ico k="mail" /> Continue with Microsoft 365 / Outlook</a>}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(200px,100%),1fr))' }}>
        <label className="lb">Email address<input className="inp" type="email" value={f.email} onChange={set('email')} /></label>
        <label className="lb">Name people see<input className="inp" value={f.fromName} onChange={set('fromName')} /></label>
        <label className="lb">Provider<select className="inp" value={f.preset} onChange={set('preset')}><option value="google">Google Workspace (app password)</option><option value="zoho">Zoho Mail</option><option value="custom">Other (enter servers)</option></select></label>
        <label className="lb">App password<input className="inp" type="password" autoComplete="new-password" value={f.password} onChange={set('password')} /></label>
        {f.preset === 'custom' && <>
          <label className="lb">SMTP host<input className="inp" value={f.smtpHost} onChange={set('smtpHost')} placeholder="smtp.example.com" /></label>
          <label className="lb">SMTP port<input className="inp" value={f.smtpPort} onChange={set('smtpPort')} /></label>
          <label className="lb">IMAP host<input className="inp" value={f.imapHost} onChange={set('imapHost')} placeholder="imap.example.com" /></label>
          <label className="lb">Login user (if different)<input className="inp" value={f.user} onChange={set('user')} /></label>
        </>}
      </div>
      <p className="xs mut" style={{ margin: 0 }}>We test sending and reading before saving. Passwords are encrypted. For Google Workspace, turn on 2-step verification and create an app password.</p>
    </Modal>
  );
}
