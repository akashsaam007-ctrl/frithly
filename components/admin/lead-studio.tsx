"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Loader2, Radar, RefreshCw, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BackendCampaignDetail, BackendCampaignLead, BackendCampaignRead } from "@/lib/backend-api/types";
import { cn } from "@/lib/utils";
import type { AdminLeadStudioCustomer } from "@/lib/supabase/admin-data";

type LeadStudioProps = {
  customers: AdminLeadStudioCustomer[];
  initialCustomerId?: null | string;
  initialBackendError?: string | null;
  initialCampaigns: BackendCampaignRead[];
};

type CampaignListResponse = {
  campaigns?: BackendCampaignRead[];
  error?: string;
};

type CampaignDetailResponse = {
  detail?: BackendCampaignDetail;
  error?: string;
};

type CampaignCreateResponse = {
  detail?: BackendCampaignDetail;
  error?: string;
  executionMode?: "background" | "direct";
  notes?: string[];
};

const leadGoalOptions = [25, 50, 100, 150] as const;
const matchScoreOptions = [60, 70, 80, 90] as const;
const leadStatusFilters = ["all", "send_ready", "qualified", "review_required", "rejected"] as const;
const executionModes = [
  {
    description: "Queues the run in the worker and refreshes live in place.",
    label: "Background worker",
    value: "background",
  },
  {
    description: "Runs inside the request for debugging when you need an immediate answer.",
    label: "Direct run",
    value: "direct",
  },
] as const;
const terminalCampaignStatuses = new Set(["completed", "exhausted", "failed"]);

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getCampaignCounts(detail: BackendCampaignDetail) {
  const counts = {
    qualified: 0,
    rejected: 0,
    review_required: 0,
    send_ready: 0,
  };

  for (const lead of detail.leads) {
    if (lead.status in counts) {
      counts[lead.status as keyof typeof counts] += 1;
    }
  }

  return counts;
}

function getCampaignSummaryStats(detail: BackendCampaignDetail) {
  const progress = detail.progress ?? {};
  const counts = getCampaignCounts(detail);

  return {
    averageScore:
      detail.leads.length > 0
        ? Math.round(
            detail.leads.reduce((sum, lead) => sum + (lead.recommendation_score ?? lead.lead_score), 0) /
              detail.leads.length,
          )
        : 0,
    generated: toNumber(progress.generated_leads) || detail.campaign.generated_leads || detail.leads.length,
    leadGoal: detail.campaign.lead_goal,
    premium: detail.campaign.premium_leads,
    qualified: counts.qualified,
    queryCount: detail.query_plan.length,
    rejected: counts.rejected,
    reviewRequired: counts.review_required,
    sendReady: counts.send_ready,
  };
}

function sortLeads(leads: BackendCampaignLead[]) {
  const rank = {
    qualified: 2,
    rejected: 4,
    review_required: 3,
    send_ready: 1,
  } as const;

  return [...leads].sort((left, right) => {
    const rankDiff =
      (rank[left.status as keyof typeof rank] ?? 5) - (rank[right.status as keyof typeof rank] ?? 5);

    if (rankDiff !== 0) {
      return rankDiff;
    }

    return (right.recommendation_score ?? right.lead_score) - (left.recommendation_score ?? left.lead_score);
  });
}

function getLeadReasonList(lead: BackendCampaignLead) {
  const reasons = Array.isArray(lead.lead_metadata?.reasons)
    ? lead.lead_metadata.reasons.map((value) => String(value)).filter(Boolean)
    : [];

  return reasons;
}

function getCampaignStatusTone(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-400/12 text-emerald-200";
    case "running":
      return "bg-sky-400/12 text-sky-200";
    case "queued":
      return "bg-amber-400/12 text-amber-200";
    case "exhausted":
      return "bg-violet-400/12 text-violet-200";
    case "failed":
      return "bg-rose-400/12 text-rose-200";
    default:
      return "bg-white/[0.06] text-white/70";
  }
}

function getLeadStatusTone(status: string) {
  switch (status) {
    case "send_ready":
      return "bg-emerald-400/12 text-emerald-200";
    case "qualified":
      return "bg-sky-400/12 text-sky-200";
    case "review_required":
      return "bg-amber-400/12 text-amber-200";
    case "rejected":
      return "bg-rose-400/12 text-rose-200";
    default:
      return "bg-white/[0.06] text-white/70";
  }
}

