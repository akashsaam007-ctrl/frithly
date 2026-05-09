"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CircleDollarSign,
  GaugeCircle,
  MailCheck,
  ShieldCheck,
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

  const comparisonRows = [
    {
      change: `+${formatMaybeDecimal(model.additionalReplies)} replies`,
      current: formatMaybeDecimal(model.currentReplies),
      improved: formatMaybeDecimal(model.improvedReplies),
      label: "Replies / month",
    },
    {
      change: `+${formatMaybeDecimal(model.additionalMeetings)} meetings`,
      current: formatMaybeDecimal(model.currentMeetings),
      improved: formatMaybeDecimal(model.improvedMeetings),
      label: "Qualified meetings / month",
    },
    {
      change: `+${formatMaybeDecimal(model.additionalClients)} clients`,
      current: formatMaybeDecimal(model.currentClients),
      improved: formatMaybeDecimal(model.improvedClients),
      label: "Expected clients / month",
    },
    {
      change: `+${formatCompactMoney(model.incrementalRevenue, formState.currency)}`,
      current: formatCompactMoney(model.currentRevenue, formState.currency),
      improved: formatCompactMoney(model.improvedRevenue, formState.currency),
      label: "Projected revenue / month",
    },
  ];

  const summaryMetrics = [
    {
      icon: CircleDollarSign,
      label: "Extra revenue / month",
      value: formatCompactMoney(model.incrementalRevenue, formState.currency),
    },
    {
      icon: MailCheck,
      label: "Extra meetings / month",
      value: formatMaybeDecimal(model.additionalMeetings),
    },
    {
      icon: GaugeCircle,
      label: "Less outbound per win",
      value: formatPercent(model.wastedOutboundReduction),
    },
    {
      icon: Target,
      label: "Efficiency lift",
      value: formatPercent(model.efficiencyLift),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="surface-card p-6 shadow-[0_22px_70px_rgba(26,26,26,0.08)] sm:p-7">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="section-eyebrow">1. Enter your baseline</div>
              <div>
                <h2 className="max-w-xl text-3xl font-semibold text-ink sm:text-4xl">
                  Start with the numbers you already know.
                </h2>
                <p className="mt-3 max-w-2xl text-muted">
                  Keep this directional and conservative. We hold monthly opportunity volume steady,
                  then show what better lead quality could change.
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
                  <div className="text-sm font-semibold text-ink">How we keep this conservative</div>
                  <p className="text-sm leading-7 text-muted">
                    We assume about {formatPercent(QUALIFIED_REPLY_TO_MEETING_RATE * 100)} of qualified
                    replies turn into meetings, then we use the tighter of your close-rate math and
                    meetings-needed math so the upside does not get overstated.
                  </p>
                  {model.closeRateGap > 2 ? (
                    <p className="text-xs leading-6 text-terracotta">
                      Your meetings-needed input implies about{" "}
                      {formatPercent(model.closeRateImpliedByMeetingsNeeded, 1)} close rate on its own,
                      so we keep the stricter assumption.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card-dark animated-glow overflow-hidden p-6 shadow-[0_30px_90px_rgba(12,12,12,0.34)] sm:p-7">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge className="border-white/10 bg-white/10 text-white" variant="outline">
                2. Read the estimate
              </Badge>
              <div className="space-y-3">
                <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                  {formatCurrency(model.annualRevenueUnlocked, formState.currency)} in annual upside
                  from the same monthly volume.
                </h2>
                <p className="max-w-2xl text-white/70">
                  This assumes your reply rate moves from {formatPercent(formState.currentReplyRate)} to{" "}
                  {formatPercent(formState.improvedReplyRate)} while outbound volume stays at{" "}
                  {formatMaybeDecimal(formState.outboundVolume, 0)} opportunities per month.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.05] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                  Today
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  {formatCompactMoney(model.currentRevenue, formState.currency)}
                </div>
                <div className="mt-2 text-sm text-white/65">Projected revenue / month</div>
                <div className="mt-5 space-y-2 text-sm text-white/72">
                  <div className="flex items-center justify-between gap-3">
                    <span>Replies</span>
                    <span className="font-semibold text-white">{formatMaybeDecimal(model.currentReplies)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Meetings</span>
                    <span className="font-semibold text-white">{formatMaybeDecimal(model.currentMeetings)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Expected clients</span>
                    <span className="font-semibold text-white">{formatMaybeDecimal(model.currentClients)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-terracotta/20 bg-white/[0.06] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                  With stronger lead quality
                </div>
                <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  {formatCurrency(model.improvedRevenue, formState.currency)}
                </div>
                <div className="mt-2 text-sm text-white/65">Projected revenue / month</div>
                <div className="mt-5 space-y-2 text-sm text-white/72">
                  <div className="flex items-center justify-between gap-3">
                    <span>Replies</span>
                    <span className="font-semibold text-white">{formatMaybeDecimal(model.improvedReplies)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Meetings</span>
                    <span className="font-semibold text-white">{formatMaybeDecimal(model.improvedMeetings)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Expected clients</span>
                    <span className="font-semibold text-white">{formatMaybeDecimal(model.improvedClients)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryMetrics.map((metric) => (
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
              <div className="text-sm font-semibold text-white">Plain-English takeaway</div>
              <p className="mt-3 text-sm leading-7 text-white/70">
                Right now you need about {formatMaybeDecimal(model.currentOutboundPerClientWin, 0)}{" "}
                opportunities to create one client win. If stronger opportunity quality lifts reply
                performance to {formatPercent(formState.improvedReplyRate)}, that drops to about{" "}
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

      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="surface-card overflow-hidden p-6 shadow-[0_22px_70px_rgba(26,26,26,0.08)] sm:p-7">
          <div className="space-y-3">
            <div className="section-eyebrow">3. Compare the before and after</div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">
              The opportunity count stays the same. The output changes.
            </h2>
            <p className="max-w-3xl text-muted">
              This is the simplest way to read the model: same monthly volume, stronger lead quality,
              better commercial output.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {comparisonRows.map((row) => (
              <div
                key={row.label}
                className="grid gap-3 rounded-[1.2rem] border border-border/70 bg-stone-50 p-4 md:grid-cols-[1.1fr_0.7fr_0.7fr_auto] md:items-center"
              >
                <div>
                  <div className="text-sm font-semibold text-ink">{row.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">Same volume model</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted">Today</div>
                  <div className="mt-1 text-lg font-semibold text-ink">{row.current}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-muted">With Frithly-style quality</div>
                  <div className="mt-1 text-lg font-semibold text-ink">{row.improved}</div>
                </div>
                <div className="inline-flex rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta">
                  {row.change}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card-dark p-6 shadow-[0_28px_80px_rgba(12,12,12,0.32)] sm:p-7">
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                Best next step
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
                If the upside looks meaningful, test it against your real ICP.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/70">
                This is a directional model, not a guarantee. The useful next step is to run one real
                campaign and inspect the recommendation quality, readiness, and draft layer yourself.
              </p>
            </div>

            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                What you are really testing
              </div>
              <div className="mt-4 space-y-3 text-sm leading-7 text-white/72">
                <div>Whether better opportunity selection can raise reply quality without raising send volume.</div>
                <div>Whether stronger contact paths create more meetings from the same outbound effort.</div>
                <div>Whether a selective queue is worth more to your team than a bigger noisy list.</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
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
                    Apply for a custom campaign
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
  );
}
