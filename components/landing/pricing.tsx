"use client";

import Link from "next/link";
import { Fraunces, Instrument_Serif } from "next/font/google";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Globe2, Layers3, MailCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const accentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

const foundationItems = [
  "Minimum 80 reviewed opportunities / month included",
  "Reviewed weekly opportunity delivery",
  "SMTP-aware prioritization",
  "Outbound-ready exports",
  "Recommendation intelligence",
  "Founder-aware targeting",
  "Quality-controlled cohort packaging",
  "Curated delivery cadence",
] as const;

const marketOptions = [
  {
    description: "Tighter concentration inside one market.",
    id: "single",
    label: "Single market",
    modifier: 0,
  },
  {
    description: "Balanced coverage across two coordinated markets.",
    id: "double",
    label: "Double market",
    modifier: 240,
  },
  {
    description: "Wider intelligence mapping across multiple active markets.",
    id: "multiple",
    label: "Multi-market",
    modifier: 520,
  },
] as const;

const sophisticationLevels = [
  {
    description: "A disciplined shortlist with weekly operator review.",
    id: "reviewed",
    label: "Reviewed opportunities",
    modifier: 0,
  },
  {
    description: "Stronger confidence thresholds and denser quality control.",
    id: "premium",
    label: "Premium reviewed",
    modifier: 140,
  },
  {
    description: "Decision-maker relevance carries more weight in the release.",
    id: "founder",
    label: "Founder-priority targeting",
    modifier: 280,
  },
  {
    description: "Deliverability posture becomes stricter before delivery.",
    id: "smtp",
    label: "SMTP-safe prioritization",
    modifier: 420,
  },
  {
    description: "The most selective version of the system for higher-stakes outbound.",
    id: "advanced",
    label: "Advanced outbound qualification",
    modifier: 620,
  },
] as const;

const supportOptions = [
  {
    description: "A clean handoff for teams that already know how they will execute.",
    id: "exports",
    label: "Export-ready cohorts",
    modifier: 0,
  },
  {
    description: "Adds curated first-draft support so the release lands closer to execution.",
    id: "drafts",
    label: "Outreach-ready drafts",
    modifier: 190,
  },
  {
    description: "More strategic refinement around how the team should use the release.",
    id: "consultative",
    label: "Consultative optimization",
    modifier: 340,
  },
  {
    description: "The highest-touch support level for teams that want tighter weekly refinement.",
    id: "refinement",
    label: "Delivery refinement support",
    modifier: 520,
  },
] as const;

const cadenceOptions = [
  {
    description: "The standard operating rhythm for most Frithly programs.",
    id: "weekly",
    label: "Weekly cohorts",
    modifier: 0,
  },
  {
    description: "A tighter release rhythm for teams pushing faster outbound cycles.",
    id: "accelerated",
    label: "Accelerated delivery",
    modifier: 260,
  },
  {
    description: "A broader release pace for teams coordinating across larger outbound motions.",
    id: "expanded",
    label: "Expanded outbound cadence",
    modifier: 420,
  },
] as const;

const onboardingFlow = [
  {
    detail: "You apply with your ICP, target markets, and delivery goals.",
    step: "Application",
  },
  {
    detail: "We qualify fit and shape the right operating brief before onboarding begins.",
    step: "Qualification",
  },
  {
    detail: "Program scope, targeting depth, and release structure are configured around your motion.",
    step: "Configuration",
  },
  {
    detail: "The backend intelligence runs, the shortlist is reviewed, and the cohort is packaged.",
    step: "Review",
  },
  {
    detail: "Weekly outbound-ready cohorts land with context, routing discipline, and release notes.",
    step: "Delivery",
  },
] as const;

type MarketId = (typeof marketOptions)[number]["id"];
type SophisticationId = (typeof sophisticationLevels)[number]["id"];
type SupportId = (typeof supportOptions)[number]["id"];
type CadenceId = (typeof cadenceOptions)[number]["id"];

function formatEuro(value: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatEuroRange(low: number, high: number) {
  return `${formatEuro(low)}-${formatEuro(high)}/month`;
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#efba90]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#efba90]" />
      {children}
    </div>
  );
}

function ItalicAccent({ children }: { children: string }) {
  return <span className={`${accentSerif.className} font-normal text-[#efba90]`}>{children}</span>;
}

function SliderControl({
  label,
  max,
  min,
  onChange,
  step = 1,
  value,
  valueLabel,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step?: number;
  value: number;
  valueLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-sm text-white/54">{valueLabel}</span>
      </div>
      <input
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#efba90]"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </div>
  );
}

