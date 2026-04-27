import { Inbox, PhoneCall, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

const steps = [
  {
    description:
      "30-min onboarding call to define your ideal customer profile. We document exactly who you want, what signals matter, and which industries to avoid.",
    icon: PhoneCall,
    number: "1",
    title: "Tell us your ICP",
  },
  {
    description:
      "Our AI agents and analysts dig through thousands of profiles to find the 50 that match — with verified emails and current trigger signals.",
    icon: Search,
    number: "2",
    title: "We research all week",
  },
  {
    description:
      "50 hand-picked leads land in your inbox. Each with verified contact info, why-now context, and 3 personalized opening lines ready to send.",
    icon: Inbox,
    number: "3",
    title: "You receive on Monday",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20">
      <Container className="space-y-10">
        <div className="space-y-4 text-center">
          <h2>How it works</h2>
          <p className="text-muted">Three simple steps. We do everything else.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <Card key={step.number} className="h-full">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10 text-base font-bold text-terracotta">
                      {step.number}
                    </span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-terracotta">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-lg font-semibold text-ink">
          First leads delivered within 7 days of signup.
        </p>
      </Container>
    </section>
  );
}
