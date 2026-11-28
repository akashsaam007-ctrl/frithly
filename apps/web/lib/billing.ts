import 'server-only';
import Stripe from 'stripe';
import { db, eq, workspaces } from '@frithly/db';

let _s: Stripe | null = null;
export const stripe = () => (_s ??= new Stripe(process.env.STRIPE_SECRET_KEY ?? ''));

export const PRICE_IDS = {
  starter: () => process.env.STRIPE_PRICE_STARTER ?? '',
  pro: () => process.env.STRIPE_PRICE_PRO ?? '',
  starter_yearly: () => process.env.STRIPE_PRICE_STARTER_YEARLY ?? '',
  pro_yearly: () => process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
};

export function planFromPrice(priceId: string): 'starter' | 'pro' | null {
  if ([PRICE_IDS.starter(), PRICE_IDS.starter_yearly()].includes(priceId)) return 'starter';
  if ([PRICE_IDS.pro(), PRICE_IDS.pro_yearly()].includes(priceId)) return 'pro';
  return null;
}

/** Stripe Checkout for a plan. The 20%-off-first-month coupon applies only to a first subscription. */
export async function checkoutUrl(ws: typeof workspaces.$inferSelect, email: string, plan: keyof typeof PRICE_IDS) {
  const s = stripe();
  let customer = ws.stripeCustomerId;
  if (!customer) {
    customer = (await s.customers.create({ email, name: ws.name, metadata: { workspaceId: ws.id } })).id;
    await db.update(workspaces).set({ stripeCustomerId: customer }).where(eq(workspaces.id, ws.id));
  }
  const first = !ws.stripeSubscriptionId && !plan.endsWith('_yearly');
  const coupon = process.env.STRIPE_COUPON_FIRST_MONTH;
  const app = process.env.APP_URL ?? 'http://localhost:3000';
  const session = await s.checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [{ price: PRICE_IDS[plan](), quantity: 1 }],
    ...(first && coupon ? { discounts: [{ coupon }] } : { allow_promotion_codes: true }),
    subscription_data: { metadata: { workspaceId: ws.id } },
    metadata: { workspaceId: ws.id },
    success_url: `${app}/app/billing?done=1`,
    cancel_url: `${app}/app/billing`,
    automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === '1' },
    customer_update: { address: 'auto', name: 'auto' },
  });
  return session.url!;
}

export async function portalUrl(customer: string) {
  const app = process.env.APP_URL ?? 'http://localhost:3000';
  return (await stripe().billingPortal.sessions.create({ customer, return_url: `${app}/app/billing` })).url;
}

/** Recurring add-on prices in Stripe, keyed like ADDONS in @frithly/core. */
export const ADDON_PRICE = {
  opportunities: () => process.env.STRIPE_PRICE_ADDON_OPPORTUNITIES ?? '',
  mailbox: () => process.env.STRIPE_PRICE_ADDON_MAILBOX ?? '',
  seat: () => process.env.STRIPE_PRICE_ADDON_SEAT ?? '',
  phones: () => process.env.STRIPE_PRICE_ADDON_PHONES ?? '',
};

/** Read plan and add-on quantities off a subscription and save them on the workspace. */
export async function syncSubscription(sub: Stripe.Subscription) {
  const workspaceId = sub.metadata.workspaceId;
  if (!workspaceId) return;
  let plan: 'starter' | 'pro' | null = null;
  const addons: Record<string, number> = {};
  for (const it of sub.items.data) {
    plan ??= planFromPrice(it.price.id);
    for (const [k, f] of Object.entries(ADDON_PRICE)) if (f() && f() === it.price.id) addons[k] = it.quantity ?? 1;
  }
  const active = ['active', 'trialing', 'past_due'].includes(sub.status);
  const end = sub.items.data[0]?.current_period_end;
  await db.update(workspaces).set({
    plan: active && plan ? plan : 'expired',
    stripeSubscriptionId: active ? sub.id : null,
    addons: active ? addons : {},
    periodEndsAt: end ? new Date(end * 1000) : null,
  }).where(eq(workspaces.id, workspaceId));
}
