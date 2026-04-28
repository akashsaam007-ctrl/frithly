import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { getPaddleEnv } from "@/lib/paddle/env";
import { env } from "@/lib/utils/env";
import type { PlanId } from "@/types";

type PaddleErrorResponse = {
  error?: {
    code?: string;
    detail?: string;
    documentation_url?: string;
    type?: string;
  };
};

type PaddleListResponse<T> = {
  data: T[];
  meta?: {
    pagination?: {
      next?: string | null;
      per_page?: number;
    };
    request_id?: string;
  };
};

type PaddleEntityResponse<T> = {
  data: T;
  meta?: {
    request_id?: string;
  };
};

type PaddlePriceReference = {
  id: string;
  name?: string | null;
  product_id?: string | null;
};

type PaddleCheckoutDetails = {
  url?: string | null;
};

type PaddleCustomer = {
  custom_data?: Record<string, unknown> | null;
  email: string;
  id: string;
  name: string | null;
  status: string;
  updated_at: string;
};

type PaddleSubscriptionItem = {
  price: PaddlePriceReference;
  quantity: number;
};

type PaddleSubscription = {
  canceled_at: string | null;
  created_at: string;
  currency_code: string;
  customer_id: string;
  first_billed_at: string | null;
  id: string;
  items: PaddleSubscriptionItem[];
  management_urls?: {
    cancel?: string | null;
    update_payment_method?: string | null;
  };
  next_billed_at: string | null;
  paused_at: string | null;
  scheduled_change?: {
    action?: string | null;
    effective_at?: string | null;
  } | null;
  started_at: string | null;
  status: string;
  updated_at: string;
};

type PaddleTransaction = {
  billed_at: string | null;
  checkout: PaddleCheckoutDetails | null;
  created_at: string;
  currency_code: string;
  customer_id: string | null;
  details?: {
    totals?: {
      grand_total?: string | null;
      total?: string | null;
    } | null;
  } | null;
  id: string;
  invoice_number: string | null;
  items: PaddleSubscriptionItem[];
  payments?: Array<{
    amount?: string | null;
    created_at?: string | null;
  }> | null;
  status: string;
  subscription_id: string | null;
  updated_at: string;
};

type PaddlePortalSubscriptionLinks = {
  cancel_subscription?: string | null;
  subscription_id: string;
  update_subscription_payment_method?: string | null;
};

type PaddlePortalSession = {
  created_at: string;
  customer_id: string;
  id: string;
  urls: {
    general: {
      overview: string;
    };
    subscriptions?: PaddlePortalSubscriptionLinks[];
  };
};

type PaddleInvoiceLink = {
  url: string;
};

type PaddleInvoiceSummary = PaddleTransaction & {
  invoiceUrl: string | null;
};

const webhookTimestampToleranceSeconds = 300;

function getPaddleApiBaseUrl() {
  const paddleEnv = getPaddleEnv();
  return paddleEnv.PADDLE_ENVIRONMENT === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";
}

async function paddleRequest<T>(path: string, init?: RequestInit) {
  const paddleEnv = getPaddleEnv();

  const response = await fetch(`${getPaddleApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${paddleEnv.PADDLE_API_KEY}`,
      "Content-Type": "application/json",
      "Paddle-Version": "1",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as PaddleErrorResponse | T | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      payload.error &&
      typeof payload.error === "object"
        ? payload.error.detail ||
          payload.error.code ||
          payload.error.documentation_url ||
          payload.error.type
        : null;

    throw new Error(message ?? `Paddle API request failed with status ${response.status}.`);
  }

  return payload as T;
}

export function getPaddlePriceIdForFrithlyPlan(planId: PlanId) {
  const paddleEnv = getPaddleEnv();

  switch (planId) {
    case "design_partner":
      return paddleEnv.PADDLE_PRICE_ID_DESIGN_PARTNER ?? null;
    case "starter":
      return paddleEnv.PADDLE_PRICE_ID_STARTER;
    case "growth":
      return paddleEnv.PADDLE_PRICE_ID_GROWTH;
    default:
      return null;
  }
}

export function getFrithlyPlanIdFromPaddlePriceId(priceId: string | null | undefined) {
  if (!priceId) {
    return null;
  }

  const paddleEnv = getPaddleEnv();

  if (
    paddleEnv.PADDLE_PRICE_ID_DESIGN_PARTNER &&
    priceId === paddleEnv.PADDLE_PRICE_ID_DESIGN_PARTNER
  ) {
    return "design_partner" as const;
  }

  if (priceId === paddleEnv.PADDLE_PRICE_ID_STARTER) {
    return "starter" as const;
  }

  if (priceId === paddleEnv.PADDLE_PRICE_ID_GROWTH) {
    return "growth" as const;
  }

  return null;
}

export function getFrithlyPlanIdFromPaddleItems(items: PaddleSubscriptionItem[] | null | undefined) {
  if (!items?.length) {
    return null;
  }

  for (const item of items) {
    const matchedPlan = getFrithlyPlanIdFromPaddlePriceId(item.price?.id);

    if (matchedPlan) {
      return matchedPlan;
    }
  }

  return null;
}

export async function findPaddleCustomerByEmail(email: string) {
  const query = new URLSearchParams({ email });

  const response = await paddleRequest<PaddleListResponse<PaddleCustomer>>(
    `/customers?${query.toString()}`,
    {
      method: "GET",
    },
  );

  return response.data[0] ?? null;
}

