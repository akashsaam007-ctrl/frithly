"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  GaugeCircle,
  LineChart,
  MailCheck,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";
import { captureEvent } from "@/lib/monitoring/posthog";
import { formatCurrency } from "@/lib/utils";

type CurrencyOption = "EUR" | "GBP" | "USD";

type RoiFormState = {
  averageClientValue: number;
  closeRate: number;
  currency: CurrencyOption;
  currentReplyRate: number;
  improvedReplyRate: number;
  meetingsNeeded: number;
  outboundVolume: number;
};

type RoiNumericField = Exclude<keyof RoiFormState, "currency">;
type RoiInputState = Record<RoiNumericField, string>;

const QUALIFIED_REPLY_TO_MEETING_RATE = 0.4;

const presets: Array<{
  description: string;
  id: string;
  label: string;
  state: RoiFormState;
}> = [
  {
    description: "Founder-led agency with modest current reply performance.",
    id: "lean-agency",
    label: "Lean agency",
    state: {
      averageClientValue: 5000,
      closeRate: 20,
      currency: "GBP",
      currentReplyRate: 2,
      improvedReplyRate: 6,
      meetingsNeeded: 5,
      outboundVolume: 100,
    },
  },
  {
    description: "Higher-ticket services motion where a small quality lift matters fast.",
    id: "premium-services",
    label: "High-ticket services",
    state: {
      averageClientValue: 12000,
      closeRate: 18,
      currency: "EUR",
      currentReplyRate: 3,
      improvedReplyRate: 7,
      meetingsNeeded: 6,
      outboundVolume: 140,
    },
  },
  {
    description: "Growth team that already has some traction and wants better routing efficiency.",
    id: "growing-team",
    label: "Growth team",
    state: {
      averageClientValue: 9000,
      closeRate: 22,
      currency: "USD",
      currentReplyRate: 4,
      improvedReplyRate: 8,
      meetingsNeeded: 5,
      outboundVolume: 180,
    },
  },
];

const initialFormState: RoiFormState = presets[0].state;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatRoiInputState(formState: RoiFormState): RoiInputState {
  return {
    averageClientValue: String(formState.averageClientValue),
    closeRate: String(formState.closeRate),
    currentReplyRate: String(formState.currentReplyRate),
    improvedReplyRate: String(formState.improvedReplyRate),
    meetingsNeeded: String(formState.meetingsNeeded),
    outboundVolume: String(formState.outboundVolume),
  };
}

function normalizeRoiFormState<K extends keyof RoiFormState>(
  current: RoiFormState,
  field: K,
  nextValue: RoiFormState[K],
) {
  const nextState = { ...current, [field]: nextValue };

  if (field === "averageClientValue") {
    nextState.averageClientValue = clamp(Number(nextValue), 1000, 100000);
  }

  if (field === "closeRate") {
    nextState.closeRate = clamp(Number(nextValue), 5, 80);
  }

  if (field === "currentReplyRate") {
    nextState.currentReplyRate = clamp(Number(nextValue), 1, 30);
    nextState.improvedReplyRate = Math.max(nextState.improvedReplyRate, nextState.currentReplyRate);
  }

  if (field === "improvedReplyRate") {
    nextState.improvedReplyRate = clamp(
      Math.max(Number(nextValue), nextState.currentReplyRate),
      nextState.currentReplyRate,
      35,
    );
  }

  if (field === "meetingsNeeded") {
    nextState.meetingsNeeded = clamp(Number(nextValue), 1, 12);
  }

  if (field === "outboundVolume") {
    nextState.outboundVolume = clamp(Number(nextValue), 25, 2000);
  }

  return nextState;
}

function formatCompactMoney(value: number, currency: CurrencyOption) {
  if (Math.abs(value) < 10000) {
    return formatCurrency(value, currency);
  }

  return new Intl.NumberFormat("en-GB", {
    currency,
    maximumFractionDigits: 1,
    notation: Math.abs(value) >= 10000 ? "compact" : "standard",
    style: "currency",
  }).format(value);
}

function formatMaybeDecimal(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits,
    minimumFractionDigits: value > 0 && value < 10 ? 1 : 0,
  }).format(value);
}

function formatPercent(value: number, maximumFractionDigits = 0) {
  return `${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits,
  }).format(value)}%`;
}

