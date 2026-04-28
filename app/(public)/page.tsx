import type { Metadata } from "next";
import { PageEvent } from "@/components/analytics/page-event";
import { Comparison } from "@/components/landing/comparison";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Guarantees } from "@/components/landing/guarantees";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingSection } from "@/components/landing/pricing";
import { Problem } from "@/components/landing/problem";
import { SampleLead } from "@/components/landing/sample-lead";
import { META } from "@/lib/constants";

export const metadata: Metadata = {
  description:
    "Get 50 hyper-researched B2B leads with personalized opening lines delivered to your inbox every Monday. Apollo gives you data. We deliver intelligence.",
  openGraph: {
    description:
      "Get 50 hyper-researched B2B leads with personalized opening lines delivered to your inbox every Monday.",
    images: [
      {
        height: 630,
        url: "https://frithly.com/og-image.png",
        width: 1200,
      },
    ],
    locale: "en_GB",
    siteName: "Frithly",
    title: META.TITLE,
    type: "website",
    url: "https://frithly.com",
  },
  robots: {
    follow: true,
    index: true,
  },
  title: META.TITLE,
  twitter: {
    card: "summary_large_image",
    description:
      "Get 50 hyper-researched B2B leads with personalized opening lines delivered to your inbox every Monday.",
    images: ["https://frithly.com/og-image.png"],
    title: META.TITLE,
  },
};

export default function HomePage() {
  return (
    <main>
      <PageEvent
        name="landing_page_viewed"
        oncePerSessionKey="landing-page-viewed"
        properties={{ location: "home_page" }}
      />
      <Hero />
      <Problem />
      <Comparison />
      <SampleLead />
      <HowItWorks />
      <PricingSection />
      <Guarantees />
      <Faq />
      <FinalCta />
    </main>
  );
}
