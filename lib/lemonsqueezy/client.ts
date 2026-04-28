import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/utils/env";
import { getLemonSqueezyEnv } from "@/lib/lemonsqueezy/env";
import type { PlanId } from "@/types";

type JsonApiResource<TAttributes> = {
  attributes: TAttributes;
  id: string;
  type: string;
};

type JsonApiSingleResponse<TAttributes> = {
  data: JsonApiResource<TAttributes>;
};

type JsonApiCollectionResponse<TAttributes> = {
  data: Array<JsonApiResource<TAttributes>>;
};

type LemonSqueezyCheckoutAttributes = {
  test_mode: boolean;
  url: string;
};

type LemonSqueezySubscriptionAttributes = {
  billing_anchor: number | null;
  cancelled: boolean;
  created_at: string;
  customer_id: number | null;
  ends_at: string | null;
  first_subscription_item: {
    created_at: string;
    id: number;
    price_id: number;
    quantity: number;
    subscription_id: number;
    updated_at: string;
  } | null;
  order_id: number | null;
  order_item_id: number | null;
  payment_processor: string | null;
  pause: { mode: string; resumes_at: string | null } | null;
  product_id: number | null;
  product_name: string;
  renews_at: string | null;
  status: string;
  status_formatted: string;
  store_id: number;
  test_mode: boolean;
  trial_ends_at: string | null;
  updated_at: string;
  urls: {
    customer_portal?: string | null;
    customer_portal_update_subscription?: string | null;
    update_customer_portal?: string | null;
    update_payment_method?: string | null;
  };
  user_email: string;
  user_name: string | null;
  variant_id: number | null;
  variant_name: string;
};

type LemonSqueezyCustomerAttributes = {
  created_at: string;
  email: string;
  mrr: number;
  name: string | null;
  status: string;
  test_mode: boolean;
  total_revenue_currency: number;
  updated_at: string;
  urls: {
    customer_portal?: string | null;
  };
};

type LemonSqueezySubscriptionInvoiceAttributes = {
  billing_reason: string;
  created_at: string;
  currency: string;
  customer_id: number;
  status: string;
  subscription_id: number;
  test_mode: boolean;
  total: number;
  updated_at: string;
  urls: {
    invoice_url?: string | null;
  };
  user_email: string;
  user_name: string | null;
};

const apiBaseUrl = "https://api.lemonsqueezy.com/v1";

function buildAuthorizationHeader() {
  const lemonEnv = getLemonSqueezyEnv();
  return `Bearer ${lemonEnv.LEMON_SQUEEZY_API_KEY}`;
}

async function lemonSqueezyRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: buildAuthorizationHeader(),
      "Content-Type": "application/vnd.api+json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        errors?: Array<{ code?: string; detail?: string; source?: { pointer?: string }; title?: string }>;
      }
    | T
    | null;

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "errors" in payload &&
      Array.isArray(payload.errors)
        ? payload.errors[0]?.detail ||
          payload.errors[0]?.title ||
          payload.errors[0]?.code ||
          payload.errors[0]?.source?.pointer
        : null;

    throw new Error(message ?? `Lemon Squeezy API request failed with status ${response.status}.`);
  }

  return payload as T;
}

export function getLemonSqueezyVariantIdForFrithlyPlan(planId: PlanId) {
  const lemonEnv = getLemonSqueezyEnv();

  switch (planId) {
    case "design_partner":
      return lemonEnv.LEMON_SQUEEZY_VARIANT_ID_DESIGN_PARTNER ?? null;
    case "starter":
      return lemonEnv.LEMON_SQUEEZY_VARIANT_ID_STARTER;
    case "growth":
      return lemonEnv.LEMON_SQUEEZY_VARIANT_ID_GROWTH;
    default:
      return null;
  }
}

