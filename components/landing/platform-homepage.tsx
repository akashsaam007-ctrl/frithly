"use client";

import Link from "next/link";
import { Fraunces } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { IcpDemoExperience } from "@/components/landing/icp-demo-experience";
import { platformFaqs } from "@/components/landing/platform-homepage-data";
import { RoiCalculatorExperience } from "@/components/landing/roi-calculator-experience";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Layers3,
  MailCheck,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const floatingHeroCards = [
  {
    className: "left-0 top-8 hidden lg:flex",
    eyebrow: "Reviewed",
    title: "Astralis Industries",
    meta: "Founder route · UK",
    tone: "bg-[#9bcbff]",
    width: "w-56",
  },
  {
    className: "right-2 top-16 hidden xl:flex",
    eyebrow: "SMTP-safe",
    title: "Northwave Robotics",
    meta: "Priority release · DE",
    tone: "bg-[#7ce7d1]",
    width: "w-56",
  },
  {
    className: "bottom-8 left-10 hidden lg:flex",
    eyebrow: "Monday cohort",
    title: "187 opportunities prepared",
    meta: "Ready for outbound release",
    tone: "bg-[#f3be8e]",
    width: "w-64",
  },
] as const;

const intelligenceStages = [
  {
    body: "Turn the ICP into a real operating brief so the system knows what to protect, what to exclude, and where quality matters most.",
    confidence: 28,
    id: "icp",
    incoming: 14200,
    label: "ICP alignment",
    narrowed: 14200,
    title: "The brief becomes selective before the search begins.",
    traits: ["Market shape", "Geo logic", "Commercial exclusions"],
  },
  {
    body: "Expand search coverage without rewarding volume, so the field opens wide enough to matter but not wide enough to collapse into noise.",
    confidence: 44,
    id: "discovery",
    incoming: 3840,
    label: "Discovery expansion",
    narrowed: 3840,
    title: "Coverage opens, but discipline stays intact.",
    traits: ["Source expansion", "Signal-first search", "Market coverage"],
  },
  {
    body: "Add service fit, market context, and route clues so accounts start behaving like opportunities instead of raw company records.",
    confidence: 58,
    id: "enrichment",
    incoming: 920,
    label: "Signal enrichment",
    narrowed: 920,
    title: "Context turns records into commercially believable accounts.",
    traits: ["Service fit", "Website signals", "Route clues"],
  },
  {
    body: "Narrow attention toward the accounts that are safer to route, easier to trust, and more commercially relevant right now.",
    confidence: 72,
    id: "scoring",
    incoming: 340,
    label: "Confidence ranking",
    narrowed: 340,
    title: "The system raises conviction before the team ever sees the list.",
    traits: ["Deliverability posture", "Freshness", "Recommendation weight"],
  },
  {
    body: "Layer founder relevance and route quality into the final shortlist so the strongest accounts feel more obvious before release.",
    confidence: 88,
    id: "release",
    incoming: 187,
    label: "Weekly release",
    narrowed: 187,
    title: "Only the accounts worth carrying forward survive the release pass.",
    traits: ["Founder clarity", "SMTP-aware notes", "Weekly release context"],
  },
] as const;

const evolutionStages = [
  {
    count: "14,200",
    label: "Raw discovery",
    note: "A large field with very little operational confidence.",
  },
  {
    count: "3,840",
    label: "Market-shape match",
    note: "The first layer removes obvious volume noise.",
  },
  {
    count: "920",
    label: "Enriched candidates",
    note: "Context starts to separate relevance from coincidence.",
  },
  {
    count: "340",
    label: "Deliverability-safe pool",
    note: "Routing discipline protects the final queue.",
  },
  {
    count: "187",
    label: "Reviewed weekly cohort",
    note: "The shortlist behaves like outbound intelligence, not a list.",
  },
] as const;

const weeklyMoments = [
  {
    body: "The reviewed cohort is finalized against the live brief, with confidence, fit, and route quality already reconciled.",
    day: "Monday",
    time: "09:00 GMT",
    title: "Cohort finalized",
  },
  {
    body: "Draft refinement, routing notes, and founder context move closer to real execution instead of staying abstract.",
    day: "Tuesday",
    time: "12:00 GMT",
    title: "Draft refinement",
  },
  {
    body: "SMTP-aware packaging and export preparation happen before the handoff leaves operations.",
    day: "Wednesday",
    time: "10:00 GMT",
    title: "Export preparation",
  },
  {
    body: "QA review removes anything that no longer deserves a place in the weekly release.",
    day: "Thursday",
    time: "14:00 GMT",
    title: "QA review pass",
  },
  {
    body: "Outcome signals feed back into next week’s decisions, tightening the next cohort without inflating noise.",
    day: "Friday",
    time: "16:00 GMT",
    title: "Delivery optimization",
  },
] as const;

