"use client";

import Link from "next/link";
import { Fraunces } from "next/font/google";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BrandMark } from "@/components/ui/logo";
import { IcpDemoExperience } from "@/components/landing/icp-demo-experience";
import { platformFaqs } from "@/components/landing/platform-homepage-data";
import { RoiCalculatorExperience } from "@/components/landing/roi-calculator-experience";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  Globe2,
  Layers3,
  MailCheck,
  Radar,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const heroChips = [
  "Reviewed intelligence",
  "SMTP-aware routing",
  "Founder targeting",
  "Weekly cohort delivery",
];

const heroMetrics = [
  {
    label: "Premium opportunities held for review",
    note: "Operator-selected before release",
    value: "14",
  },
  {
    label: "SMTP-safe paths ready now",
    note: "Reputation-conscious routing",
    value: "6",
  },
  {
    label: "Average founder confidence",
    note: "Confidence-aware opportunity selection",
    value: "0.87",
  },
];

const heroParticles = [
  { delay: 0.2, duration: 10, left: "10%", size: 10, top: "22%" },
  { delay: 0.8, duration: 12, left: "24%", size: 12, top: "70%" },
  { delay: 0.4, duration: 9, left: "48%", size: 8, top: "38%" },
  { delay: 1.2, duration: 11, left: "64%", size: 11, top: "18%" },
  { delay: 0.1, duration: 13, left: "74%", size: 9, top: "60%" },
  { delay: 0.9, duration: 10, left: "88%", size: 13, top: "42%" },
];

const failurePoints = [
  "Noisy lead lists that force operators to clean the queue manually",
  "Generic scraping without commercial context or targeting depth",
  "Weak routing quality that raises bounce risk too late in the workflow",
  "Personalization theater built on thin signals instead of real intelligence",
];

const qualityPoints = [
  "Reviewed opportunities ranked by recommendation strength and confidence",
  "Founder-aware targeting that surfaces who actually matters",
  "SMTP-aware routing before the cohort is released",
  "Weekly delivery that feels selective, calm, and operationally disciplined",
];

const engineSteps = [
  {
    counts: { assembly: "0", candidates: "180", filtered: "36", ready: "0" },
    detail:
      "Every campaign begins with a real commercial brief: market, geography, target shape, and the kinds of companies that are actually worth attention.",
    highlights: ["ICP brief", "Geography weighting", "Commercial exclusions"],
    id: "icp",
    label: "ICP",
    metric: "Brief quality",
    metricValue: "Confidence-led",
    title: "Translate the ICP into a selective operating brief.",
  },
  {
    counts: { assembly: "0", candidates: "264", filtered: "58", ready: "0" },
    detail:
      "Discovery expands through market-aware queries, not broad scraping. The system looks for where signal is likely to exist instead of rewarding volume for its own sake.",
    highlights: ["Directed discovery", "Source expansion", "Market-aware search"],
    id: "discovery",
    label: "Discovery",
    metric: "Candidate set",
    metricValue: "Signal first",
    title: "Search for likely value before the queue gets noisy.",
  },
  {
    counts: { assembly: "0", candidates: "264", filtered: "94", ready: "0" },
    detail:
      "Enrichment turns a company into an opportunity: service context, contact routes, website quality, and the early evidence needed to support a better outbound judgment.",
    highlights: ["Service fit", "Contact routes", "Website intelligence"],
    id: "enrichment",
    label: "Enrichment",
    metric: "Research density",
    metricValue: "Layered context",
    title: "Signal becomes context before it becomes a recommendation.",
  },
  {
    counts: { assembly: "0", candidates: "264", filtered: "42", ready: "0" },
    detail:
      "Recommendation scoring ranks opportunities by fit, freshness, contactability, and outcome-aware signals so the strongest opportunities rise earlier and weaker ones stay buried.",
    highlights: ["Recommendation rank", "Freshness", "Outcome-aware weighting"],
    id: "scoring",
    label: "Scoring",
    metric: "Priority band",
    metricValue: "Premium first",
    title: "Rank the queue so operators spend time where it matters.",
  },
  {
    counts: { assembly: "0", candidates: "264", filtered: "24", ready: "12" },
    detail:
      "SMTP-aware filtering constrains the queue around delivery practicality. A promising company still has to be routeable enough to justify attention.",
    highlights: ["Syntax and MX layers", "SMTP-aware checks", "Reputation-conscious release"],
    id: "smtp",
    label: "SMTP-safe filtering",
    metric: "Routing quality",
    metricValue: "Constrained carefully",
    title: "Reduce wasted outreach before the cohort exists.",
  },
  {
    counts: { assembly: "2", candidates: "264", filtered: "18", ready: "10" },
    detail:
      "Founder intelligence adds decision-maker relevance and confidence, helping the system distinguish between generic contactability and high-quality outbound opportunity.",
    highlights: ["Founder confidence", "Decision-maker context", "Contact relevance"],
    id: "founders",
    label: "Founder intelligence",
    metric: "Decision-maker fit",
    metricValue: "Higher confidence",
    title: "Confidence grows when the right person becomes clearer.",
  },
  {
    counts: { assembly: "4", candidates: "264", filtered: "14", ready: "8" },
    detail:
      "Opportunity ranking narrows the reviewed queue to the few companies that feel commercially strong, confidence-aware, and ready for careful outbound handling.",
    highlights: ["Reviewed shortlist", "Priority ordering", "Scarcity by design"],
    id: "ranking",
    label: "Opportunity ranking",
    metric: "Reviewed queue",
    metricValue: "Deliberately scarce",
    title: "Quality becomes visible because the system filters hard.",
  },
  {
    counts: { assembly: "6", candidates: "264", filtered: "14", ready: "6" },
    detail:
      "The final output is a weekly cohort: reviewed, ranked, founder-aware, SMTP-conscious, and ready for Monday release instead of dumped as a raw export.",
    highlights: ["Weekly cohort", "Release-ready context", "Operational delivery"],
    id: "assembly",
    label: "Weekly cohort assembly",
    metric: "Release cadence",
    metricValue: "Every Monday",
    title: "Package the intelligence into a premium weekly delivery.",
  },
] as const;

