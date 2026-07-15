"use client";

import Link from "next/link";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
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
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  Users2,
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

const gradientButtonClassName =
  "border-transparent bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)] text-[#090909] shadow-[0_18px_52px_rgba(201,183,255,0.18)] hover:brightness-[1.03] hover:text-[#090909]";

const darkButtonClassName =
  "border-white/[0.08] bg-white/[0.03] text-white shadow-[0_18px_46px_rgba(0,0,0,0.22)] hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white";

const trustItems = ["Signal-driven", "Manual verification", "Personalized outreach"] as const;

const heroOpportunityDetails = [
  { label: "Signal", value: "Hiring SDRs" },
  { label: "Company", value: "Acme AI" },
  { label: "Decision maker", value: "VP Sales" },
  { label: "Why now", value: "Sales expansion" },
  { label: "Email", value: "Verified" },
  { label: "Sequence", value: "4 emails included" },
] as const;

const problemCards = [
  {
    copy: "Broad sourcing fills the sequence with companies that were never likely to buy.",
    icon: Building2,
    title: "Wrong companies",
  },
  {
    copy: "Good accounts still stall when the contact is not the person who can move the deal.",
    icon: Users2,
    title: "Wrong people",
  },
  {
    copy: "Even strong accounts go cold when outreach starts before there is a reason to care.",
    icon: Radar,
    title: "Wrong timing",
  },
  {
    copy: "Without context, every opener sounds generic and every follow-up starts to blur together.",
    icon: Sparkles,
    title: "Generic messaging",
  },
] as const;

const timingSignals = [
  {
    copy: "A new SDR team usually means pipeline goals are already rising.",
    title: "SDR Hiring",
  },
  {
    copy: "Fresh funding tends to create urgency around growth and sales execution.",
    title: "New Funding",
  },
  {
    copy: "Launching something new often creates a brief window for stronger outbound relevance.",
    title: "Product Launches",
  },
  {
    copy: "Sales expansion makes account quality matter more because rep time gets expensive fast.",
    title: "Sales Expansion",
  },
  {
    copy: "New leadership often resets priorities, tooling, and where the team needs traction.",
    title: "Leadership Hiring",
  },
] as const;

const processSteps = [
  {
    body: "Find buying signals across the market before the account ever reaches your team.",
    details: ["Hiring and GTM motion", "Expansion signals", "Fresh buying context"],
    label: "01",
    result: "A live slice of the market worth qualifying, not another raw list.",
    title: "Detect",
  },
  {
    body: "Manually review the company against your ICP so weak matches stop here.",
    details: ["ICP fit checked", "Weak accounts removed", "Priority signals kept"],
    label: "02",
    result: "Only accounts that actually fit your market move forward.",
    title: "Qualify",
  },
  {
    body: "Verify companies, decision-makers, and contact paths before release.",
    details: ["Decision-maker confirmed", "Domain quality checked", "Contact path verified"],
    label: "03",
    result: "The company, the person, and the route are confirmed before release.",
    title: "Verify",
  },
  {
    body: "Prepare the why-now context plus an initial email and follow-ups.",
    details: ["Why-now angle", "Initial email draft", "Three follow-ups prepared"],
    label: "04",
    result: "Your team gets context and copy already shaped around the signal.",
    title: "Personalize",
  },
  {
    body: "Deliver outbound-ready opportunities your team can work immediately.",
    details: ["Weekly brief shipped", "Ready for reps", "Manual QA completed"],
    label: "05",
    result: "The final brief is ready to work, not ready to clean up.",
    title: "Deliver",
  },
] as const;

const receiveItems = [
  "Company profile",
  "Website",
  "Buying signal",
  "Decision maker",
  "LinkedIn profile",
  "Company LinkedIn",
  "Verified email",
  "Verified phone",
  "Why-now trigger",
  "Initial email",
  "Three follow-ups",
  "Manual QA",
] as const;

const whyFrithlyRows = [
  ["Databases", "Buying signals"],
  ["Mass scraping", "Manual qualification"],
  ["Generic contacts", "Decision makers"],
  ["Templates", "Personalization"],
  ["No context", "Why-now triggers"],
  ["Raw records", "Outbound opportunities"],
] as const;