function ChoiceCard({
  active,
  description,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "block w-full rounded-[1.2rem] px-4 py-4 text-left transition-colors",
        active ? "bg-white text-[#08111d]" : "bg-white/[0.05] text-white/72 hover:bg-white/[0.09]",
      )}
      onClick={onClick}
      type="button"
    >
      <div className="font-medium">{label}</div>
      <div className={cn("mt-2 text-sm", active ? "text-[#08111d]/70" : "text-white/50")}>
        {description}
      </div>
    </button>
  );
}

export function PricingSection() {
  const [monthlyCoverage, setMonthlyCoverage] = useState(180);
  const [markets, setMarkets] = useState<MarketId>("double");
  const [sophistication, setSophistication] = useState<SophisticationId>("founder");
  const [support, setSupport] = useState<SupportId>("consultative");
  const [cadence, setCadence] = useState<CadenceId>("weekly");

  const preview = useMemo(() => {
    const market = marketOptions.find((item) => item.id === markets) ?? marketOptions[1];
    const sophisticationLevel =
      sophisticationLevels.find((item) => item.id === sophistication) ?? sophisticationLevels[2];
    const supportLevel =
      supportOptions.find((item) => item.id === support) ?? supportOptions[2];
    const cadenceLevel =
      cadenceOptions.find((item) => item.id === cadence) ?? cadenceOptions[0];

    const coverageModifier = Math.round(Math.max(monthlyCoverage - 80, 0) * 2.4);
    const low =
      499 +
      market.modifier +
      sophisticationLevel.modifier +
      supportLevel.modifier +
      cadenceLevel.modifier +
      coverageModifier;
    const high =
      low +
      220 +
      Math.round(monthlyCoverage * 0.45) +
      (cadence === "expanded" ? 140 : cadence === "accelerated" ? 80 : 30);

    return {
      cadenceLabel: cadenceLevel.label,
      marketLabel: market.label,
      rangeHigh: high,
      rangeLow: low,
      sophisticationLabel: sophisticationLevel.label,
      supportLabel: supportLevel.label,
    };
  }, [cadence, markets, monthlyCoverage, sophistication, support]);

  return (
    <section className="pb-24 pt-10 sm:pb-28">
      <Container className="space-y-20">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div className="space-y-8">
            <SectionEyebrow>Core foundation</SectionEyebrow>
            <div className="space-y-5">
              <h2
                className={cn(
                  displayFont.className,
                  "max-w-3xl text-[2.5rem] leading-[1.02] tracking-[-0.03em] text-[#f7f4f8] sm:text-[3.25rem]",
                )}
              >
                Frithly Core Intelligence Program{" "}
                <ItalicAccent>starts with operational quality.</ItalicAccent>
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/62 md:text-[1.03rem]">
                Starting from EUR 499/month, every Frithly program begins with the same
                foundation: reviewed delivery, route discipline, recommendation intelligence, and
                a weekly operating structure designed to keep quality intact.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                  Frithly foundation
                </div>
                <div className="mt-3 text-[2.8rem] font-medium leading-none text-white">
                  From EUR 499/month
                </div>
              </div>
              <div className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/70">
                Included in every program
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {foundationItems.map((item) => (
                <div className="flex items-start gap-3 text-sm leading-7 text-white/68" key={item}>
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#efba90]" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
          <div className="space-y-8">
            <div className="space-y-5">
              <SectionEyebrow>Intelligence expansion</SectionEyebrow>
              <h2
                className={cn(
                  displayFont.className,
                  "max-w-3xl text-[2.35rem] leading-[1.02] tracking-[-0.03em] text-[#f7f4f8] sm:text-[3rem]",
                )}
              >
                Configure how sophisticated your{" "}
                <ItalicAccent>outbound operation</ItalicAccent> should be.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-white/62 md:text-[1.03rem]">
                This is not pricing control. It is a way to shape monthly opportunity coverage,
                market complexity, qualification depth, outbound preparation, and delivery cadence
                around your actual motion.
              </p>
            </div>

            <div className="space-y-8 rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:p-8">
              <SliderControl
                label="Monthly opportunity coverage"
                max={400}
                min={80}
                onChange={setMonthlyCoverage}
                step={10}
                value={monthlyCoverage}
                valueLabel={`${monthlyCoverage} opportunities`}
              />

              <div className="space-y-4 border-t border-white/8 pt-8">
                <div className="text-sm font-medium text-white">Market coverage</div>
                <div className="grid gap-3">
                  {marketOptions.map((option) => (
                    <ChoiceCard
                      active={markets === option.id}
                      description={option.description}
                      key={option.id}
                      label={option.label}
                      onClick={() => setMarkets(option.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-white/8 pt-8">
                <div className="text-sm font-medium text-white">Targeting sophistication</div>
                <div className="grid gap-3">
                  {sophisticationLevels.map((option) => (
                    <ChoiceCard
                      active={sophistication === option.id}
                      description={option.description}
                      key={option.id}
                      label={option.label}
                      onClick={() => setSophistication(option.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-white/8 pt-8">
                <div className="text-sm font-medium text-white">Outbound preparation</div>
                <div className="grid gap-3">
                  {supportOptions.map((option) => (
                    <ChoiceCard
                      active={support === option.id}
                      description={option.description}
                      key={option.id}
                      label={option.label}
                      onClick={() => setSupport(option.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-white/8 pt-8">
                <div className="text-sm font-medium text-white">Delivery cadence</div>
                <div className="grid gap-3">
                  {cadenceOptions.map((option) => (
                    <ChoiceCard
                      active={cadence === option.id}
                      description={option.description}
                      key={option.id}
                      label={option.label}
                      onClick={() => setCadence(option.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="rounded-[2rem] bg-white/[0.04] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] lg:sticky lg:top-24 lg:p-8"
            initial={{ opacity: 0.96, y: 10 }}
            key={`${monthlyCoverage}-${markets}-${sophistication}-${support}-${cadence}`}
            transition={{ duration: 0.45, ease: "easeOut" }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#efba90]">
                  Your Frithly program
                </div>
                <div className="mt-4 text-[2.8rem] font-medium leading-none text-white">
                  {formatEuroRange(preview.rangeLow, preview.rangeHigh)}
                </div>
              </div>
              <div className="rounded-full bg-white/[0.06] px-4 py-2 text-sm text-white/70">
                Consultative estimate
              </div>
            </div>

            <div className="mt-10 space-y-4">
              {[
                `${monthlyCoverage} reviewed opportunities / month`,
                preview.sophisticationLabel,
                `${preview.marketLabel} market coverage`,
                preview.cadenceLabel,
                preview.supportLabel,
                "Outbound-ready exports",
              ].map((item) => (
                <div className="flex items-start gap-3 text-sm leading-7 text-white/68" key={item}>
                  <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[#efba90]" aria-hidden="true" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 border-t border-white/8 pt-8 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/34">Coverage</div>
                <div className="mt-3 flex items-end gap-1">
                  <div className="h-12 w-3 rounded-full bg-[#79e2cb]" />
                  <div className="h-16 w-3 rounded-full bg-[#79e2cb]" />
                  <div className="h-20 w-3 rounded-full bg-[#79e2cb]" />
                  <div
                    className="w-3 rounded-full bg-[#79e2cb]"
                    style={{ height: `${32 + Math.round((monthlyCoverage / 400) * 56)}px` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/34">Markets</div>
                <div className="mt-4 space-y-2">
                  <div className="inline-flex items-center gap-2 text-sm text-white/68">
                    <Globe2 className="h-4 w-4 text-[#efba90]" aria-hidden="true" />
                    <span>{preview.marketLabel}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/34">Release posture</div>
                <div className="mt-4 space-y-2">
                  <div className="inline-flex items-center gap-2 text-sm text-white/68">
                    <MailCheck className="h-4 w-4 text-[#efba90]" aria-hidden="true" />
                    <span>{preview.sophisticationLabel}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm text-white/68">
                    <Layers3 className="h-4 w-4 text-[#efba90]" aria-hidden="true" />
                    <span>{preview.supportLabel}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-white/8 pt-8">
              <div className="text-sm leading-7 text-white/56">
                This is not a checkout flow. It is a program estimate designed to anchor fit,
                scope, and sophistication before application.
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="sm:flex-1">
                  <Link href={ROUTES.BOOK_MEETING}>
                    <span className="inline-flex items-center gap-2">
                      Book a meeting
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="border-white/10 bg-white/[0.05] text-white hover:border-white/18 hover:bg-white/[0.08] hover:text-white sm:flex-1"
                >
                  <Link href={ROUTES.CONTACT_SALES}>
                    Talk to sales
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
          <div className="space-y-5">
            <SectionEyebrow>What happens next</SectionEyebrow>
            <h2
              className={cn(
                displayFont.className,
                "max-w-3xl text-[2.35rem] leading-[1.02] tracking-[-0.03em] text-[#f7f4f8] sm:text-[3rem]",
              )}
            >
              The pricing experience reflects the{" "}
              <ItalicAccent>real operational flow.</ItalicAccent>
            </h2>
            <p className="max-w-2xl text-base leading-8 text-white/62 md:text-[1.03rem]">
              You do not move from pricing into checkout. You move into qualification, intake,
              configuration, and a weekly delivery system designed around your outbound reality.
            </p>
          </div>

          <div className="space-y-6">
            {onboardingFlow.map((item, index) => (
              <div
                className="grid gap-4 border-t border-white/8 pt-6 first:border-t-0 first:pt-0 sm:grid-cols-[140px_minmax(0,1fr)]"
                key={item.step}
              >
                <div className="text-sm font-medium text-white">{`0${index + 1} / ${item.step}`}</div>
                <p className="max-w-2xl text-base leading-8 text-white/58">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
