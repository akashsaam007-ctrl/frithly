import Link from "next/link";
import { Fraunces } from "next/font/google";
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
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Compass,
  FileCheck2,
  Filter,
  Globe2,
  Layers3,
  MailCheck,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users2,
} from "lucide-react";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const heroSignals = [
  "Reviewed weekly cohorts",
  "Founder-aware targeting",
  "SMTP-safe prioritization",
  "Outreach-ready delivery",
];

const sampleCohort = [
  {
    company: "Northstar Digital",
    note: "Founder posted about CRM migration and hiring outbound support.",
    owner: "Olivia Hart, Founder",
  },
  {
    company: "Beacon Studio",
    note: "Recently expanded into the UK and added a first RevOps hire.",
    owner: "Samir Clarke, Commercial Director",
  },
  {
    company: "Alta Growth",
    note: "Demand-gen team is active again after a new service launch.",
    owner: "Nina Brooks, Head of Growth",
  },
];

const trustStats = [
  { label: "Delivery rhythm", value: "Every Monday" },
  { label: "Opportunity posture", value: "Reviewed before release" },
  { label: "Routing posture", value: "SMTP-safe first" },
  { label: "Targeting posture", value: "Founder-aware" },
];

const comparisonRows = [
  {
    frithly: "Reviewed opportunities ranked against ICP fit, founder relevance, and routing quality.",
    label: "What reaches the rep",
    traditional: "A raw lead list that still needs cleanup, context gathering, and triage.",
  },
  {
    frithly: "A real reason to contact now, not just a contact record.",
    label: "Why-now context",
    traditional: "Little or no commercial timing signal attached to the account.",
  },
  {
    frithly: "SMTP-safe prioritization before a cohort is released.",
    label: "Delivery readiness",
    traditional: "Routing issues discovered after the team already starts sending.",
  },
  {
    frithly: "Founder-aware targeting that helps teams focus on the right conversations.",
    label: "Decision-maker clarity",
    traditional: "Generic role data with no confidence in who actually matters.",
  },
];

const workflowSteps = [
  {
    body: "We map ICP shape, geography, exclusions, and what a commercially interesting company actually looks like for your motion.",
    icon: Compass,
    label: "Brief alignment",
    title: "Turn the ICP into a working outbound brief.",
  },
  {
    body: "Frithly researches throughout the week, layering service fit, company context, founder signals, and account timing.",
    icon: Search,
    label: "Research layer",
    title: "Find signal before the queue gets noisy.",
  },
  {
    body: "The queue is narrowed through recommendation review, routing confidence, and founder relevance so weak opportunities stay buried.",
    icon: Filter,
    label: "Quality control",
    title: "Filter for what is believable, routeable, and worth attention.",
  },
  {
    body: "Every Monday the strongest reviewed opportunities are packaged with context and released as a ready-to-work cohort.",
    icon: Radar,
    label: "Weekly release",
    title: "Ship a finished intelligence brief, not another export.",
  },
];

const weeklyTimeline = [
  {
    copy: "Cohort finalized against the live brief and ranked for release.",
    day: "Monday",
    icon: CalendarDays,
  },
  {
    copy: "Founder notes and outreach direction are refined on the strongest accounts.",
    day: "Tuesday",
    icon: Users2,
  },
  {
    copy: "SMTP-aware routing and export prep are reviewed before delivery.",
    day: "Wednesday",
    icon: MailCheck,
  },
  {
    copy: "QA confirms confidence, account fit, and delivery readiness.",
    day: "Thursday",
    icon: FileCheck2,
  },
  {
    copy: "Outcome signals are folded back into the next cycle so delivery keeps improving.",
    day: "Friday",
    icon: Layers3,
  },
];

const programModules = [
  {
    body: "Define opportunity volume, market focus, and the weekly release shape around your actual outbound goals.",
    title: "Volume and coverage",
  },
  {
    body: "Add deeper founder intelligence, heavier routing discipline, or tighter review depth when the motion needs it.",
    title: "Quality controls",
  },
  {
    body: "Choose whether Frithly stops at intelligence delivery or extends into draft support and rollout guidance.",
    title: "Execution support",
  },
];

const samplePrograms = [
  {
    details: "40 to 60 reviewed opportunities per month, UK-only, high-fit service accounts.",
    label: "Focused weekly brief",
    price: "Starting from EUR 499/month",
  },
  {
    details: "80 to 120 reviewed opportunities per month with broader UK + EU coverage and stronger founder context.",
    label: "Growth program",
    price: "Often EUR 1,100 to EUR 1,500/month",
  },
  {
    details: "Multi-market delivery with heavier review depth, founder priority, and export support.",
    label: "Expanded coverage",
    price: "Scoped consultatively",
  },
];

