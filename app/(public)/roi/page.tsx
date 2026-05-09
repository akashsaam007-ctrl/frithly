import type { Metadata } from "next";
import { PageEvent } from "@/components/analytics/page-event";
import { RoiCalculatorExperience } from "@/components/landing/roi-calculator-experience";
import { StructuredData } from "@/components/seo/structured-data";
import { Container } from "@/components/ui/container";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

const roiDescription =
  "Model how stronger opportunity quality can turn the same outbound volume into more replies, meetings, and revenue opportunity.";

export const metadata: Metadata = buildPublicMetadata({
  description: roiDescription,
  keywords: [
    "outbound ROI calculator",
    "lead generation ROI calculator",
    "pipeline opportunity calculator",
    "outbound revenue model",
    "Frithly ROI calculator",
  ],
  path: "/roi",
  title: "ROI Calculator | Frithly",
});

export default function RoiPage() {
  return (
    <main className="py-16 sm:py-20 lg:py-20">
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "ROI Calculator", path: "/roi" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: roiDescription,
          path: "/roi",
          title: "ROI Calculator | Frithly",
        })}
      />
      <PageEvent
        name="roi_calculator_viewed"
        oncePerSessionKey="roi-calculator-viewed"
        properties={{ location: "roi_page" }}
      />

      <Container className="space-y-10">
        <div className="max-w-3xl space-y-5">
          <div className="section-eyebrow">Opportunity modeling</div>
          <h1>See what better outbound opportunity quality could be worth before you ever scale volume.</h1>
          <p className="max-w-2xl text-muted">
            This calculator translates a stronger recommendation pipeline into expected replies,
            meetings, client wins, and revenue opportunity. It is directional by design, but it keeps
            the commercial question front and center.
          </p>
        </div>

        <RoiCalculatorExperience />
      </Container>
    </main>
  );
}
