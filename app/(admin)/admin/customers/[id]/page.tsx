import Link from "next/link";
import { CustomerPlanControls } from "@/components/admin/customer-plan-controls";
import { CustomerRoleControls } from "@/components/admin/customer-role-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ROUTES } from "@/lib/constants";
import { formatLongDate } from "@/lib/utils";
import { getAdminCustomerDetail } from "@/lib/supabase/admin-data";

type AdminCustomerDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCustomerDetailPage({
  params,
}: AdminCustomerDetailPageProps) {
  const { id } = await params;
  const detail = await getAdminCustomerDetail(id);
  const { activeIcp, approvalRateLabel, batches, customer, feedback, lifetimeLeadCount, viewerEmail } =
    detail;
  const customerIcpHref = `${ROUTES.ADMIN_CUSTOMERS}/${customer.id}/icp`;
  const leadStudioHref = `${ROUTES.ADMIN_LEAD_STUDIO}?customer=${customer.id}`;

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl md:text-5xl">
            {customer.company_name ?? customer.full_name ?? customer.email}
          </h1>
          <span className="rounded-full bg-terracotta/10 px-3 py-1 text-sm font-semibold text-terracotta">
            {customer.plan ?? "unassigned"}
          </span>
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-sm font-semibold text-ink capitalize">
            {customer.status ?? "pending"}
          </span>
          <span className="rounded-full bg-white/[0.08] px-3 py-1 text-sm font-semibold text-ink capitalize">
            {customer.role}
          </span>
        </div>
        <p className="text-muted">
          {customer.email} | MRR {customer.plan ? `${customer.plan}` : "not assigned"}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary">
            Pause customer
          </Button>
          <Button asChild variant="secondary">
            <a href={`mailto:${customer.email}`}>Send email</a>
          </Button>
          <Button type="button" variant="secondary">
            Billing details
          </Button>
          <Button asChild type="button" variant="secondary">
            <Link href={customerIcpHref}>Manage ICP</Link>
          </Button>
          <Button asChild type="button">
            <Link href={leadStudioHref}>Open lead studio</Link>
          </Button>
        </div>
        {customer.billing_customer_id || customer.billing_subscription_id ? (
          <p className="text-sm text-muted">
            Billing provider reference: {customer.billing_customer_id ?? "Not linked"} | Billing
            subscription ID: {customer.billing_subscription_id ?? "Not linked"}
          </p>
        ) : null}
      </div>

      <CustomerRoleControls
        customerEmail={customer.email}
        customerId={customer.id}
        initialRole={customer.role}
        viewerEmail={viewerEmail}
      />

      <CustomerPlanControls
        customerId={customer.id}
        initialPlan={customer.plan}
        initialStatus={customer.status}
      />

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
            <CardContent className="grid gap-6 p-6 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted">Signup date</p>
                <p className="mt-2 text-xl font-semibold text-ink">
                  {customer.signup_date ? formatLongDate(customer.signup_date) : "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">Latest batch</p>
                <p className="mt-2 text-xl font-semibold text-ink">
                  {batches[0] ? formatLongDate(batches[0].delivery_date) : "No batches yet"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">Lead approval rate</p>
                <p className="mt-2 text-xl font-semibold text-ink">{approvalRateLabel}</p>
              </div>
              <div>
                <p className="text-sm text-muted">Lifetime leads</p>
                <p className="mt-2 text-xl font-semibold text-ink">{lifetimeLeadCount}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="icp">
          <Card>
            <CardContent className="space-y-4 p-6 text-muted">
              <p className="text-sm leading-7">
                This ICP is admin-managed and powers lead generation from the lead studio.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="sm" variant="secondary">
                  <Link href={customerIcpHref}>Manage ICP</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={leadStudioHref}>Generate leads</Link>
                </Button>
              </div>
              {activeIcp ? (
                <>
                  <p>
                    Product: <span className="text-ink">{activeIcp.product_description}</span>
                  </p>
                  <p>
                    Titles:{" "}
                    <span className="text-ink">{activeIcp.target_titles?.join(", ") || "Not set"}</span>
                  </p>
                  <p>
                    Industries:{" "}
                    <span className="text-ink">
                      {activeIcp.target_industries?.join(", ") || "Not set"}
                    </span>
                  </p>
                  <p>
                    Signals: <span className="text-ink">{activeIcp.signals?.join(", ") || "Not set"}</span>
                  </p>
                  <p>
                    Exclusions:{" "}
                    <span className="text-ink">{activeIcp.exclusions?.join(", ") || "Not set"}</span>
                  </p>
                </>
              ) : (
                <p>No active ICP saved for this customer yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches">
          <Card>
            <CardContent className="space-y-4 p-6">
              {batches.length > 0 ? (
                batches.map((batch) => (
                  <div key={batch.id} className="rounded-xl border border-border p-4">
                    <p className="font-semibold text-ink">{formatLongDate(batch.delivery_date)}</p>
                    <p className="text-sm text-muted">
                      {batch.total_leads ?? 0} leads | {batch.verified_emails ?? 0} verified |{" "}
                      {batch.status ?? "pending"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted">No batches have been created for this customer yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardContent className="space-y-4 p-6">
              {feedback.length > 0 ? (
                feedback.map((entry) => (
                  <div key={entry.id} className="rounded-xl border border-border p-4">
                    <p className="font-semibold text-ink">
                      {entry.leadName} | {entry.rating ?? "unrated"}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {entry.batchDateLabel ?? "No batch date available"}
                    </p>
                    <p className="mt-3 text-muted">{entry.comment ?? "No comment provided."}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted">No feedback recorded for this customer yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="space-y-4 p-6 text-muted">
              <p>Private notes</p>
              <p>{customer.notes?.trim() || "No private notes saved for this customer yet."}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