const evolutionPhases = [
  {
    chips: ["Website only", "Unknown route"],
    id: "raw",
    label: "Raw company",
    score: "32",
    summary:
      "At first, it is just a name and a website. There is no real confidence in fit, routing, or decision-maker relevance.",
  },
  {
    chips: ["Service fit", "Geo match", "Recent activity"],
    id: "enriched",
    label: "Enriched",
    score: "54",
    summary:
      "Commercial context appears. The company starts looking relevant, but the route is still too weak for serious outbound attention.",
  },
  {
    chips: ["Founder identified", "Contact path", "Routing improved"],
    id: "validated",
    label: "Validated",
    score: "72",
    summary:
      "The opportunity becomes more believable because contactability and founder context reinforce the original fit signals.",
  },
  {
    chips: ["Recommendation ranked", "SMTP-aware", "Reviewed for Monday"],
    id: "finalized",
    label: "Finalized",
    score: "94",
    summary:
      "Now the company is not just a lead. It is a reviewed outbound opportunity prepared for a selective weekly cohort.",
  },
] as const;

const mondaySystem = [
  {
    body: "Reviewed opportunities are finalized against the live brief so the released cohort reflects fit, confidence, and targeting quality.",
    label: "Reviewed cohort locked",
    time: "08:30",
  },
  {
    body: "SMTP-safe exports and routing notes are prepared so the cohort is practical to deploy, not just interesting to look at.",
    label: "SMTP-aware packaging",
    time: "10:00",
  },
  {
    body: "Recommendation-ranked opportunities are released with founder context, delivery notes, and operator-ready intelligence.",
    label: "Outreach-ready delivery",
    time: "13:00",
  },
] as const;

const deliveryTimeline = [
  {
    copy: "Curated cohort finalized and ranked against the active outbound brief.",
    day: "Monday",
    icon: CalendarDays,
  },
  {
    copy: "Draft refinement begins for the strongest reviewed opportunities.",
    day: "Tuesday",
    icon: Sparkles,
  },
  {
    copy: "Export preparation and routing context are assembled for the active cohort.",
    day: "Wednesday",
    icon: Send,
  },
  {
    copy: "QA review confirms confidence, delivery readiness, and cohort integrity.",
    day: "Thursday",
    icon: FileCheck2,
  },
  {
    copy: "Delivery optimization folds outcome patterns back into the next cycle.",
    day: "Friday",
    icon: Clock3,
  },
] as const;

const operationalTrustSignals = [
  {
    body: "Every released opportunity has passed through review. Frithly is designed to reduce manual chaos, not hide it.",
    icon: ShieldCheck,
    title: "Reviewed opportunities",
  },
  {
    body: "SMTP-aware prioritization stays inside the workflow so routing quality is evaluated before delivery, not after damage is done.",
    icon: MailCheck,
    title: "SMTP-safe prioritization",
  },
  {
    body: "Founder intelligence, confidence signals, and recommendation rank keep the system selective and commercially grounded.",
    icon: Users,
    title: "Founder-aware targeting",
  },
  {
    body: "Weekly QA and release rhythm make the service feel disciplined, repeatable, and high-touch instead of noisy and reactive.",
    icon: Layers3,
    title: "Operational delivery QA",
  },
] as const;

const builderSupportOptions = [
  {
    description: "Reviewed intelligence with recommendation reasoning and delivery context.",
    id: "core",
    label: "Core intelligence",
  },
  {
    description: "Add curated draft support for stronger outbound readiness.",
    id: "drafts",
    label: "Draft support",
  },
  {
    description: "Closer-to-deployment guidance with weekly delivery support.",
    id: "delivery",
    label: "Delivery support",
  },
] as const;

const coverageOptions = [
  { description: "Focused market coverage with concentrated signal density.", id: "uk", label: "UK" },
  { description: "Broader geography with a balanced weekly cohort.", id: "uk-eu", label: "UK + EU" },
  { description: "Expanded transatlantic coverage for higher-volume programs.", id: "global", label: "UK + EU + US" },
] as const;

const cadenceOptions = [
  { description: "Higher-touch rhythm with a released cohort every Monday.", id: "weekly", label: "Weekly" },
  { description: "A lighter program for teams that need more spaced releases.", id: "biweekly", label: "Bi-weekly" },
] as const;

type BuilderSupport = (typeof builderSupportOptions)[number]["id"];
type CoverageOption = (typeof coverageOptions)[number]["id"];
type CadenceOption = (typeof cadenceOptions)[number]["id"];

