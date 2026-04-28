import { NextResponse } from "next/server";
import {
  fetchRazorpayCustomer,
  getRazorpayPlanIdForFrithlyPlan,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay/client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PlanId } from "@/types";

type SubscriptionEventName =
  | "subscription.activated"
  | "subscription.authenticated"
  | "subscription.cancelled"
  | "subscription.charged"
  | "subscription.completed"
  | "subscription.halted"
  | "subscription.paused"
  | "subscription.pending"
  | "subscription.resumed"
  | "subscription.updated";

type RazorpaySubscriptionWebhookPayload = {
  event: SubscriptionEventName;
  payload?: {
    subscription?: {
      entity?: {
        customer_id?: string | null;
        id?: string;
        notes?: Record<string, string> | [];
        plan_id?: string;
        status?: string;
      };
    };
  };
};

function mapPlanId(razorpayPlanId: string | undefined) {
  const planIds: Record<PlanId, string | null> = {
    design_partner: getRazorpayPlanIdForFrithlyPlan("design_partner"),
    growth: getRazorpayPlanIdForFrithlyPlan("growth"),
    scale: getRazorpayPlanIdForFrithlyPlan("scale"),
    starter: getRazorpayPlanIdForFrithlyPlan("starter"),
  };

  const match = Object.entries(planIds).find(([, value]) => value === razorpayPlanId)?.[0];
  return (match as PlanId | undefined) ?? null;
}

function mapCustomerStatus(event: SubscriptionEventName, providerStatus: string | undefined) {
  if (event === "subscription.cancelled" || event === "subscription.completed") {
    return "cancelled" as const;
  }

  if (event === "subscription.paused") {
    return "paused" as const;
  }

  if (event === "subscription.activated" || event === "subscription.charged" || event === "subscription.resumed") {
    return "active" as const;
  }

  if (providerStatus === "active") {
    return "active" as const;
  }

  if (providerStatus === "paused") {
    return "paused" as const;
  }

  if (providerStatus === "cancelled" || providerStatus === "completed") {
    return "cancelled" as const;
  }

  return "pending" as const;
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Razorpay signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  try {
    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid Razorpay signature." }, { status: 400 });
    }
  } catch (error) {
    console.error("Razorpay signature verification failed", error);
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody) as RazorpaySubscriptionWebhookPayload;
  const subscription = payload.payload?.subscription?.entity;

  if (!subscription?.id || !subscription.customer_id) {
    return NextResponse.json({ received: true, skipped: true });
  }

  try {
    const razorpayCustomer = await fetchRazorpayCustomer(subscription.customer_id);
    const email = razorpayCustomer.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: existingCustomer } = await adminClient
      .from("customers")
      .select("id, company_name, full_name")
      .eq("email", email)
      .maybeSingle();

    const plan =
      mapPlanId(subscription.plan_id) ||
      ((subscription.notes &&
      !Array.isArray(subscription.notes) &&
      "frithly_plan_id" in subscription.notes
        ? subscription.notes.frithly_plan_id
        : null) as PlanId | null);

    const customerPayload = {
      cancelled_at:
        payload.event === "subscription.cancelled" || payload.event === "subscription.completed"
          ? new Date().toISOString()
          : null,
      company_name: existingCustomer?.company_name ?? null,
      email,
      full_name:
        existingCustomer?.full_name ??
        razorpayCustomer.name?.trim() ??
        email.split("@")[0] ??
        null,
      plan,
      status: mapCustomerStatus(payload.event, subscription.status),
      stripe_customer_id: subscription.customer_id,
      stripe_subscription_id: subscription.id,
    };

    if (existingCustomer) {
      await adminClient.from("customers").update(customerPayload).eq("id", existingCustomer.id);
    } else {
      await adminClient.from("customers").insert(customerPayload);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed", error);

    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
