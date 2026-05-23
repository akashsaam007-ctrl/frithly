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
    label: "ICP fit",
    note: "The brief gets specific before search starts.",
    summary:
      "Industry, geography, exclusions, and buyer roles are locked first so wide collection can still stay commercially relevant.",
  },
  {
    confidence: 41,
    id: "discovery",
    incoming: "14,200",
    kept: "3,840",
    label: "Wide collection",
    note: "Coverage expands before filtering gets strict.",
    summary:
      "Search, directories, and website discovery collect far more companies than the final brief ever needs.",
  },
  {
    confidence: 58,
    id: "enrichment",
    incoming: "3,840",
    kept: "920",
    label: "Business context",
    note: "Each company gets timing, fit, and contact context.",
    summary:
      "Website signals, service fit, team pages, and contact paths turn raw domains into workable outbound opportunities.",
  },
  {
    confidence: 73,
    id: "ranking",
    incoming: "920",
    kept: "340",
    label: "Opportunity ranking",
    note: "The shortlist gets smaller while confidence goes up.",
    summary:
      "Buying intent, ICP fit, deliverability, and messaging context decide which accounts deserve rep time.",
  },
  {
    confidence: 91,
    id: "release",
    incoming: "340",
    kept: "187",
    label: "Weekly brief",
    note: "Your team gets a smaller list with better timing.",
    summary:
      "The final brief is reviewed, prioritized, and shipped with context your reps can use immediately.",
  },
] as const;

const deliveryTimeline = [
  {
    copy: "The raw pool is narrowed into the first high-fit shortlist.",
    day: "Monday",
    icon: CalendarDays,
    time: "09:00 GMT",
  },
  {
    copy: "Why-now signals and decision-maker context are added to the strongest accounts.",
    day: "Tuesday",
    icon: Sparkles,
    time: "12:00 GMT",
  },
  {
    copy: "Contacts, deliverability notes, and outreach angles are tightened.",
    day: "Wednesday",
    icon: Send,
    time: "10:00 GMT",
  },
  {
    copy: "Human review removes weak fits and stale accounts before release.",
    day: "Thursday",
    icon: CheckCircle2,
    time: "14:00 GMT",
  },
  {
    copy: "Reply feedback and outbound learning shape what gets prioritized next.",
    day: "Friday",
    icon: Radar,
    time: "16:00 GMT",
  },
] as const;

const trustPoints = [
  {
    body: "Every brief is checked before delivery, so your team works a vetted shortlist instead of raw exported data.",
    icon: ShieldCheck,
    title: "Human-reviewed before release",
  },
  {
    body: "Deliverability risk is filtered earlier, so scaling outbound does not create unnecessary domain damage.",
    icon: MailCheck,
    title: "Protect deliverability",
  },
  {
    body: "Signal strength, decision-maker fit, and timing help the best opportunities rise to the top first.",
    icon: Users,
    title: "Prioritized by buying intent",
  },
  {
    body: "Each release is packaged so reps can move faster with clearer accounts, better angles, and less prep work.",
    icon: Target,
    title: "Ready for reps",
  },
] as const;

const opportunityBreakdown = [
  { label: "Signal detected", value: "Posted 4 SDR roles in the last 10 days" },
  { label: "Why it matters", value: "Outbound capacity is growing, so pipeline quality pressure usually shows up next" },
  { label: "Recommended angle", value: "Help a growing SDR team reach qualified accounts faster" },
  { label: "Route quality", value: "Deliverability-safe contact path available" },
  { label: "Decision-maker confidence", value: "Founder and Head of Sales both visible" },
] as const;

const traditionalLeadQuality = [
  "Generic SaaS company",
  "No current trigger",
  "Unknown buyer urgency",
  "Unclear contact path",
  "Rep still has to research the angle",
] as const;

const frithlyLeadQuality = [
  "Hiring SDRs this month",
  "Founder active around GTM",
  "Recent pricing or launch movement",
  "Deliverability-safe route surfaced",
  "Recommended opener included",
] as const;