const trustSignals = [
  {
    body: "Every release is reviewed before delivery, so the product includes judgment, not just aggregation.",
    icon: ShieldCheck,
    title: "Reviewed opportunities",
  },
  {
    body: "Deliverability is part of the release logic itself, not a cleanup step after the list is already assembled.",
    icon: MailCheck,
    title: "SMTP-aware prioritization",
  },
  {
    body: "Founder mapping and decision-maker clarity are built into how the shortlist rises, not layered on later.",
    icon: Users,
    title: "Founder intelligence",
  },
  {
    body: "Every cohort ships with ordering, confidence, and release context that makes execution feel calmer.",
    icon: Layers3,
    title: "Operational QA",
  },
] as const;

const deliveryTimeline = [
  {
    copy: "Cohort ranked and finalized against the active outbound brief.",
    day: "Monday",
    icon: CalendarDays,
  },
  {
    copy: "Messaging and account notes sharpen around the strongest accounts.",
    day: "Tuesday",
    icon: Sparkles,
  },
  {
    copy: "Exports, route context, and release packaging are assembled.",
    day: "Wednesday",
    icon: Send,
  },
  {
    copy: "QA verifies confidence, fit, and delivery posture before release.",
    day: "Thursday",
    icon: CheckCircle2,
  },
  {
    copy: "Outcome signals inform the next week’s prioritization logic.",
    day: "Friday",
    icon: Radar,
  },
] as const;

const coverageOptions = [
  {
    description: "Focused market coverage with denser signal quality.",
    id: "uk",
    label: "UK",
  },
  {
    description: "Balanced coverage for broader weekly cohorts.",
    id: "uk-eu",
    label: "UK + EU",
  },
  {
    description: "Expanded transatlantic coverage for larger programs.",
    id: "global",
    label: "UK + EU + US",
  },
] as const;

const supportOptions = [
  {
    description: "Reviewed intelligence with ranking logic and release context.",
    id: "core",
    label: "Core intelligence",
  },
  {
    description: "Adds curated draft refinement for stronger handoffs.",
    id: "drafts",
    label: "Draft support",
  },
  {
    description: "Higher-touch weekly support around delivery and use.",
    id: "delivery",
    label: "Delivery support",
  },
] as const;

const cadenceOptions = [
  {
    description: "A reviewed release every Monday.",
    id: "weekly",
    label: "Weekly",
  },
  {
    description: "A lighter cadence for teams with longer cycles.",
    id: "biweekly",
    label: "Bi-weekly",
  },
] as const;

type CoverageOption = (typeof coverageOptions)[number]["id"];
type SupportOption = (typeof supportOptions)[number]["id"];
type CadenceOption = (typeof cadenceOptions)[number]["id"];

function revealProps(enableAnimation: boolean, delay = 0) {
  if (!enableAnimation) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 28 },
    transition: { delay, duration: 0.8, ease: "easeOut" as const },
    viewport: { amount: 0.16, once: true },
    whileInView: { opacity: 1, y: 0 },
  };
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatEuroRange(low: number, high: number) {
  return `${formatEuro(low)}-${formatEuro(high)}/month`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#efba90] backdrop-blur-xl">
      <span className="h-1.5 w-1.5 rounded-full bg-[#efba90]" />
      {children}
    </div>
  );
}

function SectionIntro({
  align = "left",
  copy,
  eyebrow,
  title,
}: {
  align?: "center" | "left";
  copy: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className={cn("space-y-5", align === "center" && "mx-auto max-w-3xl text-center")}>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2
        className={cn(
          `${displayFont.className} text-4xl leading-[0.92] text-[#f6f4f8] sm:text-5xl lg:text-6xl`,
          align === "center" ? "mx-auto max-w-4xl" : "max-w-4xl",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "max-w-2xl text-base leading-8 text-white/64 md:text-[1.03rem] md:leading-8",
          align === "center" && "mx-auto",
        )}
      >
        {copy}
      </p>
    </div>
  );
}

function SliderControl({
  label,
  max,
  min,
  onChange,
  step = 1,
  value,
  valueLabel,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
  valueLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">{label}</span>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-sm text-white/76">
          {valueLabel}
        </span>
      </div>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#efba90]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </div>
  );
}

function ChoiceCard({
  active,
  description,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-[1.2rem] px-4 py-4 text-left transition-colors",
        active
          ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(239,186,144,0.36)]"
          : "bg-white/[0.03] text-white/72 hover:bg-white/[0.05]",
      )}
      onClick={onClick}
      type="button"
    >
      <div className="text-sm font-semibold text-white">{label}</div>
      <p className="mt-2 text-sm leading-7 text-white/58">{description}</p>
    </button>
  );
}

