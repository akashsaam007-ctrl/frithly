import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileSearch,
  MessageSquareText,
  Radar,
  Search,
  ShieldCheck,
  Target,
} from "lucide-react";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { GuideDownloadForm } from "@/components/landing/guide-download-form";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  buildBreadcrumbSchema,
  buildPublicMetadata,
  buildWebPageSchema,
} from "@/lib/seo";

const guideTitle = "Signal-Based Outbound Playbook | Frithly";
const guideDescription =
  "Download Frithly's free 20-page playbook on buying signals, Why Now outreach, opportunity scoring, manual QA, and signal-based outbound research.";

const benefits = [
  "Identify commercially relevant buying signals",
  "Prioritize accounts with a 100-point scoring model",
  "Turn verified events into stronger outreach angles",
] as const;

const problemCards = [
  {
    body: "Company size, industry and job title show who could buy.",
    title: "Static targeting",
  },
  {
    body: "Relevant business changes explain why they may care now.",
    title: "Buying signals",
  },
  {
    body: "A human check decides whether the angle is credible.",
    title: "Manual QA",
  },
] as const;

const learnCards = [
  {
    body: "Learn the ten commercial events that can indicate new urgency, budget or operational pressure.",
    icon: Radar,
    title: "Buying-signal taxonomy",
  },
  {
    body: "Evaluate freshness, relevance, evidence strength and specificity before contacting an account.",
    icon: Search,
    title: "Signal qualification",
  },
  {
    body: "Combine company fit, signal fit and contact fit instead of relying only on static firmographics.",
    icon: Target,
    title: "Signal-based ICP",
  },
  {
    body: "Turn a verified event into a credible commercial hypothesis without presenting inference as fact.",
    icon: MessageSquareText,
    title: "The Why Now framework",
  },
  {
    body: "Prioritize accounts using a practical 100-point scoring framework.",
    icon: FileSearch,
    title: "Opportunity scoring",
  },
  {
    body: "Apply clear approval, uncertainty and rejection rules before outreach.",
    icon: ShieldCheck,
    title: "Manual QA",
  },
] as const;

const signals = [
  ["Sales hiring", "Pipeline investment and capacity expansion"],
  ["Funding", "New growth pressure and budget movement"],
  ["Leadership change", "New priorities and strategy resets"],
  ["Product launch", "New market motion or enablement needs"],
  ["Geographic expansion", "New territory and pipeline pressure"],
  ["Technology change", "Operational shifts and stack gaps"],
  ["Pricing change", "Packaging, monetization or GTM updates"],
  ["Customer wins", "Proof momentum and category expansion"],
  ["Compliance change", "Urgency created by external requirements"],
  ["Public pain signal", "Visible friction worth qualifying carefully"],
] as const;

const process = [
  "Define the ICP",
  "Monitor relevant business signals",
  "Match the correct decision-maker",
  "Manually review the Why Now",
] as const;

const audiences = [
  {
    body: "Build founder-led outbound around real timing and commercial relevance.",
    title: "B2B founders",
  },
  {
    body: "Create stronger account lists and explain why each company matters now.",
    title: "Agencies",
  },
  {
    body: "Prioritize companies where current events create a relevant need.",
    title: "Consultants",
  },
  {
    body: "Give sales reps qualified accounts with context before outreach.",
    title: "Revenue teams",
  },
] as const;

const previews = [
  {
    image: "/guides/previews/page-04-04.png",
    label: "Page 04",
    title: "Ten commercially useful signals",
  },
  {
    image: "/guides/previews/page-08-08.png",
    label: "Page 08",
    title: "Not every signal deserves outreach",
  },
  {
    image: "/guides/previews/page-12-12.png",
    label: "Page 12",
    title: "100-point scoring model",
  },
  {
    image: "/guides/previews/page-16-16.png",
    label: "Page 16",
    title: "Manual QA gate",
  },
] as const;

const faqs = [
  {
    answer: "Yes. Submit the short form and you will receive the complete 20-page guide.",
    question: "Is the guide free?",
  },
  {
    answer:
      "It is designed for B2B founders, agencies, consultants and revenue teams using outbound to generate opportunities.",
    question: "Who is the guide for?",
  },
  {
    answer:
      "Yes. It includes signal-led cold email examples and a four-touch follow-up sequence.",
    question: "Does the guide include email examples?",
  },
  {
    answer:
      "No. A signal provides context and a possible reason for relevance. The commercial implication must still be reviewed.",
    question: "Does a buying signal prove purchase intent?",
  },
  {
    answer:
      "Yes. After downloading the guide, you can request a sample signal-qualified account list for your ICP.",
    question: "Can Frithly apply this framework to my market?",
  },
] as const;

