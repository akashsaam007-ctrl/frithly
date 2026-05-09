"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CircleDollarSign,
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

type CurrencyOption = "EUR" | "GBP" | "INR" | "USD";

type RoiFormState = {
  averageClientValue: number;
  currency: CurrencyOption;
  currentReplyRate: number;
  outboundVolume: number;
};

type RoiNumericField = Exclude<keyof RoiFormState, "currency">;
type RoiInputState = Record<RoiNumericField, string>;

const QUALIFIED_REPLY_TO_MEETING_RATE = 0.4;
const MEETINGS_PER_CLIENT = 5;
const MIN_CLIENT_VALUE = 1000;
const MAX_CLIENT_VALUE = 5000000;
const MIN_OUTBOUND_VOLUME = 25;
const MAX_OUTBOUND_VOLUME = 2000;
const MIN_REPLY_RATE = 1;
const MAX_CURRENT_REPLY_RATE = 12;
const MAX_IMPROVED_REPLY_RATE = 18;
const TARGETING_MULTIPLIER = 3;
const MIN_REPLY_RATE_LIFT = 3;

const presets: Array<{
  description: string;
  id: string;
  label: string;
  state: RoiFormState;
}> = [
  {
    description: "A smaller founder-led team with a low baseline reply rate.",
    id: "lean-agency",
    label: "Lean agency",
    state: {
      averageClientValue: 5000,
      currency: "GBP",
      currentReplyRate: 2,
      outboundVolume: 100,
    },
  },
  {
    description: "A growing team with steadier outbound volume and mid-ticket deals.",
    id: "growth-team",
    label: "Growth team",
    state: {
      averageClientValue: 9000,
      currency: "USD",
      currentReplyRate: 4,
      outboundVolume: 180,
    },
  },
  {
    description: "A services motion where every extra client win materially changes monthly revenue.",
    id: "india-services",
    label: "Services team",
    state: {
      averageClientValue: 200000,
      currency: "INR",
      currentReplyRate: 3,
      outboundVolume: 150,
    },
  },
];

const stepContent = [
  {
    description: "Keep this to real monthly outreach volume, not your theoretical max.",
    title: "How many businesses do you contact each month?",
  },
  {
    description: "This is your current baseline today, not your best week.",
    title: "What percentage usually reply?",
  },
  {
    description: "Use a realistic average, not a top-end upside case.",
    title: "What is one client worth?",
  },
] as const;

const initialFormState = presets[0].state;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getCurrencyLocale(currency: CurrencyOption) {
  return currency === "INR" ? "en-IN" : "en-GB";
}

function formatMoney(value: number, currency: CurrencyOption, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(getCurrencyLocale(currency), {
    currency,
    maximumFractionDigits,
    style: "currency",
  }).format(value);
}

function formatCompactMoney(value: number, currency: CurrencyOption) {
  if (Math.abs(value) < 10000) {
    return formatMoney(value, currency);
  }

  return new Intl.NumberFormat(getCurrencyLocale(currency), {
    currency,
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  }).format(value);
}

function formatMaybeDecimal(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits,
    minimumFractionDigits:
      value > 0 && value < 10 && Math.abs(value - Math.round(value)) > 0.001 ? 1 : 0,
  }).format(value);
}

function formatPercent(value: number, maximumFractionDigits = 0) {
  return `${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits,
  }).format(value)}%`;
}

function formatInputState(formState: RoiFormState): RoiInputState {
  return {
    averageClientValue: String(formState.averageClientValue),
    currentReplyRate: String(formState.currentReplyRate),
    outboundVolume: String(formState.outboundVolume),
  };
}

function normalizeFormState<K extends keyof RoiFormState>(
  current: RoiFormState,
  field: K,
  nextValue: RoiFormState[K],
) {
  const nextState = { ...current, [field]: nextValue };

  if (field === "averageClientValue") {
    nextState.averageClientValue = clamp(Number(nextValue), MIN_CLIENT_VALUE, MAX_CLIENT_VALUE);
  }

  if (field === "currentReplyRate") {
    nextState.currentReplyRate = clamp(Number(nextValue), MIN_REPLY_RATE, MAX_CURRENT_REPLY_RATE);
  }

  if (field === "outboundVolume") {
    nextState.outboundVolume = clamp(Number(nextValue), MIN_OUTBOUND_VOLUME, MAX_OUTBOUND_VOLUME);
  }

  return nextState;
}

