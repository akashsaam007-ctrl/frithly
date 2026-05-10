"use client";

import Link from "next/link";
import { Fraunces, Instrument_Serif } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MailCheck,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const accentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

const engineStages = [
  {
    confidence: 24,
    id: "brief",
    incoming: "14,200",
    kept: "14,200",
    label: "ICP alignment",
    note: "The brief becomes selective before the search begins.",
    summary:
      "Industry shape, geography, commercial exclusions, and route discipline are locked before discovery expands.",
  },
  {
    confidence: 41,
    id: "discovery",
    incoming: "14,200",
    kept: "3,840",
    label: "Discovery expansion",
    note: "Coverage opens, but volume stops being the goal.",
    summary:
      "Search patterns widen carefully so the field grows only where the quality logic can still hold.",
  },
  {
    confidence: 58,
    id: "enrichment",
    incoming: "3,840",
    kept: "920",
    label: "Signal enrichment",
    note: "Context starts to separate relevance from coincidence.",
    summary:
      "Website signals, service fit, firmographic shape, and route clues turn records into credible opportunities.",
  },
  {
    confidence: 73,
    id: "ranking",
    incoming: "920",
    kept: "340",
    label: "Confidence ranking",
    note: "The queue tightens before a human ever sees it.",
    summary:
      "Deliverability posture, freshness, founder relevance, and recommendation quality narrow the working shortlist.",
  },
  {
    confidence: 91,
    id: "release",
    incoming: "340",
    kept: "187",
    label: "Weekly release",
    note: "What survives behaves like outbound intelligence, not a list.",
    summary:
      "The final cohort is reviewed, ordered, SMTP-aware, and delivered with context that makes action easier.",
  },
] as const;

const deliveryTimeline = [
  {
    copy: "The reviewed cohort is finalized against the live outbound brief.",
    day: "Monday",
    icon: CalendarDays,
    time: "09:00 GMT",
  },
  {
    copy: "Founder notes and draft direction sharpen around the strongest accounts.",
    day: "Tuesday",
    icon: Sparkles,
    time: "12:00 GMT",
  },
  {
    copy: "Exports, route context, and release packaging are assembled.",
    day: "Wednesday",
    icon: Send,
    time: "10:00 GMT",
  },
  {
    copy: "QA removes anything that no longer deserves a place in the release.",
    day: "Thursday",
    icon: CheckCircle2,
    time: "14:00 GMT",
  },
  {
    copy: "Outcome signals inform how the next week’s shortlist gets tighter.",
    day: "Friday",
    icon: Radar,
    time: "16:00 GMT",
  },
] as const;

const trustPoints = [
  {
    body: "Every cohort is reviewed before delivery, so the product includes judgment, not just collection.",
    icon: ShieldCheck,
    title: "Reviewed opportunities",
  },
  {
    body: "Deliverability is part of the release logic itself, not a cleanup step after the list exists.",
    icon: MailCheck,
    title: "SMTP-aware release",
  },
  {
    body: "Founder confidence and decision-maker clarity influence what rises, not just what gets displayed.",
    icon: Users,
    title: "Founder intelligence",
  },
  {
    body: "Ordering, notes, and release context make execution calmer once the cohort reaches the team.",
    icon: Target,
    title: "Operational readiness",
  },
] as const;

const industries = [
  {
    headline: "Founder-led agencies with clear positioning and reachable decision-makers.",
    id: "agencies",
    label: "Agencies",
    query: "SEO agencies · performance agencies · niche service firms",
    opportunities: [
      { company: "Northline Studio", note: "Founder-owned growth agency · clear route", score: 94 },
      { company: "Harbour Search", note: "Selective positioning · high service fit", score: 91 },
      { company: "Signal Foundry", note: "Premium contactability · strong outbound angle", score: 88 },
    ],
  },
  {
    headline: "Smaller B2B software teams where route quality matters more than list size.",
    id: "saas",
    label: "B2B SaaS",
    query: "Vertical SaaS · workflow tools · specialist software",
    opportunities: [
      { company: "Arclet Ops", note: "Growing product team · crisp ICP match", score: 93 },
      { company: "Relay Ledger", note: "Strong founder signal · stable route posture", score: 89 },
      { company: "Northbeam Flow", note: "Recent momentum · selective relevance", score: 86 },
    ],
  },
  {
    headline: "Specialist services where a better shortlist changes who the team spends time on.",
    id: "services",
    label: "Specialist services",
    query: "Industrial services · boutique consultancies · niche providers",
    opportunities: [
      { company: "Ridgepoint Advisory", note: "Founder visible · narrow commercial fit", score: 92 },
      { company: "Atlas Process", note: "High-value motion · route quality intact", score: 87 },
      { company: "Morrow Partners", note: "Selective release candidate · good timing", score: 84 },
    ],
  },
] as const;

