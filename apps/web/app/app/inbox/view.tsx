'use client';
import { useEffect, useState } from 'react';
import { REPLY_LABEL, type ReplyClass } from '@frithly/core/compliance';
import { TopBar, useShell } from '@/components/shell';
import { Ico } from '@/components/icons';
import { CHIP, when } from '@/components/ui';
import { bookMeeting, markRead, sendReply, setReplyType, snoozeReply, toDeal } from '../actions';

export interface Reply {
  id: string; oppId: string; cls: string; at: string; unread: boolean; from: string; subject: string; body: string;
  who: string; first: string; role: string; company: string; domain: string; industry: string | null; size: string | null; country: string | null;
  why: { label: string; evidence: string; category: string } | null; combo: string | null; status: string;
  thread: { id: string; out: boolean; at: string; subject: string; body: string; from: string }[];
}
const GROUP: [string, string, string, ReplyClass[]][] = [
  ['all', 'All replies', '#14121A', []], ['int', 'Interested', '#0B6B47', ['interested', 'meeting', 'referral']], ['later', 'Not now', '#C2610E', ['later']],
  ['ooo', 'Out of office', '#6C47FF', ['out_of_office']], ['no', 'Not interested', '#5B5766', ['not_interested', 'optout']], ['bnc', 'Bounced', '#8C8798', ['bounce']], ['other', 'Other', '#8C8798', ['other']],
];
const chipOf = (c: string) => (['interested', 'meeting', 'referral'].includes(c) ? 'mint' : c === 'later' ? 'pea' : c === 'out_of_office' ? 'lav' : 'gray');
const sugg = (r: Reply) => ({
  interested: `Glad it’s useful, ${r.first}. Would Tuesday or Wednesday this week work for 20 minutes? Happy to fit around you.`,
  meeting: `Great, ${r.first}. Here are two times that work for me: Tuesday 3 pm or Wednesday 11 am. Which suits you?`,
  referral: `Thanks, ${r.first}. I’ll reach out to them and mention you pointed me their way.`,
  later: `Makes sense, ${r.first}. I’ll check back then.`,
  not_interested: `Understood, ${r.first}. Thanks for letting me know.`,
} as Record<string, string>)[r.cls] ?? '';
const strip = (t: string) => t.split(/\nOn .+wrote:|\n-{2,}\s*Original Message/)[0].trim();

