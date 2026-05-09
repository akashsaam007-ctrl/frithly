"use client";

import Link from "next/link";
import { Fraunces } from "next/font/google";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
  Filter,
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

const engineStages = [
  {
    body: "Frithly starts by translating the ICP into a real outbound brief so the system knows where precision matters most.",
    confidence: 22,
    id: "icp",
    incoming: 184,
    label: "ICP alignment",
    narrowed: 184,
    signal: "Brief locked",
    title: "Translate the ICP into a selective operating brief.",
    traits: ["Market shape", "Geo focus", "Commercial exclusions"],
  },
  {
    body: "Discovery expands through directed search patterns so coverage can widen without turning noise into progress.",
    confidence: 34,
    id: "discovery",
    incoming: 268,
    label: "Discovery expansion",
    narrowed: 138,
    signal: "Coverage opens",
    title: "Expand the field without rewarding volume for its own sake.",
    traits: ["Source expansion", "Signal-first coverage", "Research pathways"],
  },
  {
    body: "Enrichment adds market context, service fit, and route clues so accounts start behaving like opportunities instead of raw records.",
    confidence: 48,
    id: "enrichment",
    incoming: 268,
    label: "Signal enrichment",
    narrowed: 92,
    signal: "Context accumulates",
    title: "Turn raw company records into believable outbound context.",
    traits: ["Service fit", "Website cues", "Contact routes"],
  },
  {
    body: "Confidence ranking narrows attention toward accounts that are safer to route, easier to trust, and more commercially relevant.",
    confidence: 62,
    id: "scoring",
    incoming: 268,
    label: "Confidence ranking",
    narrowed: 46,
    signal: "Priority tightens",
    title: "Strengthen the queue before the team ever sees it.",
    traits: ["Delivery posture", "Freshness", "Commercial relevance"],
  },
  {
    body: "Founder intelligence adds clearer decision-maker relevance so the strongest accounts feel more obvious before release.",
    confidence: 81,
    id: "founders",
    incoming: 268,
    label: "Founder intelligence",
    narrowed: 21,
    signal: "Decision-maker clarity rises",
    title: "Layer founder relevance into the final shortlist.",
    traits: ["Founder confidence", "Role fit", "Decision-maker context"],
  },
  {
    body: "The final weekly release keeps only the accounts worth carrying forward, with routing notes and review context already attached.",
    confidence: 89,
    id: "release",
    incoming: 268,
    label: "Weekly release",
    narrowed: 15,
    signal: "Monday cohort prepared",
    title: "Package intelligence into a calm weekly delivery.",
    traits: ["Reviewed shortlist", "SMTP-aware notes", "Outreach readiness"],
  },
] as const;

const evolutionStages = [
  {
    confidence: "0.28",
    id: "raw",
    note: "A raw account record is still mostly noise. It has a name, a website, and almost no operational confidence.",
    route: "Unclear",
    stage: "Raw company",
    tags: ["Website only", "Unknown owner", "Generic route"],
  },
  {
    confidence: "0.49",
    id: "enriched",
    note: "Research adds service fit, market context, and signals that explain why the account may be commercially relevant now.",
    route: "Partial",
    stage: "Enriched context",
    tags: ["Service fit", "Geo match", "Recent movement"],
  },
  {
    confidence: "0.74",
    id: "validated",
    note: "Founder intelligence and routing discipline raise the floor, making the opportunity safer and more believable before release.",
    route: "Improving",
    stage: "Validated opportunity",
    tags: ["Founder signal", "SMTP-aware", "Recommendation lift"],
  },
  {
    confidence: "0.92",
    id: "released",
    note: "Now it behaves like premium outbound intelligence: scarce, ranked, reviewed, and ready for a weekly cohort release.",
    route: "Release ready",
    stage: "Weekly cohort asset",
    tags: ["Reviewed shortlist", "Priority notes", "Delivery-ready"],
  },
] as const;

const mondayMoments = [
  {
    body: "Cohorts are finalized against the live brief so the release reflects fit, confidence, and route quality rather than raw volume.",
    label: "Reviewed opportunities locked",
    time: "08:30",
  },
  {
    body: "SMTP-aware export packaging, routing notes, and founder context are assembled before the handoff leaves operations.",
    label: "SMTP-safe delivery packaging",
    time: "10:15",
  },
  {
    body: "Premium recommendations are released with structure, ordering, and context that makes outreach execution calmer and sharper.",
    label: "Outreach-ready cohort released",
    time: "13:00",
  },
] as const;

