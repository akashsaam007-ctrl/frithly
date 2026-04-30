import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BrandMark } from "@/components/ui/logo";
import { CALCOM_URL, ROUTES } from "@/lib/constants";

const ctaPoints = [
  "Tailored sample against your ICP",
  "First brief within 7 days",
  "No annual contract",
];

export function FinalCta() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="surface-card-dark animated-glow relative overflow-hidden px-5 py-8 sm:px-8 sm:py-10 md:px-12 md:py-14">
          <div className="absolute inset-y-0 right-[-8rem] hidden w-64 rounded-full bg-terracotta/20 blur-3xl lg:block" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-6">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <BrandMark className="h-14 w-14 rounded-[1.2rem] border-white/10 bg-white/5 p-1.5 shadow-none" imageClassName="h-full w-full rounded-[0.95rem]" />
                <div className="section-eyebrow border-white/10 bg-white/5 text-terracotta">
                  Want to see the brief first?
                </div>
              </div>
              <div className="space-y-5">
                <h2 className="section-title text-white">
                  Start with a sample. Move to a plan when the output feels right.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                  The fastest way to evaluate Frithly is to see one brief take shape against your
                  market. Request the sample if you want proof first, or book a short call if you
                  already know your team needs a better weekly outbound rhythm.
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
              <Button asChild size="lg" className="w-full">
                <Link href={ROUTES.SAMPLE}>
                  <span className="inline-flex items-center gap-2">
                    Get a free 5-lead sample
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full">
                <Link href={CALCOM_URL} rel="noreferrer" target="_blank">
                  Book a 15-minute demo
                </Link>
              </Button>
              <p className="text-sm text-white/60">
                Best for teams that want to buy finished weekly output, not manage another tool.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