function isCampaignActive(status: string) {
  return !terminalCampaignStatuses.has(status);
}

export function LeadStudio({
  customers,
  initialCustomerId = null,
  initialBackendError = null,
  initialCampaigns,
}: LeadStudioProps) {
  const defaultCustomerId =
    (initialCustomerId && customers.some((customer) => customer.id === initialCustomerId)
      ? initialCustomerId
      : null) ??
    customers.find((customer) => customer.activeIcp)?.id ??
    customers[0]?.id ??
    "";
  const defaultLeadGoal =
    customers.find((item) => item.id === defaultCustomerId)?.planId === "scale"
      ? 100
      : customers.find((item) => item.id === defaultCustomerId)?.planId === "growth"
        ? 50
        : 25;
  const [selectedCustomerId, setSelectedCustomerId] = useState(defaultCustomerId);
  const [leadGoal, setLeadGoal] = useState<number>(defaultLeadGoal);
  const [minimumScore, setMinimumScore] = useState<number>(70);
  const [executionMode, setExecutionMode] = useState<"background" | "direct">("background");
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(initialCampaigns[0]?.id ?? null);
  const [campaignDetails, setCampaignDetails] = useState<Record<number, BackendCampaignDetail>>({});
  const [statusFilter, setStatusFilter] = useState<(typeof leadStatusFilters)[number]>("all");
  const [leadSearch, setLeadSearch] = useState("");
  const [selectedLeadCompanyId, setSelectedLeadCompanyId] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refreshingCampaigns, setRefreshingCampaigns] = useState(false);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(initialBackendError);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const selectedCampaignDetail = selectedCampaignId ? campaignDetails[selectedCampaignId] ?? null : null;
  const selectedCampaignSummary =
    (selectedCampaignId ? campaigns.find((campaign) => campaign.id === selectedCampaignId) : null) ??
    selectedCampaignDetail?.campaign ??
    null;

  const filteredLeads = useMemo(() => {
    if (!selectedCampaignDetail) {
      return [];
    }

    const search = leadSearch.trim().toLowerCase();

    return sortLeads(selectedCampaignDetail.leads).filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = [
        lead.company_name,
        lead.founder_name ?? "",
        lead.founder_email ?? "",
        lead.source_query ?? "",
        ...lead.services,
        ...lead.tech_stack,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [leadSearch, selectedCampaignDetail, statusFilter]);

  const selectedLead =
    filteredLeads.find((lead) => lead.company_id === selectedLeadCompanyId) ??
    filteredLeads[0] ??
    null;

  const refreshCampaignList = useCallback(async () => {
    setRefreshingCampaigns(true);

    try {
      const response = await fetch("/api/admin/campaigns?limit=24", {
        cache: "no-store",
      });
      const payload = (await response.json()) as CampaignListResponse;

      if (!response.ok || !payload.campaigns) {
        throw new Error(payload.error || "We couldn't refresh campaign history.");
      }

      setCampaigns(payload.campaigns);
      setFeedbackMessage(null);
      if (!selectedCampaignId && payload.campaigns[0]) {
        setSelectedCampaignId(payload.campaigns[0].id);
      }
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error ? error.message : "We couldn't refresh campaign history right now.",
      );
    } finally {
      setRefreshingCampaigns(false);
    }
  }, [selectedCampaignId]);

  const loadCampaignDetail = useCallback(async (campaignId: number, options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setLoadingDetail(true);
    }

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as CampaignDetailResponse;

      if (!response.ok || !payload.detail) {
        throw new Error(payload.error || "We couldn't load that run right now.");
      }

      setCampaignDetails((current) => ({
        ...current,
        [campaignId]: payload.detail!,
      }));
      setCampaigns((current) => {
        const others = current.filter((campaign) => campaign.id !== payload.detail!.campaign.id);
        return [payload.detail!.campaign, ...others].sort(
          (left, right) =>
            new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
        );
      });
      setFeedbackMessage(null);
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error ? error.message : "We couldn't load that campaign right now.",
      );
    } finally {
      if (!options?.silent) {
        setLoadingDetail(false);
      }
    }
  }, []);

  async function handleCreateCampaign() {
    if (!selectedCustomer) {
      setFeedbackMessage("Choose a customer before launching discovery.");
      return;
    }

    if (!selectedCustomer.activeIcp) {
      setFeedbackMessage("This customer needs an active ICP uploaded by admin before discovery can run.");
      return;
    }

    setCreatingCampaign(true);
    setFeedbackMessage(null);

    try {
      const response = await fetch("/api/admin/campaigns", {
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          executionMode,
          leadGoal,
          minimumScore,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as CampaignCreateResponse;

      if (!response.ok || !payload.detail) {
        throw new Error(payload.error || "We couldn't launch the campaign.");
      }

      setCampaigns((current) =>
        [payload.detail!.campaign, ...current.filter((campaign) => campaign.id !== payload.detail!.campaign.id)].sort(
          (left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
        ),
      );
      setCampaignDetails((current) => ({
        ...current,
        [payload.detail!.campaign.id]: payload.detail!,
      }));
      setSelectedCampaignId(payload.detail!.campaign.id);
      setSelectedLeadCompanyId(null);
      setFeedbackMessage(
        payload.executionMode === "direct"
          ? "Direct run finished and the result set is loaded below."
          : "Campaign launched. The studio will keep polling until the worker settles the run.",
      );
    } catch (error) {
      setFeedbackMessage(error instanceof Error ? error.message : "We couldn't launch the campaign.");
    } finally {
      setCreatingCampaign(false);
    }
  }

  useEffect(() => {
    if (!selectedCampaignId || campaignDetails[selectedCampaignId]) {
      return;
    }

    void loadCampaignDetail(selectedCampaignId);
  }, [campaignDetails, loadCampaignDetail, selectedCampaignId]);

  useEffect(() => {
    if (!selectedCustomer) {
      return;
    }

    setLeadGoal(
      selectedCustomer.planId === "scale"
        ? 100
        : selectedCustomer.planId === "growth"
          ? 50
          : 25,
    );
  }, [selectedCustomerId, selectedCustomer]);

  useEffect(() => {
    setSelectedLeadCompanyId(filteredLeads[0]?.company_id ?? null);
  }, [selectedCampaignId, filteredLeads]);

  useEffect(() => {
    if (!selectedCampaignDetail || !selectedCampaignId) {
      return;
    }

    if (!isCampaignActive(selectedCampaignDetail.campaign.status)) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void loadCampaignDetail(selectedCampaignId, { silent: true });
      void refreshCampaignList();
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [loadCampaignDetail, refreshCampaignList, selectedCampaignDetail, selectedCampaignId]);

  const summaryStats = selectedCampaignDetail ? getCampaignSummaryStats(selectedCampaignDetail) : null;
  const activeReasons = selectedLead ? getLeadReasonList(selectedLead) : [];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="gap-2 bg-terracotta/12 px-4 py-1.5 text-[0.72rem] uppercase tracking-[0.18em] text-terracotta">
            <Sparkles className="h-3.5 w-3.5" />
            Lead studio
          </Badge>
          <Badge variant="muted">Admin-managed ICP</Badge>
          <Badge variant="muted">In-app result review</Badge>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl space-y-3">
            <h1 className="text-4xl md:text-5xl">Generate, inspect, and refine lead campaigns in one place.</h1>
            <p className="max-w-3xl text-base leading-8 text-white/68 md:text-lg">
              This workspace turns an admin-managed customer ICP into a live backend campaign,
              then keeps the run, buckets, and raw lead evidence accessible inside admin. No
              sheet hop required.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant="secondary"
              className="gap-2"
              onClick={() => void refreshCampaignList()}
              disabled={refreshingCampaigns}
            >
              {refreshingCampaigns ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh history
            </Button>
          </div>
        </div>
      </section>

      {feedbackMessage ? (
        <Card className="border-amber-300/20 bg-amber-500/[0.08]">
          <CardContent className="flex items-start gap-4 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-200" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-100">Lead studio note</p>
              <p className="text-sm leading-7 text-amber-50/88">{feedbackMessage}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Card>
            <CardHeader>
              <CardTitle>Launch a campaign</CardTitle>
              <CardDescription>
                Pick a customer, use the active admin-uploaded ICP, and decide how selective the
                run should be.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/48">Customer workspace</p>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white/86">
                      {selectedCustomer?.activeIcp?.name?.trim() || "Active ICP summary"}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-white/58">
                      {selectedCustomer?.activeIcp?.productDescription ??
                        "No admin-uploaded active ICP is attached to this customer yet."}
                    </p>
                  </div>
                  <Badge variant={selectedCustomer?.activeIcp ? "success" : "muted"}>
                    {selectedCustomer?.activeIcp ? "Ready" : "Missing ICP"}
                  </Badge>
                </div>

                {selectedCustomer?.activeIcp ? (
                  <div className="mt-4 space-y-4 text-sm text-white/72">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/42">Industries</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedCustomer.activeIcp.industries.slice(0, 4).map((industry) => (
                          <Badge key={industry} variant="outline" className="text-[0.72rem]">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                      <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/42">Regions</p>
                        <p className="mt-2 leading-6">{selectedCustomer.activeIcp.geographies.slice(0, 3).join(", ") || "Open geography"}</p>
                      </div>
                      <div>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/42">Company size</p>
                        <p className="mt-2 leading-6">{selectedCustomer.activeIcp.companySizeLabel}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/86">Lead goal</p>
                  <p className="text-sm text-white/52">{leadGoal} requested</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {leadGoalOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLeadGoal(value)}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                        leadGoal === value
                          ? "border-terracotta/40 bg-terracotta/12 text-white"
                          : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06]",
                      )}
                    >
                      <span className="block text-base font-semibold">{value}</span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-white/40">Leads</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/86">Minimum match score</p>
                  <p className="text-sm text-white/52">{minimumScore}% gate</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {matchScoreOptions.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMinimumScore(value)}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                        minimumScore === value
                          ? "border-terracotta/40 bg-terracotta/12 text-white"
                          : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:bg-white/[0.06]",
                      )}
                    >
                      <span className="block text-base font-semibold">{value}</span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-white/40">Selectivity</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-white/86">Execution mode</p>
                <div className="space-y-2">
                  {executionModes.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setExecutionMode(mode.value)}
                      className={cn(
                        "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                        executionMode === mode.value
                          ? "border-terracotta/40 bg-terracotta/12"
                          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{mode.label}</p>
                        {executionMode === mode.value ? <Badge>Selected</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-white/56">{mode.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full gap-2"
                disabled={!selectedCustomer?.activeIcp || creatingCampaign}
                onClick={() => void handleCreateCampaign()}
              >
                {creatingCampaign ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
                Generate lead set
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent runs</CardTitle>
              <CardDescription>
                Jump back into a campaign and inspect its lead set without leaving admin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    type="button"
                    onClick={() => setSelectedCampaignId(campaign.id)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-colors",
                      selectedCampaignId === campaign.id
                        ? "border-terracotta/35 bg-white/[0.05]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/18 hover:bg-white/[0.04]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="line-clamp-2 font-semibold text-white/90">{campaign.name}</p>
                        <p className="text-sm text-white/48">
                          {campaign.client_name || campaign.industry || "Lead campaign"}
                        </p>
                      </div>
                      <Badge className={cn("capitalize", getCampaignStatusTone(campaign.status))}>
                        {campaign.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-white/54">
                      <span>{campaign.requested_leads} requested</span>
                      <span>{formatDateTime(campaign.updated_at)}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm leading-7 text-white/56">
                  No lead campaigns yet. Launch one from the saved customer ICP to start building a reusable run history.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedCampaignSummary ? (
            <Card>
              <CardHeader className="gap-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className={cn("capitalize", getCampaignStatusTone(selectedCampaignSummary.status))}>
                        {selectedCampaignSummary.status.replace(/_/g, " ")}
                      </Badge>
                      <Badge variant="muted">Run #{selectedCampaignSummary.id}</Badge>
                      {selectedCampaignSummary.client_name ? <Badge variant="muted">{selectedCampaignSummary.client_name}</Badge> : null}
                    </div>

                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/44">Selected campaign</p>
                      <h2 className="mt-2 text-3xl font-semibold text-white">{selectedCampaignSummary.name}</h2>
                    </div>

                    <p className="max-w-3xl text-sm leading-7 text-white/56">
                      Keep this run open while it is active. The studio will refresh the backend state, preserve the output buckets,
                      and let you inspect every lead without exporting the result anywhere else.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-2"
                      onClick={() => selectedCampaignId && void loadCampaignDetail(selectedCampaignId)}
                      disabled={!selectedCampaignId || loadingDetail}
                    >
                      {loadingDetail ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Refresh run
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {summaryStats ? (
                  <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-6">
                    {[
                      ["Lead goal", String(summaryStats.leadGoal)],
                      ["Generated", String(summaryStats.generated)],
                      ["Send-ready", String(summaryStats.sendReady)],
                      ["Review required", String(summaryStats.reviewRequired)],
                      ["Rejected", String(summaryStats.rejected)],
                      ["Average score", summaryStats.averageScore > 0 ? `${summaryStats.averageScore}` : "--"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-sm text-white/48">{label}</p>
                        <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </section>
                ) : null}

                {selectedCampaignDetail ? (
                  <div className="space-y-6">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.74fr)]">
                      <Card className="border-white/8 bg-[#0a131d] shadow-none">
                        <CardHeader className="gap-4">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div>
                              <CardTitle className="text-xl">Lead set</CardTitle>
                              <CardDescription>
                                Filter by quality bucket and open a lead to inspect its evidence.
                              </CardDescription>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {leadStatusFilters.map((filter) => (
                                <button
                                  key={filter}
                                  type="button"
                                  onClick={() => setStatusFilter(filter)}
                                  className={cn(
                                    "rounded-full px-4 py-2 text-sm transition-colors",
                                    statusFilter === filter
                                      ? "bg-terracotta text-white"
                                      : "bg-white/[0.05] text-white/62 hover:bg-white/[0.1] hover:text-white",
                                  )}
                                >
                                  {filter === "all" ? "All" : filter.replace(/_/g, " ")}
                                </button>
                              ))}
                            </div>
                          </div>

                          <Input
                            value={leadSearch}
                            onChange={(event) => setLeadSearch(event.target.value)}
                            placeholder="Search by company, founder, email, query, or service"
                          />
                        </CardHeader>
                        <CardContent>
                          {filteredLeads.length > 0 ? (
                            <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
                              {filteredLeads.map((lead) => (
                                <button
                                  key={`${lead.company_id}-${lead.status}`}
                                  type="button"
                                  onClick={() => setSelectedLeadCompanyId(lead.company_id)}
                                  className={cn(
                                    "w-full rounded-2xl border p-4 text-left transition-colors",
                                    selectedLead?.company_id === lead.company_id
                                      ? "border-terracotta/40 bg-terracotta/8"
                                      : "border-white/8 bg-white/[0.02] hover:border-white/18 hover:bg-white/[0.04]",
                                  )}
                                >
                                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="space-y-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-lg font-semibold text-white">{lead.company_name}</p>
                                        <Badge className={cn("capitalize", getLeadStatusTone(lead.status))}>
                                          {lead.status.replace(/_/g, " ")}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-white/60">
                                        {lead.founder_name || "No named decision-maker yet"}
                                        {lead.founder_email ? ` - ${lead.founder_email}` : ""}
                                      </p>
                                      <p className="text-sm text-white/48">
                                        {lead.source_query || "No source query recorded"}
                                      </p>
                                    </div>

                                    <div className="grid min-w-[220px] grid-cols-2 gap-3 text-sm">
                                      <div className="rounded-xl bg-white/[0.03] p-3">
                                        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Campaign score</p>
                                        <p className="mt-2 text-2xl font-semibold text-white">
                                          {Math.round(lead.recommendation_score ?? lead.lead_score)}
                                        </p>
                                      </div>
                                      <div className="rounded-xl bg-white/[0.03] p-3">
                                        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Contactability</p>
                                        <p className="mt-2 text-base font-semibold capitalize text-white">
                                          {String(lead.contactability).replace(/_/g, " ")}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm leading-7 text-white/58">
                              No leads match the current filter. Try switching buckets or clearing the search.
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="border-white/8 bg-[#0a131d] shadow-none">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-xl">
                            <Target className="h-5 w-5 text-terracotta" />
                            Lead inspector
                          </CardTitle>
                          <CardDescription>
                            Open one lead to review why it surfaced and what evidence the backend attached to it.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {selectedLead ? (
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <Badge className={cn("capitalize", getLeadStatusTone(selectedLead.status))}>
                                    {selectedLead.status.replace(/_/g, " ")}
                                  </Badge>
                                  <Badge variant="muted">
                                    Score {Math.round(selectedLead.recommendation_score ?? selectedLead.lead_score)}
                                  </Badge>
                                  {selectedLead.founder_confidence ? (
                                    <Badge variant="muted">
                                      Founder confidence {Math.round(selectedLead.founder_confidence * 100)}%
                                    </Badge>
                                  ) : null}
                                </div>
                                <div>
                                  <h3 className="text-2xl font-semibold text-white">{selectedLead.company_name}</h3>
                                  <p className="mt-2 text-sm leading-7 text-white/58">
                                    {selectedLead.founder_name || "Decision-maker still unclear"}
                                    {selectedLead.founder_email ? ` - ${selectedLead.founder_email}` : ""}
                                  </p>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Source query</p>
                                  <p className="mt-2 text-sm leading-7 text-white/74">
                                    {selectedLead.source_query || "No source query stored"}
                                  </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Contactability</p>
                                  <p className="mt-2 text-sm font-semibold capitalize text-white/84">
                                    {String(selectedLead.contactability).replace(/_/g, " ")}
                                  </p>
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Services</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedLead.services.length > 0 ? (
                                      selectedLead.services.map((service) => (
                                        <Badge key={service} variant="outline">
                                          {service}
                                        </Badge>
                                      ))
                                    ) : (
                                      <Badge variant="muted">No service tags</Badge>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Technologies</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedLead.tech_stack.length > 0 ? (
                                      selectedLead.tech_stack.map((technology) => (
                                        <Badge key={technology} variant="outline">
                                          {technology}
                                        </Badge>
                                      ))
                                    ) : (
                                      <Badge variant="muted">No tech tags</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Reason stack</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {activeReasons.length > 0 ? (
                                    activeReasons.map((reason) => (
                                      <Badge key={reason} variant="outline" className="max-w-full whitespace-normal text-left leading-5">
                                        {reason}
                                      </Badge>
                                    ))
                                  ) : (
                                    <Badge variant="muted">No explicit reason list stored</Badge>
                                  )}
                                </div>
                              </div>

                              <details className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <summary className="cursor-pointer text-sm font-semibold text-white/84">
                                  View raw lead metadata
                                </summary>
                                <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-[#07111b] p-4 text-xs leading-6 text-white/70">
                                  {JSON.stringify(selectedLead.lead_metadata, null, 2)}
                                </pre>
                              </details>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm leading-7 text-white/58">
                              Select a lead from the result list to inspect the evidence.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border-white/8 bg-[#0a131d] shadow-none">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Activity className="h-5 w-5 text-terracotta" />
                          Run telemetry
                        </CardTitle>
                        <CardDescription>
                          Query plan, backend progress, and the movement of the run over time.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          {[
                            ["Created", formatDateTime(selectedCampaignDetail.campaign.created_at)],
                            ["Updated", formatDateTime(selectedCampaignDetail.campaign.updated_at)],
                            ["Query plan", `${selectedCampaignDetail.query_plan.length} search passes`],
                            ["Premium leads", `${selectedCampaignDetail.campaign.premium_leads}`],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                              <p className="text-sm text-white/48">{label}</p>
                              <p className="mt-2 text-base font-semibold text-white">{value}</p>
                            </div>
                          ))}
                        </div>

                        <details className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <summary className="cursor-pointer text-sm font-semibold text-white/84">
                            View backend progress payload
                          </summary>
                          <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-[#07111b] p-4 text-xs leading-6 text-white/70">
                            {JSON.stringify(selectedCampaignDetail.progress, null, 2)}
                          </pre>
                        </details>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm leading-7 text-white/58">
                    Choose a campaign from the left or launch a new one to load the in-app result workspace.
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-10 text-center">
                <p className="text-lg font-semibold text-white">No campaign selected yet.</p>
                <p className="mt-3 text-sm leading-7 text-white/58">
                  Launch the first admin-managed ICP run from the lead studio and the full in-app result view will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
