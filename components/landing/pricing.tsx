import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { SectionViewEvent } from "@/components/analytics/section-view-event";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { hasCashfreeCheckoutConfiguration } from "@/lib/cashfree/env";
import { CALCOM_URL, PLANS, ROUTES } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

const pricingPlans = [
  {
    buttonLabel: "Start Starter",
    description: "For founder-led teams who need quality pipeline without hiring a research pod.",
    href: `/checkout/${PLANS.STARTER.id}`,
    note: "50 leads every Monday",
    plan: PLANS.STARTER,
  },
  {
    buttonLabel: "Start Growth",
    description: "For outbound teams that need deeper research, better timing, and more angle variety.",
    href: `/checkout/${PLANS.GROWTH.id}`,
    note: "100 leads, plus refreshes",
    plan: PLANS.GROWTH,
  },
  {
    buttonLabel: "Talk to Sales",
    description: "For multi-team GTM motions, multiple ICPs, and custom operating support.",
    href: CALCOM_URL,
    note: "Custom rollout",
    plan: PLANS.SCALE,
  },
] as const;

export function PricingSection() {
  const hasCheckout = hasCashfreeCheckoutConfiguration();

  return (
    <section id="pricing" className="py-24">
      <Container className="space-y-12">
        <SectionViewEvent
          name="pricing_section_viewed"
          oncePerSessionKey="pricing-section-viewed"
          properties={{ location: "landing_pricing" }}
        />

        <div className="mx-auto max-w-3xl text-center">
          <div className="section-eyebrow">Pricing</div>
          <h2 className="section-title mt-5">Choose the operating rhythm your team needs.</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            Every plan is monthly, flexible, and built around finished weekly output. No annual
            contract, no setup fee, and no extra seat tax because research is done for the team.
          </p>
        </div>

        <div className="surface-card animated-float-delayed overflow-hidden border-terracotta/20 bg-[linear-gradient(135deg,rgba(212,98,58,0.12),rgba(255,255,255,0.95))]">
          <div className="grid gap-6 px-7 py-7 md:grid-cols-[1fr_auto] md:items-center md:px-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Design partner opening
              </div>
              <h3 className="mt-3 text-3xl font-semibold text-ink">First 3 design partners get GBP 199/month, locked in for life.</h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted md:text-base">
                Best for early-stage teams who want to shape the service with us while securing the
                lowest long-term rate.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:items-end">
              <Button asChild size="lg">
                <TrackedLink
                  eventName="cta_clicked"
                  eventProperties={{
                    destination: ROUTES.SAMPLE,
                    location: "pricing_design_partner",
                    plan: PLANS.DESIGN_PARTNER.id,
                  }}
                  href={ROUTES.SAMPLE}
                >
                  Get design partner sample
                </TrackedLink>
              </Button>
              <p className="text-sm text-muted">We review fit before opening the slot.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pricingPlans.map(({ buttonLabel, description, href, note, plan }, index) => {
            const badge = "badge" in plan ? plan.badge : undefined;
            const isHighlighted = "isHighlighted" in plan && Boolean(plan.isHighlighted);
            const isHostedCheckout = href.startsWith("/checkout/");
            const resolvedHref = isHostedCheckout && !hasCheckout ? ROUTES.SAMPLE : href;

            return (
              <div
                key={plan.id}
                className={cn(
                  "surface-card group relative flex h-full flex-col overflow-hidden p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(26,26,26,0.1)]",
                  isHighlighted && "border-terracotta/30 bg-[linear-gradient(180deg,#fffdfa_0%,#ffffff_45%)] lg:-translate-y-2",
                  index === 2 && "bg-[linear-gradient(180deg,#ffffff_0%,#f8f5ef_100%)]",
                )}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-terracotta/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    {badge ? <Badge>{badge}</Badge> : <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">{note}</div>}
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
                  <div className="text-5xl font-bold tracking-tighter text-ink">
                    {formatCurrency(plan.price)}
                  </div>
                  <div className="mt-2 text-sm text-muted">Per month, billed monthly</div>
                </div>

                <div className="mt-8 h-px bg-border/70" />

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-ink md:text-base">
                      <div className="mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <Button
                    asChild
                    className="w-full"
                    size="lg"
                    variant={isHighlighted ? "primary" : "secondary"}
                  >
                    <TrackedLink
                      eventName="cta_clicked"
                      eventProperties={{
                        destination: resolvedHref,
                        location: `pricing_${plan.id}`,
                        plan: plan.id,
                      }}
                      href={resolvedHref}
                      rel={!isHostedCheckout && resolvedHref !== ROUTES.SAMPLE ? "noreferrer" : undefined}
                      target={!isHostedCheckout && resolvedHref !== ROUTES.SAMPLE ? "_blank" : undefined}
                    >
                      <span className="inline-flex items-center gap-2">
                        {buttonLabel}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </TrackedLink>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-border/70 bg-white/70 px-6 py-6 text-sm text-muted shadow-sm md:grid-cols-3 md:px-8">
          <p>
            {hasCheckout
              ? "Starter and Growth open a Cashfree-hosted recurring subscription checkout."
              : "Cashfree checkout is not configured yet, so local preview falls back to the sample flow."}
          </p>
          <p>All plans include onboarding support and ICP alignment before your first delivery.</p>
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
