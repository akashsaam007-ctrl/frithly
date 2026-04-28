import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/monitoring/posthog-server";
import {
  buildPaymentReceiptProps,
  getBillingUrl,
  getDashboardUrl,
  getFirstName,
  planNameFromId,
  sendPaymentFailedEmail,
  sendPaymentReceiptEmail,
  sendSubscriptionCancelledEmail,
  sendWelcomeEmail,
} from "@/lib/resend/send";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  fetchLemonSqueezySubscription,
  getFrithlyPlanIdFromLemonVariantId,
  verifyLemonSqueezyWebhookSignature,
} from "@/lib/lemonsqueezy/client";
import type { CustomerStatus, PlanId } from "@/types";

type LemonEventName =
  | "order_created"
  | "subscription_cancelled"
  | "subscription_created"
  | "subscription_expired"
  | "subscription_paused"
  | "subscription_payment_failed"
  | "subscription_payment_recovered"
  | "subscription_payment_success"
  | "subscription_plan_changed"
  | "subscription_resumed"
  | "subscription_unpaused"
  | "subscription_updated";

type LemonSubscriptionAttributes = {
  customer_id?: number | null;
  ends_at?: string | null;
  status?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  variant_id?: number | null;
};

type LemonInvoiceAttributes = {
  created_at?: string | null;
  currency?: string | null;
  customer_id?: number | null;
  subscription_id?: number | null;
  total?: number | null;
  urls?: {
    invoice_url?: string | null;
  };
  user_email?: string | null;
  user_name?: string | null;
};

type LemonWebhookPayload = {
  data?: {
    attributes?: LemonInvoiceAttributes | LemonSubscriptionAttributes;
    id?: string;
    type?: string;
  };
  meta?: {
    event_name?: LemonEventName | string;
  };
};

