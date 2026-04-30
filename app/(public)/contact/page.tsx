import type { Metadata } from "next";
import Link from "next/link";
import { PageEvent } from "@/components/analytics/page-event";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  APP_NAME,
  BUSINESS_ADDRESS,
  CALCOM_URL,
  ROUTES,
  SUPPORT_EMAIL,
} from "@/lib/constants";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  description:
    "Contact Frithly for plan discussions, sample requests, and business information. View our operating and registered address, support email, and sales booking link.",
  keywords: [
    "Frithly contact",
    "Frithly address",
    "contact Frithly",
    "Frithly registered address",
    "Frithly operating address",
  ],
  path: "/contact",
  title: "Contact Frithly | Address, Support, and Sales",
});

export default function ContactPage() {
  return (
    <main className="bg-[radial-gradient(circle_at_top_left,_rgba(212,98,58,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(141,216,207,0.18),_transparent_28%),#faf8f5] py-16 sm:py-20">
      <StructuredData
        data={buildWebPageSchema({
          description:
            "Contact Frithly for plan discussions, sample requests, and business information. View our operating and registered address, support email, and sales booking link.",
          path: "/contact",
          title: "Contact Frithly | Address, Support, and Sales",
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      <PageEvent
        name="landing_page_viewed"
        oncePerSessionKey="contact-page-viewed"
        properties={{ location: "contact_page" }}
      />

      <Container className="space-y-10 sm:space-y-14">
        <section className="space-y-6">
          <span className="inline-flex rounded-full border border-border bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-terracotta shadow-sm">
            Contact us
          </span>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-balance text-5xl font-semibold tracking-[-0.04em] text-ink sm:text-6xl">
              Contact {APP_NAME} for sales, support, and company details.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted sm:text-xl">
              If you want to discuss plans, request a sample, or need our registered business
              details, you can use the information below.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.9rem] border border-border/80 bg-white/90 p-7 shadow-[0_18px_50px_rgba(26,26,26,0.06)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
              Business address
            </p>
            <div className="mt-5 space-y-6">
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">
                  Registered address
                </h2>
                <p className="mt-2 max-w-xl text-base leading-8 text-muted">
                  {BUSINESS_ADDRESS}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-ink">
                  Operating address
                </h2>
                <p className="mt-2 max-w-xl text-base leading-8 text-muted">
                  {BUSINESS_ADDRESS}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.9rem] border border-border/80 bg-white/90 p-7 shadow-[0_18px_50px_rgba(26,26,26,0.06)]">
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
                  Book a short conversation if you want to discuss plans, onboarding, or whether
                  Frithly fits your outbound workflow.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild size="lg">
                  <Link href={CALCOM_URL}>Talk to sales</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href={ROUTES.SAMPLE}>Get a free sample</Link>
                </Button>
              </div>
            </div>
          </article>
        </section>
      </Container>
    </main>
  );
}
