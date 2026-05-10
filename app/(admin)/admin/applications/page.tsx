import Link from "next/link";
import { ApplicationReviewControls } from "@/components/admin/application-review-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants";
import {
  type AdminApplicationRecord,
  type AdminApplicationRisk,
  getAdminApplicationsData,
} from "@/lib/supabase/admin-data";
import { cn } from "@/lib/utils";

type AdminApplicationsPageProps = {
  searchParams?: Promise<{
    id?: string | string[] | undefined;
    q?: string | string[] | undefined;
    status?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function buildApplicationsHref(params: { id?: string; q?: string; status?: string }) {
  const searchParams = new URLSearchParams();

  if (params.q?.trim()) {
    searchParams.set("q", params.q.trim());
  }

  if (params.status?.trim()) {
    searchParams.set("status", params.status.trim());
  }

  if (params.id?.trim()) {
    searchParams.set("id", params.id.trim());
  }

  const query = searchParams.toString();
  return query ? `${ROUTES.ADMIN_APPLICATIONS}?${query}` : ROUTES.ADMIN_APPLICATIONS;
}

function getStatusBadgeClass(status: AdminApplicationRecord["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-500/12 text-emerald-300";
    case "accepted":
    case "onboarding":
      return "bg-sky-500/12 text-sky-300";
    case "qualified":
      return "bg-amber-500/12 text-amber-200";
    case "reviewing":
      return "bg-violet-500/12 text-violet-300";
    case "rejected":
      return "bg-rose-500/12 text-rose-300";
    case "pending":
    default:
      return "bg-white/[0.07] text-ink";
  }
}

function getRiskBadgeClass(level: AdminApplicationRisk["level"]) {
  switch (level) {
    case "high":
      return "bg-rose-500/12 text-rose-300";
    case "medium":
      return "bg-amber-500/12 text-amber-200";
    case "low":
    default:
      return "bg-emerald-500/12 text-emerald-300";
  }
}

export default async function AdminApplicationsPage({
  searchParams,
}: AdminApplicationsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const search = readParam(resolvedSearchParams?.q);
  const status = readParam(resolvedSearchParams?.status);
  const selectedId = readParam(resolvedSearchParams?.id);
  const data = await getAdminApplicationsData({ search, selectedId, status });
  const visibleApplications = data.groupedApplications.flatMap((group) => group.applications);
  const pendingReviewCount = data.counts.pending + data.counts.reviewing;
  const acceptedPipelineCount = data.counts.accepted + data.counts.onboarding;
  const highConfidenceCount = visibleApplications.filter(
    (application) => application.feasibilityBand === "High confidence",
  ).length;
  const challengingCount = visibleApplications.filter(
    (application) => application.feasibilityBand === "Challenging",
  ).length;

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
          Applications
        </p>
        <h1 className="text-4xl md:text-5xl">Onboarding control center</h1>
        <p className="max-w-3xl text-base text-muted md:text-lg">
          Review inbound ICP requests, assess feasibility, capture operational notes, and move
          promising accounts into onboarding with clear risk and plan context.
        </p>
      </div>

      {data.migrationRequired ? (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-700">
                Migration still required
              </p>
              <p className="mt-2 text-sm text-amber-900">
                The canonical `campaign_applications` table is not available in this environment
                yet, so this queue is currently reading fallback onboarding submissions from
                `sample_requests`.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {data.hasFallbackApplications ? (
        <Card className="border-white/10 bg-white/[0.03]">
          <CardContent className="p-6">
            <p className="text-sm text-muted">
              Some older submissions are still being read from the fallback application flow. The
              queue keeps them visible, but new applications should land in the canonical
              `campaign_applications` table after migration.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted">Total applications</p>
            <p className="text-4xl font-bold text-ink">{data.totalApplications}</p>
            <p className="text-sm text-muted">All inbound campaign requests in the review system.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted">Pending review</p>
            <p className="text-4xl font-bold text-ink">{pendingReviewCount}</p>
            <p className="text-sm text-muted">Applications waiting for qualification or active review.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted">Accepted / onboarding</p>
            <p className="text-4xl font-bold text-ink">{acceptedPipelineCount}</p>
            <p className="text-sm text-muted">Accounts that are commercially viable and moving forward.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-muted">High-confidence fits</p>
            <p className="text-4xl font-bold text-ink">{highConfidenceCount}</p>
            <p className="text-sm text-muted">
              {challengingCount} challenging ICP{challengingCount === 1 ? "" : "s"} currently visible.
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Queue filters</CardTitle>
          <CardDescription>
            Narrow the intake queue by status or search across company, contact, geography, and
            niche.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="grid gap-4 md:grid-cols-[1.5fr_1fr_auto]" method="get">
            <Input
              defaultValue={search}
              name="q"
              placeholder="Search by company, founder, email, niche, or region"
              type="search"
            />
            <select
              className="field-dark-select"
              defaultValue={status}
              name="status"
            >
              <option value="">All stages</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="qualified">Qualified</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="onboarding">Onboarding</option>
              <option value="active">Active</option>
            </select>
            <Button type="submit" variant="secondary">
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {visibleApplications.length > 0 ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.78fr)]">
          <div className="space-y-6">
            {data.groupedApplications.map((group) => (
              <Card key={group.status}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>{group.title}</CardTitle>
                      <CardDescription>
                        {group.count} application{group.count === 1 ? "" : "s"} in this stage
                      </CardDescription>
                    </div>
                    <span className="rounded-full bg-white/[0.07] px-3 py-1 text-sm font-semibold text-ink">
                      {group.count}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {group.applications.length > 0 ? (
                    group.applications.map((application) => {
                      const href = buildApplicationsHref({
                        id: application.encodedId,
                        q: search,
                        status,
                      });
                      const isSelected =
                        data.selectedApplication?.encodedId === application.encodedId;

                      return (
                        <Link
                          key={application.encodedId}
                          className={cn(
                            "block rounded-2xl border p-4 transition-colors",
                            isSelected
                              ? "border-terracotta bg-terracotta/10"
                              : "border-border hover:border-terracotta/40 hover:bg-white/[0.04]",
                          )}
                          href={href}
                          scroll={false}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-lg font-semibold text-ink">{application.company}</p>
                                <span
                                  className={cn(
                                    "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                                    getStatusBadgeClass(application.status),
                                  )}
                                >
                                  {application.status}
                                </span>
                                <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink">
                                  {application.feasibilityBand}
                                </span>
                              </div>
                              <p className="text-sm text-muted">
                                {application.fullName} | {application.email}
                              </p>
                            </div>
                            <div className="text-right text-sm text-muted">
                              <p>{application.createdAtLabel}</p>
                              <p>{application.sourceLabel}</p>
                            </div>
                          </div>

                          <p className="mt-3 text-sm text-muted">{application.summary}</p>

                          <div className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-2">
                            <div>
                              <span className="font-semibold text-ink">ICP:</span> {application.industry}
                            </div>
                            <div>
                              <span className="font-semibold text-ink">Geography:</span>{" "}
                              {application.geographyLabel || "Not specified"}
                            </div>
                            <div>
                              <span className="font-semibold text-ink">Lead goal:</span>{" "}
                              {application.leadGoal}
                            </div>
                            <div>
                              <span className="font-semibold text-ink">Plan:</span>{" "}
                              {application.planRecommendation.label}
                            </div>
                          </div>

                          {application.linkedCustomerId ? (
                            <p className="mt-4 text-sm text-muted">
                              Linked customer:{" "}
                              <span className="font-semibold text-ink">
                                {application.linkedCustomerName}
                              </span>{" "}
                              ({application.linkedCustomerStatus ?? "pending"})
                            </p>
                          ) : null}
                        </Link>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted">
                      No applications are currently sitting in {group.title.toLowerCase()}.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            {data.selectedApplication ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                            getStatusBadgeClass(data.selectedApplication.status),
                          )}
                        >
                          {data.selectedApplication.status}
                        </span>
                        <span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink">
                          {data.selectedApplication.sourceLabel}
                        </span>
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink">
                          {data.selectedApplication.planRecommendation.label}
                        </span>
                      </div>
                      <div>
                        <CardTitle>{data.selectedApplication.company}</CardTitle>
                        <CardDescription>
                          {data.selectedApplication.fullName} | {data.selectedApplication.email}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-muted">
                      {data.selectedApplication.summary}
                    </p>
                    <div className="grid gap-3 text-sm text-muted sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-terracotta">
                          Feasibility
                        </p>
                        <p className="mt-2 font-semibold text-ink">
                          {data.selectedApplication.feasibilityBand}
                        </p>
                        <p className="mt-1">{data.selectedApplication.feasibilityLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-terracotta">
                          Recommendation density
                        </p>
                        <p className="mt-2 font-semibold text-ink">
                          {data.selectedApplication.densityLabel}
                        </p>
                        <p className="mt-1">{data.selectedApplication.planRecommendation.reason}</p>
                      </div>
                    </div>
                    {data.selectedApplication.linkedCustomerId ? (
                      <div className="rounded-2xl border border-border p-4 text-sm text-muted">
                        <p className="font-semibold text-ink">Linked customer record</p>
                        <p className="mt-2">
                          <Link
                            className="font-semibold text-terracotta underline underline-offset-4"
                            href={`${ROUTES.ADMIN_CUSTOMERS}/${data.selectedApplication.linkedCustomerId}`}
                          >
                            {data.selectedApplication.linkedCustomerName}
                          </Link>{" "}
                          | {data.selectedApplication.linkedCustomerPlan ?? "unassigned"} /{" "}
                          {data.selectedApplication.linkedCustomerStatus ?? "pending"}
                        </p>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Application profile</CardTitle>
                    <CardDescription>
                      Core ICP scope, thresholds, and commercial context for this account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm text-muted sm:grid-cols-2">
                    <div>
                      <p className="font-semibold text-ink">Industry</p>
                      <p className="mt-1">{data.selectedApplication.industry}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Geography</p>
                      <p className="mt-1">{data.selectedApplication.geographyLabel || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Lead goal</p>
                      <p className="mt-1">{data.selectedApplication.leadGoal}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Minimum score</p>
                      <p className="mt-1">{data.selectedApplication.minimumScore}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Founder confidence minimum</p>
                      <p className="mt-1">{data.selectedApplication.founderConfidenceMin}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Required contactability</p>
                      <p className="mt-1 capitalize">{data.selectedApplication.requiredContactability}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Outbound maturity</p>
                      <p className="mt-1 capitalize">{data.selectedApplication.outboundMaturity}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Average client value</p>
                      <p className="mt-1">{data.selectedApplication.averageClientValueLabel}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Company size</p>
                      <p className="mt-1">{data.selectedApplication.companySize}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Created</p>
                      <p className="mt-1">{data.selectedApplication.createdAtLabel}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Services</p>
                      <p className="mt-1">
                        {data.selectedApplication.services.length > 0
                          ? data.selectedApplication.services.join(", ")
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-ink">Target titles</p>
                      <p className="mt-1">
                        {data.selectedApplication.targetTitles.length > 0
                          ? data.selectedApplication.targetTitles.join(", ")
                          : "Not specified"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Context and risk</CardTitle>
                    <CardDescription>
                      Real intake context plus system-generated operational guardrails.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 text-sm text-muted">
                    <div>
                      <p className="font-semibold text-ink">Current challenges</p>
                      <p className="mt-2 leading-6">{data.selectedApplication.currentChallenges}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-ink">Success definition</p>
                      <p className="mt-2 leading-6">
                        {data.selectedApplication.successDefinition || "No success definition provided yet."}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-ink">Risk indicators</p>
                      {data.selectedApplication.risks.length > 0 ? (
                        <div className="mt-3 space-y-3">
                          {data.selectedApplication.risks.map((risk) => (
                            <div key={risk.title} className="rounded-2xl border border-border p-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
                                    getRiskBadgeClass(risk.level),
                                  )}
                                >
                                  {risk.level}
                                </span>
                                <p className="font-semibold text-ink">{risk.title}</p>
                              </div>
                              <p className="mt-2 leading-6">{risk.detail}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2">No automatic intake risks flagged yet.</p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="font-semibold text-ink">Feasibility notes</p>
                        <p className="mt-2">
                          {data.selectedApplication.feasibilityNotes || "No feasibility notes captured yet."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="font-semibold text-ink">Risk notes</p>
                        <p className="mt-2">
                          {data.selectedApplication.riskNotes || "No operator risk notes captured yet."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="font-semibold text-ink">Qualification notes</p>
                        <p className="mt-2">
                          {data.selectedApplication.qualificationNotes || "No qualification notes captured yet."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="font-semibold text-ink">Onboarding notes</p>
                        <p className="mt-2">
                          {data.selectedApplication.onboardingNotes || "No onboarding notes captured yet."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ApplicationReviewControls application={data.selectedApplication} />
              </>
            ) : (
              <EmptyState
                className="border-0 shadow-none"
                description="Choose an application from the queue to review its ICP, risks, and onboarding notes."
                title="No application selected"
              />
            )}
          </div>
        </section>
      ) : (
        <EmptyState
          className="border-0 shadow-none"
          description="No applications matched the current filters yet. Clear the filters or wait for new intake submissions."
          title="No applications found"
        />
      )}
    </Container>
  );
}
