import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { addDays, addYears } from "date-fns";
import { PLANS } from "@/lib/constants";
import { getCashfreeEnv } from "@/lib/cashfree/env";
import { env } from "@/lib/utils/env";
import type { PlanId } from "@/types";

type CashfreeErrorResponse = {
  code?: string;
  message?: string;
  type?: string;
};

type CashfreeCustomerDetails = {
  customer_bank_account_holder_name?: string | null;
  customer_bank_account_number?: string | null;
  customer_bank_account_type?: string | null;
  customer_bank_code?: string | null;
  customer_bank_ifsc?: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
};

type CashfreeAuthorizationDetails = {
  authorization_amount?: number | null;
  authorization_amount_refund?: boolean | null;
  authorization_reference?: string | null;
  authorization_status?: string | null;
  authorization_time?: string | null;
  instrument_id?: string | null;
  payment_group?: string | null;
  payment_id?: string | null;
  payment_method?: string | Record<string, unknown> | null;
};

type CashfreePlanDetails = {
  plan_currency?: string | null;
  plan_id: string;
  plan_interval_type?: string | null;
  plan_intervals?: number | null;
  plan_max_amount?: number | null;
  plan_max_cycles?: number | null;
  plan_name: string;
  plan_note?: string | null;
  plan_recurring_amount?: number | null;
  plan_status?: string | null;
  plan_type: "ON_DEMAND" | "PERIODIC";
};

type CashfreeSubscription = {
  authorization_details?: CashfreeAuthorizationDetails | null;
  cf_subscription_id?: string | null;
  customer_details: CashfreeCustomerDetails;
  next_schedule_date?: string | null;
  plan_details: CashfreePlanDetails;
  subscription_expiry_time?: string | null;
  subscription_first_charge_time?: string | null;
  subscription_id: string;
  subscription_meta?: {
    return_url?: string | null;
  } | null;
  subscription_payment_splits?: unknown[] | null;
  subscription_session_id?: string | null;
  subscription_status: string;
  subscription_tags?: Record<string, string> | null;
};

type CashfreeFailureDetails = {
  failure_reason?: string | null;
};

type CashfreeSubscriptionPayment = {
  authorization_details?: CashfreeAuthorizationDetails | null;
  cf_order_id?: string | null;
  cf_payment_id?: string | null;
  cf_subscription_id?: string | null;
  cf_txn_id?: string | null;
  failure_details?: CashfreeFailureDetails | null;
  payment_amount?: number | null;
  payment_currency?: string | null;
  payment_id: string;
  payment_initiated_date?: string | null;
  payment_remarks?: string | null;
  payment_schedule_date?: string | null;
  payment_status?: string | null;
  payment_type?: string | null;
  retry_attempts?: number | null;
  subscription_id?: string | null;
};

const cashfreeWebhookTimestampToleranceMs = 10 * 60 * 1000;
const cashfreeApiVersion = "2025-01-01";

function getCashfreeApiBaseUrl() {
  const cashfreeEnv = getCashfreeEnv();

  return cashfreeEnv.CASHFREE_ENVIRONMENT === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

function buildCashfreeHeaders(overrides?: HeadersInit) {
  const cashfreeEnv = getCashfreeEnv();

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-api-version": cashfreeApiVersion,
    "x-client-id": cashfreeEnv.CASHFREE_CLIENT_ID,
    "x-client-secret": cashfreeEnv.CASHFREE_CLIENT_SECRET,
    ...(overrides ?? {}),
  };
}

async function cashfreeRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${getCashfreeApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: buildCashfreeHeaders(init?.headers),
  });

  const payload = (await response.json().catch(() => null)) as CashfreeErrorResponse | T | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      ("message" in payload || "code" in payload || "type" in payload)
        ? (payload as CashfreeErrorResponse).message ||
          (payload as CashfreeErrorResponse).code ||
          (payload as CashfreeErrorResponse).type
        : null;

    throw new Error(message ?? `Cashfree API request failed with status ${response.status}.`);
  }

  return payload as T;
}

