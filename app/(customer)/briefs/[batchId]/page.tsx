import { notFound } from "next/navigation";
import { PageEvent } from "@/components/analytics/page-event";
import { BatchFeedbackForm } from "@/components/customer/batch-feedback-form";
import { LeadCard } from "@/components/customer/lead-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { getCustomerBatchDetail } from "@/lib/supabase/customer-data";
import type { Database } from "@/types/database.types";

type BriefDetailPageProps = {
  params: Promise<{ batchId: string }>;
};

function getLeadFitLabel(fitScore: number | null) {
  if (fitScore === null) {
    return "Unscored";
  }

  if (fitScore >= 9) {
    return `${fitScore}/10 best fit`;
  }

  if (fitScore >= 7) {
    return `${fitScore}/10 high signal`;
  }

  return `${fitScore}/10 solid fit`;
}

function getEmailStatusLabel(status: Database["public"]["Tables"]["leads"]["Row"]["email_status"]) {
  if (!status) {
    return "unknown";
  }

  return status.replace(/_/g, " ");
}

function getRecommendedAngleLabel(
  opener: Database["public"]["Tables"]["leads"]["Row"]["recommended_opener"],
) {
  switch (opener) {
    case "a":
      return "Option A";
    case "b":
      return "Option B";
    case "c":
      return "Option C";
    default:
      return "Best angle";
  }
}

export default async function BriefDetailPage({ params }: BriefDetailPageProps) {
  const { batchId } = await params;
  const detail = await getCustomerBatchDetail(batchId);

  if (!detail) {
    notFound();
  }

  const { batch, leadFeedbackById, leads } = detail;

  return (
    <Container className="space-y-8 px-0">
      <PageEvent
        name="brief_viewed"
        oncePerSessionKey={`brief-viewed:${batch.id}`}
        properties={{ batch_id: batch.id, location: batchId }}
      />
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl">Brief delivered {batch.deliveryDateLabel}</h1>
        <p className="text-muted">
          {batch.leadCount} hyper-researched leads | {batch.verifiedEmails} verified emails
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-ink"
          type="button"
        >
          Export to CSV
        </button>
        <button
          className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-ink"
          type="button"
        >
          Print / PDF
        </button>
        <button
          className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-ink"
          type="button"
        >
          Filter & Sort
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter bar</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
            Filter by industry
          </div>
          <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
            Filter by company size
          </div>
          <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
            Filter by signal strength
          </div>
          <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
            Sort by best fit
          </div>
        </CardContent>
      </Card>

      {leads.length > 0 ? (
        <div className="space-y-4">
          {leads.map((lead) => (
            <LeadCard
              key={lead.id}
              company={lead.company_name}
              email={lead.email ?? "No email provided"}
              emailStatus={getEmailStatusLabel(lead.email_status)}
              fitScore={getLeadFitLabel(lead.fit_score)}
              initialFeedback={leadFeedbackById[lead.id] ?? null}
              leadId={lead.id}
              name={lead.full_name}
              openers={[
                lead.opener_a,
                lead.opener_b,
                lead.opener_c,
              ].filter((value): value is string => Boolean(value))}
              recommendedAngle={getRecommendedAngleLabel(lead.recommended_opener)}
              role={lead.current_title}
              signals={lead.trigger_signals ?? ["No trigger signals recorded yet."]}
              triggerSummary={lead.recommended_reason ?? lead.why_this_lead ?? "No summary available yet."}
              whyNow={lead.why_this_lead ?? "No why-now note is available for this lead yet."}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          description="This batch exists, but no lead records have been added yet. Once leads are loaded, they will appear here with opener copy and trigger signals."
          title="No leads in this batch yet"
        />
      )}

      <Card>
        <CardContent className="p-6">
          <BatchFeedbackForm batchId={batch.id} />
        </CardContent>
      </Card>
    </Container>
  );
}
