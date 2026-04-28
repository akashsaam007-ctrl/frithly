import { ArrowRight, CheckCircle2 } from "lucide-react";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CALCOM_URL, ROUTES } from "@/lib/constants";

const ctaPoints = [
  "Weekly delivery cadence",
  "Researched context per lead",
  "Flexible monthly pricing",
];

export function FinalCta() {
  return (
    <section className="py-24">
      <Container>
        <div className="surface-card-dark animated-glow relative overflow-hidden px-8 py-10 md:px-12 md:py-14">
          <div className="absolute inset-y-0 right-[-8rem] hidden w-64 rounded-full bg-terracotta/20 blur-3xl lg:block" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-6">
              <div className="section-eyebrow border-white/10 bg-white/5 text-terracotta">
                Ready when your team is
              </div>
              <div className="space-y-5">
                <h2 className="section-title text-white">
                  Stop paying reps to do research. Start handing them better conversations.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                  If your outbound team already has enough tools, Frithly is the layer that turns
                  those tools into focused weekly action.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {ctaPoints.map((point) => (
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
              <Button asChild size="lg">
                <TrackedLink
                  eventName="cta_clicked"
                  eventProperties={{ destination: ROUTES.SAMPLE, location: "final_cta_primary" }}
                  href={ROUTES.SAMPLE}
                >
                  <span className="inline-flex items-center gap-2">
                    Get a free 5-lead sample
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </TrackedLink>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <TrackedLink
                  eventName="cta_clicked"
                  eventProperties={{ destination: CALCOM_URL, location: "final_cta_secondary" }}
                  href={CALCOM_URL}
                  rel="noreferrer"
                  target="_blank"
                >
                  Book a 15-minute demo
                </TrackedLink>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
