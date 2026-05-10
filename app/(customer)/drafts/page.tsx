import Link from "next/link";
import {
  ArrowRight,
  CircleOff,
  FilePenLine,
  ShieldCheck,
} from "lucide-react";
import { PageEvent } from "@/components/analytics/page-event";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { CustomerPageHero } from "@/components/customer/page-hero";
import { PlanGate } from "@/components/customer/plan-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getCustomerWorkspaceErrorMessage } from "@/lib/backend-api/customer-workspace-error";
import {
  getDraftGenerationType,
  isHumanPolishedDraft,
  listDraftsForCustomer,
  type WorkspaceDraft,
} from "@/lib/backend-api/customer-drafts";
import { getRecommendationAssets } from "@/lib/backend-api/customer-recommendations";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatLongDate } from "@/lib/utils";
import { addToCohortAction, validateSmtpAction } from "../recommendations/actions";
import {
  approveDraftAction,
  refreshDraftQueueAction,
  regenerateDraftAction,
  rejectDraftAction,
  returnDraftToWorkingAction,
  saveDraftAction,
} from "./actions";

type DraftsPageProps = {
  searchParams?: Promise<{
    companyId?: string | string[] | undefined;
  }>;
};

type SourceHighlight = {
  label: string;
  text: string;
  why: string;
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

function getDraftStatusVariant(status: string) {
  switch (status) {
    case "approved":
      return "success" as const;
    case "rejected":
      return "muted" as const;
    default:
      return "outline" as const;
  }
}

function getDraftStatusLabel(status: string) {
  switch (status) {
    case "approved":
      return "Ready";
    case "rejected":
      return "Rejected";
    default:
      return "Working draft";
  }
}

function getGenerationLabel(draft: WorkspaceDraft) {
  return getDraftGenerationType(draft) === "ai_refined" ? "AI assisted" : "Template guided";
}

function isSmtpEligible(draft: WorkspaceDraft) {
  const contactability = (draft.contactability ?? "").trim().toLowerCase();

  return (
    draft.status === "approved" &&
    Boolean(draft.founder_email) &&
    (contactability === "premium" || contactability === "strong")
  );
}

function buildSourceBackedHighlights(draft: WorkspaceDraft, lead: Awaited<ReturnType<typeof getRecommendationAssets>>["lead"]): SourceHighlight[] {
  const servicesPreview = lead.services.slice(0, 3).join(", ");
  const sourceQuery = lead.summary.source_query;
  const recommendationReason =
    draft.recommendation_reason?.trim() ||
    lead.outreach_angle ||
    lead.lead_score_reasons[0] ||
    "The system saw enough high-signal contactability and fit to warrant a first-touch draft.";

  const highlights: SourceHighlight[] = [];

  if (draft.first_line) {
    highlights.push({
      label: "Opening context",
      text: draft.first_line,
      why: servicesPreview
        ? `Mentioned because the website clearly emphasizes ${servicesPreview}${sourceQuery ? `, and this company surfaced from ${sourceQuery}.` : "."}`
        : sourceQuery
          ? `Mentioned because this company surfaced from ${sourceQuery} and the system had enough context for a grounded first line.`
          : "Mentioned because the system had enough grounded company context for a believable opener.",
    });
  }

  if (draft.short_pitch) {
    highlights.push({
      label: "Pitch angle",
      text: draft.short_pitch,
      why: `Anchored to the recommendation logic: ${recommendationReason}`,
    });
  }

  if (draft.cta) {
    highlights.push({
      label: "CTA choice",
      text: draft.cta,
      why: lead.summary.contact_page
        ? "Kept intentionally light because a real contact path exists, and this is still a first-touch email."
          : "Kept intentionally light because this is a first-touch email and sending still stays human-reviewed.",
    });
  }

  if (lead.summary.founder_name) {
    highlights.push({
      label: "Founder targeting",
      text: `${lead.summary.founder_name}${lead.summary.founder_email ? ` | ${lead.summary.founder_email}` : ""}`,
      why: `Founder confidence is ${formatPercent(lead.summary.founder_confidence)}, so the draft stays tied to a real contact instead of generic company copy.`,
    });
  }

  return highlights.slice(0, 4);
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

function DraftQueueActions({
  draft,
  returnTo,
}: {
  draft: WorkspaceDraft;
  returnTo: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="secondary">
        <Link href={`${ROUTES.DRAFTS}?companyId=${draft.company_id}`}>Edit</Link>
      </Button>

      <form action={approveDraftAction}>
        <input name="companyId" type="hidden" value={draft.company_id} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <Button disabled={draft.status === "approved"} size="sm" type="submit">
          {draft.status === "approved" ? "Ready" : "Approve"}
        </Button>
      </form>

      <form action={rejectDraftAction}>
        <input name="companyId" type="hidden" value={draft.company_id} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <Button disabled={draft.status === "rejected"} size="sm" type="submit" variant="ghost">
          Reject
        </Button>
      </form>

      <form action={regenerateDraftAction}>
        <input name="companyId" type="hidden" value={draft.company_id} />
        <input name="returnTo" type="hidden" value={returnTo} />
        <Button size="sm" type="submit" variant="ghost">
          Refresh draft
        </Button>
      </form>
    </div>
  );
}

export default async function DraftsPage({ searchParams }: DraftsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedCompanyId = Number(readParam(resolvedSearchParams?.companyId));
  const customerContext = await getCurrentCustomerContext();
  const hasWorkspaceAccess = hasCustomerWorkspaceAccess(customerContext.customer);

  if (!hasWorkspaceAccess) {
    return (
      <Container className="space-y-8 px-0">
        <PageEvent
          name="drafts_viewed"
          oncePerSessionKey="drafts-viewed"
          properties={{ location: ROUTES.DRAFTS, workspace_access: "locked" }}
        />
        <PlanGate customer={customerContext.customer} lockedFeature="drafts" />
      </Container>
    );
  }

  let errorMessage: string | null = null;
  const workspace = await listDraftsForCustomer(customerContext.companyName, 100).catch((error) => {
    errorMessage = getCustomerWorkspaceErrorMessage(
      error,
      "We couldn't load drafts from the intelligence backend.",
    );

    return {
      groups: [],
      items: [],
      recommendations: [],
      stats: {
        activeDrafts: 0,
        aiRefined: 0,
        avgRecommendationScore: 0,
        humanPolished: 0,
        readyToSend: 0,
      },
    };
  });

  const selectedDraft =
    workspace.items.find((item) => item.company_id === requestedCompanyId) ??
    workspace.items[0] ??
    null;
  const selectedAssets = selectedDraft
    ? await getRecommendationAssets(selectedDraft.company_id).catch(() => null)
    : null;
  const selectedLead = selectedAssets?.lead ?? null;
  const sourceHighlights =
    selectedDraft && selectedLead ? buildSourceBackedHighlights(selectedDraft, selectedLead) : [];
  const signalHistory = selectedLead ? getSignalHistory(selectedLead.outbound) : [];

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="drafts_viewed"
        oncePerSessionKey="drafts-viewed"
        properties={{ location: ROUTES.DRAFTS, workspace_access: "active" }}
      />
      {selectedDraft ? (
        <PageEvent
          name="draft_detail_viewed"
          oncePerSessionKey={`draft-detail-viewed:${selectedDraft.company_id}`}
          properties={{
            company_id: selectedDraft.company_id,
            location: `${ROUTES.DRAFTS}?companyId=${selectedDraft.company_id}`,
          }}
        />
      ) : null}

      <CustomerPageHero
        eyebrow={
          <>
            <FilePenLine className="h-4 w-4" aria-hidden="true" />
            This week&apos;s draft package
          </>
        }
        title={<>Drafts that make the opportunity feed actionable</>}
        description={
          <>
            Opportunities are where the service proves selectivity. Drafts are where that
            selectivity turns into outreach-ready work. This queue keeps copy grounded, editable,
            and visibly tied to real source observations.
          </>
        }
        actions={
          <form action={refreshDraftQueueAction}>
            <input name="returnTo" type="hidden" value={ROUTES.DRAFTS} />
            <Button size="lg" type="submit" variant="secondary">
              Refresh this week&apos;s drafts
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        }
      />

      {errorMessage ? (
        <ErrorState description={errorMessage} title="Draft workspace is temporarily unavailable" />
      ) : workspace.items.length === 0 ? (
        <EmptyState
          action={
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href={ROUTES.RECOMMENDATIONS}>Review opportunities</Link>
              </Button>
              <form action={refreshDraftQueueAction}>
                <input name="returnTo" type="hidden" value={ROUTES.DRAFTS} />
                <Button type="submit">Check again after review</Button>
              </form>
            </div>
          }
          description="Your next curated draft package will appear here after review and qualification. Once strong opportunities are approved, Frithly will surface the strongest outreach drafts for review."
          title="No drafts ready yet"
        />
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              description={`${workspace.groups.length} delivery groups currently contributing to this week's package.`}
              title="Draft queue"
              value={String(workspace.stats.activeDrafts)}
            />
            <MetricCard
              description="Approved drafts that are strong enough to move toward sending."
              title="Outreach-ready"
              value={String(workspace.stats.readyToSend)}
            />
            <MetricCard
              description="Drafts that already show human review or approval."
              title="Human reviewed"
              value={String(workspace.stats.humanPolished)}
            />
            <MetricCard
              description="Average recommendation strength across the visible queue."
              title="Opportunity strength avg"
              value={String(workspace.stats.avgRecommendationScore)}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              {workspace.groups.map((group) => (
                <Card key={group.campaignName}>
                  <CardHeader>
                    <CardTitle>{group.campaignName}</CardTitle>
                    <CardDescription>
                      {group.drafts.length} draft{group.drafts.length === 1 ? "" : "s"} ordered by
                      recommendation strength.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {group.drafts.map((draft) => {
                      const returnTo = `${ROUTES.DRAFTS}?companyId=${draft.company_id}`;

                      return (
                        <div
                          key={draft.id}
                          className={
                            selectedDraft?.company_id === draft.company_id
                              ? "rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5"
                              : "rounded-2xl border border-border bg-stone-50 p-5"
                          }
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge>{`Recommendation ${draft.recommendation_score ?? draft.lead_score}`}</Badge>
                                <Badge variant={getDraftStatusVariant(draft.status)}>
                                  {getDraftStatusLabel(draft.status)}
                                </Badge>
                                <Badge variant="outline">{getGenerationLabel(draft)}</Badge>
                                {isHumanPolishedDraft(draft) ? (
                                  <Badge variant="muted">Human polished</Badge>
                                ) : null}
                              </div>
                              <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-ink">{draft.company_name}</h2>
                                <p className="text-sm leading-6 text-muted">
                                  {draft.founder_name
                                    ? `${draft.founder_name}${draft.founder_email ? ` | ${draft.founder_email}` : ""}`
                                    : "Founder still needs review"}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-muted">
                              <p className="font-semibold text-ink">
                                {draft.contactability ?? "unknown"} contactability
                              </p>
                              <p className="mt-1">
                                Founder confidence {formatPercent(draft.founder_confidence)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-border bg-white p-4">
                              <p className="text-sm font-semibold text-ink">Why this draft exists</p>
                              <p className="mt-2 text-sm leading-7 text-muted">
                                {draft.recommendation_reason ??
                                  "This draft exists because Frithly considered the company worth closer review this week."}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-border bg-white p-4">
                              <p className="text-sm font-semibold text-ink">Draft trust state</p>
                              <p className="mt-2 text-sm leading-7 text-muted">
                                {draft.generated_with_ai
                                  ? "AI assisted, then held for human approval."
                                  : "Template guided and still grounded in observed company signals."}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
                            {draft.campaign_status ? <CampaignStatusBadge status={draft.campaign_status} /> : null}
                            {draft.source_query ? <Badge variant="muted">{draft.source_query}</Badge> : null}
                            <Badge variant="outline">
                              Updated {formatLongDate(draft.updated_at)}
                            </Badge>
                          </div>

                          <div className="mt-4">
                            <DraftQueueActions draft={draft} returnTo={returnTo} />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="xl:sticky xl:top-24 xl:self-start">
              {selectedDraft && selectedLead ? (
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{`Recommendation ${selectedDraft.recommendation_score ?? selectedDraft.lead_score}`}</Badge>
                      <Badge variant={getDraftStatusVariant(selectedDraft.status)}>
                        {getDraftStatusLabel(selectedDraft.status)}
                      </Badge>
                      <Badge variant="outline">{getGenerationLabel(selectedDraft)}</Badge>
                      {isHumanPolishedDraft(selectedDraft) ? (
                        <Badge variant="muted">Human polished</Badge>
                      ) : null}
                    </div>
                    <CardTitle className="text-3xl">{selectedDraft.company_name}</CardTitle>
                    <CardDescription>
                      {selectedDraft.founder_name
                        ? `${selectedDraft.founder_name}${selectedDraft.founder_email ? ` | ${selectedDraft.founder_email}` : ""}`
                        : "Founder still unresolved"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Draft trust state</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline">{getGenerationLabel(selectedDraft)}</Badge>
                        {isHumanPolishedDraft(selectedDraft) ? (
                          <Badge variant="muted">Human polished</Badge>
                        ) : null}
                        <Badge variant={isSmtpEligible(selectedDraft) ? "success" : "outline"}>
                          {isSmtpEligible(selectedDraft) ? "SMTP-ready candidate" : "Human review still required"}
                        </Badge>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Source-backed personalization</p>
                      <div className="mt-3 space-y-3">
                        {sourceHighlights.map((highlight) => (
                          <div key={highlight.label} className="rounded-xl border border-border bg-white p-4">
                            <div className="flex items-start gap-3">
                              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                              <div className="space-y-2">
                                <p className="font-semibold text-ink">{highlight.label}</p>
                                <p className="text-sm leading-7 text-ink">{highlight.text}</p>
                                <p className="text-sm leading-6 text-muted">{highlight.why}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form className="space-y-4" id={`draft-editor-${selectedDraft.company_id}`}>
                      <input name="companyId" type="hidden" value={selectedDraft.company_id} />
                      <input
                        name="returnTo"
                        type="hidden"
                        value={`${ROUTES.DRAFTS}?companyId=${selectedDraft.company_id}`}
                      />

                      <div className="space-y-2">
                        <Label htmlFor="subject_line">Subject</Label>
                        <Input
                          defaultValue={selectedDraft.subject_line ?? ""}
                          id="subject_line"
                          name="subject_line"
                          placeholder="Short, believable subject line"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="first_line">Opening line</Label>
                        <Textarea
                          defaultValue={selectedDraft.first_line ?? ""}
                          id="first_line"
                          name="first_line"
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="short_pitch">Pitch</Label>
                        <Textarea
                          defaultValue={selectedDraft.short_pitch ?? ""}
                          id="short_pitch"
                          name="short_pitch"
                          rows={5}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cta">CTA</Label>
                        <Textarea
                          defaultValue={selectedDraft.cta ?? ""}
                          id="cta"
                          name="cta"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="full_body">Full email body</Label>
                        <Textarea
                          defaultValue={selectedDraft.full_body ?? ""}
                          id="full_body"
                          name="full_body"
                          rows={12}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="review_notes">Review notes</Label>
                        <Textarea
                          defaultValue={selectedDraft.review_notes ?? ""}
                          id="review_notes"
                          name="review_notes"
                          rows={4}
                          placeholder="Why you changed this draft, what still needs checking, or what made this good."
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button formAction={saveDraftAction} type="submit" variant="secondary">
                          Save edits
                        </Button>
                        {selectedDraft.status === "approved" ? (
                          <Button formAction={returnDraftToWorkingAction} type="submit" variant="ghost">
                            Return to working
                          </Button>
                        ) : (
                          <Button formAction={approveDraftAction} type="submit">
                            Mark ready
                          </Button>
                        )}
                        <Button formAction={rejectDraftAction} type="submit" variant="ghost">
                          Reject draft
                        </Button>
                        <Button formAction={regenerateDraftAction} type="submit" variant="ghost">
                          Refresh draft
                        </Button>
                      </div>
                    </form>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Recommendation context</p>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                          <li>{selectedDraft.recommendation_reason ?? "No recommendation reason stored yet."}</li>
                          <li>{`Contactability: ${selectedDraft.contactability ?? "unknown"}`}</li>
                          <li>{`Founder confidence: ${formatPercent(selectedDraft.founder_confidence)}`}</li>
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-border bg-stone-50 p-4">
                        <p className="text-sm font-semibold text-ink">Delivery cycle</p>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                          <li>{selectedDraft.campaign_name ?? "No delivery cycle available"}</li>
                          <li>{selectedDraft.source_query ?? "No source query available"}</li>
                          <li>{selectedLead.summary.outbound_campaign ?? "Not yet placed in this week's cohort"}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Signals and observations</p>
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
                          : "No about-text summary is available for this draft yet."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <form action={validateSmtpAction}>
                        <input name="companyId" type="hidden" value={selectedDraft.company_id} />
                        <input
                          name="returnTo"
                          type="hidden"
                          value={`${ROUTES.DRAFTS}?companyId=${selectedDraft.company_id}`}
                        />
                        <Button disabled={!isSmtpEligible(selectedDraft)} size="sm" type="submit">
                          Validate route
                        </Button>
                      </form>

                      <form action={addToCohortAction}>
                        <input name="companyId" type="hidden" value={selectedDraft.company_id} />
                        <input
                          name="returnTo"
                          type="hidden"
                          value={`${ROUTES.DRAFTS}?companyId=${selectedDraft.company_id}`}
                        />
                        <Button disabled={selectedDraft.status !== "approved"} size="sm" type="submit" variant="secondary">
                          Add to this week&apos;s cohort
                        </Button>
                      </form>
                    </div>

                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Recent activity</p>
                      <div className="mt-3 space-y-3">
                        {signalHistory.length > 0 ? (
                          signalHistory.map((signal, index) => (
                            <div key={`${String(signal.event_type ?? "signal")}-${index}`} className="rounded-xl border border-border bg-white p-3">
                              <p className="font-semibold text-ink">{String(signal.event_type ?? "Signal")}</p>
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
                            <span>No outreach activity has been recorded for this company yet.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <EmptyState
                  description="Select a draft to review the copy, source-backed personalization, and delivery readiness."
                  title="No draft selected"
                />
              )}
            </div>
          </section>
        </>
      )}
    </Container>
  );
}
