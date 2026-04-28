import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PLANS } from "@/lib/constants";
import {
  fetchCashfreeSubscription,
  fetchCashfreeSubscriptionPayments,
} from "@/lib/cashfree/client";
import { hasCashfreeApiConfiguration } from "@/lib/cashfree/env";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";
import { formatCurrency, formatLongDate } from "@/lib/utils";

type BillingPageProps = {
  searchParams?: Promise<{
    billing?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function formatPaymentAmount(amount: number | null | undefined, currency: string | null | undefined) {
  const normalizedCurrency = currency || "GBP";

  return new Intl.NumberFormat("en-GB", {
    currency: normalizedCurrency,
    maximumFractionDigits: 2,
    style: "currency",
  }).format(amount ?? 0);
}

function formatProviderStatus(status: string | null | undefined) {
  if (!status) {
    return "pending";
  }

  return status
    .split("_")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1).toLowerCase()}`)
    .join(" ");
}

function getBannerMessage(value: string) {
  switch (value) {
    case "billing-unavailable":
      return "Cashfree billing controls are not configured in this environment yet.";
    case "invalid-action":
      return "That billing action isn't supported for this subscription.";
    case "manage-failed":
      return "We couldn't update the subscription with Cashfree just now. Please try again or contact support.";
    case "subscription-missing":
      return "No active subscription reference is linked to this account yet.";
    case "subscription-updated":
      return "Subscription update request sent successfully. Cashfree and Frithly will reflect the new status shortly.";
    default:
      return "";
  }
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const bannerMessage = getBannerMessage(readParam(resolvedSearchParams?.billing));
  const { customer } = await getCurrentCustomerContext();
  const currentPlan = customer.plan
    ? Object.values(PLANS).find((plan) => plan.id === customer.plan) ?? null
    : null;
  const hasBillingConfiguration = hasCashfreeApiConfiguration();
  const subscriptionId = customer.billing_subscription_id;
  const subscription =
    subscriptionId && hasBillingConfiguration
      ? await fetchCashfreeSubscription(subscriptionId).catch(() => null)
      : null;
  const payments =
    subscriptionId && hasBillingConfiguration
      ? await fetchCashfreeSubscriptionPayments(subscriptionId).catch(() => [])
      : [];
  const providerReference = customer.billing_customer_id ?? subscription?.cf_subscription_id ?? null;
  const subscriptionStatus = subscription?.subscription_status ?? customer.status ?? "pending";
  const statusLabel = formatProviderStatus(subscriptionStatus);
  const nextBillingDate =
    subscription?.next_schedule_date ?? subscription?.subscription_first_charge_time ?? null;
  const normalizedSubscriptionStatus = subscriptionStatus.trim().toUpperCase();
  const canPause = normalizedSubscriptionStatus === "ACTIVE";
  const canReactivate =
    normalizedSubscriptionStatus === "PAUSED" ||
    normalizedSubscriptionStatus === "ON_HOLD" ||
    normalizedSubscriptionStatus === "CUSTOMER_CANCELLED" ||
    normalizedSubscriptionStatus === "CANCELLED";
  const canCancel =
    normalizedSubscriptionStatus === "ACTIVE" ||
    normalizedSubscriptionStatus === "PAUSED" ||
    normalizedSubscriptionStatus === "ON_HOLD";

  return (
    <Container className="space-y-8 px-0">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">Billing</p>
        <h1 className="text-4xl md:text-5xl">Plan and payment history</h1>
      </div>

      {bannerMessage ? (
        <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
          {bannerMessage}
        </div>
      ) : null}

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
                  Next scheduled charge: {formatLongDate(nextBillingDate)}
                </p>
              ) : null}
              {subscriptionId ? (
                <p className="text-sm text-muted">Cashfree subscription ID: {subscriptionId}</p>
              ) : null}
              {providerReference ? (
                <p className="text-sm text-muted">
                  Cashfree reference ID: {providerReference}
                </p>
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
            {canPause ? (
              <form action="/api/customer/subscription/manage" method="post">
                <input name="action" type="hidden" value="PAUSE" />
                <button className="btn-secondary" type="submit">
                  Pause subscription
                </button>
              </form>
            ) : null}
            {canReactivate ? (
              <form action="/api/customer/subscription/manage" method="post">
                <input name="action" type="hidden" value="ACTIVATE" />
                <button className="btn-primary" type="submit">
                  Reactivate subscription
                </button>
              </form>
            ) : null}
            {canCancel ? (
              <form action="/api/customer/subscription/manage" method="post">
                <input name="action" type="hidden" value="CANCEL" />
                <button className="btn-secondary" type="submit">
                  Cancel subscription
                </button>
              </form>
            ) : null}
            <a
              className="btn-secondary inline-flex w-fit"
              href={`mailto:hi@frithly.com?subject=Frithly billing support`}
            >
              Contact billing support
            </a>
          </div>
          <p className="text-sm text-muted">
            Cashfree powers your recurring billing for Frithly. Use the controls above for pause,
            reactivation, or cancellation requests, and email support if you need invoice help or
            a manual review.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Charge history</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.payment_id}
                  className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-ink">
                      {payment.payment_type === "AUTH" ? "Authorisation" : "Recurring charge"} |{" "}
                      {payment.payment_id}
                    </p>
                    <p className="text-sm text-muted">
                      {formatLongDate(payment.payment_initiated_date ?? new Date().toISOString())} |{" "}
                      {formatProviderStatus(payment.payment_status)}
                    </p>
                    {payment.failure_details?.failure_reason ? (
                      <p className="text-sm text-red-600">
                        {payment.failure_details.failure_reason}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1 text-left md:text-right">
                    <p className="font-semibold text-ink">
                      {formatPaymentAmount(payment.payment_amount, payment.payment_currency)}
                    </p>
                    <p className="text-sm text-muted">
                      Cashfree payment ref: {payment.cf_payment_id ?? "Pending"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              className="border-0 shadow-none"
              description={
                hasBillingConfiguration
                  ? "Your Cashfree charge history will appear here once authorisation and recurring charges start processing."
                  : "Connect Cashfree in this environment and charge history will appear here automatically."
              }
              title="No charge history yet"
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
