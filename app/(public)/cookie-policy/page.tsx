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

const cookieDescription =
  "Cookie Policy for Frithly covering essential cookies, analytics preferences, consent, and cookie controls.";

export const metadata: Metadata = buildPublicMetadata({
  description: cookieDescription,
  keywords: ["Frithly cookie policy", "cookies", "tracking preferences", "consent management"],
  path: "/cookie-policy",
  title: `Cookie Policy | ${APP_NAME}`,
});

export default function CookiePolicyPage() {
  return (
    <>
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Cookie Policy", path: "/cookie-policy" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: cookieDescription,
          path: "/cookie-policy",
          title: `Cookie Policy | ${APP_NAME}`,
        })}
      />
      <LegalPage
        intro={
          <>
            <p>
              This Cookie Policy explains how {APP_NAME} uses cookies, local storage, and similar
              technologies across the website, customer dashboard, and supporting service flows.
            </p>
            <p>
              It is written for Frithly&apos;s operational delivery model, where secure sessions,
              account access, and workflow continuity matter to the service experience.
            </p>
          </>
        }
        kicker="Cookies"
        lastUpdated="24 May 2026"
        title="Cookie Policy"
        sections={[
          {
            title: "What this policy covers",
            body: (
              <>
                <p>
                  Cookies are small text files placed on your browser or device. We may also use
                  local storage and similar technologies to support authentication, preferences,
                  and performance.
                </p>
              </>
            ),
          },
          {
            title: "Essential cookies",
            body: (
              <>
                <p>These are used to run the core product and cannot be disabled without affecting core functionality.</p>
                <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                  <li>session and authentication state</li>
                  <li>security protections and fraud prevention</li>
                  <li>basic site routing and account continuity</li>
                  <li>cookie consent or preference storage</li>
                </ul>
              </>
            ),
          },
          {
            title: "Functionality and preference storage",
            body: (
              <>
                <p>
                  We may store interface preferences, operational settings, or workflow state so
                  the site behaves more consistently across sessions.
                </p>
              </>
            ),
          },
          {
            title: "Analytics and diagnostics",
            body: (
              <>
                <p>
                  If analytics, diagnostics, or product monitoring are enabled, we may use cookies
                  or similar storage to understand aggregate usage, identify performance issues, and
                  improve the product.
                </p>
                <p>
                  Where required by law, optional analytics or tracking will only be enabled after
                  valid consent.
                </p>
              </>
            ),
          },
          {
            title: "Marketing cookies",
            body: (
              <>
                <p>
                  {APP_NAME} is not built around aggressive ad-tech workflows. If marketing or
                  remarketing cookies are ever introduced, we will update this policy and request
                  consent where required before enabling them.
                </p>
              </>
            ),
          },
          {
            title: "How you can manage cookies",
            body: (
              <>
                <p>
                  You can manage cookies through our consent controls when shown, or through your
                  browser settings. Blocking essential cookies may affect login, account security,
                  and parts of the dashboard.
                </p>
              </>
            ),
          },
          {
            title: "Third-party technologies",
            body: (
              <>
                <p>
                  Some service providers may place or read cookies when delivering infrastructure,
                  email, security, analytics, or embedded services on our behalf.
                </p>
              </>
            ),
          },
          {
            title: "Contact",
            body: (
              <>
                <p>
                  For cookie or tracking questions, contact{" "}
                  <a className="font-semibold text-terracotta" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
                <p>
                  You can also review our{" "}
                  <Link className="font-semibold text-terracotta" href={ROUTES.PRIVACY}>
                    Privacy Policy
                  </Link>{" "}
                  for broader details on how we process data.
                </p>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
