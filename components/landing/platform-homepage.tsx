"use client";

import Link from "next/link";
import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { platformFaqs } from "@/components/landing/platform-homepage-data";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-frithly-display",
  weight: ["600", "700"],
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-frithly-body",
  weight: ["400", "500", "600"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const primaryButtonClassName =
  "rounded-[3px] border-0 bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] px-5 text-[#241522] shadow-none hover:brightness-[1.08] hover:text-[#241522] focus-visible:ring-[#e7a6d6]";

const ghostButtonClassName =
  "rounded-[3px] border border-[#262b31] bg-transparent px-5 text-[#f3f1ea] shadow-none hover:border-[#9ba1a8] hover:bg-transparent hover:text-[#f3f1ea] focus-visible:ring-[#e7a6d6]";

const tagItems = ["Signal-driven", "Manually verified", "Personalized, not templated"] as const;

const terminalRows = [
  { company: "Northbeam", contact: "Sales Director verified", signal: "SDR_HIRING", time: "08m ago" },
  { company: "VantaFlow", contact: "VP Sales verified", signal: "FUNDING_EVENT", time: "21m ago" },
  { company: "OrbitOps", contact: "Founder verified", signal: "PRODUCT_LAUNCH", time: "34m ago" },
  { company: "Cinder AI", contact: "Head of Growth verified", signal: "GTM_EXPANSION", time: "47m ago" },
  { company: "Layerdesk", contact: "RevOps verified", signal: "LEADERSHIP_HIRE", time: "01h ago" },
  { company: "Northbeam", contact: "Sales Director verified", signal: "SDR_HIRING", time: "08m ago" },
  { company: "VantaFlow", contact: "VP Sales verified", signal: "FUNDING_EVENT", time: "21m ago" },
  { company: "OrbitOps", contact: "Founder verified", signal: "PRODUCT_LAUNCH", time: "34m ago" },
] as const;

const problemCards = [
  {
    body: "Broad sourcing fills the sequence with accounts that were never going to buy.",
    index: "01",
    title: "Wrong company",
  },
  {
    body: "Good accounts stall when the contact isn't the one who can actually move the deal.",
    index: "02",
    title: "Wrong person",
  },
  {
    body: "Even strong-fit accounts go cold when outreach lands before there's a reason to care.",
    index: "03",
    title: "Wrong timing",
  },
  {
    body: "Without real context, every opener sounds the same and every follow-up blurs together.",
    index: "04",
    title: "Generic message",
  },
] as const;

const timingSignals = [
  {
    body: "A new SDR team usually means pipeline targets just went up.",
    index: "SIG.01",
    title: "SDR hiring",
  },
  {
    body: "Fresh capital tends to create urgency around growth and GTM execution.",
    index: "SIG.02",
    title: "New funding",
  },
  {
    body: "A launch opens a short window where outbound relevance spikes.",
    index: "SIG.03",
    title: "Product launches",
  },
  {
    body: "When rep time gets expensive fast, account quality starts to matter more.",
    index: "SIG.04",
    title: "Sales expansion",
  },
  {
    body: "New leadership resets priorities, tooling, and where the team needs traction.",
    index: "SIG.05",
    title: "Leadership hires",
  },
] as const;

const processSteps = [
  {
    body: "Scan hiring activity, funding events, and GTM motion for early buying signals.",
    index: "01",
    title: "Detect",
  },
  {
    body: "A person, not a script, checks the account actually fits before it moves forward.",
    index: "02",
    title: "Qualify",
  },
  {
    body: "Confirm the decision-maker, their live email, and direct phone number.",
    index: "03",
    title: "Verify",
  },
  {
    body: "Write the why-now angle and a 4-email sequence around the actual signal.",
    index: "04",
    title: "Personalize",
  },
  {
    body: "Hand your team an opportunity file that's ready to send, not sort.",
    index: "05",
    title: "Deliver",
  },
] as const;

const manifestItems = [
  "Company profile + website",
  "Buying signal + why-now trigger",
  "Decision-maker name + title",
  "LinkedIn - personal and company",
  "Verified email address",
  "Verified direct phone number",
  "Initial email, written to the signal",
  "Three personalized follow-ups",
] as const;

const comparisonRows = [
  ["Sourcing", "Mass scraping", "Manual qualification"],
  ["Contacts", "Generic contacts", "Confirmed decision-makers"],
  ["Messaging", "Templates", "Written to the signal"],
  ["Context", "None", "Why-now trigger included"],
  ["Output", "Raw records", "Outbound-ready opportunities"],
] as const;

const customerCards = [
  {
    body: "Outbound-heavy teams that need cleaner timing and better-fit accounts.",
    title: "B2B SaaS",
  },
  {
    body: "Teams that want sharper opportunities, not more research to clean up.",
    title: "AI agencies",
  },
  {
    body: "Building pipeline where rep time is too expensive to waste.",
    title: "Software companies",
  },
  {
    body: "Teams that need a sharper why-now before outreach even begins.",
    title: "Cybersecurity",
  },
  {
    body: "Where better timing and better-fit accounts speed up every conversation.",
    title: "Consulting firms",
  },
] as const;

function revealProps(enableMotion: boolean, delay = 0) {
  if (!enableMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 20 },
    transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    viewport: { amount: 0.2, once: true },
    whileInView: { opacity: 1, y: 0 },
  };
}

