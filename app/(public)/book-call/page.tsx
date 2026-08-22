import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { PageEvent } from "@/components/analytics/page-event";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BOOKING_URL, ROUTES } from "@/lib/constants";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";
import { cn } from "@/lib/utils";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-frithly-booking-headline",
  weight: ["500", "600", "700", "800"],
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-frithly-booking-display",
  weight: ["500", "600", "700"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const bookingDescription =
  "Book a 1 on 1 Frithly call to review your outbound motion, ICP, buying signals, and sample opportunity fit.";

export const metadata: Metadata = buildPublicMetadata({
  description: bookingDescription,
  keywords: [
    "Frithly booking",
    "book outbound strategy call",
    "outbound intelligence review",
    "buying signal strategy call",
    "Frithly 1 on 1 call",
  ],
  path: "/book-call",
  title: "Book a 1 on 1 Call | Frithly",
});

const callOutcomes = [
  "Map where your current outbound motion is wasting effort.",
  "Review the buying signals and accounts Frithly would prioritize first.",
  "Decide whether a sample opportunity or pilot makes sense for your team.",
] as const;

export default function BookCallPage() {
  const calendlyEmbedUrl = `${BOOKING_URL}?hide_gdpr_banner=1&primary_color=b6abe8`;

  return (
    <main
      className={cn(
        bodyFont.className,
        "relative isolate overflow-hidden bg-[#0c0e11] text-[#f3f1ea]",
      )}
    >
      <StructuredData
        data={buildWebPageSchema({
          description: bookingDescription,
          path: "/book-call",
          title: "Book a 1 on 1 Call | Frithly",
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Book a 1 on 1 Call", path: "/book-call" },
        ])}
      />
      <PageEvent
        name="book_call_page_viewed"
        oncePerSessionKey="book-call-page-viewed"
        properties={{ location: "book_call_page" }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(231,166,214,0.11),transparent_26%),radial-gradient(circle_at_80%_14%,rgba(182,171,232,0.1),transparent_24%),linear-gradient(180deg,#0c0e11_0%,#090a0c_52%,#0c0e11_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(243,241,234,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(243,241,234,0.018)_1px,transparent_1px)] bg-[size:160px_160px] opacity-[0.05]" />

      <section className="relative py-16 sm:py-24 lg:py-28">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.12fr)] lg:items-start">
          <div className="space-y-7 lg:sticky lg:top-28">
            <div
              className={cn(
                monoFont.className,
                "inline-flex items-center gap-2.5 rounded-[3px] border border-[#262b31] bg-[#14171b]/70 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-[#9ba1a8]",
              )}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] blur-[6px]" />
                <span className="relative rounded-full bg-white/85" />
              </span>
              1 on 1 booking
            </div>

            <div
              className={cn(
                displayFont.className,
                "max-w-[9ch] text-[3.3rem] font-semibold leading-[0.9] tracking-[-0.075em] text-[#f3f1ea] sm:text-[4.8rem] lg:text-[5.4rem]",
              )}
            >
              Book a 1 on 1 call.
            </div>

            <p className="max-w-xl text-[1.04rem] leading-8 text-[#9ba1a8] sm:text-[1.1rem]">
              We&apos;ll review your outbound motion, target market, and where signal-based
              opportunities could create cleaner conversations before your team sends another
              email.
            </p>

            <div className="space-y-3">
              {callOutcomes.map((outcome) => (
                <div className="flex items-start gap-3 text-sm leading-7 text-[#c8ccd1]" key={outcome}>
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#c9b7ff]" aria-hidden="true" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[6px] border border-[#262b31] bg-[#14171b]/78 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl">
              <div className="flex items-center gap-3 text-[#f3f1ea]">
                <div className="rounded-[3px] border border-[#262b31] bg-[#1b1f24] p-2.5">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="font-semibold">30-minute Frithly review</div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#9ba1a8]">
                Prefer to send context first? Request a sample and we&apos;ll prepare the account view
                before the call.
              </p>
              <Button
                asChild
                className="mt-5 w-full rounded-[3px] border-transparent bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] text-[#0c0e11] hover:brightness-[1.03] hover:text-[#0c0e11]"
                size="lg"
              >
                <Link href={ROUTES.BRIEFING}>Request a free briefing</Link>
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b]/76 p-2 shadow-[0_34px_100px_rgba(0,0,0,0.42)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_center,rgba(231,166,214,0.12),transparent_72%)] blur-3xl" />
            <iframe
              className="relative h-[720px] w-full rounded-[4px] bg-white sm:h-[760px] lg:h-[780px]"
              loading="lazy"
              src={calendlyEmbedUrl}
              title="Book a Frithly 1 on 1 call"
            />
          </div>
        </Container>
      </section>
    </main>
  );
}
