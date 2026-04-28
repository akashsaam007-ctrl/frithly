import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";

const trustPoints = [
  "No annual contracts",
  "Money-back if <50% match your ICP",
  "First leads in 7 days",
];

export function Hero() {
  return (
    <section className="py-20 md:py-32">
      <Container width="narrow" className="text-center">
        <div className="mx-auto flex max-w-max items-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm">
          🟢 Now booking 3 design partners
        </div>

        <div className="mt-8 space-y-6">
          <h1>50 hyper-researched B2B leads. In your inbox. Every Monday.</h1>
          <p className="mx-auto max-w-narrow text-muted">
            Stop wasting your sales team&apos;s hours on lead research. We deliver 50 leads each
            week — fully researched, with personalized opening lines, ready to send.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <TrackedLink
              eventName="cta_clicked"
              eventProperties={{ destination: ROUTES.SAMPLE, location: "hero_primary" }}
              href={ROUTES.SAMPLE}
            >
              Get Free 5-Lead Sample
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
              See How It Works
            </TrackedLink>
          </Button>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm font-medium text-muted md:flex-row">
          {trustPoints.map((point, index) => (
            <div key={point} className="flex items-center gap-3">
              {index > 0 ? <span className="hidden md:inline">·</span> : null}
              <span>✓ {point}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
