import type { Metadata } from "next";
import { PageEvent } from "@/components/analytics/page-event";
import { platformFaqs } from "@/components/landing/platform-homepage-data";
import { PlatformHomepage } from "@/components/landing/platform-homepage";
import { StructuredData } from "@/components/seo/structured-data";
import {
  buildFaqSchema,
  buildOrganizationSchema,
  buildPublicMetadata,
  buildServiceSchema,
  buildSiteNavigationSchema,
  buildWebPageSchema,
  buildWebSiteSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description:
    "Frithly identifies buying signals, manually qualifies companies, verifies decision-makers, and delivers outbound-ready opportunities your team can act on immediately.",
  keywords: [
    "Frithly",
    "buying signals",
    "manual qualification",
    "decision maker verification",
    "outbound opportunities",
    "personalized outreach",
    "sales intelligence service",
  ],
  path: "/",
  title: "Frithly | Better Outbound Starts Before the First Email",
});

export default function HomePage() {
  return (
    <main>
      <StructuredData data={buildOrganizationSchema()} />
      <StructuredData data={buildWebSiteSchema()} />
      <StructuredData data={buildSiteNavigationSchema()} />
      <StructuredData
        data={buildWebPageSchema({
          description:
            "Frithly identifies buying signals, manually qualifies companies, verifies decision-makers, and delivers outbound-ready opportunities your team can act on immediately.",
          path: "/",
          title: "Frithly | Better Outbound Starts Before the First Email",
        })}
      />
      <StructuredData data={buildServiceSchema()} />
      <StructuredData data={buildFaqSchema(platformFaqs)} />
      <PageEvent
        name="landing_page_viewed"
        oncePerSessionKey="landing-page-viewed"
        properties={{ location: "home_page" }}
      />
      <PlatformHomepage />
    </main>
  );
}
