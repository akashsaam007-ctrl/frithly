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

const gdprDescription =
  "GDPR Policy for Frithly covering lawful bases, data subject rights, international transfers, and how privacy requests are handled.";

export const metadata: Metadata = buildPublicMetadata({
  description: gdprDescription,
  keywords: ["Frithly GDPR policy", "GDPR rights", "data subject rights", "international transfers"],
  path: "/gdpr",
  title: `GDPR Policy | ${APP_NAME}`,
});

export default function GdprPage() {
  return (
    <>
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "GDPR Policy", path: "/gdpr" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: gdprDescription,
          path: "/gdpr",
          title: `GDPR Policy | ${APP_NAME}`,
        })}
      />
      <LegalPage
        intro={
          <>
            <p>
              This GDPR Policy explains how {APP_NAME} approaches UK GDPR and EU GDPR
              responsibilities when handling website visitor data, customer account data, and
              outbound intelligence workflow information.
            </p>
            <p>
              It is written specifically for Frithly&apos;s premium outbound intelligence model,
              including signal-based workflows, founder-aware targeting, and operational delivery
              support.
            </p>
          </>
        }
        kicker="Data protection"
        lastUpdated="24 May 2026"
        title="GDPR Policy"
        sections={[
          {
            title: "Scope of this policy",
            body: (
              <>
                <p>
                  This policy applies where UK GDPR, EU GDPR, or similar data protection laws apply
                  to personal data processed by {APP_NAME}. It should be read alongside our{" "}
                  <Link className="font-semibold text-[#d8c9ff]" href={ROUTES.PRIVACY}>
                    Privacy Policy
                  </Link>
                  .
                </p>
              </>
            ),
          },
          {
            title: "How Frithly operates in practice",
            body: (
              <>
                <p>
                  {APP_NAME} provides researched outbound opportunities, contact-path context,
                  signal interpretation, and delivery workflows for B2B teams.
                </p>
                <p>
                  In doing so, we may act as a controller for website, account, billing, and
                  support data, and we may process customer-configured workflow information as part
                  of delivering the contracted service.
                </p>
              </>
            ),
          },
          {
            title: "Categories of personal data",
            body: (
              <>
                <p>Depending on the workflow, we may process:</p>
                <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                  <li>customer account and billing contact details</li>
                  <li>support, onboarding, and service-delivery communications</li>
                  <li>website analytics and session-level technical data where enabled</li>
                  <li>work-related prospect data used in B2B research and targeting workflows</li>
                  <li>customer feedback, filtering preferences, and delivery notes</li>
                </ul>
              </>
            ),
          },
          {
            title: "Lawful bases for processing",
            body: (
              <>
                <p>We usually rely on one or more of the following lawful bases:</p>
                <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                  <li>contract performance for onboarding, delivery, billing, and account support</li>
                  <li>legitimate interests for service operations, security, B2B research quality, and product improvement</li>
                  <li>consent where required for optional cookies or optional communications</li>
                  <li>legal obligation for tax, accounting, fraud prevention, and compliance retention</li>
                </ul>
              </>
            ),
          },
          {
            title: "International transfers",
            body: (
              <>
                <p>
                  Some of our infrastructure and service providers may process data outside the UK
                  or EEA. Where required, we rely on contractual safeguards, provider commitments,
                  and transfer mechanisms designed to support lawful cross-border processing.
                </p>
              </>
            ),
          },
          {
            title: "Retention",
            body: (
              <>
                <p>
                  We keep personal data only for as long as reasonably necessary to deliver the
                  service, maintain security, respond to legal obligations, resolve disputes, and
                  preserve legitimate business records.
                </p>
              </>
            ),
          },
          {
            title: "Your GDPR rights",
            body: (
              <>
                <p>If GDPR applies to you, you may have the right to:</p>
                <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                  <li>request access to the personal data we hold about you</li>
                  <li>request correction of inaccurate or incomplete data</li>
                  <li>request erasure where retention is no longer justified</li>
                  <li>object to certain processing based on legitimate interests</li>
                  <li>request restriction of processing in some circumstances</li>
                  <li>request portability of personal data you provided to us</li>
                  <li>withdraw consent where consent is the relevant legal basis</li>
                  <li>complain to your local supervisory authority</li>
                </ul>
              </>
            ),
          },
          {
            title: "How to exercise your rights",
            body: (
              <>
                <p>
                  To make a privacy or data-subject request, email{" "}
                  <a className="font-semibold text-[#d8c9ff]" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>{" "}
                  with enough detail for us to verify the request and respond appropriately.
                </p>
                <p>
                  If your request relates to customer-configured workflows or customer-provided data,
                  we may need to coordinate with the relevant customer before completing the request.
                </p>
              </>
            ),
          },
          {
            title: "Related policies",
            body: (
              <>
                <p>
                  For more detail on cookies and general privacy practices, see our{" "}
                  <Link className="font-semibold text-[#d8c9ff]" href={ROUTES.COOKIE_POLICY}>
                    Cookie Policy
                  </Link>{" "}
                  and{" "}
                  <Link className="font-semibold text-[#d8c9ff]" href={ROUTES.PRIVACY}>
                    Privacy Policy
                  </Link>
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
