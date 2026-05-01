import Link from "next/link";
import { PageEvent } from "@/components/analytics/page-event";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { PLANS, ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

function formatPlan(plan: keyof typeof planLabels | null) {
  if (!plan) {
    return "No active plan";
  }

  return planLabels[plan];
}

function formatStatus(status: keyof typeof statusLabels | null) {
  if (!status) {
    return "Not started";
  }

  return statusLabels[status];
}

const planLabels = {
  design_partner: PLANS.DESIGN_PARTNER.name,
  growth: PLANS.GROWTH.name,
  scale: PLANS.SCALE.name,
  starter: PLANS.STARTER.name,
} as const;

const statusLabels = {
  active: "Active",
  cancelled: "Cancelled",
  churned: "Churned",
  paused: "Paused",
  pending: "Pending activation",
} as const;

export default async function AccountPage() {
  const { companyName, customer, firstName } = await getCurrentCustomerContext();

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="account_settings_viewed"
        oncePerSessionKey="account-settings-viewed"
        properties={{ location: ROUTES.ACCOUNT }}
      />

      <section className="rounded-2xl border border-border bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
          Account settings
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">Manage your account, {firstName}.</h1>
        <p className="mt-3 max-w-3xl text-muted">
          Review your account details, check your current plan status, and sign out securely.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted">Full name</p>
              <p className="text-base font-semibold text-ink">{customer.full_name?.trim() || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted">Work email</p>
              <p className="text-base font-semibold text-ink">{customer.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted">Company</p>
              <p className="text-base font-semibold text-ink">{companyName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted">Member since</p>
              <p className="text-base font-semibold text-ink">
                {customer.signup_date
                  ? new Date(customer.signup_date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted">Current plan</p>
              <p className="text-lg font-semibold text-ink">{formatPlan(customer.plan)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted">Status</p>
              <p className="text-lg font-semibold text-ink">{formatStatus(customer.status)}</p>
            </div>
            <Button asChild className="w-full" variant="secondary">
              <Link href={ROUTES.BILLING}>View plans</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild variant="secondary">
            <Link href={ROUTES.DASHBOARD}>Back to dashboard</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={ROUTES.BILLING}>Plans</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={ROUTES.HELP}>Help</Link>
          </Button>
          <SignOutButton variant="primary" />
        </CardContent>
      </Card>
    </Container>
  );
}
