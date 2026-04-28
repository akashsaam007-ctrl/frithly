import { ArrowRight, BadgeCheck, BrainCircuit, Clock3, Radar, Sparkles } from "lucide-react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";

const trustPoints = [
  "50 leads every Monday",
  "Verified contacts and live signals",
  "Three opener angles on Growth",
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
    <section className="relative overflow-hidden border-b border-border/60 py-16 md:py-20 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-terracotta/50 to-transparent" />
      <div className="absolute left-[-8rem] top-8 h-72 w-72 rounded-full bg-terracotta/10 blur-3xl" />
      <div className="absolute right-[-6rem] top-16 h-80 w-80 rounded-full bg-emerald-200/30 blur-3xl" />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8 animated-fade-up">
            <div className="space-y-5">
              <div className="section-eyebrow">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Now booking 3 design partners
              </div>

              <div className="space-y-5">
                <h1 className="section-title max-w-[12ch]">
                  Weekly B2B lead intelligence for teams that need signal, not spreadsheets.
                </h1>
                <p className="section-copy max-w-2xl">
                  Frithly delivers hyper-researched accounts, verified contacts, and personalized
                  opener angles to your inbox every Monday. Your reps stop digging through Apollo
                  tabs and start sending messages that actually make sense.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <TrackedLink
                  eventName="cta_clicked"
                  eventProperties={{ destination: ROUTES.SAMPLE, location: "hero_primary" }}
                  href={ROUTES.SAMPLE}
                >
                  <span className="inline-flex items-center gap-2">
                    Get Free 5-Lead Sample
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </TrackedLink>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <TrackedLink
                  eventName="cta_clicked"
                  eventProperties={{
                    destination: ROUTES.HOW_IT_WORKS,
                    location: "hero_secondary",
                  }}
                  href={ROUTES.HOW_IT_WORKS}
                >
                  See the workflow
                </TrackedLink>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {trustPoints.map((point) => (
                <div key={point} className="metric-chip">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {proofStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur"
                >
                  <div className="text-2xl font-bold tracking-tight text-ink">{stat.value}</div>
                  <div className="mt-1 text-sm text-muted">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card animated-float animated-glow overflow-hidden">
            <div className="border-b border-border/70 bg-ink px-6 py-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-white/60">
                    Monday intelligence brief
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    50 researched leads, prioritized and ready to send
                  </div>
                </div>
                <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 lg:block">
                  <BrainCircuit className="h-7 w-7 text-terracotta" aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="space-y-6 p-6 md:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-stone-50 p-4 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Radar className="h-4 w-4 text-terracotta" aria-hidden="true" />
                    Why now signals
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Hiring momentum, recent content, GTM change, and stack friction surfaced per
                    account before your team writes a single line.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-stone-50 p-4 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <Clock3 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                    Delivery cadence
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Monday batch delivery, with Growth refreshes mid-week so your pipeline does not
                    go stale after one send.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-white">
                <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                  <div>
                    <div className="text-sm font-semibold text-ink">Live lead preview</div>
                    <div className="text-sm text-muted">Exactly how Frithly packages weekly output</div>
                  </div>
                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    ready to send
                  </div>
                </div>
                <div className="divide-y divide-border/70">
                  {leadPreview.map((lead) => (
                    <div key={lead.person} className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
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