export function getFrithlyPlanIdFromLemonVariantId(variantId: number | string | null | undefined) {
  if (variantId === null || variantId === undefined) {
    return null;
  }

  const normalizedVariantId = String(variantId);
  const lemonEnv = getLemonSqueezyEnv();

  if (
    lemonEnv.LEMON_SQUEEZY_VARIANT_ID_DESIGN_PARTNER &&
    normalizedVariantId === lemonEnv.LEMON_SQUEEZY_VARIANT_ID_DESIGN_PARTNER
  ) {
    return "design_partner" as const;
  }

  if (normalizedVariantId === lemonEnv.LEMON_SQUEEZY_VARIANT_ID_STARTER) {
    return "starter" as const;
  }

  if (normalizedVariantId === lemonEnv.LEMON_SQUEEZY_VARIANT_ID_GROWTH) {
    return "growth" as const;
  }

  return null;
}

export async function createLemonSqueezyCheckout(params: {
  email?: string | null;
  frithlyPlanId: PlanId;
  name?: string | null;
}) {
  const lemonEnv = getLemonSqueezyEnv();
  const variantId = getLemonSqueezyVariantIdForFrithlyPlan(params.frithlyPlanId);

  if (!variantId) {
    throw new Error("That plan cannot be checked out automatically.");
  }

  const checkout = await lemonSqueezyRequest<JsonApiSingleResponse<LemonSqueezyCheckoutAttributes>>(
    "/checkouts",
    {
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              ...(params.email ? { email: params.email } : {}),
              ...(params.name ? { name: params.name } : {}),
              custom: {
                app: "frithly",
                frithly_plan_id: params.frithlyPlanId,
                source: "public_checkout",
              },
            },
            checkout_options: {
              subscription_preview: true,
            },
            product_options: {
              enabled_variants: [Number(variantId)],
              receipt_button_text: "Open Frithly",
              receipt_link_url: `${env.NEXT_PUBLIC_APP_URL}/login`,
              receipt_thank_you_note:
                "Your Frithly subscription is confirmed. Use the same email to access your dashboard.",
              redirect_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?checkout=success`,
            },
            ...(lemonEnv.LEMON_SQUEEZY_TEST_MODE === "true" ? { test_mode: true } : {}),
          },
          relationships: {
            store: {
              data: {
                id: lemonEnv.LEMON_SQUEEZY_STORE_ID,
                type: "stores",
              },
            },
            variant: {
              data: {
                id: variantId,
                type: "variants",
              },
            },
          },
        },
      }),
      method: "POST",
    },
  );

  if (!checkout.data.attributes.url) {
    throw new Error("Lemon Squeezy did not return a hosted checkout URL.");
  }

  return checkout.data;
}

export async function fetchLemonSqueezyCustomer(customerId: string) {
  return lemonSqueezyRequest<JsonApiSingleResponse<LemonSqueezyCustomerAttributes>>(
    `/customers/${encodeURIComponent(customerId)}`,
    {
      method: "GET",
    },
  );
}

export async function fetchLemonSqueezySubscription(subscriptionId: string) {
  return lemonSqueezyRequest<JsonApiSingleResponse<LemonSqueezySubscriptionAttributes>>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      method: "GET",
    },
  );
}

export async function fetchLemonSqueezySubscriptionInvoices(subscriptionId: string) {
  const query = new URLSearchParams({
    "filter[subscription_id]": subscriptionId,
    "page[size]": "100",
  });

  const invoices = await lemonSqueezyRequest<
    JsonApiCollectionResponse<LemonSqueezySubscriptionInvoiceAttributes>
  >(`/subscription-invoices?${query.toString()}`, {
    method: "GET",
  });

  return invoices.data ?? [];
}

export function verifyLemonSqueezyWebhookSignature(payload: string, signature: string) {
  const { LEMON_SQUEEZY_WEBHOOK_SECRET } = getLemonSqueezyEnv();
  const expectedSignature = createHmac("sha256", LEMON_SQUEEZY_WEBHOOK_SECRET)
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
  LemonSqueezyCustomerAttributes,
  LemonSqueezySubscriptionAttributes,
  LemonSqueezySubscriptionInvoiceAttributes,
};
