import type { Metadata } from "next";
import { PageEvent } from "@/components/analytics/page-event";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  description: "Start with a free Frithly sample or review pricing to choose the right plan.",
  title: "Sign Up | Frithly",
};

export default function SignupPage() {
  return (
    <main className="py-20 md:py-24">
      <Container width="narrow" className="space-y-8">
        <PageEvent
          name="signup_started"
          oncePerSessionKey="signup-started"
          properties={{ location: "signup_page" }}
        />
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center rounded-full border border-terracotta/20 bg-terracotta/10 px-4 py-2 text-sm font-semibold text-terracotta">
            Start here
          </span>
          <h1>Choose how you want to get started with Frithly.</h1>
          <p className="text-muted">
            Request a free 5-lead sample first, or review pricing if you already know your team is
            ready.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl">Get a free sample</h2>
              <p className="text-muted">
                Best if you want to see lead quality and opener depth before paying.
              </p>
              <Button asChild className="w-full" size="lg">
                <TrackedLink
                  eventName="cta_clicked"
                  eventProperties={{ destination: ROUTES.SAMPLE, location: "signup_sample" }}
                  href={ROUTES.SAMPLE}
                >
                  Request Sample
                </TrackedLink>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-2xl">Review pricing</h2>
              <p className="text-muted">
                Best if you already know the lead volume and service level your team needs.
              </p>
              <Button asChild className="w-full" size="lg" variant="secondary">
                <TrackedLink
                  eventName="cta_clicked"
                  eventProperties={{ destination: ROUTES.PRICING, location: "signup_pricing" }}
                  href={ROUTES.PRICING}
                >
                  See Pricing
                </TrackedLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </main>
  );
}
