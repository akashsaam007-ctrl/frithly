import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PLANS } from "@/lib/constants";
import {
  createPaddleCustomerPortalSession,
  fetchPaddleSubscription,
  fetchPaddleSubscriptionInvoices,
  fetchPaddleUpdatePaymentMethodTransaction,
} from "@/lib/paddle/client";
import { hasPaddleApiConfiguration } from "@/lib/paddle/env";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatCurrency, formatLongDate } from "@/lib/utils";

function formatInvoiceAmount(amount: string | number | null | undefined, currency: string) {
  const normalizedAmount = typeof amount === "string" ? Number(amount) : amount ?? 0;

  return new Intl.NumberFormat("en-GB", {
    currency,
    maximumFractionDigits: 2,
    style: "currency",
  }).format(normalizedAmount / 100);
}

function formatProviderStatus(status: string | null | undefined) {
  if (!status) {
    return "pending";
  }

  return status
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export default async function BillingPage() {
  const { customer } = await getCurrentCustomerContext();
  const currentPlan = customer.plan
    ? Object.values(PLANS).find((plan) => plan.id === customer.plan) ?? null
    : null;
  const hasBillingConfiguration = hasPaddleApiConfiguration();
  const subscriptionId = customer.stripe_subscription_id;
  const subscription =
    subscriptionId && hasBillingConfiguration
      ? await fetchPaddleSubscription(subscriptionId).then((response) => response.data).catch(() => null)
      : null;
  const billingCustomerId = customer.stripe_customer_id ?? subscription?.customer_id ?? null;
  const invoices =
    subscriptionId && hasBillingConfiguration
      ? await fetchPaddleSubscriptionInvoices(subscriptionId).catch(() => [])
      : [];
  const portalSession =
    billingCustomerId && hasBillingConfiguration
      ? await createPaddleCustomerPortalSession(
          billingCustomerId,
          subscriptionId ? [subscriptionId] : [],
        )
          .then((response) => response.data)
          .catch(() => null)
      : null;
  const subscriptionLinks =
    portalSession?.urls.subscriptions?.find((entry) => entry.subscription_id === subscriptionId) ??
    portalSession?.urls.subscriptions?.[0] ??
    null;
  const updatePaymentMethodTransaction =
    subscriptionId &&
    hasBillingConfiguration &&
    !subscriptionLinks?.update_subscription_payment_method
      ? await fetchPaddleUpdatePaymentMethodTransaction(subscriptionId)
          .then((response) => response.data)
          .catch(() => null)
      : null;
  const manageSubscriptionUrl = portalSession?.urls.general.overview ?? null;
  const updatePaymentMethodUrl =
    subscriptionLinks?.update_subscription_payment_method ??
    updatePaymentMethodTransaction?.checkout?.url ??
    null;
  const nextBillingDate = subscription?.next_billed_at ?? null;
  const statusLabel = formatProviderStatus(subscription?.status ?? customer.status ?? "pending");

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
                <p className="text-sm text-muted">Paddle subscription ID: {subscriptionId}</p>
              ) : null}
              {billingCustomerId ? (
                <p className="text-sm text-muted">Paddle customer ID: {billingCustomerId}</p>
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
            Use the Paddle customer portal to manage payment details, cancellations, and invoices.
            If anything looks off, email support and we&apos;ll help you quickly.
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
                      {invoice.invoice_number || invoice.id}
                    </p>
                    <p className="text-sm text-muted">
                      {formatLongDate(invoice.billed_at ?? invoice.created_at)} | {invoice.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-ink">
                      {formatInvoiceAmount(
                        invoice.details?.totals?.grand_total ?? invoice.details?.totals?.total,
                        invoice.currency_code,
                      )}
                    </p>
                    {invoice.invoiceUrl ? (
                      <a
                        className="font-semibold text-terracotta underline underline-offset-4"
                        href={invoice.invoiceUrl}
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
                  ? "Your Paddle invoices will appear here once subscription charges begin to process."
                  : "Connect Paddle in this environment and invoice history will appear here automatically."
              }
              title="No invoices available yet"
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