export const metadata: Metadata = buildPublicMetadata({
  description: guideDescription,
  keywords: [
    "signal based outbound playbook",
    "buying signals guide",
    "why now outreach",
    "outbound opportunity scoring",
    "manual outbound QA",
    "B2B outbound guide",
  ],
  path: "/guides",
  title: guideTitle,
});

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/72">
      {children}
    </p>
  );
}

function GradientBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.4rem] bg-[linear-gradient(135deg,rgba(255,208,131,0.42),rgba(243,160,213,0.28),rgba(158,140,255,0.42))] p-px">
      <div className="rounded-[1.35rem] bg-[#08070b]/95">{children}</div>
    </div>
  );
}

export default function GuidesPage() {
  return (
    <main className="relative isolate overflow-hidden bg-[#050507] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_22%_10%,rgba(255,208,131,0.08),transparent_32%),radial-gradient(circle_at_76%_16%,rgba(158,140,255,0.13),transparent_34%),linear-gradient(180deg,#050507_0%,#09070d_42%,#050507_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:168px_168px] opacity-[0.08]" />

      <StructuredData
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
        ])}
      />
      <StructuredData
        data={buildWebPageSchema({
          description: guideDescription,
          path: "/guides",
          title: guideTitle,
        })}
      />

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[rgba(5,5,7,0.78)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Logo imageClassName="h-8 sm:h-9" priority />
          <div className="flex items-center gap-3">
            <Link className="hidden text-sm font-semibold text-white/68 transition-colors hover:text-white sm:inline-flex" href="/">
              Back to Frithly
            </Link>
            <Button
              asChild
              className="h-10 rounded-[0.85rem] border-white/[0.1] bg-white/[0.035] px-4 text-sm text-white shadow-none hover:bg-white/[0.07] hover:text-white"
              variant="secondary"
            >
              <a href="#download-guide">Get the guide</a>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-24 lg:grid-cols-[minmax(0,0.54fr)_minmax(0,0.46fr)] lg:items-center lg:pt-28">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-transparent bg-clip-text bg-[linear-gradient(90deg,#ffd083,#f3a0d5,#9e8cff)]">
            Free 20-page playbook
          </p>
          <h1 className="mt-5 max-w-[720px] text-[3rem] font-semibold leading-[0.94] tracking-[-0.07em] text-white sm:text-[4.1rem] lg:text-[4.55rem]">
            Stop contacting companies with no reason to buy.
          </h1>
          <p className="mt-6 max-w-[640px] text-[1.02rem] leading-8 text-[#b7b3c5] sm:text-[1.12rem]">
            Learn how to identify companies showing active commercial signals, qualify the
            opportunity, find the right decision-maker and turn the event into credible Why Now
            outreach.
          </p>
          <ul className="mt-8 space-y-3.5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-[0.98rem] text-white/82">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] text-white shadow-[0_0_22px_rgba(158,140,255,0.16)]">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.88rem] font-medium text-white/48">
            Built for B2B founders, agencies, consultants and revenue teams.
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-10 rounded-full bg-[rgba(158,140,255,0.18)] blur-3xl" />
          <div className="relative mx-auto max-w-[440px]">
            <div className="mx-auto w-[76%] rotate-[-3deg] overflow-hidden rounded-[1rem] border border-white/[0.12] bg-[#121019] shadow-[0_42px_120px_rgba(0,0,0,0.55)] sm:w-[68%] lg:w-[72%]">
              <Image
                alt="Frithly Signal-Based Outbound Playbook cover"
                className="h-auto w-full"
                height={1212}
                priority
                src="/guides/previews/cover-01.png"
                width={858}
              />
            </div>
            <div className="pointer-events-none absolute -left-2 top-20 hidden rounded-full border border-white/[0.08] bg-[#121019]/90 px-4 py-2 text-xs font-semibold text-white/72 shadow-[0_20px_50px_rgba(0,0,0,0.36)] sm:block">
              10 buying signals
            </div>
            <div className="pointer-events-none absolute right-0 top-36 hidden rounded-full border border-white/[0.08] bg-[#121019]/90 px-4 py-2 text-xs font-semibold text-white/72 shadow-[0_20px_50px_rgba(0,0,0,0.36)] sm:block">
              100-point scoring model
            </div>
            <div className="pointer-events-none absolute bottom-20 left-8 hidden rounded-full border border-white/[0.08] bg-[#121019]/90 px-4 py-2 text-xs font-semibold text-white/72 shadow-[0_20px_50px_rgba(0,0,0,0.36)] sm:block">
              Manual QA framework
            </div>
          </div>
          <div className="relative mt-8">
            <GuideDownloadForm />
          </div>
        </div>
      </section>

      <div className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-2 px-5 py-5 text-center text-[0.86rem] text-white/52 sm:px-8 md:flex-row md:items-center md:justify-center md:gap-3">
          <span className="font-semibold text-white/74">Built for:</span>
          <span>B2B SaaS founders</span>
          <span className="hidden text-white/22 md:inline">|</span>
          <span>Agencies</span>
          <span className="hidden text-white/22 md:inline">|</span>
          <span>Consultants</span>
          <span className="hidden text-white/22 md:inline">|</span>
          <span>Revenue teams</span>
        </div>
      </div>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="max-w-3xl">
          <SectionLabel>Why the guide matters</SectionLabel>
          <h2 className="mt-5 text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-[3rem]">
            Most outbound fails before the first email is sent.
          </h2>
          <p className="mt-5 text-[1rem] leading-8 text-[#b7b3c5]">
            Company size, industry and job title can show who might be a fit. They do not explain
            why the company should care today.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {problemCards.map((card, index) => (
            <article
              key={card.title}
              className="relative rounded-[1.2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/38">
                0{index + 1}
              </p>
              <h3 className="mt-5 text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-3 text-[0.94rem] leading-7 text-white/58">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-start">
          <div>
            <SectionLabel>Inside the playbook</SectionLabel>
            <h2 className="mt-5 text-[2.1rem] font-semibold leading-[1.03] tracking-[-0.055em] text-white sm:text-[3rem]">
              What you will learn
            </h2>
            <p className="mt-5 text-[1rem] leading-8 text-[#b7b3c5]">
              The guide gives you a practical way to turn market movement into better outbound
              decisions.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {learnCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className="rounded-[1.15rem] border border-white/[0.08] bg-[#121019]/78 p-5"
                >
                  <Icon className="h-5 w-5 text-white/72" aria-hidden="true" />
                  <h3 className="mt-5 text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-3 text-[0.92rem] leading-7 text-white/56">{card.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
          <div>
            <SectionLabel>Signal preview</SectionLabel>
            <h2 className="mt-5 text-[2.1rem] font-semibold leading-[1.03] tracking-[-0.055em] text-white sm:text-[3rem]">
              10 signals worth monitoring
            </h2>
            <p className="mt-5 text-[1rem] leading-8 text-[#b7b3c5]">
              A signal does not prove buying intent. It gives your team a better reason to inspect
              the account.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {signals.map(([signal, implication]) => (
              <div
                key={signal}
                className="rounded-[1rem] border border-white/[0.08] bg-white/[0.025] p-4"
              >
                <h3 className="font-semibold text-white">{signal}</h3>
                <p className="mt-2 text-sm leading-6 text-white/52">{implication}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
        <GradientBorder>
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-center">
              <div>
                <SectionLabel>Why Now framework</SectionLabel>
                <h2 className="mt-5 text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-[2.8rem]">
                  Turn events into credible outreach
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["What changed?", "What may it affect?", "Why are you relevant?", "Why act now?"].map(
                  (item, index) => (
                    <div key={item} className="rounded-[1rem] border border-white/[0.08] bg-white/[0.035] p-5">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/36">
                        0{index + 1}
                      </p>
                      <p className="mt-4 text-lg font-semibold text-white">{item}</p>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="mt-8 rounded-[1.1rem] border border-white/[0.08] bg-[#050507]/70 p-5 text-center text-[1rem] font-semibold leading-8 text-white sm:text-[1.25rem]">
              Observed event + likely business impact + relevant solution = credible outreach angle
            </div>
          </div>
        </GradientBorder>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionLabel>Preview pages</SectionLabel>
            <h2 className="mt-5 text-[2.1rem] font-semibold leading-[1.03] tracking-[-0.055em] text-white sm:text-[3rem]">
              A few pages before you download
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/48">
            The complete guide includes 16 more pages with examples, scoring and QA rules.
          </p>
        </div>
        <div className="mt-10 flex gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]">
          {previews.map((preview) => (
            <article
              key={preview.image}
              className="min-w-[250px] rounded-[1.1rem] border border-white/[0.08] bg-white/[0.025] p-3 transition-transform duration-200 hover:-translate-y-1 sm:min-w-[300px]"
            >
              <div className="overflow-hidden rounded-[0.85rem] border border-white/[0.08] bg-[#121019]">
                <Image
                  alt={preview.title}
                  className="h-auto w-full"
                  height={1403}
                  src={preview.image}
                  width={992}
                />
              </div>
              <p className="mt-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/38">
                {preview.label}
              </p>
              <h3 className="mt-2 font-semibold text-white">{preview.title}</h3>
            </article>
          ))}
          <article className="flex min-w-[250px] items-center justify-center rounded-[1.1rem] border border-white/[0.08] bg-white/[0.025] p-8 text-center sm:min-w-[300px]">
            <div>
              <p className="text-[2.6rem] font-semibold tracking-[-0.05em] text-white">16+</p>
              <p className="mt-3 text-sm leading-6 text-white/52">
                more pages inside the complete guide
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>Get the guide</SectionLabel>
          <h2 className="mt-5 text-[2.1rem] font-semibold leading-[1.03] tracking-[-0.055em] text-white sm:text-[3rem]">
            Ready to build outbound around better timing?
          </h2>
          <p className="mt-5 text-[1rem] leading-8 text-[#b7b3c5]">
            Download the complete Signal-Based Outbound Playbook and apply the framework to your
            own market.
          </p>
          <Button
            asChild
            className="mt-8 h-14 rounded-[0.95rem] border-transparent bg-[linear-gradient(135deg,#ffd083_0%,#f3a0d5_52%,#9e8cff_100%)] px-7 text-[#050507] shadow-[0_18px_52px_rgba(158,140,255,0.18)] hover:brightness-[1.03] hover:text-[#050507]"
          >
            <a href="#download-guide">
              Get the free guide
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.38fr_0.62fr]">
          <div>
            <SectionLabel>Who it is for</SectionLabel>
            <h2 className="mt-5 text-[2.1rem] font-semibold leading-[1.03] tracking-[-0.055em] text-white sm:text-[3rem]">
              Built for teams that need better targeting, not bigger databases.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {audiences.map((audience) => (
              <article key={audience.title} className="rounded-[1rem] border border-white/[0.08] bg-white/[0.025] p-5">
                <h3 className="text-lg font-semibold text-white">{audience.title}</h3>
                <p className="mt-3 text-[0.92rem] leading-7 text-white/56">{audience.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-10 rounded-[1.4rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 sm:p-8 lg:grid-cols-[0.44fr_0.56fr] lg:p-10">
          <div>
            <SectionLabel>Credibility</SectionLabel>
            <h2 className="mt-5 text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-[2.8rem]">
              How Frithly approaches outbound research
            </h2>
            <p className="mt-5 text-[0.98rem] leading-8 text-[#b7b3c5]">
              Signals indicate possible relevance. They are not proof of buying intent.
            </p>
          </div>
          <div className="grid gap-3">
            {process.map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-[1rem] border border-white/[0.08] bg-white/[0.025] p-4">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <span className="font-semibold text-white">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[980px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="text-center">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-5 text-[2.1rem] font-semibold tracking-[-0.055em] text-white sm:text-[3rem]">
            Questions before downloading?
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-10 rounded-[1.25rem] border border-white/[0.08] bg-white/[0.025] px-5 sm:px-7">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question} className="border-white/[0.08]">
              <AccordionTrigger className="text-white hover:text-white data-[state=open]:text-white">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-white/58">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
        <GradientBorder>
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div>
              <h2 className="text-[2rem] font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-[2.8rem]">
                See the framework applied to your market.
              </h2>
              <p className="mt-5 max-w-2xl text-[0.98rem] leading-8 text-[#b7b3c5]">
                Frithly identifies companies showing commercially relevant changes, matches them
                against your ICP, finds the appropriate decision-makers and manually reviews every
                account before delivery.
              </p>
            </div>
            <Button
              asChild
              className="h-14 rounded-[0.95rem] border-transparent bg-[linear-gradient(135deg,#ffd083_0%,#f3a0d5_52%,#9e8cff_100%)] px-7 text-[#050507] shadow-[0_18px_52px_rgba(158,140,255,0.18)] hover:brightness-[1.03] hover:text-[#050507]"
            >
              <Link href="/sample">
                Request a personalized sample
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </GradientBorder>
      </section>

      <footer className="border-t border-white/[0.06] px-5 py-8 text-center text-sm text-white/42 sm:px-8">
        Copyright 2026 Frithly. All rights reserved. <span className="mx-2 text-white/18">|</span>
        <a className="transition-colors hover:text-white" href={`mailto:hello@frithly.com`}>
          hello@frithly.com
        </a>
      </footer>

      <CookieBanner />
    </main>
  );
}
