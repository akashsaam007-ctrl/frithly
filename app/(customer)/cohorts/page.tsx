import Link from "next/link";
import {
  ArrowRight,
  CircleOff,
  Layers3,
  MailCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PageEvent } from "@/components/analytics/page-event";
import { PlanGate } from "@/components/customer/plan-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  listCohortsForCustomer,
  type CohortReadinessFunnel,
  type WorkspaceCohort,
  type WorkspaceCohortMember,
} from "@/lib/backend-api/customer-cohorts";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatLongDate } from "@/lib/utils";
import { recordCohortSignalAction } from "./actions";

type CohortsPageProps = {
  searchParams?: Promise<{
    name?: string | string[] | undefined;
  }>;
};

type UnknownRecord = Record<string, unknown>;

type FunnelStage = {
  description: string;
  label: string;
  value: number;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function formatPercent(value: number | null | undefined, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  const numeric = value * 100;
  return `${numeric.toFixed(digits)}%`;
}

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return String(Math.round(value));
}

function getContactabilityVariant(contactability: string | null | undefined) {
  const normalized = normalizeStatus(contactability);

  if (normalized === "premium") {
    return "success" as const;
  }

  if (normalized === "strong") {
    return "default" as const;
  }

  if (normalized === "medium") {
    return "outline" as const;
  }

  return "muted" as const;
}

function getCohortStatusVariant(status: string | null | undefined) {
  const normalized = normalizeStatus(status);

  if (normalized === "delivered" || normalized === "positive_reply" || normalized === "meeting_booked") {
    return "success" as const;
  }

  if (normalized === "scheduled" || normalized === "approved") {
    return "default" as const;
  }

  if (normalized === "reviewing") {
    return "outline" as const;
  }

  return "muted" as const;
}

function getSignalVariant(signal: string | null | undefined) {
  const normalized = normalizeStatus(signal);

  if (normalized === "meeting_booked" || normalized === "positive_reply") {
    return "success" as const;
  }

  if (normalized === "sent" || normalized === "opened" || normalized === "replied") {
    return "outline" as const;
  }

  if (normalized === "bounced" || normalized === "spam_complaint") {
    return "muted" as const;
  }

  return "muted" as const;
}

function getDraftStatusLabel(member: WorkspaceCohortMember) {
  if (!member.draft) {
    return "No draft";
  }

  if (member.draft.status === "approved") {
    return "Approved draft";
  }

  if (member.draft.status === "rejected") {
    return "Rejected draft";
  }

  return "Draft in review";
}

function getReadinessLabel(member: WorkspaceCohortMember) {
  if (normalizeStatus(member.smtp_status) === "verified") {
    return "SMTP verified";
  }

  if (member.draft?.status === "approved" && member.selected_email) {
    return "Approved, awaiting SMTP";
  }

  if (member.draft) {
    return "Draft attached";
  }

  return "Review needed";
}

function getRecommendationReason(member: WorkspaceCohortMember) {
  return (
    member.recommendation?.reason?.trim() ??
    member.draft?.recommendation_reason?.trim() ??
    member.lead?.outreach_angle?.trim() ??
    member.lead?.lead_score_reasons[0] ??
    "This member made the cohort because Frithly saw enough signal quality to earn a place in this week's package."
  );
}

function getPreviousSignals(member: WorkspaceCohortMember) {
  const history = member.lead?.outbound?.history;

  if (!Array.isArray(history)) {
    return [] as UnknownRecord[];
  }

  return history.filter(isRecord).slice(-4).reverse();
}

function buildReadinessFunnelStages(funnel: CohortReadinessFunnel): FunnelStage[] {
  return [
    {
      description: "Companies found across the current delivery cycle.",
      label: "Discovered",
      value: funnel.discovered,
    },
    {
      description: "Opportunities that cleared the current quality floor.",
      label: "Qualified",
      value: funnel.qualified,
    },
    {
      description: "Companies surfaced by the recommendation engine.",
      label: "Recommended",
      value: funnel.recommended,
    },
    {
      description: "Opportunities a human has already approved.",
      label: "Approved",
      value: funnel.approved,
    },
    {
      description: "Approved opportunities strong enough for route validation.",
      label: "SMTP-ready",
      value: funnel.smtpReady,
    },
    {
      description: "Members already grouped for deployment.",
      label: "Cohort-ready",
      value: funnel.cohortReady,
    },
  ];
}

