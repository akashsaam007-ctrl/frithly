import type { Metadata } from "next";
import Link from "next/link";
import { PricingSection } from "@/components/landing/pricing";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildServiceSchema,
  buildWebPageSchema,
} from "@/lib/seo";

const pricingDescription =
  "Design a Frithly outbound intelligence program around opportunity coverage, targeting depth, market scope, and curated weekly delivery.";

export const metadata: Metadata = buildPublicMetadata({
  description: pricingDescription,
  keywords: [
    "Frithly pricing",
    "outbound intelligence program",
    "curated outbound service pricing",
    "weekly outbound intelligence",
  ],
  path: "/pricing",
  title: "Design Your Intelligence Program | Frithly",
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
          title: "Design Your Intelligence Program | Frithly",
        })}
      />
      <StructuredData data={buildServiceSchema()} />
      <section className="pb-10 pt-20 md:pb-12 md:pt-24">
        <Container width="narrow" className="space-y-6 text-center">
          <div className="section-eyebrow mx-auto">Program configuration</div>
          <h1>Design your Frithly intelligence program.</h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted">
            Every program starts with the Frithly Core Intelligence foundation, then expands
            around opportunity coverage, market scope, qualification depth, and weekly delivery
            support.
          </p>
          {checkoutState ? (
            <Card className="mx-auto max-w-[680px] text-left">
              <CardContent className="p-5 text-sm text-muted">
                Direct checkout is no longer active. New programs now begin with application,
                qualification, and configuration so we can shape the right weekly operating model
                before onboarding begins.
                {subscriptionReference ? (
                  <span className="mt-3 block">Previous reference: {subscriptionReference}</span>
                ) : null}
                {checkoutMessage ? (
                  <span className="mt-3 block">Provider message: {checkoutMessage}</span>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild size="sm">
                    <Link href={ROUTES.CONTACT_SALES}>
                      Talk to sales
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={ROUTES.APPLY}>Apply for your program</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </Container>
      </section>
      <PricingSection />
    </main>
  );
}
