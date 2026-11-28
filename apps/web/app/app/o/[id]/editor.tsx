'use client';
import { useMemo, useState } from 'react';
import { checkEmail, type CheckInput } from '@frithly/core/checks';

export function Editor(props: {
  subject: string;
  body: string;
  base: Omit<CheckInput, 'subject' | 'body'>;
  footer: string;
  save: (fd: FormData) => Promise<void>;
  approve: (fd: FormData) => Promise<void>;
  regenerate: (fd: FormData) => Promise<void>;
  approved: boolean;
}) {
  const [subject, setSubject] = useState(props.subject);
  const [body, setBody] = useState(props.body);
  const checks = useMemo(() => checkEmail({ ...props.base, subject, body }), [subject, body, props.base]);
  const ok = checks.filter((c) => c.pass).length;
  const all = ok === checks.length;
  return (
    <form className="grid2" style={{ gridTemplateColumns: 'minmax(0,1.6fr) minmax(260px,1fr)' }}>
      <div className="card stack">
        <label>Subject<input name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
        <label>Email<textarea name="body" value={body} onChange={(e) => setBody(e.target.value)} style={{ minHeight: 220 }} /></label>
        <div className="mut" style={{ whiteSpace: 'pre-wrap', borderTop: '1px solid var(--line)', paddingTop: 10 }}>{props.footer}</div>
        <div className="row">
          {props.approved ? (
            <span className="pill g">Approved · sending on schedule</span>
          ) : (
            <button className="btn pri" formAction={props.approve} disabled={!all}>Approve · {ok}/{checks.length}</button>
          )}
          <button className="btn" formAction={props.save}>Save draft</button>
          <span className="sp" />
          <button className="btn gh s" formAction={props.regenerate}>Rewrite with AI</button>
        </div>
      </div>
      <div className="card stack">
        <div className="row"><h3>Before you send</h3><span className="sp" /><span className="score" style={{ color: all ? 'var(--grni)' : 'var(--ambi)' }}>{ok}/{checks.length}</span></div>
        <ul className="chk">
          {checks.map((c) => (
            <li key={c.id} className={c.pass ? 'pass' : 'fail'}>
              <span aria-hidden>{c.pass ? '✓' : '✕'}</span>
              <span>{c.label}{!c.pass && <em>{c.tip}</em>}</span>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}