const geographies = [
  { density: "Tighter release density", id: "uk", label: "UK" },
  { density: "Broader weekly coverage", id: "uk-eu", label: "UK + EU" },
  { density: "Transatlantic expansion", id: "na", label: "North America" },
] as const;

const goals = [
  { id: "founders", label: "Founder conversations", result: "Founder confidence weighted higher inside the queue." },
  { id: "quality", label: "Pipeline quality", result: "Recommendation strength weighted over list expansion." },
  { id: "delivery", label: "Deliverability-safe growth", result: "Route posture becomes stricter before release." },
] as const;

const coverageOptions = [
  { description: "Focused market coverage with denser signal quality.", id: "uk", label: "UK" },
  { description: "Balanced coverage for broader weekly cohorts.", id: "uk-eu", label: "UK + EU" },
  { description: "Expanded transatlantic coverage for larger programs.", id: "global", label: "UK + EU + US" },
] as const;

const supportOptions = [
  { description: "Reviewed intelligence with ranking logic and release context.", id: "core", label: "Core intelligence" },
  { description: "Adds curated draft refinement for stronger handoffs.", id: "drafts", label: "Draft support" },
  { description: "Higher-touch weekly support around delivery and use.", id: "delivery", label: "Delivery support" },
] as const;

const cadenceOptions = [
  { description: "A reviewed release every Monday.", id: "weekly", label: "Weekly" },
  { description: "A lighter cadence for longer cycles.", id: "biweekly", label: "Bi-weekly" },
] as const;

type IndustryId = (typeof industries)[number]["id"];
type GeographyId = (typeof geographies)[number]["id"];
type GoalId = (typeof goals)[number]["id"];
type CoverageOption = (typeof coverageOptions)[number]["id"];
type SupportOption = (typeof supportOptions)[number]["id"];
type CadenceOption = (typeof cadenceOptions)[number]["id"];

function revealProps(enableAnimation: boolean, delay = 0) {
  if (!enableAnimation) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 24 },
    transition: { delay, duration: 0.72, ease: [0.22, 1, 0.36, 1] as const },
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#efba90]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#efba90]" />
      {children}
    </div>
  );
}

function ItalicAccent({ children }: { children: string }) {
  return <span className={`${accentSerif.className} font-normal text-[#efba90]`}>{children}</span>;
}

