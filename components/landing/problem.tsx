import { ArrowDownRight, CircleOff, TimerReset, TriangleAlert } from "lucide-react";
import { Container } from "@/components/ui/container";

const painCards = [
  {
    icon: CircleOff,
    stat: "Low signal quality",
    text: "List vendors stop at names and titles, so your team still has to guess who is actually worth contacting.",
  },
  {
    icon: TimerReset,
    stat: "10+ hours lost",
    text: "SDRs burn their best hours researching context instead of getting into market and generating pipeline.",
  },
  {
    icon: TriangleAlert,
    stat: "Reply rates collapse",
    text: "When there is no real trigger or angle, outbound becomes volume theatre and the market tunes you out.",
  },
];

const painPoints = [
  "Half the emails bounce or need manual verification before the first send.",
  "Every lead looks identical, with no current trigger, no story, and no buying context.",
  "Teams pay for data tools, then pay again in rep time to transform raw data into usable outreach.",
  "Pipeline reviews become debates about volume, not confidence in who is being targeted.",
];

export function Problem() {
  return (
    <section id="problem" className="bg-ink py-24 text-white">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-6">
          <div className="section-eyebrow border-white/10 bg-white/5 text-terracotta">
            The expensive bottleneck
          </div>
          <div className="space-y-5">
            <h2 className="section-title max-w-[12ch] text-white">
              Your outbound engine is still running on research debt.
            </h2>
            <p className="section-copy max-w-xl text-white/70">
              Apollo, ZoomInfo, and enrichment tools are useful. They just are not the final
              product your reps need. Frithly exists in the gap between raw data access and real
              outreach readiness.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-terracotta/15 p-3 text-terracotta">
                <ArrowDownRight className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/50">
                  What this costs
                </div>
                <p className="text-lg leading-8 text-white/80">
                  More software spend, slower ramp time, and outreach that feels generic the moment
                  it hits the inbox.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-3">
            {painCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.stat}
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-terracotta">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="mt-5 text-xl font-semibold text-white">{card.stat}</div>
                  <p className="mt-3 text-sm leading-7 text-white/65">{card.text}</p>
                </div>
              );
            })}
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white p-6 text-ink shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
              The pattern we keep seeing
            </div>
            <div className="mt-5 grid gap-4">
              {painPoints.map((point) => (
                <div key={point} className="flex gap-3 rounded-2xl bg-stone-50 px-4 py-4">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-terracotta" aria-hidden="true" />
                  <p className="text-sm leading-7 text-muted md:text-base">{point}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-lg font-medium text-ink">
              Frithly turns that messy middle layer into one weekly operating rhythm your team can
              trust.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
