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
  Layers3,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const heroChips = [
  "Reviewed intelligence",
  "SMTP-aware routing",
  "Founder-confidence scoring",
  "Weekly cohort delivery",
];

const heroSignals = [
  {
    label: "Premium opportunities held for review",
    note: "Operator-reviewed before release",
    value: "14",
  },
  {
    label: "SMTP-safe routes ready now",
    note: "Prioritized for careful deployment",
    value: "6",
  },
  {
    label: "Average founder confidence",
    note: "Confidence-aware targeting, not blind enrichment",
    value: "0.87",
  },
  {
    label: "Projected reply lift",
    note: "From higher-signal opportunity selection",
    value: "4.2x",
  },
];

const storytellingSteps = [
  {
    description:
      "Every delivery starts with a commercial brief: market, geography, services, decision-maker profile, and the kinds of opportunities that are actually worth attention.",
    detail:
      "The system narrows around fit before it ever expands volume, so the workflow begins from selectivity rather than cleanup.",
    highlights: ["ICP brief", "Geo targeting", "Commercial filters"],
    id: "icp",
    label: "ICP",
    metricLabel: "Brief quality",
    metricValue: "High-confidence",
    title: "Translate the ICP into a delivery brief the team can actually trust.",
  },
  {
    description:
      "Discovery expands carefully through market-aware queries and source collection, building a broad but still directed candidate set instead of a generic scrape.",
    detail:
      "The question is not how many records can be pulled. The question is where worthwhile opportunities are most likely to exist.",
    highlights: ["City-aware discovery", "Target market expansion", "Source coverage"],
    id: "discovery",
    label: "Discovery",
    metricLabel: "Candidates surfaced",
    metricValue: "Selective expansion",
    title: "Search for signal, not just volume.",
  },
  {
    description:
      "Enrichment adds service fit, website quality, contact routes, and founder context so the opportunity carries real outbound intelligence, not just a company name.",
    detail:
      "This is where weak opportunities start separating from the ones that deserve further review.",
    highlights: ["Founder-aware", "Service context", "Contact paths"],
    id: "enrichment",
    label: "Enrichment",
    metricLabel: "Research density",
    metricValue: "Layered context",
    title: "Build commercial context before making a recommendation.",
  },
  {
    description:
      "Recommendation scoring ranks opportunities by fit, freshness, founder confidence, contactability, and historical outcome patterns, so the strongest bets rise first.",
    detail:
      "Frithly is designed to make good opportunities feel scarce on purpose. Scarcity is the sign the system is filtering correctly.",
    highlights: ["Recommendation rank", "Outcome-aware learning", "Priority thresholds"],
    id: "scoring",
    label: "Scoring",
    metricLabel: "Priority band",
    metricValue: "Premium first",
    title: "Rank the queue so operators review the highest-confidence opportunities first.",
  },
  {
    description:
      "SMTP-aware filtering keeps routing quality in the loop, making sure promising opportunities are also practical and reputation-conscious enough for outbound handling.",
    detail:
      "Readiness is not only about who the company is. It is also about whether the route is safe enough to use.",
    highlights: ["SMTP-aware", "Routing quality", "Delivery readiness"],
    id: "smtp",
    label: "SMTP-safe filtering",
    metricLabel: "Delivery risk",
    metricValue: "Constrained carefully",
    title: "Reduce wasted outreach before the cohort ever ships.",
  },
  {
    description:
      "The final output is a curated weekly cohort: reviewed, confidence-ranked, SMTP-conscious, and prepared for Monday delivery rather than dropped as a raw file.",
    detail:
      "This is where the intelligence becomes operationally useful for agencies and outbound teams.",
    highlights: ["Weekly rhythm", "Reviewed cohort", "Release-ready exports"],
    id: "delivery",
    label: "Weekly delivery",
    metricLabel: "Release cadence",
    metricValue: "Every Monday",
    title: "Package the strongest opportunities into a high-touch weekly release.",
  },
] as const;

const traditionalFunnel = [
  { label: "Mass scraped records", value: "300" },
  { label: "Low-context outreach targets", value: "220" },
  { label: "Actually worth reviewing", value: "18" },
  { label: "Safe to route", value: "6" },
];