function calculateModel(formState: RoiFormState) {
  const currentReplyRateDecimal = formState.currentReplyRate / 100;
  const improvedReplyRateDecimal = formState.improvedReplyRate / 100;

  const currentReplies = formState.outboundVolume * currentReplyRateDecimal;
  const improvedReplies = formState.outboundVolume * improvedReplyRateDecimal;

  const currentMeetings = currentReplies * QUALIFIED_REPLY_TO_MEETING_RATE;
  const improvedMeetings = improvedReplies * QUALIFIED_REPLY_TO_MEETING_RATE;

  const currentClientsByCloseRate = currentMeetings * (formState.closeRate / 100);
  const improvedClientsByCloseRate = improvedMeetings * (formState.closeRate / 100);

  const currentClientsByMeetingNeed = currentMeetings / formState.meetingsNeeded;
  const improvedClientsByMeetingNeed = improvedMeetings / formState.meetingsNeeded;

  const currentClients = Math.min(currentClientsByCloseRate, currentClientsByMeetingNeed);
  const improvedClients = Math.min(improvedClientsByCloseRate, improvedClientsByMeetingNeed);

  const currentRevenue = currentClients * formState.averageClientValue;
  const improvedRevenue = improvedClients * formState.averageClientValue;
  const incrementalRevenue = improvedRevenue - currentRevenue;
  const annualRevenueUnlocked = incrementalRevenue * 12;

  const additionalReplies = improvedReplies - currentReplies;
  const additionalMeetings = improvedMeetings - currentMeetings;
  const additionalClients = improvedClients - currentClients;

  const efficiencyLift =
    formState.currentReplyRate > 0
      ? ((formState.improvedReplyRate - formState.currentReplyRate) / formState.currentReplyRate) * 100
      : 0;

  const currentOutboundPerClientWin =
    formState.meetingsNeeded / QUALIFIED_REPLY_TO_MEETING_RATE / currentReplyRateDecimal;
  const improvedOutboundPerClientWin =
    formState.meetingsNeeded / QUALIFIED_REPLY_TO_MEETING_RATE / improvedReplyRateDecimal;
  const wastedOutboundReduction =
    currentOutboundPerClientWin > 0
      ? (1 - improvedOutboundPerClientWin / currentOutboundPerClientWin) * 100
      : 0;

  const closeRateImpliedByMeetingsNeeded = 100 / formState.meetingsNeeded;
  const closeRateGap = Math.abs(closeRateImpliedByMeetingsNeeded - formState.closeRate);

  return {
    additionalClients,
    additionalMeetings,
    additionalReplies,
    annualRevenueUnlocked,
    closeRateGap,
    closeRateImpliedByMeetingsNeeded,
    currentClients,
    currentMeetings,
    currentOutboundPerClientWin,
    currentReplies,
    currentRevenue,
    efficiencyLift,
    improvedClients,
    improvedMeetings,
    improvedOutboundPerClientWin,
    improvedReplies,
    improvedRevenue,
    incrementalRevenue,
    wastedOutboundReduction,
  };
}

function MetricInput({
  hint,
  label,
  max,
  min,
  onBlur,
  onChange,
  suffix,
  value,
}: {
  hint?: string;
  label: string;
  max: number;
  min: number;
  onBlur: () => void;
  onChange: (value: string) => void;
  suffix?: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm font-semibold text-ink">{label}</Label>
        {suffix ? <span className="text-xs font-medium text-muted">{suffix}</span> : null}
      </div>
      <Input
        max={max}
        min={min}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        type="number"
        value={value}
      />
      {hint ? <p className="text-xs leading-6 text-muted">{hint}</p> : null}
    </div>
  );
}

