import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageEvent } from "@/components/analytics/page-event";
import { AnswerEngineSection } from "@/components/landing/answer-engine-section";
import { Comparison } from "@/components/landing/comparison";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Guarantees } from "@/components/landing/guarantees";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing";
import { Problem } from "@/components/landing/problem";
import { ProofSection } from "@/components/landing/proof-section";
import { SampleLead } from "@/components/landing/sample-lead";
import { StructuredData } from "@/components/seo/structured-data";
import { landingFaqs } from "@/components/landing/faq";
import {
  buildFaqSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
  buildServiceSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description:
    "Get 50 hyper-researched B2B leads with personalized opening lines delivered every Monday. Frithly helps B2B outbound teams turn raw lead data into ready-to-send pipeline.",
  keywords: [
    "B2B lead intelligence",
    "hyper-researched leads",
    "weekly outbound leads",
    "personalized cold outreach",
    "B2B prospect research",
    "sales intelligence service",
  ],
  path: "/",
  title: "Frithly | Weekly B2B Lead Intelligence for Outbound Teams",
});

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeSearchParams(
  searchParams: Record<string, string | string[] | undefined> | undefined,
) {
  const normalized = new URLSearchParams();

  if (!searchParams) {
    return normalized;
  }

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const firstValue = value[0];

      if (firstValue) {
        normalized.set(key, firstValue);
      }

      return;
    }

    if (value) {
      normalized.set(key, value);
    }
  });

  return normalized;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const normalizedSearchParams = normalizeSearchParams(resolvedSearchParams);

  if (
    normalizedSearchParams.has("code") ||
    normalizedSearchParams.has("token_hash") ||
    normalizedSearchParams.has("error_description") ||
    normalizedSearchParams.has("type")
  ) {
    const queryString = normalizedSearchParams.toString();
    redirect(queryString ? `/verify?${queryString}` : "/verify");
  }

  return (
    <main>
      <StructuredData data={buildOrganizationSchema()} />
      <StructuredData data={buildWebSiteSchema()} />
      <StructuredData
        data={buildWebPageSchema({
          description:
            "Frithly helps outbound teams turn raw lead data into weekly researched accounts, verified contacts, and ready-to-send outreach angles.",
          path: "/",
          title: "Frithly | Weekly B2B Lead Intelligence for Outbound Teams",
        })}
      />
      <StructuredData data={buildServiceSchema()} />
      <StructuredData data={buildFaqSchema(landingFaqs)} />
      <PageEvent
        name="landing_page_viewed"
        oncePerSessionKey="landing-page-viewed"
        properties={{ location: "home_page" }}
      />
      <Hero />
      <AnswerEngineSection />
      <Problem />
      <Comparison />
      <SampleLead />
      <HowItWorks />
      <ProofSection />
      <PricingSection />
      <Guarantees />
      <Faq />
      <FinalCta />
    </main>
  );
}
