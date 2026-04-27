import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";

const signals = [
  'Posted about "juggling 6 different tools" (Oct 29, 47 reactions)',
  "Featured on Agency Built podcast (Nov 12)",
  "Hired 4 AMs in 60 days",
  "Promoted from Senior PM in September",
];

const openers = [
  {
    body: "\"Saw you hired 4 AMs in 60 days — that's the exact moment your tracking-tools-juggling problem usually breaks. Curious how you're handling it.\"",
    label: "Option A — Situational",
    recommended: true,
  },
  {
    body: '"Caught your Agency Built episode on scaling onboarding. You mentioned 6 tools for deliverables — we built something that collapses that into one. Worth 15 min?"',
    label: "Option B — Their Content",
  },
  {
    body: '"Your post about juggling 6 tools to track client deliverables is exactly the pain we built [product] for. Mind if I send a 60-second loom showing the difference?"',
    label: "Option C — Company Signal",
  },
];

export function SampleLead() {
  return (
    <section className="py-20">
      <Container className="space-y-8">
        <div className="text-center">
          <h2>Here&apos;s a real lead we delivered last week.</h2>
        </div>

        <Card className="mx-auto max-w-[900px] rounded-2xl border border-border p-8 shadow-md md:p-12">
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="space-y-1">
                <h3 className="text-3xl font-semibold text-ink md:text-4xl">
                  Sarah Chen · Head of Operations
                </h3>
                <p className="text-lg text-muted">Volcano Digital · 54 employees · London, UK</p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted md:flex-row md:items-center md:gap-6">
                <span>📧 sarah@volcano.io <span className="font-semibold text-emerald-600">✓ verified</span></span>
                <Link
                  href="https://www.linkedin.com/in/sarahchen"
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-ink"
                >
                  🔗 LinkedIn
                </Link>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <h4 className="text-lg uppercase tracking-[0.12em] text-ink">WHY THIS LEAD, RIGHT NOW</h4>
              </div>
              <p>
                Just hired 4 Account Managers in the last 60 days, signaling rapid client growth
                — exactly when project management tools start breaking.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📡</span>
                <h4 className="text-lg uppercase tracking-[0.12em] text-ink">TRIGGER SIGNALS</h4>
              </div>
              <ul className="space-y-2 text-base text-ink md:text-lg">
                {signals.map((signal) => (
                  <li key={signal}>- {signal}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✍️</span>
                <h4 className="text-lg uppercase tracking-[0.12em] text-ink">PERSONALIZED OPENERS</h4>
              </div>

              <div className="space-y-4">
                {openers.map((opener) => (
                  <div key={opener.label} className="rounded-xl border border-border p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h5 className="text-lg font-semibold text-ink">{opener.label}</h5>
                      {opener.recommended ? <Badge>recommended</Badge> : null}
                    </div>
                    <p className="text-base text-muted md:text-lg">{opener.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6 text-center">
          <p className="text-xl font-semibold text-ink">
            This is what you get. 50 of them. Every Monday.
          </p>
          <Button asChild size="lg">
            <Link href={ROUTES.SAMPLE}>Get Your Free 5-Lead Sample →</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
