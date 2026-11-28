import { redirect } from 'next/navigation';
import { and, db, eq, monthKey, usage } from '@/lib/db';
import { ADDONS, PLANS, planLimits, type PlanKey } from '@frithly/core';
import { requireWorkspace } from '@/lib/auth';
import { ADDON_PRICE, checkoutUrl, portalUrl, stripe } from '@/lib/billing';

async function buy(fd: FormData) {
  'use server';
  const { user, ws } = await requireWorkspace();
  const plan = String(fd.get('plan')) as 'starter' | 'pro' | 'starter_yearly' | 'pro_yearly';
  redirect(await checkoutUrl(ws, user.email, plan));
}

async function manage() {
  'use server';
  const { ws } = await requireWorkspace();
  if (!ws.stripeCustomerId) redirect('/app/billing');
  redirect(await portalUrl(ws.stripeCustomerId));
}

async function addAddon(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  const key = String(fd.get('key')) as keyof typeof ADDON_PRICE;
  const price = ADDON_PRICE[key]?.();
  if (!ws.stripeSubscriptionId || !price) redirect('/app/billing?e=Choose+a+plan+first');
  const sub = await stripe().subscriptions.retrieve(ws.stripeSubscriptionId);
  const item = sub.items.data.find((i) => i.price.id === price);
  const max = ADDONS[key].max;
  if (item) {
    if ((item.quantity ?? 1) >= max) redirect('/app/billing?e=That+add-on+is+at+its+maximum');
    await stripe().subscriptionItems.update(item.id, { quantity: (item.quantity ?? 1) + 1, proration_behavior: 'create_prorations' });
  } else {
    await stripe().subscriptionItems.create({ subscription: sub.id, price, quantity: 1, proration_behavior: 'create_prorations' });
  }
  redirect('/app/billing?added=1'); // the webhook updates the workspace's add-ons
}

export default async function Billing({ searchParams }: { searchParams: Promise<{ done?: string; added?: string; e?: string }> }) {
  const { ws } = await requireWorkspace();
  const sp = await searchParams;
  const [u] = await db.select().from(usage).where(and(eq(usage.workspaceId, ws.id), eq(usage.month, monthKey())));
  const lim = planLimits((ws.plan === 'expired' ? 'trial' : ws.plan) as PlanKey, ws.addons);
  const paid = ws.plan === 'starter' || ws.plan === 'pro';
  return (
    <>
      <div className="head"><div><h1>Plan & billing</h1><p className="mut">Current plan: <strong>{ws.plan === 'expired' ? 'Trial ended' : PLANS[ws.plan as PlanKey].name}</strong>{ws.periodEndsAt ? ` · renews ${ws.periodEndsAt.toDateString()}` : ''}</p></div><span className="sp" />{ws.stripeCustomerId && <form action={manage}><button className="btn s">Invoices and payment method</button></form>}</div>
      {sp.done && <div className="ok" style={{ marginBottom: 12 }}>Thanks. Your plan updates within a minute.</div>}
      {sp.added && <div className="ok" style={{ marginBottom: 12 }}>Add-on added. It shows up within a minute.</div>}
      {sp.e && <div className="err" style={{ marginBottom: 12 }}>{sp.e}</div>}
      <div className="grid2" style={{ marginBottom: 16 }}>
        <div className="card"><span className="mut">Companies this month</span><h2 className="num">{u?.opportunities ?? 0} / {lim.month}</h2></div>
        <div className="card"><span className="mut">Email lookups</span><h2 className="num">{u?.lookups ?? 0}</h2></div>
        <div className="card"><span className="mut">Mailboxes included</span><h2 className="num">{lim.mailboxes}</h2></div>
      </div>
      <form action={buy} className="price" style={{ margin: '0 0 16px' }}>
        {(['starter', 'pro'] as const).map((k) => {
          const p = PLANS[k];
          return (
            <div key={k} className={`card stack${k === 'pro' ? ' rec' : ''}`}>
              {k === 'pro' && <span className="pill v" style={{ alignSelf: 'start' }}>Recommended</span>}
              <h3>{p.name}</h3>
              <h2>${p.usd}<span className="mut">/mo</span></h2>
              <p className="mut">{ws.stripeSubscriptionId ? '' : `$${p.offerUsd} for the first month · `}{p.month} companies a month · {p.mailboxes} mailboxes · {p.seats} seat{p.seats > 1 ? 's' : ''}</p>
              <button className="btn pri" name="plan" value={k} disabled={ws.plan === k}>{ws.plan === k ? 'Current plan' : `Choose ${p.name}`}</button>
              <button className="btn gh s" name="plan" value={`${k}_yearly`} disabled={ws.plan === k}>Or ${p.yearlyUsd}/year (2 months free)</button>
            </div>
          );
        })}
      </form>
      {paid && (
        <div className="card stack">
          <h2>Add-ons</h2>
          {(Object.keys(ADDON_PRICE) as (keyof typeof ADDON_PRICE)[]).map((k) => (
            <form key={k} action={addAddon} className="row" style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
              <input type="hidden" name="key" value={k} />
              <span className="sm"><strong>{ADDONS[k].name}</strong> · ${ADDONS[k].usd}/month</span>
              <span className="mut">You have {ws.addons[k] ?? 0}</span><span className="sp" />
              <button className="btn s">Add one</button>
            </form>
          ))}
        </div>
      )}
    </>
  );
}
