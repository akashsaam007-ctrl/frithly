import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoAdminCustomers, demoBatches, demoFeedback } from "@/lib/utils/demo-data";

type AdminCustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerDetailPage({
  params,
}: AdminCustomerDetailPageProps) {
  const { id } = await params;
  const customer = demoAdminCustomers[Math.max(Number(id) - 1, 0)] ?? demoAdminCustomers[0];

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl md:text-5xl">{customer.name}</h1>
          <span className="rounded-full bg-terracotta/10 px-3 py-1 text-sm font-semibold text-terracotta">
            {customer.plan}
          </span>
          <span className="rounded-full bg-cream px-3 py-1 text-sm font-semibold text-ink capitalize">
            {customer.status}
          </span>
        </div>
        <p className="text-muted">
          {customer.email} · MRR {customer.mrr}
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" type="button">Pause customer</button>
          <button className="btn-secondary" type="button">Send email</button>
          <button className="btn-secondary" type="button">View Stripe</button>
          <button className="btn-primary" type="button">Edit ICP</button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="icp">ICP</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="grid gap-6 p-6 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted">Signup date</p>
                <p className="mt-2 text-xl font-semibold text-ink">{customer.signupDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Latest batch</p>
                <p className="mt-2 text-xl font-semibold text-ink">{customer.lastBatch}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Lead approval rate</p>
                <p className="mt-2 text-xl font-semibold text-ink">84%</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="icp">
          <Card>
            <CardContent className="space-y-4 p-6 text-muted">
              <p>Primary ICP: Heads of Sales, VP Sales, CROs in B2B SaaS.</p>
              <p>Signals: Hiring SDRs, funding, process pain, tool sprawl.</p>
              <p>History: Refined twice in the last 30 days after positive replies in fintech.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches">
          <Card>
            <CardContent className="space-y-4 p-6">
              {demoBatches.map((batch) => (
                <div key={batch.id} className="rounded-xl border border-border p-4">
                  <p className="font-semibold text-ink">{batch.deliveryDate}</p>
                  <p className="text-sm text-muted">
                    {batch.positiveCount} positive · {batch.negativeCount} negative · {batch.verifiedEmails} verified
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardContent className="space-y-4 p-6">
              {demoFeedback.map((entry) => (
                <div key={`${entry.customer}-${entry.leadName}`} className="rounded-xl border border-border p-4">
                  <p className="font-semibold text-ink">
                    {entry.leadName} · {entry.rating}
                  </p>
                  <p className="text-sm text-muted">{entry.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="space-y-4 p-6 text-muted">
              <p>Private notes</p>
              <p>Customer responds best to operational pain signals and is likely ready for a deeper ICP split by segment next month.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