const trustSignals = [
  {
    body: "Opportunities are reviewed before release so teams inherit judgment, not just access.",
    icon: ShieldCheck,
    title: "Reviewed weekly",
  },
  {
    body: "SMTP-safe prioritization stays inside the workflow instead of being treated as an afterthought.",
    icon: MailCheck,
    title: "Reputation-conscious routing",
  },
  {
    body: "Founder relevance and decision-maker confidence help the queue stay commercially useful.",
    icon: Target,
    title: "Better target selection",
  },
  {
    body: "Weekly QA keeps the operating rhythm disciplined enough to trust across campaigns and handoffs.",
    icon: BadgeCheck,
    title: "Operational consistency",
  },
];

const fitProfiles = [
  "Founder-led outbound teams that know research debt is slowing pipeline creation.",
  "Agencies that want a tighter weekly prospecting rhythm without building an internal research operation.",
  "Lean SDR motions that need stronger opportunity quality before more volume makes sense.",
];

function SectionIntro({
  copy,
  eyebrow,
  title,
  align = "left",
}: {
  align?: "center" | "left";
  copy: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className={cn("space-y-5", align === "center" && "mx-auto max-w-3xl text-center")}>
      <div className="section-eyebrow">{eyebrow}</div>
      <h2
        className={cn(
          "section-title text-balance text-ink",
          displayFont.className,
          align === "center" && "mx-auto max-w-4xl",
          align === "left" && "max-w-4xl",
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "section-copy max-w-2xl",
          align === "center" && "mx-auto",
        )}
      >
        {copy}
      </p>
    </div>
  );
}

