import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/seo/structured-data";
import { LegalPage } from "@/components/shared/legal-page";
import { APP_NAME, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

const disclaimerDescription =
  "Disclaimer for Frithly covering no guaranteed results, signal interpretation limits, contact-data limitations, and customer compliance responsibility.";

export const metadata: Metadata = buildPublicMetadata({
  description: disclaimerDescription,
  keywords: ["Frithly disclaimer", "no guaranteed results", "signal interpretation", "contact data disclaimer"],
  path: "/disclaimer",
  title: `Disclaimer | ${APP_NAME}`,
});

export default function DisclaimerPage() {
  return (
    <>
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Disclaimer", path: "/disclaimer" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: disclaimerDescription,
          path: "/disclaimer",
          title: `Disclaimer | ${APP_NAME}`,
        })}
      />
      <LegalPage
        intro={
          <>
            <p>
              This Disclaimer explains important limits around Frithly&apos;s research, signal
              interpretation, contact-path recommendations, and strategic outbound assessments.
            </p>
            <p>
              Frithly is designed to improve targeting quality and timing clarity. It does not
              remove the need for customer review, compliance checks, or commercial judgment.
            </p>
          </>
        }
        kicker="Disclaimer"
        lastUpdated="24 May 2026"
        title="Disclaimer"
        sections={[
          {
            title: "No guaranteed commercial outcome",
            body: (
              <>
                <p>
                  {APP_NAME} does not guarantee a specific number of replies, meetings, qualified
                  opportunities, closed deals, or revenue outcomes. Outbound performance depends on
                  many factors beyond the research brief, including offer quality, copy, brand
                  reputation, market conditions, and execution quality.
                </p>
              </>
            ),
          },
          {
            title: "Signals are directional, not promises",
            body: (
              <>
                <p>
                  Hiring activity, content freshness, leadership visibility, pricing changes, and
                  other signals are used as directional indicators. They help prioritize accounts,
                  but they should not be treated as guaranteed proof of purchase intent.
                </p>
              </>
            ),
          },
          {
            title: "Contact data and deliverability limits",
            body: (
              <>
                <p>
                  Contact routes, emails, and deliverability notes are surfaced using research,
                  pattern logic, public information, and workflow review. They may change over time,
                  may become outdated, and should still be reviewed before use in live outreach.
                </p>
              </>
            ),
          },
          {
            title: "Customer review remains essential",
            body: (
              <>
                <p>
                  Customers are responsible for reviewing lead quality, message content, outreach
                  timing, compliance risk, and internal sales fit before acting on Frithly outputs.
                </p>
              </>
            ),
          },
          {
            title: "No legal, financial, or regulatory advice",
            body: (
              <>
                <p>
                  {APP_NAME} is not a law firm, compliance advisor, or financial advisor. Nothing
                  on the site, in the dashboard, or in a delivered brief should be treated as legal,
                  tax, regulatory, employment, or financial advice.
                </p>
              </>
            ),
          },
          {
            title: "Assessments and examples are illustrative",
            body: (
              <>
                <p>
                  Strategic outbound assessments, examples, sample briefs, and process-proof
                  artifacts are provided to explain how Frithly thinks and filters. They are
                  illustrative and should not be treated as guaranteed customer outcomes.
                </p>
              </>
            ),
          },
          {
            title: "Third-party content and availability",
            body: (
              <>
                <p>
                  Frithly may rely on third-party infrastructure, public websites, directories,
                  contact sources, and other providers. Availability, formatting, access, and data
                  quality may change without notice.
                </p>
              </>
            ),
          },
          {
            title: "Related policies",
            body: (
              <>
                <p>
                  This Disclaimer should be read together with our{" "}
                  <Link className="font-semibold text-[#d8c9ff]" href={ROUTES.TERMS}>
                    Terms of Service
                  </Link>
                  ,{" "}
                  <Link className="font-semibold text-[#d8c9ff]" href={ROUTES.PRIVACY}>
                    Privacy Policy
                  </Link>
                  , and{" "}
                  <Link className="font-semibold text-[#d8c9ff]" href={ROUTES.ACCEPTABLE_USE_POLICY}>
                    Acceptable Use Policy
                  </Link>
                  .
                </p>
              </>
            ),
          },
          {
            title: "Contact",
            body: (
              <>
                <p>
                  For questions about this Disclaimer, email{" "}
                  <a className="font-semibold text-[#d8c9ff]" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
