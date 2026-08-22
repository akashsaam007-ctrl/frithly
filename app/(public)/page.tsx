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

const HOME_DESCRIPTION =
  "We find the moment a company is ready to buy, verify the person who can say yes, and deliver a briefing your team can send the same day. Every Tuesday, nothing older than twenty days.";
const HOME_TITLE = "Frithly | Signal-Qualified Outbound Research";

export const metadata: Metadata = buildPublicMetadata({
  description: HOME_DESCRIPTION,
  keywords: [
    "Frithly",
    "signal-qualified outbound",
    "buying signals",
    "outbound research service",
    "decision maker verification",
    "sales trigger research",
    "outbound briefings",
  ],
  path: "/",
  title: HOME_TITLE,
});

export default function HomePage() {
  return (
    <main>
      <StructuredData data={buildOrganizationSchema()} />
      <StructuredData data={buildWebSiteSchema()} />
      <StructuredData data={buildSiteNavigationSchema()} />
      <StructuredData
        data={buildWebPageSchema({
          description: HOME_DESCRIPTION,
          path: "/",
          title: HOME_TITLE,
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
