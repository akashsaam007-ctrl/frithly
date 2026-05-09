import Link from "next/link";
import {
  ArrowRight,
  CircleOff,
  MailCheck,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { PageEvent } from "@/components/analytics/page-event";
import { PlanGate } from "@/components/customer/plan-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getRecommendationAssets } from "@/lib/backend-api/customer-recommendations";
import {
  getSmtpWorkspaceForCustomer,
  parseSmtpFilterState,
  type SmtpGroupBy,
  type SmtpQueueFilter,
  type SmtpStageStatus,
  type SmtpValidationStage,
  type SmtpWorkspaceFilters,
  type SmtpWorkspaceLead,
} from "@/lib/backend-api/customer-smtp";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatLongDate } from "@/lib/utils";
import {
  addSmtpLeadToCohortAction,
  generateSmtpDraftAction,
  reviewSmtpLeadAction,
  validateSmtpLeadAction,
} from "./actions";

type SmtpPageProps = {
  searchParams?: Promise<{
    companyId?: string | string[] | undefined;
    groupBy?: string | string[] | undefined;
    queue?: string | string[] | undefined;
  }>;
};

type UnknownRecord = Record<string, unknown>;

const GROUP_OPTIONS: Array<{ description: string; label: string; value: SmtpGroupBy }> = [
  {
    description: "Sort the safety queue by risk posture first.",
    label: "Risk",
    value: "risk",
  },
  {
    description: "Keep validation work grouped by campaign intent.",
    label: "Campaign",
    value: "campaign",
  },
  {
    description: "See what is already attached to deployment groups.",
    label: "Cohort",
    value: "cohort",
  },
  {
    description: "Watch domain pressure and cooldown patterns.",
    label: "Domain",
    value: "domain",
  },
  {
    description: "Triage by confidence before spending operator effort.",
    label: "Confidence",
    value: "confidence",
  },
];

const QUEUE_OPTIONS: Array<{
  description: string;
  label: string;
  value: SmtpQueueFilter;
}> = [
  {
    description: "All visible SMTP candidates in this workspace.",
    label: "All",
    value: "all",
  },
  {
    description: "Approved leads waiting for manual SMTP review or manual approval.",
    label: "Pending",
    value: "pending",
  },
  {
    description: "Routes already considered SMTP-safe.",
    label: "Approved",
    value: "approved",
  },
  {
    description: "Routes currently marked unsafe.",
    label: "Blocked",
    value: "blocked",
  },
  {
    description: "Routes deferred by cooldown protection.",
    label: "Cooldown",
    value: "cooldown",
  },
  {
    description: "Routes carrying catch-all uncertainty.",
    label: "Catch-all",
    value: "catch_all",
  },
  {
    description: "Structurally promising but still uncertain.",
    label: "Cautious",
    value: "cautious",
  },
];

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.round(value * 100)}%`;
}

function formatConfidence(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.round(value * 100)}%`;
}

