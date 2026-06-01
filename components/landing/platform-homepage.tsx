"use client";

import Link from "next/link";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { platformFaqs } from "@/components/landing/platform-homepage-data";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Lock,
  Play,
  Radar,
  ShieldAlert,
  Sparkles,
  Target,
  Users2,
  Workflow,
} from "lucide-react";

const headlineFont = Inter({
  subsets: ["latin"],
  variable: "--font-frithly-headline",
  weight: ["500", "600", "700", "800"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const socialLogos = ["HubSpot", "Salesforce", "Apollo", "Clay", "Outreach", "Smartlead"] as const;

const heroSignals = [
  {
    detail: "Hiring signals + CRM posture + market movement",
    label: "Signal scanning",
    status: "Live",
  },
  {
    detail: "Companies filtered before reps ever see them",
    label: "Commercial relevance",
    status: "Ranked",
  },
  {
    detail: "Unsafe routes suppressed before deployment",
    label: "Deliverability risk",
    status: "Protected",
  },
] as const;

const heroMetrics = [
  { label: "Signal sources", value: "214" },
  { label: "Validated domains", value: "87" },
  { label: "Risk suppressed", value: "12" },
] as const;

const problemCards = [
  {
    copy: "Static databases create outreach without timing relevance, so activity scales while opportunity quality stays flat.",
    icon: Radar,
    kicker: "01",
    title: "Low-Intent Acquisition",
  },
  {
    copy: "Most AI personalization only rewrites surface copy. It does not fix weak account selection or bad timing.",
    icon: Sparkles,
    kicker: "02",
    title: "Generic AI Personalization",
  },
  {
    copy: "SDRs lose hours cleaning data, validating context, and repairing poor inputs before real selling starts.",
    icon: Users2,
    kicker: "03",
    title: "SDR Inefficiency",
  },
  {
    copy: "Poor targeting increases bounce risk, damages deliverability, and quietly weakens the entire outbound stack.",
    icon: ShieldAlert,
    kicker: "04",
    title: "Infrastructure Damage",
  },
] as const;

const vslStats = [
  "Signal-Qualified Accounts",
  "Deliverability-Aware Targeting",
  "Human-Reviewed Intelligence",
] as const;

const flowSteps = [
  {
    id: "signal-sources",
    label: "Signal Sources",
    summary: "Hiring, GTM, web, and market movement are collected before qualification starts.",
  },
  {
    id: "entity-detection",
    label: "Commercial Entity Detection",
    summary: "The system separates real commercial entities from noise, publishers, jobs, and dead-end pages.",
  },
  {
    id: "domain-validation",
    label: "Domain Validation",
    summary: "Official domains and route quality are resolved before the company ever enters the brief.",
  },
  {
    id: "icp-classification",
    label: "ICP Classification",
    summary: "Company fit is scored against market, industry, size, and commercial motion requirements.",
  },
  {
    id: "signal-qualification",
    label: "Signal Qualification",
    summary: "Timing indicators are weighted so the brief reflects relevance, not just available contacts.",
  },
  {
    id: "decision-maker-mapping",
    label: "Decision-Maker Mapping",
    summary: "Frithly maps the right commercial persona before the first message angle gets written.",
  },
  {
    id: "deliverability-filtering",
    label: "Deliverability Filtering",
    summary: "Unsafe routes are suppressed so outreach volume does not quietly damage infrastructure health.",
  },
  {
    id: "outbound-deployment",
    label: "Outbound Deployment",
    summary: "Only the best-fit, best-timed accounts survive into the weekly release.",
  },
] as const;

const deliverabilityPain = [
  "Bounce risk enters the sequence too late.",
  "Low-confidence contacts make infrastructure unstable.",
  "Teams optimize copy while the route is already compromised.",
] as const;

const deliverabilityWins = [
  "Validation happens before the account is shipped.",
  "Risky routes are filtered before deployment.",
  "Protecting infrastructure becomes part of lead quality.",
] as const;

const mondayBriefRows = [
  {
    angle: "Pipeline quality during SDR expansion",
    company: "Northstar Systems",
    persona: "Head of Sales",
    score: 96,
    signal: "Hiring 3 outbound AEs + founder GTM activity",
    status: "Deploy now",
  },
  {
    angle: "Outbound relevance before new-market launch",
    company: "Atlas Infra AI",
    persona: "VP Revenue",
    score: 91,
    signal: "New pricing page + category repositioning",
    status: "High priority",
  },
  {
    angle: "Deliverability-safe expansion into enterprise motion",
    company: "SignalForge Cloud",
    persona: "Revenue Operations",
    score: 88,
    signal: "Lead routing refresh + fresh domain health",
    status: "Ready",
  },
] as const;

const audienceCards = [
  {
    copy: "Series A and B teams building a more selective outbound motion before headcount grows.",
    icon: Building2,
    title: "B2B SaaS",
  },
  {
    copy: "AI companies that need better commercial relevance as outbound gets more competitive.",
    icon: Cpu,
    title: "AI Startups",
  },
  {
    copy: "Security and enterprise software teams selling complex offers where weak targeting gets expensive fast.",
    icon: Lock,
    title: "Enterprise Software",
  },
  {
    copy: "High-ticket consulting and IT services firms where account quality changes close quality.",
    icon: BriefcaseBusiness,
    title: "IT Services",
  },
  {
    copy: "Outbound agencies that want stronger account quality without turning into list-cleaning operations.",
    icon: Workflow,
    title: "Agencies",
  },
  {
    copy: "RevOps, growth, and SDR leaders who need better inputs before sequence volume increases.",
    icon: Target,
    title: "GTM Teams",
  },
] as const;

const caseStudies = [
  {
    domain: "Cybersecurity SaaS",
    outcome: "Improved targeting precision and reduced outreach waste before SDR expansion.",
    reason: "The system elevated accounts with live GTM signals instead of static list volume.",
    signals: ["Outbound hiring expansion", "Founder GTM activity", "Fresh route validation"],
  },
  {
    domain: "AI workflow platform",
    outcome: "Smaller shortlist, stronger timing, cleaner commercial relevance for launch outreach.",
    reason: "Signal qualification and ICP scoring removed broad-fit noise before the first campaign.",
    signals: ["New pricing movement", "Expansion market pages", "Buyer-role visibility"],
  },
  {
    domain: "Enterprise IT services",
    outcome: "Higher-value targets surfaced before reps spent time on weak-fit accounts.",
    reason: "Decision-maker mapping and deliverability filtering protected the outbound stack early.",
    signals: ["Service expansion cues", "Contact-path validation", "Regional enterprise fit"],
  },
] as const;

const auditFieldMeta = [
  { label: "Company", name: "company", placeholder: "Northstar Systems" },
  { label: "Website", name: "website", placeholder: "northstarsystems.com" },
  { label: "Average Deal Size", name: "dealSize", placeholder: "$12,000 ACV" },
  { label: "Monthly Goals", name: "monthlyGoals", placeholder: "18 qualified meetings" },
] as const;

type AuditFormState = {
  biggestBottleneck: string;
  company: string;
  currentProcess: string;
  dealSize: string;
  geography: string;
  industry: string;
  monthlyGoals: string;
  website: string;
};

function revealProps(enableMotion: boolean, delay = 0) {
  if (!enableMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 24 },
    transition: { delay, duration: 0.72, ease: [0.22, 1, 0.36, 1] as const },
    viewport: { amount: 0.18, once: true },
    whileInView: { opacity: 1, y: 0 },
  };
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <div
      className={cn(
        monoFont.className,
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#97c4ff]",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#06b6d4]" />
      {children}
    </div>
  );
}

function SectionIntro({
  copy,
  eyebrow,
  title,
}: {
  copy: string;
  eyebrow: string;
  title: React.ReactNode;
}) {
  return (
    <div className="space-y-5">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <div className={cn(headlineFont.className, "max-w-4xl text-[2.55rem] font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-[3.2rem] lg:text-[4.05rem]")}>
        {title}
      </div>
      <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-[1.05rem]">
        {copy}
      </p>
    </div>
  );
}

export function PlatformHomepage() {
  const reduceMotion = useReducedMotion() ?? false;
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [auditForm, setAuditForm] = useState<AuditFormState>({
    biggestBottleneck: "",
    company: "",
    currentProcess: "",
    dealSize: "",
    geography: "",
    industry: "",
    monthlyGoals: "",
    website: "",
  });

  useEffect(() => {
    if (reduceMotion) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveStepIndex((current) => (current + 1) % flowSteps.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  function updateAuditField(key: keyof AuditFormState, value: string) {
    setAuditForm((current) => ({ ...current, [key]: value }));
  }

  function handleAuditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams();

    Object.entries(auditForm).forEach(([key, value]) => {
      const trimmed = value.trim();

      if (trimmed) {
        params.set(key, trimmed);
      }
    });

    window.location.assign(
      params.toString() ? `${ROUTES.APPLY}?${params.toString()}` : ROUTES.APPLY,
    );
  }

  const enableMotion = !reduceMotion;
  const activeStep = flowSteps[activeStepIndex];
  const progressWidth = `${((activeStepIndex + 1) / flowSteps.length) * 100}%`;

  return (
    <div className="relative overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(6,182,212,0.12),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(139,92,246,0.10),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.14]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(5,8,22,0.78),rgba(5,8,22,0))]" />

      <section className="relative pt-16 sm:pt-20 lg:min-h-[calc(100svh-4.5rem)]" id="top">
        <Container className="grid gap-12 py-10 sm:py-14 lg:min-h-[calc(100svh-5.5rem)] lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:py-16 xl:gap-16">
          <motion.div className="space-y-8" {...revealProps(enableMotion, 0.03)}>
            <SectionEyebrow>Signal-based outbound intelligence infrastructure</SectionEyebrow>

            <div className={cn(headlineFont.className, "max-w-[10ch] text-[3.15rem] font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-[4.2rem] lg:text-[5.15rem] xl:text-[5.7rem]")}>
              <span className="block text-white/96">Most Outbound Teams</span>
              <span className="block text-white/96">Scale Activity.</span>
              <span className="mt-4 block bg-[linear-gradient(135deg,#ffffff_0%,#97c4ff_46%,#06b6d4_100%)] bg-clip-text text-transparent">
                Frithly Scales
              </span>
              <span className="block bg-[linear-gradient(135deg,#ffffff_0%,#97c4ff_46%,#06b6d4_100%)] bg-clip-text text-transparent">
                Commercial Relevance.
              </span>
            </div>

            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Signal-driven outbound infrastructure designed to identify high-intent accounts,
              protect deliverability, and improve pipeline quality before campaigns even launch.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
                <Link href="/#engine">
                  <span className="inline-flex items-center gap-2">
                    See The Intelligence Layer
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="border-white/12 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                <Link href="/#vsl">
                  <span className="inline-flex items-center gap-2">
                    Watch System Breakdown
                    <Play className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {heroSignals.map((signal, index) => (
                <motion.div
                  className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
                  key={signal.label}
                  {...revealProps(enableMotion, 0.08 + index * 0.04)}
                >
                  <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.22em] text-[#97c4ff]")}>
                    {signal.label}
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-300">{signal.detail}</div>
                  <div className="mt-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                    {signal.status}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4 pt-2">
              <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.24em] text-slate-500")}>
                Systems already living in the outbound stack
              </div>
              <div className="flex flex-wrap gap-3">
                {socialLogos.map((logo) => (
                  <div
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70"
                    key={logo}
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div className="relative" {...revealProps(enableMotion, 0.12)}>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(8,12,24,0.96))] p-6 shadow-[0_40px_140px_rgba(0,0,0,0.34)] lg:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.12),transparent_24%)]" />
              <div className="relative flex items-start justify-between gap-6">
                <div>
                  <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.24em] text-[#97c4ff]")}>
                    Live Intelligence System
                  </div>
                  <div className="mt-3 max-w-sm text-2xl font-semibold leading-tight text-white">
                    A moving infrastructure layer instead of another list-building dashboard.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
                  <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.22em] text-slate-500")}>
                    Commercial relevance
                  </div>
                  <div className="mt-2 text-4xl font-semibold text-white">94</div>
                </div>
              </div>

              <div className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#070c18]/88 p-5 lg:p-6">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.18]" />
                <motion.div
                  animate={enableMotion ? { x: ["-10%", "110%"] } : undefined}
                  className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-[linear-gradient(90deg,rgba(59,130,246,0),rgba(59,130,246,0.28),rgba(59,130,246,0))] blur-xl"
                  transition={enableMotion ? { duration: 4.2, ease: "linear", repeat: Number.POSITIVE_INFINITY } : undefined}
                />

                <div className="relative grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-4">
                    {flowSteps.slice(0, 4).map((step, index) => (
                      <div
                        className={cn(
                          "rounded-[1.2rem] border px-4 py-4 transition-colors",
                          index === activeStepIndex
                            ? "border-cyan-300/30 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]"
                            : "border-white/10 bg-white/[0.03]",
                        )}
                        key={step.id}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.22em] text-[#97c4ff]")}>
                            {step.label}
                          </div>
                          <div className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.72)]" />
                        </div>
                        <div className="mt-3 text-sm leading-7 text-slate-300">{step.summary}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-5">
                      <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.22em] text-slate-500")}>
                        Active path
                      </div>
                      <div className="mt-3 text-2xl font-semibold text-white">{activeStep.label}</div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{activeStep.summary}</p>
                      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          animate={{ width: progressWidth }}
                          className="h-full rounded-full bg-[linear-gradient(90deg,#3b82f6,#06b6d4)]"
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {heroMetrics.map((metric) => (
                        <div
                          className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-4"
                          key={metric.label}
                        >
                          <div className={cn(monoFont.className, "text-[10px] uppercase tracking-[0.2em] text-slate-500")}>
                            {metric.label}
                          </div>
                          <div className="mt-3 text-2xl font-semibold text-white">{metric.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[1.25rem] border border-white/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(6,182,212,0.08))] p-5">
                      <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.22em] text-[#cbe9ff]")}>
                        Deployment posture
                      </div>
                      <div className="mt-3 text-lg font-medium text-white">
                        High-intent accounts survive. Unsafe routes do not.
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["ICP locked", "Decision-maker mapped", "Route checked", "Ready for outbound"].map((chip) => (
                          <span
                            className="rounded-full border border-white/10 bg-black/18 px-3 py-1 text-xs text-slate-200"
                            key={chip}
                          >
                            {chip}
                          </span>
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

      <section className="relative py-20 sm:py-24" id="problem">
        <div className="absolute -top-24" id="about" />
        <Container className="space-y-12">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="Teams do not usually lose pipeline because reps work too little. They lose it because the wrong accounts enter the sequence in the first place."
              eyebrow="Why traditional outbound quietly fails"
              title={
                <>
                  Better outbound starts with <span className="bg-[linear-gradient(135deg,#ffffff_0%,#97c4ff_56%,#06b6d4_100%)] bg-clip-text text-transparent">better accounts.</span>
                </>
              }
            />
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
            {problemCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.div
                  className="group relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_26px_80px_rgba(0,0,0,0.22)]"
                  key={card.title}
                  {...revealProps(enableMotion, 0.08 + index * 0.04)}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(59,130,246,0),rgba(59,130,246,0.85),rgba(59,130,246,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="flex items-center justify-between">
                    <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.22em] text-[#97c4ff]")}>
                      {card.kicker}
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/20 p-2 text-[#97c4ff]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="mt-6 text-[1.45rem] font-semibold leading-tight text-white">
                    {card.title}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{card.copy}</p>
                  <div className="mt-8 flex items-center gap-2">
                    <div className="h-1.5 w-10 rounded-full bg-[#3b82f6]" />
                    <div className="h-1.5 w-6 rounded-full bg-[#06b6d4]/80" />
                    <div className="h-1.5 flex-1 rounded-full bg-white/10" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="relative py-20 sm:py-24" id="vsl">
        <Container className="space-y-12">
          <motion.div className="mx-auto max-w-3xl text-center" {...revealProps(enableMotion, 0.04)}>
            <SectionEyebrow>System breakdown</SectionEyebrow>
            <div className={cn(headlineFont.className, "mt-5 text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.04em] text-white sm:text-[3.6rem] lg:text-[4.4rem]")}>
              Why Better Inputs Create Better Conversations
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,12,24,0.98))] p-5 shadow-[0_40px_140px_rgba(0,0,0,0.32)] sm:p-7 lg:p-8"
            {...revealProps(enableMotion, 0.08)}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]" />
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#050816]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:54px_54px] opacity-[0.18]" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_28%)]" />
              <motion.div
                animate={enableMotion ? { opacity: [0.2, 0.55, 0.2], scale: [1, 1.03, 1] } : undefined}
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent_32%)]"
                transition={enableMotion ? { duration: 4, repeat: Number.POSITIVE_INFINITY } : undefined}
              />

              <div className="relative flex h-full flex-col justify-between p-6 sm:p-8 lg:p-10">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.24em] text-[#97c4ff]")}>
                      Private system walkthrough
                    </div>
                    <div className="mt-4 max-w-lg text-3xl font-semibold leading-tight text-white lg:text-4xl">
                      A cinematic breakdown of how Frithly filters noise before your reps ever touch the market.
                    </div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
                    07:42 runtime
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
                  <div className="rounded-full border border-white/12 bg-white/[0.06] p-6 shadow-[0_0_60px_rgba(59,130,246,0.24)]">
                    <Play className="h-8 w-8 fill-current text-white" aria-hidden="true" />
                  </div>
                  <div className="max-w-xl text-base leading-8 text-slate-300">
                    Replace this cinematic shell with a Wistia, Vimeo Pro, or Bunny Stream VSL when
                    the private breakdown is ready for launch.
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {vslStats.map((stat) => (
                    <div
                      className="rounded-[1.2rem] border border-white/10 bg-black/18 px-4 py-4 text-sm font-medium text-slate-200"
                      key={stat}
                    >
                      {stat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-20 sm:py-24" id="engine">
        <div className="absolute -top-24" id="architecture" />
        <Container className="space-y-14">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="This is where Frithly stops looking like lead generation and starts looking like infrastructure. Wide collection, commercial filtering, signal qualification, route protection, and release control all happen before the brief is deployed."
              eyebrow="Inside the Frithly intelligence layer"
              title={
                <>
                  Infrastructure that scores, filters, and protects <span className="bg-[linear-gradient(135deg,#ffffff_0%,#97c4ff_56%,#06b6d4_100%)] bg-clip-text text-transparent">before outbound deploys.</span>
                </>
              }
            />
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_36px_120px_rgba(0,0,0,0.28)] lg:p-8"
            {...revealProps(enableMotion, 0.08)}
          >
            <div className="pointer-events-none absolute left-8 right-8 top-[72px] hidden h-px bg-white/10 lg:block" />
            <motion.div
              animate={{ width: progressWidth }}
              className="pointer-events-none absolute left-8 top-[72px] hidden h-px bg-[linear-gradient(90deg,#3b82f6,#06b6d4)] lg:block"
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />

            <div className="grid gap-4 lg:grid-cols-4">
              {flowSteps.map((step, index) => (
                <motion.div
                  className={cn(
                    "relative rounded-[1.35rem] border p-5 transition-colors",
                    index === activeStepIndex
                      ? "border-cyan-300/24 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(103,232,249,0.06)]"
                      : "border-white/10 bg-black/16",
                  )}
                  key={step.id}
                  {...revealProps(enableMotion, 0.1 + index * 0.03)}
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.22em] text-[#97c4ff]")}>
                      0{index + 1}
                    </div>
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        index <= activeStepIndex ? "bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.7)]" : "bg-white/16",
                      )}
                    />
                  </div>
                  <div className="text-lg font-semibold text-white">{step.label}</div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{step.summary}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/18 p-5 lg:p-6">
              <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.22em] text-[#97c4ff]")}>
                Active step
              </div>
              <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-2xl font-semibold text-white">{activeStep.label}</div>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{activeStep.summary}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                  Commercial relevance improving
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-20 sm:py-24" id="deliverability">
        <Container className="space-y-12">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="Frithly treats deliverability as part of acquisition quality. Better route safety starts before a single message touches the market."
              eyebrow="Deliverability infrastructure"
              title={
                <>
                  Better Deliverability Starts <span className="bg-[linear-gradient(135deg,#ffffff_0%,#97c4ff_56%,#06b6d4_100%)] bg-clip-text text-transparent">Before The First Email.</span>
                </>
              }
            />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              className="overflow-hidden rounded-[1.9rem] border border-rose-400/16 bg-[linear-gradient(180deg,rgba(127,29,29,0.22),rgba(15,23,42,0.92))] p-6 shadow-[0_30px_110px_rgba(0,0,0,0.26)]"
              {...revealProps(enableMotion, 0.08)}
            >
              <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.24em] text-rose-200/80")}>
                Traditional outbound
              </div>
              <div className="mt-4 text-3xl font-semibold text-white">Reactive and chaotic.</div>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Validation happens late. Bounce risk accumulates quietly. Outreach infrastructure
                gets damaged while the team still thinks the real problem is copy.
              </p>
              <div className="mt-8 space-y-4">
                {deliverabilityPain.map((line) => (
                  <div className="flex items-start gap-3 text-sm leading-7 text-slate-300" key={line}>
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-rose-300" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                {[72, 46, 81].map((value, index) => (
                  <div className="space-y-2" key={value}>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-rose-100/60">
                      <span>{index === 0 ? "Bounce exposure" : index === 1 ? "Reply decay" : "Route instability"}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#fb7185,#ef4444)]" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="overflow-hidden rounded-[1.9rem] border border-cyan-300/16 bg-[linear-gradient(180deg,rgba(30,64,175,0.18),rgba(15,23,42,0.92))] p-6 shadow-[0_30px_110px_rgba(0,0,0,0.26)]"
              {...revealProps(enableMotion, 0.12)}
            >
              <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.24em] text-cyan-200")}>
                Frithly infrastructure
              </div>
              <div className="mt-4 text-3xl font-semibold text-white">Stable and defensive.</div>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Risk suppression happens before deployment. Validation becomes part of targeting.
                Infrastructure health is protected while reply quality improves.
              </p>
              <div className="mt-8 space-y-4">
                {deliverabilityWins.map((line) => (
                  <div className="flex items-start gap-3 text-sm leading-7 text-slate-300" key={line}>
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                {[18, 74, 91].map((value, index) => (
                  <div className="space-y-2" key={value}>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-cyan-100/70">
                      <span>{index === 0 ? "Bounce exposure" : index === 1 ? "Route safety" : "Infrastructure health"}</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,#3b82f6,#06b6d4)]" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="relative py-20 sm:py-24" id="brief">
        <Container className="space-y-12">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="Frithly does not ship raw CSVs. It ships a reviewed intelligence brief with signal context, account quality, route status, and the reason each opportunity belongs in the queue."
              eyebrow="The Monday brief"
              title={
                <>
                  Every Week Starts With A <span className="bg-[linear-gradient(135deg,#ffffff_0%,#97c4ff_56%,#06b6d4_100%)] bg-clip-text text-transparent">Higher-Quality Pipeline.</span>
                </>
              }
            />
          </motion.div>

          <motion.div
            className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
            {...revealProps(enableMotion, 0.08)}
          >
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(8,12,24,0.98))] p-6 shadow-[0_36px_120px_rgba(0,0,0,0.28)] lg:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.22em] text-[#97c4ff]")}>
                    Monday release
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-white">Private intelligence briefing</div>
                </div>
                <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
                  Release ready
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {mondayBriefRows.map((row) => (
                  <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-5" key={row.company}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="text-2xl font-semibold text-white">{row.company}</div>
                        <p className="text-sm leading-7 text-slate-300">{row.signal}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-200">
                            {row.persona}
                          </span>
                          <span className="rounded-full border border-cyan-300/16 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                            {row.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.18em] text-slate-500")}>
                          ICP score
                        </div>
                        <div className="mt-2 text-5xl font-semibold text-white">{row.score}</div>
                      </div>
                    </div>
                    <div className="mt-5 rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                      <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.18em] text-slate-500")}>
                        Recommended outreach angle
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{row.angle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {[
                {
                  copy: "Signal detected, decision-maker mapped, route checked, and message angle already framed.",
                  title: "What the team receives",
                },
                {
                  copy: "A smaller release, but one that starts closer to commercial relevance than a raw list ever could.",
                  title: "What changes operationally",
                },
                {
                  copy: "The brief feels like private intelligence, not spreadsheet cleanup disguised as prospecting.",
                  title: "What the brief should feel like",
                },
              ].map((item) => (
                <motion.div
                  className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
                  key={item.title}
                  {...revealProps(enableMotion, 0.12)}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-full border border-white/10 bg-black/18 p-3 text-[#97c4ff]">
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-white">{item.title}</div>
                      <p className="mt-3 text-sm leading-7 text-slate-300">{item.copy}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="relative py-20 sm:py-24" id="fit">
        <Container className="space-y-12">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="Frithly is built for teams where targeting precision, route safety, and pipeline relevance matter more than raw list volume."
              eyebrow="Who this is for"
              title={
                <>
                  Built for outbound teams that need <span className="bg-[linear-gradient(135deg,#ffffff_0%,#97c4ff_56%,#06b6d4_100%)] bg-clip-text text-transparent">infrastructure, not another tool.</span>
                </>
              }
            />
          </motion.div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {audienceCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.div
                  className="group rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-cyan-300/18"
                  key={card.title}
                  {...revealProps(enableMotion, 0.08 + index * 0.03)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="rounded-full border border-white/10 bg-black/18 p-3 text-[#97c4ff]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/30 transition-colors group-hover:text-cyan-200" aria-hidden="true" />
                  </div>
                  <div className="mt-6 text-2xl font-semibold text-white">{card.title}</div>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{card.copy}</p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="relative py-20 sm:py-24" id="evidence">
        <Container className="space-y-12">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="No padded testimonials. No fake ROI. Just operational examples that show how Frithly improves acquisition quality before campaigns launch."
              eyebrow="Operational examples"
              title={
                <>
                  Process proof that makes the intelligence <span className="bg-[linear-gradient(135deg,#ffffff_0%,#97c4ff_56%,#06b6d4_100%)] bg-clip-text text-transparent">feel inspectable.</span>
                </>
              }
            />
          </motion.div>

          <div className="grid gap-6 xl:grid-cols-3">
            {caseStudies.map((study, index) => (
              <motion.div
                className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(8,12,24,0.98))] p-6 shadow-[0_30px_110px_rgba(0,0,0,0.24)]"
                key={study.domain}
                {...revealProps(enableMotion, 0.08 + index * 0.04)}
              >
                <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.24em] text-[#97c4ff]")}>
                  {study.domain}
                </div>
                <div className="mt-4 text-2xl font-semibold text-white">Detected</div>
                <div className="mt-4 space-y-3">
                  {study.signals.map((signal) => (
                    <div className="flex items-start gap-3 text-sm leading-7 text-slate-300" key={signal}>
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      <span>{signal}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.18em] text-slate-500")}>
                    Result
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-200">{study.outcome}</p>
                </div>
                <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-black/18 p-4">
                  <div className={cn(monoFont.className, "text-[11px] uppercase tracking-[0.18em] text-slate-500")}>
                    Why this mattered
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{study.reason}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative py-20 sm:py-24" id="builder">
        <div className="absolute -top-24" id="application" />
        <Container className="space-y-12">
          <motion.div
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(8,12,24,0.98))] p-8 text-center shadow-[0_36px_120px_rgba(0,0,0,0.28)] lg:p-12"
            {...revealProps(enableMotion, 0.04)}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-40 max-w-xl rounded-full bg-[rgba(59,130,246,0.18)] blur-3xl" />
            <div className="relative">
              <SectionEyebrow>Final CTA</SectionEyebrow>
              <div className={cn(headlineFont.className, "mx-auto mt-6 max-w-4xl text-[2.8rem] font-semibold leading-[0.96] tracking-[-0.04em] text-white sm:text-[3.6rem] lg:text-[4.3rem]")}>
                Better Outbound Starts With Better Inputs
              </div>
              <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300">
                If your outbound still depends on static databases and low-intent targeting,
                Frithly was built to redesign the acquisition layer.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
                  <Link href={ROUTES.APPLY}>
                    <span className="inline-flex items-center gap-2">
                      Apply For Outbound Intelligence Audit
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="border-white/12 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  <Link href={ROUTES.BOOK_MEETING}>Book a meeting</Link>
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start"
            {...revealProps(enableMotion, 0.08)}
          >
            <div className="space-y-6">
              <SectionIntro
                copy="Tell Frithly how your outbound currently works, where the bottleneck is, and what kind of pipeline quality you actually need. We use that to map the intelligence audit."
                eyebrow="Application form"
                title={
                  <>
                    Premium intake for a <span className="bg-[linear-gradient(135deg,#ffffff_0%,#97c4ff_56%,#06b6d4_100%)] bg-clip-text text-transparent">founder-level audit.</span>
                  </>
                }
              />

              <div className="space-y-4 rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6">
                {[
                  "Signal-based market qualification",
                  "Deliverability-aware route protection",
                  "Founder-aware targeting logic",
                  "Operational release design",
                ].map((item) => (
                  <div className="flex items-start gap-3 text-sm leading-7 text-slate-300" key={item}>
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <form
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(8,12,24,0.98))] p-6 shadow-[0_36px_120px_rgba(0,0,0,0.28)] lg:p-8"
              onSubmit={handleAuditSubmit}
            >
              <div className="grid gap-5 md:grid-cols-2">
                {auditFieldMeta.map((field) => (
                  <div className="space-y-2" key={field.name}>
                    <Label className="text-sm font-medium text-white" htmlFor={field.name}>
                      {field.label}
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      onChange={(event) =>
                        updateAuditField(field.name as keyof AuditFormState, event.target.value)
                      }
                      placeholder={field.placeholder}
                      suppressHydrationWarning
                      value={auditForm[field.name as keyof AuditFormState]}
                    />
                  </div>
                ))}

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white" htmlFor="industry">
                    Industry
                  </Label>
                  <Select onValueChange={(value) => updateAuditField("industry", value)} value={auditForm.industry}>
                    <SelectTrigger id="industry" suppressHydrationWarning>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B2B SaaS">B2B SaaS</SelectItem>
                      <SelectItem value="AI Startup">AI Startup</SelectItem>
                      <SelectItem value="IT Services">IT Services</SelectItem>
                      <SelectItem value="Agency">Agency</SelectItem>
                      <SelectItem value="Enterprise Software">Enterprise Software</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-white" htmlFor="geography">
                    Target Geography
                  </Label>
                  <Select onValueChange={(value) => updateAuditField("geography", value)} value={auditForm.geography}>
                    <SelectTrigger id="geography" suppressHydrationWarning>
                      <SelectValue placeholder="Select geography" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="UK and EU">UK and EU</SelectItem>
                      <SelectItem value="Global enterprise">Global enterprise</SelectItem>
                      <SelectItem value="Regional market">Regional market</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-white" htmlFor="currentProcess">
                    Current Outbound Process
                  </Label>
                  <Textarea
                    id="currentProcess"
                    name="currentProcess"
                    onChange={(event) => updateAuditField("currentProcess", event.target.value)}
                    placeholder="Describe how outbound currently gets built, routed, and reviewed."
                    rows={4}
                    suppressHydrationWarning
                    value={auditForm.currentProcess}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-medium text-white" htmlFor="biggestBottleneck">
                    Biggest Bottleneck
                  </Label>
                  <Textarea
                    id="biggestBottleneck"
                    name="biggestBottleneck"
                    onChange={(event) => updateAuditField("biggestBottleneck", event.target.value)}
                    placeholder="What is currently damaging reply quality, targeting precision, or deliverability?"
                    rows={4}
                    suppressHydrationWarning
                    value={auditForm.biggestBottleneck}
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-sm leading-7 text-slate-400">
                  This intake opens the full Frithly application workflow so we can map the right
                  outbound intelligence audit for your team.
                </p>
                <Button size="lg" type="submit" className="bg-[#3b82f6] text-white hover:bg-[#2563eb]">
                  <span className="inline-flex items-center gap-2">
                    Apply For Outbound Intelligence Audit
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Button>
              </div>
            </form>
          </motion.div>
        </Container>
      </section>

      <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20" id="faq">
        <Container className="space-y-12">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="Clear answers for founders, sales leaders, and RevOps teams deciding whether to redesign the acquisition layer before scaling more activity."
              eyebrow="FAQ"
              title={
                <>
                  Questions buyers ask before they trust the <span className="bg-[linear-gradient(135deg,#ffffff_0%,#97c4ff_56%,#06b6d4_100%)] bg-clip-text text-transparent">infrastructure.</span>
                </>
              }
            />
          </motion.div>

          <motion.div className="mx-auto max-w-4xl" {...revealProps(enableMotion, 0.08)}>
            <Accordion className="space-y-4" collapsible type="single">
              {platformFaqs.map((faq, index) => (
                <AccordionItem
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-1"
                  key={faq.question}
                  value={`faq-${index}`}
                >
                  <AccordionTrigger className="text-left text-base font-medium text-white">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-base leading-8 text-slate-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
