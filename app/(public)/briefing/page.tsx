import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { PageEvent } from "@/components/analytics/page-event";
import { BriefingRequestForm } from "@/components/landing/briefing-request-form";
import { StructuredData } from "@/components/seo/structured-data";
import { Container } from "@/components/ui/container";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";
import { cn } from "@/lib/utils";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-frithly-briefing-display",
  weight: ["500", "600", "700"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-frithly-briefing-body",
  weight: ["400", "500", "600"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const pageTitle = "Request a Free Briefing | Frithly";
const pageDescription =
  "One company in your market with a live buying signal, a verified decision-maker and outreach written to the trigger. Free, no call required.";

const included = [
  "One company with a live trigger, under twenty days old",
  "The decision-maker named and confirmed in role",
  "Inbox and direct line, both tested on the day",
  "A four-email sequence written to that trigger",
];

export const metadata: Metadata = buildPublicMetadata({
  description: pageDescription,
  keywords: [
    "free lead briefing",
    "signal-qualified sample",
    "outbound research sample",
    "Frithly briefing request",
  ],
  path: "/briefing",
  title: pageTitle,
});

export default function BriefingPage() {
  return (
    <main
      className={cn(
        bodyFont.className,
        "relative isolate overflow-hidden bg-[#0c0e11] py-6 text-[#f3f1ea] sm:py-14 lg:py-20",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(231,166,214,0.11),transparent_34%),radial-gradient(circle_at_18%_18%,rgba(243,181,131,0.08),transparent_28%)]" />
      <StructuredData
        data={buildWebPageSchema({
          description: pageDescription,
          path: "/briefing",
          title: pageTitle,
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Free briefing", path: "/briefing" },
        ])}
      />
      <PageEvent
        name="briefing_page_viewed"
        oncePerSessionKey="briefing-page-viewed"
        properties={{ location: "briefing_page" }}
      />

      <Container className="relative max-w-[1180px] px-5 sm:px-8">
        <div className="grid gap-8 py-4 sm:gap-10 sm:py-6 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-14 lg:py-10">
          <div>
            <p
              className={cn(
                monoFont.className,
                "mb-3 inline-flex rounded-[3px] border border-[#262b31] bg-[#14171b] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9ba1a8] sm:mb-4 sm:text-[11px] sm:tracking-[0.16em]",
              )}
            >
              Free briefing
            </p>
            <h1
              className={cn(
                displayFont.className,
                "max-w-[14ch] text-[27px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#f3f1ea] sm:text-[44px]",
              )}
            >
              One briefing on your own market.
            </h1>
            <p className="mt-4 max-w-[440px] text-[14.5px] leading-[1.65] text-[#9ba1a8] sm:mt-5 sm:text-[16px] sm:leading-[1.7]">
              Built the same way a paid one is, so you can judge the work rather than the pitch. If
              it isn&apos;t obviously better than the lists you&apos;re buying now, that&apos;s a
              useful answer too.
            </p>

            <ul className="mt-6 space-y-2.5 sm:mt-8 sm:space-y-3">
              {included.map((item) => (
                <li className="flex items-start gap-3 text-[14px] leading-[1.55] text-[#c8ccd1] sm:text-[15px] sm:leading-[1.6]" key={item}>
                  <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#4bc996]/50 text-[10px] text-[#4bc996]">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-l border-[#262b31] pl-4 text-[12.5px] leading-[1.6] text-[#9ba1a8] sm:mt-8 sm:text-[13px] sm:leading-6">
              The more precisely you describe who you sell to, the more useful the briefing is. Two
              sentences beats a paragraph of adjectives.
            </div>
          </div>

          <div className="rounded-[6px] border border-[#262b31] bg-[#14171b]/74 p-4 shadow-[0_18px_58px_rgba(0,0,0,0.28)] sm:p-7">
            <BriefingRequestForm />
          </div>
        </div>
      </Container>
    </main>
  );
}