function createFrithlyCashfreeSubscriptionId(planId: PlanId) {
  return `frithly-${planId}-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

function getCashfreePlanIdForFrithlyPlan(planId: PlanId) {
  const cashfreeEnv = getCashfreeEnv();

  switch (planId) {
    case "design_partner":
      return cashfreeEnv.CASHFREE_PLAN_ID_DESIGN_PARTNER ?? null;
    case "starter":
      return cashfreeEnv.CASHFREE_PLAN_ID_STARTER;
    case "growth":
      return cashfreeEnv.CASHFREE_PLAN_ID_GROWTH;
    default:
      return null;
  }
}

function getCashfreePlanReferenceForFrithlyPlan(planId: PlanId) {
  const cashfreePlanId = getCashfreePlanIdForFrithlyPlan(planId);

  if (!cashfreePlanId) {
    return null;
  }

  switch (planId) {
    case "design_partner":
      return {
        plan_id: cashfreePlanId,
        plan_name: PLANS.DESIGN_PARTNER.name,
        plan_type: "PERIODIC" as const,
      };
    case "starter":
      return {
        plan_id: cashfreePlanId,
        plan_name: PLANS.STARTER.name,
        plan_type: "PERIODIC" as const,
      };
    case "growth":
      return {
        plan_id: cashfreePlanId,
        plan_name: PLANS.GROWTH.name,
        plan_type: "PERIODIC" as const,
      };
    default:
      return null;
  }
}

export function getFrithlyPlanIdFromCashfreePlanId(providerPlanId: string | null | undefined) {
  if (!providerPlanId) {
    return null;
  }

  const cashfreeEnv = getCashfreeEnv();
  const normalizedPlanId = providerPlanId.trim().toLowerCase();

  if (
    cashfreeEnv.CASHFREE_PLAN_ID_DESIGN_PARTNER &&
    providerPlanId === cashfreeEnv.CASHFREE_PLAN_ID_DESIGN_PARTNER
  ) {
    return "design_partner" as const;
  }

  if (providerPlanId === cashfreeEnv.CASHFREE_PLAN_ID_STARTER) {
    return "starter" as const;
  }

  if (providerPlanId === cashfreeEnv.CASHFREE_PLAN_ID_GROWTH) {
    return "growth" as const;
  }

  if (normalizedPlanId.includes("design")) {
    return "design_partner" as const;
  }

  if (normalizedPlanId.includes("starter")) {
    return "starter" as const;
  }

  if (normalizedPlanId.includes("growth")) {
    return "growth" as const;
  }

  return null;
}

export function getFrithlyPlanIdFromCashfreeSubscription(params: {
  planDetails?: CashfreePlanDetails | null;
  subscriptionId?: string | null;
  subscriptionTags?: Record<string, string> | null;
}) {
  const taggedPlanId = params.subscriptionTags?.frithly_plan_id;

  if (taggedPlanId === "design_partner" || taggedPlanId === "starter" || taggedPlanId === "growth") {
    return taggedPlanId;
  }

  const fromPlanId = getFrithlyPlanIdFromCashfreePlanId(params.planDetails?.plan_id);

  if (fromPlanId) {
    return fromPlanId;
  }

  const normalizedPlanName = params.planDetails?.plan_name?.trim().toLowerCase();

  if (normalizedPlanName?.includes("design")) {
    return "design_partner" as const;
  }

  if (normalizedPlanName?.includes("starter")) {
    return "starter" as const;
  }

  if (normalizedPlanName?.includes("growth")) {
    return "growth" as const;
  }

  const normalizedSubscriptionId = params.subscriptionId?.trim().toLowerCase();

  if (normalizedSubscriptionId?.includes("design")) {
    return "design_partner" as const;
  }

  if (normalizedSubscriptionId?.includes("starter")) {
    return "starter" as const;
  }

  if (normalizedSubscriptionId?.includes("growth")) {
    return "growth" as const;
  }

  return null;
}

export async function createCashfreeSubscription(params: {
  companyName?: string | null;
  email: string;
  frithlyPlanId: PlanId;
  name: string;
  phone: string;
}) {
  const planReference = getCashfreePlanReferenceForFrithlyPlan(params.frithlyPlanId);

  if (!planReference) {
    throw new Error("That plan cannot be checked out automatically.");
  }

  const requestId = randomUUID();
  const idempotencyKey = randomUUID();
  const subscriptionId = createFrithlyCashfreeSubscriptionId(params.frithlyPlanId);
  const subscriptionExpiry = addYears(new Date(), 5).toISOString();
  const firstChargeTime = addDays(new Date(), 1).toISOString();
  const tags: Record<string, string> = {
    frithly_plan_id: params.frithlyPlanId,
    frithly_plan_name: planReference.plan_name,
    source: "public_checkout",
  };

  if (params.companyName?.trim()) {
    tags.company_name = params.companyName.trim();
  }

  const response = await cashfreeRequest<CashfreeSubscription>("/subscriptions", {
    body: JSON.stringify({
      authorization_details: {
        authorization_amount: 1,
        authorization_amount_refund: true,
        payment_methods: ["card"],
      },
      customer_details: {
        customer_email: params.email,
        customer_name: params.name,
        customer_phone: params.phone,
      },
      plan_details: planReference,
      subscription_expiry_time: subscriptionExpiry,
      subscription_first_charge_time: firstChargeTime,
      subscription_id: subscriptionId,
      subscription_meta: {
        notification_channel: ["EMAIL"],
        return_url: `${env.NEXT_PUBLIC_APP_URL}/api/billing/cashfree/return`,
      },
      subscription_tags: tags,
    }),
    headers: {
      "x-idempotency-key": idempotencyKey,
      "x-request-id": requestId,
    },
    method: "POST",
  });

  if (!response.subscription_session_id) {
    throw new Error("Cashfree did not return a subscription session ID.");
  }

  return response;
}

export async function fetchCashfreeSubscription(subscriptionId: string) {
  return cashfreeRequest<CashfreeSubscription>(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "GET",
  });
}

export async function fetchCashfreeSubscriptionPayments(subscriptionId: string) {
  return cashfreeRequest<CashfreeSubscriptionPayment[]>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}/payments`,
    {
      method: "GET",
    },
  );
}