function SectionShell({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id: string;
}) {
  return (
    <section
      className={cn(
        "relative border-t border-[#1e2227] py-[76px] sm:py-[96px] lg:py-[120px]",
        className,
      )}
      id={id}
    >
      <Container className="relative max-w-[1180px] px-5 sm:px-8">{children}</Container>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  lede,
  title,
}: {
  eyebrow?: string;
  lede?: string;
  title: ReactNode;
}) {
  return (
    <div className="max-w-[640px]">
      {eyebrow ? (
        <div
          className={cn(
            monoFont.className,
            "mb-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]",
          )}
        >
          <span className="h-px w-8 bg-[#e7a6d6]/70" />
          {eyebrow}
        </div>
      ) : null}
      <h2
        className={cn(
          displayFont.className,
          "text-[28px] font-semibold leading-[1.08] tracking-[-0.01em] text-[#f3f1ea] sm:text-[38px]",
        )}
      >
        {title}
      </h2>
      {lede ? (
        <p className="mt-5 max-w-[560px] text-[16px] leading-[1.7] text-[#9ba1a8]">
          {lede}
        </p>
      ) : null}
    </div>
  );
}

function SignalTerminal() {
  return (
    <div className="relative overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b]">
      <div className="h-0.5 bg-[linear-gradient(90deg,#f3b583_0%,#ee9fcb_50%,#b6abe8_100%)]" />
      <div className="flex items-center justify-between border-b border-[#1e2227] bg-[#1b1f24] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#c75c4a]" />
          <span className="h-2 w-2 rounded-full bg-[#f3b583]" />
          <span className="h-2 w-2 rounded-full bg-[#4bc996]" />
        </div>
        <div
          className={cn(
            monoFont.className,
            "text-[11px] font-medium uppercase tracking-[0.14em] text-[#9ba1a8]",
          )}
        >
          INCOMING_SIGNALS.LOG
        </div>
      </div>
      <div className="relative h-[390px] overflow-hidden px-4 py-2 sm:h-[430px]">
        <div className="animate-terminal-scroll space-y-0">
          {terminalRows.map((row, index) => (
            <div
              className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#1e2227] py-4"
              key={`${row.company}-${row.signal}-${index}`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      monoFont.className,
                      "rounded-[3px] border border-[#262b31] bg-[#0c0e11] px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-[#e7a6d6]",
                    )}
                  >
                    {row.signal}
                  </span>
                  <span className="text-[15px] font-semibold text-[#f3f1ea]">{row.company}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[13px] text-[#9ba1a8]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4bc996]" />
                  {row.contact}
                </div>
              </div>
              <div className={cn(monoFont.className, "text-[11px] text-[#5c636b]")}>{row.time}</div>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#14171b] to-transparent" />
      </div>
    </div>
  );
}

function CompactCard({
  body,
  index,
  title,
}: {
  body: string;
  index?: string;
  title: string;
}) {
  return (
    <div className="rounded-[6px] border border-[#262b31] bg-[#14171b] p-5">
      {index ? (
        <div className={cn(monoFont.className, "mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-[#e7a6d6]")}>
          {index}
        </div>
      ) : null}
      <h3 className={cn(displayFont.className, "text-[18px] font-semibold text-[#f3f1ea]")}>{title}</h3>
      <p className="mt-3 text-[14px] leading-[1.65] text-[#9ba1a8]">{body}</p>
    </div>
  );
}

function ManifestPanel() {
  const leftItems = manifestItems.slice(0, 4);
  const rightItems = manifestItems.slice(4);

  return (
    <div className="overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b]">
      <div className="flex items-center justify-between border-b border-[#262b31] bg-[#1b1f24] px-5 py-4">
        <div className={cn(monoFont.className, "text-[11px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]")}>
          OPPORTUNITY_MANIFEST
        </div>
        <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.12em] text-[#5c636b]")}>
          8 FIELDS
        </div>
      </div>
      <div className="grid md:grid-cols-2">
        {[leftItems, rightItems].map((items, columnIndex) => (
          <div className={cn(columnIndex === 1 ? "md:border-l md:border-[#1e2227]" : "")} key={columnIndex}>
            {items.map((item) => (
              <div
                className="flex items-center gap-3 border-b border-[#1e2227] px-5 py-4 last:border-b-0"
                key={item}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#4bc996]/50 text-[10px] text-[#4bc996]">
                  ✓
                </span>
                <span className="text-[15px] leading-6 text-[#f3f1ea]">{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlatformHomepage() {
  const reduceMotion = useReducedMotion() ?? false;
  const enableMotion = !reduceMotion;

  return (
    <div className={cn(bodyFont.className, "relative isolate overflow-hidden bg-[#0c0e11] text-[#f3f1ea]")}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_78%_8%,rgba(238,159,203,0.16),transparent_28%),radial-gradient(circle_at_88%_16%,rgba(182,171,232,0.14),transparent_26%)]" />

      <section className="relative py-[76px] sm:py-[96px] lg:py-[120px]">
        <Container className="relative grid max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <motion.div className="max-w-[650px]" {...revealProps(enableMotion, 0.02)}>
            <div className={cn(monoFont.className, "mb-5 text-[12px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]")}>
              Signal-qualified outbound
            </div>
            <h1
              className={cn(
                displayFont.className,
                "text-[36px] font-semibold leading-[1.08] tracking-[-0.01em] text-[#f3f1ea] sm:text-[56px]",
              )}
            >
              Outbound built on timing, not luck.
            </h1>
            <p className="mt-6 max-w-[610px] text-[17px] leading-[1.7] text-[#9ba1a8] sm:text-[18px]">
              We find the moment a company is ready to buy, verify the person who can say yes, and
              hand your team an opportunity built to send - not another list to clean up.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className={primaryButtonClassName} size="lg">
                <Link href={ROUTES.SAMPLE}>Request a sample</Link>
              </Button>
              <Button asChild className={ghostButtonClassName} size="lg" variant="secondary">
                <Link href={ROUTES.BOOK_MEETING}>Book a 1:1 call</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
              {tagItems.map((item) => (
                <div
                  className={cn(monoFont.className, "flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[#9ba1a8]")}
                  key={item}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4bc996]" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...revealProps(enableMotion, 0.1)}>
            <SignalTerminal />
          </motion.div>
        </Container>
      </section>

      <SectionShell id="problem">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            eyebrow="The problem"
            lede="Bad outbound rarely fails because of the message. It fails because of what happened - or didn't - before anyone sat down to write it."
            title="Most outbound dies before the first email."
          />
        </motion.div>
        <motion.div className="mt-12 grid border border-[#262b31] md:grid-cols-2 lg:grid-cols-4" {...revealProps(enableMotion, 0.08)}>
          {problemCards.map((card) => (
            <div className="border-b border-r border-[#262b31] border-l-[2px] border-l-[#c75c4a] p-6 last:border-r-0 md:[&:nth-child(even)]:border-r-0 lg:[&:nth-child(even)]:border-r lg:[&:nth-child(4n)]:border-r-0" key={card.title}>
              <div className={cn(monoFont.className, "mb-5 text-[11px] uppercase tracking-[0.12em] text-[#5c636b]")}>{card.index}</div>
              <h3 className={cn(displayFont.className, "text-[18px] font-semibold text-[#f3f1ea]")}>{card.title}</h3>
              <p className="mt-3 text-[14px] leading-[1.65] text-[#9ba1a8]">{card.body}</p>
            </div>
          ))}
        </motion.div>
      </SectionShell>

      <SectionShell id="timing">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            eyebrow="Why timing wins"
            lede="Long before a company signs anything, it leaves a trail - a hire, a raise, a launch. Timing is just paying attention to that trail."
            title="Companies tell you they're about to buy. Most teams aren't listening."
          />
        </motion.div>
        <motion.div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" {...revealProps(enableMotion, 0.08)}>
          {timingSignals.map((signal) => (
            <CompactCard body={signal.body} index={signal.index} key={signal.title} title={signal.title} />
          ))}
        </motion.div>
      </SectionShell>

      <SectionShell id="process">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            eyebrow="The pipeline"
            lede="Every step exists to strip out wasted outreach before it ever reaches your sales team."
            title="Five steps. One outbound-ready opportunity."
          />
        </motion.div>
        <motion.div className="mt-12" {...revealProps(enableMotion, 0.08)}>
          <div className="relative grid gap-8 lg:grid-cols-5">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-[#262b31] lg:block" />
            {processSteps.map((step) => (
              <div className="relative border-b border-[#1e2227] pb-6 lg:border-b-0 lg:pb-0" key={step.title}>
                <div className="flex items-center gap-4 lg:block">
                  <div className={cn(monoFont.className, "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#262b31] bg-[#0c0e11] text-[11px] font-medium text-[#e7a6d6]")}>
                    {step.index}
                  </div>
                  <h3 className={cn(displayFont.className, "text-[18px] font-semibold text-[#f3f1ea] lg:mt-6")}>{step.title}</h3>
                </div>
                <p className="mt-3 text-[14px] leading-[1.65] text-[#9ba1a8] lg:pr-4">{step.body}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </SectionShell>

      <SectionShell id="receive">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            eyebrow="What you receive"
            title="Every opportunity arrives ready to work, not to clean up."
          />
        </motion.div>
        <motion.div className="mt-12" {...revealProps(enableMotion, 0.08)}>
          <ManifestPanel />
        </motion.div>
      </SectionShell>

      <SectionShell id="sample-opportunity">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader
            eyebrow="Sample opportunity"
            lede="This is what a serious buyer should be able to check before trusting the system with their pipeline."
            title="A real opportunity, inspected - not summarized."
          />
        </motion.div>
        <motion.div className="mt-12 overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b] lg:grid lg:grid-cols-2" {...revealProps(enableMotion, 0.08)}>
          <div className="p-6 sm:p-8 lg:border-r lg:border-[#1e2227]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-[3px] border border-[#4bc996]/40 px-2.5 py-1 text-[12px] font-medium text-[#4bc996]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4bc996]" />
              Verified opportunity
            </div>
            <h3 className={cn(displayFont.className, "text-[30px] font-semibold leading-tight text-[#f3f1ea]")}>
              Northbeam Analytics
            </h3>
            <p className="mt-2 text-[15px] text-[#9ba1a8]">First SDR hire posted 8 days ago</p>
            <div className="mt-8 divide-y divide-[#1e2227]">
              {[
                ["Decision maker", "Marcus King, Sales Director"],
                ["Why now", "First outbound hire - no pipeline infra yet"],
                ["Contact", "Live email + direct line, verified"],
                ["Sequence", "1 initial + 3 follow-ups"],
              ].map(([label, value]) => (
                <div className="grid gap-2 py-4 sm:grid-cols-[0.36fr_0.64fr] sm:items-center" key={label}>
                  <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.12em] text-[#5c636b]")}>{label}</div>
                  <div className="text-[15px] leading-6 text-[#f3f1ea] sm:text-right">{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.14em] text-[#e7a6d6]")}>
              Why this made the brief
            </div>
            <p className="mt-6 text-[17px] leading-[1.75] text-[#9ba1a8]">
              Northbeam posted their first SDR role this month.{" "}
              <strong className="font-semibold text-[#f3f1ea]">
                That&apos;s the exact point where list-building would eat the new hire&apos;s entire first
                month instead of selling.
              </strong>{" "}
              Marcus has a clear, immediate reason to want a working pipeline before that hire
              starts - which is what makes the opening line write itself.
            </p>
          </div>
        </motion.div>
      </SectionShell>

      <SectionShell id="why-frithly">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader title="Traditional sourcing gives you records. Frithly gives you opportunities." />
        </motion.div>
        <motion.div className="mt-12 overflow-hidden rounded-[6px] border border-[#262b31] bg-[#14171b]" {...revealProps(enableMotion, 0.08)}>
          <div className="grid grid-cols-[0.72fr_1fr_1fr] border-b border-[#262b31] bg-[#1b1f24] px-4 py-4 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#9ba1a8] sm:px-6">
            <div />
            <div>Traditional sourcing</div>
            <div>Frithly</div>
          </div>
          {comparisonRows.map(([label, traditional, frithly]) => (
            <div className="grid grid-cols-[0.72fr_1fr_1fr] border-b border-[#1e2227] px-4 py-4 last:border-b-0 sm:px-6" key={label}>
              <div className="text-[14px] text-[#9ba1a8]">{label}</div>
              <div className="text-[14px] text-[#5c636b] line-through">{traditional}</div>
              <div className="text-[14px] font-medium text-[#f3f1ea]">{frithly}</div>
            </div>
          ))}
        </motion.div>
      </SectionShell>

      <SectionShell id="ideal-customers">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader title="Built for teams where timing and fit change the conversation." />
        </motion.div>
        <motion.div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" {...revealProps(enableMotion, 0.08)}>
          {customerCards.map((card) => (
            <CompactCard body={card.body} key={card.title} title={card.title} />
          ))}
        </motion.div>
      </SectionShell>

      <SectionShell id="faq">
        <motion.div {...revealProps(enableMotion, 0.02)}>
          <SectionHeader title="Questions before you book." />
        </motion.div>
        <motion.div className="mt-10 max-w-[760px]" {...revealProps(enableMotion, 0.08)}>
          <Accordion className="space-y-0 border-y border-[#262b31]" collapsible defaultValue="faq-0" type="single">
            {platformFaqs.map((faq, index) => (
              <AccordionItem className="border-b border-[#1e2227] last:border-b-0" key={faq.question} value={`faq-${index}`}>
                <AccordionTrigger className={cn(displayFont.className, "py-5 text-left text-[18px] font-semibold text-[#f3f1ea] hover:no-underline")}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-[1.7] text-[#9ba1a8]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </SectionShell>

      <SectionShell className="overflow-hidden py-[96px] sm:py-[120px] lg:py-[140px]" id="cta">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(238,159,203,0.12),transparent_34%),radial-gradient(circle_at_52%_52%,rgba(182,171,232,0.1),transparent_30%)]" />
        <motion.div className="relative mx-auto max-w-[720px] text-center" {...revealProps(enableMotion, 0.02)}>
          <h2 className={cn(displayFont.className, "text-[32px] font-semibold leading-[1.08] text-[#f3f1ea] sm:text-[44px]")}>
            See how your next opportunity looks.
          </h2>
          <p className="mx-auto mt-5 max-w-[590px] text-[16px] leading-[1.7] text-[#9ba1a8]">
            If you want better timing, better-fit accounts, and verified decision-makers before
            outreach starts - this is the layer Frithly was built for.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild className={ghostButtonClassName} size="lg" variant="secondary">
              <Link href={ROUTES.BOOK_MEETING}>Book a 1:1 call</Link>
            </Button>
            <Button asChild className={primaryButtonClassName} size="lg">
              <Link href={ROUTES.SAMPLE}>Request a sample</Link>
            </Button>
          </div>
        </motion.div>
      </SectionShell>
    </div>
  );
}
