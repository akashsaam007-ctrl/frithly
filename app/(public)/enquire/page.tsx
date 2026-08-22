import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { PageEvent } from "@/components/analytics/page-event";
import { isEnquiryPlan, SalesInquiryForm } from "@/components/landing/sales-inquiry-form";
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
  variable: "--font-frithly-enquire-display",
  weight: ["500", "600", "700"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-frithly-enquire-body",
  weight: ["400", "500", "600"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const pageTitle = "Enquire About a Retainer | Frithly";
const pageDescription =
  "Tell us about your market and which plan you are considering. Every enquiry is read and answered by the person who does the research.";

const promises = [
  "Answered within one working day, by me — not a sequence.",
  "An honest read on whether your market produces enough live signal.",
  "A free sample briefing built for your ICP if it looks like a fit.",
  "No follow-up sequence aimed at you if it doesn't.",
];

export const metadata: Metadata = buildPublicMetadata({
  description: pageDescription,
  keywords: [
    "Frithly enquiry",
    "outbound research retainer",
    "signal-qualified briefings pricing",
    "Frithly plans",
  ],
  path: "/enquire",
  title: pageTitle,
});

export default async function EnquirePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const selectedPlan = isEnquiryPlan(plan) ? plan : undefined;

  return (
    <main
      className={cn(
        bodyFont.className,
        "relative isolate overflow-hidden bg-[#0c0e11] py-8 text-[#f3f1ea] sm:py-14 lg:py-20",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(231,166,214,0.11),transparent_34%),radial-gradient(circle_at_18%_18%,rgba(243,181,131,0.08),transparent_28%)]" />
      <StructuredData
        data={buildWebPageSchema({
          description: pageDescription,
          path: "/enquire",
          title: pageTitle,
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Enquire", path: "/enquire" },
        ])}
      />
      <PageEvent
        name="enquiry_page_viewed"
        oncePerSessionKey="enquiry-page-viewed"
        properties={{ location: "enquiry_page", plan: selectedPlan ?? "none" }}
      />

      <Container className="relative max-w-[1180px] px-5 sm:px-8">
        <div className="grid gap-10 py-6 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-14 lg:py-10">
          <div>
            <p
              className={cn(
                monoFont.className,
                "mb-4 inline-flex rounded-[3px] border border-[#262b31] bg-[#14171b] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9ba1a8]",
              )}
            >
              Enquiry
            </p>
            <h1
              className={cn(
                displayFont.className,
                "max-w-[13ch] text-[34px] font-semibold leading-[1.06] tracking-[-0.02em] text-[#f3f1ea] sm:text-[44px]",
              )}
            >
              Tell me about your market.
            </h1>
            <p className="mt-5 max-w-[440px] text-[16px] leading-[1.7] text-[#9ba1a8]">
              Capacity stops at four engagements, so this is a real conversation rather than a
              queue. The details below let me answer with something useful instead of a calendar
              link.
            </p>

            <ul className="mt-8 space-y-3">
              {promises.map((item) => (
                <li className="flex items-start gap-3 text-[15px] leading-[1.6] text-[#c8ccd1]" key={item}>
                  <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#4bc996]/50 text-[10px] text-[#4bc996]">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[6px] border border-[#262b31] bg-[#14171b]/74 p-5 shadow-[0_18px_58px_rgba(0,0,0,0.28)] sm:p-7">
            <SalesInquiryForm plan={selectedPlan} />
          </div>
        </div>
      </Container>
    </main>
  );
}