export async function manageCashfreeSubscription(params: {
  action: "ACTIVATE" | "CANCEL" | "PAUSE";
  subscriptionId: string;
}) {
  return cashfreeRequest<CashfreeSubscription>(
    `/subscriptions/${encodeURIComponent(params.subscriptionId)}/manage`,
    {
      body: JSON.stringify({
        action: params.action,
        subscription_id: params.subscriptionId,
      }),
      headers: {
        "x-idempotency-key": randomUUID(),
        "x-request-id": randomUUID(),
      },
      method: "POST",
    },
  );
}

export function verifyCashfreeWebhookSignature(params: {
  payload: string;
  signature: string;
  timestamp: string;
}) {
  const { CASHFREE_CLIENT_SECRET } = getCashfreeEnv();
  const { payload, signature, timestamp } = params;
  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) {
    return false;
  }

  const timestampAge = Math.abs(Date.now() - timestampNumber);

  if (timestampAge > cashfreeWebhookTimestampToleranceMs) {
    return false;
  }

  const expectedSignature = createHmac("sha256", CASHFREE_CLIENT_SECRET)
    .update(`${timestamp}${payload}`)
    .digest("base64");

  if (expectedSignature.length !== signature.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(expectedSignature, "utf8"),
    Buffer.from(signature, "utf8"),
  );
}

export type {
  CashfreeAuthorizationDetails,
  CashfreeCustomerDetails,
  CashfreePlanDetails,
  CashfreeSubscription,
  CashfreeSubscriptionPayment,
};
