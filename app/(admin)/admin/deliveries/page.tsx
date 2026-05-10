import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MailCheck,
  PackageCheck,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { backendApi } from "@/lib/backend-api/client";
import type { BackendCohort } from "@/lib/backend-api/types";
import { ROUTES } from "@/lib/constants";
import { getAdminCustomersData } from "@/lib/supabase/admin-data";
import { formatLongDate } from "@/lib/utils";
import {
  releaseDueDeliveriesAction,
  sendDeliveryEmailAction,
  updateDeliveryStateAction,
  updateDeliveryWorkflowAction,
} from "./actions";

export const dynamic = "force-dynamic";

type DeliveryState = BackendCohort["delivery_state"];

type CustomerProfile = {
  activePackages: number;
  avgFounderConfidence: number;
  avgLeadScore: number;
  avgPremiumDensity: number;
  avgSmtpSafeRate: number;
  deliveredPackages: number;
  label: string;
  meetingRate: number;
  positiveReplyRate: number;
  preferredCohortStyle: string;
  icpQuality: string;
  contactabilityQuality: string;
  outcomePattern: string;
};

function deliveryStateRank(state: DeliveryState) {
  switch (state) {
    case "reviewing":
      return 0;
    case "approved":
      return 1;
    case "scheduled":
      return 2;
    case "preparing":
      return 3;
    case "delivered":
      return 4;
    default:
      return 5;
  }
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return formatLongDate(value);
}

function formatHours(value?: number | null) {
  if (value === null || value === undefined) {
    return "Not yet tracked";
  }

  if (value < 24) {
    return `${value.toFixed(1)}h`;
  }

  return `${(value / 24).toFixed(1)}d`;
}

function formatDeliveryStateLabel(state: DeliveryState) {
  switch (state) {
    case "preparing":
      return "Preparing";
    case "reviewing":
      return "Reviewing";
    case "approved":
      return "Approved";
    case "scheduled":
      return "Scheduled";
    case "delivered":
      return "Delivered";
    default:
      return state;
  }
}

function stateBadgeClasses(state: DeliveryState) {
  switch (state) {
    case "delivered":
      return "border-emerald-500/30 bg-emerald-500/12 text-emerald-200";
    case "scheduled":
      return "border-sky-500/30 bg-sky-500/12 text-sky-200";
    case "approved":
      return "border-violet-500/30 bg-violet-500/12 text-violet-200";
    case "reviewing":
      return "border-amber-500/30 bg-amber-500/12 text-amber-200";
    default:
      return "border-white/10 bg-white/[0.05] text-muted";
  }
}

