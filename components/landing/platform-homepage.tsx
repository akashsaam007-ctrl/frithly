"use client";

import Link from "next/link";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import { useState, type FormEvent, type ReactNode } from "react";
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
  Play,
  Radar,
  ShieldCheck,
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

const heroTraditionalFlow = ["Big Lists", "Generic Messages", "Low Replies"] as const;
const heroFrithlyFlow = [
  "Buying Signals",
  "Better-Fit Accounts",
  "Better Messages",
  "Better Conversations",
] as const;
const heroSupportItems = [
  {
    body: "We start with signs a company is growing, hiring, or changing.",
    title: "Buying signals",
  },
  {
    body: "Publishers, job boards, weak domains, and noise do not make the brief.",
    title: "Filtering bad accounts",
  },
  {
    body: "Unsafe routes and weak contact paths get filtered out before outreach.",
    title: "Protecting deliverability",
  },
] as const;

const problemBlocks = [
  {
    copy: "Most outbound teams target the same recycled contact lists everyone else already has.",
    icon: Radar,
    title: "Bad Lists",
  },
  {
    copy: "Even strong companies get ignored when outreach starts before the timing is right.",
    icon: Sparkles,
    title: "Bad Timing",
  },
  {
    copy: "Automation can scale bad targeting just as fast as good targeting.",
    icon: Workflow,
    title: "More Sending, Same Problem",
  },
] as const;

const whatFrithlyDoes = [
  {
    copy: "We look for companies showing signs that outbound is more likely to work now.",
    icon: Radar,
    title: "Find Better-Fit Companies",
  },
  {
    copy: "Weak matches and noisy results get removed before they reach your team.",
    icon: Target,
    title: "Filter Out Bad Accounts",
  },
  {
    copy: "We find founders, sales leaders, and GTM contacts based on the company, not a blind export.",
    icon: Users2,
    title: "Find The Right People",
  },
  {
    copy: "Each lead comes with a clearer reason to reach out and a stronger starting point for messaging.",
    icon: Sparkles,
    title: "Give Reps A Better Angle",
  },
] as const;

const receiveItems = [
  {
    copy: "Companies filtered for fit, timing, and outbound readiness.",
    title: "Better-Fit Accounts",
  },
  {
    copy: "Founders, GTM leaders, RevOps, and sales contacts matched to the account.",
    title: "Right Contacts",
  },
  {
    copy: "Simple, context-aware outreach angles instead of generic first lines.",
    title: "Better Opening Angles",
  },
  {
    copy: "Suggested follow-up direction so reps do not start from scratch.",
    title: "Follow-Up Direction",
  },
  {
    copy: "A clear explanation of why the company made the brief and why now makes sense.",
    title: "Why This Account",
  },
] as const;

const differenceRows = [
  ["Big exports", "Better-fit accounts"],
  ["Generic first lines", "Clear outreach angles"],
  ["More bad emails", "Safer outreach"],
  ["Unknown timing", "Why-now context"],
  ["Low Reply Rates", "Better Conversations"],
] as const;

const audienceCards = [
  {
    copy: "Series A and B software teams that need better-fit accounts before outbound volume scales.",
    icon: Building2,
    title: "B2B SaaS",
  },
  {
    copy: "High-ticket consulting and IT services firms that need sharper account selection before sales effort.",
    icon: BriefcaseBusiness,
    title: "IT Services",
  },
  {
    copy: "Outbound agencies that want better-fit opportunities instead of more list-cleaning work.",
    icon: Workflow,
    title: "Agencies",
  },
  {
    copy: "Founder-led teams that need a sharper outbound point of view before hiring or scaling harder.",
    icon: Target,
    title: "Founder-Led Outbound Teams",
  },
  {
    copy: "SDR, GTM, and RevOps teams where cleaner inputs directly change reply quality and meeting quality.",
    icon: Users2,
    title: "SDR and GTM Teams",
  },
] as const;

const processSteps = [
  "Define ICP",
  "Find buying signals",
  "Filter bad accounts",
  "Find the right people",
  "Write better angles",
  "Review",
  "Delivery",
] as const;

const signalExamples = [
  {
    body: "A company is hiring sales reps and building a bigger outbound motion.",
    kicker: "Example 01",
    title: "Hiring For Sales",
  },
  {
    body: "A recently funded software company is under pressure to build pipeline faster.",
    kicker: "Example 02",
    title: "Fresh Funding",
  },
  {
    body: "A services firm is entering a new market and needs new conversations quickly.",
    kicker: "Example 03",
    title: "New Market Push",
  },
] as const;