function getRevealMotion(reduceMotion: boolean, delay = 0) {
  if (reduceMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 24 },
    transition: {
      delay,
      duration: 0.75,
    },
    viewport: { amount: 0.2, once: true },
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
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ffb088] shadow-[0_12px_28px_rgba(0,0,0,0.12)] backdrop-blur-xl">
        {eyebrow}
      </div>
      <h2
        className={cn(
          `${displayFont.className} text-4xl leading-[0.92] text-white sm:text-5xl lg:text-6xl`,
          align === "center" && "mx-auto max-w-4xl",
          align === "left" && "max-w-4xl",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "max-w-2xl text-base leading-8 text-white/68 md:text-[1.04rem] md:leading-8",
          align === "center" && "mx-auto",
        )}
      >
        {copy}
      </p>
    </div>
  );
}

function BuilderOptionButton({
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
        "rounded-[1.2rem] border p-4 text-left transition-colors",
        active
          ? "border-[#ffb088]/30 bg-[#ffb088]/10 text-white"
          : "border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:bg-white/[0.06]",
      )}
      onClick={onClick}
      type="button"
    >
      <div className="text-sm font-semibold text-white">{label}</div>
      <p className="mt-2 text-sm leading-7 text-white/65">{description}</p>
    </button>
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
  onChange: (nextValue: number) => void;
  step?: number;
  value: number;
  valueLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">{label}</span>
        <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-sm text-white/78">
          {valueLabel}
        </span>
      </div>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-terracotta"
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

