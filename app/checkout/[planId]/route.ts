import { NextResponse } from "next/server";
import { createRazorpaySubscriptionCheckout } from "@/lib/razorpay/client";
import { hasRazorpayConfiguration } from "@/lib/razorpay/env";
import type { PlanId } from "@/types";

const supportedCheckoutPlans = new Set<PlanId>(["design_partner", "starter", "growth"]);

type CheckoutRouteContext = {
  params: Promise<{ planId: string }>;
};

export async function GET(request: Request, context: CheckoutRouteContext) {
  const { planId } = await context.params;

  if (!supportedCheckoutPlans.has(planId as PlanId)) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  if (!hasRazorpayConfiguration()) {
    return NextResponse.redirect(new URL("/pricing?checkout=unavailable", request.url));
  }

  try {
    const subscription = await createRazorpaySubscriptionCheckout({
      frithlyPlanId: planId as PlanId,
    });

    return NextResponse.redirect(subscription.short_url ?? new URL("/pricing", request.url));
  } catch (error) {
    console.error("Failed to create Razorpay checkout", { error, planId });

    return NextResponse.redirect(new URL("/pricing?checkout=error", request.url));
  }
}
