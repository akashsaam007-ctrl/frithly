import { NextResponse } from "next/server";
import { manageCashfreeSubscription } from "@/lib/cashfree/client";
import { hasCashfreeApiConfiguration } from "@/lib/cashfree/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/utils/env";

const allowedActions = new Set(["ACTIVATE", "CANCEL", "PAUSE"]);

function redirectToBilling(state: string) {
  const url = new URL("/billing", env.NEXT_PUBLIC_APP_URL);
  url.searchParams.set("billing", state);
  return NextResponse.redirect(url, { status: 303 });
}

function mapActionToCustomerStatus(action: string) {
  switch (action) {
    case "ACTIVATE":
      return "active";
    case "PAUSE":
      return "paused";
    case "CANCEL":
      return "cancelled";
    default:
      return "pending";
  }
}

export async function POST(request: Request) {
  const action = String((await request.formData()).get("action") ?? "").trim().toUpperCase();

  if (!allowedActions.has(action)) {
    return redirectToBilling("invalid-action");
  }

  if (!hasCashfreeApiConfiguration()) {
    return redirectToBilling("billing-unavailable");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(new URL("/login", env.NEXT_PUBLIC_APP_URL), { status: 303 });
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, stripe_subscription_id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (customerError || !customer?.stripe_subscription_id) {
    return redirectToBilling("subscription-missing");
  }

  try {
    await manageCashfreeSubscription({
      action: action as "ACTIVATE" | "CANCEL" | "PAUSE",
      subscriptionId: customer.stripe_subscription_id,
    });

    const adminClient = createSupabaseAdminClient();
    await adminClient
      .from("customers")
      .update({ status: mapActionToCustomerStatus(action) })
      .eq("id", customer.id);

    return redirectToBilling("subscription-updated");
  } catch (error) {
    console.error("Failed to manage Cashfree subscription", {
      action,
      error,
      subscriptionId: customer.stripe_subscription_id,
    });

    return redirectToBilling("manage-failed");
  }
}
