import Link from "next/link";
import { ArrowRight, Check, CreditCard, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CALCOM_URL, PLANS, ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

const lockedFeatureLabels: Record<string, string> = {
  briefs: "Briefs",
  icp: "ICP settings",
};

const selectablePlans = [PLANS.STARTER, PLANS.GROWTH, PLANS.SCALE];

function getPlanGateCopy(customer: Pick<CustomerRow, "plan" | "status">) {
  const currentPlan =
    customer.plan
      ? Object.values(PLANS).find((plan) => plan.id === customer.plan) ?? null
      : null;

  if (customer.status === "paused" && currentPlan) {
    return `Your ${currentPlan.name} subscription is paused. Reactivate it from billing or choose a plan below to unlock the workspace again.`;
  }

  if ((customer.status === "cancelled" || customer.status === "churned") && currentPlan) {
    return `Your ${currentPlan.name} subscription is no longer active. Choose a plan below to regain access to briefs, ICP settings, and weekly delivery.`;
  }

  return "Choose a plan to unlock briefs, ICP settings, and your weekly Frithly workflow.";
}

type PlanGateProps = {
  customer: Pick<CustomerRow, "plan" | "status">;
  lockedFeature?: string | null;
};

export function PlanGate({ customer, lockedFeature }: PlanGateProps) {
  const lockedLabel = lockedFeature ? lockedFeatureLabels[lockedFeature] ?? null : null;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border bg-white p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-terracotta/5 px-4 py-2 text-sm font-semibold text-terracotta">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          Workspace locked
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl">Choose a plan to get access.</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted">{getPlanGateCopy(customer)}</p>
        {lockedLabel ? (
          <div className="mt-5 rounded-2xl border border-border bg-stone-50 px-5 py-4 text-sm text-muted">
            <span className="font-semibold text-ink">{lockedLabel}</span> is locked until your plan
            is active.
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {selectablePlans.map((plan) => {
          const href = plan.id === PLANS.SCALE.id ? CALCOM_URL : `/checkout/${plan.id}`;
          const isExternal = href === CALCOM_URL;

          return (
            <Card
              key={plan.id}
              className={plan.id === PLANS.GROWTH.id ? "border-terracotta/30 shadow-[0_24px_60px_rgba(212,98,58,0.12)]" : undefined}
            >
              <CardHeader className="space-y-4">
                <div className="space-y-2">
                  {("badge" in plan && plan.badge) ? (
                    <div className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
                      {plan.badge}
                    </div>
                  ) : null}
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-4xl font-bold tracking-tighter text-ink">
                    {formatCurrency(plan.price)}
                    <span className="ml-2 text-base font-medium text-muted">/month</span>
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.slice(0, 5).map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-ink">
                      <div className="mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {isExternal ? (
                  <Button asChild className="w-full" size="lg" variant={plan.id === PLANS.GROWTH.id ? "primary" : "secondary"}>
                    <Link href={href} rel="noreferrer" target="_blank">
                      <span className="inline-flex items-center gap-2">
                        Talk to sales
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="w-full" size="lg" variant={plan.id === PLANS.GROWTH.id ? "primary" : "secondary"}>
                    <Link href={`/checkout/${plan.id}?mode=dashboard-upgrade`}>
                      <span className="inline-flex items-center gap-2">
                        {`Choose ${plan.name}`}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>What unlocks with a plan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Weekly lead briefs with researched accounts and verified contacts.",
            "ICP settings so Frithly can keep improving who gets delivered.",
            "Billing controls for pausing, reactivating, and plan changes.",
            "Direct support if you need help during onboarding or delivery.",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-border bg-stone-50 px-4 py-4 text-sm leading-7 text-muted">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
              Need help choosing?
            </p>
            <p className="text-sm leading-7 text-muted">
              If you&apos;re not sure which plan fits your workflow, talk to us or open billing once
              you&apos;ve chosen a plan.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href={ROUTES.BILLING}>
                <span className="inline-flex items-center gap-2">
                  Open billing
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.HELP}>Contact support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
