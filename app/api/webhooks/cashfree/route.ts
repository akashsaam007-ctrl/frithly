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
import {
  fetchCashfreeSubscription,
  getFrithlyPlanIdFromCashfreeSubscription,
  verifyCashfreeWebhookSignature,
  type CashfreeCustomerDetails,
  type CashfreePlanDetails,
  type CashfreeSubscription,
  type CashfreeSubscriptionPayment,
} from "@/lib/cashfree/client";
import { hasCashfreeWebhookConfiguration } from "@/lib/cashfree/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CustomerStatus, PlanId } from "@/types";

type CashfreeSubscriptionStatusEvent = {
  authorization_details?: Record<string, unknown> | null;
  customer_details?: CashfreeCustomerDetails | null;
  payment_gateway_details?: {
    gateway_subscription_id?: string | null;
  } | null;
  plan_details?: CashfreePlanDetails | null;
  subscription_details?: {
    cf_subscription_id?: string | null;
    subscription_id?: string | null;
    subscription_status?: string | null;
  } | null;
};

type CashfreeSubscriptionPaymentEvent = CashfreeSubscriptionPayment & {
  customer_details?: CashfreeCustomerDetails | null;
  payment_gateway_details?: {
    gateway_subscription_id?: string | null;
  } | null;
  plan_details?: CashfreePlanDetails | null;
  subscription_details?: {
    cf_subscription_id?: string | null;
    subscription_id?: string | null;
    subscription_status?: string | null;
  } | null;
};

type CashfreeWebhookPayload<T> = {
  data?: T;
  event_time?: string;
  type?: string;
};

type ResolvedCashfreeSubscriptionContext = {
  cfSubscriptionId: string | null;
  customerDetails: CashfreeCustomerDetails | null;
  payment: CashfreeSubscriptionPayment | null;
  planDetails: CashfreePlanDetails | null;
  subscription: CashfreeSubscription | null;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  subscriptionTags: Record<string, string> | null;
};

function mapCashfreeStatusToCustomerStatus(status: string | null | undefined): CustomerStatus {
  switch ((status ?? "").trim().toUpperCase()) {
    case "ACTIVE":
      return "active";
    case "CUSTOMER_PAUSED":
    case "ON_HOLD":
    case "PAUSED":
      return "paused";
    case "CANCELLED":
    case "CARD_EXPIRED":
    case "COMPLETED":
    case "CUSTOMER_CANCELLED":
    case "EXPIRED":
      return "cancelled";
    default:
      return "pending";
  }
}

function extractSubscriptionIdentifiers(data: Record<string, unknown>) {
  const subscriptionId =
    typeof data.subscription_id === "string"
      ? data.subscription_id
      : typeof (data.subscription_details as { subscription_id?: unknown } | undefined)
            ?.subscription_id === "string"
        ? (data.subscription_details as { subscription_id: string }).subscription_id
        : typeof (data.payment_gateway_details as { gateway_subscription_id?: unknown } | undefined)
              ?.gateway_subscription_id === "string"
          ? (data.payment_gateway_details as { gateway_subscription_id: string }).gateway_subscription_id
          : null;

  const cfSubscriptionId =
    typeof data.cf_subscription_id === "string"
      ? data.cf_subscription_id
      : typeof (data.subscription_details as { cf_subscription_id?: unknown } | undefined)
            ?.cf_subscription_id === "string"
        ? (data.subscription_details as { cf_subscription_id: string }).cf_subscription_id
        : null;

  return {
    cfSubscriptionId,
    subscriptionId,
  };
}

async function resolveSubscriptionContext(params: {
  eventName: string;
  payloadData: CashfreeSubscriptionPaymentEvent | CashfreeSubscriptionStatusEvent;
}) {
  const { cfSubscriptionId, subscriptionId } = extractSubscriptionIdentifiers(
    params.payloadData as Record<string, unknown>,
  );

  let subscription: CashfreeSubscription | null = null;

  if (subscriptionId) {
    try {
      subscription = await fetchCashfreeSubscription(subscriptionId);
    } catch (error) {
      Sentry.captureException(error);
      console.error("Unable to hydrate Cashfree subscription from webhook", {
        error,
        eventName: params.eventName,
        subscriptionId,
      });
    }
  }

  const paymentLikeEvent = params.payloadData as CashfreeSubscriptionPaymentEvent;
  const payment =
    typeof paymentLikeEvent.payment_id === "string" ? paymentLikeEvent : null;
  const customerDetails =
    subscription?.customer_details ?? params.payloadData.customer_details ?? null;
  const planDetails = subscription?.plan_details ?? params.payloadData.plan_details ?? null;
  const resolvedSubscriptionStatus =
    subscription?.subscription_status ??
    params.payloadData.subscription_details?.subscription_status ??
    paymentLikeEvent.payment_status ??
    null;

  return {
    cfSubscriptionId: subscription?.cf_subscription_id ?? cfSubscriptionId,
    customerDetails,
    payment,
    planDetails,
    subscription,
    subscriptionId: subscription?.subscription_id ?? subscriptionId,
    subscriptionStatus: resolvedSubscriptionStatus,
    subscriptionTags: subscription?.subscription_tags ?? null,
  } satisfies ResolvedCashfreeSubscriptionContext;
}

