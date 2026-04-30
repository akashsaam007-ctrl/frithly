import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { CALCOM_URL, PLANS, SUPPORT_EMAIL } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatCurrency, formatLongDate } from "@/lib/utils";

export default async function BillingPage() {
  const { customer } = await getCurrentCustomerContext();
  const currentPlan = customer.plan
    ? Object.values(PLANS).find((plan) => plan.id === customer.plan) ?? null
    : null;

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">Plans</p>
        <h1 className="text-4xl md:text-5xl">Pick the right Frithly rollout.</h1>
        <p className="max-w-3xl text-muted">
          We&apos;re handling plan setup, upgrades, reactivation, and rollout changes directly with
          customers now. Book a short call and we&apos;ll sort the right fit for your team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPlan ? (
            <>
              <p className="text-3xl font-semibold text-ink">
                {currentPlan.name} | {formatCurrency(currentPlan.price, currentPlan.currency)}
                /month
              </p>
              <p className="text-muted">
                Status: {customer.status ?? "pending"} | Started:{" "}
                {customer.signup_date ? formatLongDate(customer.signup_date) : "Not available"}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-semibold text-ink">No active plan yet</p>
              <p className="text-muted">
                Book a quick call and we&apos;ll recommend the right plan, confirm fit, and switch
                your workspace on.
              </p>
            </>
          )}

          <div className="flex flex-wrap gap-3">
            <Link className="btn-primary inline-flex" href={CALCOM_URL} rel="noreferrer" target="_blank">
              <span className="inline-flex items-center gap-2">
                Talk to sales
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
            <Link className="btn-secondary inline-flex" href={`mailto:${SUPPORT_EMAIL}?subject=Frithly plan support`}>
              Email support
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-3">
        {Object.values(PLANS).map((plan) => (
          <Card
            key={plan.id}
            className={
              "isHighlighted" in plan && plan.isHighlighted
                ? "border-terracotta/30 shadow-[0_24px_60px_rgba(212,98,58,0.12)]"
                : undefined
            }
          >
            <CardHeader className="space-y-4">
              <div className="space-y-2">
                {"badge" in plan && plan.badge ? (
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
                    {plan.badge}
                  </div>
                ) : null}
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-4xl font-bold tracking-tighter text-ink">
                  {formatCurrency(plan.price, plan.currency)}
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

              <Link className="btn-primary inline-flex w-full justify-center" href={CALCOM_URL} rel="noreferrer" target="_blank">
                <span className="inline-flex items-center gap-2">
                  Talk to sales
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>
    </Container>
  );
}