function getMemberScore(member: WorkspaceCohortMember) {
  return member.recommendation?.recommendation_score ?? member.lead?.summary.score ?? member.score;
}

function getMemberFounderConfidence(member: WorkspaceCohortMember) {
  return (
    member.recommendation?.founder_confidence ??
    member.draft?.founder_confidence ??
    member.lead?.summary.founder_confidence ??
    null
  );
}

function getMemberContactability(member: WorkspaceCohortMember) {
  return (
    member.recommendation?.contactability ??
    member.draft?.contactability ??
    member.lead?.summary.contactability_tier ??
    member.contactability_tier
  );
}

function getQualitySummary(cohort: WorkspaceCohort) {
  const scoredMembers = cohort.members.filter((member) => Number.isFinite(getMemberScore(member)));
  const averageRecommendationScore = scoredMembers.length
    ? scoredMembers.reduce((sum, member) => sum + getMemberScore(member), 0) / scoredMembers.length
    : 0;

  const founderConfidenceValues = cohort.members
    .map((member) => getMemberFounderConfidence(member))
    .filter((value): value is number => value !== null && value !== undefined && Number.isFinite(value));
  const averageFounderConfidence = founderConfidenceValues.length
    ? founderConfidenceValues.reduce((sum, value) => sum + value, 0) / founderConfidenceValues.length
    : 0;

  const premiumContactability = cohort.members.filter((member) => {
    const contactability = normalizeStatus(getMemberContactability(member));
    return contactability === "premium" || contactability === "strong";
  }).length;

  return {
    averageFounderConfidence,
    averageRecommendationScore,
    premiumContactabilityShare:
      cohort.members.length > 0 ? premiumContactability / cohort.members.length : 0,
    smtpSafeCount: cohort.smtp_safe_count,
  };
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

function SignalAction({
  campaignId,
  eventType,
  label,
  returnTo,
  variant = "secondary",
}: {
  campaignId: number;
  eventType:
    | "bounced"
    | "meeting_booked"
    | "opened"
    | "positive_reply"
    | "replied"
    | "sent";
  label: string;
  returnTo: string;
  variant?: "ghost" | "primary" | "secondary";
}) {
  return (
    <form action={recordCohortSignalAction}>
      <input name="campaignId" type="hidden" value={campaignId} />
      <input name="eventType" type="hidden" value={eventType} />
      <input name="returnTo" type="hidden" value={returnTo} />
      <Button size="sm" type="submit" variant={variant}>
        {label}
      </Button>
    </form>
  );
}

export default async function CohortsPage({ searchParams }: CohortsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedName = readParam(resolvedSearchParams?.name);
  const customerContext = await getCurrentCustomerContext();
  const hasWorkspaceAccess = hasCustomerWorkspaceAccess(customerContext.customer);

  if (!hasWorkspaceAccess) {
    return (
      <Container className="space-y-8 px-0">
        <PageEvent
          name="cohorts_viewed"
          oncePerSessionKey="cohorts-viewed"
          properties={{ location: ROUTES.COHORTS, workspace_access: "locked" }}
        />
        <PlanGate customer={customerContext.customer} lockedFeature="cohorts" />
      </Container>
    );
  }

  let errorMessage: string | null = null;
  const workspace = await listCohortsForCustomer(customerContext.companyName).catch((error) => {
    errorMessage =
      error instanceof Error
        ? error.message
        : "We couldn't load cohorts from the intelligence backend.";

    return {
      campaigns: [],
      cohorts: [],
      drafts: [],
      funnel: {
        approved: 0,
        cohortReady: 0,
        discovered: 0,
        qualified: 0,
        recommended: 0,
        smtpReady: 0,
      },
      recommendations: [],
      stats: {
        activeCohorts: 0,
        meetingsBooked: 0,
        positiveReplyRate: 0,
        premiumOpportunities: 0,
        readyToSend: 0,
        smtpValidated: 0,
      },
    };
  });

  const selectedCohort =
    workspace.cohorts.find((cohort) => cohort.name === requestedName) ??
    workspace.cohorts[0] ??
    null;
  const readinessFunnel = buildReadinessFunnelStages(workspace.funnel);
  const selectedQuality = selectedCohort ? getQualitySummary(selectedCohort) : null;
  const currentDelivery = workspace.cohorts.find((cohort) => cohort.delivery_state !== "delivered") ?? workspace.cohorts[0] ?? null;
  const deliveryHistory = workspace.cohorts.filter((cohort) => cohort.delivery_state === "delivered").slice(0, 4);
  const readyDraftCount = workspace.drafts.filter((draft) => {
    const contactability = normalizeStatus(draft.contactability);

    return (
      draft.status === "approved" &&
      Boolean(draft.founder_email) &&
      (contactability === "premium" || contactability === "strong")
    );
  }).length;

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="cohorts_viewed"
        oncePerSessionKey="cohorts-viewed"
        properties={{ location: ROUTES.COHORTS, workspace_access: "active" }}
      />
      {selectedCohort ? (
        <PageEvent
          name="cohort_detail_viewed"
          oncePerSessionKey={`cohort-detail-viewed:${selectedCohort.name}`}
          properties={{
            cohort_name: selectedCohort.name,
            location: `${ROUTES.COHORTS}?name=${encodeURIComponent(selectedCohort.name)}`,
          }}
        />
      ) : null}

      <section className="rounded-2xl border border-border bg-white p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-terracotta/5 px-4 py-2 text-sm font-semibold text-terracotta">
              <Layers3 className="h-4 w-4" aria-hidden="true" />
              This week&apos;s outbound package
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl">Cohorts that feel selective and easy to act on</h1>
              <p className="max-w-3xl text-lg leading-8 text-muted">
                Frithly turns approved opportunities into compact outbound packages. This workspace
                is where you review what is ready now, what already looks safe, and what is most
                likely to deserve your attention this week.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href={ROUTES.DRAFTS}>
                Review prepared drafts
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={ROUTES.EXPORTS}>
                Review export package
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <ErrorState
          description={errorMessage}
          title="Cohort execution is temporarily unavailable"
        />
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              description="Outbound packages currently visible in this workspace."
              title="Active packages"
              value={String(workspace.stats.activeCohorts)}
            />
            <MetricCard
              description="Members already holding a verified SMTP state."
              title="SMTP-safe contacts"
              value={String(workspace.stats.smtpValidated)}
            />
            <MetricCard
              description="Cohort members that still qualify as premium opportunities."
              title="Premium opportunities"
              value={String(workspace.stats.premiumOpportunities)}
            />
            <MetricCard
              description="Positive replies divided by all recorded sends."
              title="Positive reply rate"
              value={formatPercent(workspace.stats.positiveReplyRate)}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Current delivery rhythm</CardTitle>
                <CardDescription>
                  The service works best when this stays predictable: review, package, release, then learn.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentDelivery ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getCohortStatusVariant(currentDelivery.delivery_state)}>
                        {currentDelivery.delivery_state}
                      </Badge>
                      {currentDelivery.delivery_week_label ? (
                        <Badge variant="outline">{currentDelivery.delivery_week_label}</Badge>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-ink">{currentDelivery.name}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {currentDelivery.scheduled_for
                          ? `Scheduled for ${formatLongDate(currentDelivery.scheduled_for)}`
                          : "Still being timed for release."}
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm text-muted">Opportunities</p>
                        <p className="mt-1 text-2xl font-bold text-ink">{currentDelivery.total_members}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm text-muted">SMTP-safe</p>
                        <p className="mt-1 text-2xl font-bold text-ink">{currentDelivery.checklist.smtp_safe_members}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm text-muted">Drafts ready</p>
                        <p className="mt-1 text-2xl font-bold text-ink">{currentDelivery.checklist.approved_drafts}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm leading-6 text-muted">
                    Your first weekly package is still being prepared.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent delivery history</CardTitle>
                <CardDescription>
                  Finished packages stay visible so you can track the service over time, not just this week.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {deliveryHistory.length > 0 ? (
                  deliveryHistory.map((cohort) => (
                    <div
                      key={`${cohort.name}-history`}
                      className="flex items-center justify-between rounded-2xl border border-border bg-stone-50 px-4 py-4"
                    >
                      <div>
                        <p className="font-semibold text-ink">{cohort.delivery_week_label ?? cohort.name}</p>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {cohort.total_members} opportunities • {cohort.checklist.smtp_safe_members} SMTP-safe
                        </p>
                      </div>
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`${ROUTES.COHORTS}?name=${encodeURIComponent(cohort.name)}`}>Open</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-muted">
                    Delivered packages will start appearing here once the first weekly release goes out.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Readiness funnel</CardTitle>
                <CardDescription>
                  This is the visible proof that the system narrows a wide discovery pool into a
                  much smaller deployment set.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {readinessFunnel.map((stage) => (
                  <div
                    key={stage.label}
                    className="flex items-center justify-between rounded-2xl border border-border bg-stone-50 px-4 py-4"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-ink">{stage.label}</p>
                      <p className="text-sm leading-6 text-muted">{stage.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-ink">{stage.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality story</CardTitle>
                <CardDescription>
                  This keeps the delivery package honest: fewer, stronger, and easier to trust.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-ink">Delivery supply</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{workspace.funnel.discovered}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Total discovered opportunities across the customer&apos;s visible delivery cycles.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-ink">Qualified supply</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{workspace.funnel.qualified}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Opportunities that actually met the current delivery thresholds.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-ink">Approved opportunities</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{workspace.funnel.approved}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Opportunities a human has already approved for this week&apos;s package.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <p className="text-sm font-semibold text-ink">Ready draft pool</p>
                  <p className="mt-2 text-3xl font-bold text-ink">{readyDraftCount}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Approved drafts strong enough to join a package right now.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {workspace.cohorts.length === 0 ? (
            <EmptyState
              action={
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <Link href={ROUTES.RECOMMENDATIONS}>Review opportunities</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={ROUTES.DRAFTS}>Review prepared drafts</Link>
                  </Button>
                </div>
              }
              description="Your next curated cohort will appear here after review and qualification. Once enough strong opportunities are ready, Frithly will package them into a compact outbound set."
              title="No cohort package ready yet"
            />
          ) : (
            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                {workspace.cohorts.map((cohort) => {
                  const detailHref = `${ROUTES.COHORTS}?name=${encodeURIComponent(cohort.name)}`;

                  return (
                    <Card
                      key={cohort.name}
                      className={
                        selectedCohort?.name === cohort.name
                          ? "border-terracotta/30 shadow-[0_24px_60px_rgba(212,98,58,0.12)]"
                          : undefined
                      }
                    >
                      <CardContent className="space-y-5 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={getCohortStatusVariant(cohort.status)}>
                                {cohort.delivery_state}
                              </Badge>
                              {cohort.delivery_week_label ? (
                                <Badge variant="outline">{cohort.delivery_week_label}</Badge>
                              ) : null}
                              <Badge variant="outline">{`${cohort.total_members} members`}</Badge>
                              <Badge variant="muted">{`Readiness ${formatPercent(cohort.readiness_percent)}`}</Badge>
                            </div>
                            <div className="space-y-2">
                              <h2 className="text-2xl font-semibold text-ink">{cohort.name}</h2>
                              <p className="text-sm leading-6 text-muted">
                                This package is built from reviewed opportunities, not a raw list.
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-border bg-stone-50 px-4 py-3 text-sm text-muted">
                            <p className="font-semibold text-ink">
                              {cohort.meeting_count > 0
                                ? `${cohort.meeting_count} meetings booked`
                                : `${cohort.positive_reply_count} positive replies`}
                            </p>
                            <p className="mt-1">
                              {cohort.last_run_at
                                ? `Updated ${formatLongDate(cohort.last_run_at)}`
                                : cohort.created_at
                                  ? `Created ${formatLongDate(cohort.created_at)}`
                                  : "No run history yet"}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-border bg-stone-50 p-4">
                            <p className="text-sm font-semibold text-ink">Package snapshot</p>
                            <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                              <li>{`SMTP-safe members: ${cohort.smtp_safe_count}/${cohort.members.length}`}</li>
                              <li>{`Premium density: ${formatPercent(cohort.premium_density)}`}</li>
                              <li>{`Sent count: ${cohort.sent_count}`}</li>
                            </ul>
                          </div>
                          <div className="rounded-2xl border border-border bg-stone-50 p-4">
                            <p className="text-sm font-semibold text-ink">Outcome snapshot</p>
                            <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                              <li>{`Positive replies: ${cohort.positive_reply_count}`}</li>
                              <li>{`Bounces: ${cohort.bounced_count}`}</li>
                              <li>{`Meetings: ${cohort.meeting_count}`}</li>
                            </ul>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="secondary">
                            <Link href={detailHref}>Open cohort</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="xl:sticky xl:top-24 xl:self-start">
                {selectedCohort && selectedQuality ? (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getCohortStatusVariant(selectedCohort.status)}>
                          {selectedCohort.status}
                        </Badge>
                        <Badge variant="outline">{`${selectedCohort.total_members} members`}</Badge>
                        <Badge variant="muted">{`${selectedCohort.smtp_safe_count} SMTP-safe`}</Badge>
                      </div>
                      <CardTitle className="text-3xl">{selectedCohort.name}</CardTitle>
                      <CardDescription>
                        This is the detailed view for the currently selected outbound package.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Cohort quality summary</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-border bg-white p-4">
                            <p className="text-sm text-muted">Recommendation average</p>
                            <p className="mt-1 text-2xl font-bold text-ink">
                              {formatScore(selectedQuality.averageRecommendationScore)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border bg-white p-4">
                            <p className="text-sm text-muted">Founder confidence</p>
                            <p className="mt-1 text-2xl font-bold text-ink">
                              {formatPercent(selectedQuality.averageFounderConfidence)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border bg-white p-4">
                            <p className="text-sm text-muted">Premium contactability</p>
                            <p className="mt-1 text-2xl font-bold text-ink">
                              {formatPercent(selectedQuality.premiumContactabilityShare)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-border bg-white p-4">
                            <p className="text-sm text-muted">SMTP-safe</p>
                            <p className="mt-1 text-2xl font-bold text-ink">
                              {selectedQuality.smtpSafeCount}/{selectedCohort.members.length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Execution summary</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline">{`Sent ${selectedCohort.sent_count}`}</Badge>
                          <Badge variant="outline">{`Replies ${selectedCohort.replied_count}`}</Badge>
                          <Badge variant="success">{`Positive ${selectedCohort.positive_reply_count}`}</Badge>
                          <Badge variant="outline">{`Meetings ${selectedCohort.meeting_count}`}</Badge>
                          <Badge variant="muted">{`Bounces ${selectedCohort.bounced_count}`}</Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {selectedCohort.members.map((member) => {
                          const returnTo = `${ROUTES.COHORTS}?name=${encodeURIComponent(selectedCohort.name)}`;
                          const previousSignals = getPreviousSignals(member);
                          const contactability = getMemberContactability(member);

                          return (
                            <div key={`${selectedCohort.name}-${member.company_id}`} className="rounded-2xl border border-border bg-stone-50 p-4">
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge>{`Score ${getMemberScore(member)}`}</Badge>
                                    <Badge variant={getContactabilityVariant(contactability)}>
                                      {contactability ?? "unknown"}
                                    </Badge>
                                    <Badge variant="outline">{getReadinessLabel(member)}</Badge>
                                  </div>
                                  <div>
                                    <h3 className="text-xl font-semibold text-ink">{member.company_name}</h3>
                                    <p className="text-sm leading-6 text-muted">
                                      {member.founder_name
                                        ? `${member.founder_name}${member.selected_email ? ` | ${member.selected_email}` : ""}`
                                        : member.selected_email ?? "Founder still unresolved"}
                                    </p>
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-muted">
                                  <p className="font-semibold text-ink">{getDraftStatusLabel(member)}</p>
                                  <p className="mt-1">
                                    {normalizeStatus(member.smtp_status) === "verified"
                                      ? "SMTP safe"
                                      : member.smtp_status ?? "SMTP unchecked"}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-border bg-white p-4">
                                  <p className="text-sm font-semibold text-ink">Why this member is here</p>
                                  <p className="mt-2 text-sm leading-7 text-muted">
                                    {getRecommendationReason(member)}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-border bg-white p-4">
                                  <p className="text-sm font-semibold text-ink">Member signals</p>
                                  <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                                    <li>{`Founder confidence: ${formatPercent(getMemberFounderConfidence(member))}`}</li>
                                    <li>{`Source query: ${member.source_query ?? member.lead?.summary.source_query ?? "Unavailable"}`}</li>
                                    <li>{`Latest outcome: ${member.latest_signal ?? "None yet"}`}</li>
                                  </ul>
                                </div>
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {member.draft ? (
                                  <Button asChild size="sm" variant="secondary">
                                    <Link href={`${ROUTES.DRAFTS}?companyId=${member.company_id}`}>Open draft</Link>
                                  </Button>
                                ) : null}
                                <Button asChild size="sm" variant="secondary">
                                  <Link href={`${ROUTES.RECOMMENDATIONS}?companyId=${member.company_id}`}>
                                    View opportunity
                                  </Link>
                                </Button>
                                <SignalAction
                                  campaignId={member.campaign_id}
                                  eventType="sent"
                                  label="Sent"
                                  returnTo={returnTo}
                                  variant="primary"
                                />
                                <SignalAction
                                  campaignId={member.campaign_id}
                                  eventType="positive_reply"
                                  label="Positive reply"
                                  returnTo={returnTo}
                                  variant="secondary"
                                />
                                <SignalAction
                                  campaignId={member.campaign_id}
                                  eventType="meeting_booked"
                                  label="Meeting booked"
                                  returnTo={returnTo}
                                  variant="secondary"
                                />
                                <SignalAction
                                  campaignId={member.campaign_id}
                                  eventType="bounced"
                                  label="Bounce"
                                  returnTo={returnTo}
                                  variant="ghost"
                                />
                              </div>

                              <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-border bg-white p-4">
                                  <p className="text-sm font-semibold text-ink">Recent outcomes</p>
                                  <div className="mt-3 space-y-3">
                                    {previousSignals.length > 0 ? (
                                      previousSignals.map((signal, index) => (
                                        <div
                                          key={`${String(signal.event_type ?? "signal")}-${index}`}
                                          className="rounded-xl border border-border bg-stone-50 p-3"
                                        >
                                          <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant={getSignalVariant(String(signal.event_type ?? ""))}>
                                              {String(signal.event_type ?? "Signal")}
                                            </Badge>
                                            <p className="text-xs uppercase tracking-[0.12em] text-muted">
                                              {String(signal.event_at ?? signal.created_at ?? "Unknown time")}
                                            </p>
                                          </div>
                                          {signal.notes ? (
                                            <p className="mt-2 text-sm leading-6 text-muted">
                                              {String(signal.notes)}
                                            </p>
                                          ) : null}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="flex items-start gap-3 rounded-xl border border-border bg-stone-50 p-3 text-sm leading-6 text-muted">
                                        <CircleOff className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                                        <span>No outreach history has been recorded for this member yet.</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-white p-4">
                                  <p className="text-sm font-semibold text-ink">Readiness context</p>
                                  <div className="mt-3 space-y-3">
                                    <div className="flex items-start gap-3 rounded-xl border border-border bg-stone-50 p-3">
                                      <Users className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                                      <div>
                                        <p className="font-semibold text-ink">Founder and contact route</p>
                                        <p className="mt-1 text-sm leading-6 text-muted">
                                          {member.selected_email ??
                                            member.lead?.summary.review.selected_email ??
                                            member.lead?.summary.founder_email ??
                                            "No selected email yet"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-xl border border-border bg-stone-50 p-3">
                                      <MailCheck className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                                      <div>
                                        <p className="font-semibold text-ink">Route safety</p>
                                        <p className="mt-1 text-sm leading-6 text-muted">
                                          {member.smtp_status
                                            ? `SMTP ${member.smtp_status}`
                                            : "SMTP not checked yet"}
                                          {member.lead?.summary.review.status
                                            ? ` | Review ${member.lead.summary.review.status}`
                                            : ""}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-xl border border-border bg-stone-50 p-3">
                                      <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                                      <div>
                                        <p className="font-semibold text-ink">Export readiness</p>
                                        <p className="mt-1 text-sm leading-6 text-muted">
                                          {member.lead?.summary.export_ready
                                            ? "This opportunity is marked export-ready."
                                            : "This opportunity still needs final human checks before export."}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <EmptyState
                    description="Select a cohort to inspect member quality, readiness, and outcome signals."
                    title="No cohort selected"
                  />
                )}
              </div>
            </section>
          )}
        </>
      )}
    </Container>
  );
}
