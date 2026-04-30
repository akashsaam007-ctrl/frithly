import { ArrowUpRight, BriefcaseBusiness, Building2, ChevronDown, Users2 } from "lucide-react";
import { Container } from "@/components/ui/container";

const fitProfiles = [
  {
    description:
      "You know the accounts you want, but research is still stealing founder selling time every week.",
    icon: BriefcaseBusiness,
    title: "Founder-led outbound",
  },
  {
    description:
      "Your reps have data, but not enough context to write better first touches without more manual digging.",
    icon: Users2,
    title: "Early sales teams",
  },
  {
    description:
      "You need a repeatable weekly output your team can trust across campaigns, segments, and handoffs.",
    icon: Building2,
    title: "Growing GTM operations",
  },
];

const outcomes = [
  "A Monday-ready brief instead of another CSV export.",
  "Fewer rep-hours lost to pre-outreach research and cleanup.",
  "Clearer reasons to contact each account right now.",
  "Stronger first-touch quality before volume scales up.",
];

const proofStats = [
  { label: "First brief", value: "Within 7 days" },
  { label: "Weekly output", value: "50 to 100 leads" },
  { label: "Opener depth", value: "1 to 3 angles" },
];

export function ProofSection() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <Container className="space-y-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="section-eyebrow">Who it is for</div>
          <h2 className="section-title mt-5">
            Built for teams that want better outbound, not more list management.
          </h2>
          <p className="section-copy mx-auto mt-5 max-w-2xl">
            Frithly fits best when your team already knows outbound matters and needs a sharper
            weekly operating rhythm to keep pipeline moving.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted">
            No inflated &ldquo;revenue unlocked&rdquo; claims here. Just the outcomes teams care about when
            they replace ad hoc research with a cleaner weekly system.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-3 lg:hidden">
            {fitProfiles.map((profile) => {
              const Icon = profile.icon;

              return (
                <details key={profile.title} className="group surface-card overflow-hidden p-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="text-base font-semibold text-ink">{profile.title}</div>
                    </div>
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 group-open:grid-rows-[1fr]">
                    <div className="overflow-hidden px-5 pb-5 text-sm leading-7 text-muted">
                      {profile.description}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>

          <div className="hidden gap-6 md:grid-cols-3 lg:grid lg:grid-cols-1">
            {fitProfiles.map((profile) => {
              const Icon = profile.icon;

              return (
                <div
                  key={profile.title}
                  className="surface-card flex h-full gap-4 p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-ink">{profile.title}</h3>
                    <p className="text-sm leading-7 text-muted md:text-base">
                      {profile.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="surface-card overflow-hidden border-terracotta/20">
            <div className="border-b border-border/70 bg-[linear-gradient(135deg,rgba(212,98,58,0.08),rgba(255,255,255,0.96))] px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                Outcomes teams actually buy
              </div>
              <h3 className="mt-3 text-2xl font-semibold text-ink sm:text-3xl">
                The value is not more data. It is better weekly execution.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted md:text-base">
                Frithly is most useful when the bottleneck is not access to leads, but turning raw
                lead data into outreach your team can confidently send.
              </p>
            </div>

            <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
              <div className="grid gap-4 sm:grid-cols-3">
                {proofStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/70 bg-stone-50 px-4 py-4"
                  >
                    <div className="text-lg font-semibold text-ink">{stat.value}</div>
                    <div className="mt-1 text-sm text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {outcomes.map((outcome) => (
                  <div
                    key={outcome}
                    className="rounded-2xl border border-border/70 bg-white px-4 py-4 text-sm leading-7 text-ink md:text-base"
                  >
                    {outcome}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
