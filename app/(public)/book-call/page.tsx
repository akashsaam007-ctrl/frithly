import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Mono, Inter } from "next/font/google";
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

const headlineFont = Inter({
  subsets: ["latin"],
  variable: "--font-frithly-booking-headline",
  weight: ["500", "600", "700", "800"],
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
  const calendlyEmbedUrl = `${BOOKING_URL}?hide_gdpr_banner=1&primary_color=c9b7ff`;

  return (
    <main className="relative isolate overflow-hidden bg-[#050505] text-white">
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

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(244,194,139,0.07),transparent_22%),radial-gradient(circle_at_78%_12%,rgba(201,183,255,0.1),transparent_20%),linear-gradient(180deg,#050505_0%,#090909_52%,#050505_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:168px_168px] opacity-[0.06]" />

      <section className="relative py-14 sm:py-20 lg:py-24">
        <Container className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.12fr)] lg:items-start">
          <div className="space-y-7 lg:sticky lg:top-28">
            <div
              className={cn(
                monoFont.className,
                "inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/74",
              )}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)] blur-[6px]" />
                <span className="relative rounded-full bg-white/85" />
              </span>
              1 on 1 booking
            </div>

            <div
              className={cn(
                headlineFont.className,
                "max-w-[9ch] text-[3.3rem] font-semibold leading-[0.9] tracking-[-0.075em] text-white sm:text-[4.8rem] lg:text-[5.4rem]",
              )}
            >
              Book a 1 on 1 call.
            </div>

            <p className="max-w-xl text-[1.04rem] leading-8 text-white/68 sm:text-[1.1rem]">
              We&apos;ll review your outbound motion, target market, and where signal-based
              opportunities could create cleaner conversations before your team sends another
              email.
            </p>

            <div className="space-y-3">
              {callOutcomes.map((outcome) => (
                <div className="flex items-start gap-3 text-sm leading-7 text-white/72" key={outcome}>
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#d8c9ff]" aria-hidden="true" />
                  <span>{outcome}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[1.25rem] border border-white/[0.07] bg-white/[0.025] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <div className="flex items-center gap-3 text-white">
                <div className="rounded-[0.9rem] border border-white/[0.08] bg-white/[0.03] p-2.5">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="font-semibold">30-minute Frithly review</div>
              </div>
              <p className="mt-4 text-sm leading-7 text-white/58">
                Prefer to send context first? Request a sample and we&apos;ll prepare the account view
                before the call.
              </p>
              <Button
                asChild
                className="mt-5 w-full border-transparent bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)] text-[#050505] hover:brightness-[1.03] hover:text-[#050505]"
                size="lg"
              >
                <Link href={ROUTES.SAMPLE}>Request Sample</Link>
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.018))] p-2 shadow-[0_34px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_center,rgba(201,183,255,0.13),transparent_72%)] blur-3xl" />
            <iframe
              className="relative h-[720px] w-full rounded-[1.35rem] bg-white sm:h-[760px] lg:h-[780px]"
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
