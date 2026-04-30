import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Sparkles } from "lucide-react";
import { SectionViewEvent } from "@/components/analytics/section-view-event";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CALCOM_URL, PLANS, ROUTES } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

const pricingPlans = [
  {
    buttonLabel: "Talk to Sales",
    description:
      "For lean founder-led teams that need quality pipeline without building a research function.",
    fit: "Best when founder selling still drives pipeline.",
    href: CALCOM_URL,
    note: "50 leads every Monday",
    plan: PLANS.STARTER,
  },
  {
    buttonLabel: "Talk to Sales",
    description:
      "For outbound teams that need deeper research, sharper timing, and more angle variety.",
    fit: "Best when reps need more context and more volume.",
    href: CALCOM_URL,
    note: "100 leads, plus refreshes",
    plan: PLANS.GROWTH,
  },
  {
    buttonLabel: "Talk to Sales",
    description:
      "For larger GTM motions with multiple ICPs, multi-team coordination, and custom support.",
    fit: "Best when your motion needs custom planning and rollout support.",
    href: CALCOM_URL,
    note: "Custom rollout",
    plan: PLANS.SCALE,
  },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24">
      <Container className="space-y-12">
        <SectionViewEvent
          name="pricing_section_viewed"
          oncePerSessionKey="pricing-section-viewed"
          properties={{ location: "landing_pricing" }}
        />

        <div className="mx-auto max-w-3xl text-center">
          <div className="section-eyebrow">Pricing</div>
          <h2 className="section-title mt-5">Choose the weekly output your team actually needs.</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            Every plan is monthly, flexible, and built around finished weekly output. No annual
            contract, no setup fee, and no seat-based pricing because the work is done for the
            team, not sold tool by tool.
          </p>
        </div>

        <div className="surface-card animated-float-delayed overflow-hidden border-terracotta/20 bg-[linear-gradient(135deg,rgba(212,98,58,0.12),rgba(255,255,255,0.95))]">
          <div className="grid gap-6 px-5 py-6 sm:px-7 sm:py-7 md:grid-cols-[1fr_auto] md:items-center md:px-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Design partner opening
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
                The first 3 design partners lock in GBP 199/month for life.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted md:text-base">
                Best for early-stage teams that want to shape the service with us while securing
                the lowest long-term rate.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <Button asChild size="lg" className="w-full md:w-auto">
                <Link href={ROUTES.SAMPLE}>Get design partner sample</Link>
              </Button>
              <p className="text-sm text-muted">We review fit before opening the slot.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 lg:hidden">
          {pricingPlans.map(({ buttonLabel, description, fit, href, note, plan }) => {
            const badge = "badge" in plan ? plan.badge : undefined;

            return (
              <details key={plan.id} className="group surface-card overflow-hidden p-0">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 marker:hidden">
                  <div className="space-y-2">
                    {badge ? (
                      <Badge>{badge}</Badge>
                    ) : (
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        {note}
                      </div>
                    )}
                    <div className="text-xl font-semibold text-ink">{plan.name}</div>
                    <div className="text-3xl font-bold tracking-tighter text-ink">
                      {formatCurrency(plan.price)}
                    </div>
                    <div className="text-sm text-muted">Per month, billed monthly</div>
                  </div>
                  <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" />
                </summary>

                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden px-5 pb-5">
                    <p className="text-sm leading-7 text-muted">{description}</p>
                    <div className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-7 text-muted">
                      {fit}
                    </div>

                    <ul className="mt-4 space-y-3">
                      {plan.features.slice(0, 4).map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-ink">
                          <div className="mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.features.length > 4 ? (
                      <p className="mt-4 text-sm text-muted">
                        Plus {plan.features.length - 4} more included in the full plan.
                      </p>
                    ) : null}

                    <div className="mt-5">
                      <Button asChild className="w-full" size="lg">
                        <Link href={href} rel="noreferrer" target="_blank">
                          <span className="inline-flex items-center gap-2">
                            {buttonLabel}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>

        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {pricingPlans.map(({ buttonLabel, description, fit, href, note, plan }, index) => {
            const badge = "badge" in plan ? plan.badge : undefined;
            const isHighlighted = "isHighlighted" in plan && Boolean(plan.isHighlighted);

            return (
              <div
                key={plan.id}
                className={cn(
                  "surface-card group relative flex h-full flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(26,26,26,0.1)] sm:p-7 md:p-8",
                  isHighlighted &&
                    "border-terracotta/30 bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_45%)] lg:-translate-y-2",
                  index === 2 && "bg-[linear-gradient(180deg,#ffffff_0%,#f8f5ef_100%)]",
                )}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-terracotta/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    {badge ? (
                      <Badge>{badge}</Badge>
                    ) : (
                      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                        {note}
                      </div>
                    )}
                    <div>
                      <h3 className="text-3xl font-semibold text-ink">{plan.name}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
                    </div>
                  </div>
                  <div className="rounded-full border border-border/70 bg-stone-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    monthly
                  </div>
                </div>

                <div className="mt-8">
                  <div className="text-4xl font-bold tracking-tighter text-ink sm:text-5xl">
                    {formatCurrency(plan.price)}
                  </div>
                  <div className="mt-2 text-sm text-muted">Per month, billed monthly</div>
                  <div className="mt-4 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-7 text-muted">
                    {fit}
                  </div>
                </div>

                <div className="mt-8 h-px bg-border/70" />

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={feature}
                      className={`items-start gap-3 text-sm text-ink md:text-base ${
                        featureIndex > 3 ? "hidden md:flex" : "flex"
                      }`}
                    >
                      <div className="mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.features.length > 4 ? (
                  <p className="mt-4 text-sm text-muted md:hidden">
                    Plus {plan.features.length - 4} more included in the full plan.
                  </p>
                ) : null}

                <div className="mt-auto pt-8">
                  <Button
                    asChild
                    className="w-full"
                    size="lg"
                    variant={isHighlighted ? "primary" : "secondary"}
                  >
                    <Link href={href} rel="noreferrer" target="_blank">
                      <span className="inline-flex items-center gap-2">
                        {buttonLabel}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 rounded-[1.5rem] border border-border/70 bg-white/70 px-5 py-5 text-sm text-muted shadow-sm sm:px-6 md:grid-cols-3 md:px-8 md:py-6">
          <p>Starter, Growth, and Scale are currently sold through a short sales call so we can confirm fit and rollout scope.</p>
          <p>Every plan includes onboarding support and ICP alignment before the first brief lands.</p>
          <p>
            Not sure which tier fits?{" "}
            <Link
              href={CALCOM_URL}
              rel="noreferrer"
              target="_blank"
              className="font-semibold text-terracotta underline underline-offset-4"
            >
              Book a 15-minute call
            </Link>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}
