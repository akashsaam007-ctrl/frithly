import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PLANS } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatCurrency, formatLongDate } from "@/lib/utils";

export default async function BillingPage() {
  const { customer } = await getCurrentCustomerContext();
  const currentPlan = customer.plan
    ? Object.values(PLANS).find((plan) => plan.id === customer.plan) ?? null
    : null;

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">Billing</p>
        <h1 className="text-4xl md:text-5xl">Plan and payment history</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPlan ? (
            <>
              <p className="text-3xl font-semibold text-ink">
                {currentPlan.name} | {formatCurrency(currentPlan.price, currentPlan.currency)}
                /month
              </p>
              <p className="text-muted">
                Status: {customer.status ?? "pending"} | Started:{" "}
                {customer.signup_date ? formatLongDate(customer.signup_date) : "Not available"}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-semibold text-ink">No plan assigned yet</p>
              <p className="text-muted">
                Your subscription details will appear here as soon as a plan is connected to your
                customer record.
              </p>
            </>
          )}

          <button className="btn-secondary" disabled type="button">
            Manage subscription
          </button>
          <p className="text-sm text-muted">
            Stripe Customer Portal will open here once live billing credentials are connected.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice history</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            className="border-0 shadow-none"
            description="Invoice sync is not connected yet, so payment receipts are not available in-app. Once Stripe Customer Portal is wired up, invoices will appear here automatically."
            title="No invoices available yet"
          />
        </CardContent>
      </Card>
    </Container>
  );
}
