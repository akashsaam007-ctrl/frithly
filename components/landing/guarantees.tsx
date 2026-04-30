import { ChevronDown, Handshake, RefreshCcw, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const guarantees = [
  {
    description:
      "If under half the leads match your ICP, we refund the month. Clear promise, no argument loop.",
    icon: ShieldCheck,
    title: "50% match guarantee",
  },
  {
    description:
      "If no meeting comes from the list in the first 30 days, we extend the service for a month.",
    icon: RefreshCcw,
    title: "First meeting promise",
  },
  {
    description:
      "Month to month, no annual lock-in, no inflated implementation fee just to get started.",
    icon: Handshake,
    title: "No lock-in",
  },
];

export function Guarantees() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <Container className="space-y-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-eyebrow">Commercial confidence</div>
          <h2 className="section-title mt-5">Strong guarantees because this should feel low-risk.</h2>
        </div>

        <div className="space-y-3 lg:hidden">
          {guarantees.map((guarantee) => {
            const Icon = guarantee.icon;

            return (
              <details key={guarantee.title} className="group surface-card overflow-hidden p-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="text-base font-semibold text-ink">{guarantee.title}</div>
                  </div>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden px-5 pb-5 text-sm leading-7 text-muted">
                    {guarantee.description}
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {guarantees.map((guarantee, index) => {
            const Icon = guarantee.icon;

            return (
              <div
                key={guarantee.title}
                className={cn(
                  "surface-card h-full p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-7",
                  index === 1 && "animated-float-delayed",
                )}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-ink">{guarantee.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted md:text-base">
                  {guarantee.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