const trustSignals = [
  {
    body: "Every weekly release is reviewed. The system is built to reduce chaos, not disguise it.",
    icon: ShieldCheck,
    title: "Reviewed weekly",
  },
  {
    body: "Routing quality is evaluated before the cohort is released, so delivery discipline is part of the product itself.",
    icon: MailCheck,
    title: "SMTP-aware prioritization",
  },
  {
    body: "Founder-aware targeting raises relevance by bringing clearer decision-maker confidence into the final queue.",
    icon: Users,
    title: "Founder intelligence",
  },
  {
    body: "Delivery QA, confidence notes, and release rhythm make the operation feel premium and believable.",
    icon: Layers3,
    title: "Operational QA",
  },
] as const;

const deliveryTimeline = [
  {
    copy: "Cohort finalized and ranked against the active outbound brief.",
    day: "Monday",
    icon: CalendarDays,
  },
  {
    copy: "Draft refinement and account notes are shaped around the strongest opportunities.",
    day: "Tuesday",
    icon: Sparkles,
  },
  {
    copy: "Exports, routing context, and release notes are prepared for delivery.",
    day: "Wednesday",
    icon: Send,
  },
  {
    copy: "QA verifies confidence, fit, and delivery readiness before the next cycle.",
    day: "Thursday",
    icon: CheckCircle2,
  },
  {
    copy: "Outcome signals feed back into the following week’s intelligence decisions.",
    day: "Friday",
    icon: Radar,
  },
] as const;

const coverageOptions = [
  {
    description: "Focused market coverage with tighter signal density.",
    id: "uk",
    label: "UK",
  },
  {
    description: "Balanced UK + EU coverage for broader weekly cohorts.",
    id: "uk-eu",
    label: "UK + EU",
  },
  {
    description: "Expanded transatlantic coverage for larger outbound programs.",
    id: "global",
    label: "UK + EU + US",
  },
] as const;

const supportOptions = [
  {
    description: "Reviewed intelligence with ranking logic, founder notes, and release context.",
    id: "core",
    label: "Core intelligence",
  },
  {
    description: "Adds curated draft refinement so the handoff lands closer to execution.",
    id: "drafts",
    label: "Draft support",
  },
  {
    description: "Higher-touch weekly coordination around delivery and outbound use.",
    id: "delivery",
    label: "Delivery support",
  },
] as const;

const cadenceOptions = [
  {
    description: "A reviewed release every Monday for the strongest operating rhythm.",
    id: "weekly",
    label: "Weekly",
  },
  {
    description: "A lighter program for teams that want more space between releases.",
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
    transition: { delay, duration: 0.75, ease: "easeOut" as const },
    viewport: { amount: 0.18, once: true },
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
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e] backdrop-blur-xl">
        {eyebrow}
      </div>
      <h2
        className={cn(
          `${displayFont.className} text-4xl leading-[0.92] text-[#fff7f1] sm:text-5xl lg:text-6xl`,
          align === "center" ? "mx-auto max-w-4xl" : "max-w-4xl",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "max-w-2xl text-base leading-8 text-white/66 md:text-[1.03rem] md:leading-8",
          align === "center" && "mx-auto",
        )}
      >
        {copy}
      </p>
    </div>
  );
}

