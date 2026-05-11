import type { Metadata } from "next";
import { PageEvent } from "@/components/analytics/page-event";
import { IcpDemoExperience } from "@/components/landing/icp-demo-experience";
import { StructuredData } from "@/components/seo/structured-data";
import { Container } from "@/components/ui/container";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

const demoDescription =
  "Preview how Frithly turns an ICP into selective discovery, reviewed opportunity scoring, SMTP-safe cohort formation, and weekly outbound delivery.";

export const metadata: Metadata = buildPublicMetadata({
  description: demoDescription,
  keywords: [
    "outbound intelligence demo",
    "interactive ICP demo",
    "curated outbound demo",
    "weekly opportunity delivery demo",
    "Frithly demo",
  ],
  path: "/demo",
  title: "Outbound Intelligence Demo | Frithly",
});

export default function DemoPage() {
  return (
    <main className="py-16 sm:py-20 lg:py-20">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Outbound Intelligence Demo", path: "/demo" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: demoDescription,
          path: "/demo",
          title: "Outbound Intelligence Demo | Frithly",
        })}
      />
      <PageEvent
        name="icp_demo_viewed"
        oncePerSessionKey="icp-demo-viewed"
        properties={{ location: "demo_page" }}
      />

      <Container className="space-y-10">
        <div className="max-w-3xl space-y-5">
          <div className="section-eyebrow">Interactive campaign demo</div>
          <h1>See how a selective outbound campaign gets built before a single email is sent.</h1>
          <p className="max-w-2xl text-muted">
            This walkthrough simulates Frithly&apos;s discovery, enrichment, recommendation,
            contactability, and cohort logic using curated scenarios based on the production
            workflow. It is intentionally fast, but it behaves like the real system thinks.
          </p>
        </div>

        <IcpDemoExperience />
      </Container>
    </main>
  );
}
