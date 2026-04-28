import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Mail, Radar, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";

const signals = [
  "Posted about juggling six delivery tools, 47 reactions",
  "Featured on Agency Built podcast within the last month",
  "Hired four account managers in 60 days",
  "Newly promoted operations lead with process ownership",
];

const openers = [
  {
    body: "Saw you hired four account managers in 60 days. That is usually the moment fragmented delivery tooling starts slowing everything down. Curious how you are handling that transition.",
    label: "Recommended angle",
    note: "Situational opener",
    recommended: true,
  },
  {
    body: "Caught the Agency Built conversation on scaling onboarding. You mentioned six tools in the stack, which is exactly the kind of operational sprawl we help teams simplify.",
    label: "Content angle",
    note: "Podcast reference",
  },
  {
    body: "Your recent post about juggling six tools for deliverables felt familiar. We built Frithly for teams trying to replace generic outreach with better timing and tighter GTM context.",
    label: "Signal angle",
    note: "Public post reference",
  },
];

export function SampleLead() {
  return (
    <section className="py-24">
      <Container className="space-y-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-eyebrow">Inside the deliverable</div>
          <h2 className="section-title mt-5">This is the difference your team feels on Monday morning.</h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            One lead, fully packaged with context, timing, and messaging direction. Multiply this
            by 50 and you have the weekly operating rhythm Frithly is designed to create.
          </p>
        </div>

        <div className="surface-card-dark overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-10">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Lead intelligence snapshot
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-3xl font-semibold text-white md:text-4xl">
                    Sarah Chen, Head of Operations
                  </h3>
                  <p className="mt-3 text-white/65">
                    Volcano Digital, 54 employees, London
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Mail className="h-4 w-4 text-terracotta" aria-hidden="true" />
                      Contact quality
                    </div>
                    <div className="mt-3 text-lg font-medium text-white">sarah@volcano.io</div>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-emerald-300">
                      <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                      Verified email
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Building2 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                      Why this account
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/70">
                      Expansion hiring and process ownership make this a strong timing fit for a
                      workflow-focused outbound message.
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/65">
                    <Radar className="h-4 w-4 text-terracotta" aria-hidden="true" />
                    Trigger signals
                  </div>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-white/75">
                    {signals.map((signal) => (
                      <li key={signal} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-terracotta" aria-hidden="true" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 text-ink lg:p-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                    Personalized opener set
                  </div>
                  <h3 className="mt-3 text-3xl font-semibold text-ink">Three ways to start the same conversation.</h3>
                </div>
                <Badge>weekly brief</Badge>
              </div>

              <div className="mt-8 space-y-4">
                {openers.map((opener) => (
                  <div
                    key={opener.label}
                    className="rounded-[1.5rem] border border-border/70 bg-stone-50 p-5"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-base font-semibold text-ink">{opener.label}</div>
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                        {opener.note}
                      </div>
                      {opener.recommended ? (
                        <span className="rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
                          recommended
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-muted md:text-base">{opener.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={ROUTES.SAMPLE}>
                    <span className="inline-flex items-center gap-2">
                      Get your free sample
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href={ROUTES.PRICING}>See pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