const sampleIntelligenceReport = [
  { label: "ICP fit", value: "Sales software - 25 to 150 employees - North America" },
  { label: "Reasoning", value: "High outbound maturity, active hiring signal, and clear commercial fit" },
  { label: "Priority reason", value: "Strong timing plus a buyer the team can credibly approach now" },
  { label: "Recommended angle", value: "Pipeline quality scaling pain during outbound expansion" },
  { label: "Release tier", value: "Tier A - ready for the weekly brief" },
] as const;

const buildJourneyArtifacts = [
  "Signal experiments and what changed in scoring",
  "Contact enrichment upgrades and route quality checks",
  "Filtering improvements that remove weak-fit accounts",
  "Weekly learnings that tighten the next release",
] as const;

const industries = [
  {
    headline: "Founder-led agencies that need higher-quality targets, not more prospecting noise.",
    id: "agencies",
    label: "Agencies",
    query: "SEO agencies - performance agencies - niche service firms",
    opportunities: [
      { company: "Northline Studio", note: "Founder-owned growth agency - clear route", score: 94 },
      { company: "Harbour Search", note: "Selective positioning - high service fit", score: 91 },
      { company: "Signal Foundry", note: "Premium contactability - strong outbound angle", score: 88 },
    ],
  },
  {
    headline: "B2B software teams that care more about reply quality than list size.",
    id: "saas",
    label: "B2B SaaS",
    query: "Vertical SaaS - workflow tools - specialist software",
    opportunities: [
      { company: "Arclet Ops", note: "Growing product team - crisp ICP match", score: 93 },
      { company: "Relay Ledger", note: "Strong founder signal - stable route posture", score: 89 },
      { company: "Northbeam Flow", note: "Recent momentum - selective relevance", score: 86 },
    ],
  },
  {
    headline: "Specialist service businesses where cleaner targeting changes who the team spends time on.",
    id: "services",
    label: "Specialist services",
    query: "Industrial services - boutique consultancies - niche providers",
    opportunities: [
      { company: "Ridgepoint Advisory", note: "Founder visible - narrow commercial fit", score: 92 },
      { company: "Atlas Process", note: "High-value motion - route quality intact", score: 87 },
      { company: "Morrow Partners", note: "Selective release candidate - good timing", score: 84 },
    ],
  },
] as const;

const geographies = [
  { density: "Tighter weekly focus", id: "uk", label: "UK" },
  { density: "Balanced weekly coverage", id: "uk-eu", label: "UK + EU" },
  { density: "Broader market coverage", id: "na", label: "North America" },
] as const;

const goals = [
  { id: "founders", label: "More founder replies", result: "Founder and decision-maker accounts are weighted higher in the brief." },
  { id: "quality", label: "Cleaner pipeline", result: "Higher-fit opportunities outrank broad volume." },
  { id: "delivery", label: "Safer scaling", result: "Deliverability-safe routes and cleaner contacts weigh more heavily." },
] as const;

const coverageOptions = [
  { description: "Focused coverage inside one market with tighter account quality.", id: "single", label: "Single market" },
  { description: "Balanced coverage across two coordinated markets.", id: "double", label: "Double market" },
  { description: "Expanded coverage across multiple active markets.", id: "multiple", label: "Multi-market" },
] as const;

const baseProgramItems = [
  "Minimum 20 reviewed opportunities / week included",
  "Human-reviewed weekly brief",
  "Deliverability-safe prioritization",
  "Ready-to-send exports",
  "Why-now outreach angles",
  "Decision-maker targeting",
  "Quality control before release",
  "Weekly delivery cadence",
] as const;

