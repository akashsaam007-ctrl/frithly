import type { Metadata } from "next";
import Link from "next/link";
import { FinalCta } from "@/components/landing/final-cta";
import { Guarantees } from "@/components/landing/guarantees";
import { PricingSection } from "@/components/landing/pricing";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { CALCOM_URL, ROUTES } from "@/lib/constants";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildServiceSchema,
  buildWebPageSchema,
} from "@/lib/seo";

const pricingDescription =
  "Frithly pricing for B2B teams that want weekly researched lead intelligence, verified contacts, and personalized outreach angles instead of raw lead lists.";

export const metadata: Metadata = buildPublicMetadata({
  description: pricingDescription,
  keywords: [
    "Frithly pricing",
    "B2B lead generation pricing",
    "sales intelligence pricing",
    "outbound research service pricing",
  ],
  path: "/pricing",
  title: "Pricing | Frithly",
});

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
  const checkoutMessage = readParam(resolvedSearchParams?.message);
  const subscriptionReference = readParam(resolvedSearchParams?.subscription);

  return (
    <main>
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: pricingDescription,
          path: "/pricing",
          title: "Pricing | Frithly",
        })}
      />
      <StructuredData data={buildServiceSchema()} />
      <section className="py-20 md:py-24">
        <Container width="narrow" className="space-y-6 text-center">
          <h1>Choose the right Frithly plan for your team.</h1>
          <p className="mt-6 text-muted">
            Weekly lead intelligence, personalized openers, and zero annual contracts.
          </p>
          {checkoutState ? (
            <Card className="mx-auto max-w-[680px] text-left">
              <CardContent className="p-5 text-sm text-muted">
                Online checkout is no longer active. We&apos;re routing all new plans through a
                short sales call so we can confirm fit, onboarding, and rollout details first.
                {subscriptionReference ? (
                  <span className="mt-3 block">Previous reference: {subscriptionReference}</span>
                ) : null}
                {checkoutMessage ? (
                  <span className="mt-3 block">Provider message: {checkoutMessage}</span>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild size="sm">
                    <Link href={CALCOM_URL} rel="noreferrer" target="_blank">
                      Book intro call
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={ROUTES.SAMPLE}>Get free sample</Link>
                  </Button>
                </div>
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
