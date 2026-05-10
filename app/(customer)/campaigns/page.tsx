import Link from "next/link";
import { ArrowRight, Radar, Sparkles, Target, TrendingUp } from "lucide-react";
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
import { getCustomerWorkspaceErrorMessage } from "@/lib/backend-api/customer-workspace-error";
import {
  buildCampaignWorkspaceSummary,
  getFeaturedCampaigns,
  listCampaignsForCustomer,
} from "@/lib/backend-api/customer-campaigns";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatLongDate } from "@/lib/utils";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function getCampaignNarrative(campaign: {
  premium_leads: number;
  qualified_leads: number;
  send_ready_leads: number;
}) {
  if (campaign.send_ready_leads > 0) {
    return "Outbound-ready opportunities are already surfacing from this delivery pipeline.";
  }

  if (campaign.qualified_leads > 0) {
    return "Qualified opportunities are accumulating and ready for review.";
  }

  if (campaign.premium_leads > 0) {
    return "The system found high-signal companies, but the final thresholds are still filtering hard.";
  }

  return "This delivery pipeline is still proving demand density against your current quality floor.";
}

type MetricCardProps = {
  eyebrow: string;
  value: string;
  description: string;
};

function MetricCard({ eyebrow, value, description }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="space-y-2 p-6">
        <p className="text-sm font-medium text-muted">{eyebrow}</p>
        <p className="text-4xl font-bold text-ink">{value}</p>
        <p className="text-sm leading-6 text-muted">{description}</p>
      </CardContent>
    </Card>
  );
}

export default async function CampaignsPage() {
  const customerContext = await getCurrentCustomerContext();
  const hasWorkspaceAccess = hasCustomerWorkspaceAccess(customerContext.customer);

  if (!hasWorkspaceAccess) {
    return (
      <Container className="space-y-8 px-0">
        <PageEvent
          name="campaigns_viewed"
          oncePerSessionKey="campaigns-viewed"
          properties={{ location: ROUTES.CAMPAIGNS, workspace_access: "locked" }}
        />
        <PlanGate customer={customerContext.customer} lockedFeature="campaigns" />
      </Container>
    );
  }

  let campaigns = [] as Awaited<ReturnType<typeof listCampaignsForCustomer>>;
  let errorMessage: string | null = null;

  try {
    campaigns = await listCampaignsForCustomer(customerContext.companyName, 50);
  } catch (error) {
    errorMessage = getCustomerWorkspaceErrorMessage(
      error,
      "We couldn't reach the intelligence backend right now.",
    );
  }

  const summary = buildCampaignWorkspaceSummary(campaigns);
  const featuredCampaigns = getFeaturedCampaigns(campaigns, 4);

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="campaigns_viewed"
        oncePerSessionKey="campaigns-viewed"
        properties={{ location: ROUTES.CAMPAIGNS, workspace_access: "active" }}
      />

      <CustomerPageHero
        eyebrow={
          <>
            <Radar className="h-4 w-4" aria-hidden="true" />
            Delivery pipeline
          </>
        }
        title={<>How your outbound delivery is performing</>}
        description={
          <>
            This workspace shows how Frithly is translating your ICP into reviewed opportunities:
            where expansion is working, where quality is breaking down, and where genuinely
            outbound-ready companies are emerging.
          </>
        }
        actions={
          <Card className="w-full max-w-sm border-terracotta/20 bg-terracotta/5 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">How to read this</CardTitle>
              <CardDescription>
                Delivery pipelines are judged on opportunity quality, not raw volume.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted">
              <div className="flex items-start gap-3">
                <Target className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                <span>Opportunity targets stop honestly when the quality floor is not met.</span>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                <span>Premium density matters more than raw scrape volume.</span>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                <span>The best pipelines feed opportunities, drafts, and cohort review next.</span>
              </div>
            </CardContent>
          </Card>
        }
      />

      {errorMessage ? (
        <ErrorState
          description={errorMessage}
          title="Delivery intelligence is temporarily unavailable"
        />
      ) : campaigns.length === 0 ? (
        <EmptyState
          action={
            <Button asChild>
              <Link href={ROUTES.ICP}>Review delivery brief</Link>
            </Button>
          }
          description="No customer-scoped delivery pipelines have been launched yet. Once a pipeline is created from your ICP, this view will show live progress, expansion coverage, and the strongest opportunities rising through the system."
          title="No delivery pipelines yet"
        />
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              eyebrow="Pipelines tracked"
              value={String(summary.totalCampaigns)}
              description={`${summary.activeCampaigns} currently active or queued.`}
            />
            <MetricCard
              eyebrow="Qualified opportunities"
              value={String(summary.qualifiedLeads)}
              description="Opportunities that actually cleared your current delivery thresholds."
            />
            <MetricCard
              eyebrow="Outbound-ready opportunities"
              value={String(summary.sendReadyLeads)}
              description="Candidates already strong enough to move into outbound prep."
            />
            <MetricCard
              eyebrow="Premium density"
              value={formatPercent(summary.premiumDensity)}
              description={`Average campaign score across this workspace: ${summary.averageScore}.`}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Priority delivery pipelines</CardTitle>
                <CardDescription>
                  This feed surfaces the pipelines with the strongest outbound potential right now.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredCampaigns.map((campaign) => {
                  const qualificationRate =
                    campaign.generated_leads > 0
                      ? campaign.qualified_leads / campaign.generated_leads
                      : 0;

                  return (
                    <div
                      key={campaign.id}
                      className="rounded-2xl border border-border bg-stone-50 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <CampaignStatusBadge status={campaign.status} />
                            <Badge variant="muted">{campaign.industry ?? "ICP campaign"}</Badge>
                          </div>
                          <h2 className="text-2xl font-semibold text-ink">{campaign.name}</h2>
                          <p className="text-sm leading-6 text-muted">
                            {campaign.cities.join(", ")} | updated {formatLongDate(campaign.updated_at)}
                          </p>
                        </div>

                        <Button asChild variant="secondary">
                          <Link href={`${ROUTES.CAMPAIGNS}/${campaign.id}`}>
                            View campaign
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-4">
                        <div className="rounded-xl border border-border bg-white px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-muted">Discovered</p>
                          <p className="mt-2 text-2xl font-semibold text-ink">{campaign.generated_leads}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-white px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-muted">Qualified rate</p>
                          <p className="mt-2 text-2xl font-semibold text-ink">{formatPercent(qualificationRate)}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-white px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-muted">Premium</p>
                          <p className="mt-2 text-2xl font-semibold text-ink">{campaign.premium_leads}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-white px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-muted">Send-ready</p>
                          <p className="mt-2 text-2xl font-semibold text-ink">{campaign.send_ready_leads}</p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-muted">
                        {getCampaignNarrative(campaign)}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operating notes</CardTitle>
                <CardDescription>
                  This is the simplest way to read campaign quality without looking at backend internals.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted">
                <div className="rounded-2xl border border-border bg-stone-50 p-4">
                  <p className="font-semibold text-ink">Discovered opportunities</p>
                  <p className="mt-2">
                    The number of unique companies the system mapped into this delivery pipeline after
                    discovery and deduplication.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-stone-50 p-4">
                  <p className="font-semibold text-ink">Qualified opportunities</p>
                  <p className="mt-2">
                    Opportunities that cleared score, founder-confidence, and contactability thresholds for
                    this ICP.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-stone-50 p-4">
                  <p className="font-semibold text-ink">Outbound-ready opportunities</p>
                  <p className="mt-2">
                    The most commercially useful slice: real candidates that are close to outbound
                    execution.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </Container>
  );
}
