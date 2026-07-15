import type { Metadata } from "next";
import { PageEvent } from "@/components/analytics/page-event";
import { SampleRequestForm } from "@/components/landing/sample-request-form";
import { StructuredData } from "@/components/seo/structured-data";
import { Container } from "@/components/ui/container";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

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
    <main className="relative isolate overflow-hidden bg-[#050505] py-5 text-white sm:py-12 lg:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(241,181,64,0.08),transparent_38%),linear-gradient(180deg,#050505_0%,#060606_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:176px_176px] opacity-[0.04]" />
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
              <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#f1b540] sm:mb-4 sm:text-[0.75rem]">
                Personalized Sample
              </p>
              <h1 className="max-w-[480px] text-[2.35rem] font-semibold leading-[0.96] tracking-[-0.05em] text-[#f7f7f7] sm:text-[2.6rem] lg:text-[3rem]">
                Request your personalized
                <br />
                lead sample
              </h1>
              <p className="mt-4 max-w-[470px] text-[0.96rem] leading-[1.65] text-[#a3a3a3] sm:mt-5 sm:text-[1.0625rem] sm:leading-[1.75]">
                Tell us what you sell and who you want to reach. Our research team will prepare a
                small set of manually reviewed, signal-based leads and walk you through the
                targeting logic during a short video call.
              </p>

              <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-3.5">
                {deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.96rem] text-[#d4d4d4]">
                    <span className="mt-[0.14rem] inline-flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full border border-[#f1b540]/30 bg-[#f1b540]/10 text-[#f1b540]">
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

              <div className="mt-6 max-w-[470px] border-l-2 border-[#f1b540]/85 pl-4 text-[0.8rem] leading-6 text-[#737373] sm:mt-7 sm:text-[0.82rem]">
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
            <h2 className="text-[1.9rem] font-semibold tracking-[-0.04em] text-[#f7f7f7] sm:text-[2.4rem]">
              What happens next
            </h2>
            <p className="mt-3 text-[0.98rem] leading-7 text-[#a3a3a3] sm:text-[1.02rem]">
              From request to reviewed sample in three simple steps.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {nextSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-[0.9rem] border border-white/[0.08] bg-white/[0.025] p-6"
              >
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#f1b540]">
                  {step.number}
                </p>
                <h3 className="mt-4 text-[1.1rem] font-semibold text-[#f3f3f3]">{step.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-7 text-[#a3a3a3]">{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