const pilotPoints = [
  "See how much wasted outreach gets removed.",
  "Check whether better timing changes reply quality.",
  "Start with a smaller release before scaling further.",
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

function revealProps(enableMotion: boolean, delay = 0, variant: "drift" | "lift" | "soft" = "lift") {
  if (!enableMotion) {
    return {};
  }

  const initial =
    variant === "soft"
      ? { opacity: 0 }
      : variant === "drift"
        ? { opacity: 0, x: 16, y: 14 }
        : { opacity: 0, y: 28 };

  const animate =
    variant === "soft"
      ? { opacity: 1 }
      : variant === "drift"
        ? { opacity: 1, x: 0, y: 0 }
        : { opacity: 1, y: 0 };

  return {
    initial,
    transition: { delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
    viewport: { amount: 0.18, once: true },
    whileInView: animate,
  };
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-[0.8rem] bg-white/[0.02] px-4 py-2.5 text-[0.72rem] font-medium tracking-[0.14em] text-slate-300",
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inset-0 rounded-full bg-[#8b5cf6] opacity-16 blur-[6px]" />
        <span className="relative rounded-full bg-white/80" />
      </span>
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
  title: ReactNode;
}) {
  return (
    <div className={cn("space-y-6", align === "center" ? "mx-auto text-center" : "text-left")}>
      <SectionEyebrow>{eyebrow}</SectionEyebrow>
      <div
        className={cn(
          headlineFont.className,
          "max-w-5xl text-[2.45rem] font-semibold leading-[0.94] tracking-[-0.055em] text-white sm:text-[3.25rem] lg:text-[4.2rem] xl:text-[5rem]",
          align === "center" ? "mx-auto" : "",
        )}
      >
        {title}
      </div>
      <p
        className={cn(
          "max-w-2xl text-[1.03rem] leading-8 text-slate-300 md:text-[1.1rem]",
          align === "center" ? "mx-auto" : "",
        )}
      >
        {copy}
      </p>
    </div>
  );
}

function StorySection({
  children,
  className,
  glow = "violet",
  id,
}: {
  children: ReactNode;
  className?: string;
  glow?: "shadow" | "violet";
  id: string;
}) {
  const glowClassName =
    glow === "shadow"
      ? "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_74%)]"
      : "bg-[radial-gradient(circle_at_center,rgba(91,58,153,0.08),transparent_76%)]";

  return (
    <section className={cn("relative py-24 sm:py-28 lg:py-32 xl:py-36", className)} id={id}>
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-44 opacity-80 blur-3xl",
          glowClassName,
        )}
      />
      <Container className="relative">{children}</Container>
    </section>
  );
}

function SurfaceCard({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "danger" | "neutral" | "spotlight" | "violet";
}) {
  const toneClassName =
    tone === "danger"
      ? "bg-[linear-gradient(180deg,rgba(14,10,12,0.76),rgba(5,6,8,0.99))] shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
      : tone === "violet"
        ? "bg-[linear-gradient(180deg,rgba(11,11,16,0.88),rgba(4,5,8,0.995))] shadow-[0_24px_78px_rgba(0,0,0,0.22)]"
        : tone === "spotlight"
          ? "border border-white/[0.055] bg-[linear-gradient(180deg,rgba(10,11,15,0.94),rgba(3,4,6,0.995))] shadow-[0_30px_94px_rgba(0,0,0,0.24)]"
          : "bg-[linear-gradient(180deg,rgba(8,9,13,0.84),rgba(4,5,8,0.995))] shadow-[0_24px_76px_rgba(0,0,0,0.2)]";

  const insetClassName =
    tone === "spotlight"
      ? "pointer-events-none absolute inset-[1px] rounded-[calc(1.05rem-1px)] border border-white/[0.02]"
      : "";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.05rem] p-5 sm:p-6 lg:p-7",
        toneClassName,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.035),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_34%)]" />
      {insetClassName ? <div className={insetClassName} /> : null}
      <div className="relative">{children}</div>
    </div>
  );
}

function FlowPill({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClassName =
    tone === "success"
      ? "bg-white/[0.045] text-white"
      : tone === "warning"
        ? "bg-white/[0.028] text-slate-200"
        : "bg-white/[0.022] text-slate-200";

  return (
    <div
      className={cn(
        "rounded-[0.8rem] px-4 py-3 text-sm font-medium",
        toneClassName,
      )}
    >
      {children}
    </div>
  );
}

function MetricTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[0.95rem] bg-white/[0.018] px-4 py-4">
      <div
        className={cn(
          monoFont.className,
          "text-[10px] tracking-[0.16em] text-slate-500",
        )}
      >
        {label}
      </div>
      <div className="mt-3 text-[1.8rem] font-semibold text-white">{value}</div>
    </div>
  );
}