function getImprovedReplyRate(currentReplyRate: number) {
  return Math.min(
    Math.max(currentReplyRate * TARGETING_MULTIPLIER, currentReplyRate + MIN_REPLY_RATE_LIFT),
    MAX_IMPROVED_REPLY_RATE,
  );
}

function calculateModel(formState: RoiFormState) {
  const improvedReplyRate = getImprovedReplyRate(formState.currentReplyRate);
  const currentReplies = formState.outboundVolume * (formState.currentReplyRate / 100);
  const improvedReplies = formState.outboundVolume * (improvedReplyRate / 100);
  const currentMeetings = currentReplies * QUALIFIED_REPLY_TO_MEETING_RATE;
  const improvedMeetings = improvedReplies * QUALIFIED_REPLY_TO_MEETING_RATE;
  const currentClients = currentMeetings / MEETINGS_PER_CLIENT;
  const improvedClients = improvedMeetings / MEETINGS_PER_CLIENT;
  const currentRevenue = currentClients * formState.averageClientValue;
  const improvedRevenue = improvedClients * formState.averageClientValue;
  const revenueLift = improvedRevenue - currentRevenue;
  const replyMultiplier = currentReplies > 0 ? improvedReplies / currentReplies : 1;
  const sampleCurrentReplies = clamp(Math.round(formState.currentReplyRate), 0, 100);
  const sampleImprovedReplies = clamp(Math.round(improvedReplyRate), 0, 100);

  return {
    annualRevenueLift: revenueLift * 12,
    currentClients,
    currentMeetings,
    currentReplies,
    currentRevenue,
    extraMeetings: improvedMeetings - currentMeetings,
    extraReplies: improvedReplies - currentReplies,
    extraRevenue: revenueLift,
    ignoredToday: 100 - sampleCurrentReplies,
    ignoredWithBetterTargeting: 100 - sampleImprovedReplies,
    improvedClients,
    improvedMeetings,
    improvedReplies,
    improvedReplyRate,
    improvedRevenue,
    repliesPerWinNow:
      currentClients > 0 ? formState.outboundVolume / currentClients : formState.outboundVolume,
    repliesPerWinWithBetterTargeting:
      improvedClients > 0 ? formState.outboundVolume / improvedClients : formState.outboundVolume,
    replyMultiplier,
    sampleCurrentReplies,
    sampleImprovedReplies,
  };
}

