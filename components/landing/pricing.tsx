import Link from "next/link";
import { Check } from "lucide-react";
import { SectionViewEvent } from "@/components/analytics/section-view-event";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { hasCashfreeCheckoutConfiguration } from "@/lib/cashfree/env";
import { CALCOM_URL, PLANS, ROUTES } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

const pricingPlans = [
  {
    buttonLabel: "Get Started",
    description: "For solo founders + small teams",
    href: `/checkout/${PLANS.STARTER.id}`,
    plan: PLANS.STARTER,
  },
  {
    buttonLabel: "Get Started",
    description: "For B2B SaaS sales teams of 3-10",
    href: `/checkout/${PLANS.GROWTH.id}`,
    plan: PLANS.GROWTH,
  },
  {
    buttonLabel: "Talk to Sales",
    description: "For multi-team operations",
    href: CALCOM_URL,
    plan: PLANS.SCALE,
  },
] as const;

export function PricingSection() {
  const hasCheckout = hasCashfreeCheckoutConfiguration();

  return (
    <section id="pricing" className="py-20">
      <Container className="space-y-10">
        <SectionViewEvent
          name="pricing_section_viewed"
          oncePerSessionKey="pricing-section-viewed"
          properties={{ location: "landing_pricing" }}
        />
        <div className="space-y-4 text-center">
          <h2>Pricing</h2>
          <p className="text-muted">Cancel anytime. No annual contracts. No setup fees.</p>
          <p className="text-sm font-semibold text-terracotta md:text-base">
            {"First 3 design partners pay \u00A3199/month, locked in for life. DM founder for a spot."}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {pricingPlans.map(({ buttonLabel, description, href, plan }) => {
            const badge = "badge" in plan ? plan.badge : undefined;
            const isHighlighted = "isHighlighted" in plan && Boolean(plan.isHighlighted);
            const isHostedCheckout = href.startsWith("/checkout/");
            const resolvedHref = isHostedCheckout && !hasCheckout ? ROUTES.SAMPLE : href;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "h-full rounded-2xl p-8",
                  isHighlighted && "border-2 border-terracotta lg:scale-[1.02]",
                )}
              >
                <CardHeader className="space-y-4 p-0">
                  {badge ? <Badge>{badge}</Badge> : null}
                  <div className="space-y-3">
                    <CardTitle>{plan.name}</CardTitle>
                    <p className="text-sm text-muted">{description}</p>
                    <div>
                      <p className="text-5xl font-bold tracking-tighter text-ink">
                        {formatCurrency(plan.price)}
                      </p>
                      <p className="mt-2 text-sm text-muted">Per month, billed monthly</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="mt-8 flex h-full flex-col p-0">
                  <div className="mb-8 h-px bg-border" />
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-ink md:text-base"
                      >
                        <Check className="mt-1 h-4 w-4 text-terracotta" aria-hidden="true" />
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
                        rel={
                          !isHostedCheckout && resolvedHref !== ROUTES.SAMPLE ? "noreferrer" : undefined
                        }
                        target={
                          !isHostedCheckout && resolvedHref !== ROUTES.SAMPLE ? "_blank" : undefined
                        }
                      >
                        {buttonLabel}
                      </TrackedLink>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center text-base text-muted">
          <p className="text-sm">
            {hasCheckout
              ? "Starter and Growth open a Cashfree-hosted recurring subscription checkout."
              : "Cashfree checkout is not configured yet, so checkout buttons fall back to the sample flow in local preview."}
          </p>
          <p>
            Not sure which tier?{" "}
            <Link
              href={CALCOM_URL}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-terracotta underline underline-offset-4"
            >
              {"Book a 15-min call \u2192"}
            </Link>
          </p>
          <p>We&apos;ll recommend the right one for your team.</p>
        </div>
      </Container>
    </section>
  );
}
