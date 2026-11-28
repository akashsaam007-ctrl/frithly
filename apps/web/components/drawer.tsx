'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { checkEmail, type CheckResult } from '@frithly/core/checks';
import type { Account } from '@/lib/accounts';
import { approve, approveFollowup, findEmail, restore, rewriteDraft, saveDraft, skip, useContact } from '@/app/app/actions';
import { useShell } from './shell';
import { Ico } from './icons';
import { Av, CHIP, STATUS, tcls, when } from './ui';

export function Checks({ ck }: { ck: CheckResult[] }) {
  const ok = ck.filter((x) => x.pass).length;
  return (
    <div className="card pad col g6" style={{ padding: 12 }}>
      <div className="row sm"><strong>Before you send</strong><span className="ml b" style={{ color: ok === ck.length ? 'var(--ok)' : 'var(--warn)' }}>{ok}/{ck.length}</span></div>
      {ck.filter((x) => !x.pass).map((x) => <div key={x.id} className="row sm" style={{ alignItems: 'flex-start' }}><span className="ck n">!</span><span className="f1">{x.label}<br /><span className="xs mut">{x.tip}</span></span></div>)}
      {ck.filter((x) => x.pass).map((x) => <div key={x.id} className="row sm"><span className="ck y">✓</span><span>{x.label}</span></div>)}
    </div>
  );
}

/** The live check, run in the browser on every keystroke; the server re-checks on approve. */
export function useDraft(a: Account) {
  const [subject, setSubject] = useState(a.draft?.subject ?? '');
  const [body, setBody] = useState(a.draft?.body ?? '');
  useEffect(() => { setSubject(a.draft?.subject ?? ''); setBody(a.draft?.body ?? ''); }, [a.id, a.draft?.subject, a.draft?.body]);
  const ck = useMemo(() => checkEmail({ ...a.base, emailStatus: a.base.emailStatus as never, subject, body }), [a.base, subject, body]);
  return { subject, setSubject, body, setBody, ck, all: ck.every((x) => x.pass) && !!body };
}

