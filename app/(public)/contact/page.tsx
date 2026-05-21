import type { Metadata } from "next";
import Link from "next/link";
import { PageEvent } from "@/components/analytics/page-event";
import { SalesInquiryForm } from "@/components/landing/sales-inquiry-form";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { APP_NAME, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";
import {
  buildBreadcrumbSchema,
  buildContactPageSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description:
    "Contact Frithly for plan discussions, onboarding questions, and support. Share your details for a guided reply before any strategy call is scheduled.",
  keywords: [
    "Frithly contact",
    "contact Frithly",
    "Frithly support",
    "Frithly sales",
  ],
  path: "/contact",
  title: "Contact Frithly | Support and Sales",
});

export default function ContactPage() {
  return (
    <main className="bg-[radial-gradient(circle_at_top_left,_rgba(212,98,58,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(97,146,186,0.12),_transparent_28%),linear-gradient(180deg,#050c14_0%,#07111b_42%,#050d15_100%)] py-16 sm:py-20">
      <StructuredData
        data={buildWebPageSchema({
          description:
            "Contact Frithly for plan discussions, onboarding questions, and support. Share your details for a guided reply before any strategy call is scheduled.",
          path: "/contact",
          title: "Contact Frithly | Support and Sales",
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <StructuredData data={buildContactPageSchema()} />
      <PageEvent
        name="landing_page_viewed"
        oncePerSessionKey="contact-page-viewed"
        properties={{ location: "contact_page" }}
      />

      <Container className="space-y-10 sm:space-y-14">
        <section className="space-y-6">
          <span className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-terracotta shadow-sm">
            Contact us
          </span>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-[-0.04em] text-ink sm:text-6xl">
              Contact {APP_NAME} for sales, support, and company details.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted sm:text-xl">
              If you want to discuss rollout fit, onboarding, or need help with Frithly, use the
              options below and we will guide you to the right next step.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.9rem] border border-white/10 bg-[#0b1520]/90 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
              Best for
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">
                  Sales and plan questions
                </h2>
                <p className="mt-2 max-w-xl text-base leading-8 text-muted">
                  Use this page when you want to talk through plan fit, onboarding, outbound goals,
                  or how Frithly can support your workflow.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">
                  Support and account help
                </h2>
                <p className="mt-2 max-w-xl text-base leading-8 text-muted">
                  If you need account help, rollout clarification, or a fast support response,
                  email us directly and we will take it from there.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.9rem] border border-white/10 bg-[#0b1520]/90 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
              Reach us
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">
                  Email support
                </h2>
                <a
                  className="mt-2 inline-block text-base font-medium text-terracotta transition-colors hover:text-accentDark"
                  href={`mailto:${SUPPORT_EMAIL}`}
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">
                  Sales conversations
                </h2>
                <p className="mt-2 text-base leading-8 text-muted">
                  Use Apply when you want Frithly to review your brief first, or book a meeting
                  directly if you already know you want to talk live about plans, onboarding, or
                  rollout fit.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild size="lg">
                  <Link href={ROUTES.APPLY}>Apply</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href={ROUTES.BOOK_MEETING}>Book a meeting</Link>
                </Button>
              </div>
            </div>
          </article>
        </section>

        <section
          id="sales-form"
          className="rounded-[1.9rem] border border-white/10 bg-[#0b1520]/90 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-8"
        >
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
              Sales details
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-ink">
              Tell us about your team before we reply.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-muted">
              This gives us enough context to recommend the right plan, campaign path, or
              onboarding next step without guesswork.
            </p>
          </div>

          <SalesInquiryForm />
        </section>
      </Container>
    </main>
  );
}