export function PlatformHomepage() {
  const reduceMotion = useReducedMotion() ?? false;
  const [hasMounted, setHasMounted] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [weeklyOpportunityTarget, setWeeklyOpportunityTarget] = useState(45);
  const [targetingDepth, setTargetingDepth] = useState(3);
  const [coverage, setCoverage] = useState<CoverageOption>("uk-eu");
  const [support, setSupport] = useState<SupportOption>("delivery");
  const [cadence, setCadence] = useState<CadenceOption>("weekly");
  const [founderPriority, setFounderPriority] = useState(true);
  const [smtpPriority, setSmtpPriority] = useState(true);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveStageIndex((current) => (current + 1) % intelligenceStages.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const enableReveal = hasMounted && !reduceMotion;
  const activeStage = intelligenceStages[activeStageIndex];

  const programPreview = useMemo(() => {
    const monthlyReviewed = weeklyOpportunityTarget * (cadence === "weekly" ? 4 : 2);
    const coverageCost = coverage === "uk" ? 0 : coverage === "uk-eu" ? 260 : 460;
    const supportCost = support === "core" ? 0 : support === "drafts" ? 180 : 340;
    const founderCost = founderPriority ? 140 : 0;
    const smtpCost = smtpPriority ? 95 : 0;
    const depthCost = targetingDepth * 120;
    const volumeCost = weeklyOpportunityTarget * 4;
    const cadenceCost = cadence === "weekly" ? 170 : 0;
    const priceLow =
      499 +
      coverageCost +
      supportCost +
      founderCost +
      smtpCost +
      depthCost +
      volumeCost +
      cadenceCost;
    const priceHigh = priceLow + 240 + targetingDepth * 35 + (support === "delivery" ? 120 : 40);

    return {
      coverageLabel:
        coverageOptions.find((item) => item.id === coverage)?.label ?? "UK + EU",
      monthlyReviewed,
      priceHigh,
      priceLow,
      supportLabel:
        supportOptions.find((item) => item.id === support)?.label ?? "Delivery support",
      targetingLabel:
        targetingDepth === 1
          ? "Core fit signals"
          : targetingDepth === 2
            ? "Expanded market context"
            : targetingDepth === 3
              ? "Founder and routing depth"
              : targetingDepth === 4
                ? "High-touch intelligence layering"
                : "Maximum review precision",
    };
  }, [
    cadence,
    coverage,
    founderPriority,
    smtpPriority,
    support,
    targetingDepth,
    weeklyOpportunityTarget,
  ]);

  return (
    <div className="relative overflow-hidden bg-[#040712] text-[#f5f4f8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(88,125,182,0.18),transparent_24rem),radial-gradient(circle_at_82%_18%,rgba(109,214,188,0.08),transparent_24rem),radial-gradient(circle_at_50%_82%,rgba(246,187,140,0.08),transparent_28rem),linear-gradient(180deg,#040712_0%,#07101a_40%,#050913_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:96px_96px] opacity-[0.035]" />
      <div className="pointer-events-none absolute left-[-9rem] top-[12rem] h-80 w-80 rounded-full bg-[#6d8af9]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-[28rem] h-96 w-96 rounded-full bg-[#7ce7d1]/8 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[140rem] w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015),rgba(255,255,255,0.06))] opacity-20" />

      <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-24 sm:pb-20 sm:pt-28">
        <Container className="relative">
          <div className="relative mx-auto max-w-6xl">
            <motion.div className="mx-auto max-w-4xl text-center" {...revealProps(enableReveal, 0.04)}>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#efba90] backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-[#7ce7d1] shadow-[0_0_14px_rgba(124,231,209,0.95)]" />
                Outbound intelligence operation · live
              </div>

              <div className="mt-8 space-y-4">
                <h1
                  className={`${displayFont.className} text-[3.4rem] leading-[0.9] text-[#f8f5f7] sm:text-[4.8rem] lg:text-[6.4rem]`}
                >
                  <span className="block">Curated outbound</span>
                  <span className="block bg-[linear-gradient(120deg,#f8f5f7_15%,#efba90_48%,#92cff7_88%)] bg-clip-text text-transparent">
                    intelligence,
                  </span>
                  <span className="block">delivered weekly.</span>
                </h1>
                <p className="mx-auto max-w-3xl text-base leading-8 text-white/66 md:text-[1.08rem] md:leading-9">
                  Frithly helps outbound teams discover higher-confidence opportunities through
                  reviewed intelligence, SMTP-aware routing, founder targeting, and curated
                  delivery systems.
                </p>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="shadow-[0_24px_60px_rgba(241,186,144,0.18)]">
                  <Link href={ROUTES.APPLY}>
                    <span className="inline-flex items-center gap-2">
                      Apply for a Campaign
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="border-white/12 bg-white/[0.05] text-white hover:border-white/24 hover:bg-white/[0.09] hover:text-white"
                >
                  <Link href="#engine">Watch the Intelligence Flow</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["187", "Reviewed weekly"],
                  ["9.4×", "Higher reply rate"],
                  ["98.6%", "SMTP-safe routing"],
                  ["Every Monday", "Cohort released"],
                ].map(([value, label]) => (
                  <div
                    className="rounded-[1.35rem] bg-white/[0.035] px-5 py-4 backdrop-blur-xl"
                    key={label}
                  >
                    <div className="text-[1.35rem] font-semibold text-white">{value}</div>
                    <div className="mt-1 text-sm text-white/54">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative mx-auto mt-16 h-[24rem] max-w-5xl sm:h-[28rem] lg:h-[31rem]"
              {...revealProps(enableReveal, 0.12)}
            >
              <div className="absolute inset-0 rounded-[2.8rem] border border-white/8 bg-[radial-gradient(circle_at_50%_34%,rgba(123,160,247,0.18),transparent_18rem),radial-gradient(circle_at_50%_72%,rgba(239,186,144,0.1),transparent_20rem),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] shadow-[0_40px_140px_rgba(0,0,0,0.42)] backdrop-blur-2xl" />
              <div className="absolute inset-x-[10%] top-9 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)]" />
              <div className="absolute inset-y-[16%] left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.16),transparent)]" />

              <motion.div
                className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle,rgba(124,231,209,0.14),rgba(4,7,18,0)_70%)]"
                animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 6.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
                }
              />
              <motion.div
                className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#7ce7d1]/12"
                animate={reduceMotion ? undefined : { scale: [1, 1.02, 1], opacity: [0.4, 0.65, 0.4] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
                }
              />
              <motion.div
                className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#92cff7]/10"
                animate={reduceMotion ? undefined : { scale: [1, 1.015, 1], opacity: [0.25, 0.4, 0.25] }}
                transition={
                  reduceMotion
                    ? undefined
                    : { duration: 9, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
                }
              />

              <div className="absolute left-1/2 top-1/2 z-10 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/12 bg-[#09111d]/88 text-center shadow-[0_16px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#efba90]">
                  Confidence
                </div>
                <div className="mt-2 text-5xl font-semibold text-white">94</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/42">release score</div>
              </div>

              <div className="absolute left-[18%] top-[26%] h-3 w-3 rounded-full bg-[#7ce7d1] shadow-[0_0_18px_rgba(124,231,209,0.9)]" />
              <div className="absolute right-[18%] top-[34%] h-3 w-3 rounded-full bg-[#92cff7] shadow-[0_0_18px_rgba(146,207,247,0.9)]" />
              <div className="absolute left-[28%] bottom-[22%] h-3 w-3 rounded-full bg-[#efba90] shadow-[0_0_18px_rgba(239,186,144,0.9)]" />
              <div className="absolute left-[19%] top-[27%] h-px w-[29%] rotate-[14deg] bg-[linear-gradient(90deg,rgba(124,231,209,0),rgba(124,231,209,0.45),rgba(124,231,209,0))]" />
              <div className="absolute right-[19%] top-[35%] h-px w-[26%] -rotate-[20deg] bg-[linear-gradient(90deg,rgba(146,207,247,0),rgba(146,207,247,0.45),rgba(146,207,247,0))]" />
              <div className="absolute left-[30%] bottom-[24%] h-px w-[24%] rotate-[18deg] bg-[linear-gradient(90deg,rgba(239,186,144,0),rgba(239,186,144,0.45),rgba(239,186,144,0))]" />

              {floatingHeroCards.map((card) => (
                <motion.div
                  className={cn(
                    "absolute z-10 flex flex-col gap-2 rounded-[1.5rem] border border-white/10 bg-[#0b1320]/82 px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl",
                    card.className,
                    card.width,
                  )}
                  key={card.title}
                  animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { duration: 5.8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
                  }
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">
                    <span className={cn("h-2 w-2 rounded-full shadow-[0_0_14px_currentColor]", card.tone)} />
                    {card.eyebrow}
                  </div>
                  <div className="text-base font-semibold text-white">{card.title}</div>
                  <div className="text-sm text-white/54">{card.meta}</div>
                </motion.div>
              ))}

              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/8 bg-white/[0.04] px-5 py-3 text-sm text-white/64 backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-[#7ce7d1] shadow-[0_0_14px_rgba(124,231,209,0.95)]" />
                SMTP-aware routing verified before release
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="failure">
        <Container>
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="Mass outbound optimizes for volume, not targeting quality. Frithly is built for the opposite: a deliberate system that compresses noise into a small set of accounts worth a real conversation."
              eyebrow="The outbound problem"
              title="Most outbound is noise pretending to be intelligence."
            />
          </motion.div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <motion.div
              className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(180deg,rgba(110,30,36,0.3),rgba(14,10,18,0.92))] px-7 py-8 shadow-[0_32px_100px_rgba(0,0,0,0.24)]"
              {...revealProps(enableReveal, 0.1)}
            >
              <div className="max-w-lg">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffb2ae]">
                  Traditional outbound
                </div>
                <h3 className="mt-6 text-3xl font-semibold leading-tight text-[#f8f1f2]">
                  Mass scraping. Cold lists. Generic outreach.
                </h3>
                <p className="mt-4 max-w-xl text-base leading-8 text-white/62">
                  Thousands of unverified contacts. Weak routing discipline. Activity that looks
                  busy, but rarely compounds into real conversations.
                </p>
              </div>

              <div className="relative mt-10 h-64 overflow-hidden rounded-[2rem] bg-black/20">
                {Array.from({ length: 18 }).map((_, index) => (
                  <div
                    className="absolute rounded-full bg-[#f78d8d]/60 blur-[2px]"
                    key={`noise-${index}`}
                    style={{
                      height: `${index % 3 === 0 ? 16 : 10}px`,
                      left: `${8 + (index % 6) * 15 + ((index * 7) % 10)}%`,
                      top: `${14 + Math.floor(index / 6) * 24 + ((index * 5) % 8)}%`,
                      width: `${index % 3 === 0 ? 16 : 10}px`,
                    }}
                  />
                ))}
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    className="absolute h-px bg-[linear-gradient(90deg,rgba(247,141,141,0),rgba(247,141,141,0.35),rgba(247,141,141,0))]"
                    key={`noise-line-${index}`}
                    style={{
                      left: `${10 + (index % 4) * 21}%`,
                      top: `${18 + Math.floor(index / 4) * 26}%`,
                      transform: `rotate(${index % 2 === 0 ? 26 : -19}deg)`,
                      width: `${18 + (index % 4) * 3}%`,
                    }}
                  />
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/38">
                    Unverified contacts
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-[#ffcfca]">10,000+</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/38">
                    Real conversations
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-[#ffcfca]">&lt; 0.4%</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-[2.5rem] bg-[linear-gradient(180deg,rgba(10,33,42,0.72),rgba(7,17,28,0.96))] px-7 py-8 shadow-[0_32px_100px_rgba(0,0,0,0.24)]"
              {...revealProps(enableReveal, 0.16)}
            >
              <div className="max-w-lg">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7ce7d1]">
                  Frithly intelligence
                </div>
                <h3 className="mt-6 text-3xl font-semibold leading-tight text-[#f5fbfb]">
                  Reviewed accounts. Founder targeting. SMTP-safe release.
                </h3>
                <p className="mt-4 max-w-xl text-base leading-8 text-white/62">
                  A smaller cohort of opportunities, each one validated, ranked, and packaged for
                  deliverability before it ever reaches outbound.
                </p>
              </div>

              <div className="relative mt-10 h-64 overflow-hidden rounded-[2rem] bg-black/20">
                {Array.from({ length: 16 }).map((_, index) => (
                  <div
                    className="absolute h-3 w-3 rounded-full bg-[#7ce7d1] shadow-[0_0_18px_rgba(124,231,209,0.9)]"
                    key={`signal-${index}`}
                    style={{
                      left: `${14 + Math.floor(index / 4) * 18}%`,
                      opacity: 0.9 - (index % 4) * 0.12,
                      top: `${18 + (index % 4) * 18}%`,
                    }}
                  />
                ))}
                {Array.from({ length: 12 }).map((_, index) => (
                  <div
                    className="absolute h-px bg-[linear-gradient(90deg,rgba(124,231,209,0),rgba(124,231,209,0.55),rgba(146,207,247,0))]"
                    key={`signal-line-${index}`}
                    style={{
                      left: `${16 + (index % 3) * 22}%`,
                      top: `${22 + Math.floor(index / 3) * 18}%`,
                      transform: `rotate(${index % 2 === 0 ? 22 : -14}deg)`,
                      width: `${19 + (index % 4) * 4}%`,
                    }}
                  />
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/38">
                    Reviewed cohort
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-[#dffaf4]">180-250</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-white/38">
                    Delivery cadence
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-[#dffaf4]">Every Monday</div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="engine">
        <Container>
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="The system evolves through selective passes. Each one narrows quality, raises confidence, and protects the weekly release from turning back into volume."
              eyebrow="The living intelligence engine"
              title="Watch the system think."
            />
          </motion.div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <motion.div className="space-y-7" {...revealProps(enableReveal, 0.1)}>
              {intelligenceStages.map((stage, index) => {
                const active = index === activeStageIndex;

                return (
                  <button
                    className="group flex w-full items-start gap-5 text-left"
                    key={stage.id}
                    onClick={() => setActiveStageIndex(index)}
                    type="button"
                  >
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full transition-colors",
                          active ? "bg-[#efba90] shadow-[0_0_18px_rgba(239,186,144,0.85)]" : "bg-white/20",
                        )}
                      />
                      {index !== intelligenceStages.length - 1 ? (
                        <div className="mt-3 h-20 w-px bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.02))]" />
                      ) : null}
                    </div>
                    <div className="max-w-xl pb-2">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                        Stage {String(index + 1).padStart(2, "0")} · {stage.label}
                      </div>
                      <div
                        className={cn(
                          "mt-3 text-2xl font-semibold leading-tight transition-colors",
                          active ? "text-white" : "text-white/62 group-hover:text-white/84",
                        )}
                      >
                        {stage.title}
                      </div>
                      <p className="mt-3 text-base leading-8 text-white/54">{stage.body}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>

            <motion.div
              className="relative overflow-hidden rounded-[2.8rem] bg-white/[0.04] px-7 py-8 shadow-[0_40px_120px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              {...revealProps(enableReveal, 0.16)}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,231,209,0.1),transparent_18rem),radial-gradient(circle_at_left_center,rgba(146,207,247,0.12),transparent_20rem)]" />
              <motion.div
                className="relative"
                key={activeStage.id}
                initial={enableReveal ? { opacity: 0.4, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              >
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#efba90]">
                      Active stage
                    </div>
                    <h3 className="mt-4 text-3xl font-semibold text-white">{activeStage.label}</h3>
                    <p className="mt-3 max-w-2xl text-base leading-8 text-white/60">
                      {activeStage.body}
                    </p>
                  </div>
                  <div className="rounded-[1.6rem] bg-black/16 px-5 py-4 text-right">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                      Confidence
                    </div>
                    <div className="mt-1 text-4xl font-semibold text-white">
                      {activeStage.confidence}%
                    </div>
                  </div>
                </div>

                <div className="mt-10 h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#7ce7d1,#92cff7,#efba90)]"
                    initial={false}
                    animate={{ width: `${activeStage.confidence}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[1.8rem] bg-black/14 p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                      Candidate compression
                    </div>
                    <div className="mt-5 flex items-end gap-3">
                      <div>
                        <div className="text-sm text-white/44">Incoming</div>
                        <div className="mt-1 text-4xl font-semibold text-white">
                          {formatNumber(activeStage.incoming)}
                        </div>
                      </div>
                      <div className="pb-2 text-white/26">→</div>
                      <div>
                        <div className="text-sm text-white/44">Retained</div>
                        <div className="mt-1 text-4xl font-semibold text-[#dffaf4]">
                          {formatNumber(activeStage.narrowed)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.8rem] bg-black/14 p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                      What rises in this pass
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      {activeStage.traits.map((trait) => (
                        <span
                          className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/72"
                          key={trait}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="evolution">
        <Container>
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="The work is not finding more companies. The work is removing the wrong ones until what remains behaves like outbound intelligence."
              eyebrow="Opportunity evolution"
              title="Signal becomes intelligence."
            />
          </motion.div>

          <motion.div
            className="mt-16 rounded-[2.8rem] bg-white/[0.03] px-6 py-8 shadow-[0_40px_120px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:px-8"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="grid gap-8 lg:grid-cols-5">
              {evolutionStages.map((stage, index) => (
                <div className="relative" key={stage.label}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/36">
                    Stage {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-4 text-4xl font-semibold text-white">{stage.count}</div>
                  <div className="mt-3 text-xl font-semibold text-[#f5f4f8]">{stage.label}</div>
                  <p className="mt-3 max-w-xs text-sm leading-7 text-white/54">{stage.note}</p>
                  {index !== evolutionStages.length - 1 ? (
                    <div className="mt-7 hidden h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.16),rgba(255,255,255,0.02))] lg:block" />
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-10 text-lg leading-8 text-white/70">
              From <span className="font-semibold text-white">14,200 candidates</span> to{" "}
              <span className="font-semibold text-white">187 reviewed opportunities</span>:
              a controlled reduction in noise that gives outbound teams a cleaner place to focus.
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="delivery">
        <Container className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="Frithly is not an instant button. It is a weekly operating rhythm: reviewed cohorts, routing checks, QA passes, and a release that lands ready for outbound use."
              eyebrow="The weekly delivery system"
              title="High-touch delivery, on a calm cadence."
            />
            <div className="mt-8 space-y-4 text-sm leading-7 text-white/58">
              {[
                "Reviewed cohorts finalized before delivery.",
                "SMTP-aware exports prepared before handoff.",
                "Founder context preserved through the release.",
                "Operational QA built into the weekly cycle.",
              ].map((line) => (
                <div className="flex items-center gap-3" key={line}>
                  <span className="h-2 w-2 rounded-full bg-[#7ce7d1] shadow-[0_0_12px_rgba(124,231,209,0.75)]" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-4">
            {weeklyMoments.map((moment, index) => (
              <motion.div
                className="rounded-[2rem] bg-white/[0.04] px-6 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.2)] backdrop-blur-xl"
                key={moment.day}
                {...revealProps(enableReveal, 0.1 + index * 0.05)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#efba90]">
                    {moment.day}
                  </div>
                  <div className="text-sm text-white/42">{moment.time}</div>
                </div>
                <div className="mt-4 text-2xl font-semibold text-white">{moment.title}</div>
                <p className="mt-3 max-w-3xl text-base leading-8 text-white/58">{moment.body}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="icp">
        <Container>
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              align="center"
              copy="Choose an industry shape, geography, and outbound goal, then watch how the intelligence system narrows the field into a more believable cohort."
              eyebrow="Interactive ICP intelligence"
              title="Shape a cohort. Watch it form."
            />
          </motion.div>

          <motion.div
            className="mt-14 overflow-hidden rounded-[2.8rem] bg-white/[0.035] p-4 shadow-[0_36px_120px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6"
            {...revealProps(enableReveal, 0.12)}
          >
            <IcpDemoExperience />
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="builder">
        <Container className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="Start with the Frithly Core Intelligence Program from EUR 499/month, then shape the delivery around volume, coverage, targeting depth, founder priority, SMTP-aware release posture, support, and cadence."
              eyebrow="Custom program builder"
              title="Frithly is configured like a program, not sold like software."
            />

            <div className="mt-10 space-y-4 text-sm leading-7 text-white/58">
              {[
                "No fixed pricing table.",
                "No price-per-lead logic.",
                "A tailored weekly intelligence program built around outbound goals.",
              ].map((line) => (
                <div className="flex items-center gap-3" key={line}>
                  <span className="h-2 w-2 rounded-full bg-[#92cff7] shadow-[0_0_12px_rgba(146,207,247,0.78)]" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2.8rem] bg-white/[0.04] px-6 py-7 shadow-[0_36px_120px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:px-8"
            {...revealProps(enableReveal, 0.14)}
          >
            <div className="grid gap-8 xl:grid-cols-[0.98fr_1.02fr]">
              <div className="space-y-6">
                <SliderControl
                  label="Weekly opportunity target"
                  max={70}
                  min={20}
                  onChange={setWeeklyOpportunityTarget}
                  step={5}
                  value={weeklyOpportunityTarget}
                  valueLabel={`${weeklyOpportunityTarget} / week`}
                />
                <SliderControl
                  label="Targeting depth"
                  max={5}
                  min={1}
                  onChange={setTargetingDepth}
                  value={targetingDepth}
                  valueLabel={programPreview.targetingLabel}
                />

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">Geography coverage</div>
                  <div className="grid gap-3">
                    {coverageOptions.map((option) => (
                      <ChoiceCard
                        active={coverage === option.id}
                        description={option.description}
                        key={option.id}
                        label={option.label}
                        onClick={() => setCoverage(option.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">Support level</div>
                  <div className="grid gap-3">
                    {supportOptions.map((option) => (
                      <ChoiceCard
                        active={support === option.id}
                        description={option.description}
                        key={option.id}
                        label={option.label}
                        onClick={() => setSupport(option.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">Delivery cadence</div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {cadenceOptions.map((option) => (
                      <ChoiceCard
                        active={cadence === option.id}
                        description={option.description}
                        key={option.id}
                        label={option.label}
                        onClick={() => setCadence(option.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    className={cn(
                      "rounded-[1.2rem] px-4 py-4 text-left transition-colors",
                      founderPriority
                        ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(239,186,144,0.36)]"
                        : "bg-white/[0.03] text-white/72 hover:bg-white/[0.05]",
                    )}
                    onClick={() => setFounderPriority((current) => !current)}
                    type="button"
                  >
                    <div className="text-sm font-semibold text-white">Founder-priority targeting</div>
                    <p className="mt-2 text-sm leading-7 text-white/58">
                      Increase founder intelligence depth inside the final queue.
                    </p>
                  </button>
                  <button
                    className={cn(
                      "rounded-[1.2rem] px-4 py-4 text-left transition-colors",
                      smtpPriority
                        ? "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(239,186,144,0.36)]"
                        : "bg-white/[0.03] text-white/72 hover:bg-white/[0.05]",
                    )}
                    onClick={() => setSmtpPriority((current) => !current)}
                    type="button"
                  >
                    <div className="text-sm font-semibold text-white">SMTP-aware prioritization</div>
                    <p className="mt-2 text-sm leading-7 text-white/58">
                      Preserve delivery posture higher inside the release workflow.
                    </p>
                  </button>
                </div>
              </div>

              <div className="rounded-[2rem] bg-black/16 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#efba90]">
                      Your intelligence program
                    </div>
                    <div className="mt-4 text-[2.8rem] font-semibold leading-none text-white">
                      {formatEuroRange(programPreview.priceLow, programPreview.priceHigh)}
                    </div>
                  </div>
                  <div className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/74">
                    Consultative estimate
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-white/[0.04] p-5">
                    <div className="flex items-center gap-3 text-white">
                      <Globe2 className="h-4 w-4 text-[#92cff7]" />
                      <span className="font-semibold">{programPreview.coverageLabel} coverage</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/56">
                      Coverage shaped for the market footprint you want the weekly release to serve.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-white/[0.04] p-5">
                    <div className="flex items-center gap-3 text-white">
                      <ShieldCheck className="h-4 w-4 text-[#7ce7d1]" />
                      <span className="font-semibold">SMTP-aware delivery posture</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/56">
                      Deliverability stays part of the program design rather than an afterthought.
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.7rem] bg-white/[0.04] p-5">
                  <div className="text-sm font-semibold text-white">
                    {formatNumber(programPreview.monthlyReviewed)} reviewed opportunities / month
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/56">
                    {programPreview.supportLabel} · {programPreview.targetingLabel} ·{" "}
                    {cadence === "weekly" ? "Weekly intelligence cohorts" : "Bi-weekly intelligence cohorts"}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    founderPriority ? "Founder-priority targeting" : "Founder weighting relaxed",
                    smtpPriority ? "SMTP-aware prioritization" : "SMTP-safe routing baseline",
                    cadence === "weekly" ? "Weekly intelligence cohorts" : "Bi-weekly release cadence",
                  ].map((item) => (
                    <div className="flex items-center gap-3 text-sm text-white/68" key={item}>
                      <span className="h-2 w-2 rounded-full bg-[#efba90]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="roi">
        <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="Outbound inefficiency is expensive. The point is not to touch more accounts. The point is to reduce wasted outreach, protect deliverability, and focus reps on accounts more likely to convert."
              eyebrow="ROI intelligence experience"
              title="Model the cost of weak targeting."
            />

            <div className="mt-10 space-y-5">
              {[
                "Reduce wasted outreach before campaigns scale.",
                "Protect deliverability instead of repairing it later.",
                "Focus reps on accounts more likely to become real conversations.",
              ].map((line) => (
                <div className="flex items-start gap-3" key={line}>
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#7ce7d1]" />
                  <p className="text-base leading-8 text-white/62">{line}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2.8rem] bg-white/[0.035] p-4 shadow-[0_36px_120px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6"
            {...revealProps(enableReveal, 0.12)}
          >
            <RoiCalculatorExperience />
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="trust">
        <Container>
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              align="center"
              copy="Trust comes from operational depth: reviewed opportunities, deliverability discipline, founder clarity, and a release rhythm that feels believable before it feels impressive."
              eyebrow="Operational trust layer"
              title="Built to feel selective, not inflated."
            />
          </motion.div>

          <div className="mt-16 grid gap-10 lg:grid-cols-4">
            {trustSignals.map((signal, index) => {
              const Icon = signal.icon;

              return (
                <motion.div
                  className="space-y-5"
                  key={signal.title}
                  {...revealProps(enableReveal, 0.08 + index * 0.05)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-[#efba90]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{signal.title}</h3>
                    <p className="mt-3 text-base leading-8 text-white/58">{signal.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="timeline">
        <Container>
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              align="center"
              copy="A customer does not receive a random dump of accounts. They experience a controlled weekly system with review, packaging, QA, and feedback built in."
              eyebrow="Intelligence delivery timeline"
              title="What the weekly experience actually looks like."
            />
          </motion.div>

          <div className="mt-16 grid gap-6 lg:grid-cols-5">
            {deliveryTimeline.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  className="relative rounded-[2rem] bg-white/[0.035] px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl"
                  key={item.day}
                  {...revealProps(enableReveal, 0.08 + index * 0.05)}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-[#92cff7]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="mt-5 text-xl font-semibold text-white">{item.day}</div>
                  <p className="mt-3 text-sm leading-7 text-white/58">{item.copy}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="faq">
        <Container className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="A calm explanation of how Frithly differs from lead generation tools, why quality beats volume, and how the weekly delivery model works."
              eyebrow="FAQ"
              title="Questions teams usually ask before they apply."
            />
          </motion.div>

          <motion.div
            className="rounded-[2.4rem] bg-white/[0.035] px-4 py-4 shadow-[0_28px_90px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:px-6 sm:py-6"
            {...revealProps(enableReveal, 0.12)}
          >
            <Accordion className="space-y-4" collapsible type="single">
              {platformFaqs.map((faq, index) => (
                <AccordionItem
                  className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] px-4 py-1 sm:px-5"
                  key={faq.question}
                  value={`faq-${index}`}
                >
                  <AccordionTrigger className="text-left text-base font-medium text-white">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-base leading-8 text-white/62">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </Container>
      </section>

      <section className="relative pb-20 pt-8 sm:pb-24">
        <Container>
          <motion.div
            className="relative overflow-hidden rounded-[2.8rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(146,207,247,0.16),transparent_18rem),radial-gradient(circle_at_bottom,rgba(239,186,144,0.16),transparent_18rem),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-7 py-20 text-center shadow-[0_42px_140px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:px-10"
            {...revealProps(enableReveal, 0.05)}
          >
            <motion.div
              className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-[#7ce7d1]/10 blur-3xl"
              animate={reduceMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
              transition={
                reduceMotion
                  ? undefined
                  : { duration: 7.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
              }
            />
            <div className="relative mx-auto max-w-4xl">
              <SectionEyebrow>Final call to action</SectionEyebrow>
              <h2
                className={`${displayFont.className} mx-auto mt-6 max-w-4xl text-4xl leading-[0.92] text-[#f8f5f7] sm:text-5xl lg:text-6xl`}
              >
                Design your outbound intelligence program.
              </h2>
              <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/64 md:text-[1.06rem] md:leading-9">
                Every Frithly delivery is tailored around your ICP, targeting depth, opportunity
                quality, and weekly outbound goals.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="shadow-[0_24px_64px_rgba(241,186,144,0.2)]">
                  <Link href={ROUTES.APPLY}>
                    <span className="inline-flex items-center gap-2">
                      Apply for a Campaign
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="border-white/12 bg-white/[0.06] text-white hover:border-white/24 hover:bg-white/[0.1] hover:text-white"
                >
                  <Link href="#builder">Build Your Program</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
