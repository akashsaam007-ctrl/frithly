import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";

export const landingFaqs = [
  {
    answer:
      "Apollo and ZoomInfo give you raw data access. Frithly gives your team a finished weekly brief with timing context, trigger signals, and outreach angles already attached.",
    question: "How is this different from Apollo or ZoomInfo?",
  },
  {
    answer:
      "We combine Sales Navigator, public company sources, news signals, and our own research agents. Every delivered contact is verified before it lands in the brief.",
    question: "Where does the research come from?",
  },
  {
    answer:
      "Yes. ICP refinement is part of the service. Most customers sharpen targeting two or three times in the first quarter as real reply data comes in.",
    question: "Can we change our ICP after signing up?",
  },
  {
    answer:
      "If your ICP is still fuzzy, we help shape it on the onboarding call. That is common, especially for early-stage teams that know the pain point but not the exact buying profile yet.",
    question: "What if we do not have a sharp ICP yet?",
  },
  {
    answer:
      "First leads typically land within 7 days of signup. Teams usually start learning what messaging angle works within the first two to three weeks.",
    question: "How fast do we see output?",
  },
  {
    answer:
      "No. Frithly makes your existing SDRs and founders more effective by taking research and targeting prep off their plate.",
    question: "Does this replace SDRs?",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-16 sm:py-20 lg:py-24">
      <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="space-y-5">
          <div className="section-eyebrow">Questions from serious buyers</div>
          <h2 className="section-title">Everything teams ask before they trust us with pipeline.</h2>
          <p className="section-copy max-w-xl">
            We built the FAQ around the real concerns we hear from founders, heads of sales, and
            operators comparing Frithly to generic lead data products.
          </p>
        </div>

        <div className="surface-card overflow-hidden px-4 sm:px-6">
          {landingFaqs.map((faq) => (
            <details key={faq.question} className="group border-b border-border/70 py-1 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-left text-base font-semibold text-ink marker:hidden md:text-lg">
                {faq.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
                <div className="overflow-hidden">
                  <p className="pb-6 text-sm leading-7 text-muted md:text-base">{faq.answer}</p>
                </div>
              </div>
            </details>
          ))}

          <details className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-left text-base font-semibold text-ink marker:hidden md:text-lg">
              Can I see a sample first?
              <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
              <div className="overflow-hidden pb-6 text-sm leading-7 text-muted md:text-base">
                Yes. Request a tailored five-lead sample against your ICP on{" "}
                <Link
                  href={ROUTES.SAMPLE}
                  className="font-semibold text-terracotta underline underline-offset-4"
                >
                  the sample page
                </Link>
                .
              </div>
            </div>
          </details>
        </div>
      </Container>
    </section>
  );
}
