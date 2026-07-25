import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { PageEvent } from "@/components/analytics/page-event";
import { SampleRequestForm } from "@/components/landing/sample-request-form";
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
  variable: "--font-frithly-sample-display",
  weight: ["500", "600", "700"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-frithly-sample-body",
  weight: ["400", "500", "600", "700"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const pageTitle = "Request Your Personalized Lead Sample | Frithly";
const pageDescription =
  "Request a Frithly personalized lead sample, define your target market, and book a short video review once the request is submitted.";

const deliverables = [
  "Companies matched to your ICP",
  "Relevant decision-maker roles",
  "Recent why-now signals",
  "A video walkthrough of the sample",
];

const nextSteps = [
  {
    description:
      "Tell us what you sell, who you want to reach, and which markets matter.",
    number: "01",
    title: "Share your targeting",
  },
  {
    description:
      "Our team identifies relevant companies, verifies recent signals, and manually reviews every account.",
    number: "02",
    title: "We research the sample",
  },
  {
    description:
      "We walk you through why each company was selected and how the full campaign would work.",
    number: "03",
    title: "Review it together",
  },
] as const;

export const metadata: Metadata = buildPublicMetadata({
  description: pageDescription,
  keywords: [
    "Frithly sample request",
    "personalized lead sample",
    "manual outbound research",
    "signal-based leads",
    "Frithly video review",
  ],
  path: "/sample",
  title: pageTitle,
});

export default function SamplePage() {
  return (
    <main
      className={cn(
        bodyFont.className,
        "relative isolate overflow-hidden bg-[#0c0e11] py-8 text-[#f3f1ea] sm:py-14 lg:py-20",
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(231,166,214,0.11),transparent_34%),radial-gradient(circle_at_18%_18%,rgba(243,181,131,0.08),transparent_28%),linear-gradient(180deg,#0c0e11_0%,#090a0c_48%,#0c0e11_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(243,241,234,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(243,241,234,0.018)_1px,transparent_1px)] bg-[size:160px_160px] opacity-[0.045]" />
      <StructuredData
        data={buildWebPageSchema({
          description: pageDescription,
          path: "/sample",
          title: pageTitle,
        })}
      />
      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Sample", path: "/sample" },
        ])}
      />
      <PageEvent
        name="sample_page_viewed"
        oncePerSessionKey="sample-page-viewed"
        properties={{ location: "sample_page", source: "website_sample_request" }}
      />

      <Container className="relative">
        <section className="mx-auto max-w-[1200px] px-4 pt-3 pb-11 sm:px-8 sm:pt-4 sm:pb-14 lg:px-0 lg:pt-4 lg:pb-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-14">
            <div className="pt-2 lg:pt-14">
              <p
                className={cn(
                  monoFont.className,
                  "mb-3 inline-flex rounded-[3px] border border-[#262b31] bg-[#14171b]/72 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#9ba1a8] sm:mb-4 sm:text-[0.75rem]",
                )}
              >
                Personalized Sample
              </p>
              <h1
                className={cn(
                  displayFont.className,
                  "max-w-[480px] text-[2.35rem] font-semibold leading-[0.96] tracking-[-0.06em] text-[#f3f1ea] sm:text-[2.8rem] lg:text-[3.35rem]",
                )}
              >
                Request your personalized
                <br />
                opportunity sample
              </h1>
              <p className="mt-4 max-w-[470px] text-[0.96rem] leading-[1.7] text-[#9ba1a8] sm:mt-5 sm:text-[1.0625rem] sm:leading-[1.75]">
                Tell us what you sell and who you want to reach. Our research team will prepare a
                small set of manually reviewed, signal-based opportunities and walk you through the
                targeting logic during a short video call.
              </p>

              <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-3.5">
                {deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.96rem] text-[#c8ccd1]">
                    <span className="mt-[0.14rem] inline-flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-[3px] border border-[#262b31] bg-[#14171b] text-[#f3f1ea] shadow-[0_0_22px_rgba(231,166,214,0.12)]">
                      <svg
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.25"
                      >
                        <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 max-w-[470px] border-l border-[#262b31] pl-4 text-[0.8rem] leading-6 text-[#9ba1a8] sm:mt-7 sm:text-[0.82rem]">
                No generic database export. Every sample is reviewed manually before the call.
              </div>
            </div>

            <div>
              <SampleRequestForm />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-4 pb-12 sm:px-8 lg:px-0 lg:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className={cn(
                displayFont.className,
                "text-[1.9rem] font-semibold tracking-[-0.05em] text-[#f3f1ea] sm:text-[2.4rem]",
              )}
            >
              What happens next
            </h2>
            <p className="mt-3 text-[0.98rem] leading-7 text-[#9ba1a8] sm:text-[1.02rem]">
              From request to reviewed sample in three simple steps.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {nextSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-[6px] border border-[#262b31] bg-[#14171b]/74 p-6 shadow-[0_18px_58px_rgba(0,0,0,0.28)]"
              >
                <p className={cn(monoFont.className, "text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#f3f1ea]")}>
                  {step.number}
                </p>
                <h3 className="mt-4 text-[1.1rem] font-semibold text-[#f3f1ea]">{step.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-7 text-[#9ba1a8]">{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
