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
  fetchPaddleCustomer,
  fetchPaddleSubscription,
  fetchPaddleTransactionInvoiceLink,
  getFrithlyPlanIdFromPaddleItems,
  verifyPaddleWebhookSignature,
  type PaddleCustomer,
  type PaddleSubscription,
  type PaddleTransaction,
} from "@/lib/paddle/client";
import { hasPaddleWebhookConfiguration } from "@/lib/paddle/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CustomerStatus, PlanId } from "@/types";

type PaddleWebhookPayload = {
  data?: PaddleSubscription | PaddleTransaction;
  event_id?: string;
  event_type?: string;
  notification_id?: string;
  occurred_at?: string;
};

function mapCustomerStatus(params: {
  eventName: string;
  providerStatus: string | null | undefined;
}): CustomerStatus {
  if (params.eventName === "subscription.canceled") {
    return "cancelled" satisfies CustomerStatus;
  }

  if (params.eventName === "subscription.paused") {
    return "paused" satisfies CustomerStatus;
  }

  if (
    params.eventName === "subscription.activated" ||
    params.eventName === "subscription.created" ||
    params.eventName === "subscription.resumed" ||
    params.eventName === "transaction.completed"
  ) {
    return "active" satisfies CustomerStatus;
  }

  if (
    params.eventName === "subscription.past_due" ||
    params.eventName === "transaction.payment_failed" ||
    params.eventName === "transaction.past_due"
  ) {
    return "pending" satisfies CustomerStatus;
  }

  switch (params.providerStatus) {
    case "active":
    case "trialing":
      return "active" satisfies CustomerStatus;
    case "paused":
      return "paused" satisfies CustomerStatus;
    case "canceled":
      return "cancelled" satisfies CustomerStatus;
    case "past_due":
      return "pending" satisfies CustomerStatus;
    default:
      return "pending" satisfies CustomerStatus;
  }
}

async function sendLifecycleEmail(params: {
  email: string;
  eventName: string;
  firstName: string;
  invoiceAmount?: number | null;
  invoiceCurrency?: string | null;
  invoicePaidAt?: string | null;
  invoiceUrl?: string | null;
  plan: PlanId | null;
  previousStatus: CustomerStatus | null;
}) {
  if (params.eventName === "subscription.created" && params.previousStatus !== "active") {
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
        source: "paddle_subscription_created",
      },
    });

    return;
  }

  if (
    (params.eventName === "transaction.payment_failed" ||
      params.eventName === "subscription.past_due") &&
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

  if (params.eventName === "subscription.canceled" && params.previousStatus !== "cancelled") {
    await sendSubscriptionCancelledEmail({
      billingUrl: getBillingUrl(),
      firstName: params.firstName,
      recipientEmail: params.email,
    });

    return;
  }

  if (
    params.eventName === "transaction.completed" &&
    typeof params.invoiceAmount === "number" &&
    params.invoiceCurrency
  ) {
    await sendPaymentReceiptEmail(
      buildPaymentReceiptProps({
        amount: params.invoiceAmount,
        currency: params.invoiceCurrency,
        firstName: params.firstName,
        invoiceUrl: params.invoiceUrl ?? null,
        paidAt: params.invoicePaidAt ?? new Date().toISOString(),
        planId: params.plan,
        recipientEmail: params.email,
      }),
    );
  }
}