export function RoiCalculatorExperience() {
  const [formState, setFormState] = useState<RoiFormState>(initialFormState);
  const [inputState, setInputState] = useState<RoiInputState>(() => formatRoiInputState(initialFormState));
  const hasTrackedInitialUpdateRef = useRef(false);

  const model = useMemo(() => calculateModel(formState), [formState]);
  const activePreset = useMemo(
    () =>
      presets.find(
        (preset) =>
          preset.state.averageClientValue === formState.averageClientValue &&
          preset.state.closeRate === formState.closeRate &&
          preset.state.currency === formState.currency &&
          preset.state.currentReplyRate === formState.currentReplyRate &&
          preset.state.improvedReplyRate === formState.improvedReplyRate &&
          preset.state.meetingsNeeded === formState.meetingsNeeded &&
          preset.state.outboundVolume === formState.outboundVolume,
      ),
    [formState],
  );

  useEffect(() => {
    if (!hasTrackedInitialUpdateRef.current) {
      hasTrackedInitialUpdateRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      captureEvent("roi_calculator_updated", {
        average_client_value: formState.averageClientValue,
        close_rate: formState.closeRate,
        current_reply_rate: formState.currentReplyRate,
        currency: formState.currency,
        improved_reply_rate: formState.improvedReplyRate,
        meetings_needed: formState.meetingsNeeded,
        outbound_volume: formState.outboundVolume,
      });
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [formState]);

  const updateFormState = <K extends keyof RoiFormState>(field: K, nextValue: RoiFormState[K]) => {
    setFormState((current) => normalizeRoiFormState(current, field, nextValue));
  };

  function updateNumericInput(field: RoiNumericField, value: string) {
    setInputState((current) => ({ ...current, [field]: value }));
  }

  function commitNumericInput(field: RoiNumericField) {
    const trimmedValue = inputState[field].trim();
    const parsedValue = trimmedValue ? Number(trimmedValue) : formState[field];
    const nextState = normalizeRoiFormState(
      formState,
      field,
      Number.isFinite(parsedValue) ? parsedValue : formState[field],
    );

    setFormState(nextState);
    setInputState(formatRoiInputState(nextState));
  }

  const waterfallSteps = [
    {
      current: formatMaybeDecimal(formState.outboundVolume, 0),
      improved: formatMaybeDecimal(formState.outboundVolume, 0),
      label: "Qualified opportunities",
      lift: "same volume",
    },
    {
      current: formatMaybeDecimal(model.currentReplies),
      improved: formatMaybeDecimal(model.improvedReplies),
      label: "Replies",
      lift: `+${formatMaybeDecimal(model.additionalReplies)} replies`,
    },
    {
      current: formatMaybeDecimal(model.currentMeetings),
      improved: formatMaybeDecimal(model.improvedMeetings),
      label: "Qualified meetings",
      lift: `+${formatMaybeDecimal(model.additionalMeetings)} meetings`,
    },
    {
      current: formatMaybeDecimal(model.currentClients),
      improved: formatMaybeDecimal(model.improvedClients),
      label: "Expected clients",
      lift: `+${formatMaybeDecimal(model.additionalClients)} clients`,
    },
    {
      current: formatCompactMoney(model.currentRevenue, formState.currency),
      improved: formatCompactMoney(model.improvedRevenue, formState.currency),
      label: "Projected revenue / month",
      lift: `+${formatCompactMoney(model.incrementalRevenue, formState.currency)}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="surface-card p-6 shadow-[0_22px_70px_rgba(26,26,26,0.08)] sm:p-7">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="section-eyebrow">Opportunity inputs</div>
              <div>
                <h2 className="max-w-xl text-3xl font-semibold text-ink sm:text-4xl">
                  Model the revenue lift before you think about send volume.
                </h2>
                <p className="mt-3 max-w-2xl text-muted">
                  This calculator keeps the math simple on purpose. It assumes the same monthly
                  outbound volume, then shows what better opportunity quality can unlock in replies,
                  meetings, and revenue.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Common scenarios
              </div>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      activePreset?.id === preset.id
                        ? "border-terracotta bg-terracotta/10 text-terracotta"
                        : "border-border bg-white text-ink hover:border-ink"
                    }`}
                    onClick={() => {
                      setFormState(preset.state);
                      setInputState(formatRoiInputState(preset.state));
                    }}
                    type="button"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {activePreset ? (
                <p className="text-xs leading-6 text-muted">{activePreset.description}</p>
              ) : (
                <p className="text-xs leading-6 text-muted">
                  Custom scenario. Keep the model directional and conservative rather than forcing
                  perfect precision.
                </p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-sm font-semibold text-ink">Average client value</Label>
                  <div className="w-[7.5rem]">
                    <Select
                      onValueChange={(value) => updateFormState("currency", value as CurrencyOption)}
                      value={formState.currency}
                    >
                      <SelectTrigger className="h-9 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.16em]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Input
                  max={100000}
                  min={1000}
                  onBlur={() => commitNumericInput("averageClientValue")}
                  onChange={(event) => updateNumericInput("averageClientValue", event.target.value)}
                  type="number"
                  value={inputState.averageClientValue}
                />
                <p className="text-xs leading-6 text-muted">
                  Use your typical first-year client value, not a best-case upside number.
                </p>
              </div>

              <MetricInput
                hint="If 5 meetings usually produces 1 client, enter 5."
                label="Meetings needed per client"
                max={12}
                min={1}
                onBlur={() => commitNumericInput("meetingsNeeded")}
                onChange={(value) => updateNumericInput("meetingsNeeded", value)}
                value={inputState.meetingsNeeded}
              />

              <MetricInput
                hint="A conservative meeting-to-client conversion rate keeps the model honest."
                label="Close rate"
                max={80}
                min={5}
                onBlur={() => commitNumericInput("closeRate")}
                onChange={(value) => updateNumericInput("closeRate", value)}
                suffix="%"
                value={inputState.closeRate}
              />

              <MetricInput
                hint="Only count the monthly opportunities you would genuinely be willing to pursue."
                label="Outbound volume / month"
                max={2000}
                min={25}
                onBlur={() => commitNumericInput("outboundVolume")}
                onChange={(value) => updateNumericInput("outboundVolume", value)}
                value={inputState.outboundVolume}
              />

              <MetricInput
                hint="This is your baseline today."
                label="Current reply rate"
                max={30}
                min={1}
                onBlur={() => commitNumericInput("currentReplyRate")}
                onChange={(value) => updateNumericInput("currentReplyRate", value)}
                suffix="%"
                value={inputState.currentReplyRate}
              />

              <MetricInput
                hint="Model the reply rate you believe stronger opportunity quality could create."
                label="Improved reply rate"
                max={35}
                min={formState.currentReplyRate}
                onBlur={() => commitNumericInput("improvedReplyRate")}
                onChange={(value) => updateNumericInput("improvedReplyRate", value)}
                suffix="%"
                value={inputState.improvedReplyRate}
              />
            </div>

            <div className="rounded-[1.25rem] border border-border/70 bg-stone-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 text-terracotta" aria-hidden="true" />
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-ink">Conservative model assumptions</div>
                  <p className="text-sm leading-7 text-muted">
                    Frithly assumes roughly {formatPercent(QUALIFIED_REPLY_TO_MEETING_RATE * 100)} of
                    qualified replies turn into real meetings, then uses the more conservative of your
                    close-rate math and meetings-needed math when projecting client wins.
                  </p>
                  {model.closeRateGap > 2 ? (
                    <p className="text-xs leading-6 text-terracotta">
                      Your inputs imply about {formatPercent(model.closeRateImpliedByMeetingsNeeded, 1)}
                      {" "}
                      close rate from meetings-needed alone. We keep the tighter assumption so the
                      revenue model does not overstate upside.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card-dark animated-glow overflow-hidden p-6 shadow-[0_30px_90px_rgba(12,12,12,0.34)] sm:p-7">
          <div className="space-y-7">
            <div className="space-y-4">
              <Badge className="border-white/10 bg-white/10 text-white" variant="outline">
                Opportunity model
              </Badge>
              <div className="space-y-3">
                <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                  The same {formatMaybeDecimal(formState.outboundVolume, 0)} monthly opportunities can
                  unlock materially more revenue when the routing quality improves.
                </h2>
                <p className="max-w-2xl text-white/70">
                  This is the commercial story behind selective outbound: better recommendation quality
                  does not just create prettier lists. It changes how much pipeline value the same team
                  can realistically unlock.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.35rem] border border-terracotta/20 bg-white/[0.06] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-light">
                  Revenue opportunity unlocked
                </div>
                <div className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  {formatCurrency(model.annualRevenueUnlocked, formState.currency)}
                </div>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
                  Directional annualized lift if stronger opportunity quality moves you from{" "}
                  {formatPercent(formState.currentReplyRate)} replies to{" "}
                  {formatPercent(formState.improvedReplyRate)} on the same monthly volume.
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                  Projected pipeline value / month
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  {formatCurrency(model.improvedRevenue, formState.currency)}
                </div>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  Equivalent to about {formatMaybeDecimal(model.improvedClients)} expected client wins
                  from the same monthly opportunity count.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: CircleDollarSign,
                  label: "Incremental replies",
                  value: `+${formatMaybeDecimal(model.additionalReplies)}`,
                },
                {
                  icon: MailCheck,
                  label: "Qualified meetings / month",
                  value: formatMaybeDecimal(model.improvedMeetings),
                },
                {
                  icon: GaugeCircle,
                  label: "Efficiency lift",
                  value: formatPercent(model.efficiencyLift),
                },
                {
                  icon: Target,
                  label: "Less wasted outbound per win",
                  value: formatPercent(model.wastedOutboundReduction),
                },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.1rem] border border-white/10 bg-white/[0.05] px-4 py-4"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    <metric.icon className="h-4 w-4 text-terracotta" aria-hidden="true" />
                    {metric.label}
                  </div>
                  <div className="mt-3 text-2xl font-semibold tracking-tight text-white">{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <LineChart className="h-4 w-4 text-terracotta" aria-hidden="true" />
                Why the economics change
              </div>
              <p className="mt-3 text-sm leading-7 text-white/70">
                You would need about {formatMaybeDecimal(model.currentOutboundPerClientWin, 0)} outbound
                opportunities to create one client win at your current assumptions. At the improved
                opportunity quality, that drops to about{" "}
                {formatMaybeDecimal(model.improvedOutboundPerClientWin, 0)}.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link
                  href={ROUTES.APPLY}
                  onClick={() =>
                    captureEvent("cta_clicked", {
                      location: "roi_page",
                      target: "apply_for_campaign",
                    })
                  }
                >
                  <span className="inline-flex items-center gap-2">
                    Apply for a custom campaign
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link
                  href={ROUTES.DEMO}
                  onClick={() =>
                    captureEvent("cta_clicked", {
                      location: "roi_page",
                      target: "open_interactive_demo",
                    })
                  }
                >
                  Revisit the interactive demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden p-6 shadow-[0_22px_70px_rgba(26,26,26,0.08)] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="section-eyebrow">Pipeline waterfall</div>
            <div>
              <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
                Quality changes the whole pipeline, not just the reply line.
              </h2>
              <p className="mt-3 max-w-3xl text-muted">
                This keeps the monthly opportunity count fixed, then shows how stronger routing and
                better readiness move through the full commercial chain.
              </p>
            </div>
          </div>
          <Badge variant="success">Same volume, better opportunity quality</Badge>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-5">
          {waterfallSteps.map((step, index) => (
            <div
              key={step.label}
              className="relative rounded-[1.2rem] border border-border/70 bg-stone-50 p-5"
            >
              {index < waterfallSteps.length - 1 ? (
                <div className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-border xl:block" />
              ) : null}
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                {step.label}
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-tight text-ink">{step.improved}</div>
              <div className="mt-2 text-sm text-muted">Current: {step.current}</div>
              <div className="mt-4 inline-flex rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta">
                {step.lift}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="surface-card p-6 shadow-[0_22px_70px_rgba(26,26,26,0.08)] sm:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                What improves
              </div>
              <h2 className="mt-1 text-2xl font-semibold text-ink">The lift comes from selectivity.</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {[
              {
                description:
                  "Better-ranked opportunities create more replies from the same outbound volume. That is why the model focuses on quality lift, not send inflation.",
                title: "More signal from the same list size",
              },
              {
                description:
                  "Stronger contactability and higher founder confidence create a denser meeting pipeline, which is usually where the real commercial upside starts to appear.",
                title: "More meetings without widening the ICP",
              },
              {
                description:
                  "When you need fewer opportunities to produce a client win, you waste less operator time, less personalization effort, and less deliverability headroom.",
                title: "Less outbound waste per client win",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.2rem] border border-border/70 bg-white p-5">
                <div className="text-lg font-semibold text-ink">{item.title}</div>
                <p className="mt-3 text-sm leading-7 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card-dark p-6 shadow-[0_28px_80px_rgba(12,12,12,0.32)] sm:p-7">
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                Why this matters
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                This is not a volume calculator. It is a better-opportunity calculator.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Frithly is built to surface fewer, stronger outbound opportunities. The point is not
                to justify blasting more messages. It is to show how better opportunity selection can
                compound into more replies, more calls, and more revenue opportunity.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Selective recommendations protect team attention instead of padding the queue.",
                "Human-gated review and SMTP controls preserve trust before outreach starts.",
                "The best upside usually comes from better readiness and stronger contact paths, not more raw volume.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm leading-7 text-white/72">
                  <Sparkles className="mt-1 h-4 w-4 text-terracotta" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                Best next step
              </div>
              <p className="mt-3 text-sm leading-7 text-white/70">
                If this model looks directionally meaningful, the next step is not a free trial. It is
                a real ICP campaign run against your market so you can inspect the recommendation
                quality, readiness, and draft layer for yourself.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link
                    href={ROUTES.APPLY}
                    onClick={() =>
                      captureEvent("cta_clicked", {
                        location: "roi_page_bottom",
                        target: "apply_for_campaign",
                      })
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      See what your outbound pipeline actually looks like
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full">
                  <Link
                    href={ROUTES.DEMO}
                    onClick={() =>
                      captureEvent("cta_clicked", {
                        location: "roi_page_bottom",
                        target: "interactive_demo",
                      })
                    }
                  >
                    Open the interactive demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
