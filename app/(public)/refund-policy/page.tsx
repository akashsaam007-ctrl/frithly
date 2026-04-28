import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/shared/legal-page";
import { APP_NAME, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  description:
    "Refund Policy for Frithly covering the 50% ICP match guarantee, cancellations, and billing dispute handling.",
  title: `Refund Policy | ${APP_NAME}`,
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      intro={
        <>
          <p>
            This Refund Policy explains when Frithly may issue refunds for subscription charges and
            how customers can request a review of a delivered batch.
          </p>
          <p>
            This page is intended to support launch and payment-provider verification. It should be
            reviewed with legal counsel before high-volume production use.
          </p>
        </>
      }
      kicker="Refunds"
      lastUpdated="28 April 2026"
      title="Refund Policy"
      sections={[
        {
          title: "How Frithly charges for the service",
          body: (
            <>
              <p>
                Frithly is sold as a recurring subscription service. Charges apply at the start of
                each billing cycle unless the subscription is cancelled before renewal.
              </p>
              <p>
                Because the service includes ongoing research, briefing preparation, and delivery
                work that begins shortly after onboarding, refunds are limited to the situations
                described on this page or otherwise required by law.
              </p>
            </>
          ),
        },
        {
          title: "50% ICP match guarantee",
          body: (
            <>
              <p>
                For qualifying paid subscriptions, Frithly&apos;s launch offer includes a 50% ICP
                match guarantee. If fewer than half of the delivered leads reasonably match the ICP
                definition agreed during onboarding, you may request a review of that billing
                period.
              </p>
              <p>
                If we confirm that the delivered batch fell below that threshold, we may issue a
                full or partial refund for the affected period or provide another fair remedy, such
                as a replacement batch, at our discretion.
              </p>
            </>
          ),
        },
        {
          title: "When refunds may be denied",
          body: (
            <>
              <p>We may decline a refund request if the issue was caused by:</p>
              <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                <li>an ICP definition that was incomplete, inaccurate, or materially changed after delivery</li>
                <li>customer-side misuse of the leads, dashboard, or outreach material</li>
                <li>failure to provide enough information for us to evaluate the request fairly</li>
                <li>requests made in bad faith, including abusive or fraudulent charge disputes</li>
              </ul>
            </>
          ),
        },
        {
          title: "Cancellations and future billing",
          body: (
            <>
              <p>
                You may cancel your subscription at any time before the next renewal date to stop
                future charges. Cancelling prevents the next renewal, but it does not automatically
                create a prorated refund for the current paid period unless required by law or
                expressly agreed in writing.
              </p>
            </>
          ),
        },
        {
          title: "How to request a refund review",
          body: (
            <>
              <p>
                To request a refund review, email{" "}
                <a className="font-semibold text-terracotta" href={`mailto:${SUPPORT_EMAIL}`}>
                  {SUPPORT_EMAIL}
                </a>{" "}
                with:
              </p>
              <ul className="list-disc space-y-2 pl-5 text-base md:text-lg">
                <li>your account email and company name</li>
                <li>the billing period or delivered batch you want reviewed</li>
                <li>specific examples showing why the leads did not match your agreed ICP</li>
                <li>any supporting notes that would help us evaluate the issue quickly</li>
              </ul>
              <p>
                We review requests in good faith and aim to respond within a reasonable business
                timeframe.
              </p>
            </>
          ),
        },
        {
          title: "Chargebacks and payment disputes",
          body: (
            <>
              <p>
                If you believe you were charged in error, please contact us before initiating a
                chargeback so we can investigate and try to resolve the issue directly. Unwarranted
                chargebacks may result in suspension of service while the dispute is being reviewed.
              </p>
            </>
          ),
        },
        {
          title: "Related policies",
          body: (
            <>
              <p>
                This Refund Policy should be read together with our{" "}
                <Link className="font-semibold text-terracotta" href={ROUTES.TERMS}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link className="font-semibold text-terracotta" href={ROUTES.PRIVACY}>
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
