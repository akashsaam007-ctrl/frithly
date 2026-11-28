'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkEmail } from '@frithly/core/checks';
import type { Account } from '@/lib/accounts';
import { Drawer } from '@/components/drawer';
import { Modal, TopBar, useShell } from '@/components/shell';
import { Av, CHIP, EmailOk, STATUS, tcls } from '@/components/ui';
import { approve, approveMany, restore, skip } from './actions';

const FL: [string, string][] = [['all', 'All'], ['lead', 'New leader'], ['fund', 'Funding'], ['hire', 'Hiring'], ['tool', 'Tools & stack'], ['upmarket', 'Going upmarket'], ['other', 'Other']];
const passes = (a: Account) => !!a.draft && checkEmail({ ...a.base, emailStatus: a.base.emailStatus as never, subject: a.draft.subject, body: a.draft.body }).every((x) => x.pass);

export function TodayView({ accounts, steps, mailboxes, perDay, openTop5, welcome }: { accounts: Account[]; steps: [string, boolean][]; mailboxes: number; perDay: number; openTop5: boolean; welcome: boolean }) {
  const { run, setModal } = useShell();
  const router = useRouter();
  const [flt, setFlt] = useState('all');
  const [sel, setSel] = useState<string | null>(null);
  const list = accounts.filter((a) => flt === 'all' || a.filter === flt);
  const cur = list.find((a) => a.id === sel) ?? list[0];
  const open = accounts.filter((a) => ['new', 'saved'].includes(a.status));
  const act = open.filter((a) => a.timing === 'Act today').length;
  const step = steps.findIndex((s) => !s[1]);
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  const top5 = () => setModal(<Top5 list={[...open].sort((a, b) => b.score - a.score).slice(0, 5)} />);
  useEffect(() => { if (openTop5) { top5(); router.replace('/app'); } }, [openTop5]); // eslint-disable-line react-hooks/exhaustive-deps

  // J/K to move, A approve, S skip, N not a fit
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement as HTMLElement)?.tagName ?? '') || e.metaKey || e.ctrlKey || document.querySelector('.scrim')) return;
      const k = e.key.toLowerCase(), i = list.findIndex((a) => a.id === cur?.id);
      if (k === 'j' || k === 'k') { const n = list[Math.max(0, Math.min(list.length - 1, i + (k === 'j' ? 1 : -1)))]; if (n) setSel(n.id); return; }
      if (!cur || !['new', 'saved'].includes(cur.status)) return;
      if (k === 'a') { if (passes(cur)) run(() => approve(cur.id), () => restore(cur.id)); else run(async () => ({ err: `${cur.company.name} doesn’t pass every check yet. Open the draft to fix it.` })); }
      if (k === 's') run(() => skip(cur.id), () => restore(cur.id));
      if (k === 'n') run(() => skip(cur.id, true), () => restore(cur.id));
    };
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h);
  }, [list, cur, run]);

  return (
    <>
      <TopBar title="Today" sub={`${date} · ${accounts.length} companies with a reason to talk · ${act} to act on today`} right={<button className="btn p" onClick={top5} disabled={!open.length}>Approve top 5</button>} />
      <div className="split">
        <section className="content f1" aria-label="Today's companies" style={{ flex: '999 1 560px' }}>
          {welcome && <div className="okm">You’re set. We’re checking your companies now; your first list lands within a few hours.</div>}
          {step >= 0 && (
            <div className="hero row wrap g16">
              <div className="col"><strong style={{ fontFamily: 'Plus Jakarta Sans' }}>Your road to a first meeting</strong><span className="sm mut">{step === 0 ? 'Connect your mailbox to start sending.' : step === 1 ? 'Approve a few companies: emails go out in the next sending window.' : 'Replies usually start in the first week. Follow-ups do most of the work.'}</span></div>
              <ol className="row wrap g6 ml" style={{ margin: '0 0 0 auto', padding: 0, listStyle: 'none' }}>
                {steps.map((s, i) => <li key={s[0]} className={`step ${s[1] ? 'done' : i === step ? 'cur' : ''}`}><span className="c">{s[1] ? '✓' : ''}</span>{s[0]}</li>)}
              </ol>
            </div>
          )}
          <div className="row wrap g8">
            <div className="row wrap g6" role="group" aria-label="Filter by signal">
              {FL.map(([k, l]) => { const n = k === 'all' ? accounts.length : accounts.filter((a) => a.filter === k).length; return (k === 'all' || n > 0) && <button key={k} className={`fbtn ${flt === k ? 'on' : ''}`} aria-pressed={flt === k} onClick={() => setFlt(k)}>{l} <span style={{ opacity: 0.7 }}>{n}</span></button>; })}
            </div>
            <span className="sm mut ml hide-sm">{mailboxes ? <>Your {mailboxes} mailbox{mailboxes > 1 ? 'es' : ''} can start about <strong style={{ color: 'var(--ink)' }}>{perDay}</strong> new companies a day</> : 'Connect a mailbox to start sending'}</span>
          </div>
          {list.length ? (
            <div className="tw">
              <table className="tbl">
                <thead><tr><th>Company</th><th>Why now</th><th className="hide-sm">Timing</th><th className="hide-lg">Contact</th><th>Fit</th><th style={{ textAlign: "right" }}>Status</th></tr></thead>
                <tbody>
                  {list.map((x) => {
                    const dim = ['skipped', 'nofit'].includes(x.status), isNew = ['new', 'saved'].includes(x.status);
                    const extra = x.signals.filter((s) => s.counted && s.points).length - 1;
                    return (
                      <tr key={x.id} className={`ro ${x.id === cur?.id ? 'on' : ''}`} onClick={() => setSel(x.id)} style={dim ? { opacity: 0.5 } : undefined}>
                        <td><div className="row" style={{ minWidth: 180 }}><Av a={x} /><div className="col" style={{ minWidth: 0 }}><strong className="ell">{x.company.name}</strong><span className="xs mut ell">{[x.company.industry, x.company.country, x.company.size].filter(Boolean).join(' · ') || x.company.domain}</span></div></div></td>
                        <td><div className="row g6 wrap"><span className={`chip ${CHIP[x.main?.category ?? ''] ?? 'gray'}`}>{x.main?.label ?? 'Signal'}</span>{extra > 0 && <span className="xs mut">+{extra}</span>}</div></td>
                        <td className="hide-sm"><span className={`chip ${tcls(x.timing)}`}>{x.timing}</span></td>
                        <td className="hide-lg">{x.contact ? <div className="col sm"><span className="ell">{x.contact.name} · {x.contact.role}</span><EmailOk status={x.contact.emailStatus} /></div> : <span className="sm mut">Finding the right person…</span>}</td>
                        <td><span className={`fit ${x.score >= 60 ? 'hi' : ''}`}>{x.score}</span></td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                          {isNew ? <>
                            <button className="btn s" onClick={() => run(() => skip(x.id), () => restore(x.id))}>Skip</button>{' '}
                            <button className="btn s p" disabled={!passes(x)} title={passes(x) ? '' : 'Open the draft: a check doesn’t pass yet'} onClick={() => run(() => approve(x.id), () => restore(x.id))}>Approve</button>
                          </> : <span className={`chip ${STATUS[x.status]?.[1] ?? 'gray'}`}>{STATUS[x.status]?.[0] ?? x.status}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="row wrap sm mut" style={{ padding: '12px 14px' }}><span>J/K to move · A approve · S skip · N not a fit</span></div>
            </div>
          ) : (
            <div className="empty">{accounts.length ? 'No companies for this filter today.' : 'Nothing to review yet. We check your companies every day and new matches land here each morning.'}</div>
          )}
        </section>
        {cur && <Drawer a={cur} />}
      </div>
    </>
  );
}

function Top5({ list }: { list: Account[] }) {
  const { run, setModal } = useShell();
  const [pick, setPick] = useState(() => new Set(list.filter(passes).map((a) => a.id)));
  return (
    <Modal title={`Approve the top ${list.length}?`} foot={<><button className="btn" onClick={() => setModal(null)}>Cancel</button><button className="btn p" disabled={!pick.size} onClick={() => { setModal(null); run(() => approveMany([...pick])); }}>Approve selected</button></>}>
      <p className="sm mut" style={{ margin: 0 }}>Emails that miss a check can’t go out. Open them on Today to fix first.</p>
      {list.map((a) => {
        const ck = a.draft ? checkEmail({ ...a.base, emailStatus: a.base.emailStatus as never, subject: a.draft.subject, body: a.draft.body }) : [];
        const ok = ck.filter((x) => x.pass).length, f = ck.find((x) => !x.pass), all = ck.length > 0 && ok === ck.length;
        return (
          <label key={a.id} className="row" style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px' }}>
            <input type="checkbox" disabled={!all} checked={pick.has(a.id)} onChange={(e) => { const s = new Set(pick); if (e.target.checked) s.add(a.id); else s.delete(a.id); setPick(s); }} style={{ accentColor: 'var(--acc)', width: 18, height: 18 }} />
            <span className="col f1"><strong>{a.company.name}</strong><span className="xs mut">{a.contact?.name ?? 'No contact yet'} · {!a.draft ? 'No draft yet' : f ? `Needs: ${f.label}` : 'Every check passes'}</span></span>
            <span className={`chip ${all ? 'mint' : 'pea'}`}>{ok}/{ck.length || 11}</span>
          </label>
        );
      })}
      <p className="xs mut" style={{ margin: 0 }}>Each gets your default sequence. Any reply stops it.</p>
    </Modal>
  );
}