function getContactabilityVariant(contactability: string | null | undefined) {
  const normalized = (contactability ?? "").trim().toLowerCase();

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

function getRiskVariant(label: string) {
  const normalized = label.trim().toLowerCase();

  if (normalized.includes("safe")) {
    return "success" as const;
  }

  if (normalized.includes("strong")) {
    return "default" as const;
  }

  if (normalized.includes("blocked") || normalized.includes("catch-all")) {
    return "muted" as const;
  }

  return "outline" as const;
}

function getQueueVariant(queueState: SmtpWorkspaceLead["queueState"]) {
  if (queueState === "approved") {
    return "success" as const;
  }

  if (queueState === "pending") {
    return "default" as const;
  }

  if (queueState === "blocked" || queueState === "cooldown" || queueState === "catch_all") {
    return "muted" as const;
  }

  return "outline" as const;
}

function getTimelineVariant(status: SmtpStageStatus) {
  if (status === "passed") {
    return "success" as const;
  }

  if (status === "failed") {
    return "muted" as const;
  }

  if (status === "cautious") {
    return "default" as const;
  }

  return "outline" as const;
}

function getSignalHistory(outbound: UnknownRecord) {
  const history = outbound.history;

  if (!Array.isArray(history)) {
    return [] as UnknownRecord[];
  }

  return history.filter(isRecord).slice(-5).reverse();
}

function buildFilterHref(
  filters: SmtpWorkspaceFilters,
  overrides: Partial<SmtpWorkspaceFilters> & { companyId?: number | null },
) {
  const params = new URLSearchParams();
  params.set("groupBy", overrides.groupBy ?? filters.groupBy);
  params.set("queue", overrides.queue ?? filters.queue);

  if (overrides.companyId !== undefined && overrides.companyId !== null) {
    params.set("companyId", String(overrides.companyId));
  }

  return `${ROUTES.SMTP}?${params.toString()}`;
}

function isValidationEligible(lead: SmtpWorkspaceLead) {
  return lead.approved && Boolean(lead.founderEmail) && lead.queueState !== "blocked";
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

function FilterChip({
  active,
  description,
  href,
  label,
}: {
  active: boolean;
  description: string;
  href: string;
  label: string;
}) {
  return (
    <Button asChild size="sm" variant={active ? "primary" : "secondary"}>
      <Link href={href} title={description}>
        {label}
      </Link>
    </Button>
  );
}

function TimelineStage({ stage }: { stage: SmtpValidationStage }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={getTimelineVariant(stage.status)}>{stage.label}</Badge>
            {stage.timestamp ? (
              <Badge variant="outline">{formatLongDate(stage.timestamp)}</Badge>
            ) : null}
          </div>
          <p className="text-sm leading-7 text-muted">{stage.detail}</p>
        </div>
        <div className="rounded-2xl border border-border bg-stone-50 px-4 py-3 text-sm text-muted">
          <p className="font-semibold text-ink">Confidence shift</p>
          <p className="mt-1">{stage.confidenceShift}</p>
        </div>
      </div>
    </div>
  );
}

export default async function SmtpPage({ searchParams }: SmtpPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedCompanyId = Number(readParam(resolvedSearchParams?.companyId));
  const filters = parseSmtpFilterState({
    groupBy: resolvedSearchParams?.groupBy,
    queue: resolvedSearchParams?.queue,
  });
  const customerContext = await getCurrentCustomerContext();
  const hasWorkspaceAccess = hasCustomerWorkspaceAccess(customerContext.customer);

  if (!hasWorkspaceAccess) {
    return (
      <Container className="space-y-8 px-0">
        <PageEvent
          name="smtp_viewed"
          oncePerSessionKey="smtp-viewed"
          properties={{ location: ROUTES.SMTP, workspace_access: "locked" }}
        />
        <PlanGate customer={customerContext.customer} lockedFeature="smtp" />
      </Container>
    );
  }

  let errorMessage: string | null = null;
  const workspace = await getSmtpWorkspaceForCustomer(customerContext.companyName, filters).catch((error) => {
    errorMessage =
      error instanceof Error
        ? error.message
        : "We couldn't load SMTP safety intelligence from the backend.";

    return {
      filters,
      groups: [],
      items: [],
      queueCounts: {
        all: 0,
        approved: 0,
        blocked: 0,
        catch_all: 0,
        cautious: 0,
        cooldown: 0,
        pending: 0,
      },
      stats: {
        catchAllDetections: 0,
        cautiousLeads: 0,
        checkedLeads: 0,
        domainCooldowns: 0,
        failedValidations: 0,
        pendingApprovals: 0,
        smtpSafeLeads: 0,
        strongRouting: 0,
        validationSuccessRate: null,
      },
    };
  });

  const selectedLead =
    workspace.items.find((item) => item.companyId === requestedCompanyId) ??
    workspace.items[0] ??
    null;
  const selectedAssets = selectedLead
    ? await getRecommendationAssets(selectedLead.companyId).catch(() => null)
    : null;
  const selectedSignals = selectedAssets?.lead ? getSignalHistory(selectedAssets.lead.outbound) : [];

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="smtp_viewed"
        oncePerSessionKey="smtp-viewed"
        properties={{ location: ROUTES.SMTP, workspace_access: "active" }}
      />
      {selectedLead ? (
        <PageEvent
          name="smtp_detail_viewed"
          oncePerSessionKey={`smtp-detail-viewed:${selectedLead.companyId}`}
          properties={{
            company_id: selectedLead.companyId,
            location: `${ROUTES.SMTP}?companyId=${selectedLead.companyId}`,
          }}
        />
      ) : null}

      <section className="rounded-2xl border border-border bg-white p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-terracotta/5 px-4 py-2 text-sm font-semibold text-terracotta">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Outbound safety control center
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl">SMTP that feels selective, not technical</h1>
              <p className="max-w-3xl text-lg leading-8 text-muted">
                This workspace keeps verification human-gated and confidence-aware. Instead of
                exposing protocol noise, it shows which routes are safe, which ones are merely
                strong, and which ones should stay out of outbound entirely.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href={ROUTES.RECOMMENDATIONS}>
                Review recommendations
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={ROUTES.COHORTS}>
                Review cohorts
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <ErrorState
          description={errorMessage}
          title="SMTP safety intelligence is temporarily unavailable"
        />
      ) : workspace.queueCounts.all === 0 ? (
        <EmptyState
          action={
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href={ROUTES.RECOMMENDATIONS}>Review recommendations</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={ROUTES.DRAFTS}>Review drafts</Link>
              </Button>
            </div>
          }
          description="No customer-scoped routes are visible yet. Once recommendations and drafts exist, this page will surface the SMTP-safe, pending, blocked, and catch-all queues without exposing delivery-engine internals."
          title="No SMTP queue yet"
        />
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard
              description="Routes already considered safe enough for outbound use."
              title="SMTP-safe leads"
              value={String(workspace.stats.smtpSafeLeads)}
            />
            <MetricCard
              description={`${workspace.stats.checkedLeads} routes have gone through a stored validation state.`}
              title="Validation success rate"
              value={formatPercent(workspace.stats.validationSuccessRate)}
            />
            <MetricCard
              description="Routes rejected or blocked by policy and safety controls."
              title="Failed validations"
              value={String(workspace.stats.failedValidations)}
            />
            <MetricCard
              description="Routes where catch-all behavior keeps certainty lower."
              title="Catch-all detections"
              value={String(workspace.stats.catchAllDetections)}
            />
            <MetricCard
              description="Leads that still need human approval before SMTP review is allowed."
              title="Pending approvals"
              value={String(workspace.stats.pendingApprovals)}
            />
            <MetricCard
              description="Unique domains currently protected by cooldown rules."
              title="Domain cooldowns"
              value={String(workspace.stats.domainCooldowns)}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
            <Card>
              <CardHeader>
                <CardTitle>Queue controls</CardTitle>
                <CardDescription>
                  Keep the queue selective by switching between safety states and then grouping by
                  the context that matters most for operator work.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-ink">Validation queue</p>
                  <div className="flex flex-wrap gap-2">
                    {QUEUE_OPTIONS.map((option) => (
                      <FilterChip
                        key={option.value}
                        active={filters.queue === option.value}
                        description={option.description}
                        href={buildFilterHref(filters, {
                          companyId: selectedLead?.companyId ?? null,
                          queue: option.value,
                        })}
                        label={`${option.label} (${workspace.queueCounts[option.value]})`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-ink">Group the queue by</p>
                  <div className="flex flex-wrap gap-2">
                    {GROUP_OPTIONS.map((option) => (
                      <FilterChip
                        key={option.value}
                        active={filters.groupBy === option.value}
                        description={option.description}
                        href={buildFilterHref(filters, {
                          companyId: selectedLead?.companyId ?? null,
                          groupBy: option.value,
                        })}
                        label={option.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-stone-50 p-4">
                    <p className="text-sm font-semibold text-ink">Strong routing pool</p>
                    <p className="mt-2 text-3xl font-bold text-ink">
                      {workspace.stats.strongRouting}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Approved routes strong enough to justify manual SMTP review next.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-stone-50 p-4">
                    <p className="text-sm font-semibold text-ink">Cautious pool</p>
                    <p className="mt-2 text-3xl font-bold text-ink">
                      {workspace.stats.cautiousLeads}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Leads with some route signal, but not enough certainty for a safe fast path.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Safety principles</CardTitle>
                <CardDescription>
                  The goal is not to validate everything. It is to protect reputation while making
                  the best reviewed routes operationally visible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">Manual approval first</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        SMTP review only appears after a human approves the lead and selects a real
                        route. That keeps probing aligned with lead value.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <div className="flex items-start gap-3">
                    <MailCheck className="mt-1 h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">Layered verification</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        Every route moves through syntax, MX, catch-all, and SMTP stages. The page
                        shows that progression without exposing raw protocol noise.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-stone-50 p-5">
                  <div className="flex items-start gap-3">
                    <TimerReset className="mt-1 h-5 w-5 shrink-0 text-terracotta" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-ink">Cooldown protection</p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        Cooldowns and policy gates stay visible so operators understand why some
                        domains are deferred instead of repeatedly probed.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {workspace.items.length === 0 ? (
            <EmptyState
              action={
                <Button asChild variant="secondary">
                  <Link href={buildFilterHref(filters, { queue: "all", companyId: null })}>
                    Clear queue filter
                  </Link>
                </Button>
              }
              description="The current queue filter is too narrow for the visible customer data. Try a broader safety bucket to see the full routing picture."
              title="No leads match this safety filter"
            />
          ) : (
            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                {workspace.groups.map((group) => (
                  <Card key={`${filters.groupBy}-${group.key}`}>
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{group.label}</Badge>
                        <Badge variant="muted">{`${group.count} lead${group.count === 1 ? "" : "s"}`}</Badge>
                      </div>
                      <CardDescription>{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {group.leads.map((lead) => {
                        const detailHref = buildFilterHref(filters, { companyId: lead.companyId });

                        return (
                          <div
                            key={lead.companyId}
                            className={
                              selectedLead?.companyId === lead.companyId
                                ? "rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5"
                                : "rounded-2xl border border-border bg-stone-50 p-5"
                            }
                          >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant={getRiskVariant(lead.riskLabel)}>{lead.riskLabel}</Badge>
                                  <Badge variant={getQueueVariant(lead.queueState)}>{lead.queueLabel}</Badge>
                                  <Badge variant="outline">{`Lead ${lead.leadScore}`}</Badge>
                                  <Badge variant={getContactabilityVariant(lead.contactability)}>
                                    {lead.contactability}
                                  </Badge>
                                </div>

                                <div className="space-y-2">
                                  <h2 className="text-2xl font-semibold text-ink">{lead.companyName}</h2>
                                  <p className="text-sm leading-6 text-muted">
                                    {lead.founderName
                                      ? `${lead.founderName}${lead.founderEmail ? ` | ${lead.founderEmail}` : ""}`
                                      : lead.founderEmail ?? "Founder route still unresolved"}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-muted">
                                <p className="font-semibold text-ink">{lead.recommendedRouting}</p>
                                <p className="mt-1">{lead.freshnessLabel}</p>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                              <div className="rounded-2xl border border-border bg-white p-4">
                                <p className="text-sm font-semibold text-ink">Safety explanation</p>
                                <p className="mt-2 text-sm leading-7 text-muted">{lead.safetyExplanation}</p>
                              </div>
                              <div className="rounded-2xl border border-border bg-white p-4">
                                <p className="text-sm font-semibold text-ink">Validation timeline</p>
                                <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                                  {lead.validationTimeline.map((stage) => (
                                    <li key={`${lead.companyId}-${stage.key}`}>
                                      {`${stage.label}: ${stage.confidenceShift}`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
                              {lead.campaignName ? <Badge variant="muted">{lead.campaignName}</Badge> : null}
                              {lead.cohortName ? <Badge variant="outline">{lead.cohortName}</Badge> : null}
                              {lead.city ? <Badge variant="muted">{lead.city}</Badge> : null}
                              <Badge variant="outline">{lead.confidenceBucketLabel}</Badge>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button asChild size="sm" variant="secondary">
                                <Link href={detailHref}>View safety</Link>
                              </Button>
                              {lead.recommendationExists ? (
                                <Button asChild size="sm" variant="ghost">
                                  <Link href={`${ROUTES.RECOMMENDATIONS}?companyId=${lead.companyId}`}>
                                    View lead
                                  </Link>
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="xl:sticky xl:top-24 xl:self-start">
                {selectedLead && selectedAssets ? (
                  <Card>
                    <CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getRiskVariant(selectedLead.riskLabel)}>{selectedLead.riskLabel}</Badge>
                        <Badge variant={getQueueVariant(selectedLead.queueState)}>{selectedLead.queueLabel}</Badge>
                        <Badge variant="outline">{`Recommendation ${selectedLead.recommendationScore}`}</Badge>
                      </div>
                      <CardTitle className="text-3xl">{selectedLead.companyName}</CardTitle>
                      <CardDescription>
                        {selectedLead.founderName
                          ? `${selectedLead.founderName}${selectedLead.founderEmail ? ` | ${selectedLead.founderEmail}` : ""}`
                          : selectedLead.founderEmail ?? "Founder route still unresolved"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex flex-wrap gap-2">
                        {selectedLead.reviewStatus !== "approved" ? (
                          <>
                            <form action={reviewSmtpLeadAction}>
                              <input name="companyId" type="hidden" value={selectedLead.companyId} />
                              <input
                                name="returnTo"
                                type="hidden"
                                value={buildFilterHref(filters, { companyId: selectedLead.companyId })}
                              />
                              <input name="status" type="hidden" value="approved" />
                              <Button size="sm" type="submit">Approve</Button>
                            </form>

                            <form action={reviewSmtpLeadAction}>
                              <input name="companyId" type="hidden" value={selectedLead.companyId} />
                              <input
                                name="returnTo"
                                type="hidden"
                                value={buildFilterHref(filters, { companyId: selectedLead.companyId })}
                              />
                              <input name="status" type="hidden" value="rejected" />
                              <Button size="sm" type="submit" variant="ghost">
                                Reject
                              </Button>
                            </form>
                          </>
                        ) : null}

                        <form action={validateSmtpLeadAction}>
                          <input name="companyId" type="hidden" value={selectedLead.companyId} />
                          <input
                            name="returnTo"
                            type="hidden"
                            value={buildFilterHref(filters, { companyId: selectedLead.companyId })}
                          />
                          <Button disabled={!isValidationEligible(selectedLead)} size="sm" type="submit">
                            SMTP validate
                          </Button>
                        </form>

                        <form action={generateSmtpDraftAction}>
                          <input name="companyId" type="hidden" value={selectedLead.companyId} />
                          <input
                            name="returnTo"
                            type="hidden"
                            value={buildFilterHref(filters, { companyId: selectedLead.companyId })}
                          />
                          <Button disabled={!selectedLead.approved} size="sm" type="submit" variant="secondary">
                            {selectedLead.draftExists ? "Refresh draft" : "Generate draft"}
                          </Button>
                        </form>

                        <form action={addSmtpLeadToCohortAction}>
                          <input name="companyId" type="hidden" value={selectedLead.companyId} />
                          <input
                            name="returnTo"
                            type="hidden"
                            value={buildFilterHref(filters, { companyId: selectedLead.companyId })}
                          />
                          <Button
                            disabled={!selectedLead.approved || !selectedLead.founderEmail}
                            size="sm"
                            type="submit"
                            variant="ghost"
                          >
                            Add to cohort
                          </Button>
                        </form>
                      </div>

                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Safety explanation</p>
                        <p className="mt-2 text-sm leading-7 text-muted">{selectedLead.safetyExplanation}</p>
                        {selectedLead.policyReason ? (
                          <div className="mt-3 rounded-xl border border-border bg-white p-3 text-sm leading-6 text-muted">
                            {selectedLead.policyReason}
                          </div>
                        ) : null}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-stone-50 p-4">
                          <p className="text-sm font-semibold text-ink">Risk categorization</p>
                          <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                            <li>{`Risk: ${selectedLead.riskLabel}`}</li>
                            <li>{`Queue: ${selectedLead.queueLabel}`}</li>
                            <li>{`Founder confidence: ${formatConfidence(selectedLead.founderConfidence)}`}</li>
                            <li>{`Contactability: ${selectedLead.contactability}`}</li>
                          </ul>
                        </div>

                        <div className="rounded-2xl border border-border bg-stone-50 p-4">
                          <p className="text-sm font-semibold text-ink">Route posture</p>
                          <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                            <li>{`SMTP state: ${selectedLead.smtpState}`}</li>
                            <li>{`Selected route status: ${selectedLead.selectedEmailStatus ?? "unknown"}`}</li>
                            <li>{`MX valid: ${selectedLead.selectedEmailMxValid === true ? "yes" : selectedLead.selectedEmailMxValid === false ? "no" : "unknown"}`}</li>
                            <li>{`Catch-all risk: ${selectedLead.selectedEmailCatchAll === true ? "yes" : selectedLead.selectedEmailCatchAll === false ? "no" : "unknown"}`}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Validation timeline</p>
                        <div className="mt-3 space-y-3">
                          {selectedLead.validationTimeline.map((stage) => (
                            <TimelineStage key={`${selectedLead.companyId}-${stage.key}`} stage={stage} />
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Why this route is in scope</p>
                        <p className="mt-2 text-sm leading-7 text-muted">{selectedLead.reason}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedLead.campaignName ? (
                            <Badge variant="muted">{selectedLead.campaignName}</Badge>
                          ) : null}
                          {selectedLead.cohortName ? (
                            <Badge variant="outline">{selectedLead.cohortName}</Badge>
                          ) : null}
                          {selectedLead.city ? <Badge variant="muted">{selectedLead.city}</Badge> : null}
                          {selectedLead.sourceQuery ? (
                            <Badge variant="outline">{selectedLead.sourceQuery}</Badge>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Enrichment context</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedAssets.lead.services.slice(0, 6).map((service) => (
                            <Badge key={service} variant="muted">
                              {service}
                            </Badge>
                          ))}
                          {selectedAssets.lead.tech_stack.slice(0, 5).map((tech) => (
                            <Badge key={tech} variant="outline">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-muted">
                          {selectedAssets.lead.about_text
                            ? `${selectedAssets.lead.about_text.slice(0, 420)}${selectedAssets.lead.about_text.length > 420 ? "..." : ""}`
                            : "No website summary is available for this route yet."}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Safety explanations</p>
                        <div className="mt-3 space-y-3">
                          <div className="rounded-xl border border-border bg-white p-4 text-sm leading-7 text-muted">
                            {selectedLead.reviewStatus !== "approved"
                              ? "SMTP validation is skipped because this lead has not been manually approved yet."
                              : selectedLead.queueState === "cooldown"
                                ? "Validation is deferred because cooldown protection is active for this route."
                                : selectedLead.riskCategory === "catch_all_risk"
                                  ? "Catch-all detection lowers certainty, so this route stays in a caution bucket."
                                  : "The current state reflects the route's actual review and validation posture."}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Previous signals</p>
                        <div className="mt-3 space-y-3">
                          {selectedSignals.length > 0 ? (
                            selectedSignals.map((signal, index) => (
                              <div
                                key={`${String(signal.event_type ?? "signal")}-${index}`}
                                className="rounded-xl border border-border bg-white p-3"
                              >
                                <p className="font-semibold text-ink">
                                  {String(signal.event_type ?? "Signal")}
                                </p>
                                <p className="mt-1 text-sm text-muted">
                                  {String(signal.event_at ?? signal.created_at ?? "Unknown time")}
                                </p>
                                {signal.notes ? (
                                  <p className="mt-2 text-sm leading-6 text-muted">
                                    {String(signal.notes)}
                                  </p>
                                ) : null}
                              </div>
                            ))
                          ) : (
                            <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-3 text-sm leading-6 text-muted">
                              <CircleOff className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                              <span>No outreach history has been recorded for this lead yet.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {selectedLead.recommendationExists ? (
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`${ROUTES.RECOMMENDATIONS}?companyId=${selectedLead.companyId}`}>
                              View recommendation
                            </Link>
                          </Button>
                        ) : null}
                        {selectedLead.draftExists ? (
                          <Button asChild size="sm" variant="secondary">
                            <Link href={`${ROUTES.DRAFTS}?companyId=${selectedLead.companyId}`}>
                              Open draft
                            </Link>
                          </Button>
                        ) : null}
                        {selectedLead.cohortExists ? (
                          <Button asChild size="sm" variant="ghost">
                            <Link href={ROUTES.COHORTS}>Open cohorts</Link>
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <EmptyState
                    description="Select a lead from the SMTP queue to inspect its safety posture, validation timeline, and manual actions."
                    title="No SMTP lead selected"
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
