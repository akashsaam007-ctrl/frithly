import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CALCOM_URL } from "@/lib/constants";
import type { PlanId } from "@/types";

export const metadata: Metadata = {
  description: "Talk to sales to activate a Frithly plan.",
  title: "Talk to sales | Frithly",
};

const checkoutPlans = new Set<PlanId>(["design_partner", "starter", "growth"]);

type CheckoutPageProps = {
  params: Promise<{ planId: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { planId } = await params;

  if (!checkoutPlans.has(planId as PlanId)) {
    notFound();
  }

  redirect(CALCOM_URL);
}
