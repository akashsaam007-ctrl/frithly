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

const acceptableUseDescription =
  "Acceptable Use Policy for Frithly covering lawful outreach, platform abuse, customer responsibilities, and misuse of delivered intelligence.";

export const metadata: Metadata = buildPublicMetadata({
  description: acceptableUseDescription,
  keywords: ["Frithly acceptable use policy", "acceptable use", "lawful outreach", "platform misuse"],
  path: "/acceptable-use-policy",
  title: `Acceptable Use Policy | ${APP_NAME}`,
});

export default function AcceptableUsePolicyPage() {
  return (
    <>
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Acceptable Use Policy", path: "/acceptable-use-policy" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: acceptableUseDescription,
          path: "/acceptable-use-policy",
          title: `Acceptable Use Policy | ${APP_NAME}`,
        })}
      />
      <LegalPage
        intro={
          <>
            <p>
              This Acceptable Use Policy explains the standards that apply when customers,
              visitors, or teams use {APP_NAME}, request samples, or use delivered outbound
              intelligence inside their own sales process.
            </p>
            <p>
              Frithly is designed for selective, higher-quality outbound. That means misuse of the
              platform, the research, or the delivered contacts is not permitted.
            </p>
          </>
        }
        kicker="Acceptable use"
        lastUpdated="24 May 2026"
        title="Acceptable Use Policy"
        sections={[
          {
            title: "Purpose of this policy",
            body: (
              <>
                <p>
                  This policy supplements our{" "}
                  <Link className="font-semibold text-[#d8c9ff]" href={ROUTES.TERMS}>
                    Terms of Service
                  </Link>{" "}
                  and helps protect customers, prospects, systems, and Frithly&apos;s operating
                  integrity.
                </p>
              </>
            ),
          },
          {
            title: "Lawful and fair use",
            body: (
              <>
                <p>You may not use {APP_NAME} or its outputs to:</p>
                <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                  <li>break the law or violate third-party rights</li>
                  <li>send unlawful spam, phishing, or deceptive outreach</li>
                  <li>target protected groups unlawfully or in discriminatory ways</li>
                  <li>misrepresent who you are, your company, or the purpose of your communication</li>
                </ul>
              </>
            ),
          },
          {
            title: "Outreach and compliance responsibilities",
            body: (
              <>
                <p>
                  You remain responsible for the outreach you send, the claims you make, and the
                  laws that apply to your market. Frithly provides research, signal interpretation,
                  and routing context, but does not act as your legal or compliance function.
                </p>
              </>
            ),
          },
          {
            title: "Platform and security misuse",
            body: (
              <>
                <p>You may not:</p>
                <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                  <li>attempt unauthorized access to systems, accounts, APIs, or data</li>
                  <li>upload malicious code, destructive content, or security test payloads without permission</li>
                  <li>interfere with the service, crawl it abusively, or reverse engineer protected workflows</li>
                  <li>use automation in a way that degrades stability, reliability, or deliverability quality</li>
                </ul>
              </>
            ),
          },
          {
            title: "Misuse of delivered intelligence",
            body: (
              <>
                <p>
                  You may not resell Frithly deliverables as a competing data product, redistribute
                  them in bulk for unauthorized third-party use, or present them as raw verified
                  facts without your own review.
                </p>
              </>
            ),
          },
          {
            title: "Content and input restrictions",
            body: (
              <>
                <p>
                  Customer inputs, notes, and prompts must not include illegal content, malware,
                  exploit code, or content that exists primarily to harass, defame, or abuse
                  individuals or organizations.
                </p>
              </>
            ),
          },
          {
            title: "Enforcement",
            body: (
              <>
                <p>
                  We may suspend access, limit functionality, remove content, deny refunds, or
                  terminate service if we reasonably believe this policy has been violated.
                </p>
              </>
            ),
          },
          {
            title: "Report concerns",
            body: (
              <>
                <p>
                  If you believe someone is misusing {APP_NAME}, contact{" "}
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
