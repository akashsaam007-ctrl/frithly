import Link from "next/link";
import {
  ArrowRight,
  CircleOff,
  MailCheck,
  ShieldCheck,
  Sparkles,
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
  getRecommendationAssets,
  listRecommendationsForCustomer,
  type WorkspaceRecommendation,
} from "@/lib/backend-api/customer-recommendations";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatLongDate } from "@/lib/utils";
import {
  addToCohortAction,
  generateDraftAction,
  refreshRecommendationsAction,
  reviewRecommendationAction,
  validateSmtpAction,
} from "./actions";

type RecommendationsPageProps = {
  searchParams?: Promise<{
    companyId?: string | string[] | undefined;
  }>;
};

type UnknownRecord = Record<string, unknown>;

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

function formatFreshness(freshness: number | null | undefined) {
  if (freshness === null || freshness === undefined) {
    return "Freshness unknown";
  }

  if (freshness <= 0) {
    return "Fresh now";
  }

  if (freshness <= 7) {
    return `Fresh within ${freshness}d`;
  }

  if (freshness <= 21) {
    return `Warm (${freshness}d)`;
  }

  return `Stale (${freshness}d)`;
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

function isSmtpEligible(recommendation: WorkspaceRecommendation) {
  const contactability = (recommendation.contactability ?? "").trim().toLowerCase();

  return (
    recommendation.approved &&
    Boolean(recommendation.founder_email) &&
    (contactability === "premium" || contactability === "strong")
  );
}

function isCohortEligible(recommendation: WorkspaceRecommendation) {
  return isSmtpEligible(recommendation);
}

function getReadinessLabel(recommendation: WorkspaceRecommendation) {
  if ((recommendation.smtp_state ?? "").toLowerCase() === "verified") {
    return "SMTP verified";
  }

  if (isSmtpEligible(recommendation)) {
    return "Ready for SMTP review";
  }

  if (recommendation.approved) {
    return "Approved, awaiting validation";
  }

  if (recommendation.reviewed) {
    return "Reviewed, not approved";
  }

  return "Needs human review";
}

function getReason(recommendation: WorkspaceRecommendation) {
  return (
    recommendation.reason?.trim() ||
    "High-signal founder/contactability mix with enough context for outbound review."
  );
}

function getDetailCandidates(payload: UnknownRecord, key: string) {
  const value = payload[key];

  if (!Array.isArray(value)) {
    return [] as UnknownRecord[];
  }

  return value.filter(isRecord);
}

function getSignalHistory(outbound: UnknownRecord) {
  const history = outbound.history;

  if (!Array.isArray(history)) {
    return [] as UnknownRecord[];
  }

  return history.filter(isRecord).slice(-5).reverse();
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

function RecommendationActionRow({
  recommendation,
  returnTo,
}: {
  recommendation: WorkspaceRecommendation;
  returnTo: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="secondary">
        <Link href={`${ROUTES.RECOMMENDATIONS}?companyId=${recommendation.company_id}`}>
          View details
        </Link>
      </Button>

      <form action={reviewRecommendationAction}>
        <input name="companyId" type="hidden" value={recommendation.company_id} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <input name="status" type="hidden" value="approved" />
        <Button
          disabled={recommendation.approved}
          size="sm"
          type="submit"
          variant={recommendation.approved ? "secondary" : "primary"}
        >
          {recommendation.approved ? "Approved" : "Approve"}
        </Button>
      </form>
    </div>
  );
}

export default async function RecommendationsPage({ searchParams }: RecommendationsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedCompanyId = Number(readParam(resolvedSearchParams?.companyId));
  const customerContext = await getCurrentCustomerContext();
  const hasWorkspaceAccess = hasCustomerWorkspaceAccess(customerContext.customer);

  if (!hasWorkspaceAccess) {
    return (
      <Container className="space-y-8 px-0">
        <PageEvent
          name="recommendations_viewed"
          oncePerSessionKey="recommendations-viewed"
          properties={{ location: ROUTES.RECOMMENDATIONS, workspace_access: "locked" }}
        />
        <PlanGate customer={customerContext.customer} lockedFeature="recommendations" />
      </Container>
    );
  }

  let errorMessage: string | null = null;
  const workspace = await listRecommendationsForCustomer(customerContext.companyName, 50).catch((error) => {
    errorMessage =
      error instanceof Error
        ? error.message
        : "We couldn't load recommendations from the intelligence backend.";

    return {
      campaigns: [],
      items: [],
      stats: {
        activeRecommendations: 0,
        approved: 0,
        avgFounderConfidence: 0,
        avgRecommendationScore: 0,
        pendingReview: 0,
        premiumOpportunities: 0,
        smtpReady: 0,
      },
    };
  });

  const selectedRecommendation =
    workspace.items.find((item) => item.company_id === requestedCompanyId) ??
    workspace.items[0] ??
    null;
  const selectedAssets = selectedRecommendation
    ? await getRecommendationAssets(selectedRecommendation.company_id).catch(() => null)
    : null;
  const selectedLead = selectedAssets?.lead ?? null;
  const selectedDraft = selectedAssets?.draft ?? null;
  const selectedFounderCandidates = selectedLead ? getDetailCandidates(selectedLead.founder_candidates, "candidates") : [];
  const selectedSignals = selectedLead ? getSignalHistory(selectedLead.outbound) : [];

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="recommendations_viewed"
        oncePerSessionKey="recommendations-viewed"
        properties={{ location: ROUTES.RECOMMENDATIONS, workspace_access: "active" }}
      />
      {selectedRecommendation ? (
        <PageEvent
          name="recommendation_detail_viewed"
          oncePerSessionKey={`recommendation-detail-viewed:${selectedRecommendation.company_id}`}
          properties={{
            company_id: selectedRecommendation.company_id,
            location: `${ROUTES.RECOMMENDATIONS}?companyId=${selectedRecommendation.company_id}`,
          }}
        />
      ) : null}

      <section className="rounded-2xl border border-border bg-white p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-terracotta/5 px-4 py-2 text-sm font-semibold text-terracotta">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              This week&apos;s curated opportunities
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl">A guided opportunity feed for this week</h1>
              <p className="max-w-3xl text-lg leading-8 text-muted">
                This feed only surfaces companies Frithly believes are worth attention right now.
                The goal isn&apos;t a giant database. It&apos;s a smaller set of stronger outbound
                opportunities with visible reasoning, confidence, and readiness.
              </p>
            </div>
          </div>

          <form action={refreshRecommendationsAction}>
            <input name="returnTo" type="hidden" value={ROUTES.RECOMMENDATIONS} />
            <Button size="lg" type="submit" variant="secondary">
              Refresh this week&apos;s feed
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      </section>

      {errorMessage ? (
        <ErrorState
          description={errorMessage}
          title="Recommendation intelligence is temporarily unavailable"
        />
      ) : workspace.items.length === 0 ? (
        <EmptyState
          action={
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href={ROUTES.DASHBOARD}>Return to dashboard</Link>
              </Button>
              <form action={refreshRecommendationsAction}>
                <input name="returnTo" type="hidden" value={ROUTES.RECOMMENDATIONS} />
                <Button type="submit">Check again after review</Button>
              </form>
            </div>
          }
          description="Your next curated opportunity package will appear here after review and qualification. Once Frithly has enough strong matches, this feed will surface the best opportunities with confidence and readiness context."
          title="No opportunities ready yet"
        />
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              description={`${workspace.stats.pendingReview} still need review.`}
              title="This week&apos;s feed"
              value={String(workspace.stats.activeRecommendations)}
            />
            <MetricCard
              description="Recommendation or opportunity score at premium level."
              title="Premium now"
              value={String(workspace.stats.premiumOpportunities)}
            />
            <MetricCard
              description="Approved and strong enough for SMTP review."
              title="Ready for outreach review"
              value={String(workspace.stats.smtpReady)}
            />
            <MetricCard
              description="Average confidence across surfaced founders."
              title="Founder confidence avg"
              value={formatPercent(workspace.stats.avgFounderConfidence)}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {workspace.items.map((recommendation) => {
                const returnTo = `${ROUTES.RECOMMENDATIONS}?companyId=${recommendation.company_id}`;

                return (
                  <Card
                    key={recommendation.id}
                    className={
                      selectedRecommendation?.company_id === recommendation.company_id
                        ? "border-terracotta/30 shadow-[0_24px_60px_rgba(212,98,58,0.12)]"
                        : undefined
                    }
                  >
                    <CardContent className="space-y-5 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge>{`Recommendation ${recommendation.recommendation_score}`}</Badge>
                            <Badge variant="outline">{`Opportunity ${recommendation.lead_score}`}</Badge>
                            <Badge variant={getContactabilityVariant(recommendation.contactability)}>
                              {recommendation.contactability ?? "unknown"}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-ink">{recommendation.company_name}</h2>
                            <p className="text-sm leading-6 text-muted">
                              {recommendation.founder_name
                                ? `${recommendation.founder_name}${recommendation.founder_role ? ` | ${recommendation.founder_role}` : ""}`
                                : "Founder still needs review"}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-border bg-stone-50 px-4 py-3 text-sm text-muted">
                          <p className="font-semibold text-ink">{getReadinessLabel(recommendation)}</p>
                          <p className="mt-1">{formatFreshness(recommendation.freshness)}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-border bg-stone-50 p-4">
                          <p className="text-sm font-semibold text-ink">Why recommended</p>
                          <p className="mt-2 text-sm leading-7 text-muted">{getReason(recommendation)}</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-stone-50 p-4">
                          <p className="text-sm font-semibold text-ink">Delivery snapshot</p>
                          <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                            <li>{`Founder confidence: ${formatPercent(recommendation.founder_confidence)}`}</li>
                            <li>{`Delivery cycle: ${recommendation.campaign_name ?? "Unlinked"}`}</li>
                            <li>{`Discovery context: ${recommendation.source_query ?? "Unavailable"}`}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
                        <Badge variant="muted">{recommendation.city ?? "Unknown city"}</Badge>
                        <Badge variant="muted">{recommendation.niche ?? "Unknown niche"}</Badge>
                        {recommendation.last_enrichment ? (
                          <Badge variant="outline">
                            Enriched {formatLongDate(recommendation.last_enrichment)}
                          </Badge>
                        ) : null}
                      </div>

                      <RecommendationActionRow recommendation={recommendation} returnTo={returnTo} />
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="xl:sticky xl:top-24 xl:self-start">
              {selectedRecommendation && selectedLead ? (
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{`Recommendation ${selectedRecommendation.recommendation_score}`}</Badge>
                      <Badge variant="outline">{selectedRecommendation.campaign_name ?? "Opportunity detail"}</Badge>
                    </div>
                    <CardTitle className="text-3xl">{selectedRecommendation.company_name}</CardTitle>
                    <CardDescription>
                      {selectedRecommendation.founder_name
                        ? `${selectedRecommendation.founder_name}${selectedRecommendation.founder_email ? ` | ${selectedRecommendation.founder_email}` : ""}`
                        : "Founder still unresolved"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                      <form action={validateSmtpAction}>
                        <input name="companyId" type="hidden" value={selectedRecommendation.company_id} />
                        <input
                          name="returnTo"
                          type="hidden"
                          value={`${ROUTES.RECOMMENDATIONS}?companyId=${selectedRecommendation.company_id}`}
                        />
                        <Button disabled={!isSmtpEligible(selectedRecommendation)} size="sm" type="submit">
                          Validate route
                        </Button>
                      </form>

                      <form action={addToCohortAction}>
                        <input name="companyId" type="hidden" value={selectedRecommendation.company_id} />
                        <input
                          name="returnTo"
                          type="hidden"
                          value={`${ROUTES.RECOMMENDATIONS}?companyId=${selectedRecommendation.company_id}`}
                        />
                        <Button disabled={!isCohortEligible(selectedRecommendation)} size="sm" type="submit" variant="secondary">
                          Add to this week&apos;s cohort
                        </Button>
                      </form>

                      <form action={generateDraftAction}>
                        <input name="companyId" type="hidden" value={selectedRecommendation.company_id} />
                        <input
                          name="returnTo"
                          type="hidden"
                          value={`${ROUTES.RECOMMENDATIONS}?companyId=${selectedRecommendation.company_id}`}
                        />
                        <Button disabled={!selectedRecommendation.approved} size="sm" type="submit" variant="ghost">
                          {selectedDraft ? "Refresh draft" : "Prepare draft"}
                        </Button>
                      </form>
                    </div>

                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Why recommended</p>
                      <p className="mt-2 text-sm leading-7 text-muted">{getReason(selectedRecommendation)}</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Delivery readiness</p>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                          <li>{`Contactability: ${selectedLead.summary.contactability_tier}`}</li>
                          <li>{`Founder confidence: ${formatPercent(selectedLead.summary.founder_confidence)}`}</li>
                          <li>{`SMTP state: ${selectedRecommendation.smtp_state ?? "not checked"}`}</li>
                          <li>{`Review status: ${selectedLead.summary.review.status}`}</li>
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Delivery cycle</p>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                          <li>{selectedRecommendation.campaign_name ?? "No delivery cycle available"}</li>
                          {selectedRecommendation.campaign_status ? (
                            <li className="flex items-center gap-2">
                              <CampaignStatusBadge status={selectedRecommendation.campaign_status} />
                            </li>
                          ) : null}
                          <li>{selectedRecommendation.source_query ?? "No source query available"}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Route quality</p>
                      <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                        <li>{`Founder email found: ${selectedLead.contactability.founder_email_found ? "yes" : "no"}`}</li>
                        <li>{`Best email confidence: ${formatPercent(Number(selectedLead.contactability.best_founder_email_confidence ?? 0))}`}</li>
                        <li>{`Contact page found: ${selectedLead.contactability.contact_page_found ? "yes" : "no"}`}</li>
                        <li>{`Observed emails: ${String(selectedLead.contactability.observed_email_count ?? 0)}`}</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Enrichment summary</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedLead.services.slice(0, 6).map((service) => (
                          <Badge key={service} variant="muted">
                            {service}
                          </Badge>
                        ))}
                        {selectedLead.tech_stack.slice(0, 5).map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        {selectedLead.about_text
                          ? `${selectedLead.about_text.slice(0, 420)}${selectedLead.about_text.length > 420 ? "..." : ""}`
                          : "No website summary is available yet."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Founder candidates</p>
                      <div className="mt-3 space-y-3">
                        {selectedFounderCandidates.length > 0 ? (
                          selectedFounderCandidates.slice(0, 3).map((candidate, index) => (
                            <div key={`${String(candidate.name ?? "candidate")}-${index}`} className="rounded-xl border border-border bg-white p-3">
                              <p className="font-semibold text-ink">{String(candidate.name ?? "Unknown founder")}</p>
                              <p className="mt-1 text-sm text-muted">
                                {String(candidate.role ?? candidate.source ?? "No role available")}
                              </p>
                              <p className="mt-2 text-sm text-muted">
                                {`Confidence ${formatPercent(Number(candidate.confidence ?? 0))}`}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm leading-6 text-muted">
                            No founder candidate breakdown is available for this recommendation yet.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Opportunity strengths</p>
                      <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
                        {selectedLead.lead_score_reasons.slice(0, 6).map((reason) => (
                          <li key={reason} className="flex items-start gap-2">
                            <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Recent activity</p>
                      <div className="mt-3 space-y-3">
                        {selectedSignals.length > 0 ? (
                          selectedSignals.map((signal, index) => (
                            <div key={`${String(signal.event_type ?? "signal")}-${index}`} className="rounded-xl border border-border bg-white p-3">
                              <p className="font-semibold text-ink">
                                {String(signal.event_type ?? "Signal")}
                              </p>
                              <p className="mt-1 text-sm text-muted">
                                {String(signal.event_at ?? signal.created_at ?? "Unknown time")}
                              </p>
                              {signal.notes ? (
                                <p className="mt-2 text-sm leading-6 text-muted">{String(signal.notes)}</p>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-3 text-sm leading-6 text-muted">
                            <CircleOff className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                            <span>No outreach history has been recorded for this company yet.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Draft preview</p>
                      {selectedDraft ? (
                        <div className="mt-3 space-y-3 rounded-xl border border-border bg-white p-4">
                          <p className="font-semibold text-ink">{selectedDraft.subject_line ?? "No subject yet"}</p>
                          <p className="text-sm leading-7 text-muted">{selectedDraft.first_line}</p>
                          <p className="text-sm leading-7 text-muted">{selectedDraft.short_pitch}</p>
                          <p className="text-sm font-medium text-ink">{selectedDraft.cta}</p>
                          <p className="text-xs uppercase tracking-[0.12em] text-muted">
                            {selectedDraft.generated_with_ai ? "AI assisted" : "Template guided"}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-start gap-3 rounded-xl border border-border bg-white p-3 text-sm leading-6 text-muted">
                          <MailCheck className="mt-1 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                          <span>No draft exists for this opportunity yet. Approve it first, then prepare a draft.</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <EmptyState
                  description="Select an opportunity to review the reasoning, readiness, and draft context."
                  title="No opportunity selected"
                />
              )}
            </div>
          </section>
        </>
      )}
    </Container>
  );
}
