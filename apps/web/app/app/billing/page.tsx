import { and, credits, db, desc, eq, gte, monthKey, usage } from '@/lib/db';
import { planLimits } from '@frithly/core';
import { requireWorkspace } from '@/lib/auth';
import { creditsLeft, planKey, resetDay } from '@/lib/ctx';
import { BillingView } from './view';

export default async function Billing({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const { ws } = await requireWorkspace();
  const sp = await searchParams;
  const lim = planLimits(planKey(ws), ws.addons);
  const [[u], cr, hist] = await Promise.all([
    db.select().from(usage).where(and(eq(usage.workspaceId, ws.id), eq(usage.month, monthKey()))),
    creditsLeft(ws),
    db.select().from(credits).where(and(eq(credits.workspaceId, ws.id), gte(credits.at, new Date(Date.now() - 90 * 86_400_000)))).orderBy(desc(credits.at)).limit(50),
  ]);
  return <BillingView plan={ws.plan} trialEnds={ws.trialEndsAt?.toISOString() ?? null} renews={ws.periodEndsAt?.toISOString() ?? null} hasSub={!!ws.stripeSubscriptionId} hasCustomer={!!ws.stripeCustomerId}
    used={u?.opportunities ?? 0} limit={lim.month} credits={cr.left} creditsTotal={cr.total} resets={resetDay()} addons={ws.addons}
    history={hist.map((h) => ({ at: h.at.toISOString(), what: h.reason.replace(/\s*\[contact:[^\]]+\]/, ''), n: h.delta }))} done={!!sp.done} />;
}
