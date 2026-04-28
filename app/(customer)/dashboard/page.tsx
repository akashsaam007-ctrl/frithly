import Link from "next/link";
import { PageEvent } from "@/components/analytics/page-event";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/lib/constants";
import {
  getCurrentCustomerContext,
  getCurrentCustomerIcpSummary,
} from "@/lib/supabase/customer-data";
import { getNextMondayLabel } from "@/lib/utils";

export default async function DashboardPage() {
  const [customerContext, icpSummary] = await Promise.all([
    getCurrentCustomerContext(),
    getCurrentCustomerIcpSummary(),
  ]);
  const {
    daysSubscribed,
    firstName,
    latestBatch,
    lifetimeLeadsDelivered,
    matchRateLast30Days,
  } = customerContext;

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="dashboard_viewed"
        oncePerSessionKey="dashboard-viewed"
        properties={{ location: ROUTES.DASHBOARD }}
      />
      <section className="rounded-2xl border border-border bg-white p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
          Dashboard
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">Welcome back, {firstName}!</h1>
        <p className="mt-3 max-w-3xl text-muted">
          Your team&apos;s next batch is on track and your latest delivery is ready for follow-up.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Latest brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestBatch ? (
              <>
                <p className="text-sm font-medium text-muted">{latestBatch.deliveryDateLabel}</p>
                <h2 className="text-3xl md:text-4xl">{latestBatch.leadCount} new leads this week</h2>
                <p className="text-muted">
                  {latestBatch.positiveCount} leads marked positive, {latestBatch.negativeCount}{" "}
                  marked negative.
                </p>
                <Link href={`${ROUTES.BRIEFS}/${latestBatch.id}`} className="btn-primary inline-flex">
                  View Brief -&gt;
                </Link>
              </>
            ) : (
              <EmptyState
                className="border-0 shadow-none"
                description={`Your first brief lands Monday ${getNextMondayLabel()}. We'll show verified emails, fit signals, and feedback stats here as soon as it's delivered.`}
                title="Your first brief is on the way"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming delivery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold text-ink">
              Next delivery: Monday {getNextMondayLabel()} at 10 AM
            </p>
            <p className="text-muted">
              We&apos;re currently researching candidates matching your ICP and recent trigger
              signals.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Total leads delivered</p>
            <p className="text-4xl font-bold text-ink">{lifetimeLeadsDelivered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Average ICP match rate</p>
            <p className="text-4xl font-bold text-ink">
              {matchRateLast30Days !== null ? `${matchRateLast30Days}%` : "--"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Days subscribed</p>
            <p className="text-4xl font-bold text-ink">{daysSubscribed}</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>ICP at-a-glance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted">
            {icpSummary ??
              "Your ICP has not been configured yet. Add titles, industries, and trigger signals so Frithly can target the right buyers next Monday."}
          </p>
          <Link href={ROUTES.ICP} className="font-semibold text-terracotta underline underline-offset-4">
            Edit ICP -&gt;
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