function ToggleCard({
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
          ? "border-[#f0b38e]/35 bg-[#f0b38e]/10 text-white shadow-[0_20px_40px_rgba(240,179,142,0.08)]"
          : "border-white/10 bg-white/[0.03] text-white/72 hover:border-white/20 hover:bg-white/[0.05]",
      )}
      onClick={onClick}
      type="button"
    >
      <div className="text-sm font-semibold text-white">{label}</div>
      <p className="mt-2 text-sm leading-7 text-white/60">{description}</p>
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
  onChange: (value: number) => void;
  step?: number;
  value: number;
  valueLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-white">{label}</span>
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-white/76">
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
  const [hasMounted, setHasMounted] = useState(false);
  const [activeEngineStep, setActiveEngineStep] = useState(0);
  const [activeEvolutionStage, setActiveEvolutionStage] = useState(0);
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

    const engineTimer = window.setInterval(() => {
      setActiveEngineStep((current) => (current + 1) % engineStages.length);
    }, 3400);

    return () => window.clearInterval(engineTimer);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }

    const evolutionTimer = window.setInterval(() => {
      setActiveEvolutionStage((current) => (current + 1) % evolutionStages.length);
    }, 3200);

    return () => window.clearInterval(evolutionTimer);
  }, [reduceMotion]);

  const activeStage = engineStages[activeEngineStep];
  const activeEvolution = evolutionStages[activeEvolutionStage];
  const enableReveal = hasMounted && !reduceMotion;

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
    <div className="relative overflow-hidden bg-[#050c14] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,179,142,0.18),transparent_26rem),radial-gradient(circle_at_72%_18%,rgba(98,130,164,0.16),transparent_30rem),linear-gradient(180deg,#050c14_0%,#07101a_42%,#050b13_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.022)_1px,transparent_1px)] bg-[size:88px_88px] opacity-[0.08]" />
      <div className="pointer-events-none absolute left-[-7rem] top-[12rem] h-72 w-72 rounded-full bg-[#f0b38e]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-9rem] top-[26rem] h-96 w-96 rounded-full bg-[#4a6580]/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-[26rem] hidden h-[calc(100%-34rem)] w-px -translate-x-1/2 bg-[linear-gradient(180deg,rgba(240,179,142,0),rgba(240,179,142,0.24),rgba(255,255,255,0.04),rgba(240,179,142,0))] lg:block" />

      <section className="relative overflow-hidden pb-10 pt-10 sm:pb-14 sm:pt-14 lg:pb-20 lg:pt-20">
        <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div className="space-y-8" {...revealProps(enableReveal, 0.04)}>
            <Badge className="w-fit border-white/10 bg-white/[0.05] text-[#f0b38e] shadow-[0_16px_38px_rgba(0,0,0,0.18)]" variant="outline">
              A living outbound intelligence system
            </Badge>

            <div className="space-y-6">
              <h1
                className={`${displayFont.className} max-w-[11ch] text-[3.15rem] leading-[0.88] text-[#fff8f1] sm:text-[4.7rem] lg:text-[6.15rem]`}
              >
                Curated Outbound Intelligence Delivered Weekly.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-white/70 md:text-[1.12rem] md:leading-9">
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
                className="border-white/12 bg-white/[0.06] text-white hover:border-white/24 hover:bg-white/[0.1] hover:text-white"
              >
                <Link href="#living-engine">Watch the Intelligence Flow</Link>
              </Button>
            </div>

          </motion.div>

          <motion.div
            className="relative min-h-[34rem] overflow-hidden rounded-[2.6rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_36px_120px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-8"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(240,179,142,0.24),transparent_16rem),radial-gradient(circle_at_72%_68%,rgba(97,146,186,0.14),transparent_20rem)]" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f0b38e]/8 blur-3xl" />

            <div className="relative flex h-full flex-col justify-between gap-6">
              <div className="flex items-start justify-between gap-5">
                <div className="max-w-xs">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e]">
                    Weekly release posture
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/62">
                    A smaller field, stronger conviction, and a calmer handoff every Monday.
                  </p>
                </div>

                <div className="rounded-full bg-white/[0.05] px-4 py-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e]">
                    Reviewed now
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">11 opportunities</div>
                </div>
              </div>

              <div className="relative mx-auto flex h-[17rem] w-full max-w-[30rem] items-center justify-center">
                <motion.div
                  className="absolute h-[16rem] w-[16rem] rounded-full bg-[radial-gradient(circle,rgba(240,179,142,0.16),transparent_64%)]"
                  animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { duration: 6, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
                  }
                />
                <motion.div
                  className="absolute h-[10rem] w-[10rem] rounded-full border border-white/8"
                  animate={reduceMotion ? undefined : { scale: [1, 1.04, 1] }}
                  transition={
                    reduceMotion
                      ? undefined
                      : { duration: 5.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
                  }
                />

                <div className="relative z-10 rounded-full bg-[#09131d]/90 px-10 py-9 text-center shadow-[0_26px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                    Confidence index
                  </div>
                  <div className="mt-3 text-5xl font-semibold text-[#fff7f1]">94</div>
                  <div className="mt-2 text-sm text-white/60">Prepared for weekly release</div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
                    One supporting signal
                  </div>
                  <div className="mt-2 text-xl font-semibold text-white">SMTP-safe routes preserved before handoff</div>
                </div>
                <div className="text-sm text-white/58">Founder confidence stays inside the release logic, not outside it.</div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="why-outbound-fails" className="relative py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <motion.div className="space-y-7" {...revealProps(enableReveal, 0.04)}>
            <SectionIntro
              eyebrow="Outbound failure narrative"
              title="Mass outbound creates activity. It rarely creates conviction."
              copy="Traditional outbound usually fails because it is optimized to keep the list moving. Frithly changes the logic by making quality, route safety, and review discipline part of the release itself."
            />

            <div className="space-y-5 text-base leading-8 text-white/64">
              <p>
                Mass outbound optimizes for volume, not targeting quality. That usually means more
                records, weaker route confidence, and more outreach pointed at accounts that were
                never especially likely to convert.
              </p>
              <p>
                Frithly is built to make the list smaller before it becomes expensive. Reviewed
                opportunity quality is the product.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-6"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(255,125,125,0.08)_0%,rgba(255,255,255,0.02)_100%)] p-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-rose-200">
                  <Filter className="h-4 w-4" aria-hidden="true" />
                  Traditional outbound
                </div>
                <p className="mt-5 text-base leading-8 text-white/66">
                  More accounts, weaker fit, rising bounce risk, and too little context for the
                  team to trust what lands in front of them.
                </p>
                <div className="mt-6 rounded-[1.2rem] bg-white/[0.04] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/46">
                    Outcome
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">Busy, but low-trust</div>
                  <p className="mt-2 text-sm leading-7 text-white/58">
                    The team spends more time fighting poor input quality than building better
                    conversations.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.6rem] bg-[linear-gradient(180deg,rgba(240,179,142,0.1)_0%,rgba(255,255,255,0.03)_100%)] p-6">
                <div className="flex items-center gap-3 text-sm font-semibold text-[#f0b38e]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Frithly intelligence
                </div>
                <p className="mt-5 text-base leading-8 text-white/68">
                  Reviewed opportunities, clearer founder relevance, safer routing, and a weekly
                  release that arrives with enough conviction to be useful immediately.
                </p>
                <div className="mt-6 rounded-[1.2rem] bg-white/[0.04] p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/46">
                    Outcome
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    Smaller list, stronger conviction
                  </div>
                  <p className="mt-2 text-sm leading-7 text-white/58">
                    Better opportunities outperform bigger lists because the system increases signal
                    quality before delivery.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 px-3 text-center text-sm leading-7 text-white/62">
              Better opportunities outperform bigger lists.
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="living-engine" className="relative py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <motion.div className="space-y-6" {...revealProps(enableReveal, 0.04)}>
            <SectionIntro
              eyebrow="Living intelligence engine"
              title="As the system moves, the opportunity field narrows and confidence rises."
              copy="This should feel like watching the system think. Each stage removes noise, clarifies fit, and strengthens the eventual weekly release."
            />

            <div className="relative space-y-2 pl-8">
              <div className="absolute bottom-2 left-3 top-2 w-px bg-white/10" />
              {engineStages.map((stage, index) => (
                <button
                  key={stage.id}
                  className={cn(
                    "relative w-full py-4 text-left transition-opacity",
                    activeEngineStep === index
                      ? "opacity-100"
                      : "opacity-62 hover:opacity-85",
                  )}
                  onClick={() => setActiveEngineStep(index)}
                  type="button"
                >
                  <span
                    className={cn(
                      "absolute left-[-1.55rem] top-6 h-3 w-3 rounded-full transition-colors",
                      activeEngineStep === index
                        ? "bg-[#f0b38e] shadow-[0_0_18px_rgba(240,179,142,0.5)]"
                        : "bg-white/18",
                    )}
                  />
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">{stage.label}</div>
                  <p className="mt-2 max-w-md text-sm leading-7 text-white/56">{stage.signal}</p>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-7"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="grid gap-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStage.id}
                  className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]"
                  initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -18 }}
                  transition={reduceMotion ? undefined : { duration: 0.34, ease: "easeOut" }}
                >
                  <div className="space-y-5">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e]">
                        {activeStage.signal}
                      </div>
                      <h3 className="mt-3 text-3xl font-semibold text-white">
                        {activeStage.title}
                      </h3>
                      <p className="mt-4 text-base leading-8 text-white/66">{activeStage.body}</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[1.35rem] bg-[#09131c]/82 px-5 py-5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                          Accounts in play
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-white">
                          {activeStage.incoming}
                        </div>
                      </div>
                      <div className="rounded-[1.35rem] bg-[#09131c]/82 px-5 py-5">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                          Confidence
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-white">
                          {activeStage.confidence}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm leading-7 text-white/62">
                      {activeStage.traits.map((trait) => (
                        <div key={trait}>{trait}</div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 rounded-[1.8rem] bg-[#07111a]/82 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e]">
                          Selective compression
                        </div>
                        <div className="mt-2 text-lg font-semibold text-white">
                          Better evidence keeps the queue small.
                        </div>
                      </div>
                      <div className="rounded-full bg-white/[0.05] px-3 py-1.5 text-sm text-white/68">
                        Stage {activeEngineStep + 1} / {engineStages.length}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm text-white/64">
                          <span>Candidate field</span>
                          <span>{activeStage.incoming}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/8">
                          <motion.div
                            className="h-2 rounded-full bg-[#90b6d9]"
                            animate={{ width: `${Math.max((activeStage.incoming / 268) * 100, 20)}%` }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm text-white/64">
                          <span>Still worth review</span>
                          <span>{activeStage.narrowed}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/8">
                          <motion.div
                            className="h-2 rounded-full bg-[#f0b38e]"
                            animate={{ width: `${Math.max((activeStage.narrowed / 184) * 100, 12)}%` }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm text-white/64">
                          <span>Release confidence</span>
                          <span>{activeStage.confidence}/100</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/8">
                          <motion.div
                            className="h-2 rounded-full bg-gradient-to-r from-[#f0b38e] to-[#fff4e2]"
                            animate={{ width: `${activeStage.confidence}%` }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-1">
                      <div className="text-sm font-semibold text-white">What changes here</div>
                      <p className="mt-3 text-sm leading-7 text-white/62">
                        The system is allowed to remove accounts as soon as the evidence becomes
                        clear enough. That is why the release feels selective instead of inflated.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="opportunity-evolution" className="relative py-20 sm:py-24 lg:py-28">
        <Container className="space-y-10">
          <motion.div {...revealProps(enableReveal, 0.04)}>
            <SectionIntro
              align="center"
              eyebrow="Opportunity evolution"
              title="Signal becomes intelligence through a visible sequence of refinement."
              copy="What Frithly delivers looks different because the opportunity itself changes shape as it moves through research, routing, founder context, and review."
            />
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-7"
            {...revealProps(enableReveal, 0.1)}
          >
            <div className="flex flex-wrap gap-3">
              {evolutionStages.map((stage, index) => (
                <button
                  key={stage.id}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    activeEvolutionStage === index
                      ? "border-[#f0b38e]/30 bg-[#f0b38e]/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/54 hover:border-white/18 hover:text-white/74",
                  )}
                  onClick={() => setActiveEvolutionStage(index)}
                  type="button"
                >
                  {stage.stage}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeEvolution.id}
                className="mt-6 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]"
                initial={reduceMotion ? undefined : { opacity: 0, y: 18 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -18 }}
                transition={reduceMotion ? undefined : { duration: 0.34, ease: "easeOut" }}
              >
                <div className="rounded-[1.7rem] border border-white/10 bg-[#07111a]/86 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e]">
                        {activeEvolution.stage}
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">Confidence {activeEvolution.confidence}</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/66">
                      Route: {activeEvolution.route}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/44">
                        Opportunity card
                      </div>
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between rounded-[1rem] border border-white/8 bg-[#0a131d]/90 px-4 py-3">
                          <div>
                            <div className="text-sm font-semibold text-white">Selected account</div>
                            <div className="mt-1 text-sm text-white/58">Outbound operations studio</div>
                          </div>
                          <div className="rounded-full bg-[#f0b38e]/12 px-3 py-1 text-sm text-[#f0b38e]">
                            {activeEvolution.route}
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {activeEvolution.tags.map((tag) => (
                            <div
                              key={tag}
                              className="rounded-[1rem] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white/66"
                            >
                              {tag}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/44">
                        Why it matters
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/66">{activeEvolution.note}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-sm font-semibold text-white">Pipeline transformation</div>
                    <div className="mt-4 space-y-4">
                      {[
                        { label: "Raw field", value: 100, tone: "bg-white/18" },
                        { label: "Enriched", value: 62, tone: "bg-[#90b6d9]" },
                        { label: "Validated", value: 31, tone: "bg-[#f0b38e]/85" },
                        { label: "Release ready", value: 12, tone: "bg-[#fff4e2]" },
                      ].map((bar) => (
                        <div key={bar.label}>
                          <div className="mb-2 flex items-center justify-between text-sm text-white/62">
                            <span>{bar.label}</span>
                            <span>{bar.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/8">
                            <div className={cn("h-2 rounded-full", bar.tone)} style={{ width: `${bar.value}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(240,179,142,0.08)_0%,rgba(255,255,255,0.02)_100%)] p-5">
                    <div className="text-sm font-semibold text-white">The core idea</div>
                    <p className="mt-3 text-sm leading-7 text-white/64">
                      Frithly opportunities are different because the pipeline is not trying to keep
                      everything. It is designed to let better evidence eliminate weaker accounts.
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </Container>
      </section>

      <section id="weekly-delivery" className="relative py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
          <motion.div className="space-y-6" {...revealProps(enableReveal, 0.04)}>
            <SectionIntro
              eyebrow="Weekly delivery system"
              title="Frithly is not instant SaaS automation. It is a premium weekly outbound operation."
              copy="The rhythm matters. Every Monday the reviewed cohort is finalized, routing context is packaged, and the release goes out as a calm operational handoff instead of a dump of unfinished data."
            />
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e]">
                Weekly rhythm
              </div>
              <div className="mt-3 text-2xl font-semibold text-white">Every Monday</div>
              <p className="mt-3 text-sm leading-7 text-white/64">
                Reviewed opportunities delivered, SMTP-safe exports prepared, founder context
                attached, and premium recommendations released.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-7"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="grid gap-4">
              {mondayMoments.map((moment) => (
                <div
                  key={moment.label}
                  className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-[#07111a]/86 p-5 sm:grid-cols-[auto_1fr]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-[#f0b38e]/20 bg-[#f0b38e]/10 text-center text-sm font-semibold text-[#f0b38e]">
                    {moment.time}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{moment.label}</div>
                    <p className="mt-2 text-sm leading-7 text-white/62">{moment.body}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3 text-sm font-semibold text-white">
                  <CalendarDays className="h-4 w-4 text-[#f0b38e]" aria-hidden="true" />
                  Operationally disciplined by design
                </div>
                <p className="mt-3 text-sm leading-7 text-white/64">
                  The weekly cadence keeps the service high-touch, selective, and easier to trust.
                  Frithly is positioned as an operating rhythm, not a button that sprays outreach.
                </p>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="icp-demo" className="relative py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <motion.div className="space-y-6" {...revealProps(enableReveal, 0.04)}>
            <SectionIntro
              eyebrow="Interactive ICP intelligence demo"
              title="Preview the thinking before you ever start a program."
              copy="Use the demo to shape industry, geography, and opportunity goals. Then watch how the intelligence layer responds with recommendation logic, founder confidence, and cohort emergence."
            />

            <div className="space-y-3">
              {[
                "Opportunity generation appears instead of a static form result.",
                "Recommendation confidence evolves as the brief sharpens.",
                "Founder and SMTP-safe signals surface before the cohort looks complete.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/66"
                >
                  {item}
                </div>
              ))}
            </div>

            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-fit border-white/12 bg-white/[0.06] text-white hover:border-white/24 hover:bg-white/[0.1] hover:text-white"
            >
              <Link href={ROUTES.DEMO}>Launch Full Demo</Link>
            </Button>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="rounded-[1.6rem] border border-white/10 bg-[#f8f4ec] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <IcpDemoExperience />
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="program-builder" className="relative py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <motion.div className="space-y-6" {...revealProps(enableReveal, 0.04)}>
            <SectionIntro
              eyebrow="Custom program builder"
              title="Frithly is configured like a program, not sold like software."
              copy="Start with Frithly Core Intelligence Program from EUR 499/month, then shape the delivery around volume, geography, targeting depth, founder priority, SMTP-safe prioritization, support, and cadence."
            />

            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl sm:p-6">
              <div className="space-y-5">
                <SliderControl
                  label="Weekly opportunity target"
                  max={90}
                  min={18}
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
                      <ToggleCard
                        key={option.id}
                        active={coverage === option.id}
                        description={option.description}
                        label={option.label}
                        onClick={() => setCoverage(option.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-7"
            {...revealProps(enableReveal, 0.12)}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e]">
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
                <ToggleCard
                  active={founderPriority}
                  description="Increase founder intelligence depth so decision-maker clarity influences the final queue more heavily."
                  label="Founder-priority targeting"
                  onClick={() => setFounderPriority((current) => !current)}
                />
                <ToggleCard
                  active={smtpPriority}
                  description="Keep SMTP-aware prioritization higher inside the release workflow for a safer delivery posture."
                  label="SMTP-aware prioritization"
                  onClick={() => setSmtpPriority((current) => !current)}
                />
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-white">Support level</div>
                <div className="grid gap-3">
                  {supportOptions.map((option) => (
                    <ToggleCard
                      key={option.id}
                      active={support === option.id}
                      description={option.description}
                      label={option.label}
                      onClick={() => setSupport(option.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-white">Delivery cadence</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {cadenceOptions.map((option) => (
                    <ToggleCard
                      key={option.id}
                      active={cadence === option.id}
                      description={option.description}
                      label={option.label}
                      onClick={() => setCadence(option.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-[#07111a]/86 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Globe2 className="h-4 w-4 text-[#f0b38e]" aria-hidden="true" />
                  Live program preview
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    `${programPreview.monthlyReviewed} reviewed opportunities/month`,
                    `${programPreview.coverageLabel} coverage`,
                    programPreview.targetingLabel,
                    programPreview.supportLabel,
                    founderPriority ? "Founder-priority targeting" : "Balanced targeting",
                    cadence === "weekly" ? "Weekly intelligence cohorts" : "Bi-weekly releases",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1rem] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white/74"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm leading-7 text-white/60">
                This is intentionally framed as program design, not cheap calculator logic. The
                final range depends on ICP complexity, review depth, coverage, and how much
                operational support you want in the weekly cycle.
              </p>
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="roi-intelligence" className="relative py-20 sm:py-24 lg:py-28">
        <Container className="space-y-10">
          <motion.div {...revealProps(enableReveal, 0.04)}>
            <SectionIntro
              align="center"
              eyebrow="ROI intelligence experience"
              title="Outbound inefficiency is expensive. Better targeting protects time, pipeline, and deliverability."
              copy="This should feel like a commercial consequence, not a spreadsheet. The goal is to show where weak targeting wastes outreach before the team ever sees the damage."
            />
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-2">
            <motion.div
              className="rounded-[1.85rem] bg-[linear-gradient(180deg,rgba(255,125,125,0.08)_0%,rgba(255,255,255,0.02)_100%)] p-6"
              {...revealProps(enableReveal, 0.08)}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-200">
                Traditional outbound
              </div>
              <div className="mt-4 space-y-4">
                {[
                  "Too many accounts that should never have made it into the queue.",
                  "Too much rep time spent on low-conviction outreach.",
                  "Too much deliverability risk before campaigns scale.",
                ].map(
                  (item, index) => (
                    <div key={item} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-300/10 text-sm font-semibold text-rose-200">
                        {index + 1}
                      </div>
                      <div className="rounded-[1rem] bg-[#0a131d]/82 px-4 py-3 text-sm text-white/70">
                        {item}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </motion.div>

            <motion.div
              className="rounded-[1.85rem] bg-[linear-gradient(180deg,rgba(240,179,142,0.1)_0%,rgba(255,255,255,0.03)_100%)] p-6"
              {...revealProps(enableReveal, 0.12)}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e]">
                Frithly
              </div>
              <div className="mt-4 space-y-4">
                {[
                  "Reduce wasted outreach before campaigns scale.",
                  "Focus reps on accounts more likely to convert.",
                  "Protect deliverability before volume becomes expensive.",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0b38e]/12 text-sm font-semibold text-[#f0b38e]">
                      {index + 1}
                    </div>
                    <div className="rounded-[1rem] bg-[#0a131d]/82 px-4 py-3 text-sm text-white/72">
                      {item}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="rounded-[1.6rem] bg-white/[0.03] px-5 py-5 text-center text-sm leading-7 text-white/66"
            {...revealProps(enableReveal, 0.14)}
          >
            With better targeting, you could generate better meetings without increasing outreach
            volume.
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
            {...revealProps(enableReveal, 0.16)}
          >
            <div className="rounded-[1.6rem] border border-white/10 bg-[#f8f4ec] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <RoiCalculatorExperience />
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="trust-layer" className="relative py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
          <motion.div className="space-y-6" {...revealProps(enableReveal, 0.04)}>
            <SectionIntro
              eyebrow="Operational trust layer"
              title="Trust should come from operational depth, not startup vanity."
              copy="Reviewed opportunities, SMTP-aware prioritization, founder intelligence, release QA, and weekly review cycles are what make Frithly feel premium and believable."
            />

            <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e]">
                Delivery QA snapshot
              </div>
              <div className="mt-4 space-y-3">
                {[
                  "Recommendation reasoning attached",
                  "Founder context present where confidence is strong",
                  "SMTP-aware route notes prepared before handoff",
                ].map((item) => (
                  <div key={item} className="flex gap-3 rounded-[1rem] border border-white/8 bg-[#07111a]/84 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#f0b38e]" aria-hidden="true" />
                    <p className="text-sm leading-7 text-white/64">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {trustSignals.map((signal, index) => {
              const Icon = signal.icon;

              return (
                <motion.div
                  key={signal.title}
                  className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
                  {...revealProps(enableReveal, 0.08 + index * 0.04)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#f0b38e]/12 text-[#f0b38e]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{signal.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">{signal.body}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="delivery-timeline" className="relative py-20 sm:py-24 lg:py-28">
        <Container className="space-y-10">
          <motion.div {...revealProps(enableReveal, 0.04)}>
            <SectionIntro
              align="center"
              eyebrow="Intelligence delivery timeline"
              title="The customer experience is a premium weekly operating rhythm."
              copy="Monday finalization, Tuesday refinement, Wednesday export preparation, Thursday QA review, and Friday optimization reinforce the service structure behind every delivery."
            />
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-5">
            {deliveryTimeline.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.day}
                  className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
                  {...revealProps(enableReveal, 0.08 + index * 0.04)}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#f0b38e]/12 text-[#f0b38e]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="mt-5 text-lg font-semibold text-white">{item.day}</div>
                  <p className="mt-3 text-sm leading-7 text-white/64">{item.copy}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="faq" className="relative py-20 sm:py-24 lg:py-28">
        <Container className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <motion.div className="space-y-6" {...revealProps(enableReveal, 0.04)}>
            <SectionIntro
              eyebrow="FAQ"
              title="The calm explanation behind the intelligence system."
              copy="These answers are here to clarify how Frithly differs from lead-generation tools, why weekly delivery matters, and why reviewed quality wins over scraped volume."
            />
          </motion.div>

          <motion.div
            className="overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-5 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl sm:px-6"
            {...revealProps(enableReveal, 0.1)}
          >
            <Accordion type="single" collapsible>
              {platformFaqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`faq-${index}`}
                  className="border-white/10"
                >
                  <AccordionTrigger className="text-white hover:text-[#f0b38e] data-[state=open]:text-[#f0b38e]">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/64">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </Container>
      </section>

      <section className="relative pb-16 pt-6 sm:pb-20 lg:pb-24">
        <Container>
          <motion.div
            className="relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,17,26,0.98)_0%,rgba(6,11,18,0.98)_100%)] px-6 py-10 shadow-[0_34px_110px_rgba(0,0,0,0.35)] sm:px-8 sm:py-12 lg:px-12 lg:py-16"
            {...revealProps(enableReveal, 0.04)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,179,142,0.22),transparent_28rem),radial-gradient(circle_at_bottom_right,rgba(97,146,186,0.12),transparent_24rem)]" />
            <div className="pointer-events-none absolute right-[-4rem] top-[-2rem] h-56 w-56 rounded-full bg-[#f0b38e]/15 blur-3xl" />
            <div className="pointer-events-none absolute left-[10%] top-[18%] h-40 w-40 rounded-full bg-white/6 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0b38e]">
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
                  className="border-white/12 bg-white/[0.06] text-white hover:border-white/24 hover:bg-white/[0.1] hover:text-white"
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
