/** Plans and limits. Prices in USD. Keep in sync with Stripe price IDs in env. */
export type PlanKey = 'trial' | 'starter' | 'pro' | 'agency';

export interface Plan {
  key: PlanKey;
  name: string;
  usd: number | null;
  /** First-month price after the 20% offer. */
  offerUsd?: number;
  yearlyUsd?: number;
  /** New companies shown per day. */
  daily: number;
  /** New companies (opportunities) per month. */
  month: number;
  /** Mailboxes included. */
  mailboxes: number;
  lookupCredits: number;
  seats: number;
  trialDays?: number;
}

export const PLANS: Record<PlanKey, Plan> = {
  trial: { key: 'trial', name: 'Free trial', usd: 0, daily: 10, month: 100, mailboxes: 1, lookupCredits: 250, seats: 1, trialDays: 14 },
  starter: { key: 'starter', name: 'Starter', usd: 49, offerUsd: 39, yearlyUsd: 490, daily: 10, month: 300, mailboxes: 2, lookupCredits: 2500, seats: 1 },
  pro: { key: 'pro', name: 'Pro', usd: 149, offerUsd: 119, yearlyUsd: 1490, daily: 25, month: 750, mailboxes: 4, lookupCredits: 7500, seats: 3 },
  agency: { key: 'agency', name: 'Agency', usd: null, daily: 60, month: 1800, mailboxes: 10, lookupCredits: 25000, seats: 10 },
};

/** 20% off the first month. Stripe coupon: percent_off=20, duration=once. */
export const FIRST_MONTH_OFFER = { percentOff: 20, durationMonths: 1 };

export const ADDONS = {
  opportunities: { name: '+250 opportunities a month', usd: 39, max: 4 },
  phones: { name: 'Phone numbers (100 a month)', usd: 49, max: 5 },
  mailbox: { name: 'Extra email account', usd: 6, max: 7 },
  seat: { name: 'Extra team seat', usd: 9, max: 10 },
  linkedinAuto: { name: 'LinkedIn automation', usd: 29, max: 1 },
} as const;

/** Days of the 14-day trial on which a new batch of companies is released. */
export const TRIAL_RELEASE_DAYS = [0, 2, 4, 7, 10];

export function planLimits(plan: PlanKey, addons: Partial<Record<keyof typeof ADDONS, number>> = {}) {
  const p = PLANS[plan];
  return {
    ...p,
    month: p.month + 250 * (addons.opportunities ?? 0),
    mailboxes: p.mailboxes + (addons.mailbox ?? 0),
    seats: p.seats + (addons.seat ?? 0),
    linkedinAuto: (addons.linkedinAuto ?? 0) > 0,
  };
}
