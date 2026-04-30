import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
    mode?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getErrorMessage(errorCode: string) {
  switch (errorCode) {
    case "create-failed":
      return "We couldn't create your Cashfree subscription session just now. Double-check your details and try again.";
    case "customer-details-required":
      return "We need your phone number to open Cashfree authorisation for this subscription.";
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
  const mode = readParam(resolvedSearchParams?.mode);
  const errorMessage = getErrorMessage(errorCode);
  const isDashboardUpgrade = mode === "dashboard-upgrade";

  if (!checkoutPlans.has(planId as PlanId)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(`${ROUTES.LOGIN}?next=${encodeURIComponent(`/checkout/${planId}`)}`);
  }

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
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("company_name, full_name")
    .eq("email", defaultEmail.trim().toLowerCase())
    .maybeSingle();
  const defaultCompany =
    existingCustomer?.company_name ||
    (typeof user?.user_metadata?.company_name === "string" ? user.user_metadata.company_name : "");
  const resolvedName = existingCustomer?.full_name || defaultName;

  return (
    <main className="py-16 md:py-24">
      <Container width="narrow" className="space-y-8">
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-terracotta">
            {isDashboardUpgrade ? "Complete billing setup" : "Secure Checkout"}
          </p>
          <h1>Start your {selectedPlan.name} subscription</h1>
          <p className="text-muted">
            {isDashboardUpgrade
              ? "You're already signed in. Add the few details Cashfree requires and we'll send you straight into the hosted card authorisation flow."
              : "Cashfree will open a hosted card authorisation flow for your recurring Frithly plan. We&apos;ll only use these details to create the subscription session and send your service emails."}
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
              <form action="/api/billing/cashfree/checkout" className="space-y-5" method="post">
                <input name="planId" type="hidden" value={selectedPlan.id} />

                {isDashboardUpgrade ? (
                  <>
                    <input name="fullName" type="hidden" value={resolvedName} />
                    <input name="email" type="hidden" value={defaultEmail} />
                    <input name="companyName" type="hidden" value={defaultCompany} />

                    <div className="rounded-xl bg-cream p-4 text-sm text-muted">
                      <p className="font-semibold text-ink">Using your account details</p>
                      <p className="mt-2">
                        {resolvedName || "Your account name"} | {defaultEmail}
                        {defaultCompany ? ` | ${defaultCompany}` : ""}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Full name</Label>
                      <Input
                        autoComplete="name"
                        defaultValue={resolvedName}
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
                  </>
                )}

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

                {isDashboardUpgrade ? null : (
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company name</Label>
                    <Input
                      defaultValue={defaultCompany}
                      id="company-name"
                      name="companyName"
                      placeholder="Acme SaaS"
                    />
                  </div>
                )}

                <div className="rounded-xl bg-cream p-4 text-sm text-muted">
                  <p className="font-semibold text-ink">
                    {isDashboardUpgrade ? "What happens next" : "Before you continue"}
                  </p>
                  <ul className="mt-3 list-disc space-y-2 pl-5">
                    {isDashboardUpgrade ? (
                      <>
                        <li>We&apos;ll open Cashfree immediately after you submit this phone number.</li>
                        <li>After successful authorisation, you&apos;ll come straight back to your dashboard.</li>
                        <li>Final subscription state is confirmed in the background from Cashfree.</li>
                      </>
                    ) : (
                      <>
                        <li>Cashfree must have your whitelisted domain and active recurring billing setup.</li>
                        <li>
                          Sandbox flows may ask you to simulate authorisation before the subscription
                          becomes active.
                        </li>
                        <li>
                          Final subscription status should always be trusted from webhooks, not the
                          browser redirect alone.
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="btn-primary" type="submit">
                    {isDashboardUpgrade ? "Continue to payment" : "Continue to secure authorisation"}
                  </button>
                  <Link className="btn-secondary" href={isDashboardUpgrade ? ROUTES.DASHBOARD : "/pricing"}>
                    {isDashboardUpgrade ? "Back to dashboard" : "Back to pricing"}
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
