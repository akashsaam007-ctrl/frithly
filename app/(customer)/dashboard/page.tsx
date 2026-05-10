import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PageEvent } from "@/components/analytics/page-event";
import { CustomerPageHero } from "@/components/customer/page-hero";
import { PlanGate } from "@/components/customer/plan-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { getCustomerWorkspaceErrorMessage } from "@/lib/backend-api/customer-workspace-error";
import { listCohortsForCustomer } from "@/lib/backend-api/customer-cohorts";
import {
  getExportWorkspaceForCustomer,
  parseExportFilterState,
} from "@/lib/backend-api/customer-exports";
import { listRecommendationsForCustomer } from "@/lib/backend-api/customer-recommendations";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { ROUTES } from "@/lib/constants";
import {
  getCurrentCustomerContext,
  getCurrentCustomerIcpSummary,
} from "@/lib/supabase/customer-data";
import { formatLongDate, getNextMondayLabel } from "@/lib/utils";

type DashboardPageProps = {
  searchParams?: Promise<{
    access?: string | string[] | undefined;
    locked?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.round(value * 100)}%`;
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

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const customerContext = await getCurrentCustomerContext();
  const hasWorkspaceAccess = hasCustomerWorkspaceAccess(customerContext.customer);

  if (!hasWorkspaceAccess) {
    const accessReason = readParam(resolvedSearchParams?.access);
    const lockedFeature = readParam(resolvedSearchParams?.locked) || null;

    return (
      <Container className="space-y-8 px-0">
        <PageEvent
          name="dashboard_viewed"
          oncePerSessionKey="dashboard-viewed"
          properties={{
            access_state: "plan_required",
            location: ROUTES.DASHBOARD,
          }}
        />

        {accessReason === "plan-required" ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 px-5 py-4 text-sm text-[#f0d8ac]">
            Talk to sales below to unlock the rest of your customer workspace.
          </div>
        ) : null}

        <PlanGate customer={customerContext.customer} lockedFeature={lockedFeature} />
      </Container>
    );
  }

  const icpSummary = await getCurrentCustomerIcpSummary();
  const { firstName, latestBatch, lifetimeLeadsDelivered, matchRateLast30Days } = customerContext;

  let recommendationStats = {
    activeRecommendations: 0,
    approved: 0,
    avgFounderConfidence: 0,
    avgRecommendationScore: 0,
    pendingReview: 0,
    premiumOpportunities: 0,
    smtpReady: 0,
  };

  let currentCohort: {
    deliveryEmailStatus: string | null;
    deliveryState: string;
    deliveryWeekLabel: string | null;
    memberCount: number;
    name: string;
    premiumDensity: number;
    readinessPercent: number;
    scheduledFor: string | null;
    smtpSafeCount: number;
  } | null = null;

  let exportSummary = {
    approvedDraftCount: 0,
    exportReadyCohorts: 0,
    premiumLeadCount: 0,
    recommendedRouting: "Review queue",
    smtpSafeCount: 0,
  };
  let workspaceWarning: string | null = null;

  try {
    const recommendationWorkspace = await listRecommendationsForCustomer(
      customerContext.companyName,
      50,
    );
    recommendationStats = recommendationWorkspace.stats;
  } catch (error) {
    workspaceWarning ??= getCustomerWorkspaceErrorMessage(
      error,
      "The recommendation workspace is temporarily unavailable.",
    );
  }

  try {
    const cohortWorkspace = await listCohortsForCustomer(customerContext.companyName);
    const focus = cohortWorkspace.cohorts[0] ?? null;

    if (focus) {
      currentCohort = {
        deliveryEmailStatus: focus.delivery_email_status ?? null,
        deliveryState: focus.delivery_state,
        deliveryWeekLabel: focus.delivery_week_label ?? null,
        memberCount: focus.members.length,
        name: focus.name,
        premiumDensity: focus.premium_density,
        readinessPercent: focus.readiness_percent,
        scheduledFor: focus.scheduled_for ?? null,
        smtpSafeCount: focus.smtp_safe_count,
      };
    }
  } catch (error) {
    workspaceWarning ??= getCustomerWorkspaceErrorMessage(
      error,
      "The cohort workspace is temporarily unavailable.",
    );
  }

  try {
    const workspace = await getExportWorkspaceForCustomer(
      customerContext.companyName,
      parseExportFilterState(new URLSearchParams()),
    );
    exportSummary = workspace.summary;
  } catch (error) {
    workspaceWarning ??= getCustomerWorkspaceErrorMessage(
      error,
      "The export workspace is temporarily unavailable.",
    );
  }

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="dashboard_viewed"
        oncePerSessionKey="dashboard-viewed"
        properties={{ location: ROUTES.DASHBOARD }}
      />

      <CustomerPageHero
        eyebrow="Weekly intelligence delivery center"
        title={<>Welcome back, {firstName}.</>}
        description={
          <>
            This workspace keeps the focus on what matters this week: premium opportunities,
            SMTP-safe contacts, current cohort readiness, and what&apos;s ready to move into
            outbound.
          </>
        }
      />

      {workspaceWarning ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/8 px-5 py-4 text-sm leading-7 text-[#f0d8ac]">
          <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <div>
            <p className="font-semibold text-[#fff3d8]">Live workspace sync is temporarily limited.</p>
            <p className="mt-1">{workspaceWarning}</p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          description={`${recommendationStats.pendingReview} still waiting for human review.`}
          title="Premium opportunities"
          value={String(recommendationStats.premiumOpportunities)}
        />
        <MetricCard
          description={`${recommendationStats.approved} already approved for the next step.`}
          title="SMTP-safe contacts"
          value={String(recommendationStats.smtpReady)}
        />
        <MetricCard
          description={
            currentCohort
              ? `${currentCohort.smtpSafeCount} contacts in the current cohort are already SMTP-safe.`
              : "Your first cohort is still being curated."
          }
          title="This week's delivery"
          value={String(currentCohort?.memberCount ?? 0)}
        />
        <MetricCard
          description="Average opportunity score across surfaced opportunities."
          title="Recommendation quality"
          value={String(recommendationStats.avgRecommendationScore)}
        />
        <MetricCard
          description={`${exportSummary.approvedDraftCount} approved drafts already packaged.`}
          title="Export-ready status"
          value={String(exportSummary.exportReadyCohorts)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Current delivery focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentCohort ? (
              <>
                <p className="text-sm font-medium text-muted">Current delivery</p>
                <h2 className="text-3xl md:text-4xl">{currentCohort.name}</h2>
                <p className="text-muted">
                  {currentCohort.memberCount} opportunities packaged with{" "}
                  {formatPercent(currentCohort.premiumDensity)} premium density and{" "}
                  {currentCohort.smtpSafeCount} SMTP-safe contacts.
                </p>
                <div className="space-y-1 text-sm text-muted">
                  <p>{`Delivery state: ${currentCohort.deliveryState}`}</p>
                  <p>{`Delivery week: ${currentCohort.deliveryWeekLabel ?? "Unscheduled"}`}</p>
                  <p>{`Delivery readiness: ${formatPercent(currentCohort.readinessPercent)}`}</p>
                </div>
                <Link href={ROUTES.COHORTS} className="btn-primary inline-flex">
                  Review cohort -&gt;
                </Link>
              </>
            ) : (
              <EmptyState
                className="border-0 shadow-none"
                description="We&apos;ll surface your current cohort here once enough reviewed opportunities clear delivery and safety thresholds."
                title="Your first cohort is still being curated"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This week&apos;s delivery window</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-2xl font-semibold text-ink">
              Next review window: Monday {getNextMondayLabel()} at 10 AM
            </p>
            {currentCohort?.scheduledFor ? (
              <p className="text-sm text-muted">
                {`Current delivery is scheduled for ${formatLongDate(currentCohort.scheduledFor)} and is ${currentCohort.deliveryState}.`}
              </p>
            ) : null}
            {latestBatch ? (
              <div className="space-y-2 text-muted">
                <p>{`Last delivery: ${latestBatch.deliveryDateLabel}`}</p>
                <p>{`${latestBatch.leadCount} opportunities surfaced with ${latestBatch.verifiedEmails} verified contacts.`}</p>
                <p>{`${latestBatch.positiveCount} marked positive and ${latestBatch.negativeCount} marked not a fit.`}</p>
                <Link
                  href={`${ROUTES.BRIEFS}/${latestBatch.id}`}
                  className="inline-flex font-semibold text-terracotta underline underline-offset-4"
                >
                  Review delivery history -&gt;
                </Link>
              </div>
            ) : (
              <p className="text-muted">
                Your first delivery snapshot will appear here as soon as the review window closes.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <MetricCard
          description="Reviewed opportunities delivered across your workspace so far."
          title="Lifetime opportunities"
          value={String(lifetimeLeadsDelivered)}
        />
        <MetricCard
          description="Positive feedback rate from your recent reviewed deliveries."
          title="Operator fit trend"
          value={matchRateLast30Days !== null ? `${matchRateLast30Days}%` : "--"}
        />
        <MetricCard
          description="Recommended routing for the current export mix."
          title="Packaging route"
          value={exportSummary.recommendedRouting}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Delivery brief at-a-glance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted">
            {icpSummary ??
              "Your delivery brief hasn&apos;t been configured yet. We&apos;ll use it to refine target buyers, industries, and trigger signals before the next review cycle."}
          </p>
          <Link
            href={ROUTES.ICP}
            className="font-semibold text-terracotta underline underline-offset-4"
          >
            Review delivery brief -&gt;
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