const supportOptions = [
  { description: "A clean weekly brief with prioritized accounts and release context.", id: "core", label: "Core brief" },
  { description: "Adds draft refinement so reps start with stronger first touches.", id: "drafts", label: "Draft support" },
  { description: "Higher-touch weekly support around delivery and rep handoff.", id: "delivery", label: "Delivery support" },
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
  const [coverage, setCoverage] = useState<CoverageOption>("double");
  const [support, setSupport] = useState<SupportOption>("delivery");
  const [cadence, setCadence] = useState<CadenceOption>("weekly");
  const [founderPriority, setFounderPriority] = useState(true);
  const [smtpPriority, setSmtpPriority] = useState(true);
  const [assessmentVolume, setAssessmentVolume] = useState(150);
  const [assessmentReplyRate, setAssessmentReplyRate] = useState(3);
  const [assessmentDealValue, setAssessmentDealValue] = useState(8000);
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
      const firstAnchor = firstRect.top + 8;
      const activeAnchor = activeRect.top + 8;
      const lastAnchor = lastRect.top + 8;
      const stageTravel = Math.max(0, activeAnchor - firstAnchor);
      const maxTravel = Math.max(0, lastAnchor - firstAnchor);
      const availablePanelTravel = Math.max(0, timeline.scrollHeight - panel.offsetHeight);
      const clampedTravel = Math.min(stageTravel, maxTravel, availablePanelTravel);

      setEnginePanelOffset(clampedTravel);
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
    const coverageCost = coverage === "single" ? 0 : coverage === "double" ? 260 : 460;
    const supportCost = support === "core" ? 0 : support === "drafts" ? 180 : 340;
    const founderCost = founderPriority ? 140 : 0;
    const smtpCost = smtpPriority ? 95 : 0;
    const depthCost = Math.max(targetingDepth - 1, 0) * 120;
    const volumeCost = Math.max(weeklyOpportunityTarget - 20, 0) * 4;
    const cadenceCost = 0;
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
        coverageOptions.find((item) => item.id === coverage)?.label ?? "Double market",
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
                ? "High-touch context layering"
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

  const assessmentModel = useMemo(() => {
    const wasteRate = clamp(0.62 - assessmentReplyRate * 0.045 + (assessmentDealValue >= 10000 ? 0.04 : 0), 0.24, 0.68);
    const lowFitWaste = Math.round(assessmentVolume * wasteRate);
    const missedIntent = Math.max(
      8,
      Math.round(lowFitWaste * 0.18 + Math.max(0, 4 - assessmentReplyRate) * 3),
    );
    const pipelineInefficiency = Math.round(
      clamp(wasteRate * 100 - 8 + (assessmentDealValue >= 10000 ? 4 : 0), 18, 63),
    );
    const routingImpact = Math.round(
      clamp(14 + (5 - assessmentReplyRate) * 5 + (assessmentVolume > 200 ? 6 : 0), 8, 41),
    );
    const prioritizationGain = Math.max(
      12,
      Math.round(missedIntent * 0.6 + assessmentDealValue / 2000),
    );

    return {
      lowFitWaste,
      missedIntent,
      pipelineInefficiency,
      prioritizationGain,
      routingImpact,
      routingLabel:
        routingImpact >= 30 ? "Elevated" : routingImpact >= 18 ? "Moderate" : "Controlled",
    };
  }, [assessmentDealValue, assessmentReplyRate, assessmentVolume]);

  return (
    <div className="relative overflow-hidden bg-[#050915] text-[#f6f3f7]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,122,180,0.14),transparent_22rem),radial-gradient(circle_at_80%_12%,rgba(239,186,144,0.08),transparent_20rem),linear-gradient(180deg,#050915_0%,#07101b_44%,#060a14_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:112px_112px] opacity-[0.03]" />
      <div className="pointer-events-none absolute left-[-8rem] top-[10rem] h-72 w-72 rounded-full bg-[#7598e8]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-[30rem] h-80 w-80 rounded-full bg-[#efba90]/10 blur-3xl" />

      <section className="relative pb-24 pt-28 sm:pb-28 sm:pt-36">
        <Container className="grid gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
          <motion.div {...revealProps(enableReveal, 0.04)}>
            <SectionEyebrow>Smaller lists. Better timing. Stronger replies.</SectionEyebrow>
            <h1
              className={cn(
                displayFont.className,
                "mt-7 max-w-[12ch] text-[3.5rem] leading-[0.92] tracking-[-0.04em] text-[#f8f5f8] sm:text-[4.6rem] lg:text-[5.8rem]",
              )}
            >
              Better outbound starts{" "}
              <ItalicAccent>before the first email.</ItalicAccent>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/62 md:text-[1.08rem] md:leading-9">
              Most outbound fails because teams target too broadly and reach out too late.
              Frithly fixes that with a weekly brief of higher-intent prospects, verified contacts,
              live signals, and outreach angles designed to improve reply rates and reduce SDR waste.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="shadow-[0_20px_60px_rgba(239,186,144,0.16)]">
                <Link href={ROUTES.APPLY}>
                  <span className="inline-flex items-center gap-2">
                    Apply
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
                <Link href={ROUTES.BOOK_MEETING}>Book a meeting</Link>
              </Button>
            </div>

            <div className="mt-10 grid max-w-2xl gap-5 sm:grid-cols-3">
              {[
                ["What you get", "A higher-fit weekly brief"],
                ["Why it is better", "Live signals plus opener angles"],
                ["Why trust it", "Human-reviewed before release"],
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
                    This week&apos;s outbound brief
                  </div>
                  <div className="mt-2 text-2xl font-medium text-white">
                    Priority accounts with timing already mapped
                  </div>
                </div>
                <div className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/72">
                  Release ready
                </div>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-[0.78fr_0.22fr]">
                <div className="space-y-3">
                  {[
                    ["Astralis Industries", "Hiring 3 AEs - founder-led - high fit", 94],
                    ["Northwave Robotics", "New pricing page - clean route - strong timing", 91],
                    ["Harbour Search", "Recent GTM push - decision-maker match", 88],
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
                  Buying intent context
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#efba90]" />
                  Deliverability-safe contacts
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#8fbef6]" />
                  Human-reviewed weekly brief
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
              copy="Teams target too broadly, reach out too late, and ask reps to do research the market never sees. That creates more activity, lower reply rates, and pipeline the team trusts less."
              eyebrow="Why outbound underperforms"
            >
              Most outbound fails <ItalicAccent>before the first email.</ItalicAccent>
            </SectionIntro>
          </motion.div>

          <motion.div className="grid gap-8 lg:grid-cols-2" {...revealProps(enableReveal, 0.12)}>
            <div className="space-y-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/34">
                Traditional outbound
              </div>
              <h3 className="text-2xl font-medium text-white">More records do not fix weak targeting.</h3>
              <p className="text-base leading-8 text-white/58">
                Broad lists, weak timing, and shallow context make the whole motion look busy while
                reps spend time on accounts that never deserved attention.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Broad lists create low-reply-rate outreach.",
                  "Reps lose hours cleaning data and hunting context.",
                  "Timing gets guessed after the lead is already in sequence.",
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
              <h3 className="text-2xl font-medium text-white">The shortlist gets smaller while reply potential rises.</h3>
              <p className="text-base leading-8 text-white/58">
                Frithly turns wide market collection into a smaller, higher-intent brief built for
                better replies, cleaner pipeline, and less SDR waste.
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Higher-fit accounts outrank raw volume.",
                  "Buying signals clarify why to reach out now.",
                  "The brief arrives ready for reps, not more manual research.",
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
              copy="Frithly does not stop at search results. It collects broadly, adds context, ranks by fit and intent, and only then hands your team the accounts worth working."
              eyebrow="How it works"
            >
              Collect wide. Score hard. Release what <ItalicAccent>earns attention.</ItalicAccent>
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
                        Stage {String(index + 1).padStart(2, "0")} - {stage.label}
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
              copy="Each cycle tightens the shortlist, protects deliverability, and adds the timing context reps need before the first touch."
              eyebrow="What you get each week"
            >
              A Monday-ready outbound brief, <ItalicAccent>not another CSV.</ItalicAccent>
            </SectionIntro>
            <div className="mt-8 space-y-3">
              {[
                "Higher-fit accounts prioritized before delivery.",
                "Decision-makers and contacts packaged with context.",
                "Weak or stale accounts removed before the brief ships.",
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
              copy="Pick an industry, geography, and goal. The preview shows how Frithly prioritizes better-fit opportunities instead of flooding the list."
              eyebrow="ICP preview"
            >
              See how the brief changes when your market <ItalicAccent>changes.</ItalicAccent>
            </SectionIntro>
          </motion.div>

          <motion.div
            className="mt-14 grid gap-10 rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:p-8"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="min-w-0 space-y-8">
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
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Deliverability-safe routes</div>
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
                  <Link href={ROUTES.BOOK_MEETING}>
                    <span className="inline-flex items-center gap-2">
                      Book a meeting about this brief
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
        <Container className="space-y-12">
          <motion.div className="max-w-3xl" {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="Start with the core weekly brief, then adjust coverage, depth, support, and cadence around the pipeline outcome you want."
              eyebrow="Program builder"
            >
              Frithly is built like a <ItalicAccent>weekly outbound program.</ItalicAccent>
            </SectionIntro>
          </motion.div>

          <motion.div
            className="grid gap-8 rounded-[1.8rem] bg-black/16 p-6 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] xl:items-start xl:p-8"
            {...revealProps(enableReveal, 0.09)}
          >
            <div className="space-y-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                Included in the core weekly brief
              </div>
              <h3 className="text-[2rem] font-medium leading-[1.06] text-white sm:text-[2.35rem]">
                The EUR 499 foundation already covers the weekly execution layer.
              </h3>
              <p className="max-w-2xl text-base leading-8 text-white/58">
                The builder below is for expanding coverage, support, and targeting depth when you
                need more from the program.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {baseProgramItems.map((item) => (
                <div
                  className="flex items-start gap-3 rounded-[1.2rem] bg-white/[0.04] px-4 py-4 text-sm leading-7 text-white/66"
                  key={item}
                >
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#efba90]" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="grid gap-10 rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] xl:items-start xl:p-8"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="min-w-0 space-y-8">
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                  Then customize the expansion
                </div>
                <p className="max-w-2xl text-sm leading-7 text-white/56">
                  Adjust only the layers that go beyond the base program.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
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
              </div>

              <div className="space-y-4">
                <div className="text-sm font-medium text-white">Market coverage</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {coverageOptions.map((option) => (
                    <button
                      className={cn(
                        "block rounded-[1.2rem] px-4 py-4 text-left transition-colors",
                        coverage === option.id
                          ? "bg-white text-[#08111d]"
                          : "bg-white/[0.05] text-white/72 hover:bg-white/[0.09]",
                      )}
                      key={option.id}
                      onClick={() => setCoverage(option.id)}
                      type="button"
                    >
                      <div className="font-medium">{option.label}</div>
                      <div
                        className={cn(
                          "mt-2 text-sm leading-6",
                          coverage === option.id ? "text-[#08111d]/70" : "text-white/50",
                        )}
                      >
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm font-medium text-white">Support level</div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {supportOptions.map((option) => (
                    <button
                      className={cn(
                        "block rounded-[1.2rem] px-4 py-4 text-left transition-colors",
                        support === option.id
                          ? "bg-white text-[#08111d]"
                          : "bg-white/[0.05] text-white/72 hover:bg-white/[0.09]",
                      )}
                      key={option.id}
                      onClick={() => setSupport(option.id)}
                      type="button"
                    >
                      <div className="font-medium">{option.label}</div>
                      <div
                        className={cn(
                          "mt-2 text-sm leading-6",
                          support === option.id ? "text-[#08111d]/70" : "text-white/50",
                        )}
                      >
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
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
                  <div className="mt-2 text-sm leading-6 text-white/54">
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
                  <div className="font-medium">Deliverability-safe prioritization</div>
                  <div className="mt-2 text-sm leading-6 text-white/54">
                    Keep deliverability posture higher inside the release workflow.
                  </div>
                </button>
              </div>
            </div>

            <div className="min-w-0 rounded-[1.5rem] bg-black/16 p-6 xl:sticky xl:top-24">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                    Your Frithly program
                  </div>
                  <div className="mt-4 text-[2.35rem] font-medium leading-[1.02] text-white lg:text-[2.8rem]">
                    {formatEuroRange(programPreview.rangeLow, programPreview.rangeHigh)}
                  </div>
                </div>
                <div className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/70">
                  Consultative estimate
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Monthly reviewed volume</div>
                  <div className="mt-2 text-3xl font-medium text-white">{programPreview.monthlyReviewed}</div>
                </div>
                <div className="rounded-[1.2rem] bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Coverage</div>
                  <div className="mt-2 text-2xl font-medium text-white">{programPreview.coverageLabel}</div>
                </div>
                <div className="rounded-[1.2rem] bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Support level</div>
                  <div className="mt-2 text-2xl font-medium text-white">{programPreview.supportLabel}</div>
                </div>
                <div className="rounded-[1.2rem] bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Cadence</div>
                  <div className="mt-2 text-2xl font-medium text-white">
                    {cadence === "weekly" ? "Weekly" : "Bi-weekly"}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[1.3rem] bg-white/[0.03] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-white/34">Program outline</div>
                <div className="mt-4 space-y-3">
                {[
                  `${programPreview.monthlyReviewed} reviewed opportunities / month`,
                  `${programPreview.coverageLabel} market coverage`,
                  `${programPreview.supportLabel} remains active`,
                  founderPriority ? "Decision-maker weighting stays higher" : "Decision-maker weighting stays balanced",
                  smtpPriority ? "Deliverability-safe release stays strict" : "Deliverability-safe routing stays baseline",
                  `Targeting depth: ${programPreview.targetingLabel}`,
                ].map((line) => (
                  <div className="flex items-start gap-3 text-sm leading-7 text-white/56" key={line}>
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#79e2cb]" />
                    <span>{line}</span>
                  </div>
                ))}
                </div>
              </div>

              <div className="mt-8 border-t border-white/8 pt-6">
                <p className="text-sm leading-7 text-white/56">
                  This is a program estimate, not a checkout flow. The next step is a short fit
                  review and a rollout built around your outbound motion.
                </p>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="evidence">
        <Container className="space-y-14">
          <motion.div className="mx-auto max-w-4xl" {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              align="center"
              copy="Frithly is early, so we do not lean on padded ROI claims, fake testimonials, or borrowed logos. We show the evidence artifacts buyers can actually inspect instead: how accounts are filtered, why they matter now, and what a rep should do next."
              eyebrow="Believable proof"
            >
              Process proof beats <ItalicAccent>inflated results proof.</ItalicAccent>
            </SectionIntro>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "No fake case studies.",
                "No inflated ROI claims.",
                "Real reasoning artifacts instead.",
              ].map((line) => (
                <div className="rounded-[1.2rem] bg-white/[0.03] p-4 text-sm leading-7 text-white/60" key={line}>
                  <div className="mb-3 h-1.5 w-1.5 rounded-full bg-[#efba90]" />
                  {line}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="grid gap-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]"
            {...revealProps(enableReveal, 0.08)}
          >
            <div className="rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:p-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                Strategic outbound assessment
              </div>
              <h3 className="mt-4 text-[2rem] font-medium leading-[1.05] text-white lg:text-[2.35rem]">
                A quick read on where outbound quality is leaking.
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
                Three inputs. Instant insight. No fantasy revenue projection.
              </p>

              <div className="mt-8 space-y-6">
                <SliderControl
                  label="Monthly outbound contacts"
                  max={400}
                  min={50}
                  onChange={setAssessmentVolume}
                  step={10}
                  value={assessmentVolume}
                  valueLabel={`${assessmentVolume} / month`}
                />
                <SliderControl
                  label="Current reply rate"
                  max={10}
                  min={1}
                  onChange={setAssessmentReplyRate}
                  step={0.5}
                  value={assessmentReplyRate}
                  valueLabel={`${assessmentReplyRate.toFixed(assessmentReplyRate % 1 === 0 ? 0 : 1)}%`}
                />
                <SliderControl
                  label="Average deal value"
                  max={20000}
                  min={2000}
                  onChange={setAssessmentDealValue}
                  step={500}
                  value={assessmentDealValue}
                  valueLabel={formatEuro(assessmentDealValue)}
                />
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  [100, 2, 5000, "Lean team"],
                  [180, 4, 9000, "Growth team"],
                  [240, 3, 12000, "Premium services"],
                ].map(([volume, rate, value, label]) => (
                  <button
                    className="rounded-full bg-white/[0.05] px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/[0.09]"
                    key={label}
                    onClick={() => {
                      setAssessmentVolume(volume as number);
                      setAssessmentReplyRate(rate as number);
                      setAssessmentDealValue(value as number);
                    }}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:p-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                Assessment insights
              </div>
              <h3 className="mt-4 text-[2rem] font-medium leading-[1.05] text-white lg:text-[2.35rem]">
                Fast signals a buyer can act on.
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
                This is a strategic outbound assessment, not a promise of booked revenue. It is built
                to surface waste, timing loss, and prioritization gaps quickly.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.2rem] bg-black/18 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Estimated low-fit outreach waste</div>
                  <div className="mt-2 text-3xl font-medium text-white">{assessmentModel.lowFitWaste}</div>
                  <div className="mt-2 text-sm leading-7 text-white/56">contacts/month likely spent on low-confidence accounts</div>
                </div>
                <div className="rounded-[1.2rem] bg-black/18 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Missed high-intent opportunities</div>
                  <div className="mt-2 text-3xl font-medium text-white">{assessmentModel.missedIntent}</div>
                  <div className="mt-2 text-sm leading-7 text-white/56">accounts/month that may be getting buried inside broad prospecting</div>
                </div>
                <div className="rounded-[1.2rem] bg-black/18 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Pipeline inefficiency</div>
                  <div className="mt-2 text-3xl font-medium text-white">{assessmentModel.pipelineInefficiency}%</div>
                  <div className="mt-2 text-sm leading-7 text-white/56">of outbound effort likely being lost to weak fit, bad timing, or missing context</div>
                </div>
                <div className="rounded-[1.2rem] bg-black/18 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-white/34">Routing quality impact</div>
                  <div className="mt-2 text-3xl font-medium text-white">{assessmentModel.routingLabel}</div>
                  <div className="mt-2 text-sm leading-7 text-white/56">{assessmentModel.routingImpact}% likelihood that route quality is dragging performance</div>
                </div>
              </div>

              <div className="mt-6 rounded-[1.3rem] bg-white/[0.03] p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-white/34">Prioritization gain</div>
                <p className="mt-3 text-base leading-8 text-white/60">
                  Frithly could likely help your team focus on roughly {assessmentModel.prioritizationGain} stronger first-priority
                  accounts per month before outbound volume needs to increase.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]"
            {...revealProps(enableReveal, 0.1)}
          >
            <div className="rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:p-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                Opportunity breakdown
              </div>
              <h3 className="mt-4 text-[2rem] font-medium leading-[1.05] text-white lg:text-[2.35rem]">
                Exactly why this account makes the brief.
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
                This is the kind of artifact a buyer can trust before case-study proof exists:
                the signal, the reasoning, the recommended angle, and the route quality all in one place.
              </p>

              <div className="mt-8 space-y-4">
                {opportunityBreakdown.map((item) => (
                  <div
                    className="grid gap-2 rounded-[1.2rem] bg-black/18 px-4 py-4 md:grid-cols-[160px_minmax(0,1fr)]"
                    key={item.label}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/34">
                      {item.label}
                    </div>
                    <div className="text-sm leading-7 text-white/74 md:text-base">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:p-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                Sample intelligence report
              </div>
              <h3 className="mt-4 text-[2rem] font-medium leading-[1.05] text-white lg:text-[2.35rem]">
                What a serious buyer can inspect before trusting the system.
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
                Frithly should make its reasoning visible. The best early proof is not a promise.
                It is a clear explanation of why this account, why now, and why this angle.
              </p>

              <div className="mt-8 space-y-4">
                {sampleIntelligenceReport.map((item) => (
                  <div
                    className="rounded-[1.2rem] bg-black/18 px-4 py-4"
                    key={item.label}
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/34">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm leading-7 text-white/74 md:text-base">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]"
            {...revealProps(enableReveal, 0.14)}
          >
            <div className="rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:p-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                Before vs after lead quality
              </div>
              <h3 className="mt-4 text-[2rem] font-medium leading-[1.05] text-white lg:text-[2.35rem]">
                Show the difference between a raw lead and a Frithly lead.
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
                Buyers do not need fantasy metrics to understand the value. They need to see how much
                stronger the account looks before the rep sends the first message.
              </p>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <div className="rounded-[1.4rem] bg-black/18 p-5">
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-white/42">
                    Traditional lead
                  </div>
                  <div className="mt-5 space-y-3">
                    {traditionalLeadQuality.map((item) => (
                      <div className="flex items-start gap-3 text-sm leading-7 text-white/62" key={item}>
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ff9c98]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.4rem] bg-black/18 p-5">
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#efba90]">
                    Frithly lead
                  </div>
                  <div className="mt-5 space-y-3">
                    {frithlyLeadQuality.map((item) => (
                      <div className="flex items-start gap-3 text-sm leading-7 text-white/74" key={item}>
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#79e2cb]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:p-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                Public build journey
              </div>
              <h3 className="mt-4 text-[2rem] font-medium leading-[1.05] text-white lg:text-[2.35rem]">
                Show how the system keeps getting smarter.
              </h3>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/60">
                Transparent builders earn trust faster. Frithly can prove rigor by showing what
                changed in the product, what improved in filtering, and what the team learned from each release.
              </p>

              <div className="mt-8 space-y-3">
                {buildJourneyArtifacts.map((item) => (
                  <div className="flex items-start gap-3 rounded-[1.2rem] bg-black/18 px-4 py-4 text-sm leading-7 text-white/68" key={item}>
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#efba90]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-24 sm:py-28" id="trust">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
          <motion.div {...revealProps(enableReveal, 0.05)}>
            <SectionIntro
              copy="Teams trust Frithly because the brief is reviewed, timing-backed, and built to reduce wasted SDR work before the first touch goes out."
              eyebrow="Why teams trust it"
            >
              Premium only works when the brief feels <ItalicAccent>useful on day one.</ItalicAccent>
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
              copy="Clear answers to the questions buyers ask when they want better outbound results without adding more list management."
              eyebrow="Frequently asked"
            >
              Questions teams ask before they <ItalicAccent>buy.</ItalicAccent>
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
            <SectionEyebrow>Ready to improve replies?</SectionEyebrow>
            <h2
              className={cn(
                displayFont.className,
                "mx-auto mt-6 max-w-4xl text-[2.6rem] leading-[1.02] tracking-[-0.03em] text-[#f7f4f8] sm:text-[3.4rem] lg:text-[4.2rem]",
              )}
            >
              Want smaller lists, better timing, and <ItalicAccent>stronger replies?</ItalicAccent>
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/62 md:text-[1.05rem] md:leading-9">
              We will map the right ICP, coverage, and delivery rhythm around your outbound motion
              so the team gets a cleaner weekly brief, not more prospecting noise.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={ROUTES.APPLY}>
                  <span className="inline-flex items-center gap-2">
                    Apply
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
                <Link href={ROUTES.BOOK_MEETING}>Book a meeting</Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