async function sendLifecycleEmail(params: {
  email: string;
  eventName: string;
  firstName: string;
  payment?: CashfreeSubscriptionPayment | null;
  plan: PlanId | null;
  previousStatus: CustomerStatus | null;
  subscriptionStatus: string | null;
}) {
  const mappedStatus = mapCashfreeStatusToCustomerStatus(params.subscriptionStatus);

  if (mappedStatus === "active" && params.previousStatus !== "active") {
    await sendWelcomeEmail({
      dashboardUrl: getDashboardUrl(),
      firstName: params.firstName,
      planName: planNameFromId(params.plan),
      recipientEmail: params.email,
    });

    await captureServerEvent({
      distinctId: params.email,
      eventName: "signup_completed",
      properties: {
        plan: params.plan,
        source: "cashfree_subscription_active",
      },
    });

    return;
  }

  if (
    params.eventName === "SUBSCRIPTION_PAYMENT_FAILED" &&
    params.previousStatus !== "pending"
  ) {
    await sendPaymentFailedEmail({
      billingUrl: getBillingUrl(),
      firstName: params.firstName,
      planName: planNameFromId(params.plan),
      recipientEmail: params.email,
    });

    return;
  }

  if (
    mappedStatus === "cancelled" &&
    params.previousStatus !== "cancelled" &&
    (params.eventName === "SUBSCRIPTION_STATUS_CHANGED" ||
      params.eventName === "SUBSCRIPTION_PAYMENT_CANCELLED")
  ) {
    await sendSubscriptionCancelledEmail({
      billingUrl: getBillingUrl(),
      firstName: params.firstName,
      recipientEmail: params.email,
    });

    return;
  }

  if (
    params.eventName === "SUBSCRIPTION_PAYMENT_SUCCESS" &&
    typeof params.payment?.payment_amount === "number" &&
    params.payment.payment_currency
  ) {
    await sendPaymentReceiptEmail(
      buildPaymentReceiptProps({
        amount: params.payment.payment_amount,
        currency: params.payment.payment_currency,
        firstName: params.firstName,
        invoiceUrl: null,
        paidAt: params.payment.payment_initiated_date ?? new Date().toISOString(),
        planId: params.plan,
        recipientEmail: params.email,
      }),
    );
  }
}

export async function POST(request: Request) {
  if (!hasCashfreeWebhookConfiguration()) {
    return NextResponse.json(
      {
        error: "Cashfree webhook configuration is missing in this environment.",
      },
      { status: 503 },
    );
  }

  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing Cashfree webhook signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  try {
    if (!verifyCashfreeWebhookSignature({ payload: rawBody, signature, timestamp })) {
      return NextResponse.json({ error: "Invalid Cashfree webhook signature." }, { status: 400 });
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Cashfree webhook signature verification failed", error);
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as
    | CashfreeWebhookPayload<CashfreeSubscriptionStatusEvent>
    | CashfreeWebhookPayload<CashfreeSubscriptionPaymentEvent>;
  const eventName = payload.type ?? "";
  const relevantEvents = new Set([
    "SUBSCRIPTION_AUTH_STATUS",
    "SUBSCRIPTION_PAYMENT_CANCELLED",
    "SUBSCRIPTION_PAYMENT_FAILED",
    "SUBSCRIPTION_PAYMENT_SUCCESS",
    "SUBSCRIPTION_STATUS_CHANGED",
  ]);

  if (!relevantEvents.has(eventName) || !payload.data) {
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    const context = await resolveSubscriptionContext({
      eventName,
      payloadData: payload.data,
    });
    const email = context.customerDetails?.customer_email?.trim().toLowerCase();

    if (!email || !context.subscriptionId) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: existingCustomer, error: existingCustomerError } = await adminClient
      .from("customers")
      .select("id, company_name, full_name, plan, status, billing_customer_id, billing_subscription_id")
      .eq("email", email)
      .maybeSingle();

    if (existingCustomerError) {
      throw new Error(existingCustomerError.message);
    }

    const plan =
      getFrithlyPlanIdFromCashfreeSubscription({
        planDetails: context.planDetails,
        subscriptionId: context.subscriptionId,
        subscriptionTags: context.subscriptionTags,
      }) ??
      existingCustomer?.plan ??
      null;
    const mappedStatus = mapCashfreeStatusToCustomerStatus(context.subscriptionStatus);
    const customerPayload = {
      cancelled_at:
        mappedStatus === "cancelled" ? payload.event_time ?? new Date().toISOString() : null,
      company_name: context.subscriptionTags?.company_name?.trim() || existingCustomer?.company_name || null,
      email,
      full_name:
        existingCustomer?.full_name ??
        context.customerDetails?.customer_name ??
        email.split("@")[0] ??
        null,
      plan,
      status: mappedStatus,
      billing_customer_id: context.cfSubscriptionId ?? existingCustomer?.billing_customer_id ?? null,
      billing_subscription_id: context.subscriptionId,
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
        email,
        eventName,
        firstName,
        payment: context.payment,
        plan,
        previousStatus: existingCustomer?.status ?? null,
        subscriptionStatus: context.subscriptionStatus,
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error("Cashfree lifecycle email failed", {
        email,
        error,
        eventName,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Cashfree webhook processing failed", error);

    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
