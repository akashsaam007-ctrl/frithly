"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ParsedBatchPreview } from "@/lib/admin/batch-builder";
import { ROUTES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

type BatchBuilderProps = {
  customers: {
    email: string;
    id: string;
    label: string;
    planId: "design_partner" | "growth" | "scale" | "starter" | null;
    planLabel: string;
    recommendedLeadCount: number;
    status: string;
  }[];
  defaultDeliveryDate: string;
};

type BatchAction = "draft" | "preview" | "publish";

type BatchApiResponse = {
  batchId?: string;
  customer?: {
    email: string;
    id: string;
    name: string;
  };
  error?: string;
  preview?: ParsedBatchPreview;
  success?: boolean;
  warning?: string | null;
};

type BatchGenerationDiagnostics = {
  crawledDomains: number;
  datasetCandidates: number;
  datasetSize: number;
  dedupedDomains: number;
  directorySeeds: number;
  excludedDuplicates: number;
  excludedExclusions: number;
  excludedNonCompany: number;
  excludedSize: number;
  finalLeads: number;
  localPipelineEnabled: boolean;
  localResults: number;
  minMatchPercent: number;
  pipelineCounts: Record<"company_search" | "directory" | "job_signal" | "local_search", number>;
  queriesExecuted: number;
  queriesGenerated: number;
  rawResults: number;
  scoredCandidates: number;
  belowThreshold: number;
};

type BatchGenerateApiResponse = {
  customer?: {
    email: string;
    id: string;
    name: string;
  };
  diagnostics?: BatchGenerationDiagnostics;
  error?: string;
  leadsJson?: string;
  logs?: string[];
  preview?: ParsedBatchPreview;
  success?: boolean;
};

const sampleLeadPayload = `[
  {
    "full_name": "Sarah Chen",
    "current_title": "Head of Operations",
    "company_name": "Volcano Digital",
    "company_location": "London, UK",
    "email": "sarah@volcano.io",
    "email_status": "verified",
    "why_this_lead": "Just hired 4 Account Managers in the last 60 days, signaling rapid client growth.",
    "trigger_signals": [
      "Posted about juggling 6 different tools",
      "Featured on Agency Built podcast",
      "Hired 4 Account Managers in 60 days"
    ],
    "opener_a": "Saw you hired 4 AMs in 60 days - that's usually when tracking tools start breaking.",
    "opener_b": "Caught your Agency Built episode on scaling onboarding. Worth a quick exchange?",
    "opener_c": "Your post about juggling 6 tools is exactly the pain we built for.",
    "recommended_opener": "a",
    "recommended_reason": "Hiring velocity suggests operational strain right now."
  }
]`;

function getActionLabel(action: BatchAction, isBusy: boolean) {
  if (!isBusy) {
    switch (action) {
      case "preview":
        return "Preview Batch";
      case "draft":
        return "Save as Draft";
      case "publish":
        return "Publish & Notify";
      default:
        return "Continue";
    }
  }

  switch (action) {
    case "preview":
      return "Building preview...";
    case "draft":
      return "Saving draft...";
    case "publish":
      return "Publishing...";
    default:
      return "Working...";
  }
}

export function BatchBuilder({ customers, defaultDeliveryDate }: BatchBuilderProps) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id ?? "");
  const [deliveryDate, setDeliveryDate] = useState(defaultDeliveryDate);
  const [leads, setLeads] = useState(sampleLeadPayload);
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<ParsedBatchPreview | null>(null);
  const [savedBatch, setSavedBatch] = useState<{
    batchId: string;
    customerId: string;
    customerName: string;
    warning: string | null;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<BatchAction | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(customers[0]?.recommendedLeadCount ?? 50);
  const [queryBudget, setQueryBudget] = useState(120);
  const [minMatchPercent, setMinMatchPercent] = useState(60);
  const [generationSummary, setGenerationSummary] = useState<{
    diagnostics: BatchGenerationDiagnostics;
    logs: string[];
  } | null>(null);

  const normalizedSearch = customerSearch.trim().toLowerCase();
  const filteredCustomers = customers.filter((customer) => {
    if (!normalizedSearch) {
      return true;
    }

    return `${customer.label} ${customer.planLabel} ${customer.status}`
      .toLowerCase()
      .includes(normalizedSearch);
  });
  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ?? filteredCustomers[0] ?? null;

  useEffect(() => {
    if (selectedCustomer?.recommendedLeadCount) {
      setGenerationCount(selectedCustomer.recommendedLeadCount);
    }
  }, [selectedCustomerId, selectedCustomer?.recommendedLeadCount]);

  async function runAction(action: BatchAction) {
    if (!selectedCustomerId) {
      toast.error("Choose a customer before creating a batch.");
      return;
    }

    if (!deliveryDate) {
      toast.error("Pick a delivery date first.");
      return;
    }

    if (!leads.trim()) {
      toast.error("Paste JSON or CSV lead data before continuing.");
      return;
    }

    setIsSubmitting(action);

    try {
      const response = await fetch("/api/admin/batches", {
        body: JSON.stringify({
          action,
          customerId: selectedCustomerId,
          deliveryDate,
          leads,
          notes,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as BatchApiResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "We couldn't finish that batch action.");
      }

      if (payload.preview) {
        setPreview(payload.preview);
      }

      if (action === "preview") {
        toast.success("Preview ready.");
        return;
      }

      if (payload.batchId && payload.customer) {
        setSavedBatch({
          batchId: payload.batchId,
          customerId: payload.customer.id,
          customerName: payload.customer.name,
          warning: payload.warning ?? null,
        });
      }

      toast.success(
        action === "draft"
          ? "Draft batch saved."
          : "Batch published successfully.",
      );

      if (payload.warning) {
        toast.error(payload.warning);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We couldn't finish that batch action.",
      );
    } finally {
      setIsSubmitting(null);
    }
  }

  async function runGeneration() {
    if (!selectedCustomerId) {
      toast.error("Choose a customer before generating leads.");
      return;
    }

    if (!deliveryDate) {
      toast.error("Pick a delivery date first.");
      return;
    }

    setIsGenerating(true);
    setGenerationSummary(null);

    try {
      const response = await fetch("/api/admin/batches/generate", {
        body: JSON.stringify({
          customerId: selectedCustomerId,
          deliveryDate,
          minMatchPercent,
          queryBudget,
          requestedLeadCount: generationCount,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as BatchGenerateApiResponse;

      if (!response.ok || !payload.success || !payload.leadsJson || !payload.preview || !payload.diagnostics) {
        throw new Error(payload.error ?? "We couldn't generate leads from the saved ICP.");
      }

      setLeads(payload.leadsJson);
      setPreview(payload.preview);
      setGenerationSummary({
        diagnostics: payload.diagnostics,
        logs: payload.logs ?? [],
      });
      toast.success(
        payload.diagnostics.finalLeads > 0
          ? `Generated ${payload.diagnostics.finalLeads} leads at ${payload.diagnostics.minMatchPercent}%+ ICP match.`
          : "Generation finished, but no leads cleared the ICP match floor.",
      );
    } catch (error) {
      setGenerationSummary(null);
      toast.error(
        error instanceof Error ? error.message : "We couldn't generate leads from the saved ICP.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-8">
      {customers.length === 0 ? (
        <EmptyState
          className="border border-border"
          description="Create a customer account first, then come back here to build their first brief."
          title="No customer accounts yet"
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="batch-customer-search">Search customers</Label>
              <Input
                id="batch-customer-search"
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder="Search by company, email, plan, or status"
                value={customerSearch}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-date">Delivery date</Label>
              <Input
                id="batch-date"
                onChange={(event) => setDeliveryDate(event.target.value)}
                type="date"
                value={deliveryDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch-customer">Customer</Label>
            <Select
              onValueChange={setSelectedCustomerId}
              value={selectedCustomerId}
            >
              <SelectTrigger id="batch-customer">
                <SelectValue placeholder="Choose a customer" />
              </SelectTrigger>
              <SelectContent>
                {filteredCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filteredCustomers.length === 0 ? (
              <p className="text-sm text-muted">No customers matched that search.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch-leads">Leads (JSON or CSV)</Label>
            <div className="rounded-2xl border border-border bg-cream p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
                    Generate from saved ICP
                  </p>
                  <p className="text-sm text-muted">
                    Wide collection {"->"} crawl {"->"} score {"->"} filter. Only leads matching at least {minMatchPercent}% of the ICP are returned.
                  </p>
                </div>
                <Button
                  disabled={customers.length === 0 || isGenerating || isSubmitting !== null}
                  onClick={() => void runGeneration()}
                  type="button"
                >
                  {isGenerating ? "Generating..." : "Generate from customer ICP"}
                </Button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="generate-lead-count">Requested leads</Label>
                  <Input
                    id="generate-lead-count"
                    min={1}
                    max={250}
                    type="number"
                    value={generationCount}
                    onChange={(event) =>
                      setGenerationCount(Math.max(1, Number.parseInt(event.target.value || "0", 10) || 1))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generate-query-budget">Query budget</Label>
                  <Input
                    id="generate-query-budget"
                    min={20}
                    max={500}
                    type="number"
                    value={queryBudget}
                    onChange={(event) =>
                      setQueryBudget(Math.max(20, Number.parseInt(event.target.value || "0", 10) || 20))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="generate-min-match">Minimum ICP match %</Label>
                  <Input
                    id="generate-min-match"
                    min={40}
                    max={100}
                    type="number"
                    value={minMatchPercent}
                    onChange={(event) =>
                      setMinMatchPercent(
                        Math.min(100, Math.max(40, Number.parseInt(event.target.value || "0", 10) || 60)),
                      )
                    }
                  />
                </div>
              </div>
            </div>
            <Textarea
              id="batch-leads"
              onChange={(event) => setLeads(event.target.value)}
              placeholder='Paste a JSON array or CSV with headers like "full_name,current_title,company_name,email"...'
              rows={16}
              value={leads}
            />
            <p className="text-sm text-muted">
              Required fields per lead: full name, title, and company. JSON gives you the cleanest import for opener text and signal arrays.
            </p>
            {generationSummary ? (
              <div className="rounded-2xl border border-border bg-white p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg text-ink">Generation diagnostics</h3>
                  <Badge variant="outline">
                    {generationSummary.diagnostics.finalLeads} leads
                  </Badge>
                  <Badge variant="muted">
                    floor {generationSummary.diagnostics.minMatchPercent}%
                  </Badge>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-2 xl:grid-cols-4">
                  <p>Queries generated: {generationSummary.diagnostics.queriesGenerated}</p>
                  <p>Queries executed: {generationSummary.diagnostics.queriesExecuted}</p>
                  <p>Raw results: {generationSummary.diagnostics.rawResults}</p>
                  <p>Domains crawled: {generationSummary.diagnostics.crawledDomains}</p>
                  <p>Unique domains: {generationSummary.diagnostics.dedupedDomains}</p>
                  <p>Scored candidates: {generationSummary.diagnostics.scoredCandidates}</p>
                  <p>Below floor: {generationSummary.diagnostics.belowThreshold}</p>
                  <p>Owned dataset size: {generationSummary.diagnostics.datasetSize}</p>
                  <p>Owned dataset matches: {generationSummary.diagnostics.datasetCandidates}</p>
                  <p>Directory seeds: {generationSummary.diagnostics.directorySeeds}</p>
                  <p>Directory hits: {generationSummary.diagnostics.pipelineCounts.directory}</p>
                  <p>Job-signal hits: {generationSummary.diagnostics.pipelineCounts.job_signal}</p>
                  <p>Local/Maps hits: {generationSummary.diagnostics.localResults}</p>
                  <p>
                    Local/Maps pipeline: {generationSummary.diagnostics.localPipelineEnabled ? "on" : "off"}
                  </p>
                  <p>Excluded as non-company: {generationSummary.diagnostics.excludedNonCompany}</p>
                  <p>Excluded by size: {generationSummary.diagnostics.excludedSize}</p>
                  <p>Excluded by exclusions: {generationSummary.diagnostics.excludedExclusions}</p>
                  <p>Excluded as duplicates: {generationSummary.diagnostics.excludedDuplicates}</p>
                </div>

                {generationSummary.logs.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
                      Pipeline log
                    </p>
                    <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border bg-cream p-3 text-sm text-muted">
                      {generationSummary.logs.map((entry, index) => (
                        <p key={`${index}-${entry}`}>- {entry}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch-notes">Internal notes</Label>
            <Textarea
              id="batch-notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional customer context, blockers, or delivery notes..."
              rows={5}
              value={notes}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={customers.length === 0 || isSubmitting !== null}
              onClick={() => void runAction("preview")}
              variant="secondary"
            >
              {getActionLabel("preview", isSubmitting === "preview")}
            </Button>
            <Button
              disabled={customers.length === 0 || isSubmitting !== null}
              onClick={() => void runAction("draft")}
              variant="secondary"
            >
              {getActionLabel("draft", isSubmitting === "draft")}
            </Button>
            <Button
              disabled={customers.length === 0 || isSubmitting !== null}
              onClick={() => void runAction("publish")}
            >
              {getActionLabel("publish", isSubmitting === "publish")}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl">Batch snapshot</h2>
                {selectedCustomer ? (
                  <Badge variant="outline">{selectedCustomer.planLabel}</Badge>
                ) : null}
                {selectedCustomer ? (
                  <Badge variant="muted">{selectedCustomer.status}</Badge>
                ) : null}
              </div>

              <div className="space-y-2 text-sm text-muted">
                <p>
                  <span className="font-semibold text-ink">Customer:</span>{" "}
                  {selectedCustomer?.label ?? "Choose a customer"}
                </p>
                <p>
                  <span className="font-semibold text-ink">Delivery date:</span>{" "}
                  {deliveryDate || "Not set yet"}
                </p>
                <p>
                  <span className="font-semibold text-ink">Detected format:</span>{" "}
                  {leads.trim().startsWith("[") ? "JSON" : "CSV"}
                </p>
              </div>

              {savedBatch ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="font-semibold text-ink">Latest saved batch</p>
                  <p className="mt-2 text-sm text-muted">
                    {savedBatch.customerName} · {savedBatch.batchId}
                  </p>
                  {savedBatch.warning ? (
                    <p className="mt-2 text-sm text-terracotta">{savedBatch.warning}</p>
                  ) : null}
                  <Link
                    className="mt-3 inline-flex text-sm font-semibold text-terracotta underline underline-offset-4"
                    href={`${ROUTES.ADMIN_CUSTOMERS}/${savedBatch.customerId}`}
                  >
                    Open customer record -&gt;
                  </Link>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <h2 className="text-2xl">Customer-facing preview</h2>
                <p className="text-sm text-muted">
                  This mirrors the brief content shape your customer will open after delivery.
                </p>
              </div>

              {preview ? (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-border bg-cream p-4">
                    <p className="font-semibold text-ink">
                      Brief delivered {preview.deliveryDateLabel}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      {preview.leadCount} leads · {preview.verifiedEmails} verified emails
                    </p>
                  </div>

                  {preview.previewLeads.map((lead) => (
                    <div key={`${lead.name}-${lead.company}`} className="rounded-2xl border border-border bg-white p-5">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl text-ink">{lead.name}</h3>
                          <Badge variant="outline">{lead.recommendedAngle} recommended</Badge>
                        </div>
                        <p className="text-sm text-muted">
                          {lead.role} · {lead.company}
                        </p>
                        <p className="text-sm text-muted">
                          {lead.email ?? "No email supplied"} · {lead.emailStatus ?? "unknown"}
                        </p>
                      </div>

                      <div className="mt-5 space-y-4">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
                            Why this lead, right now
                          </p>
                          <p className="mt-2 text-sm text-muted">{lead.whyNow}</p>
                        </div>

                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
                            Trigger signals
                          </p>
                          <ul className="mt-2 space-y-2 text-sm text-muted">
                            {lead.signals.map((signal) => (
                              <li key={`${lead.name}-${signal}`}>- {signal}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
                            Personalized openers
                          </p>
                          <div className="mt-3 space-y-3">
                            {lead.openers.length > 0 ? (
                              lead.openers.map((opener, index) => (
                                <div
                                  key={`${lead.name}-${index}`}
                                  className="rounded-xl border border-border bg-cream px-4 py-3 text-sm text-muted"
                                >
                                  <p className="mb-1 font-semibold text-ink">
                                    Option {String.fromCharCode(65 + index)}
                                  </p>
                                  <p>{opener}</p>
                                </div>
                              ))
                            ) : (
                              <div className="rounded-xl border border-border bg-cream px-4 py-3 text-sm text-muted">
                                No openers supplied for this lead yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {preview.leadCount > preview.previewLeads.length ? (
                    <p className="text-sm text-muted">
                      Showing the first {preview.previewLeads.length} leads from this batch preview.
                    </p>
                  ) : null}
                </div>
              ) : (
                <EmptyState
                  className="border-0 px-0 py-2 shadow-none"
                  description="Run Preview Batch once your leads are pasted and we’ll render the customer-facing brief summary here."
                  title="Preview not generated yet"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