export async function createPaddleCustomer(params: { email: string; name?: string | null }) {
  const response = await paddleRequest<PaddleEntityResponse<PaddleCustomer>>("/customers", {
    body: JSON.stringify({
      email: params.email,
      ...(params.name ? { name: params.name } : {}),
    }),
    method: "POST",
  });

  return response.data;
}

export async function findOrCreatePaddleCustomer(params: {
  email: string;
  name?: string | null;
}) {
  const existing = await findPaddleCustomerByEmail(params.email);

  if (existing) {
    return existing;
  }

  return createPaddleCustomer(params);
}

export async function createPaddleCheckout(params: {
  email?: string | null;
  frithlyPlanId: PlanId;
  name?: string | null;
}) {
  const priceId = getPaddlePriceIdForFrithlyPlan(params.frithlyPlanId);

  if (!priceId) {
    throw new Error("That plan cannot be checked out automatically.");
  }

  const customer =
    params.email && params.email.trim().length > 0
      ? await findOrCreatePaddleCustomer({
          email: params.email,
          name: params.name ?? null,
        }).catch(() => null)
      : null;

  const response = await paddleRequest<PaddleEntityResponse<PaddleTransaction>>("/transactions", {
    body: JSON.stringify({
      checkout: {
        url: `${env.NEXT_PUBLIC_APP_URL}/pay`,
      },
      collection_mode: "automatic",
      custom_data: {
        app: "frithly",
        frithly_plan_id: params.frithlyPlanId,
        source: "public_checkout",
      },
      ...(customer ? { customer_id: customer.id } : {}),
      items: [
        {
          price_id: priceId,
          quantity: 1,
        },
      ],
    }),
    method: "POST",
  });

  if (!response.data.checkout?.url) {
    throw new Error("Paddle did not return a hosted checkout URL.");
  }

  return response.data;
}

export async function fetchPaddleCustomer(customerId: string) {
  return paddleRequest<PaddleEntityResponse<PaddleCustomer>>(
    `/customers/${encodeURIComponent(customerId)}`,
    {
      method: "GET",
    },
  );
}

export async function fetchPaddleSubscription(subscriptionId: string) {
  return paddleRequest<PaddleEntityResponse<PaddleSubscription>>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      method: "GET",
    },
  );
}

export async function fetchPaddleUpdatePaymentMethodTransaction(subscriptionId: string) {
  return paddleRequest<PaddleEntityResponse<PaddleTransaction>>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}/update-payment-method-transaction`,
    {
      method: "GET",
    },
  );
}

export async function createPaddleCustomerPortalSession(
  customerId: string,
  subscriptionIds: string[] = [],
) {
  return paddleRequest<PaddleEntityResponse<PaddlePortalSession>>(
    `/customers/${encodeURIComponent(customerId)}/portal-sessions`,
    {
      body: JSON.stringify(
        subscriptionIds.length > 0 ? { subscription_ids: subscriptionIds } : {},
      ),
      method: "POST",
    },
  );
}

export async function fetchPaddleTransactionInvoiceLink(
  transactionId: string,
  disposition: "attachment" | "inline" = "inline",
) {
  return paddleRequest<PaddleEntityResponse<PaddleInvoiceLink>>(
    `/transactions/${encodeURIComponent(transactionId)}/invoice?disposition=${disposition}`,
    {
      method: "GET",
    },
  );
}

export async function fetchPaddleSubscriptionInvoices(subscriptionId: string) {
  const query = new URLSearchParams({
    per_page: "30",
    status: "billed,completed,paid,past_due",
    subscription_id: subscriptionId,
  });

  const transactions = await paddleRequest<PaddleListResponse<PaddleTransaction>>(
    `/transactions?${query.toString()}`,
    {
      method: "GET",
    },
  );

  const enrichedTransactions = await Promise.all(
    (transactions.data ?? []).map(async (transaction) => {
      const invoiceUrl =
        transaction.status === "completed" || transaction.status === "billed"
          ? await fetchPaddleTransactionInvoiceLink(transaction.id)
              .then((response) => response.data.url)
              .catch(() => null)
          : null;

      return {
        ...transaction,
        invoiceUrl,
      } satisfies PaddleInvoiceSummary;
    }),
  );

  return enrichedTransactions.sort((left, right) => {
    const leftTime = new Date(left.billed_at ?? left.created_at).getTime();
    const rightTime = new Date(right.billed_at ?? right.created_at).getTime();

    return rightTime - leftTime;
  });
}

export function verifyPaddleWebhookSignature(payload: string, signatureHeader: string) {
  const { PADDLE_WEBHOOK_SECRET } = getPaddleEnv();
  const headerParts = signatureHeader.split(";").map((part) => part.trim());
  const timestamp = headerParts
    .find((part) => part.startsWith("ts="))
    ?.split("=")
    .slice(1)
    .join("=");

  const signatures = headerParts
    .filter((part) => part.startsWith("h1="))
    .map((part) => part.split("=").slice(1).join("="))
    .filter((part) => part.length > 0);

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const timestampAgeSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));

  if (!Number.isFinite(timestampAgeSeconds) || timestampAgeSeconds > webhookTimestampToleranceSeconds) {
    return false;
  }

  const expectedSignature = createHmac("sha256", PADDLE_WEBHOOK_SECRET)
    .update(`${timestamp}:${payload}`)
    .digest("hex");

  return signatures.some((signature) => {
    if (signature.length !== expectedSignature.length) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8"),
    );
  });
}

export type {
  PaddleCustomer,
  PaddleInvoiceSummary,
  PaddlePortalSession,
  PaddlePortalSubscriptionLinks,
  PaddleSubscription,
  PaddleSubscriptionItem,
  PaddleTransaction,
};