export function PlatformHomepage() {
  const reduceMotion = useReducedMotion() ?? false;
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

  function updateAuditField(key: keyof AuditFormState, value: string) {
    setAuditForm((current) => ({ ...current, [key]: value }));
  }

  function handleAuditSubmit(event: FormEvent<HTMLFormElement>) {
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
  const applicationFieldClassName =
    "h-14 rounded-[1.05rem] border-white/[0.08] bg-white/[0.035] px-5 text-[0.98rem] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-slate-500 hover:border-white/[0.11] focus-visible:bg-white/[0.05] focus-visible:ring-[rgba(167,139,250,0.16)] focus-visible:ring-offset-0";
  const applicationTextareaClassName =
    "min-h-[156px] rounded-[1.05rem] border-white/[0.08] bg-white/[0.035] px-5 py-4 text-[0.98rem] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-slate-500 hover:border-white/[0.11] focus-visible:bg-white/[0.05] focus-visible:ring-[rgba(167,139,250,0.16)] focus-visible:ring-offset-0";

  return (
    <div className="relative isolate overflow-hidden bg-[#030406] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.045),transparent_16%),radial-gradient(circle_at_80%_14%,rgba(82,57,140,0.075),transparent_18%),radial-gradient(circle_at_50%_72%,rgba(255,255,255,0.025),transparent_28%),linear-gradient(180deg,#020304_0%,#040508_22%,#06080d_54%,#030406_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:184px_184px] opacity-[0.04]" />
      <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(167,139,250,0.06),transparent)] xl:block" />
      <div className="pointer-events-none absolute inset-x-0 top-[18rem] h-[190rem] bg-[radial-gradient(circle_at_center,rgba(91,58,153,0.04),transparent_72%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(2,3,4,0.96),rgba(2,3,4,0))]" />

      <section className="relative pt-10 sm:pt-14 xl:min-h-[calc(100svh-4.5rem)]" id="top">
        <Container className="grid gap-10 py-8 sm:py-12 lg:py-16 xl:min-h-[calc(100svh-5rem)] xl:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)] xl:items-start xl:py-20 xl:gap-20">
          <motion.div className="relative space-y-8 xl:pt-8" {...revealProps(enableMotion, 0.03, "drift")}>
            <motion.div
              animate={enableMotion ? { opacity: [0.28, 0.42, 0.28], x: [-6, 0, -6], y: [-4, 2, -4] } : undefined}
              className="pointer-events-none absolute -left-16 top-10 h-60 w-60 rounded-full bg-[rgba(91,58,153,0.08)] blur-[132px]"
              transition={enableMotion ? { duration: 11, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY } : undefined}
            />
            <SectionEyebrow>Better outbound starts before the first email</SectionEyebrow>

            <div
              className={cn(
                headlineFont.className,
                "relative max-w-[7.35ch] text-[2.35rem] font-semibold leading-[0.92] tracking-[-0.08em] text-white sm:text-[3.15rem] lg:text-[3.9rem] xl:text-[4.65rem] 2xl:text-[5rem]",
              )}
            >
              <span className="block text-white">Most Outbound</span>
              <span className="block bg-[linear-gradient(135deg,#ffffff_0%,#ece9ff_42%,#9580d6_100%)] bg-clip-text text-transparent">
                Fails Before
              </span>
              <span className="block bg-[linear-gradient(135deg,#f4f2ff_0%,#ddd8fb_44%,#8c6fd4_100%)] bg-clip-text text-transparent">
                The First Email.
              </span>
            </div>

            <p className="max-w-2xl text-[1rem] leading-7 text-slate-300 sm:text-[1.08rem] sm:leading-8">
              Frithly helps outbound teams find better-fit companies before outreach starts, so
              reps waste less time and get better conversations.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.022))] shadow-[0_20px_48px_rgba(0,0,0,0.28)] hover:border-white/[0.12] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.095),rgba(255,255,255,0.03))] sm:w-auto"
              >
                <Link href={ROUTES.BOOK_MEETING}>
                  <span className="inline-flex items-center gap-2">
                    Book Strategy Call
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full border-white/12 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:w-auto"
              >
                <Link href="/#pipeline">
                  <span className="inline-flex items-center gap-2">
                    See How Frithly Works
                    <Play className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              <div className="space-y-4 rounded-[1rem] bg-white/[0.018] p-5">
                <div className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Typical outbound
                </div>
                <div className="flex flex-wrap gap-2">
                  {heroTraditionalFlow.map((item) => (
                    <FlowPill key={item} tone="warning">
                      {item}
                    </FlowPill>
                  ))}
                </div>
              </div>

              <div className="space-y-4 rounded-[1rem] bg-white/[0.026] p-5">
                <div className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-slate-400">
                  Frithly
                </div>
                <div className="flex flex-wrap gap-2">
                  {heroFrithlyFlow.map((item) => (
                    <FlowPill key={item} tone="success">
                      {item}
                    </FlowPill>
                  ))}
                </div>
              </div>
            </div>

          </motion.div>

          <motion.div className="relative mx-auto w-full max-w-4xl xl:max-w-none" {...revealProps(enableMotion, 0.12, "soft")}>
            <motion.div
              animate={enableMotion ? { opacity: [0.18, 0.3, 0.18], x: [4, -2, 4], y: [0, 8, 0] } : undefined}
              className="pointer-events-none absolute -right-14 top-12 h-72 w-72 rounded-full bg-[rgba(124,92,201,0.03)] blur-[132px]"
              transition={enableMotion ? { duration: 13, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY } : undefined}
            />
            <SurfaceCard className="rounded-[1.25rem] p-0" tone="spotlight">
              <div className="relative p-6 lg:p-7 xl:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mt-3 max-w-[15ch] text-[1.52rem] font-semibold leading-[1.08] text-white lg:text-[1.78rem] xl:text-[1.92rem]">
                      A smaller shortlist with a better chance of replies.
                    </div>
                  </div>
                  <div className="rounded-[0.8rem] bg-white/[0.04] px-4 py-2 text-sm text-slate-200">
                    Ready to work
                  </div>
                </div>

                <div className="mt-8">
                  <div className="rounded-[1.1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.022),rgba(255,255,255,0.008))] p-5 lg:p-6">
                    <div className="max-w-[13ch] text-[1.8rem] font-semibold leading-[1.06] text-white lg:text-[1.95rem] xl:text-[2.08rem]">
                      Smaller list. Better timing. Better conversations.
                    </div>
                    <p className="mt-4 max-w-[34rem] text-sm leading-7 text-slate-400">
                      Frithly is built to cut wasted outreach. The goal is fewer bad accounts,
                      better timing, and stronger conversations once your team starts emailing.
                    </p>

                    <div className="relative mt-7 h-[13.5rem] overflow-hidden rounded-[1.06rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.028),transparent_42%),linear-gradient(180deg,rgba(4,5,8,0.12),rgba(5,6,10,0.52))] sm:h-[15.5rem] lg:h-[16.25rem]">
                      <div className="absolute inset-x-12 top-1/2 h-px -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)]" />
                      <div className="absolute left-1/2 top-1/2 h-[42%] w-px -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.12),transparent)]" />
                      <div className="absolute left-[24%] top-[28%] h-px w-[28%] origin-left rotate-[18deg] bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(167,139,250,0.34),transparent)]" />
                      <div className="absolute left-[48%] top-[38%] h-px w-[26%] origin-left -rotate-[14deg] bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(167,139,250,0.28),transparent)]" />
                      <div className="absolute left-[27%] top-[56%] h-px w-[22%] origin-left -rotate-[22deg] bg-[linear-gradient(90deg,rgba(255,255,255,0.05),rgba(167,139,250,0.24),transparent)]" />
                      <div className="absolute left-[50%] top-[56%] h-px w-[22%] origin-left rotate-[22deg] bg-[linear-gradient(90deg,rgba(255,255,255,0.05),rgba(167,139,250,0.24),transparent)]" />

                      <motion.div
                        animate={enableMotion ? { opacity: [0.48, 0.92, 0.48], scale: [0.985, 1.018, 0.985] } : undefined}
                        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.16),rgba(255,255,255,0.02),transparent_72%)] shadow-[0_0_60px_rgba(124,92,201,0.12)]"
                        transition={
                          enableMotion
                            ? { duration: 6, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }
                            : undefined
                        }
                      />
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-lg font-semibold text-white">Ready-to-send brief</div>
                        <div className="mt-1 text-[0.68rem] font-medium uppercase tracking-[0.13em] text-slate-500">
                          Better-fit accounts
                        </div>
                      </div>

                      {[
                        "Buying signals",
                        "ICP fit",
                        "Safer routes",
                        "Right contacts",
                      ].map((label, index) => {
                        const positions = [
                          "left-[12%] top-[16%]",
                          "right-[10%] top-[22%]",
                          "left-[16%] bottom-[14%]",
                          "right-[12%] bottom-[16%]",
                        ] as const;
                        return (
                          <div
                            className={cn(
                              "absolute rounded-[0.8rem] bg-white/[0.038] px-4 py-2 text-sm text-slate-200",
                              positions[index],
                            )}
                            key={label}
                          >
                            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-white/70 shadow-[0_0_12px_rgba(167,139,250,0.35)]" />
                            {label}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-3">
                      <MetricTile label="Signals found" value="214" />
                      <MetricTile label="Good domains" value="87" />
                      <MetricTile label="Risk removed" value="12" />
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {heroSupportItems.map((item, index) => (
                        <motion.div key={item.title} {...revealProps(enableMotion, 0.12 + index * 0.05, "drift")}>
                          <div className="h-full rounded-[0.95rem] bg-white/[0.024] p-4">
                            <div className="flex items-center gap-3 text-white">
                              <span className="h-2 w-2 rounded-full bg-white/70 shadow-[0_0_12px_rgba(167,139,250,0.24)]" />
                              <div className="text-sm font-semibold">{item.title}</div>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-slate-400">{item.body}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </motion.div>
        </Container>
      </section>

      <StorySection glow="shadow" id="problem">
        <div className="grid gap-12 xl:grid-cols-[0.84fr_1.16fr] xl:items-start">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="Teams do not usually lose pipeline because reps work too little. They lose it because the wrong accounts enter the sequence in the first place."
              eyebrow="Why outbound underperforms"
              title="Better outbound starts with better accounts."
            />
          </motion.div>

          <motion.div {...revealProps(enableMotion, 0.08)}>
            <SurfaceCard className="px-7 py-7 lg:px-8 lg:py-8" tone="spotlight">
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {problemBlocks.map((block, index) => {
                  const Icon = block.icon;

                  return (
                    <div
                      className={cn(
                        "space-y-5",
                        index === problemBlocks.length - 1 ? "md:col-span-2 xl:col-span-1" : "",
                      )}
                      key={block.title}
                    >
                      <div className="flex items-center gap-3 text-slate-200">
                        <div className="rounded-[0.95rem] bg-white/[0.035] p-3">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="text-xl font-semibold text-white">{block.title}</div>
                      </div>
                      <p className="max-w-xl text-sm leading-7 text-slate-400">{block.copy}</p>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          </motion.div>
        </div>
      </StorySection>

      <StorySection className="pt-10 sm:pt-14 lg:pt-16" glow="shadow" id="solution">
        <motion.div {...revealProps(enableMotion, 0.04)}>
          <SurfaceCard className="px-8 py-10 lg:px-12 lg:py-16" tone="spotlight">
            <div className="mx-auto max-w-5xl text-center">
              <SectionEyebrow>Most outbound fails before the first email</SectionEyebrow>
              <div
                className={cn(
                  headlineFont.className,
                  "mx-auto mt-7 max-w-4xl text-[2.55rem] font-semibold leading-[0.94] tracking-[-0.055em] text-white sm:text-[3.45rem] lg:text-[4.45rem] xl:text-[5rem]",
                )}
              >
                Bad targeting makes everything after it worse.
              </div>
              <p className="mx-auto mt-6 max-w-3xl text-[1.04rem] leading-8 text-slate-300">
                If the wrong companies enter the sequence, better copy will not save it. Frithly
                was built to fix targeting first, so the rest of outbound has a better chance to
                work.
              </p>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-300">
              {[
                "Bad lists",
                "Too-broad ICPs",
                "Weak timing",
                "Wasted outreach",
              ].map((item, index) => (
                <motion.div className="flex items-center gap-3" key={item} {...revealProps(enableMotion, 0.1 + index * 0.04)}>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/65" />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </SurfaceCard>
        </motion.div>
      </StorySection>

      <StorySection glow="shadow" id="what-frithly-does">
        <div className="grid gap-12 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="This is the simple version: we help your team stop spending time on companies that were never likely to reply."
              eyebrow="What Frithly actually does"
              title="We help teams start with better-fit accounts."
            />
          </motion.div>

          <motion.div {...revealProps(enableMotion, 0.08)}>
            <SurfaceCard className="px-7 py-7 lg:px-8 lg:py-8" tone="spotlight">
              <div className="relative pl-7">
                <div className="pointer-events-none absolute bottom-1 left-[11px] top-1 w-px bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(167,139,250,0.16),transparent)]" />
                <div className="space-y-8">
                  {whatFrithlyDoes.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <motion.div
                        className="relative grid gap-4 pb-8 last:pb-0 md:grid-cols-[auto_1fr]"
                        key={item.title}
                        {...revealProps(enableMotion, 0.1 + index * 0.05)}
                      >
                        <span className="absolute -left-[20px] top-2 h-2.5 w-2.5 rounded-full bg-white/70 shadow-[0_0_12px_rgba(167,139,250,0.26)]" />
                        <div className="rounded-[0.95rem] bg-white/[0.035] p-3 text-slate-200">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="text-[1.45rem] font-semibold leading-tight text-white">
                            {item.title}
                          </div>
                          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                            {item.copy}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </SurfaceCard>
          </motion.div>
        </div>
      </StorySection>

      <StorySection glow="shadow" id="deliverables">
        <div className="grid gap-10 xl:grid-cols-[0.86fr_1.14fr] xl:items-start">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="This is what your team gets each week: a smaller set of accounts that are easier to work, easier to message, and more likely to become real conversations."
              eyebrow="What Your Team Actually Receives"
              title="Your team gets a shortlist they can actually use."
            />
          </motion.div>

          <motion.div className="space-y-6" {...revealProps(enableMotion, 0.08)}>
            <SurfaceCard className="px-7 py-7 lg:px-8 lg:py-8" tone="neutral">
              <div className="grid gap-x-8 gap-y-7 md:grid-cols-2">
                {receiveItems.map((item, index) => (
                  <div
                    className={cn(
                      "pb-7",
                      index === 4 ? "md:col-span-2 md:max-w-3xl" : "",
                    )}
                    key={item.title}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-[0.95rem] bg-white/[0.035] p-2.5 text-slate-200">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="text-lg font-semibold text-white">{item.title}</div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-400">{item.copy}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard tone="spotlight">
              <div className="text-[2.15rem] font-semibold leading-tight text-white">
                A weekly brief your team can work right away.
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">
                That means better-fit accounts, the right contacts, better opening angles, and a
                clear reason each company made the brief in the first place.
              </p>
            </SurfaceCard>
          </motion.div>
        </div>
      </StorySection>

      <StorySection glow="shadow" id="difference">
        <motion.div {...revealProps(enableMotion, 0.04)}>
          <SurfaceCard className="px-8 py-10 lg:px-10 lg:py-12" tone="spotlight">
            <div className="max-w-4xl">
              <SectionIntro
                copy="Most tools help teams send more. Frithly helps teams aim better."
                eyebrow="Before vs after"
                title="More leads do not fix bad outbound."
              />
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[1.05rem] bg-white/[0.018] p-6">
                <div className="text-sm font-medium text-slate-400">Traditional outbound</div>
                <div className="mt-6 space-y-3">
                  {differenceRows.map(([traditional]) => (
                    <div key={traditional} className="space-y-3">
                      <FlowPill tone="warning">{traditional}</FlowPill>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.05rem] bg-white/[0.03] p-6">
                <div className="text-sm font-medium text-white">Frithly</div>
                <div className="mt-6 space-y-3">
                  {differenceRows.map(([, frithly]) => (
                    <div key={frithly} className="space-y-3">
                      <FlowPill tone="success">{frithly}</FlowPill>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SurfaceCard>
        </motion.div>
      </StorySection>

      <StorySection glow="shadow" id="not-saas">
        <motion.div
          className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-center"
          {...revealProps(enableMotion, 0.04)}
        >
          <SurfaceCard className="px-7 py-7 lg:px-8 lg:py-8" tone="neutral">
            <div className="space-y-5">
              {[ 
                "Bulk lead databases",
                "Cold-email software",
                "Generic automation funnels",
                "Mass outreach systems",
              ].map((item) => (
                <div
                  className="pb-5 last:pb-0"
                  key={item}
                >
                  <div className="text-lg font-semibold text-white">{item}</div>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    Frithly is not built to sell {item.toLowerCase()}. It is built to improve who
                    your team targets before outreach begins.
                  </p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="px-8 py-10 lg:px-10 lg:py-12" tone="spotlight">
            <div
              className={cn(
                headlineFont.className,
                "mt-6 max-w-3xl text-[2.95rem] font-semibold leading-[0.94] tracking-[-0.055em] text-white sm:text-[3.75rem] lg:text-[4.3rem]",
              )}
            >
              This is a better starting point for outbound.
            </div>
            <p className="mt-6 max-w-2xl text-[1.02rem] leading-8 text-slate-300">
              If your team already has tools to send emails, the next win is usually not more
              software. It is better accounts, better timing, and better reasons to reach out.
            </p>
          </SurfaceCard>
        </motion.div>
      </StorySection>

      <StorySection glow="shadow" id="fit">
        <div className="space-y-12">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="Frithly works best where a small improvement in targeting quality can change replies, meetings, and pipeline confidence."
              eyebrow="Who this is for"
              title="Built for teams that care about who they target."
            />
          </motion.div>

          <motion.div
            className="max-w-2xl rounded-[0.95rem] bg-white/[0.02] px-5 py-4 text-sm leading-7 text-slate-300"
            {...revealProps(enableMotion, 0.06)}
          >
            Not designed for mass cold-email blasting.
          </motion.div>

          <motion.div {...revealProps(enableMotion, 0.08)}>
            <SurfaceCard className="px-7 py-7 lg:px-8 lg:py-8" tone="neutral">
              <div className="grid gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                {audienceCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div className="space-y-4" key={card.title}>
                      <div className="w-fit rounded-[0.95rem] bg-white/[0.035] p-3 text-slate-200">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="text-[1.45rem] font-semibold leading-tight text-white">
                        {card.title}
                      </div>
                      <p className="text-sm leading-7 text-slate-400">{card.copy}</p>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          </motion.div>
        </div>
      </StorySection>

      <StorySection glow="shadow" id="signals">
        <div className="space-y-12">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="These are the kinds of signs that make a company more worth reaching out to."
              eyebrow="What better timing looks like"
              title="We look for signals that make outreach easier to believe."
            />
          </motion.div>

          <motion.div {...revealProps(enableMotion, 0.08)}>
            <SurfaceCard className="px-7 py-7 lg:px-8 lg:py-8" tone="spotlight">
              <div className="grid gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
                {signalExamples.map((example) => (
                  <div className="space-y-4" key={example.title}>
                    <div className="text-sm text-slate-500">{example.kicker}</div>
                    <div className="text-[1.8rem] font-semibold leading-tight text-white">
                      {example.title}
                    </div>
                    <p className="text-sm leading-7 text-slate-400">{example.body}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </motion.div>
        </div>
      </StorySection>

      <StorySection glow="shadow" id="pipeline">
        <div className="space-y-12">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="This is the flow: define the market, find the signs, remove weak accounts, map the right people, and hand your team a better brief."
              eyebrow="How it works"
              title="How Frithly builds the brief."
            />
          </motion.div>

          <motion.div {...revealProps(enableMotion, 0.08)}>
            <SurfaceCard className="px-7 py-8 lg:px-9 lg:py-10" tone="spotlight">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                {processSteps.map((step, index) => (
                  <div className="flex min-w-0 flex-1 items-center gap-4" key={step}>
                    <div className="min-w-0 flex-1 rounded-[0.98rem] bg-white/[0.02] px-5 py-5">
                      <div className="flex items-center justify-between gap-4">
                        <span
                          className={cn(
                            monoFont.className,
                            "text-[10px] tracking-[0.14em] text-slate-500",
                          )}
                        >
                          0{index + 1}
                        </span>
                        <div className="h-2 w-2 rounded-full bg-white/70 shadow-[0_0_10px_rgba(167,139,250,0.24)]" />
                      </div>
                      <div className="mt-4 text-lg font-semibold leading-tight text-white">{step}</div>
                    </div>
                    {index < processSteps.length - 1 ? (
                      <div className="hidden xl:block">
                        <ArrowRight className="h-5 w-5 text-white/30" aria-hidden="true" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </motion.div>
        </div>
      </StorySection>

      <StorySection glow="shadow" id="pilot">
        <motion.div {...revealProps(enableMotion, 0.04)}>
            <SurfaceCard className="px-8 py-10 lg:px-10 lg:py-12" tone="spotlight">
            <div className="grid gap-10 xl:grid-cols-[0.95fr_1.05fr] xl:items-center">
              <div className="space-y-6">
                <SectionEyebrow>Start small</SectionEyebrow>
                <div
                  className={cn(
                    headlineFont.className,
                    "max-w-3xl text-[2.55rem] font-semibold leading-[0.94] tracking-[-0.055em] text-white sm:text-[3.35rem] lg:text-[4rem] xl:text-[4.55rem]",
                  )}
                >
                  Start small. See the difference.
                </div>
                <p className="max-w-2xl text-[1.02rem] leading-8 text-slate-300">
                  Most teams begin with a focused pilot to see whether better targeting changes
                  reply quality, meeting quality, and rep confidence.
                </p>
              </div>

              <div className="space-y-5">
                {pilotPoints.map((point, index) => (
                  <motion.div key={point} {...revealProps(enableMotion, 0.1 + index * 0.04)}>
                    <div className="flex items-start gap-3 pb-5 text-sm leading-7 text-slate-300 last:pb-0">
                      <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-white/75" aria-hidden="true" />
                      <span>{point}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </SurfaceCard>
        </motion.div>
      </StorySection>

      <StorySection glow="shadow" id="application">
        <div className="space-y-12">
          <motion.div {...revealProps(enableMotion, 0.04)}>
            <SurfaceCard className="px-8 py-10 text-center lg:px-12 lg:py-14" tone="spotlight">
              <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-44 max-w-xl rounded-full bg-[rgba(167,139,250,0.08)] blur-3xl" />
              <div className="relative">
                <SectionEyebrow>Final CTA</SectionEyebrow>
                <div
                  className={cn(
                    headlineFont.className,
                    "mx-auto mt-7 max-w-4xl text-[2.55rem] font-semibold leading-[0.94] tracking-[-0.055em] text-white sm:text-[3.45rem] lg:text-[4.5rem] xl:text-[5.1rem]",
                  )}
                >
                  Stop wasting outreach on the wrong accounts.
                </div>
                <p className="mx-auto mt-6 max-w-3xl text-[1.03rem] leading-8 text-slate-300">
                  If your team is still working from broad lists and weak timing, Frithly can help
                  you start with better accounts before the first email goes out.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="w-full border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.022))] shadow-[0_20px_48px_rgba(0,0,0,0.28)] hover:border-white/[0.12] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.095),rgba(255,255,255,0.03))] sm:w-auto"
                  >
                    <Link href={ROUTES.BOOK_MEETING}>
                      <span className="inline-flex items-center gap-2">
                        Book Strategy Call
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="w-full border-white/12 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:w-auto"
                  >
                    <Link href="/#pipeline">See Example Workflow</Link>
                  </Button>
                </div>
              </div>
            </SurfaceCard>
          </motion.div>

          <motion.div
            className="grid gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start"
            {...revealProps(enableMotion, 0.08)}
          >
            <div className="space-y-6">
              <SectionIntro
                copy="Tell us how outbound works today, where it breaks, and what kind of pipeline you want to create. We use that to shape the right next step."
                eyebrow="Tell us about your outbound"
                title="We need a clear picture before we recommend anything."
              />

              <SurfaceCard tone="neutral">
                <div className="space-y-4">
                  {[
                    "Review where targeting breaks down",
                    "Spot wasted outreach",
                    "Show what a better brief looks like",
                    "Recommend the right starting point",
                  ].map((item) => (
                    <div className="flex items-start gap-3 text-sm leading-7 text-slate-300" key={item}>
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-white/70" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            </div>

            <form
              className="relative overflow-hidden rounded-[1.3rem] border border-white/[0.06] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_34%),linear-gradient(180deg,rgba(11,12,16,0.98),rgba(4,5,8,1))] p-7 shadow-[0_40px_120px_rgba(0,0,0,0.24)] lg:p-9"
              onSubmit={handleAuditSubmit}
            >
              <div className="mb-7 flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <div className="text-[1.3rem] font-semibold leading-tight text-white">
                    A few details so we can see if there is a fit.
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    We use this to understand your market, how outreach works today, and where
                    better targeting could help first.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 self-start rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-white/70 shadow-[0_0_12px_rgba(167,139,250,0.18)]" />
                  Manual review
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {auditFieldMeta.map((field) => (
                  <div className="space-y-2.5" key={field.name}>
                    <Label className="text-[0.95rem] font-medium text-white/92" htmlFor={field.name}>
                      {field.label}
                    </Label>
                    <Input
                      className={applicationFieldClassName}
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

                <div className="space-y-2.5">
                  <Label className="text-[0.95rem] font-medium text-white/92" htmlFor="industry">
                    Industry
                  </Label>
                  <Select
                    onValueChange={(value) => updateAuditField("industry", value)}
                    value={auditForm.industry}
                  >
                    <SelectTrigger
                      className={applicationFieldClassName}
                      id="industry"
                      suppressHydrationWarning
                    >
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

                <div className="space-y-2.5">
                  <Label className="text-[0.95rem] font-medium text-white/92" htmlFor="geography">
                    Target Geography
                  </Label>
                  <Select
                    onValueChange={(value) => updateAuditField("geography", value)}
                    value={auditForm.geography}
                  >
                    <SelectTrigger
                      className={applicationFieldClassName}
                      id="geography"
                      suppressHydrationWarning
                    >
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

                <div className="space-y-2.5 md:col-span-2">
                  <Label className="text-[0.95rem] font-medium text-white/92" htmlFor="currentProcess">
                    Current Outbound Process
                  </Label>
                  <Textarea
                    className={applicationTextareaClassName}
                    id="currentProcess"
                    name="currentProcess"
                    onChange={(event) => updateAuditField("currentProcess", event.target.value)}
                    placeholder="How do you choose accounts and start outreach today?"
                    rows={4}
                    suppressHydrationWarning
                    value={auditForm.currentProcess}
                  />
                </div>

                <div className="space-y-2.5 md:col-span-2">
                  <Label className="text-[0.95rem] font-medium text-white/92" htmlFor="biggestBottleneck">
                    Biggest Bottleneck
                  </Label>
                  <Textarea
                    className={applicationTextareaClassName}
                    id="biggestBottleneck"
                    name="biggestBottleneck"
                    onChange={(event) => updateAuditField("biggestBottleneck", event.target.value)}
                    placeholder="What is wasting the most outbound effort right now?"
                    rows={4}
                    suppressHydrationWarning
                    value={auditForm.biggestBottleneck}
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-4 border-t border-white/[0.06] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-xl text-sm leading-7 text-slate-400">
                  We review every application manually before recommending the right pilot,
                  strategy call, or next step.
                </p>
                <Button
                  size="lg"
                  type="submit"
                  className="w-full rounded-[1.05rem] border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.085),rgba(255,255,255,0.026))] shadow-[0_22px_54px_rgba(0,0,0,0.28)] hover:border-white/[0.14] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.105),rgba(255,255,255,0.036))] sm:min-w-[16rem] sm:w-auto"
                >
                  <span className="inline-flex items-center gap-2">
                    Apply for a targeting review
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </StorySection>

      <StorySection className="pt-18 pb-16 sm:pt-22 sm:pb-20" glow="shadow" id="faq">
        <div className="space-y-12">
          <motion.div className="max-w-4xl" {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              copy="Clear answers for teams deciding whether better targeting should come before more outreach."
              eyebrow="FAQ"
              title="Questions buyers ask before they trust the system."
            />
          </motion.div>

          <motion.div className="mx-auto max-w-4xl" {...revealProps(enableMotion, 0.08)}>
            <Accordion className="space-y-4" collapsible type="single">
              {platformFaqs.map((faq, index) => (
                <AccordionItem
                  className="rounded-[1.05rem] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(12,14,20,0.9),rgba(4,5,8,0.99))] px-5 py-1 shadow-[0_16px_48px_rgba(0,0,0,0.16)]"
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
        </div>
      </StorySection>
    </div>
  );
}
