import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createCashfreeSubscription } from "@/lib/cashfree/client";
import { hasCashfreeCheckoutConfiguration } from "@/lib/cashfree/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import type { PlanId } from "@/types";

const supportedPlans = new Set<PlanId>(["design_partner", "starter", "growth"]);

type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function redirectToCheckout(appBaseUrl: string, planId: PlanId, params?: Record<string, string>) {
  const url = new URL(`/checkout/${planId}`, appBaseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  return NextResponse.redirect(url, { status: 303 });
}

function getPreferredFullName(customer: CustomerRow | null, user: User | null) {
  const metadata = user?.user_metadata ?? {};

  return (
    customer?.full_name?.trim() ||
    (typeof metadata.full_name === "string" && metadata.full_name.trim()) ||
    (typeof metadata.name === "string" && metadata.name.trim()) ||
    [metadata.given_name, metadata.family_name]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .join(" ")
      .trim() ||
    user?.email?.split("@")[0] ||
    ""
  );
}

function getPreferredCompanyName(customer: CustomerRow | null, user: User | null) {
  const metadata = user?.user_metadata ?? {};

  return (
    customer?.company_name?.trim() ||
    (typeof metadata.company_name === "string" && metadata.company_name.trim()) ||
    ""
  );
}

function getPreferredPhone(user: User | null) {
  const metadata = user?.user_metadata ?? {};

  return normalizePhoneNumber(
    (typeof user?.phone === "string" && user.phone) ||
      (typeof metadata.phone === "string" && metadata.phone) ||
      (typeof metadata.phone_number === "string" && metadata.phone_number) ||
      "",
  );
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const appBaseUrl = requestUrl.origin;
  const formData = await request.formData();
  const planId = String(formData.get("planId") ?? "").trim() as PlanId;

  if (!supportedPlans.has(planId)) {
    return redirectToCheckout(appBaseUrl, "starter", { error: "invalid-plan" });
  }

  if (!hasCashfreeCheckoutConfiguration()) {
    return redirectToCheckout(appBaseUrl, planId, { error: "unavailable" });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    const loginUrl = new URL("/login", appBaseUrl);
    loginUrl.searchParams.set("next", `/checkout/${planId}`);
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const email = user.email.trim().toLowerCase();
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  const fullName = getPreferredFullName(customer, user);
  const companyName = getPreferredCompanyName(customer, user);
  const phone = getPreferredPhone(user);

  if (!fullName || phone.length < 8) {
    return redirectToCheckout(appBaseUrl, planId, {
      error: "customer-details-required",
      mode: "dashboard-upgrade",
    });
  }

  try {
    const subscription = await createCashfreeSubscription({
      appBaseUrl,
      companyName: companyName || null,
      email,
      frithlyPlanId: planId,
      name: fullName,
      phone,
    });
    const payUrl = new URL("/pay", appBaseUrl);

    payUrl.searchParams.set("subscription_id", subscription.subscription_id);
    payUrl.searchParams.set(
      "subscription_session_id",
      subscription.subscription_session_id ?? "",
    );

    return NextResponse.redirect(payUrl, { status: 303 });
  } catch (error) {
    console.error("Failed to create customer-upgrade Cashfree checkout", {
      error,
      planId,
      userEmail: email,
    });

    return redirectToCheckout(appBaseUrl, planId, {
      error: "create-failed",
      mode: "dashboard-upgrade",
    });
  }
}
