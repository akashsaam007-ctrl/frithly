import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  MapPinned,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";
import { PageEvent } from "@/components/analytics/page-event";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { PlanGate } from "@/components/customer/plan-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  getCampaignForCustomer,
  getTopCampaignOpportunities,
} from "@/lib/backend-api/customer-campaigns";
import type { BackendCampaignLead, BackendCampaignRule } from "@/lib/backend-api/types";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatLongDate } from "@/lib/utils";

type CampaignDetailPageProps = {
  params: Promise<{ id: string }>;
};

type LooseRecord = Record<string, unknown>;

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function readNumber(record: LooseRecord, key: string) {
  const value = record[key];
  return typeof value === "number" ? value : 0;
}

function readBoolean(record: LooseRecord, key: string) {
  return record[key] === true;
}

function readString(record: LooseRecord, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : "";
}

function formatRuleValue(rule: BackendCampaignRule) {
  const directValue = rule.rule_value.value;

  if (typeof directValue === "string" || typeof directValue === "number") {
    return String(directValue);
  }

  const values = rule.rule_value.values;

  if (Array.isArray(values)) {
    return values.filter((value): value is string => typeof value === "string").join(", ");
  }

  return "Configured";
}

function getOpportunityReasons(lead: BackendCampaignLead) {
  const reasons = lead.lead_metadata.reasons;

  if (!Array.isArray(reasons)) {
    return [];
  }

  return reasons.filter((reason): reason is string => typeof reason === "string").slice(0, 3);
}

function getOpportunityNarrative(lead: BackendCampaignLead) {
  if (lead.status === "qualified") {
    return "This company already cleared the delivery qualification floor.";
  }

  const reasons = getOpportunityReasons(lead);

  if (reasons.length > 0) {
    return reasons.join(" | ");
  }

  return "High-signal company surfaced by the delivery pipeline, but it still needs review.";
}