function toOptionalString(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function mapCustomerStatus(params: {
  eventName: string;
  providerStatus: string | null;
}): CustomerStatus {
  if (params.eventName === "subscription_cancelled" || params.eventName === "subscription_expired") {
    return "cancelled";
  }

  if (params.eventName === "subscription_paused") {
    return "paused";
  }

  if (
    params.eventName === "subscription_payment_success" ||
    params.eventName === "subscription_payment_recovered" ||
    params.eventName === "subscription_resumed" ||
    params.eventName === "subscription_unpaused"
  ) {
    return "active";
  }

  switch (params.providerStatus) {
    case "active":
    case "on_trial":
      return "active";
    case "paused":
      return "paused";
    case "cancelled":
    case "expired":
      return "cancelled";
    case "past_due":
    case "unpaid":
      return "pending";
    default:
      return "pending";
  }
}

async function sendLifecycleEmail(params: {
  eventName: string;
  firstName: string;
  invoice: LemonInvoiceAttributes | null;
  plan: PlanId | null;
  previousStatus: CustomerStatus | null;
  recipientEmail: string;
}) {
  if (params.eventName === "subscription_created" && params.previousStatus !== "active") {
    await sendWelcomeEmail({
      dashboardUrl: getDashboardUrl(),
      firstName: params.firstName,
      planName: planNameFromId(params.plan),
      recipientEmail: params.recipientEmail,
    });

    await captureServerEvent({
      distinctId: params.recipientEmail,
      eventName: "signup_completed",
      properties: {
        plan: params.plan,
        source: "lemonsqueezy_subscription_created",
      },
    });

    return;
  }

  if (params.eventName === "subscription_payment_failed") {
    await sendPaymentFailedEmail({
      billingUrl: getBillingUrl(),
      firstName: params.firstName,
      planName: planNameFromId(params.plan),
      recipientEmail: params.recipientEmail,
    });

    return;
  }

  if (
    (params.eventName === "subscription_cancelled" || params.eventName === "subscription_expired") &&
    params.previousStatus !== "cancelled"
  ) {
    await sendSubscriptionCancelledEmail({
      billingUrl: getBillingUrl(),
      firstName: params.firstName,
      recipientEmail: params.recipientEmail,
    });

    return;
  }

  if (
    (params.eventName === "subscription_payment_success" ||
      params.eventName === "subscription_payment_recovered") &&
    params.invoice?.total &&
    params.invoice.currency
  ) {
    await sendPaymentReceiptEmail(
      buildPaymentReceiptProps({
        amount: params.invoice.total,
        currency: params.invoice.currency,
        firstName: params.firstName,
        invoiceUrl: params.invoice.urls?.invoice_url ?? null,
        paidAt: params.invoice.created_at ?? new Date().toISOString(),
        planId: params.plan,
        recipientEmail: params.recipientEmail,
      }),
    );
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Lemon Squeezy signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  try {
    if (!verifyLemonSqueezyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid Lemon Squeezy signature." }, { status: 400 });
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Lemon Squeezy signature verification failed", error);
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as LemonWebhookPayload;
  const eventName = toOptionalString(payload.meta?.event_name);

  if (!eventName) {
    return NextResponse.json({ error: "Missing Lemon Squeezy event name." }, { status: 400 });
  }

  const invoiceAttributes =
    payload.data?.type === "subscription-invoices"
      ? (payload.data.attributes as LemonInvoiceAttributes | undefined) ?? null
      : null;

  let subscriptionRecord =
    payload.data?.type === "subscriptions" && payload.data.id && payload.data.attributes
      ? {
          attributes: payload.data.attributes as LemonSubscriptionAttributes,
          id: payload.data.id,
        }
      : null;

  const invoiceSubscriptionId = toOptionalString(invoiceAttributes?.subscription_id);

  if (!subscriptionRecord && invoiceSubscriptionId) {
    try {
      const fetchedSubscription = await fetchLemonSqueezySubscription(invoiceSubscriptionId);
      subscriptionRecord = {
        attributes: fetchedSubscription.data.attributes,
        id: fetchedSubscription.data.id,
      };
    } catch (error) {
      Sentry.captureException(error);
      console.error("Unable to hydrate Lemon Squeezy subscription from invoice event", {
        error,
        invoiceSubscriptionId,
      });
    }
  }

  const email =
    toOptionalString(subscriptionRecord?.attributes.user_email) ??
    toOptionalString(invoiceAttributes?.user_email);

  if (!email) {
    return NextResponse.json({ received: true, skipped: true });
  }

  const adminClient = createSupabaseAdminClient();

  try {
    const { data: existingCustomer, error: existingCustomerError } = await adminClient
      .from("customers")
      .select("id, company_name, full_name, plan, status, stripe_customer_id, stripe_subscription_id")
      .eq("email", email)
      .maybeSingle();

    if (existingCustomerError) {
      throw new Error(existingCustomerError.message);
    }

    const plan =
      getFrithlyPlanIdFromLemonVariantId(subscriptionRecord?.attributes.variant_id) ??
      existingCustomer?.plan ??
      null;

    const mappedStatus = mapCustomerStatus({
      eventName,
      providerStatus: toOptionalString(subscriptionRecord?.attributes.status),
    });

    const customerPayload = {
      cancelled_at:
        mappedStatus === "cancelled"
          ? toOptionalString(subscriptionRecord?.attributes.ends_at) ?? new Date().toISOString()
          : null,
      company_name: existingCustomer?.company_name ?? null,
      email,
      full_name:
        existingCustomer?.full_name ??
        toOptionalString(subscriptionRecord?.attributes.user_name) ??
        toOptionalString(invoiceAttributes?.user_name) ??
        email.split("@")[0] ??
        null,
      plan,
      status: mappedStatus,
      stripe_customer_id:
        toOptionalString(subscriptionRecord?.attributes.customer_id) ??
        toOptionalString(invoiceAttributes?.customer_id) ??
        existingCustomer?.stripe_customer_id ??
        null,
      stripe_subscription_id:
        subscriptionRecord?.id ??
        invoiceSubscriptionId ??
        existingCustomer?.stripe_subscription_id ??
        null,
    };

    const writeResult = existingCustomer
      ? await adminClient.from("customers").update(customerPayload).eq("id", existingCustomer.id)
      : await adminClient.from("customers").insert(customerPayload);

    if (writeResult.error) {
      throw new Error(writeResult.error.message);
    }

    const firstName = getFirstName(customerPayload.full_name, email.split("@")[0] ?? "there");

    try {
      await sendLifecycleEmail({
        eventName,
        firstName,
        invoice: invoiceAttributes,
        plan,
        previousStatus: existingCustomer?.status ?? null,
        recipientEmail: email,
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error("Lemon Squeezy lifecycle email failed", {
        email,
        error,
        eventName,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Lemon Squeezy webhook processing failed", error);

    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