export async function POST(request: Request) {
  if (!hasPaddleWebhookConfiguration()) {
    return NextResponse.json(
      {
        error: "Paddle webhook configuration is missing in this environment.",
      },
      { status: 503 },
    );
  }

  const signature = request.headers.get("Paddle-Signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Paddle signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  try {
    if (!verifyPaddleWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid Paddle signature." }, { status: 400 });
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error("Paddle signature verification failed", error);
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as PaddleWebhookPayload;
  const eventName = payload.event_type;

  if (!eventName || !payload.data) {
    return NextResponse.json({ error: "Missing Paddle event payload." }, { status: 400 });
  }

  const relevantEvents = new Set([
    "subscription.activated",
    "subscription.canceled",
    "subscription.created",
    "subscription.past_due",
    "subscription.paused",
    "subscription.resumed",
    "subscription.updated",
    "transaction.completed",
    "transaction.past_due",
    "transaction.payment_failed",
  ]);

  if (!relevantEvents.has(eventName)) {
    return NextResponse.json({ received: true, skipped: true });
  }

  let subscription =
    eventName.startsWith("subscription.") ? (payload.data as PaddleSubscription) : null;
  const transaction =
    eventName.startsWith("transaction.") ? (payload.data as PaddleTransaction) : null;

  if (!subscription && transaction?.subscription_id) {
    try {
      const fetchedSubscription = await fetchPaddleSubscription(transaction.subscription_id);
      subscription = fetchedSubscription.data;
    } catch (error) {
      Sentry.captureException(error);
      console.error("Unable to hydrate Paddle subscription from transaction webhook", {
        error,
        subscriptionId: transaction.subscription_id,
      });
    }
  }

  const paddleCustomerId = subscription?.customer_id ?? transaction?.customer_id ?? null;

  if (!paddleCustomerId) {
    return NextResponse.json({ received: true, skipped: true });
  }

  let paddleCustomer: PaddleCustomer | null = null;

  try {
    paddleCustomer = (await fetchPaddleCustomer(paddleCustomerId)).data;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Unable to hydrate Paddle customer from webhook", {
      customerId: paddleCustomerId,
      error,
      eventName,
    });
  }

  const email = paddleCustomer?.email?.trim();

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
      getFrithlyPlanIdFromPaddleItems(subscription?.items ?? transaction?.items ?? null) ??
      existingCustomer?.plan ??
      null;

    const mappedStatus = mapCustomerStatus({
      eventName,
      providerStatus: subscription?.status ?? transaction?.status,
    });

    const customerPayload = {
      cancelled_at:
        mappedStatus === "cancelled"
          ? subscription?.canceled_at ?? new Date().toISOString()
          : null,
      company_name: existingCustomer?.company_name ?? null,
      email,
      full_name:
        existingCustomer?.full_name ??
        paddleCustomer?.name ??
        email.split("@")[0] ??
        null,
      plan,
      status: mappedStatus,
      stripe_customer_id: paddleCustomerId,
      stripe_subscription_id:
        subscription?.id ?? transaction?.subscription_id ?? existingCustomer?.stripe_subscription_id ?? null,
    };

    const writeResult = existingCustomer
      ? await adminClient.from("customers").update(customerPayload).eq("id", existingCustomer.id)
      : await adminClient.from("customers").insert(customerPayload);

    if (writeResult.error) {
      throw new Error(writeResult.error.message);
    }

    const invoiceUrl =
      eventName === "transaction.completed" && transaction
        ? await fetchPaddleTransactionInvoiceLink(transaction.id)
            .then((response) => response.data.url)
            .catch(() => null)
        : null;
    const invoiceAmount =
      eventName === "transaction.completed" && transaction
        ? Number(transaction.details?.totals?.grand_total ?? transaction.details?.totals?.total ?? 0)
        : null;
    const firstName = getFirstName(customerPayload.full_name, email.split("@")[0] ?? "there");

    try {
      await sendLifecycleEmail({
        email,
        eventName,
        firstName,
        invoiceAmount,
        invoiceCurrency: transaction?.currency_code ?? subscription?.currency_code ?? null,
        invoicePaidAt: transaction?.billed_at ?? transaction?.updated_at ?? null,
        invoiceUrl,
        plan,
        previousStatus: existingCustomer?.status ?? null,
      });
    } catch (error) {
      Sentry.captureException(error);
      console.error("Paddle lifecycle email failed", {
        email,
        error,
        eventName,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Paddle webhook processing failed", error);

    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
