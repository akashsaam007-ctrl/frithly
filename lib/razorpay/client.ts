import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { getRazorpayEnv } from "@/lib/razorpay/env";
import type { PlanId } from "@/types";

type RazorpaySubscriptionStatus =
  | "active"
  | "authenticated"
  | "cancelled"
  | "completed"
  | "created"
  | "halted"
  | "pending"
  | "paused";

type RazorpaySubscription = {
  charge_at: number | null;
  created_at: number;
  current_end: number | null;
  current_start: number | null;
  customer_id: string | null;
  end_at: number | null;
  id: string;
  notes: Record<string, string> | [];
  paid_count: number;
  plan_id: string;
  short_url: string | null;
  start_at: number | null;
  status: RazorpaySubscriptionStatus;
  total_count: number;
};

type RazorpayCustomer = {
  contact: string | null;
  email: string | null;
  id: string;
  name: string | null;
  notes: Record<string, string> | [];
};

type RazorpayInvoice = {
  amount: number;
  currency: string;
  date: number;
  id: string;
  invoice_number: string | null;
  order_id: string | null;
  paid_at: number | null;
  short_url: string | null;
  status: string;
  subscription_id: string | null;
};

const apiBaseUrl = "https://api.razorpay.com/v1";

function buildAuthorizationHeader() {
  const env = getRazorpayEnv();
  return `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64")}`;
}

async function razorpayRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: buildAuthorizationHeader(),
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: { code?: string; description?: string; reason?: string } }
    | T
    | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      payload.error
        ? payload.error.description || payload.error.reason || payload.error.code
        : null;

    throw new Error(message ?? `Razorpay API request failed with status ${response.status}.`);
  }

  return payload as T;
}

export function getRazorpayPlanIdForFrithlyPlan(planId: PlanId) {
  const env = getRazorpayEnv();

  switch (planId) {
    case "design_partner":
      return env.RAZORPAY_PLAN_ID_DESIGN_PARTNER;
    case "starter":
      return env.RAZORPAY_PLAN_ID_STARTER;
    case "growth":
      return env.RAZORPAY_PLAN_ID_GROWTH;
    default:
      return null;
  }
}

export async function createRazorpaySubscriptionCheckout(params: {
  frithlyPlanId: PlanId;
  notes?: Record<string, string>;
}) {
  const razorpayPlanId = getRazorpayPlanIdForFrithlyPlan(params.frithlyPlanId);

  if (!razorpayPlanId) {
    throw new Error("That plan cannot be checked out automatically.");
  }

  const subscription = await razorpayRequest<RazorpaySubscription>("/subscriptions", {
    body: JSON.stringify({
      customer_notify: false,
      expire_by: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      notes: {
        app: "frithly",
        frithly_plan_id: params.frithlyPlanId,
        source: "public_checkout",
        ...(params.notes ?? {}),
      },
      plan_id: razorpayPlanId,
      quantity: 1,
      total_count: 360,
    }),
    method: "POST",
  });

  if (!subscription.short_url) {
    throw new Error("Razorpay did not return a hosted checkout URL for this subscription.");
  }

  return subscription;
}

export async function fetchRazorpayCustomer(customerId: string) {
  return razorpayRequest<RazorpayCustomer>(`/customers/${customerId}`, {
    method: "GET",
  });
}

export async function fetchRazorpaySubscriptionInvoices(subscriptionId: string) {
  const invoices = await razorpayRequest<{
    count: number;
    items: RazorpayInvoice[];
  }>(`/invoices?subscription_id=${encodeURIComponent(subscriptionId)}`, {
    method: "GET",
  });

  return invoices.items ?? [];
}

export async function cancelRazorpaySubscription(subscriptionId: string) {
  return razorpayRequest<RazorpaySubscription>(`/subscriptions/${subscriptionId}/cancel`, {
    body: JSON.stringify({
      cancel_at_cycle_end: false,
    }),
    method: "POST",
  });
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string) {
  const { RAZORPAY_WEBHOOK_SECRET } = getRazorpayEnv();
  const expectedSignature = createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (expectedSignature.length !== signature.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(expectedSignature, "utf8"),
    Buffer.from(signature, "utf8"),
  );
}

export type {
  RazorpayCustomer,
  RazorpayInvoice,
  RazorpaySubscription,
  RazorpaySubscriptionStatus,
};
