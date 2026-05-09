import Link from "next/link";
import {
  ArrowRight,
  Download,
  FileSpreadsheet,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
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
  getExportWorkspaceForCustomer,
  parseExportFilterState,
  type ExportFilterState,
  type ExportWarning,
} from "@/lib/backend-api/customer-exports";
import { hasCustomerWorkspaceAccess } from "@/lib/auth/customer-access";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

type ExportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.round(value * 100)}%`;
}

function buildDownloadHref(filters: ExportFilterState, format?: "csv" | "json") {
  const params = new URLSearchParams();
  params.set("profile", filters.profile);
  params.set("format", format ?? filters.format);
  params.set("minScore", String(filters.minScore));
  params.set("minFounderConfidence", String(filters.minFounderConfidence));
  params.set("contactability", filters.contactability);
  params.set("campaign", filters.campaign);
  params.set("cohort", filters.cohort);
  params.set("city", filters.city);
  params.set("smtpState", filters.smtpState);
  params.set("draftReadiness", filters.draftReadiness);
  return `/api/customer/exports?${params.toString()}`;
}

function warningToneClasses(tone: ExportWarning["tone"]) {
  if (tone === "negative") {
    return "border-red-200 bg-red-50";
  }

  if (tone === "positive") {
    return "border-emerald-200 bg-emerald-50";
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

export default async function ExportsPage({ searchParams }: ExportsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const filters = parseExportFilterState(resolvedSearchParams);
  const customerContext = await getCurrentCustomerContext();
  const hasWorkspaceAccess = hasCustomerWorkspaceAccess(customerContext.customer);

  if (!hasWorkspaceAccess) {
    return (
      <Container className="space-y-8 px-0">
        <PageEvent
          name="exports_viewed"
          oncePerSessionKey="exports-viewed"
          properties={{ location: ROUTES.EXPORTS, workspace_access: "locked" }}
        />
        <PlanGate customer={customerContext.customer} lockedFeature="exports" />
      </Container>
    );
  }

  let errorMessage: string | null = null;
  const workspace = await getExportWorkspaceForCustomer(customerContext.companyName, filters).catch((error) => {
    errorMessage =
      error instanceof Error
        ? error.message
        : "We couldn't prepare exports from the intelligence backend.";

    return {
      activeProfile: {
        defaultFormat: "csv" as const,
        description: "",
        destination: "",
        fields: [],
        id: filters.profile,
        label: "",
        modeLabel: "",
      },
      allRows: [],
      campaigns: [],
      cities: [],
      cohorts: [],
      fields: [],
      filters,
      previewRows: [],
      profileCounts: [],
      selectedRows: [],
      smtpStates: [],
      summary: {
        approvedDraftCount: 0,
        exportReadyCohorts: 0,
        premiumLeadCount: 0,
        recommendedRouting: "Review queue",
        smtpSafeCount: 0,
      },
      warnings: [],
    };
  });

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="exports_viewed"
        oncePerSessionKey="exports-viewed"
        properties={{ location: ROUTES.EXPORTS, workspace_access: "active" }}
      />

      <section className="rounded-2xl border border-border bg-white p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-terracotta/5 px-4 py-2 text-sm font-semibold text-terracotta">
              <PackageOpen className="h-4 w-4" aria-hidden="true" />
              Outbound deployment packaging
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl">Exports that package intelligence for execution</h1>
              <p className="max-w-3xl text-lg leading-8 text-muted">
                This workspace is the bridge between intelligence and operational tooling. Instead
                of dumping rows, it lets you package approved opportunities, draft context, confidence, and
                recommendation reasoning into the right handoff format for the next tool.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href={ROUTES.COHORTS}>
                Review cohorts
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href={ROUTES.DRAFTS}>
                Review drafts
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <ErrorState
          description={errorMessage}
          title="Export packaging is temporarily unavailable"
        />
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard
              description="Cohorts that still contain at least one row in the active export selection."
              title="Export-ready cohorts"
              value={String(workspace.summary.exportReadyCohorts)}
            />
            <MetricCard
              description="Selected rows already carrying a verified SMTP state."
              title="SMTP-safe contacts"
              value={String(workspace.summary.smtpSafeCount)}
            />
            <MetricCard
              description="Premium rows in the current export selection."
              title="Premium opportunities"
              value={String(workspace.summary.premiumLeadCount)}
            />
            <MetricCard
              description="Selected rows with approved draft state."
              title="Approved drafts"
              value={String(workspace.summary.approvedDraftCount)}
            />
            <MetricCard
              description="The dominant handoff route suggested by the selected package."
              title="Suggested routing"
              value={workspace.summary.recommendedRouting}
            />
            <MetricCard
              description="Curated rows included in the current package."
              title="Packaged opportunities"
              value={String(workspace.selectedRows.length)}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <Card>
              <CardHeader>
                <CardTitle>Current package settings</CardTitle>
                <CardDescription>
                  Frithly already narrows this package for quality. These settings show the
                  current curation floor rather than asking you to fine-tune the package yourself.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-stone-50 p-4">
                    <p className="text-sm font-semibold text-ink">Minimum opportunity score</p>
                    <p className="mt-2 text-2xl font-bold text-ink">{workspace.filters.minScore}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Frithly is currently holding the export package to this quality floor.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-stone-50 p-4">
                    <p className="text-sm font-semibold text-ink">Founder confidence floor</p>
                    <p className="mt-2 text-2xl font-bold text-ink">
                      {formatPercent(workspace.filters.minFounderConfidence)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      This keeps the package focused on opportunities with stronger decision-maker confidence.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-stone-50 p-4">
                    <p className="text-sm font-semibold text-ink">Current contactability mix</p>
                    <p className="mt-2 text-2xl font-bold text-ink capitalize">
                      {workspace.filters.contactability === "all"
                        ? "Curated"
                        : workspace.filters.contactability}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      The package stays anchored to the strongest reachable routes in the current review cycle.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-stone-50 p-4">
                    <p className="text-sm font-semibold text-ink">Draft readiness</p>
                    <p className="mt-2 text-2xl font-bold text-ink capitalize">
                      {workspace.filters.draftReadiness.replace(/_/g, " ")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Draft state is already reflected in the package selection, so you can focus on handoff rather than setup.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export profiles</CardTitle>
                <CardDescription>
                  Profiles turn the same intelligence set into the right packaging for the next tool or handoff.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {workspace.profileCounts.map((profile) => {
                  const isActive = profile.id === workspace.activeProfile.id;

                  return (
                    <div
                      key={profile.id}
                      className={
                        isActive
                          ? "rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5"
                          : "rounded-2xl border border-border bg-stone-50 p-5"
                      }
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-ink">{profile.label}</p>
                          <p className="text-sm leading-6 text-muted">{profile.destination}</p>
                        </div>
                        <Badge variant={isActive ? "success" : "outline"}>{profile.count} rows</Badge>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted">{profile.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild size="sm" variant={isActive ? "secondary" : "primary"}>
                          <Link href={profile.href}>{isActive ? "Active profile" : "Use profile"}</Link>
                        </Button>
                        <Button asChild size="sm" variant="secondary">
                          <Link href={buildDownloadHref({ ...workspace.filters, profile: profile.id }, profile.defaultFormat)}>
                            Download
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>

          {workspace.selectedRows.length === 0 ? (
            <EmptyState
              action={
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <Link href={ROUTES.RECOMMENDATIONS}>Review opportunities</Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={ROUTES.COHORTS}>Review cohorts</Link>
                  </Button>
                </div>
              }
              description="Your next curated export package will appear here after review and qualification. Once enough strong opportunities are ready, Frithly will package them for handoff."
              title="No export package ready yet"
            />
          ) : (
            <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Active packaging profile</CardTitle>
                    <CardDescription>
                      This is the current export mode and the routing it best supports.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-terracotta/30 bg-terracotta/5 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/20 bg-white px-3 py-1 text-sm font-semibold text-terracotta">
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            {workspace.activeProfile.modeLabel}
                          </div>
                          <h2 className="text-2xl font-semibold text-ink">{workspace.activeProfile.label}</h2>
                          <p className="text-sm leading-7 text-muted">{workspace.activeProfile.description}</p>
                        </div>
                        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm text-muted">
                          <p className="font-semibold text-ink">{workspace.activeProfile.destination}</p>
                          <p className="mt-1">{workspace.selectedRows.length} opportunities packaged</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {workspace.fields.map((field) => (
                        <Badge key={field.key} variant="outline">
                          {field.label}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button asChild>
                        <Link href={buildDownloadHref(workspace.filters, "csv")}>
                          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                          Download CSV
                        </Link>
                      </Button>
                      <Button asChild variant="secondary">
                        <Link href={buildDownloadHref(workspace.filters, "json")}>
                          <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden="true" />
                          Download JSON
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Warnings and exclusions</CardTitle>
                    <CardDescription>
                      This keeps the package honest by showing what is being held back and why.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {workspace.warnings.length > 0 ? (
                      workspace.warnings.map((warning) => (
                        <div
                          key={`${warning.description}-${warning.count}`}
                          className={`rounded-2xl border p-4 ${warningToneClasses(warning.tone)}`}
                        >
                          <div className="flex items-start gap-3">
                            <TriangleAlert className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                            <div>
                              <p className="font-semibold text-ink">{warning.count} affected rows</p>
                              <p className="mt-1 text-sm leading-6 text-muted">{warning.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-muted">
                        The current export package does not have any major exclusion warnings right now.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Export preview</CardTitle>
                  <CardDescription>
                    A small sample of the exact rows and intelligence columns that will be exported.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Sample rows</p>
                      <p className="mt-2 text-2xl font-bold text-ink">{workspace.previewRows.length}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Included fields</p>
                      <p className="mt-2 text-2xl font-bold text-ink">{workspace.fields.length}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">SMTP-safe share</p>
                      <p className="mt-2 text-2xl font-bold text-ink">
                        {formatPercent(
                          workspace.selectedRows.length > 0
                            ? workspace.summary.smtpSafeCount / workspace.selectedRows.length
                            : 0,
                        )}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-stone-50 p-4">
                      <p className="text-sm font-semibold text-ink">Premium share</p>
                      <p className="mt-2 text-2xl font-bold text-ink">
                        {formatPercent(
                          workspace.selectedRows.length > 0
                            ? workspace.summary.premiumLeadCount / workspace.selectedRows.length
                            : 0,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-border">
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-sm">
                        <thead className="bg-stone-50 text-left text-muted">
                          <tr>
                            {workspace.fields.map((field) => (
                              <th key={field.key} className="border-b border-border px-4 py-3 font-semibold">
                                {field.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {workspace.previewRows.map((row) => (
                            <tr key={row.companyId} className="border-b border-border last:border-b-0">
                              {workspace.fields.map((field) => (
                                <td key={`${row.companyId}-${field.key}`} className="px-4 py-3 align-top text-muted">
                                  {row.values[field.label] || "--"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-stone-50 p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                      <div>
                        <p className="font-semibold text-ink">Packaging note</p>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          Recommendation reasoning, founder confidence, contactability, outreach angle,
                          and draft status stay attached in the export so downstream tools still inherit
                          the intelligence context that made these opportunities worth selecting.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </>
      )}
    </Container>
  );
}
