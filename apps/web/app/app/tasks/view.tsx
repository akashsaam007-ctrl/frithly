'use client';
import { useEffect, useState } from 'react';
import { TopBar, useShell } from '@/components/shell';
import { Ico } from '@/components/icons';
import { addTask, deleteTask, setTaskDone } from '../actions';

interface T { id: string; title: string; type: string; note: string | null; due: string; done: boolean; company: string | null; oppId: string | null }
const KIND: Record<string, [string, string]> = { linkedin_invite: ['LinkedIn invite', 'li'], linkedin_message: ['LinkedIn message', 'li'], call_task: ['Call', 'pea'], review: ['Approve follow-up', 'lav'], custom: ['', ''] };
const dayStr = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export function TasksView({ tasks, companies }: { tasks: T[]; companies: { id: string; name: string }[] }) {
  const { run } = useShell();
  // Tick instantly; the server catches up.
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => setDone({}), [tasks]);
  const [t, setT] = useState(''); const [c, setC] = useState(''); const [d, setD] = useState(0);
  const list = tasks.map((x) => (x.id in done ? { ...x, done: done[x.id] } : x)).sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due));
  const today = new Date(); today.setHours(23, 59, 59);
  return (
    <>
      <TopBar title="Tasks" sub={`${tasks.filter((x) => !x.done).length} open · LinkedIn steps, calls, follow-ups to approve and your own notes`} />
      <div className="content" style={{ maxWidth: 900 }}>
        <form className="card pad row wrap g8" onSubmit={(e) => { e.preventDefault(); if (!t.trim()) return; run(() => addTask(t, c, d)); setT(''); }}>
          <label className="sr" htmlFor="nt">New task</label><input id="nt" className="inp f1" placeholder="Add a task, e.g. Call Priya about pricing" value={t} onChange={(e) => setT(e.target.value)} required style={{ minWidth: 220 }} />
          <label className="sr" htmlFor="nc">Company</label><select id="nc" className="inp" style={{ width: 'auto' }} value={c} onChange={(e) => setC(e.target.value)}><option value="">No company</option>{companies.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
          <label className="sr" htmlFor="nd">Due</label><select id="nd" className="inp" style={{ width: 'auto' }} value={d} onChange={(e) => setD(+e.target.value)}><option value={0}>Today</option><option value={1}>Tomorrow</option><option value={7}>Next week</option></select>
          <button className="btn p">Add task</button>
        </form>
        <div className="card">
          {list.map((x) => {
            const late = !x.done && new Date(x.due) < new Date(new Date().setHours(0, 0, 0, 0));
            const k = KIND[x.type] ?? KIND.custom;
            return (
              <div key={x.id} className="row" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line2)', alignItems: 'flex-start' }}>
                <input type="checkbox" id={`tk-${x.id}`} checked={x.done} disabled={x.type === 'review' && !x.done} title={x.type === 'review' ? 'Approve it from the company’s Draft tab' : ''} onChange={(e) => { const v = e.target.checked; setDone((d) => ({ ...d, [x.id]: v })); run(() => setTaskDone(x.id, v), v ? () => setTaskDone(x.id, false) : undefined); }} style={{ width: 18, height: 18, accentColor: 'var(--acc)', marginTop: 2 }} />
                <label htmlFor={`tk-${x.id}`} className="col f1" style={{ cursor: 'pointer', minWidth: 0 }}>
                  <span style={x.done ? { textDecoration: 'line-through', color: 'var(--mut)' } : undefined}>{k[0] && <span className={`chip ${k[1]}`} style={{ marginRight: 6 }}>{k[0]}</span>}{x.title}</span>
                  {x.company && <span className="xs mut">{x.company}</span>}
                  {x.note && <span className="xs mut" style={{ whiteSpace: 'pre-line' }}>{x.note.split('\n').map((l, i) => /^https?:\/\//.test(l) ? <a key={i} href={l} target="_blank" rel="noreferrer" style={{ color: 'var(--li)' }}>{l}{'\n'}</a> : l + '\n')}</span>}
                </label>
                {x.oppId && <a className="btn s" href={x.type === 'review' ? `/app/companies?open=${x.oppId}` : `/app/companies?open=${x.oppId}`}>Open</a>}
                <span className={`sm ${late ? 'b' : 'mut'}`} style={late ? { color: 'var(--bad)' } : undefined}>{x.done ? 'Done' : late ? `Overdue · ${dayStr(x.due)}` : new Date(x.due) <= today ? 'Today' : dayStr(x.due)}</span>
                <button className="ib" style={{ width: 30, height: 30 }} onClick={() => run(() => deleteTask(x.id))} aria-label="Delete task"><Ico k="x" s={14} /></button>
              </div>
            );
          })}
          {!list.length && <p className="mut" style={{ padding: 16 }}>No tasks yet. LinkedIn steps and calls from your sequences show up here.</p>}
        </div>
      </div>
    </>
  );
}
