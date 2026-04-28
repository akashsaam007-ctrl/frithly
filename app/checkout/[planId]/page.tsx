import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PLANS, ROUTES } from "@/lib/constants";
import { hasCashfreeCheckoutConfiguration } from "@/lib/cashfree/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import type { PlanId } from "@/types";

export const metadata: Metadata = {
  description: "Secure subscription authorisation for Frithly recurring plans.",
  title: "Start subscription | Frithly",
};

const checkoutPlans = new Set<PlanId>(["design_partner", "starter", "growth"]);

type CheckoutPageProps = {
  params: Promise<{ planId: string }>;
  searchParams?: Promise<{
    error?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "create-failed":
      return "We couldn't create your Cashfree subscription session just now. Double-check your details and try again.";
    case "invalid-details":
      return "Please provide a valid full name, work email, and phone number before continuing.";
    case "invalid-plan":
      return "That plan cannot be checked out automatically. Choose Starter, Growth, or Design Partner.";
    case "unavailable":
      return "Cashfree billing is not configured in this environment yet. Use the sample flow for now or finish the billing setup.";
    default:
      return "";
  }
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { planId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorCode = readParam(resolvedSearchParams?.error);
  const errorMessage = getErrorMessage(errorCode);

  if (!checkoutPlans.has(planId as PlanId)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const selectedPlan =
    planId === "design_partner"
      ? PLANS.DESIGN_PARTNER
      : planId === "starter"
        ? PLANS.STARTER
        : PLANS.GROWTH;
  const checkoutConfigured = hasCashfreeCheckoutConfiguration();
  const defaultName =
    typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const defaultEmail = user?.email ?? "";
  const defaultCompany =
    typeof user?.user_metadata?.company_name === "string" ? user.user_metadata.company_name : "";

  return (
    <main className="py-16 md:py-24">
      <Container width="narrow" className="space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
            Secure Checkout
          </p>
          <h1>Start your {selectedPlan.name} subscription</h1>
          <p className="text-muted">
            Cashfree will open a hosted card authorisation flow for your recurring Frithly plan.
            We&apos;ll only use these details to create the subscription session and send your
            service emails.
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-4">
            <CardTitle>
              {selectedPlan.name} | {formatCurrency(selectedPlan.price, selectedPlan.currency)}/month
            </CardTitle>
            <p className="text-sm text-muted">
              Includes {selectedPlan.features[0]?.toLowerCase() ?? "weekly lead delivery"} and a
              recurring monthly card authorisation managed through Cashfree.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {checkoutConfigured ? (
              <form
                action="/api/billing/cashfree/checkout"
                className="space-y-5"
                method="post"
              >
                <input name="planId" type="hidden" value={selectedPlan.id} />

                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    autoComplete="name"
                    defaultValue={defaultName}
                    id="full-name"
                    name="fullName"
                    placeholder="Jane Smith"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work-email">Work email</Label>
                  <Input
                    autoComplete="email"
                    defaultValue={defaultEmail}
                    id="work-email"
                    name="email"
                    placeholder="jane@company.com"
                    required
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone number</Label>
                  <Input
                    autoComplete="tel"
                    id="phone-number"
                    name="phone"
                    placeholder="+44 7700 900123"
                    required
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name">Company name</Label>
                  <Input
                    defaultValue={defaultCompany}
                    id="company-name"
                    name="companyName"
                    placeholder="Acme SaaS"
                  />
                </div>

                <div className="rounded-xl bg-cream p-4 text-sm text-muted">
                  <p className="font-semibold text-ink">Before you continue</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5">
                    <li>Cashfree must have your whitelisted domain and active recurring billing setup.</li>
                    <li>
                      Sandbox flows may ask you to simulate authorisation before the subscription
                      becomes active.
                    </li>
                    <li>
                      Final subscription status should always be trusted from webhooks, not the
                      browser redirect alone.
                    </li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="btn-primary" type="submit">
                    Continue to secure authorisation
                  </button>
                  <Link className="btn-secondary" href="/pricing">
                    Back to pricing
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-muted">
                  Cashfree billing is not configured in this environment yet, so this checkout path
                  is currently unavailable.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link className="btn-primary" href={ROUTES.SAMPLE}>
                    Get free sample instead
                  </Link>
                  <Link className="btn-secondary" href="/pricing">
                    Back to pricing
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