export function PlatformHomepage() {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeEngineStep, setActiveEngineStep] = useState(0);
  const [activeEvolutionPhase, setActiveEvolutionPhase] = useState(0);
  const [weeklyOpportunityTarget, setWeeklyOpportunityTarget] = useState(45);
  const [coverage, setCoverage] = useState<CoverageOption>("uk-eu");
  const [targetingDepth, setTargetingDepth] = useState(3);
  const [founderPriority, setFounderPriority] = useState(true);
  const [smtpPriority, setSmtpPriority] = useState(true);
  const [builderSupport, setBuilderSupport] = useState<BuilderSupport>("delivery");
  const [deliveryCadence, setDeliveryCadence] = useState<CadenceOption>("weekly");

  const activeEngine = engineSteps[activeEngineStep];
  const activeEvolution = evolutionPhases[activeEvolutionPhase];

  const programPreview = useMemo(() => {
    const monthlyReviewed = weeklyOpportunityTarget * (deliveryCadence === "weekly" ? 4 : 2);
    const coverageCost = coverage === "uk" ? 0 : coverage === "uk-eu" ? 220 : 420;
    const supportCost =
      builderSupport === "core" ? 0 : builderSupport === "drafts" ? 120 : 190;
    const founderCost = founderPriority ? 95 : 0;
    const smtpCost = smtpPriority ? 85 : 0;
    const depthCost = targetingDepth * 95;
    const volumeCost = weeklyOpportunityTarget * 5;
    const cadenceCost = deliveryCadence === "weekly" ? 160 : 0;
    const low = 499 + coverageCost + supportCost + founderCost + smtpCost + depthCost + volumeCost + cadenceCost;
    const high = low + 190 + targetingDepth * 30 + (builderSupport === "delivery" ? 60 : 20);

    return {
      coverageLabel:
        coverageOptions.find((item) => item.id === coverage)?.label ?? "UK + EU",
      monthlyReviewed,
      priceHigh: high,
      priceLow: low,
      supportLabel:
        builderSupportOptions.find((item) => item.id === builderSupport)?.label ??
        "Delivery support",
      targetingLabel:
        targetingDepth === 1
          ? "Core fit signals"
          : targetingDepth === 2
            ? "Expanded service context"
            : targetingDepth === 3
              ? "Founder and routing depth"
              : targetingDepth === 4
                ? "High-touch intelligence layering"
                : "Maximum review precision",
    };
  }, [
    builderSupport,
    coverage,
    deliveryCadence,
    founderPriority,
    smtpPriority,
    targetingDepth,
    weeklyOpportunityTarget,
  ]);

  return (
    <div className="relative overflow-hidden bg-[#06101a] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[72rem] bg-[radial-gradient(circle_at_top_left,rgba(255,176,136,0.14),transparent_28rem),radial-gradient(circle_at_68%_18%,rgba(70,128,255,0.12),transparent_26rem),linear-gradient(180deg,#07111b_0%,#091521_34%,#07121c_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:92px_92px] opacity-[0.22]" />
      <div className="pointer-events-none absolute left-[-12rem] top-[16rem] h-80 w-80 rounded-full bg-[#ffb088]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10rem] top-[30rem] h-96 w-96 rounded-full bg-[#2d5f8f]/10 blur-3xl" />

      <section className="relative min-h-[calc(100vh-4rem)] pt-10 sm:pt-12 lg:pt-16">
        <Container className="grid gap-10 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <motion.div className="space-y-8" {...getRevealMotion(reduceMotion, 0.04)}>
            <Badge className="w-fit border-white/10 bg-white/[0.05] text-[#ffb088] shadow-[0_12px_32px_rgba(0,0,0,0.14)]" variant="outline">
              A premium outbound intelligence operation
            </Badge>

            <div className="space-y-6">
              <h1
                className={`${displayFont.className} max-w-[11ch] text-[3.05rem] leading-[0.88] text-white sm:text-[4.5rem] lg:text-[6rem]`}
              >
                Curated Outbound Intelligence Delivered Weekly.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-white/70 md:text-[1.14rem] md:leading-9">
                Frithly helps outbound teams discover higher-confidence opportunities through
                reviewed intelligence, SMTP-aware routing, founder targeting, and curated delivery
                systems.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="shadow-[0_18px_48px_rgba(212,98,58,0.28)]">
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
                className="border-white/12 bg-white/[0.06] text-white hover:border-white/28 hover:bg-white/[0.1] hover:text-white"
              >
                <Link href="#living-engine">Watch the Intelligence Flow</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {heroChips.map((chip) => (
                <div
                  key={chip}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/74 backdrop-blur-xl"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#ffb088]" aria-hidden="true" />
                  <span>{chip}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {heroMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl"
                  {...getRevealMotion(reduceMotion, 0.08 + index * 0.05)}
                >
                  <div className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {metric.value}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">{metric.label}</div>
                  <div className="mt-2 text-xs leading-6 text-white/56">{metric.note}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            {...getRevealMotion(reduceMotion, 0.12)}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, -12, 0],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 9,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                  }
            }
          >
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,176,136,0.2),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(107,167,255,0.12),transparent_28%)] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,23,35,0.95)_0%,rgba(7,15,24,0.94)_100%)] px-5 py-6 shadow-[0_34px_110px_rgba(0,0,0,0.35)] sm:px-6 sm:py-7">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
              <div className="absolute right-8 top-8 h-36 w-36 rounded-full bg-[#ffb088]/14 blur-3xl" />
              <div className="absolute left-10 bottom-10 h-24 w-24 rounded-full bg-white/6 blur-2xl" />

              {heroParticles.map((particle) => (
                <motion.span
                  key={`${particle.left}-${particle.top}`}
                  className="absolute rounded-full bg-[#ffb088]/75 shadow-[0_0_22px_rgba(255,176,136,0.65)]"
                  style={{
                    height: particle.size,
                    left: particle.left,
                    top: particle.top,
                    width: particle.size,
                  }}
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          opacity: [0.25, 0.95, 0.25],
                          y: [0, -18, 0],
                        }
                  }
                  transition={
                    reduceMotion
                      ? undefined
                      : {
                          delay: particle.delay,
                          duration: particle.duration,
                          ease: "easeInOut",
                          repeat: Number.POSITIVE_INFINITY,
                        }
                  }
                />
              ))}

              <div className="relative space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                      Living intelligence system
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                      A calm weekly release, built from moving signal.
                    </h2>
                  </div>
                  <BrandMark
                    className="h-14 w-14 border-white/10 bg-white/[0.08] p-1.5 shadow-none"
                    imageClassName="h-full w-full rounded-[0.95rem]"
                    priority
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Radar className="h-4 w-4 text-[#ffb088]" aria-hidden="true" />
                      Intelligence stream
                    </div>

                    <div className="relative mt-5 h-[18rem] overflow-hidden rounded-[1.2rem] border border-white/10 bg-[#08111b]">
                      <div className="absolute left-[14%] top-[14%] h-px w-[56%] bg-gradient-to-r from-[#ffb088]/60 to-transparent" />
                      <div className="absolute left-[20%] top-[30%] h-px w-[48%] bg-gradient-to-r from-[#66c3ff]/55 to-transparent" />
                      <div className="absolute left-[42%] top-[58%] h-px w-[38%] bg-gradient-to-r from-[#ffb088]/45 to-transparent" />
                      <div className="absolute left-[28%] top-[73%] h-px w-[44%] bg-gradient-to-r from-[#7be0c3]/45 to-transparent" />

                      {[
                        { label: "Discovery", left: "12%", score: "180", top: "18%" },
                        { label: "Confidence", left: "48%", score: "0.87", top: "30%" },
                        { label: "SMTP-safe", left: "34%", score: "6", top: "54%" },
                        { label: "Weekly cohort", left: "64%", score: "Monday", top: "70%" },
                      ].map((node, index) => (
                        <motion.div
                          key={node.label}
                          className="absolute rounded-[1rem] border border-white/10 bg-white/[0.07] px-3 py-2 backdrop-blur-xl"
                          style={{ left: node.left, top: node.top }}
                          animate={
                            reduceMotion
                              ? undefined
                              : {
                                  opacity: [0.65, 1, 0.65],
                                  scale: [1, 1.03, 1],
                                }
                          }
                          transition={
                            reduceMotion
                              ? undefined
                              : {
                                  delay: index * 0.25,
                                  duration: 4.4,
                                  ease: "easeInOut",
                                  repeat: Number.POSITIVE_INFINITY,
                                }
                          }
                        >
                          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/48">
                            {node.label}
                          </div>
                          <div className="mt-2 text-sm font-semibold text-white">{node.score}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.35rem] border border-white/10 bg-gradient-to-br from-[#ffffff14] to-[#ffffff08] p-4">
                      <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                        Premium opportunity
                      </div>
                      <h3 className="mt-4 text-xl font-semibold text-white">Northline Growth</h3>
                      <p className="mt-2 text-sm leading-7 text-white/70">
                        High-confidence founder path, reviewed service fit, and cleaner routing than
                        the broader queue.
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          { label: "Founder confidence", value: "0.91" },
                          { label: "SMTP-safe", value: "Ready" },
                          { label: "Recommendation rank", value: "Premium" },
                          { label: "Delivery status", value: "Monday cohort" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-[1rem] border border-white/10 bg-white/[0.05] px-3 py-3"
                          >
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                              {item.label}
                            </div>
                            <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4">
                      <div className="text-sm font-semibold text-white">Signal drift</div>
                      <div className="mt-4 space-y-3">
                        {[
                          "Founder confidence ring strengthens",
                          "Routing risk narrows",
                          "Recommendation score rises",
                          "Weekly cohort assembles",
                        ].map((item, index) => (
                          <motion.div
                            key={item}
                            className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/72"
                            animate={
                              reduceMotion
                                ? undefined
                                : {
                                    opacity: [0.4, 1, 0.4],
                                    x: [0, 5, 0],
                                  }
                            }
                            transition={
                              reduceMotion
                                ? undefined
                                : {
                                    delay: index * 0.18,
                                    duration: 4.2,
                                    ease: "easeInOut",
                                    repeat: Number.POSITIVE_INFINITY,
                                  }
                            }
                          >
                            {item}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="why-outbound-fails" className="relative border-t border-white/8 py-20 sm:py-24 lg:py-28">
        <Container className="space-y-12">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              align="center"
              eyebrow="Outbound failure narrative"
              title="Traditional outbound usually fails because volume hides weak signal."
              copy="When the queue is noisy, every downstream step gets worse: targeting, routing, personalization, and operator focus. Frithly is built around the opposite assumption. A smaller queue with stronger intelligence produces better outbound."
            />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl"
              {...getRevealMotion(reduceMotion, 0.08)}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">
                    Traditional outbound
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    More activity. Less confidence.
                  </h3>
                </div>
                <Filter className="h-5 w-5 text-rose-300" aria-hidden="true" />
              </div>

              <div className="mt-6 space-y-3">
                {failurePoints.map((item, index) => (
                  <motion.div
                    key={item}
                    className="rounded-[1.2rem] border border-rose-300/10 bg-rose-300/[0.05] px-4 py-4"
                    initial={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: index * 0.05, duration: 0.35 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-2 h-2.5 w-2.5 rounded-full bg-rose-300" />
                      <p className="text-sm leading-7 text-white/72">{item}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-rose-300/10 bg-[#0a131d] p-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Noisy leads", value: "1000" },
                    { label: "Generic outreach", value: "Most" },
                    { label: "Low-quality conversations", value: "Few" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                        {item.label}
                      </div>
                      <div className="mt-2 text-base font-semibold text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,176,136,0.09)_0%,rgba(255,255,255,0.03)_100%)] p-6 backdrop-blur-xl"
              {...getRevealMotion(reduceMotion, 0.12)}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                    Frithly intelligence
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Quality outbound beats mass outbound.
                  </h3>
                </div>
                <Target className="h-5 w-5 text-[#ffb088]" aria-hidden="true" />
              </div>

              <div className="mt-6 space-y-3">
                {qualityPoints.map((item, index) => (
                  <motion.div
                    key={item}
                    className="rounded-[1.2rem] border border-white/10 bg-white/[0.06] px-4 py-4"
                    initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: index * 0.05, duration: 0.35 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[#ffb088]" />
                      <p className="text-sm leading-7 text-white/74">{item}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-[#0a131d] p-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    { label: "Reviewed opportunities", value: "100" },
                    { label: "SMTP-aware routing", value: "Built in" },
                    { label: "Founder targeting", value: "Prioritized" },
                    { label: "Weekly delivery", value: "Every Monday" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                        {item.label}
                      </div>
                      <div className="mt-2 text-base font-semibold text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section id="living-engine" className="relative border-t border-white/8 py-20 sm:py-24 lg:py-28">
        <Container className="space-y-12">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Living intelligence engine"
              title="Watch the intelligence system evolve from ICP into a weekly outbound cohort."
              copy="As the workflow progresses, noise gets filtered out, confidence signals get stronger, and a smaller set of better opportunities begins to emerge. The experience should feel like the system is thinking because the system is narrowing."
            />
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <div className="space-y-5">
              {engineSteps.map((step, index) => (
                <motion.article
                  key={step.id}
                  className={cn(
                    "rounded-[1.55rem] border p-5 backdrop-blur-xl transition-all duration-500 sm:p-6",
                    activeEngineStep === index
                      ? "border-[#ffb088]/25 bg-[#ffb088]/10 shadow-[0_26px_80px_rgba(255,176,136,0.12)]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.05]",
                  )}
                  onViewportEnter={() => setActiveEngineStep(index)}
                  {...getRevealMotion(reduceMotion, index * 0.03)}
                  viewport={{ amount: 0.45, once: false }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                      {step.label}
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                      {step.metricValue}
                    </div>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">{step.detail}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {step.highlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/75"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>

            <div className="lg:sticky lg:top-24">
              <motion.div
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,31,0.96)_0%,rgba(8,15,24,0.96)_100%)] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.35)] sm:p-7"
                {...getRevealMotion(reduceMotion, 0.1)}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                        Active system state
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{activeEngine.label}</h3>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/74">
                      {`${activeEngineStep + 1} / ${engineSteps.length}`}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    {[
                      { label: "Candidates", value: activeEngine.counts.candidates },
                      { label: "Filtered", value: activeEngine.counts.filtered },
                      { label: "SMTP-ready", value: activeEngine.counts.ready },
                      { label: "Assembly", value: activeEngine.counts.assembly },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[1rem] border border-white/10 bg-white/[0.05] px-3 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                          {item.label}
                        </div>
                        <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Search className="h-4 w-4 text-[#ffb088]" aria-hidden="true" />
                      Engine readout
                    </div>
                    <div className="mt-5 space-y-4">
                      {[
                        { label: "Signal density", width: `${Math.min(92, 38 + activeEngineStep * 7)}%` },
                        { label: "Confidence", width: `${Math.min(88, 34 + activeEngineStep * 6)}%` },
                        { label: "Delivery readiness", width: `${Math.min(84, 12 + activeEngineStep * 9)}%` },
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-white/68">{item.label}</span>
                            <span className="font-semibold text-white">{item.width}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10">
                            <motion.div
                              className="h-2 rounded-full bg-gradient-to-r from-[#ff8c5a] to-[#ffd1b7]"
                              initial={reduceMotion ? undefined : { width: 0 }}
                              animate={reduceMotion ? undefined : { width: item.width }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeEngine.id}
                      className="rounded-[1.45rem] border border-white/10 bg-[#0b1520] p-5"
                      initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div className="text-sm font-semibold text-white">{activeEngine.metric}</div>
                      <p className="mt-3 text-sm leading-7 text-white/66">{activeEngine.detail}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      <section className="relative border-t border-white/8 py-20 sm:py-24 lg:py-28">
        <Container className="space-y-12">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Opportunity evolution experience"
              title="Signal becomes intelligence as the workflow adds confidence."
              copy="This is why Frithly opportunities feel different. A company starts as raw noise, then gradually gains fit, context, routing quality, and recommendation strength until it becomes worthy of weekly delivery."
            />
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div className="space-y-4">
              {evolutionPhases.map((phase, index) => (
                <motion.button
                  key={phase.id}
                  className={cn(
                    "w-full rounded-[1.45rem] border p-5 text-left backdrop-blur-xl transition-colors sm:p-6",
                    activeEvolutionPhase === index
                      ? "border-[#ffb088]/25 bg-[#ffb088]/10"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.05]",
                  )}
                  onClick={() => setActiveEvolutionPhase(index)}
                  type="button"
                  {...getRevealMotion(reduceMotion, index * 0.04)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-white">{phase.label}</div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                      Score {phase.score}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/66">{phase.summary}</p>
                </motion.button>
              ))}
            </div>

            <motion.div
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,31,0.96)_0%,rgba(8,15,24,0.96)_100%)] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.35)] sm:p-7"
              {...getRevealMotion(reduceMotion, 0.1)}
            >
              <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                    Opportunity state
                  </div>
                  <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.05] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">Northline Studio</div>
                        <p className="mt-2 text-sm leading-7 text-white/68">
                          Creative services company moving through the intelligence system.
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm font-semibold text-white">
                        {activeEvolution.score}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeEvolution.id}
                          className="flex flex-wrap gap-2"
                          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                          exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                        >
                          {activeEvolution.chips.map((chip) => (
                            <span
                              key={chip}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/74"
                            >
                              {chip}
                            </span>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                    Signal becomes intelligence
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: "Fit signal", width: `${34 + activeEvolutionPhase * 18}%` },
                      { label: "Founder clarity", width: `${18 + activeEvolutionPhase * 22}%` },
                      { label: "Routing quality", width: `${20 + activeEvolutionPhase * 20}%` },
                      { label: "Recommendation confidence", width: `${26 + activeEvolutionPhase * 21}%` },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-white/68">{item.label}</span>
                          <span className="font-semibold text-white">{item.width}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <motion.div
                            className="h-2 rounded-full bg-gradient-to-r from-[#ff8c5a] to-[#ffd1b7]"
                            initial={reduceMotion ? undefined : { width: 0 }}
                            animate={reduceMotion ? undefined : { width: item.width }}
                            transition={{ duration: 0.55 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.35rem] border border-white/10 bg-[#0b1520] p-4">
                    <div className="text-sm font-semibold text-white">Why it matters</div>
                    <p className="mt-3 text-sm leading-7 text-white/66">
                      The same company looks materially different once fit, founder relevance,
                      recommendation strength, and delivery practicality are all visible together.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="relative border-t border-white/8 py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <motion.div className="space-y-6" {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Weekly delivery system"
              title="Frithly is a premium weekly outbound intelligence operation."
              copy="The system is not trying to automate everything instantly. It is trying to create a calmer, more disciplined operating rhythm where the cohort is reviewed, routed, and released with care."
            />

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffb088]/12 text-[#ffb088]">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Every Monday</div>
                  <div className="text-sm text-white/62">
                    reviewed cohorts finalized, exports prepared, delivery released
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,31,0.96)_0%,rgba(8,15,24,0.96)_100%)] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.35)] sm:p-7"
            {...getRevealMotion(reduceMotion, 0.1)}
          >
            <div className="space-y-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                Monday operations
              </div>
              {mondaySystem.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4"
                  initial={reduceMotion ? undefined : { opacity: 0, x: 14 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{item.label}</div>
                    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                      {item.time}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/66">{item.body}</p>
                </motion.div>
              ))}

              <div className="rounded-[1.35rem] border border-white/10 bg-[#0b1520] p-4">
                <div className="text-sm font-semibold text-white">Rest of the week</div>
                <div className="mt-4 space-y-3">
                  {[
                    "Outcome signals begin collecting against the released cohort.",
                    "Drafts, edge cases, and route quality get refined with operator feedback.",
                    "The next cycle becomes sharper before the next Monday release.",
                  ].map((item) => (
                    <div key={item} className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/66">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="icp-demo" className="relative border-t border-white/8 py-20 sm:py-24 lg:py-28">
        <Container className="space-y-8">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Interactive ICP intelligence demo"
              title="Choose an outbound brief and watch the intelligence system respond."
              copy="Select your industry, geography, targeting depth, and opportunity goals. Then watch opportunities appear with stronger confidence, founder context, and SMTP-aware qualification."
            />
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6"
            {...getRevealMotion(reduceMotion, 0.08)}
          >
            <div className="grid gap-8 lg:grid-cols-[0.32fr_0.68fr]">
              <div className="space-y-5">
                <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1520] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                    Demo behavior
                  </div>
                  <div className="mt-4 space-y-4">
                    {[
                      "Opportunity generation begins from the ICP, not from a giant source dump.",
                      "Confidence signals strengthen as context, routing quality, and founder awareness accumulate.",
                      "Premium opportunities glow because the queue is being filtered, not padded.",
                    ].map((item, index) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#ffb088]/12 text-xs font-semibold text-[#ffb088]">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-7 text-white/68">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button asChild size="lg">
                  <Link href={ROUTES.DEMO}>
                    <span className="inline-flex items-center gap-2">
                      Launch Full Demo
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
              </div>

              <div className="min-w-0 rounded-[1.6rem] border border-white/10 bg-[#f8f4ec] p-1.5">
                <IcpDemoExperience />
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="program-builder" className="relative border-t border-white/8 py-20 sm:py-24 lg:py-28">
        <Container className="space-y-10">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Custom program builder"
              title="Design a tailored outbound intelligence program instead of picking a SaaS plan."
              copy="Frithly Core Intelligence Program starts from €499/month. From there, your program evolves around opportunity volume, geography coverage, targeting depth, founder priority, SMTP-safe prioritization, support, and cadence."
            />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,31,0.96)_0%,rgba(8,15,24,0.96)_100%)] p-6 shadow-[0_34px_110px_rgba(0,0,0,0.35)] sm:p-7"
              {...getRevealMotion(reduceMotion, 0.08)}
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                    Frithly Core Intelligence Program
                  </div>
                  <div className="text-2xl font-semibold text-white">Starting from €499/month</div>
                </div>

                <SliderControl
                  label="Weekly opportunity target"
                  max={60}
                  min={12}
                  onChange={setWeeklyOpportunityTarget}
                  step={3}
                  value={weeklyOpportunityTarget}
                  valueLabel={`${weeklyOpportunityTarget} / week`}
                />

                <SliderControl
                  label="Targeting depth"
                  max={5}
                  min={1}
                  onChange={setTargetingDepth}
                  value={targetingDepth}
                  valueLabel={`${targetingDepth} layers`}
                />

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">Geography coverage</div>
                  <div className="grid gap-3">
                    {coverageOptions.map((option) => (
                      <BuilderOptionButton
                        key={option.id}
                        active={coverage === option.id}
                        description={option.description}
                        label={option.label}
                        onClick={() => setCoverage(option.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <BuilderOptionButton
                    active={founderPriority}
                    description="Increase founder intelligence depth so decision-maker clarity plays a larger role in the queue."
                    label="Founder-priority targeting"
                    onClick={() => setFounderPriority((current) => !current)}
                  />
                  <BuilderOptionButton
                    active={smtpPriority}
                    description="Keep SMTP-safe prioritization higher inside the release workflow for a more conservative delivery profile."
                    label="SMTP-safe prioritization"
                    onClick={() => setSmtpPriority((current) => !current)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">Outreach support</div>
                  <div className="grid gap-3">
                    {builderSupportOptions.map((option) => (
                      <BuilderOptionButton
                        key={option.id}
                        active={builderSupport === option.id}
                        description={option.description}
                        label={option.label}
                        onClick={() => setBuilderSupport(option.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">Delivery cadence</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cadenceOptions.map((option) => (
                      <BuilderOptionButton
                        key={option.id}
                        active={deliveryCadence === option.id}
                        description={option.description}
                        label={option.label}
                        onClick={() => setDeliveryCadence(option.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7"
              {...getRevealMotion(reduceMotion, 0.12)}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                      Your Intelligence Program
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-white">
                      {formatEuroRange(programPreview.priceLow, programPreview.priceHigh)}
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/72">
                    Consultative estimate
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    `${programPreview.monthlyReviewed} reviewed opportunities/month`,
                    founderPriority ? "Founder-priority targeting" : "Balanced targeting",
                    smtpPriority ? "SMTP-aware delivery" : "Standard routing review",
                    `${programPreview.coverageLabel} coverage`,
                    `${programPreview.targetingLabel}`,
                    deliveryCadence === "weekly" ? "Weekly intelligence cohorts" : "Bi-weekly releases",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.1rem] border border-white/10 bg-[#0b1520] px-4 py-4 text-sm text-white/74"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1520] p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Globe2 className="h-4 w-4 text-[#ffb088]" aria-hidden="true" />
                    Live program preview
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Reviewed monthly", value: String(programPreview.monthlyReviewed) },
                      { label: "Cadence", value: deliveryCadence === "weekly" ? "Weekly" : "Bi-weekly" },
                      { label: "Support", value: programPreview.supportLabel },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                          {item.label}
                        </div>
                        <div className="mt-2 text-base font-semibold text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-sm leading-7 text-white/66">
                  This estimate is designed to feel like a program conversation, not a SaaS cart. The
                  exact shape depends on ICP complexity, geography, review depth, and how much
                  intelligence support you want inside the weekly cycle.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
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
                    className="border-white/12 bg-white/[0.06] text-white hover:border-white/28 hover:bg-white/[0.1] hover:text-white"
                  >
                    <Link href={ROUTES.DEMO}>Launch Full Demo</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section id="roi-experience" className="relative border-t border-white/8 py-20 sm:py-24 lg:py-28">
        <Container className="space-y-10">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="ROI intelligence experience"
              title="Outbound inefficiency is expensive, but the cost is usually hidden."
              copy="Frithly treats ROI as an opportunity simulator, not a spreadsheet. Before you open the calculator, look at what happens when generic outbound is compared with a smaller, reviewed, SMTP-aware, founder-aware weekly cohort."
            />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              className="rounded-[1.9rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
              {...getRevealMotion(reduceMotion, 0.08)}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">
                Traditional outbound
              </div>
              <div className="mt-4 space-y-4">
                {[
                  "1000 noisy contacts",
                  "Generic outreach",
                  "Low-quality conversations",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-300/10 text-sm font-semibold text-rose-300">
                      {index + 1}
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-[#0b1520] px-4 py-3 text-sm text-white/74">
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,176,136,0.09)_0%,rgba(255,255,255,0.03)_100%)] p-6 backdrop-blur-xl"
              {...getRevealMotion(reduceMotion, 0.12)}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                Frithly
              </div>
              <div className="mt-4 space-y-4">
                {[
                  "100 reviewed opportunities",
                  "SMTP-safe routing",
                  "Founder-aware targeting",
                  "Higher-quality conversations",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffb088]/12 text-sm font-semibold text-[#ffb088]">
                      {index + 1}
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-[#0b1520] px-4 py-3 text-sm text-white/74">
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#f8f4ec] p-2 shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
            {...getRevealMotion(reduceMotion, 0.14)}
          >
            <RoiCalculatorExperience />
          </motion.div>
        </Container>
      </section>

      <section className="relative border-t border-white/8 py-20 sm:py-24 lg:py-28">
        <Container className="space-y-10">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Operational trust layer"
              title="Trust comes from operational depth, not vanity metrics."
              copy="Reviewed opportunities, SMTP-safe prioritization, founder intelligence, weekly QA, recommendation confidence, and outbound readiness are all part of the product. That is what makes the service believable."
            />
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {operationalTrustSignals.map((signal, index) => {
              const Icon = signal.icon;

              return (
                <motion.div
                  key={signal.title}
                  className="rounded-[1.65rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
                  {...getRevealMotion(reduceMotion, 0.08 + index * 0.05)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffb088]/12 text-[#ffb088]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{signal.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/66">{signal.body}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="relative border-t border-white/8 py-20 sm:py-24 lg:py-28">
        <Container className="space-y-10">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Intelligence delivery timeline"
              title="The customer experience is a weekly operating rhythm, not a one-click automation."
              copy="From Monday cohort finalization to Friday optimization, every day has a role in keeping delivery disciplined, selective, and useful."
            />
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-5">
            {deliveryTimeline.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.day}
                  className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl"
                  {...getRevealMotion(reduceMotion, 0.08 + index * 0.04)}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffb088]/12 text-[#ffb088]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="mt-5 text-lg font-semibold text-white">{item.day}</div>
                  <p className="mt-3 text-sm leading-7 text-white/66">{item.copy}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="faq" className="relative border-t border-white/8 py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <motion.div className="space-y-5" {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="FAQ"
              title="The calm version of how Frithly works."
              copy="Frithly is designed to feel premium, selective, and operationally disciplined. These are the questions teams usually ask when they are comparing us to traditional lead generation workflows."
            />
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#f8f4ec] px-5 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:px-6"
            {...getRevealMotion(reduceMotion, 0.1)}
          >
            <Accordion type="single" collapsible>
              {platformFaqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`} className="border-border/70">
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </Container>
      </section>

      <section className="relative border-t border-white/8 pb-16 pt-8 sm:pb-20 lg:pb-24">
        <Container>
          <motion.div
            className="relative overflow-hidden rounded-[2.1rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,31,0.98)_0%,rgba(8,15,24,0.98)_100%)] px-6 py-10 shadow-[0_34px_110px_rgba(0,0,0,0.35)] sm:px-8 sm:py-12 lg:px-12 lg:py-16"
            {...getRevealMotion(reduceMotion, 0.04)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,176,136,0.22),transparent_26rem),radial-gradient(circle_at_bottom_right,rgba(107,167,255,0.1),transparent_22rem)]" />
            <div className="pointer-events-none absolute right-[-4rem] top-[-2rem] h-56 w-56 rounded-full bg-[#ffb088]/15 blur-3xl" />
            <div className="pointer-events-none absolute left-[10%] top-[18%] h-40 w-40 rounded-full bg-white/6 blur-3xl" />

            {heroParticles.slice(0, 4).map((particle) => (
              <motion.span
                key={`cta-${particle.left}-${particle.top}`}
                className="absolute rounded-full bg-[#ffb088]/75 shadow-[0_0_24px_rgba(255,176,136,0.65)]"
                style={{
                  height: particle.size,
                  left: particle.left,
                  top: particle.top,
                  width: particle.size,
                }}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: [0.25, 0.92, 0.25],
                        y: [0, -20, 0],
                      }
                }
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        delay: particle.delay,
                        duration: particle.duration,
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                      }
                }
              />
            ))}

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ffb088]">
                  Final cinematic CTA
                </div>
                <h2 className={`${displayFont.className} max-w-4xl text-4xl leading-[0.92] text-white sm:text-5xl lg:text-6xl`}>
                  Design Your Outbound Intelligence Program.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-white/72 md:text-[1.08rem] md:leading-9">
                  Every Frithly delivery is tailored around your ICP, targeting depth, opportunity
                  quality, and weekly outbound goals.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild size="lg" className="shadow-[0_18px_48px_rgba(212,98,58,0.28)]">
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
                  className="border-white/12 bg-white/[0.06] text-white hover:border-white/28 hover:bg-white/[0.1] hover:text-white"
                >
                  <Link href="#living-engine">Watch the Intelligence Flow</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}

