import type { Metadata } from "next";
import { FinalCta } from "@/components/landing/final-cta";
import { Guarantees } from "@/components/landing/guarantees";
import { PricingSection } from "@/components/landing/pricing";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  description: "Frithly pricing for B2B teams that want researched intelligence, not raw lead lists.",
  title: "Pricing | Frithly",
};

type PricingPageProps = {
  searchParams?: Promise<{
    checkout?: string | string[] | undefined;
  }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const checkoutState = readParam(resolvedSearchParams?.checkout);

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
                  ? "Checkout completed. Watch your inbox for the Paddle receipt and your Frithly welcome email, then use the same email address to log in."
                  : checkoutState === "unavailable"
                    ? "Paddle checkout is not configured yet in this environment. Add the Paddle API key, environment, client-side token, price IDs, and webhook secret, then try again."
                    : "We couldn't open the hosted checkout right now. Please try again in a moment or book a quick call and we'll help you through it."}
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
