import { ArrowRight, BadgeCheck, Clock3, Radar, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BrandMark } from "@/components/ui/logo";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const trustPoints = [
  "50 researched accounts every Monday",
  "Verified contacts with live buying context",
  "Message angles your reps can use immediately",
];

const leadPreview = [
  {
    company: "NorthstarIQ",
    note: "Hiring 3 AEs after series A close",
    person: "Maya Brooks, Revenue Ops Lead",
  },
  {
    company: "BeaconForge",
    note: "Posted about stack sprawl on LinkedIn 2 days ago",
    person: "Liam Clarke, Founder",
  },
  {
    company: "Vendora",
    note: "New VP Sales joined, first outbound team build",
    person: "Ana Ribeiro, GTM Director",
  },
];

const proofStats = [
  { label: "Research window", value: "7 days" },
  { label: "Openers per lead", value: "1 to 3" },
  { label: "Delivery rhythm", value: "Weekly" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-terracotta/50 to-transparent" />
      <div className="absolute left-[-8rem] top-8 h-72 w-72 rounded-full bg-terracotta/10 blur-3xl" />
      <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />

      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[1.12fr_0.88fr] lg:items-center xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-8 animated-fade-up">
            <div className="space-y-5">
              <div className="section-eyebrow">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Now booking 3 design partners
              </div>

              <div className="space-y-5">
                <h1 className="section-title max-w-[13ch] text-balance">
                  Weekly B2B lead intelligence your reps can turn into pipeline.
                </h1>
                <p className="section-copy max-w-xl lg:max-w-2xl">
                  Frithly delivers a Monday-ready brief of researched accounts, verified contacts,
                  and why-now messaging angles. Your team stops stitching together Apollo tabs,
                  enrichment tools, and manual notes, and starts the week with leads that already
                  have context.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={ROUTES.SAMPLE}>
                  <span className="inline-flex items-center gap-2">
                    Get Free 5-Lead Sample
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href={ROUTES.HOW_IT_WORKS}>See the workflow</Link>
              </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {trustPoints.map((point, index) => (
                <div
                  key={point}
                  className={cn("metric-chip", index === 2 && "hidden sm:inline-flex")}
                >
                  <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {proofStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/70 bg-white/80 px-4 py-4 shadow-sm backdrop-blur sm:px-5"
                >
                  <div className="text-2xl font-bold tracking-tight text-ink">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card animated-float animated-glow overflow-hidden">
            <div className="border-b border-border/70 bg-ink px-5 py-5 text-white sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-white/60">
                    Monday pipeline brief
                  </div>
                  <div className="mt-2 text-xl font-semibold sm:text-2xl">
                    50 researched leads, prioritized and ready for outreach.
                  </div>
                </div>
                <BrandMark
                  className="h-14 w-14 rounded-[1.1rem] border-white/10 bg-white/5 p-2 shadow-none sm:h-16 sm:w-16 sm:rounded-[1.35rem]"
                  imageClassName="h-full w-full rounded-[1rem]"
                  priority
                />
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6 md:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-stone-50 p-4 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Radar className="h-4 w-4 text-terracotta" aria-hidden="true" />
                    Why now signals
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Hiring moves, GTM changes, recent content, and stack friction surfaced before
                    a rep writes the first email.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-stone-50 p-4 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Clock3 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                    Delivery cadence
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Monday delivery on every plan, plus a mid-week refresh on Growth so your
                    pipeline does not stall after one send.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-white">
                <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <div className="text-sm font-semibold text-ink">Lead brief preview</div>
                    <div className="text-sm text-muted">
                      A slice of the weekly brief your team actually receives
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    ready to send
                  </div>
                </div>
                <div className="divide-y divide-border/70">
                  {leadPreview.map((lead, index) => (
                    <div
                      key={lead.person}
                      className={`grid gap-2 px-4 py-4 sm:px-5 md:grid-cols-[1fr_auto] md:items-center ${
                        index === 2 ? "hidden sm:grid" : ""
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-ink">{lead.person}</div>
                        <div className="text-sm text-muted">{lead.company}</div>
                      </div>
                      <div className="text-sm text-muted md:max-w-[18rem] md:text-right">
                        {lead.note}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