function getContactabilityVariant(contactability: string) {
  const normalized = contactability.toLowerCase();

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

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;
  const campaignId = Number(id);

  if (!Number.isFinite(campaignId)) {
    notFound();
  }

  const customerContext = await getCurrentCustomerContext();
  const hasWorkspaceAccess = hasCustomerWorkspaceAccess(customerContext.customer);

  if (!hasWorkspaceAccess) {
    return (
      <Container className="space-y-8 px-0">
        <PageEvent
          name="campaign_detail_viewed"
          oncePerSessionKey={`campaign-detail-viewed:${campaignId}`}
          properties={{ campaign_id: campaignId, location: ROUTES.CAMPAIGNS, workspace_access: "locked" }}
        />
        <PlanGate customer={customerContext.customer} lockedFeature="campaigns" />
      </Container>
    );
  }

  let detail = null as Awaited<ReturnType<typeof getCampaignForCustomer>>;
  let errorMessage: string | null = null;

  try {
    detail = await getCampaignForCustomer(customerContext.companyName, campaignId);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "We couldn't load this campaign from the intelligence backend.";
  }

  if (errorMessage) {
    return (
      <Container className="space-y-8 px-0">
        <ErrorState
          action={
            <Button asChild variant="secondary">
              <Link href={ROUTES.CAMPAIGNS}>Back to campaigns</Link>
            </Button>
          }
          description={errorMessage}
          title="Delivery pipeline detail is temporarily unavailable"
        />
      </Container>
    );
  }

  if (!detail) {
    notFound();
  }

  const { campaign, progress, query_plan: queryPlan, rules } = detail;
  const topOpportunities = getTopCampaignOpportunities(detail, 8);
  const qualificationRate =
    campaign.generated_leads > 0 ? campaign.qualified_leads / campaign.generated_leads : 0;
  const premiumDensity =
    campaign.generated_leads > 0 ? campaign.premium_leads / campaign.generated_leads : 0;
  const targetMet = readBoolean(progress, "target_met");
  const generatedLeads = readNumber(progress, "generated_leads");
  const failedLeads = readNumber(progress, "failed");
  const rejectedLeads = readNumber(progress, "rejected_leads");
  const exhaustedQueries = readNumber(progress, "exhausted_queries");
  const sendReadyLeads = readNumber(progress, "send_ready_leads");

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="campaign_detail_viewed"
        oncePerSessionKey={`campaign-detail-viewed:${campaign.id}`}
        properties={{ campaign_id: campaign.id, location: `${ROUTES.CAMPAIGNS}/${campaign.id}` }}
      />

      <section className="space-y-4">
        <Button asChild variant="ghost">
          <Link href={ROUTES.CAMPAIGNS}>
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Back to delivery pipeline
          </Link>
        </Button>

        <Card>
          <CardContent className="space-y-5 p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <CampaignStatusBadge status={campaign.status} />
                  <Badge variant="muted">{campaign.industry ?? "ICP campaign"}</Badge>
                  <Badge variant="outline">
                    Updated {formatLongDate(campaign.updated_at)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl">{campaign.name}</h1>
                  <p className="max-w-3xl text-lg leading-8 text-muted">
                    {campaign.cities.join(", ")} | quality floor {campaign.minimum_score} |
                    opportunity target {campaign.lead_goal}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-stone-50 px-5 py-4 text-sm text-muted">
                {targetMet ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>The pipeline hit its quality target and produced enough qualified opportunities.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <TriangleAlert className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                    <span>
                      The system stopped honestly when the requested opportunity target could not be
                      met at this quality floor.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Discovered opportunities</p>
            <p className="text-4xl font-bold text-ink">{generatedLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Qualified rate</p>
            <p className="text-4xl font-bold text-ink">{formatPercent(qualificationRate)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Premium density</p>
            <p className="text-4xl font-bold text-ink">{formatPercent(premiumDensity)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Outbound-ready</p>
            <p className="text-4xl font-bold text-ink">{sendReadyLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm font-medium text-muted">Average opportunity score</p>
            <p className="text-4xl font-bold text-ink">{campaign.average_score}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Delivery health</CardTitle>
            <CardDescription>
              This shows whether the system found real signal or just exhausted search space.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-stone-50 p-4">
              <p className="text-sm font-medium text-muted">Requested vs discovered</p>
              <p className="mt-2 text-2xl font-semibold text-ink">
                {campaign.requested_leads} requested | {generatedLeads} discovered
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-stone-50 p-4">
              <p className="text-sm font-medium text-muted">Rejected opportunities</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{rejectedLeads}</p>
            </div>
            <div className="rounded-2xl border border-border bg-stone-50 p-4">
              <p className="text-sm font-medium text-muted">Failed enrichments</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{failedLeads}</p>
            </div>
            <div className="rounded-2xl border border-border bg-stone-50 p-4">
              <p className="text-sm font-medium text-muted">Exhausted queries</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{exhaustedQueries}</p>
            </div>
            <div className="rounded-2xl border border-border bg-stone-50 p-4 md:col-span-2">
              <p className="text-sm font-medium text-muted">Interpretation</p>
              <p className="mt-2 text-sm leading-7 text-muted">
                {targetMet
                  ? "This campaign reached the requested target without relaxing the quality floor."
                  : "The system expanded intelligently, but the combination of founder confidence, contactability, and quality thresholds prevented it from padding weak opportunities."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery rules in play</CardTitle>
            <CardDescription>
              The filters below shaped how this delivery pipeline discovered and qualified opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-stone-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{rule.rule_type.replace(/_/g, " ")}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{formatRuleValue(rule)}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Query expansion</CardTitle>
          <CardDescription>
            Delivery pipelines expand city by city until the target is met or the quality floor breaks.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {queryPlan.length > 0 ? (
            queryPlan.map((entry, index) => {
              const query = readString(entry, "query");
              const city = readString(entry, "city");
              const stage = readString(entry, "stage") || "primary";
              const status = readString(entry, "status") || "pending";
              const mappedCompanies = readNumber(entry, "mapped_companies");
              const totalResults = readNumber(entry, "total_results");
              const qualifiedLeads = readNumber(entry, "qualified_leads");
              const updatedAt = readString(entry, "updated_at");

              return (
                <div
                  key={`${query}-${city}-${index}`}
                  className="rounded-2xl border border-border bg-stone-50 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={stage === "primary" ? "default" : "outline"}>{stage}</Badge>
                    <CampaignStatusBadge status={status} />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-ink">{query}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                    <MapPinned className="h-4 w-4" aria-hidden="true" />
                    {city || "Regional expansion"}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-white px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted">Mapped</p>
                      <p className="mt-2 text-xl font-semibold text-ink">{mappedCompanies}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-white px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted">Results</p>
                      <p className="mt-2 text-xl font-semibold text-ink">{totalResults}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-white px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-muted">Qualified</p>
                      <p className="mt-2 text-xl font-semibold text-ink">{qualifiedLeads}</p>
                    </div>
                  </div>
                  {updatedAt ? (
                    <p className="mt-4 text-xs uppercase tracking-[0.12em] text-muted">
                      Updated {formatLongDate(updatedAt)}
                    </p>
                  ) : null}
                </div>
              );
            })
          ) : (
            <EmptyState
              className="lg:col-span-2"
              description="This campaign doesn't have a query expansion trace yet."
              title="No query expansion data"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top opportunity feed</CardTitle>
          <CardDescription>
            These are the strongest companies surfaced by the delivery pipeline, even if some still missed a
            final threshold.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-2">
          {topOpportunities.length > 0 ? (
            topOpportunities.map((lead) => {
              const recommendationScore = lead.recommendation_score ?? lead.lead_score;
              const reasons = getOpportunityReasons(lead);

              return (
                <div
                  key={`${lead.company_id}-${lead.source_query ?? "lead"}`}
                  className="rounded-2xl border border-border bg-stone-50 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Opportunity score {lead.lead_score}</Badge>
                        <Badge variant={getContactabilityVariant(String(lead.contactability))}>
                          {String(lead.contactability)}
                        </Badge>
                        <Badge>{`Recommendation ${recommendationScore}`}</Badge>
                      </div>
                      <h3 className="text-2xl font-semibold text-ink">{lead.company_name}</h3>
                      <p className="text-sm leading-6 text-muted">
                        {lead.founder_name
                          ? `${lead.founder_name}${lead.founder_email ? ` | ${lead.founder_email}` : ""}`
                          : "Founder still unresolved"}
                      </p>
                    </div>

                    <div className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-muted">
                      {lead.source_query ?? "Delivery discovery"}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-muted">{getOpportunityNarrative(lead)}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {lead.services.slice(0, 4).map((service) => (
                      <Badge key={service} variant="muted">
                        {service}
                      </Badge>
                    ))}
                  </div>

                  {reasons.length > 0 ? (
                    <div className="mt-4 rounded-2xl border border-border bg-white p-4">
                      <p className="text-sm font-semibold text-ink">Why it missed</p>
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                        {reasons.map((reason) => (
                          <li key={reason} className="flex items-start gap-2">
                            <Sparkles className="mt-1 h-3.5 w-3.5 shrink-0 text-terracotta" aria-hidden="true" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
                    <span className="inline-flex items-center gap-2">
                      <Target className="h-4 w-4" aria-hidden="true" />
                      Founder confidence{" "}
                      {lead.founder_confidence !== null && lead.founder_confidence !== undefined
                        ? formatPercent(lead.founder_confidence)
                        : "unknown"}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              className="xl:col-span-2"
              description="Once this campaign starts surfacing candidates, the strongest opportunities will appear here."
              title="No delivery opportunities yet"
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