export function Drawer({ a, onDone }: { a: Account; onDone?: () => void }) {
  const { run } = useShell();
  const [tab, setTab] = useState<'draft' | 'sig' | 'people' | 'act'>('draft');
  const d = useDraft(a);
  const saveT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const autosave = (s: string, b: string) => { clearTimeout(saveT.current); saveT.current = setTimeout(() => { if (a.draft) saveDraft(a.id, 0, s, b); }, 800); };
  const [fs, setFs] = useState(a.pending?.subject ?? ''); const [fb, setFb] = useState(a.pending?.body ?? '');
  useEffect(() => { setFs(a.pending?.subject ?? ''); setFb(a.pending?.body ?? ''); }, [a.id, a.pending?.body, a.pending?.subject]);
  const fck = useMemo(() => checkEmail({ ...a.base, emailStatus: a.base.emailStatus as never, subject: fs || 'same thread reply', body: fb }), [a.base, fs, fb]);
  const isNew = ['new', 'saved'].includes(a.status);
  const li = a.seq.some((s) => s.channel !== 'email');
  const ok = d.ck.filter((x) => x.pass).length;

  return (
    <aside className="drawer fin" aria-label="Company details">
      <div className="hd">
        <div className="row"><Av a={a} s={44} /><div className="col" style={{ minWidth: 0 }}><h2 style={{ fontSize: 18 }}>{a.company.name}</h2><span className="sm mut ell">{[a.company.industry, a.company.country].filter(Boolean).join(' · ')}{a.company.industry || a.company.country ? ' · ' : ''}<a href={`https://${a.company.domain}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{a.company.domain}</a></span></div><span className={`chip ${tcls(a.timing)} ml`}>{a.timing}</span></div>
        <div className="tabs" role="tablist">
          {([['draft', 'Draft'], ['sig', 'Signals'], ['people', 'People'], ['act', 'Activity']] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
        </div>
      </div>
      <div className="bd">
        {tab === 'draft' && (a.contact ? (
          <>
            <div className="row sm mut wrap"><span>To</span><span className="row g6" style={{ border: '1px solid var(--line)', borderRadius: 999, padding: '2px 10px 2px 3px', color: 'var(--ink)' }}><span className="av lav" style={{ width: 20, height: 20, borderRadius: '50%', fontSize: 11 }}>{a.contact.name[0]}</span>{a.contact.name} · {a.contact.email ?? 'finding email…'}</span>{a.contact.emailStatus === 'valid' && <span className="b" style={{ color: 'var(--ok)' }}>✓</span>}</div>
            {a.hypothesis && <div className="hero sm" style={{ padding: '10px 12px' }}><strong>Likely problem:</strong> {a.hypothesis}{a.persona && <span className="mut"> · Owner: {a.persona}</span>}</div>}
            {a.pending && (
              <div className="card pad col g8" style={{ borderColor: 'var(--acc)' }}>
                <strong className="sm">Follow-up {a.pending.step + 1} is waiting for your approval</strong>
                <label className="lb">Email<textarea className="inp" rows={6} value={fb} onChange={(e) => setFb(e.target.value)} style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink)' }} /></label>
                <Checks ck={fck} />
                <button className="btn p s" style={{ alignSelf: 'flex-start' }} disabled={!fck.every((x) => x.pass)} onClick={() => run(() => approveFollowup(a.id, a.pending!.step, fs, fb))}>Approve follow-up</button>
              </div>
            )}
            {a.draft ? (
              <>
                <label className="lb">Subject<input className="inp b" value={d.subject} disabled={!isNew} onChange={(e) => { d.setSubject(e.target.value); autosave(e.target.value, d.body); }} style={{ fontSize: 14, color: 'var(--ink)' }} /></label>
                <label className="lb">Email 1 · {a.draft.approved ? 'approved' : 'first draft'}<textarea className="inp" rows={9} value={d.body} disabled={!isNew} onChange={(e) => { d.setBody(e.target.value); autosave(d.subject, e.target.value); }} style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink)', resize: 'vertical' }} /></label>
                <div className="xs mut" style={{ whiteSpace: 'pre-line', borderLeft: '2px solid var(--line)', paddingLeft: 10 }}>{a.footer}</div>
                <Checks ck={d.ck} />
              </>
            ) : <div className="empty">The first email is being written. It appears here in a minute.</div>}
            {a.seq.length > 0 && <div className="col g6"><span className="xs mut">Sequence · {li ? 'Email + LinkedIn' : 'Email only'} · {a.seq.length} touches over {a.seq[a.seq.length - 1].day} days · stops on reply</span><div className="row wrap g4">{a.seq.map((s, i) => <span key={i} className={`chip ${s.channel === 'email' ? 'lav' : 'li'}`} style={{ borderRadius: 6 }}>{s.channel === 'email' ? 'Email' : s.channel === 'call_task' ? 'Call' : 'LinkedIn'} · d{s.day}</span>)}</div></div>}
            {isNew && <button className="btn s" style={{ alignSelf: 'flex-start' }} onClick={() => run(() => rewriteDraft(a.id))}><Ico k="spark" s={14} /> Rewrite draft</button>}
          </>
        ) : <div className="empty">Looking for the right person at {a.company.name}. This usually takes a few minutes.</div>)}

        {tab === 'sig' && (
          <>
            {a.combo && <div className="hero sm"><strong>{a.combo}</strong>{a.angle && <><br /><span className="mut">{a.angle}</span></>}</div>}
            {a.signals.filter((s) => s.counted).map((s) => (
              <div key={s.id} className="card pad col g6">
                <div className="row"><strong className="f1">{s.label}</strong><span className={`chip ${CHIP[s.category] ?? 'gray'}`}>{s.category.replace('_', ' ').toLowerCase()}</span><span className="ml b" style={{ color: s.category === 'DISQUALIFIER' ? 'var(--bad)' : 'var(--acct)' }}>{s.category === 'DISQUALIFIER' ? 'Holds back' : `+${s.points}`}</span></div>
                <span className="sm">{s.url ? <a href={s.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>{s.evidence}</a> : s.evidence}</span>
                <span className="sm mut">{new Date(s.eventDate).toDateString()} · worth {s.weight} when fresh</span>
                <div className="bar" style={{ margin: '4px 0' }}><i style={{ width: `${(s.daysLeft / 45) * 100}%` }} /></div>
                <span className="xs mut">Useful for about {s.daysLeft} more days.</span>
              </div>
            ))}
            {a.signals.some((s) => !s.counted) && (
              <details className="sm"><summary className="mut" style={{ cursor: 'pointer' }}>{a.signals.filter((s) => !s.counted).length} more: duplicates, expired, being checked or rejected</summary>
                <ul className="col g6" style={{ paddingLeft: 16, marginTop: 8 }}>{a.signals.filter((s) => !s.counted).map((s) => <li key={s.id} className="mut">{s.label}: {s.evidence} ({new Date(s.eventDate).toDateString()}{s.verified === null ? ', checking' : s.verified === false ? ', rejected as a false positive' : s.points === 0 ? ', too old or switched off' : ', duplicate'})</li>)}</ul>
              </details>
            )}
            <div className="row b" style={{ borderTop: '1px solid var(--line2)', paddingTop: 10 }}><span>Fit score {a.score}</span><span className="ml" style={{ color: 'var(--bad)' }}>{a.timing}</span></div>
          </>
        )}

        {tab === 'people' && (
          a.contacts.length ? a.contacts.map((p) => {
            const main = p.id === a.contact?.id;
            return (
              <div key={p.id} className="card pad row">
                <span className={`av ${main ? 'lav' : 'gray'}`} style={{ width: 36, height: 36, borderRadius: '50%' }}>{p.name[0]}</span>
                <div className="col f1" style={{ minWidth: 0 }}><strong>{p.name}</strong><span className="sm mut ell">{p.role}{p.email ? ` · ${p.email}` : ''}</span>{p.linkedin && <a className="xs" href={p.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--li)' }}>LinkedIn</a>}</div>
                {main ? <span className="chip mint">Main contact</span> : isNew ? (
                  <button className="btn s" onClick={() => run(() => useContact(a.id, p.id))}>Use instead{p.emailStatus === 'valid' ? '' : ' · 1 credit'}</button>
                ) : !p.email && <button className="btn s" onClick={() => run(() => findEmail(p.id))}>Find email · 1 credit</button>}
              </div>
            );
          }) : <div className="empty">No people found yet.</div>
        )}

        {tab === 'act' && (
          <ol className="col g12" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {a.activity.map((l, i) => <li key={i} className="row" style={{ alignItems: 'flex-start' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: i ? '#B9A6FF' : 'var(--acc)', marginTop: 7, flex: 'none' }} /><span className="sm">{l.t}<br /><span className="xs mut">{when(l.w)}</span></span></li>)}
            {!a.activity.length && <li className="sm mut">Nothing yet.</li>}
          </ol>
        )}
      </div>
      <div className="ft">
        {isNew ? (
          <>
            <button className="btn" onClick={() => { run(() => skip(a.id, true), () => restore(a.id)); onDone?.(); }}>Not a fit</button>
            <button className="btn" onClick={() => { run(() => skip(a.id), () => restore(a.id)); onDone?.(); }}>Skip</button>
            <button className="btn p ml" disabled={!d.all} onClick={() => { run(() => approve(a.id, d.subject, d.body), () => restore(a.id)); onDone?.(); }}>Approve{ok < d.ck.length ? ` · ${ok}/${d.ck.length}` : ''}</button>
          </>
        ) : (
          <>
            <span className="sm mut">Status: <strong style={{ color: 'var(--ink)' }}>{statusLine(a)}</strong></span>
            {['skipped', 'nofit', 'approved'].includes(a.status) && <button className="btn s ml" onClick={() => run(() => restore(a.id))}>Undo</button>}
          </>
        )}
      </div>
    </aside>
  );
}

function statusLine(a: Account) {
  if (a.status === 'approved') return a.enrollment?.status === 'waiting_mailbox' ? 'Approved · waiting for a mailbox' : 'Queued for the next sending window';
  if (a.status === 'sequencing') return a.enrollment ? `Sequence running · step ${a.enrollment.step + 1}${a.enrollment.status === 'paused' ? ` · paused (${a.enrollment.reason})` : ''}` : 'Sequence running';
  if (a.status === 'replied') return 'Replied · sequence stopped';
  return STATUS[a.status]?.[0] ?? a.status;
}