const audienceCards = [
  {
    copy: "Outbound-heavy software teams that need cleaner timing and better-fit accounts.",
    icon: Building2,
    title: "B2B SaaS",
  },
  {
    copy: "Agencies that want stronger outbound opportunities instead of more research cleanup.",
    icon: BriefcaseBusiness,
    title: "AI Agencies",
  },
  {
    copy: "Software companies building pipeline where rep time is too expensive to waste.",
    icon: Target,
    title: "Software Companies",
  },
  {
    copy: "Cybersecurity teams that need sharper why-now context before outreach begins.",
    icon: ShieldCheck,
    title: "Cybersecurity",
  },
  {
    copy: "Consulting firms where better timing and better-fit accounts improve conversation quality fast.",
    icon: Sparkles,
    title: "Consulting Firms",
  },
] as const;

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
        monoFont.className,
        "inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/74",
      )}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)] blur-[6px]" />
        <span className="relative rounded-full bg-white/85" />
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
          "max-w-5xl text-[2.6rem] font-semibold leading-[0.92] tracking-[-0.065em] text-white sm:text-[3.8rem] lg:text-[4.7rem] xl:text-[5.4rem]",
          align === "center" ? "mx-auto" : "",
        )}
      >
        {title}
      </div>
      <p
        className={cn(
          "max-w-3xl text-[1rem] leading-8 text-white/68 sm:text-[1.08rem] sm:leading-8",
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
  id,
}: {
  children: ReactNode;
  className?: string;
  id: string;
}) {
  return (
    <section className={cn("relative py-24 sm:py-28 lg:py-32", className)} id={id}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_center,rgba(201,183,255,0.07),transparent_72%)] blur-3xl" />
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
  tone?: "neutral" | "spotlight";
}) {
  const toneClassName =
    tone === "spotlight"
      ? "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))] shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
      : "border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.018))] shadow-[0_24px_70px_rgba(0,0,0,0.22)]";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border p-6 backdrop-blur-xl sm:p-7 lg:p-8",
        toneClassName,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03),transparent_22%),radial-gradient(circle_at_80%_18%,rgba(201,183,255,0.06),transparent_22%)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function OpportunityField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-white/[0.07] bg-white/[0.025] px-4 py-4">
      <div className={cn(monoFont.className, "text-[10px] uppercase tracking-[0.16em] text-white/42")}>
        {label}
      </div>
      <div className="mt-2 text-[1.02rem] font-semibold text-white">{value}</div>
    </div>
  );
}