const frithlyFunnel = [
  { label: "Directed discovery candidates", value: "120" },
  { label: "High-context enriched opportunities", value: "34" },
  { label: "Recommendation-ranked for review", value: "14" },
  { label: "Weekly cohort released", value: "6" },
];

const mondayCadence = [
  {
    body: "Reviewed opportunities are finalized against the active brief so the cohort reflects fit, context, and recommendation quality.",
    label: "Reviewed opportunities locked",
    time: "08:30",
  },
  {
    body: "Founder-aware, recommendation-ranked opportunities are packaged into a selective weekly cohort instead of a raw export dump.",
    label: "Premium cohort finalized",
    time: "10:00",
  },
  {
    body: "Routing quality is checked and SMTP-safe exports are prepared so delivery stays practical as well as promising.",
    label: "SMTP-aware exports prepared",
    time: "11:30",
  },
  {
    body: "Outreach-ready intelligence is released with notes, confidence signals, and the context needed to turn review into action.",
    label: "Delivery released",
    time: "13:00",
  },
];

const restOfWeek = [
  "Tuesday: outcome signals begin collecting against the released cohort.",
  "Wednesday: operators review replies, edge cases, and routing feedback.",
  "Thursday: weak patterns are filtered out of future recommendations.",
  "Friday: next week's ICP brief is refined before the next Monday release.",
];

const trustSignals = [
  {
    body: "Every released cohort is reviewed before it ships. Frithly is designed to reduce manual chaos, not hide it.",
    title: "Reviewed before release",
  },
  {
    body: "SMTP-aware prioritization stays inside the workflow so the best-looking opportunity still has to be practical to route.",
    title: "SMTP-safe prioritization",
  },
  {
    body: "Founder confidence, recommendation rank, and outcome feedback work together so the intelligence layer keeps getting sharper.",
    title: "Confidence-aware learning",
  },
];

const cohortSnapshots = [
  {
    headline: "UK creative agencies",
    note: "Anonymized Monday release prepared for a founder-led outbound team.",
    stats: [
      { label: "Reviewed", value: "17" },
      { label: "SMTP-safe", value: "6" },
      { label: "Founder confidence", value: "0.86" },
    ],
  },
  {
    headline: "US niche B2B services",
    note: "Recommendation-ranked cohort packaged after geography and service-fit review.",
    stats: [
      { label: "Reviewed", value: "22" },
      { label: "SMTP-safe", value: "8" },
      { label: "Premium density", value: "41%" },
    ],
  },
  {
    headline: "GCC design consultancies",
    note: "Selective routing with founder-aware prioritization and higher manual QA.",
    stats: [
      { label: "Reviewed", value: "14" },
      { label: "SMTP-safe", value: "5" },
      { label: "Delivery ready", value: "Monday" },
    ],
  },
];

const builderSupportOptions = [
  {
    description: "Reviewed intelligence with recommendation rank and routing context.",
    id: "intelligence",
    label: "Intelligence only",
  },
  {
    description: "Add curated drafts and release notes for outbound operators.",
    id: "drafts",
    label: "Draft support",
  },
  {
    description: "Closer-to-deployment packaging with cohort release guidance.",
    id: "delivery",
    label: "Delivery support",
  },
] as const;

type BuilderSupport = (typeof builderSupportOptions)[number]["id"];

const regionLabels = ["Single market", "Two markets", "Three markets", "Four markets"];
const depthLabels = [
  "Core fit signals",
  "Expanded service context",
  "Founder and routing depth",
  "High-touch confidence layering",
  "Maximum review precision",
];

function getRevealMotion(reduceMotion: boolean, delay = 0) {
  if (reduceMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 28 },
    transition: {
      delay,
      duration: 0.75,
    },
    viewport: { amount: 0.2, once: true },
    whileInView: { opacity: 1, y: 0 },
  };
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
      <div className="section-eyebrow">{eyebrow}</div>
      <h2 className={`${displayFont.className} section-title`}>{title}</h2>
      <p className={cn("section-copy max-w-2xl", align === "center" && "mx-auto")}>{copy}</p>
    </div>
  );
}

