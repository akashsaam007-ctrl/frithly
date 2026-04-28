import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PLANS } from "@/lib/constants";
import { fetchRazorpaySubscriptionInvoices } from "@/lib/razorpay/client";
import { hasRazorpayConfiguration } from "@/lib/razorpay/env";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatCurrency, formatLongDate } from "@/lib/utils";

function formatRazorpayInvoiceAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    currency,
    maximumFractionDigits: 2,
    style: "currency",
  }).format(amount / 100);
}

export default async function BillingPage() {
  const { customer } = await getCurrentCustomerContext();
  const currentPlan = customer.plan
    ? Object.values(PLANS).find((plan) => plan.id === customer.plan) ?? null
    : null;
  const subscriptionId = customer.stripe_subscription_id;
  const invoices =
    subscriptionId && hasRazorpayConfiguration()
      ? await fetchRazorpaySubscriptionInvoices(subscriptionId).catch(() => [])
      : [];

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
              {subscriptionId ? (
                <p className="text-sm text-muted">Razorpay subscription ID: {subscriptionId}</p>
              ) : null}
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

          <a className="btn-secondary inline-flex w-fit" href={`mailto:hi@frithly.com?subject=Frithly billing support`}>
            Contact billing support
          </a>
          <p className="text-sm text-muted">
            Razorpay subscription changes are currently handled by our team. Email support for upgrades, downgrades, or cancellations while self-serve billing controls are being finished.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice history</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">
                      {invoice.invoice_number ?? invoice.id}
                    </p>
                    <p className="text-sm text-muted">
                      {formatLongDate(new Date(invoice.date * 1000))} | {invoice.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-ink">
                      {formatRazorpayInvoiceAmount(invoice.amount, invoice.currency)}
                    </p>
                    {invoice.short_url ? (
                      <a
                        className="font-semibold text-terracotta underline underline-offset-4"
                        href={invoice.short_url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        View
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              className="border-0 shadow-none"
              description="Your Razorpay invoices will appear here once subscription charges begin to process."
              title="No invoices available yet"
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
