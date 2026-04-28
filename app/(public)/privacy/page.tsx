import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";
import { APP_NAME, APP_TAGLINE, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  description:
    "Privacy policy for Frithly, including data collection, processors, retention, GDPR rights, CCPA rights, and cookie usage.",
  title: `Privacy Policy | ${APP_NAME}`,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      intro={
        <>
          <p>
            This Privacy Policy explains how {APP_NAME} collects, uses, stores, and protects
            information when prospects, customers, and site visitors use our website, request a
            sample, purchase a subscription, or interact with our team.
          </p>
          <p>
            This page is written to be publishable for launch, but it should still be reviewed by
            your legal advisor before you accept large-scale production traffic or regulated
            customer contracts.
          </p>
        </>
      }
      kicker="Privacy"
      lastUpdated="28 April 2026"
      title="Privacy Policy"
      sections={[
        {
          title: "Who we are",
          body: (
            <>
              <p>
                {APP_NAME} provides B2B lead research, signal analysis, and personalized outbound
                briefing services. Our service helps teams receive researched lead batches with
                context and opener suggestions instead of raw contact lists.
              </p>
              <p>
                For privacy requests, data-access requests, or deletion requests, contact{" "}
                <a className="font-semibold text-terracotta" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </>
          ),
        },
        {
          title: "What data we collect",
          body: (
            <>
              <p>Depending on how you interact with {APP_NAME}, we may collect:</p>
              <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                <li>Identity and contact details such as name, work email address, and company name.</li>
                <li>
                  Account information such as login events, subscription plan, billing status, and
                  customer identifiers.
                </li>
                <li>
                  ICP and product information such as target titles, industries, geographies,
                  exclusions, signals, product description, and brand voice preferences.
                </li>
                <li>
                  Lead-delivery interactions such as feedback, opener preferences, and comments
                  submitted inside the dashboard.
                </li>
                <li>
                  Payment metadata and invoices from our payment providers. We do not store full
                  card numbers in our application database.
                </li>
                <li>
                  Technical information such as IP address, browser type, device information,
                  approximate location, cookie preferences, and basic usage analytics when
                  analytics are enabled.
                </li>
                <li>
                  Communications such as support emails, onboarding notes, and sample request
                  details.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "How we use your data",
          body: (
            <>
              <p>We use collected information to:</p>
              <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                <li>deliver {APP_TAGLINE}</li>
                <li>create, personalize, and refine customer lead batches</li>
                <li>operate login, account access, and account security</li>
                <li>process subscriptions, billing events, and payment support</li>
                <li>send service emails, product updates, and support responses</li>
                <li>monitor product quality, troubleshoot issues, and prevent abuse</li>
                <li>measure product performance and improve the site experience</li>
                <li>comply with legal, tax, contractual, and regulatory obligations</li>
              </ul>
            </>
          ),
        },
        {
          id: "legal-basis",
          title: "Legal bases for processing",
          body: (
            <>
              <p>
                Where GDPR or similar laws apply, we typically rely on contract performance,
                legitimate interests, consent, and legal obligation as our processing bases.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                <li>
                  Contract: when we provide the core service, account access, onboarding, billing,
                  and support.
                </li>
                <li>
                  Legitimate interests: when we secure the service, improve product quality, manage
                  B2B prospecting workflows, and maintain operational records.
                </li>
                <li>
                  Consent: when required for optional cookies, marketing communications, or other
                  voluntary preferences.
                </li>
                <li>
                  Legal obligation: when we retain records for tax, accounting, fraud prevention,
                  or compliance requirements.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Third-party processors",
          body: (
            <>
              <p>We use carefully selected providers to operate {APP_NAME}. These may include:</p>
              <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                <li>Supabase for authentication, storage, and database infrastructure.</li>
                <li>Paddle or other approved payment processors for billing and subscription events.</li>
                <li>Resend for transactional email delivery.</li>
                <li>Anthropic or other approved AI providers for research and personalization workflows.</li>
                <li>Hosting, monitoring, analytics, and infrastructure providers required to run the app.</li>
              </ul>
              <p>
                These providers process data on our behalf under their own contractual and security
                obligations.
              </p>
            </>
          ),
        },
        {
          title: "How we share data",
          body: (
            <>
              <p>
                We do not sell your personal information for cash. We may share data only when
                needed to deliver the product, comply with law, protect rights, or complete a
                business transfer such as a merger, acquisition, or asset sale.
              </p>
              <p>
                Customer-provided ICP information and feedback are used internally to improve that
                customer&apos;s service and are not intentionally exposed to other customers.
              </p>
            </>
          ),
        },
        {
          id: "gdpr",
          title: "GDPR rights for UK and EU users",
          body: (
            <>
              <p>If you are located in the UK or EEA, you may have the right to:</p>
              <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                <li>request access to the personal data we hold about you</li>
                <li>request correction of inaccurate or incomplete information</li>
                <li>request deletion of data when retention is no longer necessary</li>
                <li>object to certain processing based on legitimate interests</li>
                <li>request restriction of processing in some circumstances</li>
                <li>request portability of data you provided to us</li>
                <li>withdraw consent where consent is the legal basis</li>
                <li>lodge a complaint with your local supervisory authority</li>
              </ul>
              <p>
                To exercise these rights, email{" "}
                <a className="font-semibold text-terracotta" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </>
          ),
        },
        {
          id: "ccpa",
          title: "CCPA and US state privacy rights",
          body: (
            <>
              <p>
                Residents of California and other US states with privacy laws may have rights to
                know what information we collect, request deletion, correct inaccuracies, and
                limit or object to certain forms of processing where applicable.
              </p>
              <p>
                We do not knowingly sell personal information for monetary consideration. If local
                law grants you additional rights, contact{" "}
                <a className="font-semibold text-terracotta" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>{" "}
                and we will review your request in line with applicable law.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies and similar technologies",
          body: (
            <>
              <p>
                We use essential cookies and local storage to keep sessions active, remember cookie
                preferences, and support secure product functionality. If we enable analytics,
                advertising, or other optional tracking, we will request consent where required.
              </p>
              <p>
                You can manage your preference through the site banner when available or by
                adjusting your browser settings. Refusing optional cookies may reduce certain
                convenience features, but core account access will still function.
              </p>
            </>
          ),
        },
        {
          title: "Data retention",
          body: (
            <>
              <p>
                We keep information only as long as necessary for service delivery, security,
                legal compliance, dispute resolution, and legitimate business records.
              </p>
              <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                <li>Customer account and billing records may be retained for tax and accounting obligations.</li>
                <li>ICP settings, lead feedback, and service activity may be retained while an account is active.</li>
                <li>Support and operational logs may be retained for security and troubleshooting.</li>
                <li>
                  We may delete or anonymize data sooner when it is no longer needed or when we
                  receive a valid deletion request that overrides our retention obligations.
                </li>
              </ul>
            </>
          ),
        },
        {
          title: "Security",
          body: (
            <>
              <p>
                We use commercially reasonable technical and organizational safeguards to protect
                personal information, including access controls, hosted infrastructure protections,
                and authentication mechanisms. No system can guarantee absolute security, so you
                should also protect your account access and notify us if you suspect misuse.
              </p>
            </>
          ),
        },
        {
          title: "International transfers",
          body: (
            <>
              <p>
                Depending on where you are located and which vendors are involved, your data may be
                processed in countries outside your home jurisdiction. When required, we rely on
                contractual safeguards and provider commitments designed to support lawful transfer
                mechanisms.
              </p>
            </>
          ),
        },
        {
          title: "Children",
          body: (
            <>
              <p>
                {APP_NAME} is intended for business users and is not directed to children. We do
                not knowingly collect personal data from children under the age required by
                applicable law. If you believe a child has provided information to us, contact us
                so we can investigate and remove it if appropriate.
              </p>
            </>
          ),
        },
        {
          title: "Changes to this policy",
          body: (
            <>
              <p>
                We may update this Privacy Policy from time to time as our service, vendors, or
                legal obligations change. When we make material updates, we will revise the
                effective date above and may provide additional notice through the product or by
                email where appropriate.
              </p>
            </>
          ),
        },
        {
          title: "Contact us",
          body: (
            <>
              <p>
                For privacy or data protection questions, email{" "}
                <a className="font-semibold text-terracotta" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
              <p>
                You can also review our{" "}
                <Link className="font-semibold text-terracotta" href={ROUTES.TERMS}>
                  Terms of Service
                </Link>{" "}
                for subscription and service terms.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