function SectionIntro({
  align = "left",
  children,
  copy,
  eyebrow,
}: {
  align?: "center" | "left";
  children: React.ReactNode;
  copy: string;
  eyebrow: string;
}) {
  return (
    <div className={cn("space-y-5", align === "center" && "mx-auto max-w-3xl text-center")}>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <h2
        className={cn(
          displayFont.className,
          "max-w-4xl text-[2.35rem] leading-[1.02] tracking-[-0.03em] text-[#f6f3f7] sm:text-[3rem] lg:text-[3.8rem]",
          align === "center" && "mx-auto",
        )}
      >
        {children}
      </h2>
      <p
        className={cn(
          "max-w-2xl text-base leading-8 text-white/62 md:text-[1.02rem]",
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
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-sm text-white/54">{valueLabel}</span>
      </div>
      <input
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#efba90]"
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

function ChoiceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-full px-4 py-2.5 text-sm transition-colors",
        active ? "bg-white text-[#08111d]" : "bg-white/[0.05] text-white/72 hover:bg-white/[0.09]",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function PlatformHomepage() {
  const reduceMotion = useReducedMotion() ?? false;
  const [hasMounted, setHasMounted] = useState(false);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [enginePanelOffset, setEnginePanelOffset] = useState(0);
  const [industry, setIndustry] = useState<IndustryId>("agencies");
  const [geography, setGeography] = useState<GeographyId>("uk-eu");
  const [goal, setGoal] = useState<GoalId>("quality");
  const [weeklyOpportunityTarget, setWeeklyOpportunityTarget] = useState(45);
  const [targetingDepth, setTargetingDepth] = useState(3);
  const [coverage, setCoverage] = useState<CoverageOption>("uk-eu");
  const [support, setSupport] = useState<SupportOption>("delivery");
  const [cadence, setCadence] = useState<CadenceOption>("weekly");
  const [founderPriority, setFounderPriority] = useState(true);
  const [smtpPriority, setSmtpPriority] = useState(true);
  const [outreachVolume, setOutreachVolume] = useState(120);
  const [replyRate, setReplyRate] = useState(3);
  const [clientValue, setClientValue] = useState(8000);
  const engineTimelineRef = useRef<HTMLDivElement | null>(null);
  const enginePanelRef = useRef<HTMLDivElement | null>(null);
  const engineStageRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveStageIndex((current) => (current + 1) % engineStages.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  useEffect(() => {
    function measureEnginePanelOffset() {
      if (typeof window === "undefined" || window.innerWidth < 1024) {
        setEnginePanelOffset(0);
        return;
      }

      const firstStage = engineStageRefs.current[0];
      const activeStage = engineStageRefs.current[activeStageIndex];
      const lastStage = engineStageRefs.current[engineStages.length - 1];
      const timeline = engineTimelineRef.current;
      const panel = enginePanelRef.current;

      if (!firstStage || !activeStage || !lastStage || !timeline || !panel) {
        return;
      }

      const firstRect = firstStage.getBoundingClientRect();
      const activeRect = activeStage.getBoundingClientRect();
      const lastRect = lastStage.getBoundingClientRect();
      const verticalRange = Math.max(lastRect.top - firstRect.top, 1);
      const progress = (activeRect.top - firstRect.top) / verticalRange;
      const maxTravel = Math.max(
        0,
        Math.min(timeline.scrollHeight - panel.offsetHeight, 320),
      );

      setEnginePanelOffset(progress * maxTravel);
    }

    const frame = window.requestAnimationFrame(measureEnginePanelOffset);
    window.addEventListener("resize", measureEnginePanelOffset);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", measureEnginePanelOffset);
    };
  }, [activeStageIndex]);

  const enableReveal = hasMounted && !reduceMotion;
  const activeStage = engineStages[activeStageIndex];

  const selectedIndustry = industries.find((item) => item.id === industry) ?? industries[0];
  const selectedGeography = geographies.find((item) => item.id === geography) ?? geographies[1];
  const selectedGoal = goals.find((item) => item.id === goal) ?? goals[1];

  const icpPreview = useMemo(() => {
    const geoMultiplier = geography === "uk" ? 0 : geography === "uk-eu" ? 1 : 2;
    const goalLift = goal === "founders" ? 3 : goal === "delivery" ? 2 : 1;

    return {
      cohortSize: 168 + geoMultiplier * 24,
      density: geography === "uk" ? "Highest concentration" : geography === "uk-eu" ? "Balanced concentration" : "Broader coverage",
      signal: selectedGoal.result,
      opportunities: selectedIndustry.opportunities.map((opportunity, index) => ({
        ...opportunity,
        score: clamp(opportunity.score - index + goalLift + geoMultiplier, 78, 97),
      })),
    };
  }, [geography, goal, selectedGoal.result, selectedIndustry.opportunities]);

  const programPreview = useMemo(() => {
    const monthlyReviewed = weeklyOpportunityTarget * (cadence === "weekly" ? 4 : 2);
    const coverageCost = coverage === "uk" ? 0 : coverage === "uk-eu" ? 260 : 460;
    const supportCost = support === "core" ? 0 : support === "drafts" ? 180 : 340;
    const founderCost = founderPriority ? 140 : 0;
    const smtpCost = smtpPriority ? 95 : 0;
    const depthCost = targetingDepth * 120;
    const volumeCost = weeklyOpportunityTarget * 4;
    const cadenceCost = cadence === "weekly" ? 170 : 0;
    const low =
      499 +
      coverageCost +
      supportCost +
      founderCost +
      smtpCost +
      depthCost +
      volumeCost +
      cadenceCost;
    const high = low + 240 + targetingDepth * 35 + (support === "delivery" ? 120 : 40);

    return {
      coverageLabel:
        coverageOptions.find((item) => item.id === coverage)?.label ?? "UK + EU",
      monthlyReviewed,
      rangeHigh: high,
      rangeLow: low,
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

  const roiModel = useMemo(() => {
    const improvedReplyRate = Math.min(Math.max(replyRate * 2.5, replyRate + 3), 15);
    const currentReplies = outreachVolume * (replyRate / 100);
    const improvedReplies = outreachVolume * (improvedReplyRate / 100);
    const extraReplies = improvedReplies - currentReplies;
    const extraMeetings = extraReplies * 0.4;
    const extraRevenue = (extraMeetings / 5) * clientValue;

    return {
      extraMeetings,
      extraReplies,
      extraRevenue,
      ignoredCurrent: 100 - Math.round(replyRate),
      ignoredImproved: 100 - Math.round(improvedReplyRate),
      improvedReplies: Math.round(improvedReplyRate),
      improvedReplyRate,
      replyMultiplier: improvedReplies / Math.max(currentReplies, 1),
    };
  }, [clientValue, outreachVolume, replyRate]);

  return (
    <div className="relative overflow-hidden bg-[#050915] text-[#f6f3f7]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,122,180,0.14),transparent_22rem),radial-gradient(circle_at_80%_12%,rgba(239,186,144,0.08),transparent_20rem),linear-gradient(180deg,#050915_0%,#07101b_44%,#060a14_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:112px_112px] opacity-[0.03]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[10rem] h-72 w-72 rounded-full bg-[#7598e8]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-[30rem] h-80 w-80 rounded-full bg-[#efba90]/10 blur-3xl" />

      <section className="relative pb-24 pt-28 sm:pb-28 sm:pt-36">
        <Container className="grid gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <motion.div {...revealProps(enableReveal, 0.04)}>
            <SectionEyebrow>Curated outbound intelligence</SectionEyebrow>
            <h1
              className={cn(
                displayFont.className,
                "mt-7 max-w-[12ch] text-[3.5rem] leading-[0.92] tracking-[-0.04em] text-[#f8f5f8] sm:text-[4.6rem] lg:text-[5.8rem]",
              )}
            >
              Curated outbound intelligence{" "}
              <ItalicAccent>delivered weekly.</ItalicAccent>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/62 md:text-[1.08rem] md:leading-9">
              Frithly helps outbound teams discover higher-confidence opportunities through
              reviewed intelligence, founder targeting, SMTP-aware routing, and a weekly release
              rhythm designed to keep quality intact.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="shadow-[0_20px_60px_rgba(239,186,144,0.16)]">
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
                className="border-white/10 bg-white/[0.05] text-white hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
              >
                <Link href="#engine">Explore the workflow</Link>
              </Button>
            </div>

            <div className="mt-10 grid max-w-2xl gap-5 sm:grid-cols-3">
              {[
                ["Reviewed weekly", "187 accounts"],
                ["Deliverability first", "SMTP-aware release"],
                ["Delivery rhythm", "Every Monday"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/36">{label}</div>
                  <div className="mt-2 text-lg font-medium text-white">{value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-7 shadow-[0_36px_120px_rgba(0,0,0,0.28)]"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(117,152,232,0.18),transparent_16rem),radial-gradient(circle_at_bottom_right,rgba(239,186,144,0.14),transparent_18rem)]" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#efba90]">
                    Monday release
                  </div>
                  <div className="mt-2 text-2xl font-medium text-white">Cohort 24 / W19</div>
                </div>
                <div className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/72">
                  Release ready
                </div>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-[0.78fr_0.22fr]">
                <div className="space-y-3">
                  {[
                    ["Astralis Industries", "Founder route · UK · reviewed", 94],
                    ["Northwave Robotics", "SMTP-safe path · DE · high fit", 91],
                    ["Harbour Search", "Selective release · founder-aware", 88],
                  ].map(([company, meta, score]) => (
                    <div
                      className="flex items-center justify-between gap-4 rounded-[1.25rem] bg-black/16 px-4 py-4"
                      key={company}
                    >
                      <div>
                        <div className="text-base font-medium text-white">{company}</div>
                        <div className="mt-1 text-sm text-white/48">{meta}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-[0.18em] text-white/34">score</div>
                        <div className="mt-1 text-xl font-medium text-white">{score}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center">
                  <motion.div
                    className="flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white/10 bg-[#0a121f] text-center"
                    animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
                    transition={
                      reduceMotion
                        ? undefined
                        : { duration: 6, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
                    }
                  >
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#efba90]">
                      Confidence
                    </div>
                    <div className="mt-2 text-5xl font-medium text-white">94</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/34">
                      release score
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/58">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#79e2cb]" />
                  SMTP-aware routing
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#efba90]" />
                  Founder-priority ranking
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#8fbef6]" />
                  Weekly reviewed cohort
                </span>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="failure">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="Mass outbound optimizes for list volume. Frithly is built for the opposite: fewer accounts, stronger conviction, cleaner routes, and a release rhythm that protects quality all the way through delivery."
              eyebrow="Why most outbound underperforms"
            >
              Better opportunities outperform <ItalicAccent>bigger lists.</ItalicAccent>
            </SectionIntro>
          </motion.div>

          <motion.div className="grid gap-8 lg:grid-cols-2" {...revealProps(enableReveal, 0.12)}>
            <div className="space-y-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">
                Traditional outbound
              </div>
              <h3 className="text-2xl font-medium text-white">Volume creates activity, not certainty.</h3>
              <p className="text-base leading-8 text-white/58">
                Generic scraping, unverified contacts, weak routing, and shallow context make the
                whole system look busy while the team spends time on accounts that never deserved it.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Mass outbound optimizes for coverage, not fit.",
                  "Weak contactability raises bounce and spam risk.",
                  "The list gets bigger while confidence gets thinner.",
                ].map((line) => (
                  <div className="flex items-start gap-3 text-sm leading-7 text-white/56" key={line}>
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ff9c98]" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#efba90]">
                Frithly
              </div>
              <h3 className="text-2xl font-medium text-white">The shortlist gets smaller while conviction rises.</h3>
              <p className="text-base leading-8 text-white/58">
                Reviewed accounts, founder intelligence, SMTP-aware routing, and a weekly cohort
                release turn the work into a system that is calm enough to trust.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Founder relevance influences what reaches the final queue.",
                  "Deliverability is protected before release, not repaired after.",
                  "Every Monday lands like a prepared cohort, not a dump of records.",
                ].map((line) => (
                  <div className="flex items-start gap-3 text-sm leading-7 text-white/56" key={line}>
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#79e2cb]" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="engine">
        <Container>
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              align="center"
              copy="The system does not jump from search to delivery. It narrows quality in stages, so the final release feels selective by design."
              eyebrow="The living intelligence engine"
            >
              A calmer process creates a <ItalicAccent>stronger release.</ItalicAccent>
            </SectionIntro>
          </motion.div>

          <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <motion.div
              className="space-y-8"
              ref={engineTimelineRef}
              {...revealProps(enableReveal, 0.1)}
            >
              {engineStages.map((stage, index) => {
                const active = index === activeStageIndex;

                return (
                  <button
                    className="group flex w-full items-start gap-5 text-left"
                    key={stage.id}
                    onFocus={() => setActiveStageIndex(index)}
                    onClick={() => setActiveStageIndex(index)}
                    onMouseEnter={() => setActiveStageIndex(index)}
                    ref={(element) => {
                      engineStageRefs.current[index] = element;
                    }}
                    type="button"
                  >
                    <div className="flex flex-col items-center pt-1">
                      <div
                        className={cn(
                          "h-3 w-3 rounded-full transition-colors",
                          active ? "bg-[#efba90]" : "bg-white/18 group-hover:bg-white/32",
                        )}
                      />
                      {index !== engineStages.length - 1 ? (
                        <div className="mt-3 h-16 w-px bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))]" />
                      ) : null}
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/34">
                        Stage {String(index + 1).padStart(2, "0")} · {stage.label}
                      </div>
                      <div
                        className={cn(
                          "mt-3 text-2xl font-medium transition-colors",
                          active ? "text-white" : "text-white/66 group-hover:text-white/88",
                        )}
                      >
                        {stage.note}
                      </div>
                      <p className="mt-3 max-w-xl text-base leading-8 text-white/56">{stage.summary}</p>
                    </div>
                  </button>
                );
              })}
            </motion.div>

            <motion.div
              className="self-start lg:sticky lg:top-28"
              {...revealProps(enableReveal, 0.16)}
            >
              <motion.div
                animate={{ y: reduceMotion ? 0 : enginePanelOffset }}
                ref={enginePanelRef}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="rounded-[2rem] bg-white/[0.04] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.22)]">
                  <motion.div
                    key={activeStage.id}
                    initial={enableReveal ? { opacity: 0.5, y: 18 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                          Active pass
                        </div>
                        <h3 className="mt-3 text-3xl font-medium text-white">{activeStage.label}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/34">confidence</div>
                        <div className="mt-1 text-4xl font-medium text-white">{activeStage.confidence}%</div>
                      </div>
                    </div>

                    <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-[linear-gradient(90deg,#79e2cb,#8fbef6,#efba90)]"
                        initial={false}
                        animate={{ width: `${activeStage.confidence}%` }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                      />
                    </div>

                    <div className="mt-9 grid gap-6 sm:grid-cols-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/34">incoming pool</div>
                        <div className="mt-2 text-4xl font-medium text-white">{activeStage.incoming}</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/34">retained here</div>
                        <div className="mt-2 text-4xl font-medium text-white">{activeStage.kept}</div>
                      </div>
                    </div>

                    <p className="mt-8 max-w-2xl text-base leading-8 text-white/58">
                      {activeStage.summary}
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="delivery">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="Frithly is not instant SaaS automation. It is a weekly operating rhythm with review, packaging, QA, and release discipline built in."
              eyebrow="The weekly delivery system"
            >
              Every cohort arrives on a <ItalicAccent>calm cadence.</ItalicAccent>
            </SectionIntro>
            <div className="mt-8 space-y-3">
              {[
                "Reviewed cohorts finalized before delivery.",
                "Founder context and routing notes preserved through release.",
                "QA holds anything that no longer belongs in the cohort.",
              ].map((line) => (
                <div className="flex items-start gap-3 text-sm leading-7 text-white/56" key={line}>
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#79e2cb]" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="space-y-6">
            {deliveryTimeline.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  className="grid gap-4 border-t border-white/8 pt-6 first:border-t-0 first:pt-0 sm:grid-cols-[120px_minmax(0,1fr)]"
                  key={item.day}
                  {...revealProps(enableReveal, 0.1 + index * 0.05)}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-white">{item.day}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-white/36">{item.time}</div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] text-[#efba90]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <p className="max-w-2xl text-base leading-8 text-white/58">{item.copy}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="icp">
        <Container>
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              align="center"
              copy="Choose an industry shape, geography, and outbound goal. The preview below shows how the weekly cohort changes when the brief changes."
              eyebrow="Interactive ICP preview"
            >
              Shape a cohort. Watch the shortlist <ItalicAccent>tighten.</ItalicAccent>
            </SectionIntro>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-10 rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:p-8"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="space-y-8">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                  Industry
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {industries.map((item) => (
                    <ChoiceButton
                      active={industry === item.id}
                      key={item.id}
                      label={item.label}
                      onClick={() => setIndustry(item.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                  Geography
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {geographies.map((item) => (
                    <ChoiceButton
                      active={geography === item.id}
                      key={item.id}
                      label={item.label}
                      onClick={() => setGeography(item.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                  Priority
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {goals.map((item) => (
                    <ChoiceButton
                      active={goal === item.id}
                      key={item.id}
                      label={item.label}
                      onClick={() => setGoal(item.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-black/14 p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/34">Search pattern</div>
                <div className="mt-3 text-base leading-8 text-white/66">{selectedIndustry.query}</div>
                <div className="mt-5 text-[11px] uppercase tracking-[0.2em] text-white/34">What changes</div>
                <div className="mt-2 text-sm leading-7 text-white/58">{selectedGoal.result}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                  Cohort preview
                </div>
                <h3 className="mt-3 text-3xl font-medium text-white">{selectedIndustry.headline}</h3>
                <p className="mt-4 max-w-3xl text-base leading-8 text-white/60">
                  {selectedGeography.density}. {icpPreview.signal}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Reviewed cohort</div>
                  <div className="mt-2 text-3xl font-medium text-white">{icpPreview.cohortSize}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Premium density</div>
                  <div className="mt-2 text-3xl font-medium text-white">
                    {geography === "uk" ? "84%" : geography === "uk-eu" ? "78%" : "71%"}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">SMTP-safe routes</div>
                  <div className="mt-2 text-3xl font-medium text-white">
                    {geography === "uk" ? "112" : geography === "uk-eu" ? "134" : "148"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {icpPreview.opportunities.map((opportunity) => (
                  <div
                    className="flex items-center justify-between gap-4 rounded-[1.2rem] bg-black/14 px-4 py-4"
                    key={opportunity.company}
                  >
                    <div>
                      <div className="text-base font-medium text-white">{opportunity.company}</div>
                      <div className="mt-1 text-sm text-white/48">{opportunity.note}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] uppercase tracking-[0.16em] text-white/34">score</div>
                      <div className="mt-1 text-2xl font-medium text-white">{opportunity.score}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button asChild size="lg">
                  <Link href={ROUTES.APPLY}>
                    <span className="inline-flex items-center gap-2">
                      Apply with this brief
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="builder">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="There is no standard SaaS plan here. Start with the Frithly Core Intelligence Program from €499/month, then shape the release around coverage, depth, support, and weekly operating goals."
              eyebrow="Custom program builder"
            >
              Frithly is configured like a <ItalicAccent>program, not software.</ItalicAccent>
            </SectionIntro>
          </motion.div>

          <motion.div
            className="grid gap-10 rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:p-8"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="space-y-8">
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

              <div className="space-y-4">
                <div className="text-sm font-medium text-white">Geography coverage</div>
                {coverageOptions.map((option) => (
                  <button
                    className={cn(
                      "block w-full rounded-[1.2rem] px-4 py-4 text-left transition-colors",
                      coverage === option.id
                        ? "bg-white text-[#08111d]"
                        : "bg-white/[0.05] text-white/72 hover:bg-white/[0.09]",
                    )}
                    key={option.id}
                    onClick={() => setCoverage(option.id)}
                    type="button"
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className={cn("mt-2 text-sm", coverage === option.id ? "text-[#08111d]/70" : "text-white/50")}>
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="text-sm font-medium text-white">Support level</div>
                {supportOptions.map((option) => (
                  <button
                    className={cn(
                      "block w-full rounded-[1.2rem] px-4 py-4 text-left transition-colors",
                      support === option.id
                        ? "bg-white text-[#08111d]"
                        : "bg-white/[0.05] text-white/72 hover:bg-white/[0.09]",
                    )}
                    key={option.id}
                    onClick={() => setSupport(option.id)}
                    type="button"
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className={cn("mt-2 text-sm", support === option.id ? "text-[#08111d]/70" : "text-white/50")}>
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {cadenceOptions.map((option) => (
                  <ChoiceButton
                    active={cadence === option.id}
                    key={option.id}
                    label={option.label}
                    onClick={() => setCadence(option.id)}
                  />
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  className={cn(
                    "rounded-[1.2rem] px-4 py-4 text-left transition-colors",
                    founderPriority ? "bg-white/[0.1] text-white" : "bg-white/[0.05] text-white/68 hover:bg-white/[0.08]",
                  )}
                  onClick={() => setFounderPriority((current) => !current)}
                  type="button"
                >
                  <div className="font-medium">Founder-priority targeting</div>
                  <div className="mt-2 text-sm text-white/54">
                    Raise decision-maker confidence inside the final queue.
                  </div>
                </button>
                <button
                  className={cn(
                    "rounded-[1.2rem] px-4 py-4 text-left transition-colors",
                    smtpPriority ? "bg-white/[0.1] text-white" : "bg-white/[0.05] text-white/68 hover:bg-white/[0.08]",
                  )}
                  onClick={() => setSmtpPriority((current) => !current)}
                  type="button"
                >
                  <div className="font-medium">SMTP-aware prioritization</div>
                  <div className="mt-2 text-sm text-white/54">
                    Keep deliverability posture higher inside the release workflow.
                  </div>
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-black/16 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                    Your intelligence program
                  </div>
                  <div className="mt-4 text-[2.8rem] font-medium leading-none text-white">
                    {formatEuroRange(programPreview.rangeLow, programPreview.rangeHigh)}
                  </div>
                </div>
                <div className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/70">
                  Consultative estimate
                </div>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Monthly reviewed volume</div>
                  <div className="mt-2 text-3xl font-medium text-white">{programPreview.monthlyReviewed}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Coverage</div>
                  <div className="mt-2 text-3xl font-medium text-white">{programPreview.coverageLabel}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Support level</div>
                  <div className="mt-2 text-3xl font-medium text-white">{programPreview.supportLabel}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Cadence</div>
                  <div className="mt-2 text-3xl font-medium text-white">
                    {cadence === "weekly" ? "Weekly" : "Bi-weekly"}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3 border-t border-white/8 pt-6">
                {[
                  founderPriority ? "Founder-priority targeting remains active." : "Founder weighting stays balanced.",
                  smtpPriority ? "SMTP-aware release posture remains strict." : "SMTP-safe routing remains baseline.",
                  `Targeting depth: ${programPreview.targetingLabel}.`,
                ].map((line) => (
                  <div className="flex items-start gap-3 text-sm leading-7 text-white/56" key={line}>
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#79e2cb]" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="roi">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-start">
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="The point is not to email more businesses. The point is to waste fewer touches, protect deliverability earlier, and let the team spend time where a real conversation is more plausible."
              eyebrow="Opportunity impact"
            >
              Weak targeting has a <ItalicAccent>monthly cost.</ItalicAccent>
            </SectionIntro>
            <div className="mt-8 space-y-3">
              {[
                "Reduce wasted outreach before campaigns scale.",
                "Protect route quality instead of repairing it later.",
                "Focus reps on accounts more likely to convert.",
              ].map((line) => (
                <div className="flex items-start gap-3 text-sm leading-7 text-white/56" key={line}>
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#efba90]" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="grid gap-8 rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:p-8"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="space-y-8">
              <SliderControl
                label="Monthly businesses contacted"
                max={500}
                min={50}
                onChange={setOutreachVolume}
                step={10}
                value={outreachVolume}
                valueLabel={`${outreachVolume} / month`}
              />
              <SliderControl
                label="Current reply rate"
                max={10}
                min={1}
                onChange={setReplyRate}
                step={0.5}
                value={replyRate}
                valueLabel={`${replyRate.toFixed(replyRate % 1 === 0 ? 0 : 1)}%`}
              />
              <SliderControl
                label="Average client value"
                max={20000}
                min={2000}
                onChange={setClientValue}
                step={500}
                value={clientValue}
                valueLabel={formatMoney(clientValue)}
              />

              <div className="space-y-3">
                <div className="text-sm font-medium text-white">Quick scenarios</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    [100, 2, 5000, "Lean agency"],
                    [180, 4, 9000, "Growth team"],
                    [150, 3, 12000, "Higher-ticket services"],
                  ].map(([volume, rate, value, label]) => (
                    <button
                      className="rounded-full bg-white/[0.05] px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/[0.09]"
                      key={label}
                      onClick={() => {
                        setOutreachVolume(volume as number);
                        setReplyRate(rate as number);
                        setClientValue(value as number);
                      }}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-7">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                  Estimated opportunity leakage
                </div>
                <h3 className="mt-4 max-w-xl text-[2.5rem] font-medium leading-[1.02] text-white">
                  You could be leaving {formatMoney(roiModel.extraRevenue)} / month on the table.
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
                  With stronger targeting, the same team could create more replies and more meetings
                  without increasing outreach volume.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Extra replies</div>
                  <div className="mt-2 text-3xl font-medium text-white">{roiModel.extraReplies.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Extra meetings</div>
                  <div className="mt-2 text-3xl font-medium text-white">{roiModel.extraMeetings.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Reply uplift</div>
                  <div className="mt-2 text-3xl font-medium text-white">
                    {roiModel.replyMultiplier.toFixed(1)}×
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.3rem] bg-black/16 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">Today</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/36">
                        Out of 100 leads
                      </div>
                    </div>
                    <div className="text-sm text-white/70">{Math.round(replyRate)} reply</div>
                  </div>
                  <div className="mt-4 grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 100 }, (_, index) => (
                      <div
                        className={cn(
                          "h-3 rounded-[0.28rem]",
                          index < Math.round(replyRate) ? "bg-[#efba90]" : "bg-white/10",
                        )}
                        key={`current-${index}`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-white/54">
                    {roiModel.ignoredCurrent} ignore · {Math.round(replyRate)} reply
                  </div>
                </div>

                <div className="rounded-[1.3rem] bg-black/16 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">With better targeting</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/36">
                        Out of 100 leads
                      </div>
                    </div>
                    <div className="text-sm text-white/70">{roiModel.improvedReplies} reply</div>
                  </div>
                  <div className="mt-4 grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 100 }, (_, index) => (
                      <div
                        className={cn(
                          "h-3 rounded-[0.28rem]",
                          index < roiModel.improvedReplies ? "bg-[#79e2cb]" : "bg-white/10",
                        )}
                        key={`improved-${index}`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 text-sm text-white/54">
                    {roiModel.ignoredImproved} ignore · {roiModel.improvedReplies} reply
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="trust">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="Trust comes from operational depth: reviewed opportunities, route discipline, founder clarity, and a release rhythm that feels believable before it feels impressive."
              eyebrow="Operational trust"
            >
              This is designed to feel <ItalicAccent>selective, not inflated.</ItalicAccent>
            </SectionIntro>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2">
            {trustPoints.map((point, index) => {
              const Icon = point.icon;

              return (
                <motion.div key={point.title} {...revealProps(enableReveal, 0.1 + index * 0.05)}>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] text-[#efba90]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-white">{point.title}</h3>
                      <p className="mt-3 text-base leading-8 text-white/58">{point.body}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="faq">
        <Container>
          <motion.div className="mx-auto max-w-3xl" {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              align="center"
              copy="Calm answers to the most common questions about how Frithly works and why it is structured this way."
              eyebrow="Frequently asked"
            >
              Questions teams ask before they <ItalicAccent>apply.</ItalicAccent>
            </SectionIntro>
          </motion.div>

          <motion.div
            className="mx-auto mt-14 max-w-4xl"
            {...revealProps(enableReveal, 0.12)}
          >
            <Accordion className="space-y-4" collapsible type="single">
              {platformFaqs.map((faq, index) => (
                <AccordionItem
                  className="rounded-[1.5rem] bg-white/[0.04] px-5 py-1"
                  key={faq.question}
                  value={`faq-${index}`}
                >
                  <AccordionTrigger className="text-left text-base font-medium text-white">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-base leading-8 text-white/60">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </Container>
      </section>

      <section className="relative overflow-hidden pb-24 pt-10 sm:pb-28" id="apply">
        <Container>
          <motion.div
            className="overflow-hidden rounded-[2.2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-7 py-20 text-center shadow-[0_40px_140px_rgba(0,0,0,0.28)]"
            {...revealProps(enableReveal, 0.05)}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-40 max-w-xl rounded-full bg-[#7598e8]/10 blur-3xl" />
            <SectionEyebrow>Final call to action</SectionEyebrow>
            <h2
              className={cn(
                displayFont.className,
                "mx-auto mt-6 max-w-4xl text-[2.6rem] leading-[1.02] tracking-[-0.03em] text-[#f7f4f8] sm:text-[3.4rem] lg:text-[4.2rem]",
              )}
            >
              Design your <ItalicAccent>outbound intelligence program.</ItalicAccent>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/62 md:text-[1.05rem] md:leading-9">
              Every Frithly delivery is tailored around your ICP, targeting depth, opportunity
              quality, and weekly outbound goals.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
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
                className="border-white/10 bg-white/[0.05] text-white hover:border-white/18 hover:bg-white/[0.08] hover:text-white"
              >
                <Link href={ROUTES.CONTACT}>Talk through your brief</Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