function ProcessSection({ enableMotion }: { enableMotion: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = processSteps[activeIndex];

  return (
    <StorySection id="process">
      <div className="space-y-12">
        <motion.div {...revealProps(enableMotion, 0.04)}>
          <SectionIntro
            align="center"
            copy="Every step exists to remove wasted outreach before it reaches your sales team."
            eyebrow="Process"
            title="Signals become outbound-ready opportunities."
          />
        </motion.div>

        <motion.div {...revealProps(enableMotion, 0.08)}>
          <SurfaceCard className="overflow-hidden" tone="spotlight">
            <div className="space-y-5 sm:space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {processSteps.map((step, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={step.title}
                      className={cn(
                        "group flex h-full min-h-[7.25rem] w-full flex-col justify-between rounded-[1rem] border px-4 py-4 text-left transition-all duration-300",
                        isActive
                          ? "border-[rgba(201,183,255,0.24)] bg-white/[0.05] shadow-[0_0_0_1px_rgba(201,183,255,0.12),0_20px_44px_rgba(0,0,0,0.24)]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.035]",
                      )}
                      onClick={() => setActiveIndex(index)}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            monoFont.className,
                            "text-[10px] uppercase tracking-[0.16em] text-white/38 transition-colors",
                            isActive ? "text-white/72" : "group-hover:text-white/54",
                          )}
                        >
                          {step.label}
                        </span>
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full bg-white/22 transition-all",
                            isActive ? "bg-[#d9caff] shadow-[0_0_16px_rgba(201,183,255,0.32)]" : "",
                          )}
                        />
                      </div>
                      <div className={cn("mt-4 text-[1.02rem] font-semibold transition-colors", isActive ? "text-white" : "text-white/72")}>
                        {step.title}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-[1.4rem] border border-white/[0.06] bg-[#090909]/84 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-6 lg:p-7">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={activeStep.title}
                    animate={enableMotion ? { opacity: 1, y: 0 } : undefined}
                    className="space-y-5"
                    initial={enableMotion ? { opacity: 0, y: 12 } : undefined}
                    exit={enableMotion ? { opacity: 0, y: -12 } : undefined}
                    transition={enableMotion ? { duration: 0.32, ease: [0.22, 1, 0.36, 1] } : undefined}
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
                      <div className="rounded-[1.25rem] border border-white/[0.05] bg-white/[0.02] p-5 sm:p-6 lg:p-7">
                        <div className="flex items-center gap-3">
                          <span className={cn(monoFont.className, "text-[10px] uppercase tracking-[0.18em] text-white/42")}>
                            Step {activeStep.label}
                          </span>
                          <span className="h-px flex-1 bg-white/[0.08]" />
                        </div>

                        <div className="mt-5 text-[1.8rem] font-semibold leading-tight text-white sm:text-[2.1rem]">
                          {activeStep.title}
                        </div>
                        <p className="mt-4 max-w-xl text-[0.98rem] leading-8 text-white/66 sm:text-[1.03rem]">
                          {activeStep.body}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {activeStep.details.map((detail, index) => (
                            <div
                              className="rounded-[1.1rem] border border-white/[0.06] bg-white/[0.025] px-4 py-5 sm:px-5"
                              key={detail}
                            >
                              <div className={cn(monoFont.className, "text-[10px] uppercase tracking-[0.16em] text-white/38")}>
                                Layer 0{index + 1}
                              </div>
                              <div className="mt-4 text-base font-medium leading-7 text-white/82">
                                {detail}
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </SurfaceCard>
        </motion.div>
      </div>
    </StorySection>
  );
}

export function PlatformHomepage() {
  const reduceMotion = useReducedMotion() ?? false;
  const enableMotion = !reduceMotion;

  return (
    <div className="relative isolate overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,194,139,0.06),transparent_18%),radial-gradient(circle_at_78%_14%,rgba(201,183,255,0.08),transparent_18%),radial-gradient(circle_at_52%_72%,rgba(232,167,215,0.05),transparent_24%),linear-gradient(180deg,#050505_0%,#090909_42%,#111111_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:176px_176px] opacity-[0.05]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(5,5,5,0.98),rgba(5,5,5,0))]" />

      <section className="relative pt-6 sm:pt-14 xl:min-h-[calc(100svh-4.5rem)]" id="top">
        <Container className="grid gap-10 py-8 sm:py-14 lg:py-18 xl:min-h-[calc(100svh-5rem)] xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.02fr)] xl:items-center xl:gap-10 xl:py-24">
          <motion.div className="space-y-7 sm:space-y-8 xl:pr-5" {...revealProps(enableMotion, 0.04, "drift")}>
            <SectionEyebrow>Better outbound starts before the first email</SectionEyebrow>

            <div
              className={cn(
                headlineFont.className,
                "max-w-[9ch] text-[3.2rem] font-semibold leading-[0.9] tracking-[-0.08em] text-white sm:text-[4.8rem] lg:text-[5.35rem] xl:text-[5.95rem] 2xl:text-[6.45rem]",
              )}
            >
              Better outbound starts before the first email.
            </div>

            <p className="max-w-2xl text-[1.02rem] leading-8 text-white/72 sm:text-[1.1rem]">
              Frithly identifies buying signals, manually qualifies companies, verifies
              decision-makers, and delivers outbound-ready opportunities your team can act on
              immediately.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className={cn("w-full sm:w-auto", gradientButtonClassName)}>
                <Link href={ROUTES.SAMPLE}>
                  <span className="inline-flex items-center gap-2">
                    Request Sample
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className={cn("w-full sm:w-auto", darkButtonClassName)}>
                <Link href={ROUTES.BOOK_MEETING}>Book Intro Call</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/56">
              {trustItems.map((item) => (
                <div className="inline-flex items-center gap-3" key={item}>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="relative xl:max-w-[38rem] xl:justify-self-end 2xl:max-w-[39rem]" {...revealProps(enableMotion, 0.12, "soft")}>
            <motion.div
              animate={enableMotion ? { opacity: [0.28, 0.42, 0.28], y: [-6, 4, -6] } : undefined}
              className="pointer-events-none absolute -right-10 top-6 h-72 w-72 rounded-full bg-[rgba(201,183,255,0.08)] blur-[132px]"
              transition={enableMotion ? { duration: 8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY } : undefined}
            />
            <SurfaceCard className="xl:ml-auto" tone="spotlight">
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={cn(monoFont.className, "text-[10px] uppercase tracking-[0.18em] text-white/42")}>
                      Sample opportunity
                    </div>
                    <div className="mt-3 text-[1.7rem] font-semibold leading-tight text-white sm:text-[1.9rem]">
                      Acme AI
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/82">
                    Ready for reps
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {heroOpportunityDetails.map((item) => (
                    <OpportunityField key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)]">
                  <div className="rounded-[1.1rem] border border-white/[0.06] bg-white/[0.025] p-5">
                    <div className={cn(monoFont.className, "text-[10px] uppercase tracking-[0.18em] text-white/42")}>
                      Why this account
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        "Hiring SDRs shows active sales expansion.",
                        "VP Sales is the person most likely to care first.",
                        "The why-now angle is already clear before outreach starts.",
                      ].map((item) => (
                        <div className="flex items-start gap-3 text-sm leading-6 text-white/70" key={item}>
                          <span className="mt-2 h-2 w-2 rounded-full bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.1rem] border border-white/[0.06] bg-white/[0.025] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-sm font-semibold text-white">Included</div>
                      <div className="inline-flex items-center gap-2 text-sm text-white/60">
                        <CheckCircle2 className="h-4 w-4 text-white/62" aria-hidden="true" />
                        Verified
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        "Initial email included",
                        "Three follow-ups prepared",
                        "Manual QA before delivery",
                      ].map((item) => (
                        <div className="flex items-center gap-3 text-sm text-white/72" key={item}>
                          <CheckCircle2 className="h-4 w-4 text-white/62" aria-hidden="true" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </motion.div>
        </Container>
      </section>

      <StorySection id="problem">
        <div className="space-y-12">
          <motion.div {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              align="center"
              copy="Bad outbound usually starts long before the first message. Frithly fixes the parts that make strong outreach impossible."
              eyebrow="Problem"
              title="Most outbound fails before the first email."
            />
          </motion.div>

          <motion.div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" {...revealProps(enableMotion, 0.08)}>
            {problemCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <SurfaceCard className="h-full" key={card.title} tone={index === 3 ? "spotlight" : "neutral"}>
                  <div className="space-y-5">
                    <div className="w-fit rounded-[1rem] border border-white/[0.06] bg-white/[0.03] p-3 text-white/82">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="text-[1.4rem] font-semibold text-white">{card.title}</div>
                    <p className="text-sm leading-7 text-white/64">{card.copy}</p>
                  </div>
                </SurfaceCard>
              );
            })}
          </motion.div>

          <motion.div {...revealProps(enableMotion, 0.12)}>
            <SurfaceCard className="px-8 py-7 text-center lg:px-10" tone="spotlight">
              <p className="mx-auto max-w-4xl text-[1.15rem] leading-8 text-white/80 sm:text-[1.2rem]">
                Frithly solves all four before your team starts outreach.
              </p>
            </SurfaceCard>
          </motion.div>
        </div>
      </StorySection>

      <StorySection id="timing">
        <div className="space-y-12">
          <motion.div {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              align="center"
              copy="Timing creates opportunities because companies usually show what is changing before they are ready to buy."
              eyebrow="Why Timing Matters"
              title="Companies leave signals before they buy."
            />
          </motion.div>

          <motion.div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" {...revealProps(enableMotion, 0.08)}>
            {timingSignals.map((signal, index) => (
              <SurfaceCard className="h-full" key={signal.title} tone={index === 0 ? "spotlight" : "neutral"}>
                <div className="space-y-4">
                  <div className={cn(monoFont.className, "text-[10px] uppercase tracking-[0.16em] text-white/40")}>
                    Signal
                  </div>
                  <div className="text-[1.3rem] font-semibold text-white">{signal.title}</div>
                  <p className="text-sm leading-7 text-white/64">{signal.copy}</p>
                </div>
              </SurfaceCard>
            ))}
          </motion.div>
        </div>
      </StorySection>

      <ProcessSection enableMotion={enableMotion} />

      <StorySection id="receive">
        <div className="space-y-12">
          <motion.div {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              align="center"
              copy="Each opportunity arrives as something your sales team can use immediately, not another record to clean up."
              eyebrow="What You Receive"
              title="Every opportunity includes everything needed to start the conversation."
            />
          </motion.div>

          <motion.div {...revealProps(enableMotion, 0.08)}>
            <SurfaceCard className="px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10" tone="spotlight">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {receiveItems.map((item) => (
                  <div
                    className="flex items-center gap-3 rounded-[1rem] border border-white/[0.06] bg-white/[0.025] px-4 py-4 text-white/80"
                    key={item}
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#d8c9ff]" aria-hidden="true" />
                    <span className="text-sm font-medium leading-6 sm:text-[0.96rem]">{item}</span>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </motion.div>
        </div>
      </StorySection>

      <StorySection id="sample-opportunity">
        <div className="space-y-12">
          <motion.div {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              align="center"
              copy="This is what a serious buyer can inspect before trusting the system."
              eyebrow="Sample Opportunity"
              title="A real opportunity should explain the signal, the person, the timing, and the message."
            />
          </motion.div>

          <motion.div {...revealProps(enableMotion, 0.08)}>
            <SurfaceCard className="p-0" tone="spotlight">
              <div className="p-6 sm:p-8 xl:p-10">
                <div className="mx-auto max-w-5xl">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className={cn(monoFont.className, "text-[10px] uppercase tracking-[0.18em] text-white/40")}>
                        SDR Hiring Signal
                      </div>
                      <div className="mt-3 text-[2rem] font-semibold text-white sm:text-[2.4rem]">
                        Northbeam Analytics
                      </div>
                    </div>
                    <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/82">
                      Verified opportunity
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <OpportunityField label="Signal" value="First SDR hire posted 8 days ago" />
                    <OpportunityField label="Company" value="Northbeam Analytics" />
                    <OpportunityField label="Decision maker" value="Marcus King, Sales Director" />
                    <OpportunityField label="Why now" value="First outbound hire — pipeline infrastructure gap" />
                    <OpportunityField label="Contact" value="Verified (live email + LinkedIn)" />
                  </div>

                  <div className="mt-8 rounded-[1.2rem] border border-white/[0.06] bg-white/[0.025] p-5 sm:p-6">
                    <div className="flex items-center gap-3 text-white">
                      <div className="rounded-[0.9rem] border border-white/[0.08] bg-white/[0.03] p-2.5">
                        <Users2 className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="text-lg font-semibold">Why this made the brief</div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/68">
                      Northbeam posted their first SDR role this month. That&apos;s the exact point
                      where list-building eats the new hire&apos;s first month instead of selling —
                      Marcus has a clear, immediate reason to want a working pipeline before that
                      hire starts.
                    </p>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </motion.div>
        </div>
      </StorySection>

      <StorySection id="why-frithly">
        <div className="space-y-12">
          <motion.div {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              align="center"
              copy="The difference is not more data. The difference is better timing, better qualification, and better delivery."
              eyebrow="Why Frithly"
              title="Traditional sourcing gives you records. Frithly gives you opportunities."
            />
          </motion.div>

          <motion.div {...revealProps(enableMotion, 0.08)}>
            <SurfaceCard className="px-5 py-5 sm:px-7 sm:py-7" tone="spotlight">
              <div className="grid grid-cols-2 gap-4 border-b border-white/[0.06] pb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white/56">
                <div>Traditional sourcing</div>
                <div>Frithly</div>
              </div>
              <div className="mt-4 space-y-3">
                {whyFrithlyRows.map(([traditional, frithly]) => (
                  <div
                    className="grid grid-cols-2 gap-4 rounded-[1rem] border border-white/[0.05] bg-white/[0.02] px-4 py-4 sm:px-5"
                    key={`${traditional}-${frithly}`}
                  >
                    <div className="text-sm font-medium leading-6 text-white/56">{traditional}</div>
                    <div className="text-sm font-semibold leading-6 text-white">{frithly}</div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </motion.div>
        </div>
      </StorySection>

      <StorySection id="ideal-customers">
        <div className="space-y-12">
          <motion.div {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              align="center"
              copy="Frithly works best for teams where a better account, a better contact, and better timing directly improve conversations."
              eyebrow="Ideal Customers"
              title="Built for teams that care about timing, fit, and verified decision-makers."
            />
          </motion.div>

          <motion.div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" {...revealProps(enableMotion, 0.08)}>
            {audienceCards.map((card) => {
              const Icon = card.icon;

              return (
                <SurfaceCard className="h-full" key={card.title} tone="neutral">
                  <div className="space-y-5">
                    <div className="w-fit rounded-[1rem] border border-white/[0.06] bg-white/[0.03] p-3 text-white/82">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="text-[1.28rem] font-semibold text-white">{card.title}</div>
                    <p className="text-sm leading-7 text-white/64">{card.copy}</p>
                  </div>
                </SurfaceCard>
              );
            })}
          </motion.div>
        </div>
      </StorySection>

      <StorySection className="pt-16 sm:pt-20" id="faq">
        <div className="space-y-12">
          <motion.div {...revealProps(enableMotion, 0.04)}>
            <SectionIntro
              align="center"
              copy="The answers teams usually want before they decide whether a signal-led approach fits how they sell."
              eyebrow="FAQ"
              title="Clear answers before you book the call."
            />
          </motion.div>

          <motion.div className="mx-auto max-w-4xl" {...revealProps(enableMotion, 0.08)}>
            <Accordion className="space-y-4" collapsible type="single">
              {platformFaqs.map((faq, index) => (
                <AccordionItem
                  className="rounded-[1.35rem] border border-white/[0.08] bg-white/[0.03] px-5 py-1 shadow-[0_20px_54px_rgba(0,0,0,0.2)]"
                  key={faq.question}
                  value={`faq-${index}`}
                >
                  <AccordionTrigger className="text-left text-[1rem] font-semibold leading-7 text-white sm:text-[1.06rem]">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-[0.98rem] leading-8 text-white/68">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </StorySection>

      <StorySection className="pt-16 pb-18 sm:pt-20 sm:pb-24" id="cta">
        <motion.div {...revealProps(enableMotion, 0.04)}>
          <SurfaceCard className="px-8 py-10 text-center lg:px-12 lg:py-14" tone="spotlight">
            <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-48 max-w-xl rounded-full bg-[radial-gradient(circle_at_center,rgba(201,183,255,0.18),transparent_72%)] blur-3xl" />
            <div className="relative">
              <SectionEyebrow>Final CTA</SectionEyebrow>
              <div
                className={cn(
                  headlineFont.className,
                  "mx-auto mt-7 max-w-4xl text-[2.8rem] font-semibold leading-[0.92] tracking-[-0.06em] text-white sm:text-[4rem] lg:text-[4.9rem]",
                )}
              >
                See how your next opportunity looks.
              </div>
              <p className="mx-auto mt-6 max-w-3xl text-[1.02rem] leading-8 text-white/68">
                If you want better timing, better-fit accounts, and verified decision-makers
                before outreach starts, Frithly was built for that layer.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className={cn("w-full sm:w-auto", gradientButtonClassName)}>
                  <Link href={ROUTES.SAMPLE}>Request Sample</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className={cn("w-full sm:w-auto", darkButtonClassName)}>
                  <Link href={ROUTES.BOOK_MEETING}>Book Call</Link>
                </Button>
              </div>
            </div>
          </SurfaceCard>
        </motion.div>
      </StorySection>
    </div>
  );
}
