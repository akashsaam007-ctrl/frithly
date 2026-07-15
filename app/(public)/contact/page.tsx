import type { Metadata } from "next";
import Link from "next/link";
import { PageEvent } from "@/components/analytics/page-event";
import { SalesInquiryForm } from "@/components/landing/sales-inquiry-form";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES, SUPPORT_EMAIL } from "@/lib/constants";
import {
  buildBreadcrumbSchema,
  buildContactPageSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description:
    "Contact Frithly for sample requests, strategy calls, rollout fit, or support.",
  keywords: [
    "Frithly contact",
    "Frithly sample request",
    "Frithly strategy call",
    "Frithly support",
  ],
  path: "/contact",
  title: "Contact Frithly | Sample Requests and Support",
});

export default function ContactPage() {
  const gradientButtonClassName =
    "border-transparent bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)] text-[#050505] shadow-[0_18px_52px_rgba(201,183,255,0.18)] hover:brightness-[1.03] hover:text-[#050505]";
  const darkButtonClassName =
    "border-white/[0.08] bg-white/[0.03] text-white shadow-[0_18px_46px_rgba(0,0,0,0.22)] hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white";

  return (
    <main className="relative isolate overflow-hidden bg-[#050505] py-16 text-white sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,194,139,0.06),transparent_18%),radial-gradient(circle_at_78%_12%,rgba(201,183,255,0.08),transparent_18%),radial-gradient(circle_at_54%_76%,rgba(232,167,215,0.05),transparent_24%),linear-gradient(180deg,#050505_0%,#090909_42%,#111111_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:176px_176px] opacity-[0.05]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(5,5,5,0.98),rgba(5,5,5,0))]" />
      <StructuredData
        data={buildWebPageSchema({
          description:
            "Contact Frithly for sample requests, strategy calls, rollout fit, or support.",
          path: "/contact",
          title: "Contact Frithly | Sample Requests and Support",
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

      <Container className="relative space-y-10 sm:space-y-14">
        <section className="space-y-7">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-white/74">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)] blur-[6px]" />
              <span className="relative rounded-full bg-white/85" />
            </span>
            Contact Frithly
          </span>
          <div className="space-y-4">
            <h1 className="max-w-5xl text-balance text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl lg:text-7xl">
              Talk through fit, get a sample, or book the right next step.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-white/68 sm:text-xl">
              If you want to see how Frithly qualifies opportunities, request a sample, book a
              strategy call, or ask support questions, this page routes you to the right path.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.9rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/44">
              Best for
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
                  Strategy and rollout questions
                </h2>
                <p className="mt-2 max-w-xl text-base leading-8 text-white/64">
                  Use this page when you want to talk through ICP fit, rollout timing, outbound
                  goals, or how Frithly should plug into your workflow.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
                  Support and account help
                </h2>
                <p className="mt-2 max-w-xl text-base leading-8 text-white/64">
                  If you need account help, sample clarification, or a fast support response,
                  email us directly and we will take it from there.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.9rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/44">
              Reach us
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
                  Email support
                </h2>
                <a
                  className="mt-2 inline-block text-base font-medium text-white transition-colors hover:text-white/72"
                  href={`mailto:${SUPPORT_EMAIL}`}
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
                  The two fastest paths
                </h2>
                <p className="mt-2 text-base leading-8 text-white/64">
                  Request a sample if you want to inspect how Frithly qualifies an opportunity, or
                  book a strategy call if you already know you want to talk live.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild size="lg" className={gradientButtonClassName}>
                  <Link href={ROUTES.SAMPLE}>Request sample</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className={darkButtonClassName}>
                  <Link href={ROUTES.BOOK_MEETING}>Book strategy call</Link>
                </Button>
              </div>
            </div>
          </article>
        </section>

        <section
          id="sales-form"
          className="rounded-[1.9rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] p-7 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-8"
        >
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/44">
              Request details
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-white">
              Tell us about your team before we reply.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-white/64">
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
