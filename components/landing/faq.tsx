import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";

const faqs = [
  {
    answer:
      "Apollo and ZoomInfo give you raw contact data — names, titles, emails. We give you researched intelligence — names, titles, emails, plus the context, signals, and personalized openers your team needs to actually book meetings. We're the layer that goes ON TOP of those tools, or replaces them entirely for outbound-focused teams.",
    question: "How is this different from Apollo or ZoomInfo?",
  },
  {
    answer:
      "We use a combination of LinkedIn Sales Navigator, public company sources, news APIs, and our own AI research agents. Every email is verified before delivery via Apollo or Hunter. We do not use scraped, breached, or purchased databases.",
    question: "Where do you get the data?",
  },
  {
    answer:
      "Yes. We only use publicly available business contact data, under legitimate interest. We provide unsubscribe-ready data for sequences. Compliance on the SEND side is your responsibility — we'll guide you on best practices and provide a sample compliant outreach template on request.",
    question: "Are the emails GDPR/CAN-SPAM compliant?",
  },
  {
    answer:
      "Yes. Your ICP isn't fixed. We refine it together every two weeks based on what's working in your replies. Most customers tweak their ICP 2-3 times in the first 90 days as they learn what converts.",
    question: "Can I change my ICP after signing up?",
  },
  {
    answer:
      "We'll help you build one on the onboarding call. Most of our best customers came in with a fuzzy idea (\"B2B founders, I think?\") and left the call with a sharp profile that drives 3-4x reply rates.",
    question: "What if I don't have a defined ICP yet?",
  },
  {
    answer:
      "First leads land within 7 days of signup. Most teams book their first meeting from our leads within 14 days. Strong reply rates kick in around week 3 once you've A/B tested different opener angles.",
    question: "How long until I see results?",
  },
  {
    answer:
      "No. We make your existing SDRs 5x more effective. They get to focus on what they're paid for — having conversations and booking meetings — instead of researching. Think of us as the research department they don't have to hire.",
    question: "Do you replace my SDRs?",
  },
  {
    answer:
      "B2B teams selling to other businesses. Strong fits: SaaS, agencies, consulting, recruitment, financial services, professional services, B2B services. Weaker fits: pure B2C, e-commerce, retail, education-only.",
    question: "What industries do you work best with?",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-20">
      <Container width="narrow" className="space-y-10">
        <div className="text-center">
          <h2>Common questions</h2>
        </div>

        <div className="rounded-2xl border border-border bg-white px-6">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border-b border-border py-1 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-semibold text-ink marker:hidden">
                {faq.question}
                <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 group-open:grid-rows-[1fr]">
                <div className="overflow-hidden">
                  <p className="pb-5 text-muted">{faq.answer}</p>
                </div>
              </div>
            </details>
          ))}

          <details className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-semibold text-ink marker:hidden">
              Can I see a sample first?
              <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 group-open:grid-rows-[1fr]">
              <div className="overflow-hidden pb-5 text-muted">
                <p>
                  Yes — get a free 5-lead sample researched against your specific ICP within 48
                  hours.{" "}
                  <Link href={ROUTES.SAMPLE} className="font-semibold text-terracotta underline underline-offset-4">
                    Link to /sample
                  </Link>
                </p>
              </div>
            </div>
          </details>
        </div>
      </Container>
    </section>
  );
}
