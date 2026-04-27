import { notFound } from "next/navigation";
import { BatchFeedbackForm } from "@/components/customer/batch-feedback-form";
import { LeadCard } from "@/components/customer/lead-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { demoBatches, demoLeads } from "@/lib/utils/demo-data";

type BriefDetailPageProps = {
  params: Promise<{ batchId: string }>;
};

export default async function BriefDetailPage({ params }: BriefDetailPageProps) {
  const { batchId } = await params;
  const batch = demoBatches.find((item) => item.id === batchId);

  if (!batch) {
    notFound();
  }

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl">Brief delivered {batch.deliveryDate}</h1>
        <p className="text-muted">
          {batch.leadCount} hyper-researched leads · {batch.verifiedEmails} verified emails
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-ink" type="button">
          📥 Export to CSV
        </button>
        <button className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-ink" type="button">
          🖨️ Print/PDF
        </button>
        <button className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-ink" type="button">
          ⚙️ Filter & Sort
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

      <div className="space-y-4">
        {demoLeads.map((lead) => (
          <LeadCard
            key={lead.id}
            company={lead.company}
            email={lead.email}
            emailStatus={lead.emailStatus}
            fitScore={lead.fitScore}
            name={lead.name}
            openers={lead.openers}
            recommendedAngle={lead.recommendedAngle}
            role={lead.role}
            signals={lead.signals}
            triggerSummary={lead.triggerSummary}
            whyNow={lead.whyNow}
          />
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <BatchFeedbackForm />
        </CardContent>
      </Card>
    </Container>
  );
}
