import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CALCOM_URL, ROUTES } from "@/lib/constants";

export function FinalCta() {
  return (
    <section className="bg-ink py-32 text-white">
      <Container width="narrow" className="space-y-8 text-center">
        <h2 className="text-white">Stop researching. Start selling.</h2>
        <p className="text-white/75">
          Your sales team is too expensive to be doing research that AI agents can do better. Get
          50 ready-to-send leads delivered every Monday.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <TrackedLink
              eventName="cta_clicked"
              eventProperties={{ destination: ROUTES.SAMPLE, location: "final_cta_primary" }}
              href={ROUTES.SAMPLE}
            >
              Get a Free 5-Lead Sample
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
              Book a 15-min Demo
            </TrackedLink>
          </Button>
        </div>
      </Container>
    </section>
  );
}