function ReplyGrid({
  replies,
  title,
  tone,
}: {
  replies: number;
  title: string;
  tone: "current" | "improved";
}) {
  const cells = Array.from({ length: 100 }, (_, index) => index < replies);

  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">Out of 100 leads</div>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            tone === "improved" ? "bg-emerald-400/15 text-emerald-200" : "bg-white/10 text-white"
          }`}
        >
          {replies} reply
        </div>
      </div>

      <div className="mt-4 grid grid-cols-10 gap-1.5">
        {cells.map((isReply, index) => (
          <div
            key={`${title}-${index}`}
            className={`h-4 rounded-[0.35rem] ${
              isReply ? "bg-emerald-400" : "bg-rose-300/75"
            }`}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-white/70">{100 - replies} ignore</span>
        <span className="font-semibold text-white">{replies} reply</span>
      </div>
    </div>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.05] px-4 py-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
        <Icon className="h-4 w-4 text-terracotta" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</div>
    </div>
  );
}

export function RoiCalculatorExperience() {
  const [formState, setFormState] = useState<RoiFormState>(initialFormState);
  const [inputState, setInputState] = useState<RoiInputState>(() => formatInputState(initialFormState));
  const [currentStep, setCurrentStep] = useState(0);
  const hasTrackedInitialUpdateRef = useRef(false);

  const model = useMemo(() => calculateModel(formState), [formState]);
  const activePreset = useMemo(
    () =>
      presets.find(
        (preset) =>
          preset.state.averageClientValue === formState.averageClientValue &&
          preset.state.currency === formState.currency &&
          preset.state.currentReplyRate === formState.currentReplyRate &&
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
        current_reply_rate: formState.currentReplyRate,
        currency: formState.currency,
        outbound_volume: formState.outboundVolume,
      });
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [formState]);

  function updateNumericInput(field: RoiNumericField, value: string) {
    setInputState((current) => ({ ...current, [field]: value }));

    if (!value.trim()) {
      return;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    setFormState((current) => normalizeFormState(current, field, parsedValue));
  }

  function commitNumericInput(field: RoiNumericField) {
    const trimmedValue = inputState[field].trim();
    const parsedValue = trimmedValue ? Number(trimmedValue) : formState[field];
    const nextState = normalizeFormState(
      formState,
      field,
      Number.isFinite(parsedValue) ? parsedValue : formState[field],
    );

    setFormState(nextState);
    setInputState(formatInputState(nextState));
  }

  function setRangeValue(field: RoiNumericField, value: number) {
    const nextState = normalizeFormState(formState, field, value);
    setFormState(nextState);
    setInputState(formatInputState(nextState));
  }

  function applyPreset(presetId: string) {
    const preset = presets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setFormState(preset.state);
    setInputState(formatInputState(preset.state));
    setCurrentStep(3);
  }

  function goToNextStep() {
    if (currentStep < 3) {
      setCurrentStep((step) => step + 1);
    }
  }

  function goToPreviousStep() {
    if (currentStep > 0) {
      setCurrentStep((step) => step - 1);
    }
  }

  const clientValueChips: Record<CurrencyOption, number[]> = {
    EUR: [4000, 8000, 15000],
    GBP: [3000, 5000, 10000],
    INR: [100000, 200000, 500000],
    USD: [5000, 10000, 20000],
  };

  const resultTone =
    model.extraRevenue >= formState.averageClientValue
      ? "meaningful"
      : model.extraRevenue >= formState.averageClientValue * 0.5
        ? "promising"
        : "early";

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="section-eyebrow">Quick scenarios</div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activePreset?.id === preset.id
                  ? "border-terracotta bg-terracotta/10 text-terracotta"
                  : "border-border bg-white text-ink hover:border-ink"
              }`}
              onClick={() => applyPreset(preset.id)}
              type="button"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">
          Start with a preset or answer the three questions below.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="surface-card p-6 shadow-[0_22px_70px_rgba(26,26,26,0.08)] sm:p-7">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {stepContent.map((step, index) => {
                const isActive = currentStep === index;
                const isComplete = currentStep > index || currentStep === 3;

                return (
                  <button
                    key={step.title}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                      isActive
                        ? "border-terracotta bg-terracotta/10 text-terracotta"
                        : isComplete
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-border bg-white text-muted"
                    }`}
                    onClick={() => setCurrentStep(index)}
                    type="button"
                  >
                    {`Step ${index + 1}`}
                  </button>
                );
              })}
            </div>

            {currentStep < 3 ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="section-eyebrow">{`Question ${currentStep + 1}`}</div>
                  <div>
                    <h2 className="max-w-xl text-3xl font-semibold text-ink sm:text-4xl">
                      {stepContent[currentStep].title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-muted">{stepContent[currentStep].description}</p>
                  </div>
                </div>

                {currentStep === 0 ? (
                  <div className="space-y-5">
                    <div className="rounded-[1.3rem] border border-border/70 bg-stone-50 p-5">
                      <div className="text-5xl font-semibold tracking-tight text-ink">
                        {formatMaybeDecimal(formState.outboundVolume, 0)}
                      </div>
                      <div className="mt-2 text-sm text-muted">businesses contacted each month</div>
                      <input
                        className="mt-6 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-terracotta"
                        max={MAX_OUTBOUND_VOLUME}
                        min={MIN_OUTBOUND_VOLUME}
                        onChange={(event) => setRangeValue("outboundVolume", Number(event.target.value))}
                        step={25}
                        type="range"
                        value={formState.outboundVolume}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div className="space-y-2">
                        <Label htmlFor="outboundVolume">Monthly outbound volume</Label>
                        <Input
                          id="outboundVolume"
                          max={MAX_OUTBOUND_VOLUME}
                          min={MIN_OUTBOUND_VOLUME}
                          onBlur={() => commitNumericInput("outboundVolume")}
                          onChange={(event) => updateNumericInput("outboundVolume", event.target.value)}
                          type="number"
                          value={inputState.outboundVolume}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {[100, 250, 500].map((value) => (
                          <button
                            key={value}
                            className="rounded-full border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
                            onClick={() => setRangeValue("outboundVolume", value)}
                            type="button"
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {currentStep === 1 ? (
                  <div className="space-y-5">
                    <div className="rounded-[1.3rem] border border-border/70 bg-stone-50 p-5">
                      <div className="text-5xl font-semibold tracking-tight text-ink">
                        {formatPercent(formState.currentReplyRate, 1)}
                      </div>
                      <div className="mt-2 text-sm text-muted">reply rate today</div>
                      <input
                        className="mt-6 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-terracotta"
                        max={MAX_CURRENT_REPLY_RATE}
                        min={MIN_REPLY_RATE}
                        onChange={(event) => setRangeValue("currentReplyRate", Number(event.target.value))}
                        step={0.5}
                        type="range"
                        value={formState.currentReplyRate}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div className="space-y-2">
                        <Label htmlFor="currentReplyRate">Current reply rate</Label>
                        <Input
                          id="currentReplyRate"
                          max={MAX_CURRENT_REPLY_RATE}
                          min={MIN_REPLY_RATE}
                          onBlur={() => commitNumericInput("currentReplyRate")}
                          onChange={(event) => updateNumericInput("currentReplyRate", event.target.value)}
                          type="number"
                          value={inputState.currentReplyRate}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {[2, 5, 8].map((value) => (
                          <button
                            key={value}
                            className="rounded-full border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
                            onClick={() => setRangeValue("currentReplyRate", value)}
                            type="button"
                          >
                            {formatPercent(value)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {currentStep === 2 ? (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-[0.34fr_0.66fr]">
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Select
                          onValueChange={(value) =>
                            setFormState((current) => ({
                              ...current,
                              currency: value as CurrencyOption,
                            }))
                          }
                          value={formState.currency}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="INR">INR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="averageClientValue">Average client value</Label>
                        <Input
                          id="averageClientValue"
                          max={MAX_CLIENT_VALUE}
                          min={MIN_CLIENT_VALUE}
                          onBlur={() => commitNumericInput("averageClientValue")}
                          onChange={(event) => updateNumericInput("averageClientValue", event.target.value)}
                          type="number"
                          value={inputState.averageClientValue}
                        />
                      </div>
                    </div>

                    <div className="rounded-[1.3rem] border border-border/70 bg-stone-50 p-5">
                      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                        One client is worth
                      </div>
                      <div className="mt-3 text-4xl font-semibold tracking-tight text-ink">
                        {formatMoney(formState.averageClientValue, formState.currency)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {clientValueChips[formState.currency].map((value) => (
                        <button
                          key={`${formState.currency}-${value}`}
                          className="rounded-full border border-border bg-white px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-ink"
                          onClick={() => setRangeValue("averageClientValue", value)}
                          type="button"
                        >
                          {formatMoney(value, formState.currency)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    disabled={currentStep === 0}
                    size="lg"
                    variant="ghost"
                    onClick={goToPreviousStep}
                  >
                    Back
                  </Button>
                  <Button size="lg" onClick={goToNextStep}>
                    <span className="inline-flex items-center gap-2">
                      {currentStep === 2 ? "Show my estimate" : "Continue"}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="section-eyebrow">Your baseline</div>
                  <h2 className="max-w-xl text-3xl font-semibold text-ink sm:text-4xl">
                    The estimate is based on just three inputs.
                  </h2>
                  <p className="max-w-2xl text-muted">
                    Same outreach volume. Same team. Better targeting.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: "Businesses contacted / month",
                      value: formatMaybeDecimal(formState.outboundVolume, 0),
                    },
                    {
                      label: "Reply rate today",
                      value: formatPercent(formState.currentReplyRate, 1),
                    },
                    {
                      label: "Average client value",
                      value: formatMoney(formState.averageClientValue, formState.currency),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 rounded-[1rem] border border-border/70 bg-stone-50 px-4 py-4"
                    >
                      <span className="text-sm text-muted">{item.label}</span>
                      <span className="text-lg font-semibold text-ink">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.2rem] border border-border/70 bg-stone-50 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-5 w-5 text-terracotta" aria-hidden="true" />
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-ink">Assumptions behind the result</div>
                      <p className="text-sm leading-7 text-muted">
                        We model better targeting as a lift from {formatPercent(formState.currentReplyRate, 1)} to{" "}
                        {formatPercent(model.improvedReplyRate, 1)} replies, with about{" "}
                        {formatPercent(QUALIFIED_REPLY_TO_MEETING_RATE * 100)} of replies becoming meetings
                        and 1 client win per {MEETINGS_PER_CLIENT} meetings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button size="lg" variant="secondary" onClick={() => setCurrentStep(0)}>
                    Edit inputs
                  </Button>
                  <Button size="lg" variant="ghost" onClick={() => applyPreset("lean-agency")}>
                    Reset to example
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {currentStep < 3 ? (
          <div className="surface-card-dark animated-glow overflow-hidden p-6 shadow-[0_30px_90px_rgba(12,12,12,0.34)] sm:p-7">
            <div className="space-y-6">
              <Badge className="border-white/10 bg-white/10 text-white" variant="outline">
                Live preview
              </Badge>

              <div className="space-y-3">
                <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-4xl">
                  Out of 100 leads, about {model.sampleCurrentReplies} reply today.
                </h2>
                <p className="max-w-2xl text-white/70">
                  That currently turns into about {formatMaybeDecimal(model.currentMeetings)} meetings and{" "}
                  {formatMaybeDecimal(model.currentClients)} expected client wins per month.
                </p>
              </div>

              <ReplyGrid replies={model.sampleCurrentReplies} title="Today" tone="current" />

              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryMetric
                  icon={MailCheck}
                  label="Replies / month"
                  value={formatMaybeDecimal(model.currentReplies)}
                />
                <SummaryMetric
                  icon={CircleDollarSign}
                  label="Revenue / month"
                  value={formatCompactMoney(model.currentRevenue, formState.currency)}
                />
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-5">
                <div className="text-sm font-semibold text-white">What happens next</div>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Finish the three questions and we&apos;ll estimate how much more revenue stronger
                  targeting could unlock without increasing outreach volume.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="surface-card-dark animated-glow overflow-hidden p-6 shadow-[0_30px_90px_rgba(12,12,12,0.34)] sm:p-7">
            <div className="space-y-6">
              <Badge className="border-white/10 bg-white/10 text-white" variant="outline">
                Estimated upside
              </Badge>

              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                  {resultTone === "meaningful"
                    ? "Meaningful upside"
                    : resultTone === "promising"
                      ? "Promising upside"
                      : "Early upside"}
                </div>
                <div className="space-y-3">
                  <h2 className="max-w-3xl text-3xl font-semibold text-white sm:text-5xl">
                    You are likely losing {formatMoney(model.extraRevenue, formState.currency)}/month
                    from weak targeting.
                  </h2>
                  <p className="max-w-2xl text-white/72">
                    With better targeting, you could get{" "}
                    {`${formatMaybeDecimal(model.replyMultiplier, 1)}x more replies`} without increasing
                    outreach.
                  </p>
                  <p className="text-sm text-white/60">
                    Annual upside: {formatCompactMoney(model.annualRevenueLift, formState.currency)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <ReplyGrid replies={model.sampleCurrentReplies} title="Today" tone="current" />
                <ReplyGrid
                  replies={model.sampleImprovedReplies}
                  title="With better targeting"
                  tone="improved"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryMetric
                  icon={MailCheck}
                  label="Extra replies / month"
                  value={formatMaybeDecimal(model.extraReplies)}
                />
                <SummaryMetric
                  icon={Target}
                  label="Extra meetings / month"
                  value={formatMaybeDecimal(model.extraMeetings)}
                />
                <SummaryMetric
                  icon={CircleDollarSign}
                  label="Extra revenue / month"
                  value={formatCompactMoney(model.extraRevenue, formState.currency)}
                />
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.05] p-5">
                <div className="text-sm font-semibold text-white">Plain-English takeaway</div>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  At your current baseline, you need about {formatMaybeDecimal(model.repliesPerWinNow, 0)}{" "}
                  contacted businesses to create one client win. With stronger targeting, that drops to
                  about {formatMaybeDecimal(model.repliesPerWinWithBetterTargeting, 0)}.
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
                    Open the interactive demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