function ProgramSlider({
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
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/78">
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
  const [activeStoryStep, setActiveStoryStep] = useState(0);
  const [programVolume, setProgramVolume] = useState(18);
  const [programRegions, setProgramRegions] = useState(2);
  const [programDepth, setProgramDepth] = useState(3);
  const [programSupport, setProgramSupport] = useState<BuilderSupport>("drafts");

  const activeStory = storytellingSteps[activeStoryStep];
  const programSupportConfig = builderSupportOptions.find((item) => item.id === programSupport);

  const programPreview = useMemo(() => {
    const supportMultiplier =
      programSupport === "delivery" ? 1.12 : programSupport === "drafts" ? 1.05 : 0.94;
    const reviewedWeekly = Math.round(
      programVolume * (1.8 + programRegions * 0.22 + programDepth * 0.18) * supportMultiplier,
    );
    const cohortReleased = Math.max(
      6,
      Math.round(reviewedWeekly * (0.32 + programDepth * 0.04 + (programSupport === "delivery" ? 0.08 : 0))),
    );
    const smtpReady = Math.max(
      4,
      Math.round(cohortReleased * (programSupport === "intelligence" ? 0.7 : 0.78)),
    );

    return {
      cohortReleased,
      regionLabel: regionLabels[programRegions - 1],
      reviewedWeekly,
      smtpReady,
      supportSummary:
        programSupport === "delivery"
          ? "Reviewed intelligence, curated drafts, and Monday release support."
          : programSupport === "drafts"
            ? "Reviewed intelligence with curated drafts and release notes."
            : "Reviewed intelligence with delivery-ready context for your own outbound team.",
      targetingDepth: depthLabels[programDepth - 1],
    };
  }, [programDepth, programRegions, programSupport, programVolume]);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[54rem] bg-[radial-gradient(circle_at_top_left,rgba(212,98,58,0.16),transparent_24rem),radial-gradient(circle_at_72%_18%,rgba(18,28,40,0.18),transparent_23rem),linear-gradient(180deg,rgba(255,255,255,0.76)_0%,rgba(250,248,245,0.72)_34%,rgba(246,241,233,0.32)_100%)]" />
      <div className="pointer-events-none absolute left-[-10rem] top-[18rem] -z-10 h-72 w-72 rounded-full bg-terracotta/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-[28rem] -z-10 h-80 w-80 rounded-full bg-[#15263a]/10 blur-3xl" />

      <section className="relative py-12 sm:py-16 lg:min-h-[calc(100vh-5rem)] lg:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <motion.div className="space-y-8" {...getRevealMotion(reduceMotion, 0.05)}>
            <Badge className="w-fit bg-white/80 text-terracotta shadow-sm" variant="outline">
              Premium curated outbound intelligence
            </Badge>

            <div className="space-y-6">
              <h1
                className={`${displayFont.className} max-w-5xl text-[3rem] leading-[0.9] text-ink sm:text-[4.35rem] lg:max-w-[10.5ch] lg:text-[5.8rem]`}
              >
                Curated Outbound Intelligence Delivered Weekly.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted md:text-[1.16rem] md:leading-9">
                Frithly helps agencies and outbound teams discover higher-confidence opportunities
                through reviewed intelligence, SMTP-aware routing, founder targeting, and curated
                weekly delivery.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={ROUTES.APPLY}>
                  <span className="inline-flex items-center gap-2">
                    Apply for a Campaign
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="#intelligence-workflow">Explore the Intelligence Workflow</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {heroChips.map((chip) => (
                <div key={chip} className="metric-chip">
                  <CheckCircle2 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                  <span>{chip}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-3 rounded-[1.8rem] border border-border/80 bg-white/70 p-4 shadow-[0_20px_60px_rgba(26,26,26,0.06)] backdrop-blur sm:grid-cols-2 sm:p-5">
              {heroSignals.map((signal, index) => (
                <motion.div
                  key={signal.label}
                  className="rounded-[1.35rem] border border-border/70 bg-white/88 p-4 shadow-[0_14px_34px_rgba(20,20,20,0.05)]"
                  {...getRevealMotion(reduceMotion, 0.12 + index * 0.06)}
                >
                  <div className="text-2xl font-semibold tracking-tighter text-ink sm:text-3xl">
                    {signal.value}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink">{signal.label}</p>
                  <p className="mt-2 text-xs leading-6 text-muted sm:text-sm">{signal.note}</p>
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
                    y: [0, -10, 0],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : {
                    duration: 8,
                    ease: "easeInOut",
                    repeat: Number.POSITIVE_INFINITY,
                  }
            }
          >
            <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(212,98,58,0.22),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_28%)] blur-2xl" />
            <div className="surface-card-dark animated-glow relative overflow-hidden px-5 py-6 shadow-[0_28px_90px_rgba(14,14,14,0.34)] sm:px-6 sm:py-7">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
              <div className="absolute right-8 top-8 h-36 w-36 rounded-full bg-terracotta/10 blur-2xl" />
              <div className="absolute left-8 bottom-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

              <div className="relative space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-terracotta">
                      Live intelligence release
                    </div>
                    <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
                      Monday&apos;s curated cohort
                    </h2>
                  </div>
                  <BrandMark
                    className="h-14 w-14 border-white/10 bg-white/8 p-1.5 shadow-none"
                    imageClassName="h-full w-full rounded-[0.95rem]"
                    priority
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                  <motion.div
                    className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.03] p-4"
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            boxShadow: [
                              "0 0 0 rgba(0,0,0,0)",
                              "0 0 0 rgba(0,0,0,0)",
                              "0 0 48px rgba(212,98,58,0.12)",
                              "0 0 0 rgba(0,0,0,0)",
                            ],
                          }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            duration: 5,
                            ease: "easeInOut",
                            repeat: Number.POSITIVE_INFINITY,
                          }
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-400/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                          SMTP-safe now
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-white">Visionary Growth</h3>
                        <p className="mt-2 text-sm leading-7 text-white/70">
                          Founder-aware opportunity with strong service fit, recent enrichment, and a
                          cleaner routing path than the broader workspace baseline.
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                        100
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/78">
                      {["Founder confidence 0.91", "Premium contactability", "Freshness 2 days"].map(
                        (item) => (
                          <span key={item} className="rounded-full border border-white/10 px-3 py-1">
                            {item}
                          </span>
                        ),
                      )}
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {[
                        { label: "Recommendation", value: "Premium" },
                        { label: "Route", value: "SMTP-aware" },
                        { label: "Delivery", value: "Monday" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3"
                        >
                          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                            {item.label}
                          </div>
                          <div className="mt-2 text-base font-semibold text-white">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <div className="space-y-4">
                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Radar className="h-4 w-4 text-terracotta" aria-hidden="true" />
                        Intelligence stream
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          "Recommendation glow state locked",
                          "Founder-confidence threshold passed",
                          "SMTP-safe route prioritized",
                          "Weekly cohort prepared",
                        ].map((line, index) => (
                          <motion.div
                            key={line}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/72"
                            initial={reduceMotion ? undefined : { opacity: 0.45, x: -10 }}
                            animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55], x: [0, 6, 0] }}
                            transition={
                              reduceMotion
                                ? undefined
                                : {
                                    delay: index * 0.18,
                                    duration: 3.4,
                                    ease: "easeInOut",
                                    repeat: Number.POSITIVE_INFINITY,
                                  }
                            }
                          >
                            {line}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-4">
                      <div className="text-sm font-semibold text-white">This week&apos;s release rhythm</div>
                      <div className="mt-4 space-y-3">
                        {[
                          { label: "Reviewed opportunities", value: "14" },
                          { label: "SMTP-safe routes", value: "6" },
                          { label: "Weekly cohort release", value: "Monday" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-white/65">{item.label}</span>
                            <span className="font-semibold text-white">{item.value}</span>
                          </div>
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

      <section id="intelligence-workflow" className="py-16 sm:py-20 lg:py-24">
        <Container className="space-y-12">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Scroll-based intelligence story"
              title="The system thinks in stages so operators can act with confidence."
              copy="As you move through the workflow, each stage narrows the opportunity set, adds richer context, and increases delivery readiness. The goal is not more records. The goal is a better Monday release."
            />
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <div className="space-y-5">
              {storytellingSteps.map((step, index) => (
                <motion.article
                  key={step.id}
                  className={cn(
                    "surface-card p-5 transition-all duration-500 sm:p-6",
                    activeStoryStep === index &&
                      "border-terracotta/30 shadow-[0_28px_80px_rgba(212,98,58,0.12)]",
                  )}
                  onViewportEnter={() => setActiveStoryStep(index)}
                  {...getRevealMotion(reduceMotion, index * 0.03)}
                  viewport={{ amount: 0.45, once: false }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                      {step.label}
                    </div>
                    <div
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
                        activeStoryStep === index
                          ? "border-terracotta/20 bg-terracotta/10 text-terracotta"
                          : "border-border bg-white text-muted",
                      )}
                    >
                      {step.metricValue}
                    </div>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{step.description}</p>
                  <p className="mt-3 text-sm leading-7 text-muted/85">{step.detail}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {step.highlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border/80 bg-stone-50 px-3 py-1.5 text-xs font-medium text-ink"
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
                className="surface-card-dark overflow-hidden px-5 py-6 shadow-[0_28px_90px_rgba(14,14,14,0.34)] sm:px-6 sm:py-7"
                {...getRevealMotion(reduceMotion, 0.1)}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                        Active intelligence stage
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">{activeStory.label}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/72">
                      {`${activeStoryStep + 1} / ${storytellingSteps.length}`}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {storytellingSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className={cn(
                          "rounded-[1rem] border px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
                          activeStoryStep === index
                            ? "border-terracotta/30 bg-terracotta/12 text-terracotta"
                            : "border-white/10 bg-white/[0.04] text-white/45",
                        )}
                      >
                        {step.label}
                      </div>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStory.id}
                      className="space-y-5 rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.04] p-5"
                      initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-terracotta">
                            {activeStory.metricLabel}
                          </div>
                          <h3 className="mt-2 text-2xl font-semibold text-white">
                            {activeStory.title}
                          </h3>
                        </div>
                        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                          {activeStory.metricValue}
                        </div>
                      </div>

                      <p className="text-sm leading-7 text-white/70">{activeStory.description}</p>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {activeStory.highlights.map((item, index) => (
                          <motion.div
                            key={item}
                            className="rounded-[1rem] border border-white/10 bg-white/[0.05] px-3 py-4"
                            initial={reduceMotion ? undefined : { opacity: 0.45, y: 10 }}
                            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06, duration: 0.3 }}
                          >
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                              Signal
                            </div>
                            <div className="mt-2 text-sm font-semibold text-white">{item}</div>
                          </motion.div>
                        ))}
                      </div>

                      <div className="rounded-[1.2rem] border border-white/10 bg-[#0d1722] p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <Layers3 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                          Live workflow readout
                        </div>
                        <div className="mt-4 space-y-3">
                          {[
                            `Current focus: ${activeStory.label}`,
                            activeStory.detail,
                            "Each stage narrows the queue before the next operational handoff.",
                          ].map((line) => (
                            <div key={line} className="rounded-full border border-white/10 px-3 py-2 text-sm text-white/72">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>

      <section id="demo-preview" className="py-16 sm:py-20 lg:py-24">
        <Container className="space-y-8">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Interactive ICP demo preview"
              title="Preview how Frithly shapes opportunity intelligence around a real outbound brief."
              copy="Select an industry, geography, and opportunity goal, then watch the intelligence layer assemble recommendation-ranked opportunities with confidence and routing context."
            />
          </motion.div>

          <motion.div
            className="surface-card overflow-hidden px-4 py-5 shadow-[0_22px_70px_rgba(26,26,26,0.08)] sm:px-6 sm:py-6"
            {...getRevealMotion(reduceMotion, 0.1)}
          >
            <div className="grid gap-8 lg:grid-cols-[0.33fr_0.67fr] lg:items-start">
              <div className="space-y-5">
                <div className="rounded-[1.4rem] border border-border/80 bg-[linear-gradient(180deg,#fbf8f3_0%,#ffffff_100%)] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                    Demo flow
                  </div>
                  <div className="mt-4 space-y-4">
                    {[
                      "Choose your industry focus and geography.",
                      "Set the opportunity goal and contactability threshold.",
                      "Watch recommendation-ranked intelligence appear.",
                    ].map((item, index) => (
                      <div key={item} className="flex items-start gap-3">
                        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-terracotta/10 text-xs font-semibold text-terracotta">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-7 text-muted">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.4rem] border border-border/80 bg-white p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Sparkles className="h-4 w-4 text-terracotta" aria-hidden="true" />
                    What you see appear
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "Opportunity feed",
                      "Recommendation score",
                      "SMTP-safe tags",
                      "Founder confidence",
                      "Premium opportunity glow",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border/80 bg-stone-50 px-3 py-1.5 text-xs font-medium text-ink"
                      >
                        {item}
                      </span>
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

              <div className="min-w-0">
                <IcpDemoExperience />
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container className="space-y-10">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Opportunity quality narrative"
              title="Better opportunities outperform bigger lists."
              copy="Frithly is built for teams that want cleaner targeting, stronger context, and better routing discipline. The goal is not to send more. The goal is to waste less."
            />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              className="surface-card overflow-hidden border-rose-200/60 bg-[linear-gradient(180deg,#fff8f6_0%,#ffffff_100%)] p-6 shadow-[0_22px_70px_rgba(26,26,26,0.06)]"
              {...getRevealMotion(reduceMotion, 0.08)}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">
                    Traditional outbound
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">Bigger list. Weaker signal.</h3>
                </div>
                <Badge className="border-rose-200 bg-rose-50 text-rose-600" variant="outline">
                  Noisy by default
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                {traditionalFunnel.map((item, index) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted">{item.label}</span>
                      <span className="font-semibold text-ink">{item.value}</span>
                    </div>
                    <motion.div
                      className="h-2 rounded-full bg-rose-100"
                      initial={reduceMotion ? undefined : { opacity: 0.5 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-rose-300 to-rose-400"
                        initial={reduceMotion ? undefined : { width: 0 }}
                        whileInView={
                          reduceMotion
                            ? undefined
                            : { width: `${100 - index * 22}%` }
                        }
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                      />
                    </motion.div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm leading-7 text-muted">
                {[
                  "Mass scraped records with little commercial context",
                  "Generic targeting that leaves operators cleaning the queue manually",
                  "Weak routing awareness until late in the workflow",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-2 h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="surface-card-dark overflow-hidden p-6 shadow-[0_30px_90px_rgba(14,14,14,0.32)]"
              {...getRevealMotion(reduceMotion, 0.12)}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                    Frithly
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Smaller queue. Higher-confidence output.
                  </h3>
                </div>
                <Badge className="border-emerald-400/20 bg-emerald-400/12 text-emerald-200" variant="outline">
                  Reviewed weekly
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                {frithlyFunnel.map((item, index) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-white/70">{item.label}</span>
                      <span className="font-semibold text-white">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <motion.div
                        className="h-2 rounded-full bg-gradient-to-r from-terracotta to-[#ffb088]"
                        initial={reduceMotion ? undefined : { width: 0 }}
                        whileInView={
                          reduceMotion
                            ? undefined
                            : { width: `${78 - index * 12}%` }
                        }
                        viewport={{ once: true }}
                        transition={{ duration: 0.75 }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-2 text-sm leading-7 text-white/70">
                {[
                  "Reviewed, founder-aware, recommendation-ranked opportunities",
                  "SMTP-safe prioritization before release",
                  "Progressive filtering that protects the quality of the Monday cohort",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <motion.div className="space-y-6" {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Weekly delivery workflow"
              title="A premium weekly operating rhythm, not instant SaaS automation."
              copy="Every Monday follows the same calm release pattern: review, finalize, prepare, and deliver. That rhythm is part of the product, because consistency is what makes the service operationally trustworthy."
            />

            <div className="surface-card p-5 shadow-[0_20px_60px_rgba(26,26,26,0.06)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Weekly cadence
                  </div>
                  <div className="text-xl font-semibold text-ink">The Monday release matters.</div>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-muted">
                {restOfWeek.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="surface-card-dark overflow-hidden p-6 shadow-[0_30px_90px_rgba(14,14,14,0.32)] sm:p-7"
            {...getRevealMotion(reduceMotion, 0.1)}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                  Monday operations cockpit
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-white">Release day checklist</h3>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                Every Monday
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {mondayCadence.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4"
                  initial={reduceMotion ? undefined : { opacity: 0, x: 16 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{item.label}</div>
                    <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                      {item.time}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.body}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="roi-impact" className="py-16 sm:py-20 lg:py-24">
        <Container className="space-y-10">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="ROI / opportunity impact"
              title="Outbound inefficiency is expensive."
              copy="Frithly is built to reduce wasted outreach, improve targeting clarity, and concentrate teams around higher-confidence opportunities. Model the commercial upside of better selection before you scale more activity."
            />
          </motion.div>

          <motion.div {...getRevealMotion(reduceMotion, 0.1)}>
            <RoiCalculatorExperience />
          </motion.div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container className="space-y-10">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Custom program builder preview"
              title="Every Frithly program is tailored around your outbound goals."
              copy="Use the controls to sketch the shape of a program. This is not a cheap pricing calculator. It is a live preview of how delivery scope, geography, targeting depth, and support change the weekly operating model."
            />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <motion.div
              className="surface-card-dark p-6 shadow-[0_30px_90px_rgba(14,14,14,0.32)] sm:p-7"
              {...getRevealMotion(reduceMotion, 0.08)}
            >
              <div className="space-y-6">
                <ProgramSlider
                  label="Weekly opportunity target"
                  max={40}
                  min={8}
                  onChange={setProgramVolume}
                  step={2}
                  value={programVolume}
                  valueLabel={`${programVolume} targets`}
                />
                <ProgramSlider
                  label="Geography expansion"
                  max={4}
                  min={1}
                  onChange={setProgramRegions}
                  value={programRegions}
                  valueLabel={regionLabels[programRegions - 1]}
                />
                <ProgramSlider
                  label="Targeting depth"
                  max={5}
                  min={1}
                  onChange={setProgramDepth}
                  value={programDepth}
                  valueLabel={depthLabels[programDepth - 1]}
                />

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-white">Outreach support</div>
                  <div className="grid gap-3">
                    {builderSupportOptions.map((option) => (
                      <button
                        key={option.id}
                        className={cn(
                          "rounded-[1.2rem] border p-4 text-left transition-colors",
                          programSupport === option.id
                            ? "border-terracotta/35 bg-terracotta/12 text-white"
                            : "border-white/10 bg-white/[0.04] text-white/72",
                        )}
                        onClick={() => setProgramSupport(option.id)}
                        type="button"
                      >
                        <div className="text-sm font-semibold text-white">{option.label}</div>
                        <p className="mt-2 text-sm leading-7 text-white/68">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="surface-card overflow-hidden p-6 shadow-[0_22px_70px_rgba(26,26,26,0.08)] sm:p-7"
              {...getRevealMotion(reduceMotion, 0.12)}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                    Live delivery preview
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">Your program draft</h3>
                </div>
                <BrandMark className="h-14 w-14 p-1.5" imageClassName="h-full w-full rounded-[0.95rem]" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Reviewed weekly", value: String(programPreview.reviewedWeekly) },
                  { label: "Released each Monday", value: String(programPreview.cohortReleased) },
                  { label: "SMTP-prioritized", value: String(programPreview.smtpReady) },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.15rem] border border-border/80 bg-stone-50 px-4 py-4"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                      {item.label}
                    </div>
                    <div className="mt-3 text-2xl font-semibold text-ink">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-border/80 bg-[linear-gradient(180deg,#fbf8f3_0%,#ffffff_100%)] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Layers3 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                  Program shape
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    `Coverage: ${programPreview.regionLabel}`,
                    `Depth: ${programPreview.targetingDepth}`,
                    `Support: ${programSupportConfig?.label ?? "Draft support"}`,
                    `Delivery model: ${programPreview.supportSummary}`,
                  ].map((item) => (
                    <div key={item} className="rounded-full border border-border/80 bg-white px-3 py-2 text-sm text-ink shadow-sm">
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-border/80 bg-white p-5">
                <div className="text-sm font-semibold text-ink">What the Monday release looks like</div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                  <p>{`${programPreview.reviewedWeekly} opportunities reviewed against the active brief.`}</p>
                  <p>{`${programPreview.smtpReady} prioritized for safer routing and cleaner deployment.`}</p>
                  <p>{`${programPreview.cohortReleased} released as the curated cohort your team actually works from.`}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={ROUTES.APPLY}>
                    <span className="inline-flex items-center gap-2">
                      Apply for a Campaign
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href={ROUTES.DEMO}>Explore the Intelligence Workflow</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container className="space-y-10">
          <motion.div {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="Trust / quality layer"
              title="Built for teams that care about operational quality, not vanity metrics."
              copy="Frithly emphasizes reviewed opportunities, founder-aware targeting, SMTP-safe prioritization, delivery QA, and operational intelligence. That is the trust layer."
            />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <motion.div className="space-y-4" {...getRevealMotion(reduceMotion, 0.08)}>
              {trustSignals.map((item) => (
                <div key={item.title} className="surface-card p-5 shadow-[0_20px_60px_rgba(26,26,26,0.06)] sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                      <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-ink">{item.title}</h3>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-muted sm:text-base">{item.body}</p>
                </div>
              ))}
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cohortSnapshots.map((snapshot, index) => (
                <motion.div
                  key={snapshot.headline}
                  className="surface-card h-full overflow-hidden p-5 shadow-[0_20px_60px_rgba(26,26,26,0.06)] sm:p-6"
                  {...getRevealMotion(reduceMotion, 0.1 + index * 0.05)}
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
                    Anonymized cohort example
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-ink">{snapshot.headline}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{snapshot.note}</p>
                  <div className="mt-5 space-y-3">
                    {snapshot.stats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-muted">{stat.label}</span>
                        <span className="font-semibold text-ink">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="faq" className="py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <motion.div className="space-y-5" {...getRevealMotion(reduceMotion, 0.04)}>
            <SectionIntro
              eyebrow="FAQ"
              title="The calm version of how Frithly works."
              copy="Frithly is designed to feel premium, selective, and operationally disciplined. These are the questions teams usually ask when they are comparing us to traditional lead generation workflows."
            />
          </motion.div>

          <motion.div
            className="surface-card overflow-hidden px-5 py-3 shadow-[0_20px_60px_rgba(26,26,26,0.06)] sm:px-6"
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

      <section className="pb-16 pt-6 sm:pb-20 lg:pb-24">
        <Container>
          <motion.div
            className="surface-card-dark relative overflow-hidden px-6 py-10 shadow-[0_34px_110px_rgba(14,14,14,0.36)] sm:px-8 sm:py-12 lg:px-12 lg:py-16"
            {...getRevealMotion(reduceMotion, 0.04)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,98,58,0.22),transparent_28rem),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_24rem)]" />
            <div className="pointer-events-none absolute right-[-4rem] top-[-2rem] h-56 w-56 rounded-full bg-terracotta/15 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-6">
                <div className="section-eyebrow border-white/10 bg-white/10 text-white">
                  Premium final CTA
                </div>
                <h2 className={`${displayFont.className} max-w-4xl text-4xl leading-[0.92] text-white sm:text-5xl lg:text-6xl`}>
                  Design Your Outbound Intelligence Program.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-white/72 md:text-[1.08rem] md:leading-9">
                  Every delivery is tailored around your ICP, targeting depth, and outbound goals.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild size="lg" className="shadow-[0_16px_40px_rgba(212,98,58,0.3)]">
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
                  className="border-white/15 bg-white/10 text-white hover:border-white/30 hover:bg-white/16 hover:text-white"
                >
                  <Link href="#intelligence-workflow">Explore the Intelligence Workflow</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
