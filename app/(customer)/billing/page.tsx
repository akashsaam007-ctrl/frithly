import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PLANS } from "@/lib/constants";
import {
  fetchLemonSqueezyCustomer,
  fetchLemonSqueezySubscription,
  fetchLemonSqueezySubscriptionInvoices,
} from "@/lib/lemonsqueezy/client";
import { hasLemonSqueezyConfiguration } from "@/lib/lemonsqueezy/env";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatCurrency, formatLongDate } from "@/lib/utils";

function formatInvoiceAmount(amount: number, currency: string) {
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
  const hasBillingConfiguration = hasLemonSqueezyConfiguration();
  const billingCustomerId = customer.stripe_customer_id;
  const subscriptionId = customer.stripe_subscription_id;
  const subscription =
    subscriptionId && hasBillingConfiguration
      ? await fetchLemonSqueezySubscription(subscriptionId).catch(() => null)
      : null;
  const billingCustomer =
    !subscription && billingCustomerId && hasBillingConfiguration
      ? await fetchLemonSqueezyCustomer(billingCustomerId).catch(() => null)
      : null;
  const invoices =
    subscriptionId && hasBillingConfiguration
      ? await fetchLemonSqueezySubscriptionInvoices(subscriptionId).catch(() => [])
      : [];
  const manageSubscriptionUrl =
    subscription?.data.attributes.urls.customer_portal ??
    billingCustomer?.data.attributes.urls.customer_portal ??
    null;
  const updatePaymentMethodUrl =
    subscription?.data.attributes.urls.update_payment_method ?? null;
  const nextBillingDate = subscription?.data.attributes.renews_at ?? null;
  const statusLabel = subscription?.data.attributes.status_formatted ?? customer.status ?? "pending";

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
                Status: {statusLabel} | Started:{" "}
                {customer.signup_date ? formatLongDate(customer.signup_date) : "Not available"}
              </p>
              {nextBillingDate ? (
                <p className="text-sm text-muted">
                  Next renewal attempt: {formatLongDate(nextBillingDate)}
                </p>
              ) : null}
              {subscriptionId ? (
                <p className="text-sm text-muted">Lemon Squeezy subscription ID: {subscriptionId}</p>
              ) : null}
              {billingCustomerId ? (
                <p className="text-sm text-muted">Billing customer ID: {billingCustomerId}</p>
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

          <div className="flex flex-wrap gap-3">
            {manageSubscriptionUrl ? (
              <a className="btn-primary inline-flex w-fit" href={manageSubscriptionUrl}>
                Manage subscription
              </a>
            ) : null}
            {updatePaymentMethodUrl ? (
              <a className="btn-secondary inline-flex w-fit" href={updatePaymentMethodUrl}>
                Update payment method
              </a>
            ) : null}
            <a
              className="btn-secondary inline-flex w-fit"
              href={`mailto:hi@frithly.com?subject=Frithly billing support`}
            >
              Contact billing support
            </a>
          </div>
          <p className="text-sm text-muted">
            Use the Lemon Squeezy customer portal to manage upgrades, billing details, cancellations,
            and invoices. If anything looks off, email support and we&apos;ll help you quickly.
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
                      {invoice.attributes.billing_reason || invoice.id}
                    </p>
                    <p className="text-sm text-muted">
                      {formatLongDate(invoice.attributes.created_at)} | {invoice.attributes.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-ink">
                      {formatInvoiceAmount(invoice.attributes.total, invoice.attributes.currency)}
                    </p>
                    {invoice.attributes.urls.invoice_url ? (
                      <a
                        className="font-semibold text-terracotta underline underline-offset-4"
                        href={invoice.attributes.urls.invoice_url}
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
              description={
                hasBillingConfiguration
                  ? "Your Lemon Squeezy invoices will appear here once subscription charges begin to process."
                  : "Connect Lemon Squeezy in this environment and invoice history will appear here automatically."
              }
              title="No invoices available yet"
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
