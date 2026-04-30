import { ChevronDown, Inbox, PhoneCall, Search } from "lucide-react";
import { Container } from "@/components/ui/container";

const steps = [
  {
    description:
      "We map your ICP, buying signals, exclusions, and tone so the weekly brief matches the market you actually want to win.",
    icon: PhoneCall,
    title: "Align the targeting",
  },
  {
    description:
      "Frithly researches throughout the week, validates contact quality, and prioritizes who is worth reaching out to now.",
    icon: Search,
    title: "Research the market",
  },
  {
    description:
      "Every Monday your team gets a finished brief with context, trigger signals, and opener angles ready to use.",
    icon: Inbox,
    title: "Ship to the team",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20 lg:py-24">
      <Container className="space-y-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-eyebrow">Operating model</div>
          <h2 className="section-title mt-5">A weekly research system, not another tool to babysit.</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            You do one alignment pass up front. Frithly handles the recurring research workload and
            turns it into a delivery rhythm your reps can actually rely on.
          </p>
        </div>

        <div className="space-y-3 lg:hidden">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <details key={step.title} className="group surface-card overflow-hidden p-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        Step {index + 1}
                      </div>
                      <div className="mt-1 text-base font-semibold text-ink">{step.title}</div>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden px-5 pb-5 text-sm leading-7 text-muted">
                    {step.description}
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        <div className="relative hidden gap-6 lg:grid lg:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-14 hidden h-px bg-gradient-to-r from-transparent via-terracotta/30 to-transparent lg:block" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="surface-card relative h-full p-5 sm:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="rounded-full border border-border/70 bg-stone-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Step {index + 1}
                  </div>
                </div>

                <h3 className="mt-6 text-2xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted md:text-base">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="surface-card overflow-hidden">
          <div className="grid gap-6 px-5 py-6 sm:px-7 sm:py-7 md:grid-cols-[0.9fr_1.1fr] md:px-8">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                Time to value
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">Your first brief lands within 7 days of signup.</h3>
            </div>
            <p className="text-sm leading-7 text-muted md:text-base">
              That means your first week goes into alignment, not waiting on a rollout or building
              another enrichment workflow from scratch.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
