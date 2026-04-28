import { NextResponse } from "next/server";
import { createPaddleCheckout } from "@/lib/paddle/client";
import { hasPaddleCheckoutConfiguration } from "@/lib/paddle/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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

  if (!hasPaddleCheckoutConfiguration()) {
    return NextResponse.redirect(new URL("/pricing?checkout=unavailable", request.url));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const checkout = await createPaddleCheckout({
      email: user?.email ?? null,
      frithlyPlanId: planId as PlanId,
      name:
        typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
    });

    return NextResponse.redirect(checkout.checkout?.url ?? new URL("/pricing", request.url));
  } catch (error) {
    console.error("Failed to create Paddle checkout", { error, planId });

    return NextResponse.redirect(new URL("/pricing?checkout=error", request.url));
  }
}
