"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { captureEvent } from "@/lib/monitoring/posthog";
import { cn } from "@/lib/utils";

type BriefingFormState = {
  additionalRequirements: string;
  companySizes: string[];
  companyWebsite: string;
  fullName: string;
  offerDescription: string;
  targetDescription: string;
  targetRegions: string[];
  whatsapp: string;
  workEmail: string;
};

const regionOptions = [
  "United States",
  "United Kingdom",
  "Canada",
  "Europe",
  "Australia",
  "UAE",
  "India",
  "Other",
] as const;

const companySizeOptions = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

const initialState: BriefingFormState = {
  additionalRequirements: "",
  companySizes: [],
  companyWebsite: "",
  fullName: "",
  offerDescription: "",
  targetDescription: "",
  targetRegions: [],
  whatsapp: "",
  workEmail: "",
};

function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function BriefingRequestForm() {
  const [formState, setFormState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ bookingUrl?: string } | null>(null);

  const fieldClassName =
    "rounded-[3px] border-[#262b31] bg-[#14171b] text-[#f3f1ea] placeholder:text-[#5c636b] focus-visible:ring-[#e7a6d6] focus-visible:ring-offset-[#0c0e11]";
  const labelClassName = "text-[13px] font-medium text-[#f3f1ea]";
  const hintClassName = "text-[12px] leading-6 text-[#5c636b]";
  const primaryButtonClassName =
    "rounded-[3px] border-0 bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] px-5 text-[#241522] shadow-none hover:brightness-[1.08] hover:text-[#241522] focus-visible:ring-[#e7a6d6]";

  function updateField<K extends keyof BriefingFormState>(field: K, value: BriefingFormState[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function toggleValue(field: "companySizes" | "targetRegions", value: string) {
    setFormState((current) => ({
      ...current,
      [field]: current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value],
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (formState.targetRegions.length === 0) {
      setError("Pick at least one target region.");
      return;
    }

    if (formState.companySizes.length === 0) {
      setError("Pick at least one company size.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sample-request", {
        body: JSON.stringify({
          ...formState,
          companyWebsite: normalizeWebsite(formState.companyWebsite),
          requestType: "personalized_sample_leads",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as {
        bookingUrl?: string;
        error?: string;
        requestId?: string;
      };

      if (!response.ok || !result.requestId) {
        throw new Error(result.error ?? "We couldn't submit your request. Please try again.");
      }

      captureEvent("briefing_form_submitted", { location: "briefing_page" });
      setConfirmation({ bookingUrl: result.bookingUrl });
      setFormState(initialState);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't submit your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <div className="rounded-[6px] border border-[#262b31] bg-[#14171b] p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-[3px] border border-[#4bc996]/40 px-2.5 py-1 text-[12px] font-medium text-[#4bc996]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4bc996]" />
          Request received
        </div>
        <h2 className="mt-5 text-[22px] font-semibold text-[#f3f1ea]">
          I&apos;ll build the briefing and email it to you.
        </h2>
        <p className="mt-4 text-[15px] leading-[1.7] text-[#9ba1a8]">
          You&apos;ll get a confirmation from hello@frithly.com now, and the briefing itself once
          the account is sourced and the contacts are verified — usually within two working days. No
          sequence, no follow-up campaign aimed at you.
        </p>
        {confirmation.bookingUrl ? (
          <div className="mt-6">
            <Button asChild className={primaryButtonClassName} size="lg">
              <a href={confirmation.bookingUrl} rel="noreferrer" target="_blank">
                Book a walkthrough (optional)
              </a>
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="briefing-name">Full name</Label>
          <Input
            className={fieldClassName}
            id="briefing-name"
            onChange={(event) => updateField("fullName", event.target.value)}
            placeholder="Alex Morgan"
            required
            value={formState.fullName}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="briefing-email">Work email</Label>
          <Input
            className={fieldClassName}
            id="briefing-email"
            onChange={(event) => updateField("workEmail", event.target.value)}
            placeholder="alex@company.com"
            required
            type="email"
            value={formState.workEmail}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="briefing-website">Company website</Label>
          <Input
            className={fieldClassName}
            id="briefing-website"
            onChange={(event) => updateField("companyWebsite", event.target.value)}
            placeholder="yourcompany.com"
            required
            value={formState.companyWebsite}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="briefing-whatsapp">WhatsApp (optional)</Label>
          <Input
            className={fieldClassName}
            id="briefing-whatsapp"
            onChange={(event) => updateField("whatsapp", event.target.value)}
            placeholder="+44 7700 900123"
            value={formState.whatsapp}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className={labelClassName} htmlFor="briefing-offer">What do you sell?</Label>
          <Textarea
            className={fieldClassName}
            id="briefing-offer"
            maxLength={500}
            minLength={10}
            onChange={(event) => updateField("offerDescription", event.target.value)}
            placeholder="One or two sentences on the product and the problem it removes."
            required
            rows={3}
            value={formState.offerDescription}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className={labelClassName} htmlFor="briefing-target">Who do you want to reach?</Label>
          <Textarea
            className={fieldClassName}
            id="briefing-target"
            maxLength={500}
            minLength={10}
            onChange={(event) => updateField("targetDescription", event.target.value)}
            placeholder="Industry, the roles that sign off, and anything that disqualifies an account."
            required
            rows={3}
            value={formState.targetDescription}
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label className={labelClassName}>Target regions</Label>
          <div className="flex flex-wrap gap-2">
            {regionOptions.map((region) => {
              const isOn = formState.targetRegions.includes(region);

              return (
                <button
                  className={cn(
                    "rounded-[3px] border px-3 py-2 text-[13px] transition-colors",
                    isOn
                      ? "border-[#e7a6d6] bg-[#1b1f24] text-[#f3f1ea]"
                      : "border-[#262b31] bg-[#14171b] text-[#9ba1a8] hover:border-[#9ba1a8]",
                  )}
                  key={region}
                  onClick={() => toggleValue("targetRegions", region)}
                  type="button"
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label className={labelClassName}>Company size</Label>
          <div className="flex flex-wrap gap-2">
            {companySizeOptions.map((size) => {
              const isOn = formState.companySizes.includes(size);

              return (
                <button
                  className={cn(
                    "rounded-[3px] border px-3 py-2 text-[13px] transition-colors",
                    isOn
                      ? "border-[#e7a6d6] bg-[#1b1f24] text-[#f3f1ea]"
                      : "border-[#262b31] bg-[#14171b] text-[#9ba1a8] hover:border-[#9ba1a8]",
                  )}
                  key={size}
                  onClick={() => toggleValue("companySizes", size)}
                  type="button"
                >
                  {size} employees
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className={labelClassName} htmlFor="briefing-notes">Anything else? (optional)</Label>
          <Textarea
            className={fieldClassName}
            id="briefing-notes"
            maxLength={2000}
            onChange={(event) => updateField("additionalRequirements", event.target.value)}
            placeholder="Accounts to avoid, a trigger you care about most, a competitor you keep losing to."
            rows={3}
            value={formState.additionalRequirements}
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-[3px] border border-[#c75c4a]/50 bg-[#c75c4a]/10 px-4 py-3 text-[13px] text-[#f3f1ea]">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-[#1e2227] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn(hintClassName, "max-w-[38ch]")}>
          One briefing, built for your market. No call required and no sequence aimed at you
          afterwards.
        </p>
        <Button className={`w-full sm:w-auto ${primaryButtonClassName}`} disabled={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Sending..." : "Request the briefing"}
        </Button>
      </div>
    </form>
  );
}