export function InboxView({ replies, signature }: { replies: Reply[]; signature: string }) {
  const { run } = useShell();
  const [g, setG] = useState('all');
  const [sel, setSel] = useState<string | null>(null);
  const list = replies.filter((r) => g === 'all' || GROUP.find((x) => x[0] === g)![3].includes(r.cls as ReplyClass));
  const r = list.find((x) => x.id === sel) ?? list[0];
  const [text, setText] = useState('');
  useEffect(() => { if (r) { setText(sugg(r)); if (r.unread) markRead(r.id); } }, [r?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <TopBar title="Inbox" sub={`${replies.length} replies · any reply stops that company’s follow-ups`} />
      <div className="split">
        <nav className="col g4 hide-sm" aria-label="Reply types" style={{ width: 200, flex: 'none', padding: '18px 12px', borderRight: '1px solid var(--line)', background: '#fff' }}>
          {GROUP.map(([k, l, c, cls]) => { const n = k === 'all' ? replies.length : replies.filter((x) => cls.includes(x.cls as ReplyClass)).length; return <button key={k} className={`nv ${g === k ? 'on' : ''}`} onClick={() => setG(k)}><span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{l}<span className="n" style={{ color: 'var(--mut)' }}>{n || ''}</span></button>; })}
        </nav>
        <section aria-label="Replies" className="col" style={{ flex: '1 1 320px', maxWidth: 400, minWidth: 0, borderRight: '1px solid var(--line)', background: 'var(--sf2)' }}>
          {list.length ? list.map((x) => (
            <button key={x.id} className="col g4" onClick={() => setSel(x.id)} style={{ textAlign: 'left', border: 0, borderBottom: '1px solid var(--line2)', padding: '14px 18px', background: x.id === r?.id ? 'var(--accs)' : 'transparent', boxShadow: x.id === r?.id ? 'inset 3px 0 0 var(--acc)' : 'none' }}>
              <span className="row"><strong style={{ fontWeight: x.unread ? 700 : 600 }}>{x.cls === 'bounce' ? 'Mail delivery' : x.who}</strong><span className="xs mut ml">{when(x.at)}</span></span>
              <span className="sm mut">{x.company}</span>
              <span className="sm ell" style={{ color: 'var(--ink2)' }}>{strip(x.body).slice(0, 140)}</span>
              <span className="row g6"><span className={`chip ${chipOf(x.cls)}`}>{REPLY_LABEL[x.cls as ReplyClass] ?? 'Reply'}</span>{x.why && <span className={`chip ${CHIP[x.why.category] ?? 'gray'}`}>{x.why.label}</span>}</span>
            </button>
          )) : <p className="sm mut" style={{ padding: 18 }}>{replies.length ? 'No replies here.' : 'No replies yet. They show up here within five minutes of landing in your mailbox.'}</p>}
        </section>
        {r ? (
          <section aria-label="Conversation" className="col fin" style={{ flex: '999 1 460px', minWidth: 0, background: '#fff' }}>
            <div className="row wrap" style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)' }}>
              <span className="av lav" style={{ width: 42, height: 42, fontSize: 18 }}>{r.company[0]}</span>
              <div className="col"><h2 style={{ fontSize: 18 }}>{r.who}</h2><span className="sm mut">{r.role ? `${r.role} · ` : ''}{r.company}</span></div>
              <label className="ml sr" htmlFor="rtype">Reply type</label>
              <select id="rtype" className="inp ml" value={r.cls} onChange={(e) => run(() => setReplyType(r.id, e.target.value as ReplyClass))} style={{ width: 'auto' }}>
                {Object.entries(REPLY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              {r.cls !== 'out_of_office' && <span className="chip mint">Sequence stopped</span>}
            </div>
            <div className="col g12" style={{ flex: 1, padding: '20px 24px', background: 'var(--sf2)' }}>
              {r.thread.map((m) => <div key={m.id} className={`bubble ${m.out ? 'me' : 'them'}`}><span className={`xs ${m.out ? 'mut' : 'b'}`} style={m.out ? undefined : { color: 'var(--acct)' }}>{m.out ? 'You' : r.who} · {when(m.at)}</span>{m.out ? m.body : strip(m.body)}</div>)}
            </div>
            {!['bounce', 'out_of_office', 'optout'].includes(r.cls) ? (
              <div className="col g8" style={{ padding: '14px 24px', borderTop: '1px solid var(--line)' }}>
                <span className="row g6 xs b" style={{ color: 'var(--acct)' }}><Ico k="spark" s={14} /> Suggested reply · edit before sending</span>
                <label className="sr" htmlFor="rep">Reply</label>
                <textarea id="rep" className="inp" rows={3} value={text} onChange={(e) => setText(e.target.value)} style={{ lineHeight: 1.55 }} />
                {signature && <span className="xs mut" style={{ whiteSpace: 'pre-line' }}>{signature}</span>}
                <div className="row wrap g8">
                  <button className="btn p" disabled={!text.trim()} onClick={() => run(() => sendReply(r.id, text))}>Send reply</button>
                  <button className="btn" onClick={() => run(() => bookMeeting(r.oppId))}>Book a meeting</button>
                  <button className="btn" onClick={() => run(() => snoozeReply(r.oppId, r.first))}>Snooze to a task</button>
                  <button className="btn" onClick={() => run(() => toDeal(r.oppId))}>Move to deals</button>
                </div>
              </div>
            ) : <div className="sm mut" style={{ padding: '14px 24px', borderTop: '1px solid var(--line)' }}>{r.cls === 'bounce' ? 'The address bounced. The contact is marked unreachable and a paid lookup credit is returned.' : r.cls === 'optout' ? 'They asked not to be contacted. They’re on the do-not-contact list for every Frithly user.' : 'No reply needed. Follow-ups are paused for five days.'}</div>}
          </section>
        ) : <div className="empty f1" style={{ margin: 20 }}>Pick a reply to read it.</div>}
        {r && (
          <aside className="col g12 hide-md" aria-label="Company context" style={{ width: 280, flex: 'none', borderLeft: '1px solid var(--line)', padding: 20, background: '#fff' }}>
            <span className="xs b mut" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Why you wrote</span>
            {r.why ? <div className="card pad col g6" style={{ padding: 12 }}><span className={`chip ${CHIP[r.why.category] ?? 'gray'}`} style={{ alignSelf: 'flex-start' }}>{r.combo ?? r.why.label}</span><span className="sm mut">{r.why.evidence}</span></div> : <span className="sm mut">Added by you.</span>}
            <span className="xs b mut" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Company</span>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 12px' }} className="sm">
              {r.industry && <><dt className="mut">Industry</dt><dd style={{ margin: 0 }}>{r.industry}</dd></>}
              {r.size && <><dt className="mut">People</dt><dd style={{ margin: 0 }}>{r.size}</dd></>}
              {r.country && <><dt className="mut">Country</dt><dd style={{ margin: 0 }}>{r.country}</dd></>}
              <dt className="mut">Website</dt><dd style={{ margin: 0 }}>{r.domain}</dd>
            </dl>
            <a className="btn s" href={`/app/companies?open=${r.oppId}`} style={{ alignSelf: 'flex-start' }}>Open company</a>
            <div className="xs mut" style={{ marginTop: 'auto', borderTop: '1px solid var(--line2)', paddingTop: 12 }}>Replies also arrive in your own inbox.</div>
          </aside>
        )}
      </div>
    </>
  );
}
