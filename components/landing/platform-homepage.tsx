import Link from "next/link";
import { Fraunces } from "next/font/google";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Layers3,
  LockKeyhole,
  MailCheck,
  Search,
  Send,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BrandMark } from "@/components/ui/logo";
import { CALCOM_URL, PLANS, ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const trustChips = [
  "Human-gated SMTP safety",
  "Tenant-isolated workspaces",
  "Recommendation-first workflow",
  "CRM and outbound exports built in",
];

const heroSignals = [
  {
    context: "Currently cleared for high-attention review",
    label: "Premium opportunities",
    value: "14",
  },
  {
    context: "Already safe enough for careful outbound handling",
    label: "SMTP-safe now",
    value: "6",
  },
  {
    context: "High-confidence decision support, not noisy guessing",
    label: "Avg. founder confidence",
    value: "0.87",
  },
  {
    context: "Top recommendation band versus workspace baseline",
    label: "Positive reply lift",
    value: "4.2x",
  },
];

const queueSignals = [
  {
    label: "Founder confidence",
    tone: "High",
    value: "92%",
  },
  {
    label: "Contactability",
    tone: "SMTP-safe",
    value: "Premium",
  },
  {
    label: "Freshness",
    tone: "Updated",
    value: "2 days",
  },
];

const workflowSteps = [
  {
    description:
      "Turn a client ICP into city-aware discovery, enrichment, and qualification rules without manually stitching together queries.",
    icon: Search,
    label: "Delivery pipeline",
    step: "01",
  },
  {
    description:
      "Surface a scarce feed of the strongest outbound opportunities ranked by recommendation score, founder confidence, freshness, and contactability.",
    icon: Sparkles,
    label: "Recommendations",
    step: "02",
  },
  {
    description:
      "Prepare source-backed outreach drafts that stay short, believable, and grounded in real observations instead of fake personalization.",
    icon: FileSpreadsheet,
    label: "Drafts",
    step: "03",
  },
  {
    description:
      "Package approved leads into selective outbound cohorts with SMTP-safe gating, readiness states, and campaign linkage.",
    icon: Send,
    label: "Cohorts",
    step: "04",
  },
  {
    description:
      "Close the loop with reply, bounce, and meeting signals so the platform learns which opportunities are actually worth attention.",
    icon: BarChart3,
    label: "Analytics",
    step: "05",
  },
];

const readinessFunnel = [
  { count: "120", label: "Discovered", share: "100%", width: "100%" },
  { count: "34", label: "Qualified", share: "28%", width: "87%" },
  { count: "14", label: "Recommended", share: "12%", width: "74%" },
  { count: "8", label: "Approved", share: "7%", width: "61%" },
  { count: "6", label: "SMTP-ready", share: "5%", width: "48%" },
  { count: "5", label: "Cohort-ready", share: "4%", width: "35%" },
];

const controlPoints = [
  {
    description:
      "Syntax, MX, catch-all, and SMTP stay layered. Expensive checks only happen after review, not during bulk enrichment.",
    icon: MailCheck,
    title: "Outbound safety controls",
  },
  {
    description:
      "Organization-scoped ownership keeps campaigns, recommendations, drafts, cohorts, and exports separated by tenant at the backend layer.",
    icon: LockKeyhole,
    title: "Tenant-safe by design",
  },
  {
    description:
      "The system learns where value lives, where effort is wasted, and which signals actually convert into replies and meetings.",
    icon: Target,
    title: "Outcome-driven prioritization",
  },
];

const exportProfiles = [
  {
    description:
      "Push only approved and reviewed opportunities into downstream CRMs with reasoning, confidence, and enrichment context intact.",
    label: "CRM export",
  },
  {
    description:
      "Prepare SMTP-safe leads with founder details, draft status, contactability, and recommendation rationale for outbound tools.",
    label: "Outbound-ready export",
  },
  {
    description:
      "Share a compact list with premium leads, why-now reasoning, and outreach angles when an operator only needs the strongest bets.",
    label: "Premium-only export",
  },
  {
    description:
      "Keep the full intelligence layer available for ops, Clay, Sheets, or client delivery without collapsing everything into a flat CSV dump.",
    label: "Full intelligence export",
  },
];

const pricingPlans = [
  {
    audience: "For founder-led or lean outbound teams",
    description:
      "A selective workflow for teams that need outbound-ready opportunities without hiring an internal research operation.",
    href: CALCOM_URL,
    plan: PLANS.STARTER,
  },
  {
    audience: "For growing GTM teams",
    description:
      "More delivery pipelines, denser recommendation coverage, and stronger operator workflows for teams building a repeatable outbound motion.",
    href: CALCOM_URL,
    plan: PLANS.GROWTH,
  },
  {
    audience: "For multi-market or agency-grade motions",
    description:
      "Expanded orchestration, broader campaign support, and higher-touch rollout for teams running multiple customer or territory plays.",
    href: CALCOM_URL,
    plan: PLANS.SCALE,
  },
] as const;

export const platformFaqs = [
  {
    answer:
      "Frithly is built around selective outbound readiness, not raw volume. Delivery pipelines create ICP-specific discovery, recommendations rank the best opportunities, drafts stay source-backed, and cohorts only move forward after human review.",
    question: "How is Frithly different from a lead database or scraper?",
  },
  {
    answer:
      "SMTP validation is human-gated and progressive. We do syntax, MX, and catch-all checks cheaply, then reserve live SMTP probing for manually approved premium leads only.",
    question: "How do you protect deliverability and sender reputation?",
  },
  {
    answer:
      "Yes. Campaign orchestration is built around client ICPs, geography, score thresholds, founder-confidence minimums, and contactability rules. If quality is not there, the system reports shortages honestly instead of padding weak leads.",
    question: "Can this generate client-specific lead sets instead of generic lists?",
  },
  {
    answer:
      "No. The platform is designed around human-supervised outbound. Recommendations, drafts, cohorts, and SMTP states are operational layers that help teams move faster without losing control.",
    question: "Does Frithly automatically send outreach?",
  },
  {
    answer:
      "Yes. Exports preserve the intelligence layer, including recommendation reasoning, founder confidence, contactability, SMTP state, and draft readiness, so teams can work inside CRMs, Sheets, Clay, Instantly, Smartlead, or HubSpot.",
    question: "Can we still work from our existing CRM or outbound tools?",
  },
  {
    answer:
      "Reply, bounce, meeting, and spam-complaint signals flow back into analytics so recommendation quality, prioritization, and future outbound decisions can be calibrated against real outcomes.",
    question: "How does the platform get smarter over time?",
  },
];

export function PlatformHomepage() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(circle_at_top_right,rgba(212,98,58,0.2),transparent_24rem),radial-gradient(circle_at_top_left,rgba(255,255,255,0.76),transparent_20rem)]" />
      <div className="absolute left-[-10rem] top-[24rem] -z-10 h-80 w-80 rounded-full bg-terracotta/10 blur-3xl" />
      <div className="absolute right-[-8rem] top-[36rem] -z-10 h-72 w-72 rounded-full bg-[#15263a]/[0.04] blur-3xl" />

      <section className="py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-7 animated-fade-up">
            <Badge className="w-fit bg-white/85 text-terracotta shadow-sm" variant="outline">
              Confidence-aware outbound intelligence
            </Badge>

            <div className="space-y-5">
              <h1
                className={`${displayFont.className} max-w-4xl text-[2.9rem] leading-[0.9] text-ink sm:text-[4rem] lg:max-w-[10.5ch] lg:text-[5.15rem]`}
              >
                Turn client ICPs into send-ready outbound opportunities.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-muted md:text-[1.18rem] md:leading-9">
                Frithly turns discovery, enrichment, contact intelligence, recommendation scoring,
                drafts, cohorts, exports, and outcome learning into one selective operating system
                for premium outbound.
              </p>
              <p className="max-w-xl text-sm leading-7 text-muted/90 md:text-base">
                Built for teams that would rather review eight strong opportunities than clean four
                hundred weak ones.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={ROUTES.APPLY}>
                  <span className="inline-flex items-center gap-2">
                    Apply for a pilot campaign
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href={ROUTES.DEMO}>Preview the qualification flow</Link>
              </Button>
            </div>

            <p className="text-sm leading-7 text-muted/90 md:text-base">
              Prefer the economics first?{" "}
              <Link
                className="font-semibold text-terracotta transition-colors hover:text-terracotta-dark"
                href={ROUTES.ROI}
              >
                Model your revenue opportunity
              </Link>
              .
            </p>

            <p className="text-sm leading-7 text-muted md:text-base">
              Best fit for agencies, GTM teams, and operators who need a selective, human-supervised
              outbound workflow.
            </p>

            <div className="flex flex-wrap gap-3">
              {trustChips.map((chip) => (
                <div key={chip} className="metric-chip">
                  <CheckCircle2 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                  <span>{chip}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-3 rounded-[1.75rem] border border-border/80 bg-white/75 p-4 shadow-[0_20px_60px_rgba(26,26,26,0.05)] backdrop-blur sm:grid-cols-2 sm:p-5">
              {heroSignals.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-[1.25rem] border border-border/70 bg-white/90 p-4 transition-transform duration-500 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(26,26,26,0.06)]"
                >
                  <div className="text-2xl font-semibold tracking-tighter text-ink sm:text-3xl">
                    {signal.value}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-ink">{signal.label}</p>
                  <p className="mt-2 text-xs leading-6 text-muted sm:text-sm">{signal.context}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animated-fade-up-soft animated-float">
            <div className="surface-card-dark relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
              <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                      Recommendation queue
                    </div>
                    <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                      Today&apos;s strongest outbound opportunities
                    </h2>
                  </div>
                  <BrandMark
                    className="hidden h-14 w-14 border-white/10 bg-white/5 p-1.5 sm:flex"
                    imageClassName="h-full w-full rounded-[0.95rem]"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {["Selective", "Human-supervised", "Outcome-trained"].map((flag) => (
                    <span
                      key={flag}
                      className="rounded-full border border-white/10 bg-white/[0.07] px-3 py-1 text-xs font-medium tracking-[0.12em] text-white/70 uppercase"
                    >
                      {flag}
                    </span>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                          Recommended now
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-white">Visionary Marketing</h3>
                        <p className="mt-2 text-sm leading-7 text-white/70">
                          High founder confidence, strong contactability, fresh enrichment, and no
                          outreach history in this workspace.
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-semibold text-white">
                        100
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/75">
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        Chris Coussons
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        SMTP-safe
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        Premium contactability
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {queueSignals.map((signal) => (
                        <div
                          key={signal.label}
                          className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-3 py-3"
                        >
                          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                            {signal.label}
                          </div>
                          <div className="mt-2 text-lg font-semibold text-white">{signal.value}</div>
                          <div className="mt-1 text-xs text-terracotta">{signal.tone}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Layers3 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                        Readiness funnel
                      </div>
                      <div className="mt-4 space-y-3">
                        {readinessFunnel.slice(0, 4).map((item) => (
                          <div key={item.label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-white/70">{item.label}</span>
                              <span className="font-semibold text-white">{item.count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10">
                              <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-terracotta to-terracotta-light"
                                style={{ width: item.width }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        <BarChart3 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                        Learning signal
                      </div>
                      <p className="mt-4 text-sm leading-7 text-white/70">
                        Birmingham agencies with founder confidence above 0.8 are outperforming
                        workspace reply baselines by 38%.
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                        See analytics
                        <ChevronRight className="h-4 w-4 text-terracotta" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24">
        <Container className="space-y-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow">From ICP to outbound execution</div>
            <h2 className={`${displayFont.className} section-title mt-5`}>
              One workflow for discovery, prioritization, preparation, and learning.
            </h2>
            <p className="section-copy mx-auto mt-5 max-w-2xl">
              Frithly is not a lead dump and not another sequencing tool. It is the operating
              layer between a client ICP and the small set of opportunities worth contacting.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {workflowSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.label}
                  className="surface-card animated-fade-up-soft flex h-full min-w-0 flex-col p-5 transition-all duration-500 hover:-translate-y-1 hover:border-terracotta/20 hover:shadow-[0_24px_70px_rgba(26,26,26,0.08)] sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mt-6 text-[2rem] leading-[1.05] font-semibold text-ink">{step.label}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted md:text-base">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div className="space-y-6">
            <div className="section-eyebrow">Selective intelligence, not raw volume</div>
            <h2 className={`${displayFont.className} section-title`}>
              Recommendations feel scarce because the platform is filtering aggressively.
            </h2>
            <p className="section-copy max-w-xl">
              Strong opportunities rise because recommendation score, lead quality, founder
              confidence, contactability, freshness, and previous outcome history are working
              together instead of separately.
            </p>

            <div className="surface-card overflow-hidden p-5 transition-all duration-500 hover:shadow-[0_24px_70px_rgba(26,26,26,0.08)] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                    Readiness funnel
                  </div>
                  <div className="text-xl font-semibold text-ink">
                    Quality improves as the stack gets narrower
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {readinessFunnel.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                          {item.share}
                        </span>
                        <span className="font-semibold text-ink">{item.count}</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-border/60">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-terracotta to-terracotta-light"
                        style={{ width: item.width }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="surface-card p-5 transition-all duration-500 hover:shadow-[0_24px_70px_rgba(26,26,26,0.08)] sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                    Opportunity feed
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-ink">
                    Why this company is recommended now
                  </h3>
                </div>
                <Badge variant="success">Outbound-ready</Badge>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[1.35rem] border border-border/80 bg-[linear-gradient(180deg,#fbf8f3_0%,#ffffff_100%)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold text-terracotta">Visionary Marketing</div>
                      <p className="mt-2 text-sm leading-7 text-muted">
                        Founder identified, high-confidence contact path, strong website quality,
                        and recent enrichment with no negative outreach signals.
                      </p>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink shadow-sm">
                      100
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Lead score</span>
                      <span className="font-semibold text-ink">77</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Founder confidence</span>
                      <span className="font-semibold text-ink">0.92</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Contactability</span>
                      <span className="font-semibold text-ink">Premium</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Freshness</span>
                      <span className="font-semibold text-ink">2 days ago</span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-3">
                    {["Founder-led fit", "Safe routing path", "Fresh research"].map((proof) => (
                      <div
                        key={proof}
                        className="rounded-full border border-border/80 bg-white px-3 py-2 text-center text-xs font-medium text-ink shadow-sm"
                      >
                        {proof}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-border/80 bg-white p-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                    Why recommended
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      "Premium lead score and strong service fit",
                      "Founder email linked with safe routing confidence",
                      "Recent enrichment with clean contact path",
                      "No bounce or spam history in this workspace",
                    ].map((reason) => (
                      <div key={reason} className="flex items-start gap-3 text-sm text-ink">
                        <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-terracotta" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-[1.15rem] border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-7 text-muted">
                    Drafts, SMTP review, and cohort packaging stay human-supervised, so the system
                    can move fast without turning into a spam machine.
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {controlPoints.map((point) => {
                const Icon = point.icon;

                return (
                  <div
                    key={point.title}
                    className="surface-card h-full p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(26,26,26,0.08)]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-ink">{point.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{point.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-5">
            <div className="section-eyebrow">Deployment packaging</div>
            <h2 className={`${displayFont.className} section-title`}>
              Exports stay operationally useful because the reasoning travels with the lead.
            </h2>
            <p className="section-copy max-w-xl">
              Outbound teams still work in CRMs, Sheets, Clay, HubSpot, Instantly, and Smartlead.
              Frithly makes those handoffs cleaner by preserving confidence, recommendation
              rationale, and readiness context.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {exportProfiles.map((profile) => (
              <div
                key={profile.label}
                className="surface-card h-full p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(26,26,26,0.08)] sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-ink">{profile.label}</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted">{profile.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="pricing" className="py-16 sm:py-20 lg:py-24">
        <Container className="space-y-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="section-eyebrow">Pricing</div>
            <h2 className={`${displayFont.className} section-title mt-5`}>
              Choose the intelligence workflow that matches your outbound motion.
            </h2>
            <p className="section-copy mx-auto mt-5 max-w-2xl">
              Every plan is designed around quality control, campaign orchestration, selective
              recommendations, and operator-ready execution, not bulk list volume.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {pricingPlans.map(({ audience, description, href, plan }) => {
              const isHighlighted = "isHighlighted" in plan && Boolean(plan.isHighlighted);
              const badge = "badge" in plan ? plan.badge : null;

              return (
                <div
                  key={plan.id}
                  className={`surface-card flex h-full flex-col p-6 ${
                    isHighlighted
                      ? "border-terracotta/30 bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_46%)]"
                      : "transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(26,26,26,0.08)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      {badge ? <Badge>{badge}</Badge> : null}
                      <h3 className="mt-3 text-3xl font-semibold text-ink">{plan.name}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
                    </div>
                    <div className="rounded-full border border-border/70 bg-stone-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      monthly
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="text-4xl font-bold tracking-tighter text-ink sm:text-5xl">
                      {formatCurrency(plan.price)}
                    </div>
                    <div className="mt-2 text-sm text-muted">Per month, billed monthly</div>
                    <div className="mt-4 rounded-[1.15rem] bg-stone-50 px-4 py-3 text-sm leading-7 text-muted">
                      {audience}
                    </div>
                  </div>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-ink md:text-base">
                        <div className="mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-8">
                    <Button
                      asChild
                      className="w-full"
                      size="lg"
                      variant={isHighlighted ? "primary" : "secondary"}
                    >
                      <Link href={href} rel="noreferrer" target="_blank">
                        <span className="inline-flex items-center gap-2">
                          Request demo
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="faq" className="bg-white py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-5">
            <div className="section-eyebrow">Questions from serious buyers</div>
            <h2 className={`${displayFont.className} section-title`}>
              The questions teams ask when they care about quality, safety, and trust.
            </h2>
            <p className="section-copy max-w-xl">
              Frithly sits between intelligence discovery and outbound execution, so the right concerns are
              about control, confidence, and business outcomes rather than raw list size.
            </p>
          </div>

          <div className="surface-card overflow-hidden px-4 shadow-[0_24px_70px_rgba(26,26,26,0.06)] sm:px-6">
            {platformFaqs.map((faq) => (
              <details key={faq.question} className="group border-b border-border/70 py-1 last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-left text-base font-semibold text-ink marker:hidden md:text-lg">
                  {faq.question}
                  <ChevronRight className="h-5 w-5 shrink-0 rotate-90 text-muted transition-transform duration-300 group-open:rotate-[270deg]" />
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="pb-6 text-sm leading-7 text-muted md:text-base">{faq.answer}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="surface-card-dark animated-glow relative overflow-hidden px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14">
            <div className="absolute inset-y-0 right-[-8rem] hidden w-64 rounded-full bg-terracotta/20 blur-3xl lg:block" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="space-y-6">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <BrandMark
                    className="h-14 w-14 rounded-[1.2rem] border-white/10 bg-white/5 p-1.5 shadow-none"
                    imageClassName="h-full w-full rounded-[0.95rem]"
                  />
                  <div className="section-eyebrow border-white/10 bg-white/5 text-terracotta">
                    Ready to replace noisy prospecting with selective outbound execution?
                  </div>
                </div>
                <div className="space-y-5">
                  <h2 className={`${displayFont.className} section-title text-white`}>
                    Bring your ICP. We&apos;ll show you how the platform turns it into real outbound
                    opportunities.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                    The fastest way to evaluate Frithly is to see one campaign move through
                    recommendations, drafts, cohort packaging, and outbound safety review against a
                    market you actually care about.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    "Client-specific delivery pipelines",
                    "Human-gated SMTP review",
                    "Operator-ready exports",
                  ].map((point) => (
                    <div
                      key={point}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75"
                    >
                      <CheckCircle2 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:min-w-[18rem]">
                <Button asChild size="lg" className="w-full">
                  <Link href={ROUTES.APPLY}>
                    <span className="inline-flex items-center gap-2">
                      Apply for a pilot campaign
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full">
                  <Link href={ROUTES.DEMO}>Open the interactive demo</Link>
                </Button>
                <p className="text-sm text-white/60">
                  Best for teams that want fewer, stronger outbound bets instead of another raw lead
                  tool.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