function toDomId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function buildCustomerProfiles(items: Array<BackendCohort & { customer: Awaited<ReturnType<typeof getAdminCustomersData>>[number] | null }>) {
  const groups = new Map<string, typeof items>();

  for (const item of items) {
    const key = item.organization_external_customer_id ?? item.organization_name ?? item.name;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return Array.from(groups.entries())
    .map(([, cohorts]) => {
      const label =
        cohorts[0]?.customer?.name ??
        cohorts[0]?.organization_name ??
        "Unassigned customer";
      const deliveredPackages = cohorts.filter((cohort) => cohort.delivery_state === "delivered").length;
      const activePackages = cohorts.filter((cohort) => cohort.delivery_state !== "delivered").length;
      const totalMembers = sum(cohorts.map((cohort) => cohort.total_members));
      const totalSent = sum(cohorts.map((cohort) => cohort.sent_count));
      const totalPositiveReplies = sum(cohorts.map((cohort) => cohort.positive_reply_count));
      const totalMeetings = sum(cohorts.map((cohort) => cohort.meeting_count));
      const avgPremiumDensity = average(cohorts.map((cohort) => cohort.premium_density));
      const avgSmtpSafeRate = average(cohorts.map((cohort) => cohort.smtp_safe_rate));
      const avgFounderConfidence = average(cohorts.map((cohort) => cohort.average_founder_confidence));
      const avgLeadScore = average(cohorts.map((cohort) => cohort.average_lead_score));
      const positiveReplyRate = totalSent > 0 ? totalPositiveReplies / totalSent : 0;
      const meetingRate = totalSent > 0 ? totalMeetings / totalSent : 0;

      let icpQuality = "Selective ICP memory still forming";
      if (avgPremiumDensity >= 0.5 && avgLeadScore >= 75) {
        icpQuality = "High-quality ICP with strong premium density";
      } else if (avgPremiumDensity >= 0.3 || avgLeadScore >= 68) {
        icpQuality = "Workable ICP with good selective density";
      }

      let contactabilityQuality = "Routing quality needs close review";
      if (avgSmtpSafeRate >= 0.75) {
        contactabilityQuality = "Strong routing quality across recent packages";
      } else if (avgSmtpSafeRate >= 0.45) {
        contactabilityQuality = "Mixed routing quality with some SMTP blockers";
      }

      let outcomePattern = "Outcome signal still emerging";
      if (meetingRate >= 0.08) {
        outcomePattern = "Meetings are forming from selective weekly packages";
      } else if (positiveReplyRate >= 0.12) {
        outcomePattern = "Positive replies are tracking above the current baseline";
      } else if (totalMembers > 0 && totalSent === 0) {
        outcomePattern = "Packages are being prepared but have not been sent yet";
      }

      let preferredCohortStyle = "Balanced reviewed weekly cohort";
      if (avgFounderConfidence >= 0.8 && avgPremiumDensity >= 0.35) {
        preferredCohortStyle = "Founder-led premium shortlist";
      } else if (avgSmtpSafeRate >= 0.8) {
        preferredCohortStyle = "SMTP-safe delivery package";
      } else if (avgPremiumDensity >= 0.5) {
        preferredCohortStyle = "Premium-heavy opportunity set";
      }

      return {
        activePackages,
        avgFounderConfidence,
        avgLeadScore,
        avgPremiumDensity,
        avgSmtpSafeRate,
        contactabilityQuality,
        deliveredPackages,
        icpQuality,
        label,
        meetingRate,
        outcomePattern,
        positiveReplyRate,
        preferredCohortStyle,
      } satisfies CustomerProfile;
    })
    .sort((left, right) => {
      if (right.deliveredPackages !== left.deliveredPackages) {
        return right.deliveredPackages - left.deliveredPackages;
      }

      return right.avgPremiumDensity - left.avgPremiumDensity;
    });
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

function ChecklistPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={
        active
          ? "rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-200"
          : "rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted"
      }
    >
      {label}
    </div>
  );
}

function InlineStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default async function AdminDeliveriesPage() {
  let deliveries: BackendCohort[] = [];
  let customers: Awaited<ReturnType<typeof getAdminCustomersData>> = [];
  let deliveryLoadError: string | null = null;

  try {
    [deliveries, customers] = await Promise.all([
      backendApi.cohorts.list(),
      getAdminCustomersData(),
    ]);
  } catch (error) {
    console.error("Failed to load admin deliveries page", error);
    deliveryLoadError =
      "Delivery data could not be loaded right now. The ops workflow is still safe, but the delivery board needs the backend sync restored before it can render live packages.";
  }

  const customerById = new Map(customers.map((customer) => [customer.id, customer]));
  const items = deliveries
    .map((delivery) => ({
      ...delivery,
      customer: delivery.organization_external_customer_id
        ? customerById.get(delivery.organization_external_customer_id) ?? null
        : null,
    }))
    .sort((left, right) => {
      const stateDelta = deliveryStateRank(left.delivery_state) - deliveryStateRank(right.delivery_state);
      if (stateDelta !== 0) {
        return stateDelta;
      }

      if (right.priority_score !== left.priority_score) {
        return right.priority_score - left.priority_score;
      }

      const leftTime = new Date(left.scheduled_for ?? left.delivered_at ?? left.created_at ?? 0).getTime();
      const rightTime = new Date(right.scheduled_for ?? right.delivered_at ?? right.created_at ?? 0).getTime();
      return rightTime - leftTime;
    });

  const pendingPackages = items.filter((item) => item.delivery_state !== "delivered");
  const blockedPackages = items.filter((item) => item.blocked && item.delivery_state !== "delivered");
  const awaitingApproval = items.filter((item) => item.delivery_state === "reviewing");
  const readyForMonday = items.filter(
    (item) => item.release_ready && (item.delivery_state === "approved" || item.delivery_state === "scheduled"),
  );
  const deliveredCount = items.filter((item) => item.delivery_state === "delivered").length;
  const reviewBacklog = sum(
    items.map((item) => Math.max(0, item.checklist.total_members - item.checklist.reviewed_members)),
  );
  const smtpFailureRate =
    sum(items.map((item) => item.checklist.total_members)) > 0
      ? sum(items.map((item) => item.checklist.smtp_failure_members)) /
        sum(items.map((item) => item.checklist.total_members))
      : 0;
  const deliveryCompletionRate = items.length > 0 ? deliveredCount / items.length : 0;
  const premiumDensity =
    sum(items.map((item) => item.checklist.total_members)) > 0
      ? sum(items.map((item) => item.checklist.premium_members)) /
        sum(items.map((item) => item.checklist.total_members))
      : 0;
  const avgReviewHours = average(
    items
      .map((item) => item.time_to_review_hours)
      .filter((value): value is number => value !== null && value !== undefined),
  );
  const avgDeliveryHours = average(
    items
      .map((item) => item.time_to_delivery_hours)
      .filter((value): value is number => value !== null && value !== undefined),
  );
  const deliveryConsistencyRate = (() => {
    const deliveredWithTracking = items.filter((item) => item.delivered_on_time !== null && item.delivered_on_time !== undefined);
    if (deliveredWithTracking.length === 0) {
      return 0;
    }

    return (
      deliveredWithTracking.filter((item) => item.delivered_on_time).length / deliveredWithTracking.length
    );
  })();

  const topPriorityItems = [...pendingPackages]
    .sort((left, right) => right.priority_score - left.priority_score)
    .slice(0, 6);
  const customerProfiles = buildCustomerProfiles(items);

  const sections: { description: string; items: typeof items; title: string }[] = [
    {
      description:
        "These packages still need human review, QA, or routing cleanup before they can move into the Monday cadence.",
      items: items.filter((item) => item.delivery_state === "preparing" || item.delivery_state === "reviewing"),
      title: "Preparing now",
    },
    {
      description:
        "These packages are close to the line. Clear blockers, confirm QA, and lock them for the next Monday release.",
      items: items.filter((item) => item.delivery_state === "approved" || item.delivery_state === "scheduled"),
      title: "Monday release queue",
    },
    {
      description:
        "Delivered packages stay visible for outcome tracking, QA follow-through, and pilot customer memory.",
      items: items.filter((item) => item.delivery_state === "delivered"),
      title: "Delivery history",
    },
  ].filter((section) => section.items.length > 0);

  return (
    <Container className="space-y-8 px-0">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-terracotta/5 px-4 py-2 text-sm font-semibold text-terracotta">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              Internal delivery operations
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl">Run Monday delivery with discipline</h1>
              <p className="max-w-3xl text-lg leading-8 text-muted">
                This is the internal ops cockpit. Prioritize premium packages, clear blockers fast,
                confirm QA before release, and keep weekly delivery quality visible across the whole service.
              </p>
            </div>
          </div>

          <form action={releaseDueDeliveriesAction}>
            <Button disabled={Boolean(deliveryLoadError)} size="lg" type="submit">
              Release due deliveries
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </section>

      {deliveryLoadError ? (
        <Card className="border-amber-500/20 bg-amber-500/10">
          <CardContent className="flex items-start gap-3 p-6 text-sm leading-7 text-amber-100">
            <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <p className="font-semibold text-ink">Delivery board is temporarily offline</p>
              <p className="mt-1">{deliveryLoadError}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild size="sm" variant="secondary">
                  <Link href={ROUTES.ADMIN_BATCHES_NEW}>Open batch builder</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href={ROUTES.ADMIN_APPLICATIONS}>Review applications</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        <MetricCard
          description="Packages still moving through weekly prep or review."
          title="Pending deliveries"
          value={String(pendingPackages.length)}
        />
        <MetricCard
          description="Packages carrying blockers, QA gaps, or SMTP friction."
          title="Blocked packages"
          value={String(blockedPackages.length)}
        />
        <MetricCard
          description="Member-level review items still waiting on an operator."
          title="Review backlog"
          value={String(reviewBacklog)}
        />
        <MetricCard
          description="Packages already cleared for the next Monday release."
          title="Ready for Monday"
          value={String(readyForMonday.length)}
        />
        <MetricCard
          description="Average operator response time from package creation to review."
          title="Time to review"
          value={avgReviewHours ? formatHours(avgReviewHours) : "Not yet"}
        />
        <MetricCard
          description="Average cycle time from package creation to customer delivery."
          title="Time to delivery"
          value={avgDeliveryHours ? formatHours(avgDeliveryHours) : "Not yet"}
        />
        <MetricCard
          description="Member-level SMTP-safe coverage gap across active packages."
          title="SMTP failure rate"
          value={formatPercent(smtpFailureRate)}
        />
        <MetricCard
          description="How much of the queue is genuinely premium rather than merely usable."
          title="Premium density"
          value={formatPercent(premiumDensity)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Priority review queue</CardTitle>
            <CardDescription>
              The ops team should start here. These packages combine urgency, quality, and blocker pressure.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPriorityItems.length > 0 ? (
              topPriorityItems.map((item) => (
                <a
                  key={item.name}
                  href={`#delivery-${toDomId(item.name)}`}
                  className="block rounded-2xl border border-border p-4 transition hover:border-terracotta/40 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${stateBadgeClasses(item.delivery_state)}`}>
                          {formatDeliveryStateLabel(item.delivery_state)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted">
                          Priority {item.priority_score}
                        </span>
                        {item.review_owner ? (
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted">
                            Owner {item.review_owner}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-lg font-semibold text-ink">{item.name}</p>
                      <p className="text-sm text-muted">
                        {item.customer?.name ?? item.organization_name ?? "Unassigned customer"} •{" "}
                        {item.delivery_week_label ?? "Upcoming delivery"}
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted">
                      <p>{formatPercent(item.premium_density)} premium</p>
                      <p>{formatPercent(item.smtp_safe_rate)} SMTP-safe</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.blockers.length > 0 ? (
                      item.blockers.slice(0, 2).map((blocker) => (
                        <span
                          key={blocker}
                          className="rounded-full border border-amber-500/30 bg-amber-500/12 px-3 py-1 text-xs font-semibold text-amber-200"
                        >
                          {blocker}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-200">
                        No active blockers
                      </span>
                    )}
                    {item.blocker_tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm leading-7 text-muted">
                No active priority queue yet. Once packages start moving into review and Monday prep, the highest-leverage work will surface here.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery health dashboard</CardTitle>
            <CardDescription>
              Weekly operational visibility for consistency, throughput, and quality control.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <InlineStat label="Awaiting approval" value={String(awaitingApproval.length)} />
            <InlineStat label="Delivered packages" value={String(deliveredCount)} />
            <InlineStat label="Delivery completion" value={formatPercent(deliveryCompletionRate)} />
            <InlineStat label="On-time release rate" value={formatPercent(deliveryConsistencyRate)} />
            <InlineStat label="Avg founder confidence" value={items.length ? average(items.map((item) => item.average_founder_confidence)).toFixed(2) : "0.00"} />
            <InlineStat label="Avg lead score" value={items.length ? average(items.map((item) => item.average_lead_score)).toFixed(1) : "0.0"} />
          </CardContent>
        </Card>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{section.description}</p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {section.items.map((item) => {
              const anchorId = `delivery-${toDomId(item.name)}`;
              const deliveryDensity =
                item.total_members > 0 ? item.checklist.premium_members / item.total_members : 0;

              return (
                <Card key={`${item.name}-${item.organization_external_customer_id ?? "global"}`} id={anchorId}>
                  <CardHeader className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${stateBadgeClasses(item.delivery_state)}`}>
                          {formatDeliveryStateLabel(item.delivery_state)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted">
                          {item.delivery_week_label ?? "Unscheduled"}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted">
                          Priority {item.priority_score}
                        </span>
                        {item.delivery_email_status ? (
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted">
                            Email {item.delivery_email_status}
                          </span>
                        ) : null}
                      </div>
                      <Link
                        href={`${ROUTES.COHORTS}?name=${encodeURIComponent(item.name)}`}
                        className="text-sm font-semibold text-terracotta underline underline-offset-4"
                      >
                        Open customer view
                      </Link>
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{item.name}</CardTitle>
                      <CardDescription>
                        {item.customer?.name ?? item.organization_name ?? "Unassigned customer"} •{" "}
                        {formatDate(item.scheduled_for ?? item.created_at)}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-sm font-semibold text-ink">Delivery summary</p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
                          <li>{`${item.total_members} reviewed opportunities in package`}</li>
                          <li>{`${item.checklist.premium_members} premium opportunities`}</li>
                          <li>{`${item.checklist.smtp_safe_members} SMTP-safe contacts`}</li>
                          <li>{`${item.checklist.approved_drafts} outreach-ready drafts`}</li>
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-sm font-semibold text-ink">Operational posture</p>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
                          <li>{`Premium density ${formatPercent(deliveryDensity)}`}</li>
                          <li>{`SMTP-safe rate ${formatPercent(item.smtp_safe_rate)}`}</li>
                          <li>{`Release ready: ${item.release_ready ? "yes" : "not yet"}`}</li>
                          <li>{`QA confirmed: ${item.qa_confirmed ? "yes" : "not yet"}`}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <InlineStat label="Time to review" value={formatHours(item.time_to_review_hours)} />
                      <InlineStat label="Time to delivery" value={formatHours(item.time_to_delivery_hours)} />
                      <InlineStat label="Avg score" value={item.average_lead_score.toFixed(1)} />
                      <InlineStat label="High-conf founders" value={String(item.high_confidence_founder_count)} />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-ink">Delivery quality checklist</p>
                      <div className="flex flex-wrap gap-2">
                        <ChecklistPill
                          active={item.checklist.recommendations_reviewed}
                          label={`Reviewed ${item.checklist.reviewed_members}/${item.checklist.total_members}`}
                        />
                        <ChecklistPill
                          active={item.checklist.drafts_approved}
                          label={`Drafts ${item.checklist.approved_drafts}/${item.checklist.total_members}`}
                        />
                        <ChecklistPill
                          active={item.checklist.smtp_safe_validated}
                          label={`SMTP-safe ${item.checklist.smtp_safe_members}/${item.checklist.total_members}`}
                        />
                        <ChecklistPill
                          active={item.checklist.exports_generated}
                          label="Export snapshot"
                        />
                        <ChecklistPill
                          active={item.checklist.customer_assigned}
                          label="Customer linked"
                        />
                        <ChecklistPill
                          active={item.checklist.qa_confirmed}
                          label="Final QA confirmed"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" />
                          <p className="text-sm font-semibold text-ink">Delivery blockers</p>
                        </div>
                        {item.blockers.length > 0 || item.blocker_tags.length > 0 ? (
                          <div className="space-y-3">
                            {item.blockers.length > 0 ? (
                              <ul className="space-y-2 text-sm leading-6 text-muted">
                                {item.blockers.map((blocker) => (
                                  <li key={blocker}>{blocker}</li>
                                ))}
                              </ul>
                            ) : null}
                            {item.blocker_tags.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {item.blocker_tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-sm leading-6 text-muted">
                            No active blockers are recorded for this package right now.
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                          <p className="text-sm font-semibold text-ink">QA and ownership</p>
                        </div>
                        <ul className="space-y-2 text-sm leading-6 text-muted">
                          <li>{`Owner: ${item.review_owner ?? "Unassigned"}`}</li>
                          <li>{`QA: ${item.qa_confirmed ? `confirmed by ${item.qa_confirmed_by ?? "ops"}` : "pending"}`}</li>
                          <li>{`Exports: ${item.checklist.exports_generated ? "validated" : "pending validation"}`}</li>
                          <li>{`Delivery consistency: ${item.delivered_on_time === null || item.delivered_on_time === undefined ? "not measured yet" : item.delivered_on_time ? "on time" : "late"}`}</li>
                        </ul>
                      </div>
                    </div>

                    <form action={updateDeliveryWorkflowAction} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <input name="cohortName" type="hidden" value={item.name} />
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm text-muted">
                          <span className="font-semibold text-ink">Review owner</span>
                          <Input
                            defaultValue={item.review_owner ?? ""}
                            name="reviewOwner"
                            placeholder="Assign operator"
                            type="text"
                          />
                        </label>

                        <label className="space-y-2 text-sm text-muted">
                          <span className="font-semibold text-ink">Blocker tags</span>
                          <Input
                            defaultValue={item.blocker_tags.join(", ")}
                            name="blockerTags"
                            placeholder="smtp, draft, customer, qa"
                            type="text"
                          />
                        </label>
                      </div>

                      <label className="block space-y-2 text-sm text-muted">
                        <span className="font-semibold text-ink">Ops notes</span>
                        <Textarea
                          className="min-h-24"
                          defaultValue={item.ops_notes ?? ""}
                          name="opsNotes"
                          placeholder="Capture review context, escalation notes, or delivery-specific guidance."
                        />
                      </label>

                      <label className="block space-y-2 text-sm text-muted">
                        <span className="font-semibold text-ink">Final QA notes</span>
                        <Textarea
                          className="min-h-20"
                          defaultValue={item.qa_notes ?? ""}
                          name="qaNotes"
                          placeholder="Document final QA checks before Monday release."
                        />
                      </label>

                      <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-ink">
                        <input
                          defaultChecked={item.qa_confirmed}
                          name="qaConfirmed"
                          type="checkbox"
                          value="true"
                        />
                        Final QA confirmed for customer delivery
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" type="submit" variant="secondary">
                          Save workflow notes
                        </Button>
                      </div>
                    </form>

                    <div className="flex flex-wrap gap-2">
                      {item.delivery_state !== "reviewing" ? (
                        <form action={updateDeliveryStateAction}>
                          <input name="cohortName" type="hidden" value={item.name} />
                          <input name="state" type="hidden" value="reviewing" />
                          <Button size="sm" type="submit" variant="secondary">
                            Mark reviewing
                          </Button>
                        </form>
                      ) : null}

                      {item.delivery_state !== "approved" ? (
                        <form action={updateDeliveryStateAction}>
                          <input name="cohortName" type="hidden" value={item.name} />
                          <input name="state" type="hidden" value="approved" />
                          <Button size="sm" type="submit" variant="secondary">
                            Approve package
                          </Button>
                        </form>
                      ) : null}

                      {item.delivery_state !== "scheduled" ? (
                        <form action={updateDeliveryStateAction}>
                          <input name="cohortName" type="hidden" value={item.name} />
                          <input name="state" type="hidden" value="scheduled" />
                          <Button disabled={!item.release_ready} size="sm" type="submit" variant="secondary">
                            Schedule Monday
                          </Button>
                        </form>
                      ) : null}

                      {item.delivery_state !== "delivered" ? (
                        <form action={updateDeliveryStateAction}>
                          <input name="cohortName" type="hidden" value={item.name} />
                          <input name="state" type="hidden" value="delivered" />
                          <Button disabled={!item.release_ready} size="sm" type="submit">
                            Mark delivered
                          </Button>
                        </form>
                      ) : null}

                      {item.customer?.email ? (
                        <form action={sendDeliveryEmailAction}>
                          <input name="cohortName" type="hidden" value={item.name} />
                          <input name="customerEmail" type="hidden" value={item.customer.email} />
                          <input name="customerFirstName" type="hidden" value={item.customer.name} />
                          <input name="deliveryWeekLabel" type="hidden" value={item.delivery_week_label ?? "This week's delivery"} />
                          <input name="reviewedOpportunityCount" type="hidden" value={String(item.total_members)} />
                          <input name="premiumOpportunityCount" type="hidden" value={String(item.checklist.premium_members)} />
                          <input name="smtpSafeCount" type="hidden" value={String(item.checklist.smtp_safe_members)} />
                          <input name="draftReadyCount" type="hidden" value={String(item.checklist.approved_drafts)} />
                          <Button
                            disabled={item.delivery_state !== "delivered" || item.delivery_email_status === "sent"}
                            size="sm"
                            type="submit"
                            variant="ghost"
                          >
                            <MailCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                            {item.delivery_email_status === "sent" ? "Email sent" : "Send delivery email"}
                          </Button>
                        </form>
                      ) : null}
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted">
                      <div className="flex items-start gap-3">
                        {item.release_ready ? (
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                        ) : (
                          <Clock3 className="mt-1 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                        )}
                        <div>
                          <p className="font-semibold text-ink">Delivery notes</p>
                          <p className="mt-1">
                            {item.delivery_notes ??
                              (item.release_ready
                                ? "This package has cleared the current Monday release checklist and QA gate."
                                : "This package still needs review, routing cleanup, or QA before Monday release.")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-ink">Pilot customer profiles</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Internal memory for each customer: ICP quality, contactability strength, outcome patterns, and the cohort style that seems to work best.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {customerProfiles.length > 0 ? (
            customerProfiles.map((profile) => (
              <Card key={profile.label}>
                <CardHeader className="space-y-3">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-muted">
                    <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                    Pilot profile
                  </div>
                  <div>
                    <CardTitle>{profile.label}</CardTitle>
                    <CardDescription>
                      {profile.deliveredPackages} delivered package{profile.deliveredPackages === 1 ? "" : "s"} • {profile.activePackages} active
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InlineStat label="Premium density" value={formatPercent(profile.avgPremiumDensity)} />
                    <InlineStat label="SMTP-safe" value={formatPercent(profile.avgSmtpSafeRate)} />
                    <InlineStat label="Positive replies" value={formatPercent(profile.positiveReplyRate)} />
                    <InlineStat label="Meetings" value={formatPercent(profile.meetingRate)} />
                  </div>

                  <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-muted">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <p className="font-semibold text-ink">ICP quality</p>
                    </div>
                    <p>{profile.icpQuality}</p>
                    <p className="font-semibold text-ink">Contactability quality</p>
                    <p>{profile.contactabilityQuality}</p>
                    <p className="font-semibold text-ink">Outcome pattern</p>
                    <p>{profile.outcomePattern}</p>
                    <p className="font-semibold text-ink">Preferred cohort style</p>
                    <p>{profile.preferredCohortStyle}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="xl:col-span-3">
              <CardContent className="flex items-start gap-3 p-6 text-sm leading-7 text-muted">
                <PackageCheck className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-ink">Customer memory will appear here once weekly packages start flowing.</p>
                  <p className="mt-1">
                    As soon as packages are reviewed, delivered, and outcomes start coming back, this section will show the ICP and contactability patterns that deserve operator trust.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex items-start gap-3 p-6 text-sm leading-7 text-muted">
            <PackageCheck className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <div>
              <p className="font-semibold text-ink">No delivery packages exist yet.</p>
              <p className="mt-1">
                Once reviewed opportunities move into cohorts, they will appear here as weekly delivery packages for the Monday release rhythm.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </Container>
  );
}