export function PlatformHomepage() {
  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-border/70 py-12 sm:py-16 lg:py-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-terracotta/45 to-transparent" />
        <div className="absolute left-[-9rem] top-8 h-72 w-72 rounded-full bg-terracotta/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />

        <Container className="relative grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="space-y-8">
            <Badge className="w-fit border-border/70 bg-white/85 text-terracotta shadow-sm" variant="outline">
              Premium curated outbound intelligence
            </Badge>

            <div className="space-y-6">
              <h1
                className={cn(
                  "max-w-[11ch] text-balance text-[3.15rem] leading-[0.9] text-ink sm:text-[4.45rem] lg:text-[5.85rem]",
                  displayFont.className,
                )}
              >
                Curated Outbound Intelligence Delivered Weekly.
              </h1>
              <p className="section-copy max-w-2xl md:text-[1.08rem]">
                Frithly helps outbound teams discover higher-confidence opportunities through
                reviewed intelligence, founder-aware targeting, SMTP-safe prioritization, and a
                calm weekly delivery rhythm.
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
                <Link href="#workflow">Explore the Delivery Model</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {heroSignals.map((signal) => (
                <div key={signal} className="metric-chip">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card animated-glow relative overflow-hidden border-terracotta/15">
            <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(212,98,58,0.12),transparent)]" />

            <div className="relative border-b border-border/70 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                    Sample Monday release
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-[2rem]">
                    The brief feels ready before your team opens it.
                  </h2>
                  <p className="text-sm leading-7 text-muted">
                    Reviewed accounts, founder context, routing confidence, and why-now notes are
                    packaged together so the first touch does not start with more research work.
                  </p>
                </div>
                <BrandMark
                  className="h-14 w-14 rounded-[1.2rem] border-border/70 bg-white/95 p-1.5 shadow-sm"
                  imageClassName="h-full w-full rounded-[0.95rem]"
                  priority
                />
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Reviewed opportunities", value: "42" },
                  { label: "Founder-priority accounts", value: "14" },
                  { label: "SMTP-safe routes ready", value: "9" },
                  { label: "Weekly delivery rhythm", value: "Monday" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/70 bg-stone-50 px-4 py-4"
                  >
                    <div className="text-2xl font-semibold tracking-tight text-ink">{stat.value}</div>
                    <div className="mt-1 text-sm text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-white">
                <div className="border-b border-border/70 px-4 py-4 sm:px-5">
                  <div className="text-sm font-semibold text-ink">Inside the cohort</div>
                  <div className="text-sm text-muted">
                    A realistic slice of what gets packaged into weekly delivery
                  </div>
                </div>

                <div className="divide-y divide-border/70">
                  {sampleCohort.map((account) => (
                    <div
                      key={account.owner}
                      className="grid gap-2 px-4 py-4 sm:px-5 md:grid-cols-[0.9fr_1.1fr] md:items-center"
                    >
                      <div>
                        <div className="font-semibold text-ink">{account.owner}</div>
                        <div className="text-sm text-muted">{account.company}</div>
                      </div>
                      <div className="text-sm leading-7 text-muted">{account.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-6 sm:py-8">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {trustStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.35rem] border border-border/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur"
              >
                <div className="text-lg font-semibold text-ink">{stat.value}</div>
                <div className="mt-1 text-sm text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section id="why-outbound-fails" className="py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Why quality wins"
              title="Traditional outbound fails because the research burden never really disappears."
              copy="Most teams are not short on access to leads. They are short on context, timing, routing confidence, and clarity about who is actually worth contacting now. That is the gap Frithly is built to close."
            />

            <div className="rounded-[1.75rem] border border-border/70 bg-white/85 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
                  <Target className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                    The real cost
                  </div>
                  <p className="text-base leading-8 text-muted">
                    Reps spend their best hours cleaning lists, checking routes, and inventing
                    personalization from weak signals. More tooling does not solve that. Better
                    weekly output does.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card overflow-hidden border-transparent bg-stone-100/90">
              <div className="border-b border-stone-200 px-5 py-5 sm:px-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                  Traditional outbound
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-ink">
                  Bigger lists, weaker confidence.
                </h3>
              </div>

              <div className="divide-y divide-stone-200">
                {comparisonRows.map((row) => (
                  <div key={row.label} className="space-y-2 px-5 py-5 sm:px-6">
                    <div className="text-sm font-semibold text-ink">{row.label}</div>
                    <p className="text-sm leading-7 text-muted md:text-base">{row.traditional}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card overflow-hidden border-terracotta/30">
              <div className="border-b border-border/70 bg-[linear-gradient(135deg,rgba(212,98,58,0.08),rgba(255,255,255,0.96))] px-5 py-5 sm:px-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                  Frithly
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-ink">
                  Fewer opportunities, stronger reasons to act.
                </h3>
              </div>

              <div className="divide-y divide-border/70">
                {comparisonRows.map((row) => (
                  <div key={row.label} className="space-y-2 px-5 py-5 sm:px-6">
                    <div className="text-sm font-semibold text-ink">{row.label}</div>
                    <p className="text-sm leading-7 text-muted md:text-base">{row.frithly}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="workflow" className="border-y border-border/70 bg-white/60 py-16 sm:py-20 lg:py-24">
        <Container className="space-y-12">
          <SectionIntro
            align="center"
            eyebrow="Operating model"
            title="A living outbound system, but presented with the calm of a service."
            copy="Frithly is not instant automation. It is a disciplined weekly workflow that turns a brief into stronger outbound opportunities through research, filtering, review, and delivery."
          />

          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="grid gap-5">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="surface-card flex gap-4 p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        Step {index + 1} · {step.label}
                      </div>
                      <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                      <p className="text-sm leading-7 text-muted md:text-base">{step.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="surface-card overflow-hidden border-terracotta/20">
              <div className="border-b border-border/70 bg-[linear-gradient(180deg,rgba(212,98,58,0.08),rgba(255,255,255,0.92))] px-5 py-5 sm:px-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                  What changes through the flow
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-ink">
                  Signal becomes intelligence because the queue keeps narrowing.
                </h3>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6">
                {[
                  "Raw accounts become commercially useful only after enrichment and context.",
                  "Founder relevance raises confidence on who should be contacted first.",
                  "SMTP-safe prioritization removes a chunk of avoidable delivery waste.",
                  "Review keeps the final cohort deliberately scarce, not inflated for volume.",
                ].map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-border/70 bg-stone-50 px-4 py-4 text-sm leading-7 text-muted"
                  >
                    {point}
                  </div>
                ))}

                <div className="rounded-[1.5rem] border border-border/70 bg-ink px-5 py-5 text-white">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    The outcome
                  </div>
                  <p className="mt-3 text-base leading-8 text-white/75">
                    Your team starts the week with a reviewed outbound brief that already contains
                    targeting logic, delivery discipline, and account-level context.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container className="space-y-12">
          <SectionIntro
            align="center"
            eyebrow="Weekly delivery system"
            title="The delivery model is intentionally high-touch."
            copy="Frithly is designed to feel operationally disciplined. Each day plays a role in keeping the cohort selective, reviewable, and useful before it lands with the team."
          />

          <div className="grid gap-5 lg:grid-cols-5">
            {weeklyTimeline.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.day}
                  className="surface-card h-full p-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="mt-5 text-lg font-semibold text-ink">{item.day}</div>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section id="icp-demo" className="border-y border-border/70 bg-white/60 py-16 sm:py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionIntro
            eyebrow="Interactive ICP demo"
            title="Let the intelligence system respond to a real targeting brief."
            copy="The demo is not here to look flashy. It is here to help buyers feel the difference between generic lead access and a more selective, better-structured outbound operating model."
          />

          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <div className="space-y-5">
              <div className="surface-card p-5 sm:p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                  What to test
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "Choose the industry, geography, and opportunity volume you actually care about.",
                    "Watch how opportunity quality improves as founder, routing, and recommendation layers appear.",
                    "Use the output as a preview of the operating logic, not as a promise of instant volume.",
                  ].map((point) => (
                    <div key={point} className="flex gap-3 rounded-2xl bg-stone-50 px-4 py-4">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                      <p className="text-sm leading-7 text-muted">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50/70 px-5 py-5 text-sm leading-7 text-emerald-900">
                The strongest part of the demo is not the UI. It is the difference in how the
                system narrows the queue before calling something ready.
              </div>
            </div>

            <div className="surface-card overflow-hidden border-terracotta/15 bg-[#f8f4ec] p-2 shadow-[0_24px_70px_rgba(26,26,26,0.08)]">
              <IcpDemoExperience />
            </div>
          </div>
        </Container>
      </section>

      <section id="program-builder" className="py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Custom program design"
              title="Programs should feel consultative, not like software plans."
              copy="Frithly starts with a core operating model and then adapts around opportunity volume, geography coverage, review depth, founder priority, and the level of rollout support you want inside the weekly cycle."
            />

            <div className="grid gap-4">
              {programModules.map((module) => (
                <div key={module.title} className="surface-card p-5 sm:p-6">
                  <h3 className="text-xl font-semibold text-ink">{module.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted md:text-base">{module.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card overflow-hidden border-terracotta/20">
            <div className="border-b border-border/70 bg-[linear-gradient(135deg,rgba(212,98,58,0.08),rgba(255,255,255,0.95))] px-5 py-5 sm:px-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                Frithly Core Intelligence Program
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-tight text-ink">
                Starting from EUR 499/month
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">
                The shape changes with coverage, review depth, and support needs, but the promise
                stays the same: better outbound opportunities delivered in a cleaner weekly rhythm.
              </p>
            </div>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              {samplePrograms.map((program) => (
                <div
                  key={program.label}
                  className="rounded-[1.4rem] border border-border/70 bg-white px-4 py-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-lg font-semibold text-ink">{program.label}</div>
                    <div className="text-sm font-semibold uppercase tracking-[0.16em] text-terracotta">
                      {program.price}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">{program.details}</p>
                </div>
              ))}

              <div className="rounded-[1.5rem] border border-border/70 bg-stone-50 px-5 py-5">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                  <Globe2 className="h-4 w-4" aria-hidden="true" />
                  Included in every program
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    "Reviewed opportunity queue",
                    "Founder-aware targeting",
                    "SMTP-safe prioritization",
                    "Weekly delivery rhythm",
                    "Account-level context",
                    "Export-ready handoff",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm text-ink"
                    >
                      {item}
                    </div>
                  ))}
                </div>
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
                  <Link href="#roi-experience">Model the ROI</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="roi-experience" className="border-y border-border/70 bg-white/60 py-16 sm:py-20 lg:py-24">
        <Container className="space-y-10">
          <SectionIntro
            eyebrow="ROI simulator"
            title="The cost of weak outbound is usually hidden inside wasted effort."
            copy="Frithly works best when the team is already spending money and time on outbound, but too much of that effort is being absorbed by noise, weak routing, and low-confidence targeting."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card overflow-hidden border-transparent bg-stone-100/90">
              <div className="border-b border-stone-200 px-5 py-5 sm:px-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                  Typical outbound
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-ink">More activity, weaker signal.</h3>
              </div>
              <div className="space-y-3 px-5 py-5 sm:px-6">
                {[
                  "Large raw lead lists still require manual filtering and cleanup.",
                  "Generic contact data creates weaker first touches and slower rep ramp time.",
                  "Routing issues are discovered after the market has already seen the outreach.",
                ].map((point) => (
                  <div key={point} className="rounded-2xl bg-white/80 px-4 py-4 text-sm leading-7 text-muted">
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card overflow-hidden border-terracotta/25">
              <div className="border-b border-border/70 bg-[linear-gradient(135deg,rgba(212,98,58,0.08),rgba(255,255,255,0.96))] px-5 py-5 sm:px-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                  Frithly
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-ink">Smaller cohorts, stronger odds.</h3>
              </div>
              <div className="space-y-3 px-5 py-5 sm:px-6">
                {[
                  "The queue is reviewed before release so reps inherit better decisions, not just more records.",
                  "Founder-aware targeting and timing context improve conversation quality before volume scales.",
                  "SMTP-safe prioritization helps protect delivery quality instead of treating it as post-send cleanup.",
                ].map((point) => (
                  <div key={point} className="rounded-2xl bg-stone-50 px-4 py-4 text-sm leading-7 text-muted">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card overflow-hidden border-terracotta/15 bg-[#f8f4ec] p-2 shadow-[0_24px_70px_rgba(26,26,26,0.08)]">
            <RoiCalculatorExperience />
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <SectionIntro
              eyebrow="Operational trust"
              title="Trust should come from operational depth, not vanity metrics."
              copy="Frithly is easiest to believe when the service makes its operating discipline obvious: reviewed delivery, cleaner targeting, better routing habits, and a weekly cadence teams can actually plan around."
            />

            <div className="rounded-[1.75rem] border border-border/70 bg-ink px-6 py-6 text-white shadow-[0_24px_70px_rgba(16,16,16,0.18)]">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                Best fit
              </div>
              <div className="mt-4 space-y-3">
                {fitProfiles.map((profile) => (
                  <div key={profile} className="flex gap-3 rounded-2xl bg-white/5 px-4 py-4">
                    <Sparkles className="mt-1 h-4 w-4 shrink-0 text-terracotta" aria-hidden="true" />
                    <p className="text-sm leading-7 text-white/75">{profile}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {trustSignals.map((signal) => {
                const Icon = signal.icon;

                return (
                  <div key={signal.title} className="surface-card h-full p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-ink">{signal.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted">{signal.body}</p>
                  </div>
                );
              })}
            </div>

            <div className="surface-card overflow-hidden border-terracotta/20">
              <div className="border-b border-border/70 bg-[linear-gradient(135deg,rgba(212,98,58,0.08),rgba(255,255,255,0.96))] px-5 py-5 sm:px-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                  What ships weekly
                </div>
                <h3 className="mt-2 text-2xl font-semibold text-ink">
                  A finished delivery layer, not just research access.
                </h3>
              </div>
              <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 sm:px-6">
                {[
                  "Reviewed opportunity cohort",
                  "Founder context and targeting notes",
                  "SMTP-safe prioritization cues",
                  "Why-now signals and account timing",
                  "Outreach-ready export structure",
                  "Weekly handoff consistency",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/70 bg-stone-50 px-4 py-4 text-sm text-ink"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="faq" className="border-y border-border/70 bg-white/60 py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-8 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
          <SectionIntro
            eyebrow="FAQ"
            title="Clear answers for teams deciding whether Frithly fits."
            copy="The best buyers do not want vague claims. They want to understand how the service works, where the quality comes from, and whether it will fit the motion they are already running."
          />

          <div className="surface-card overflow-hidden px-5 py-2 sm:px-6">
            <Accordion type="single" collapsible>
              {platformFaqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`} className="border-border/70">
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
                    Final call to action
                  </div>
                </div>

                <div className="space-y-5">
                  <h2 className={cn("section-title text-white", displayFont.className)}>
                    Design Your Outbound Intelligence Program.
                  </h2>
                  <p className="max-w-2xl text-base leading-8 text-white/72 md:text-lg">
                    Every Frithly program is shaped around your ICP, delivery cadence, geography,
                    review depth, and the level of outbound support your team actually needs.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    "Reviewed weekly delivery",
                    "Founder-aware targeting",
                    "SMTP-safe prioritization",
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
                      Apply for a Campaign
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full">
                  <Link href="#icp-demo">Explore the demo first</Link>
                </Button>
                <p className="text-sm text-white/60">
                  Best for teams that want stronger weekly output, not another tool to manage.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
