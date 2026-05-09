import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CircleOff,
  MapPinned,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { PageEvent } from "@/components/analytics/page-event";
import { PlanGate } from "@/components/customer/plan-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  getAnalyticsForCustomer,
  type AnalyticsInsight,
  type AnalyticsRow,
} from "@/lib/backend-api/customer-analytics";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.round(value * 100)}%`;
}

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return String(Math.round(value));
}

function formatLift(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  const percentagePoints = Math.round(value * 100);
  const prefix = percentagePoints > 0 ? "+" : "";
  return `${prefix}${percentagePoints} pts`;
}

function getInsightToneClasses(tone: AnalyticsInsight["tone"]) {
  if (tone === "positive") {
    return "border-emerald-200 bg-emerald-50";
  }

  if (tone === "negative") {
    return "border-red-200 bg-red-50";
  }

  return "border-border bg-stone-50";
}

function MetricCard({
  description,
  title,
  value,
}: {
  description: string;
  title: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-6">
        <p className="text-sm font-medium text-muted">{title}</p>
        <p className="text-4xl font-bold text-ink">{value}</p>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </CardContent>
    </Card>
  );
}

function OverviewMetric({
  description,
  label,
  value,
}: {
  description: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-stone-50 p-5">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}

function AnalyticsRowsCard({
  description,
  emptyText,
  primaryLabel,
  rows,
  title,
}: {
  description: string;
  emptyText: string;
  primaryLabel: string;
  rows: AnalyticsRow[];
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length > 0 ? (
          rows.slice(0, 5).map((row) => (
            <div key={row.label} className="rounded-2xl border border-border bg-stone-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-ink">{row.label}</p>
                  <p className="text-sm leading-6 text-muted">
                    {row.totalMembers} members • {row.sentMembers} sent
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-ink">{formatPercent(row.positiveReplyRate)}</p>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">{primaryLabel}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-white px-3 py-2">
                  {row.meetingCount} meetings • {formatPercent(row.meetingRate)}
                </div>
                <div className="rounded-xl border border-border bg-white px-3 py-2">
                  {row.bouncedCount} bounces • {formatPercent(row.bounceRate)}
                </div>
                <div className="rounded-xl border border-border bg-white px-3 py-2">
                  Avg opportunity score {formatScore(row.avgLeadScore)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-stone-50 p-4 text-sm leading-6 text-muted">
            <CircleOff className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <span>{emptyText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InsightCard({
  description,
  title,
  tone,
}: AnalyticsInsight) {
  return (
    <div className={`rounded-2xl border p-5 ${getInsightToneClasses(tone)}`}>
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}

export default async function AnalyticsPage() {
  const customerContext = await getCurrentCustomerContext();
  const hasWorkspaceAccess = hasCustomerWorkspaceAccess(customerContext.customer);

  if (!hasWorkspaceAccess) {
    return (
      <Container className="space-y-8 px-0">
        <PageEvent
          name="analytics_viewed"
          oncePerSessionKey="analytics-viewed"
          properties={{ location: ROUTES.ANALYTICS, workspace_access: "locked" }}
        />
        <PlanGate customer={customerContext.customer} lockedFeature="analytics" />
      </Container>
    );
  }

  let errorMessage: string | null = null;
  const workspace = await getAnalyticsForCustomer(customerContext.companyName).catch((error) => {
    errorMessage =
      error instanceof Error
        ? error.message
        : "We couldn't load outbound analytics from the intelligence backend.";

    return {
      campaignPerformance: [],
      cityPerformance: [],
      cohortPerformance: [],
      cohorts: [],
      contactabilityPerformance: [],
      emailRoutePerformance: [],
      founderConfidenceInsights: [],
      funnel: {
        approved: 0,
        cohortReady: 0,
        discovered: 0,
        qualified: 0,
        recommended: 0,
        smtpReady: 0,
      },
      learningFeed: [],
      nichePerformance: [],
      recommendationAccuracy: [],
      smtpPerformance: [],
      summary: {
        activeCampaigns: 0,
        activeCohorts: 0,
        avgLeadScore: 0,
        avgOutcomeScore: 0,
        bounceRate: 0,
        bouncedCount: 0,
        meetingCount: 0,
        meetingRate: 0,
        positiveReplyCount: 0,
        positiveReplyRate: 0,
        premiumPerformanceRate: 0,
        recommendationLift: 0,
        repliedCount: 0,
        replyRate: 0,
        sentMembers: 0,
        smtpSafeSuccessRate: 0,
        spamComplaintCount: 0,
        spamRate: 0,
        topCampaignLabel: null,
        topCityLabel: null,
        topCohortLabel: null,
        totalMembers: 0,
      },
      topNegativeProfiles: [],
      topPositiveProfiles: [],
    };
  });

  const hasAnyMembers = workspace.summary.totalMembers > 0;
  const hasOutcomeData = workspace.summary.sentMembers > 0;

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="analytics_viewed"
        oncePerSessionKey="analytics-viewed"
        properties={{ location: ROUTES.ANALYTICS, workspace_access: "active" }}
      />

      <section className="rounded-2xl border border-border bg-white p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-terracotta/5 px-4 py-2 text-sm font-semibold text-terracotta">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              This week&apos;s delivery results
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl">Are this week&apos;s opportunities working?</h1>
              <p className="max-w-3xl text-lg leading-8 text-muted">
                This page keeps the focus on business outcomes: replies, positive replies,
                meetings, and which opportunity patterns are earning attention. It is meant to
                explain performance, not expose internal mechanics.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href={ROUTES.COHORTS}>
                Review this week&apos;s cohort
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <ErrorState
          description={errorMessage}
          title="Outcome analytics are temporarily unavailable"
        />
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard
              description={`${workspace.summary.positiveReplyCount} positive replies recorded so far.`}
              title="Positive reply rate"
              value={formatPercent(workspace.summary.positiveReplyRate)}
            />
            <MetricCard
              description="Meetings tied back to visible cohort members."
              title="Meetings booked"
              value={String(workspace.summary.meetingCount)}
            />
            <MetricCard
              description={`${workspace.summary.bouncedCount} bounces captured in the current sample.`}
              title="Bounce rate"
              value={formatPercent(workspace.summary.bounceRate)}
            />
            <MetricCard
              description="Positive reply rate among premium opportunities only."
              title="Premium cohort performance"
              value={formatPercent(workspace.summary.premiumPerformanceRate)}
            />
            <MetricCard
              description="Lift for high recommendation-score members versus the workspace baseline."
              title="Recommendation lift"
              value={formatLift(workspace.summary.recommendationLift)}
            />
            <MetricCard
              description="Positive reply rate among SMTP-verified members."
              title="SMTP-safe success"
              value={formatPercent(workspace.summary.smtpSafeSuccessRate)}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader>
                <CardTitle>Outcome overview</CardTitle>
                <CardDescription>
                  This section is about business outcomes, not outbound volume. It shows how much
                  intelligence has actually made it into the field and what happened next.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <OverviewMetric
                  description="Members already touched by outbound activity."
                  label="Sent"
                  value={String(workspace.summary.sentMembers)}
                />
                <OverviewMetric
                  description="Members that reached a reply, positive or otherwise."
                  label="Replies"
                  value={String(workspace.summary.repliedCount)}
                />
                <OverviewMetric
                  description="Positive responses, the strongest early quality signal."
                  label="Positive replies"
                  value={String(workspace.summary.positiveReplyCount)}
                />
                <OverviewMetric
                  description="Actual meetings booked from customer-visible cohorts."
                  label="Meetings"
                  value={String(workspace.summary.meetingCount)}
                />
                <OverviewMetric
                  description="Spam complaints stay visible because reputation risk matters."
                  label="Spam complaints"
                  value={String(workspace.summary.spamComplaintCount)}
                />
                <OverviewMetric
                  description="Average opportunity score across all visible cohort members."
                  label="Average opportunity score"
                  value={formatScore(workspace.summary.avgLeadScore)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This week&apos;s strongest signals</CardTitle>
                <CardDescription>
                  These are the strongest emerging pockets from the current sample, including the
                  top-performing cohort, delivery cycle, and city.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">Top cohort</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {workspace.summary.topCohortLabel ?? "No cohort has enough outcome data yet."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <div className="flex items-start gap-3">
                    <Target className="mt-1 h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">Top delivery cycle</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {workspace.summary.topCampaignLabel ?? "No delivery cycle has enough outcome data yet."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <div className="flex items-start gap-3">
                    <MapPinned className="mt-1 h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">Top city pocket</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {workspace.summary.topCityLabel ?? "No city pattern has enough outcome data yet."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <div className="flex items-start gap-3">
                    <BarChart3 className="mt-1 h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">Sample quality</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {workspace.summary.totalMembers} visible cohort members across {workspace.summary.activeCohorts} cohorts and {workspace.summary.activeCampaigns} delivery cycles.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {!hasAnyMembers ? (
            <EmptyState
              action={
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <Link href={ROUTES.COHORTS}>Review cohorts</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={ROUTES.DRAFTS}>Prepare drafts</Link>
                  </Button>
                </div>
              }
              description="No cohort members are visible yet. Once approved opportunities move into cohorts, this page will start explaining which signals outperform baseline."
              title="No analytics sample yet"
            />
          ) : (
            <>
              {!hasOutcomeData ? (
                <Card>
                  <CardContent className="flex items-start gap-3 p-6 text-sm leading-7 text-muted">
                    <CircleOff className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">No live outcome signal has been recorded yet.</p>
                      <p className="mt-1">
                        The page is ready, but the correlation sections below will become much more
                        useful after sends, replies, bounces, and meetings are recorded against
                        cohort members.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <section className="grid gap-6">
                <AnalyticsRowsCard
                  description="Which outbound packages are creating the best outcomes right now."
                  emptyText="No cohort performance data is available yet."
                  primaryLabel="Positive reply rate"
                  rows={workspace.cohortPerformance}
                  title="Cohort performance"
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <AnalyticsRowsCard
                  description="This is the visible test of whether recommendation strength is predicting better outcomes."
                  emptyText="No recommendation-band correlation is available yet."
                  primaryLabel="Positive reply rate"
                  rows={workspace.recommendationAccuracy}
                  title="Recommendation accuracy"
                />
                <AnalyticsRowsCard
                  description="This validates whether higher founder-confidence selections are producing better outbound performance."
                  emptyText="No founder-confidence correlation is available yet."
                  primaryLabel="Positive reply rate"
                  rows={workspace.founderConfidenceInsights}
                  title="Founder confidence insights"
                />
              </section>

              <section className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Intelligence learning feed</CardTitle>
                    <CardDescription>
                      This is the premium layer: Frithly explaining which signals are
                      outperforming baseline and which ones are creating drag.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workspace.learningFeed.length > 0 ? (
                      workspace.learningFeed.map((insight) => (
                        <InsightCard
                          key={insight.title}
                          description={insight.description}
                          title={insight.title}
                          tone={insight.tone}
                        />
                      ))
                    ) : (
                      <div className="flex items-start gap-3 rounded-2xl border border-border bg-stone-50 p-4 text-sm leading-6 text-muted">
                        <CircleOff className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                        <span>
                          As more cohort outcomes accumulate, this feed will explain what is
                          outperforming or underperforming baseline.
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current review cycle</CardTitle>
                    <CardDescription>
                      This keeps the current delivery rhythm visible so you can see how the weekly
                      package is narrowing from discovery into outbound-ready work.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <OverviewMetric
                      description="Opportunities found across this week's discovery pass."
                      label="Discovered"
                      value={String(workspace.funnel.discovered)}
                    />
                    <OverviewMetric
                      description="Opportunities that cleared this week's quality floor."
                      label="Qualified"
                      value={String(workspace.funnel.qualified)}
                    />
                    <OverviewMetric
                      description="Opportunities surfaced by recommendations."
                      label="Recommended"
                      value={String(workspace.funnel.recommended)}
                    />
                    <OverviewMetric
                      description="Opportunities a human has approved."
                      label="Approved"
                      value={String(workspace.funnel.approved)}
                    />
                    <OverviewMetric
                      description="Opportunities strong enough for SMTP review."
                      label="SMTP-ready"
                      value={String(workspace.funnel.smtpReady)}
                    />
                    <OverviewMetric
                      description="Opportunities already grouped into deployment cohorts."
                      label="Cohort-ready"
                      value={String(workspace.funnel.cohortReady)}
                    />
                  </CardContent>
                </Card>
              </section>
            </>
          )}
        </>
      )}
    </Container>
  );
}
