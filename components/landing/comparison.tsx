import { Check, Minus } from "lucide-react";
import { Container } from "@/components/ui/container";

const rows = [
  {
    basic: "Name, title, company",
    frithly: "Name, title, company, and who should actually be contacted first",
    label: "Core contact data",
  },
  {
    basic: "Raw email field",
    frithly: "Verified contact plus confidence on deliverability",
    label: "Email quality",
  },
  {
    basic: "Generic filter output",
    frithly: "Why-now trigger, current context, and account timing",
    label: "Timing intelligence",
  },
  {
    basic: "No guidance for messaging",
    frithly: "One to three opener angles based on actual signals",
    label: "Message readiness",
  },
  {
    basic: "Rep still researches manually",
    frithly: "Rep can open sequence drafts and start sending",
    label: "Operational impact",
  },
];

export function Comparison() {
  return (
    <section className="py-24">
      <Container className="space-y-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-eyebrow">Lists versus intelligence</div>
          <h2 className="section-title mt-5">Same market, completely different output.</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            Most tools stop at access. Frithly keeps going until the lead is ready for a rep to use
            in the real world.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card overflow-hidden border-transparent bg-stone-100/90">
            <div className="border-b border-stone-200 px-6 py-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                Traditional lead data tools
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-ink">You still have work to do</h3>
            </div>

            <div className="divide-y divide-stone-200">
              {rows.map((row) => (
                <div key={row.label} className="space-y-2 px-6 py-5">
                  <div className="text-sm font-semibold text-ink">{row.label}</div>
                  <div className="flex items-start gap-3 text-sm text-muted md:text-base">
                    <Minus className="mt-1 h-4 w-4 text-stone-400" aria-hidden="true" />
                    <span>{row.basic}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card overflow-hidden border-terracotta/30">
            <div className="border-b border-border/70 bg-[linear-gradient(135deg,rgba(212,98,58,0.1),rgba(255,255,255,0.95))] px-6 py-5">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                Frithly weekly brief
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-ink">
                The rep opens the file and knows what to do next
              </h3>
            </div>

            <div className="divide-y divide-border/70">
              {rows.map((row) => (
                <div key={row.label} className="space-y-2 px-6 py-5">
                  <div className="text-sm font-semibold text-ink">{row.label}</div>
                  <div className="flex items-start gap-3 text-sm text-ink md:text-base">
                    <Check className="mt-1 h-4 w-4 text-terracotta" aria-hidden="true" />
                    <span>{row.frithly}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
