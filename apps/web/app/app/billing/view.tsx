'use client';
import { useEffect } from 'react';
import { ADDONS, PLANS } from '@frithly/core/plans';
import { TopBar, useShell } from '@/components/shell';
import { fmt, money, when } from '@/components/ui';
import { addAddon, billingPortal, checkout, removeAddon } from '../actions';

const ADD_KEYS = ['mailbox', 'opportunities', 'seat', 'phones'] as const;
export function BillingView(p: { plan: string; trialEnds: string | null; renews: string | null; hasSub: boolean; hasCustomer: boolean; used: number; limit: number; credits: number; creditsTotal: number; resets: string; addons: Record<string, number>; history: { at: string; what: string; n: number }[]; done: boolean }) {
  const { run, toast } = useShell();
  useEffect(() => { if (p.done) toast('Thanks. Your plan updates within a minute.'); }, [p.done, toast]);
  const sub = p.plan === 'trial' ? `Free trial · ${p.trialEnds ? `ends ${new Date(p.trialEnds).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}` : p.plan === 'expired' ? 'Trial ended · choose a plan to keep sending' : `${PLANS[p.plan as 'starter'].name} plan${p.renews ? ` · renews ${new Date(p.renews).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}`;
  return (
    <>
      <TopBar title="Billing" sub={`${sub} · usage resets ${p.resets}`} right={p.hasCustomer ? <form action={billingPortal}><button className="btn">Invoices and payment method</button></form> : undefined} />
      <div className="content">
        <section className="card pad row wrap g20">
          <div className="col f1" style={{ minWidth: 220 }}><span className="sm mut">Your month so far</span><p style={{ margin: '4px 0 0' }}>You opened <strong>{fmt(p.used)} of {fmt(p.limit)}</strong> companies and have <strong>{fmt(p.credits)} of {fmt(p.creditsTotal)}</strong> lookup credits left.</p></div>
          <div className="col f1" style={{ minWidth: 220 }}><div className="bar"><i style={{ width: `${Math.min(100, (p.used / Math.max(1, p.limit)) * 100)}%` }} /></div><div className="bar"><i style={{ width: `${((p.creditsTotal - p.credits) / Math.max(1, p.creditsTotal)) * 100}%`, background: '#B9A6FF' }} /></div></div>
        </section>
        <h2 style={{ fontSize: 17 }}>Plans</h2>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))' }}>
          {(['starter', 'pro', 'agency'] as const).map((k) => {
            const x = PLANS[k], cur = p.plan === k;
            return (
              <div key={k} className="card pad col g8" style={cur ? { boxShadow: '0 0 0 2px var(--acc)', borderColor: 'var(--acc)' } : undefined}>
                <div className="row"><h3 style={{ fontSize: 18 }}>{x.name}</h3>{cur ? <span className="chip lav ml">Current plan</span> : k === 'pro' && <span className="chip lav ml">Recommended</span>}</div>
                <strong style={{ font: "800 30px 'Plus Jakarta Sans'" }}>{x.usd ? <>{money(x.usd)}<span className="sm mut" style={{ font: '500 14px Inter' }}>/month</span></> : 'Custom'}</strong>
                {x.offerUsd && !p.hasSub && <span className="xs b" style={{ color: 'var(--ok)' }}>{money(x.offerUsd)} for your first month</span>}
                <ul className="sm col g4" style={{ margin: 0, paddingLeft: 18 }}><li>{x.usd ? `${fmt(x.month)} companies a month` : 'Volume to fit your clients'}</li><li>{x.mailboxes} mailboxes · {x.seats} seat{x.seats > 1 ? 's' : ''}</li><li>{fmt(x.lookupCredits)} lookup credits</li></ul>
                {cur ? null : x.usd ? (
                  <div className="col g6"><button className="btn p" onClick={() => checkout(k as "starter" | "pro")}>{p.hasSub ? 'Switch' : 'Choose'} {x.name}</button><button className="btn s" onClick={() => checkout(`${k as "starter" | "pro"}_yearly`)}>Or {money(x.yearlyUsd!)}/year (2 months free)</button></div>
                ) : <a className="btn" href="mailto:hello@frithly.com?subject=Agency%20plan">Talk to us</a>}
              </div>
            );
          })}
        </div>
        <h2 style={{ fontSize: 17 }}>Add-ons</h2>
        <div className="grid">
          {ADD_KEYS.map((k) => (
            <div key={k} className="card pad col g8">
              <div className="row"><strong>{ADDONS[k].name}</strong>{p.addons[k] ? <span className="chip mint ml">{p.addons[k]} active</span> : null}</div>
              <p className="sm mut" style={{ margin: 0, flex: 1 }}>{money(ADDONS[k].usd)} a month each{k === 'mailbox' ? '. Warm-up included.' : ''}</p>
              <div className="row g6"><button className="btn s" disabled={!p.hasSub} title={p.hasSub ? '' : 'Choose a plan first'} onClick={() => run(() => addAddon(k))}>Add one</button>{p.addons[k] ? <button className="btn s d" onClick={() => run(() => removeAddon(k))}>Remove one</button> : null}</div>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: 17 }}>Credit history</h2>
        <div className="tw"><table className="tbl"><thead><tr><th>When</th><th>What</th><th style={{ textAlign: 'right' }}>Credits</th></tr></thead><tbody>
          {p.history.map((u, i) => <tr key={i}><td className="sm mut">{when(u.at)}</td><td className="sm">{u.what}</td><td style={{ textAlign: 'right' }} className="b"><span style={{ color: u.n > 0 ? 'var(--ok)' : 'var(--ink)' }}>{u.n > 0 ? '+' : '−'}{Math.abs(u.n)}</span></td></tr>)}
          {!p.history.length && <tr><td colSpan={3} className="sm mut">No credits used yet. Lookups and email finds show here.</td></tr>}
        </tbody></table></div>
      </div>
    </>
  );
}
