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

const termsDescription =
  "Terms of Service for Frithly covering subscriptions, guarantees, acceptable use, liability, and governing law.";

export const metadata: Metadata = buildPublicMetadata({
  description: termsDescription,
  keywords: ["Frithly terms", "terms of service", "subscription terms", "billing terms"],
  path: "/terms",
  title: `Terms of Service | ${APP_NAME}`,
});

export default function TermsPage() {
  return (
    <>
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Terms of Service", path: "/terms" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: termsDescription,
          path: "/terms",
          title: `Terms of Service | ${APP_NAME}`,
        })}
      />
      <LegalPage
        intro={
          <>
            <p>
              These Terms of Service govern access to the {APP_NAME} website, dashboard, lead
              research service, customer support, and related subscription offerings.
            </p>
            <p>
              These terms are suitable as a launch draft but should still be reviewed with counsel
              before enterprise contracting or large-scale production use.
            </p>
          </>
        }
        kicker="Terms"
        lastUpdated="28 April 2026"
        title="Terms of Service"
        sections={[
        {
          title: "Acceptance of these terms",
          body: (
            <>
              <p>
                By accessing or using {APP_NAME}, requesting a sample, creating an account, or
                purchasing a plan, you agree to these Terms. If you are using the service on behalf
                of a company, you represent that you have authority to bind that organization.
              </p>
            </>
          ),
        },
        {
          title: "Service description",
          body: (
            <>
              <p>
                {APP_NAME} provides B2B lead research, lead qualification support, signal analysis,
                and personalized outreach briefing services. Deliverables may include researched
                lead batches, verified contact details where available, trigger notes, and
                recommended opener angles.
              </p>
              <p>
                We may evolve the service over time, including refining workflows, delivery format,
                automation, and dashboard functionality, so long as the core service remains
                substantially consistent with the purchased plan.
              </p>
            </>
          ),
        },
        {
          title: "Eligibility and account access",
          body: (
            <>
              <p>
                You must provide accurate information when requesting a sample, creating an account,
                or purchasing a plan. You are responsible for maintaining the security of your login
                email and for all activity occurring through your account.
              </p>
              <p>
                We may suspend or restrict access if we reasonably believe an account is being used
                fraudulently, abusively, or in violation of these Terms.
              </p>
            </>
          ),
        },
        {
          title: "Subscriptions, billing, and renewals",
          body: (
            <>
              <p>
                Paid plans are subscription-based unless expressly stated otherwise. Subscriptions
                renew automatically on the billing cycle associated with the purchased plan unless
                cancelled before the next renewal date.
              </p>
              <p>
                Pricing, billing frequency, and included deliverables are shown on the plan
                selected at checkout. Taxes, foreign exchange charges, bank fees, or processor fees
                may apply depending on jurisdiction and payment method.
              </p>
              <p>
                We may use third-party payment processors to manage billing and invoices. By paying
                for the service, you authorize the applicable payment processor to charge the
                payment method you provide.
              </p>
            </>
          ),
        },
        {
          title: "Cancellation and changes",
          body: (
            <>
              <p>
                You may cancel your subscription before the next renewal cycle to avoid future
                charges. Unless required by law or expressly promised in writing, cancellation does
                not automatically create a prorated refund for the current paid period.
              </p>
              <p>
                We may change plan packaging, delivery operations, or pricing for future renewal
                periods by giving reasonable notice before the change takes effect.
              </p>
            </>
          ),
        },
        {
          title: "Guarantees and refunds",
          body: (
            <>
              <p>
                If we advertise a specific guarantee, such as a match-rate or service-quality
                guarantee, that guarantee applies only under the conditions stated at the time of
                sale. For Frithly, the intended launch guarantee is a 50% ICP match guarantee for
                qualifying subscriptions.
              </p>
              <p>
                Refund requests must be made in good faith and with enough information for us to
                review the relevant batch, ICP definition, and delivery history. We may deny refund
                requests where customer-side misuse, materially inaccurate ICP definitions, or other
                misuse of the service caused the issue.
              </p>
            </>
          ),
        },
        {
          title: "Acceptable use",
          body: (
            <>
              <p>You agree not to use {APP_NAME} to:</p>
              <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                <li>break the law or violate third-party rights</li>
                <li>send unlawful spam, phishing, or deceptive outreach</li>
                <li>harass, discriminate against, or target protected groups unlawfully</li>
                <li>scrape, reverse engineer, or copy the service beyond permitted use</li>
                <li>resell or redistribute deliverables in a way that competes with the service</li>
                <li>attempt unauthorized access to other customers, systems, or data</li>
                <li>upload malware, malicious code, or content designed to disrupt operations</li>
              </ul>
              <p>
                You remain responsible for how your team uses the leads, contact data, and outreach
                suggestions provided through the service.
              </p>
            </>
          ),
        },
        {
          title: "Customer responsibilities and compliance",
          body: (
            <>
              <p>
                You are responsible for reviewing all outreach before sending it, complying with
                applicable marketing, privacy, anti-spam, employment, and industry-specific laws,
                and deciding whether a lead is appropriate for your use case.
              </p>
              <p>
                {APP_NAME} is a research and workflow support product. We do not act as your legal
                advisor, compliance officer, or record of regulatory obligations.
              </p>
            </>
          ),
        },
        {
          title: "Intellectual property and deliverables",
          body: (
            <>
              <p>
                We retain ownership of the {APP_NAME} platform, software, prompts, systems,
                branding, and service methodology. You receive a limited, non-exclusive right to use
                the service and delivered outputs for your internal business purposes during your
                subscription term.
              </p>
              <p>
                You retain ownership of your own ICP inputs, feedback, internal notes, and other
                materials you provide to us.
              </p>
            </>
          ),
        },
        {
          title: "Confidentiality",
          body: (
            <>
              <p>
                Each party may receive non-public information from the other. Both parties agree to
                use confidential information only as needed to perform under these Terms and to use
                reasonable care to protect it from unauthorized disclosure.
              </p>
            </>
          ),
        },
        {
          title: "Service availability",
          body: (
            <>
              <p>
                We aim to provide a reliable service, but uptime is not guaranteed. The platform may
                be temporarily unavailable due to maintenance, provider outages, internet
                disruptions, or other events outside our reasonable control.
              </p>
            </>
          ),
        },
        {
          title: "Disclaimer of warranties",
          body: (
            <>
              <p>
                Except as expressly stated, the service is provided on an as-is and as-available
                basis. We do not guarantee a specific revenue result, reply rate, meeting volume, or
                pipeline outcome from using the service.
              </p>
            </>
          ),
        },
        {
          title: "Limitation of liability",
          body: (
            <>
              <p>
                To the fullest extent permitted by law, {APP_NAME} and its operators will not be
                liable for indirect, incidental, special, consequential, or punitive damages, or
                for lost profits, lost revenue, lost data, or business interruption arising from the
                use of the service.
              </p>
              <p>
                Our aggregate liability for any claim relating to the service will not exceed the
                amount you paid to us for the service during the 3 months immediately preceding the
                event giving rise to the claim.
              </p>
            </>
          ),
        },
        {
          title: "Suspension and termination",
          body: (
            <>
              <p>
                We may suspend or terminate access if you materially breach these Terms, use the
                service unlawfully, fail to pay amounts due, or create a security or reputational
                risk for the platform.
              </p>
              <p>
                You may stop using the service at any time, subject to your billing obligations for
                any active subscription term.
              </p>
            </>
          ),
        },
        {
          title: "Governing law",
          body: (
            <>
              <p>
                These Terms are intended to be governed by the laws selected by the operator of
                {APP_NAME}. Until the governing jurisdiction is finalized with counsel, disputes
                should first be raised directly with us in good faith at{" "}
                <a className="font-semibold text-terracotta" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </>
          ),
        },
        {
          title: "Changes to these terms",
          body: (
            <>
              <p>
                We may update these Terms from time to time. If we make material changes, we will
                update the effective date and may provide additional notice in the product or by
                email when appropriate.
              </p>
            </>
          ),
        },
        {
          title: "Contact",
          body: (
            <>
              <p>
                For contract, billing, or legal questions, email{" "}
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
                for information about how we collect and process data.
              </p>
            </>
          ),
        },
        ]}
      />
    </>
  );
}
