'use client';
import Link from 'next/link';
import { TopBar } from '@/components/shell';
import { fmt, money } from '@/components/ui';

export function AnalyticsView({ days, totals: t, weeks, bySignal }: { days: number; totals: { contacted: number; sent: number; replies: number; replyRate: number; meetings: number; won: number; wonValue: number }; weeks: { label: string; sent: number; replies: number }[]; bySignal: { label: string; n: number; rate: number }[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.sent));
  const top = Math.max(1, ...bySignal.map((s) => s.rate));
  const empty = t.sent === 0 && weeks.every((w) => !w.sent);
  return (
    <>
      <TopBar title="Analytics" sub={`Last ${days} days`} right={<div className="seg" role="group" aria-label="Period">{[7, 30, 90].map((d) => <Link key={d} href={`/app/analytics?p=${d}`} className={days === d ? 'on' : ''} style={{ padding: '5px 11px', borderRadius: 8, background: days === d ? '#fff' : 'none', color: days === d ? 'var(--ink)' : 'var(--mut)' }}>{d} days</Link>)}</div>} />
      <div className="content">
        {empty && <div className="hero sm">Numbers fill in once your first emails go out. Everything here comes from your own sends, replies and deals.</div>}
        <section className="grid" aria-label="Totals" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(190px,100%),1fr))' }}>
          {[['Companies contacted', fmt(t.contacted), 'Sequences started'], ['Emails sent', fmt(t.sent), 'First emails and follow-ups'], ['Replies', fmt(t.replies), `${t.replyRate.toFixed(1)}% of companies emailed`], ['Meetings', fmt(t.meetings), 'From Deals'], ['Deals won', fmt(t.won), money(t.wonValue)]].map((k) => (
            <div key={k[0]} className="card pad col g4"><span className="sm mut">{k[0]}</span><strong style={{ font: "800 30px 'Plus Jakarta Sans'", letterSpacing: '-.02em' }}>{k[1]}</strong><span className="xs b" style={{ color: 'var(--ok)' }}>{k[2]}</span></div>
          ))}
        </section>
        <div className="row wrap g20" style={{ alignItems: 'stretch' }}>
          <section className="card pad col g12" style={{ flex: '1.4 1 520px', minWidth: 0 }} aria-label="By week">
            <div className="row wrap"><h2 style={{ fontSize: 17 }}>Emails sent and replies, by week</h2><span className="row g12 xs mut ml"><span className="row g6"><i style={{ width: 10, height: 10, borderRadius: 3, background: '#D9D0FF' }} />Sent</span><span className="row g6"><i style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--acc)' }} />Replies</span></span></div>
            <div role="img" aria-label={`Weekly sends from ${weeks[0].sent} to ${weeks[7].sent}, replies from ${weeks[0].replies} to ${weeks[7].replies}`} className="row" style={{ alignItems: 'flex-end', gap: 12, height: 220, borderBottom: '1px solid #ECE9F2' }}>
              {weeks.map((w) => (
                <div key={w.label} className="col" style={{ flex: 1, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }} title={`${w.sent} sent, ${w.replies} replies`}>
                  <span className="xs b" style={{ color: 'var(--acct)' }}>{w.replies || ''}</span>
                  <div className="col" style={{ width: '100%', maxWidth: 44, height: `${(w.sent / max) * 100}%`, minHeight: w.sent ? 4 : 0, background: '#D9D0FF', borderRadius: '6px 6px 0 0', justifyContent: 'flex-end', overflow: 'hidden' }}><div style={{ height: `${w.sent ? (w.replies / w.sent) * 100 : 0}%`, minHeight: w.replies ? 3 : 0, background: 'var(--acc)' }} /></div>
                </div>
              ))}
            </div>
            <div className="row xs mut" style={{ gap: 12 }}>{weeks.map((w) => <span key={w.label} style={{ flex: 1, textAlign: 'center' }}>{w.label}</span>)}</div>
          </section>
          <section className="card pad col g6" style={{ flex: '1 1 360px', minWidth: 0 }} aria-label="By signal">
            <h2 style={{ fontSize: 17, marginBottom: 6 }}>Reply rate by signal</h2>
            {bySignal.length ? bySignal.map((s) => (
              <div key={s.label} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1.5fr) 64px', gap: 10, alignItems: 'center', padding: '6px 0', borderTop: '1px solid var(--line2)' }} className="sm">
                <span className="ell">{s.label}</span><div className="bar" style={{ margin: 0, height: 8 }}><i style={{ width: `${(s.rate / top) * 100}%` }} /></div><strong style={{ textAlign: 'right' }}>{s.rate.toFixed(0)}% <span className="xs mut">({s.n})</span></strong>
              </div>
            )) : <p className="sm mut">Shows which signals get replies once you’ve emailed a few companies. Last 90 days.</p>}
          </section>
        </div>
      </div>
    </>
  );
}
