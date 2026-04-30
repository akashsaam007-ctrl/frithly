import { NextResponse } from "next/server";
import { createCashfreeSubscription } from "@/lib/cashfree/client";
import { hasCashfreeCheckoutConfiguration } from "@/lib/cashfree/env";
import type { PlanId } from "@/types";

const supportedPlans = new Set<PlanId>(["design_partner", "starter", "growth"]);

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function redirectToCheckoutError(appBaseUrl: string, planId: string, error: string) {
  const url = new URL(`/checkout/${planId}`, appBaseUrl);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const appBaseUrl = requestUrl.origin;
  const formData = await request.formData();
  const planId = String(formData.get("planId") ?? "").trim() as PlanId;
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = normalizePhoneNumber(String(formData.get("phone") ?? "").trim());
  const companyName = String(formData.get("companyName") ?? "").trim();

  if (!supportedPlans.has(planId)) {
    return redirectToCheckoutError(appBaseUrl, "starter", "invalid-plan");
  }

  if (!hasCashfreeCheckoutConfiguration()) {
    return redirectToCheckoutError(appBaseUrl, planId, "unavailable");
  }

  if (!fullName || !email || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.length < 8) {
    return redirectToCheckoutError(appBaseUrl, planId, "invalid-details");
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
    console.error("Failed to create Cashfree subscription checkout", {
      error,
      planId,
    });

    return redirectToCheckoutError(appBaseUrl, planId, "create-failed");
  }
}
