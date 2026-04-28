import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/landing/final-cta";
import { Guarantees } from "@/components/landing/guarantees";
import { PricingSection } from "@/components/landing/pricing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  description: "Frithly pricing for B2B teams that want researched intelligence, not raw lead lists.",
  title: "Pricing | Frithly",
};

type PricingPageProps = {
  searchParams?: Promise<{
    checkout?: string | string[] | undefined;
    email?: string | string[] | undefined;
    message?: string | string[] | undefined;
    subscription?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const checkoutState = readParam(resolvedSearchParams?.checkout);
  const checkoutEmail = readParam(resolvedSearchParams?.email);
  const checkoutMessage = readParam(resolvedSearchParams?.message);
  const subscriptionReference = readParam(resolvedSearchParams?.subscription);
  const loginParams = new URLSearchParams({
    next: ROUTES.BILLING,
  });

  if (checkoutEmail) {
    loginParams.set("email", checkoutEmail);
  }

  const loginUrl = `${ROUTES.LOGIN}?${loginParams.toString()}`;

  return (
    <main>
      <section className="py-20 md:py-24">
        <Container width="narrow" className="space-y-6 text-center">
          <h1>Choose the right Frithly plan for your team.</h1>
          <p className="mt-6 text-muted">
            Weekly lead intelligence, personalized openers, and zero annual contracts.
          </p>
          {checkoutState ? (
            <Card className="mx-auto max-w-[680px] text-left">
              <CardContent className="p-5 text-sm text-muted">
                {checkoutState === "success"
                  ? "Checkout completed. Watch your inbox for your Frithly welcome email, then use the same email address to log in."
                  : checkoutState === "authorized"
                    ? "Authorisation completed. Cashfree will confirm the recurring mandate in the background, and you'll use the same email from checkout to access billing and your dashboard."
                    : checkoutState === "pending"
                      ? "Authorisation reached the bank-approval stage. Cashfree may need a little more time before the subscription becomes fully active."
                      : checkoutState === "unavailable"
                        ? "Cashfree checkout is not configured yet in this environment. Add the Cashfree client ID, secret, environment, plan IDs, and webhook setup, then try again."
                        : checkoutState === "failed"
                          ? "The Cashfree authorisation did not complete successfully. You can try the checkout again or contact us for help."
                          : "We couldn't open the hosted checkout right now. Please try again in a moment or book a quick call and we'll help you through it."}
                {subscriptionReference ? (
                  <span className="mt-3 block">Subscription reference: {subscriptionReference}</span>
                ) : null}
                {checkoutMessage ? (
                  <span className="mt-3 block">Provider message: {checkoutMessage}</span>
                ) : null}
                {(checkoutState === "success" || checkoutState === "authorized") ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button asChild size="sm">
                      <Link href={loginUrl}>Log in to open billing</Link>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={ROUTES.BILLING}>Open billing</Link>
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </Container>
      </section>
      <PricingSection />
      <Guarantees />
      <FinalCta />
    </main>
  );
}
