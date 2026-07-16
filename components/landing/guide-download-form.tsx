"use client";

import Link from "next/link";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const GUIDE_URL = "/guides/frithly-signal-based-outbound-playbook.pdf";

type FormState = {
  companyName: string;
  companyWebsite: string;
  firstName: string;
  workEmail: string;
};

const initialFormState: FormState = {
  companyName: "",
  companyWebsite: "",
  firstName: "",
  workEmail: "",
};

const inputClassName =
  "h-12 rounded-[0.85rem] border-white/[0.1] bg-white/[0.035] px-4 text-[0.92rem] text-white placeholder:text-white/34 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-visible:border-white/[0.2] focus-visible:ring-[rgba(201,183,255,0.24)] focus-visible:ring-offset-[#050507]";

const gradientButtonClassName =
  "border-transparent bg-[linear-gradient(135deg,#ffd083_0%,#f3a0d5_52%,#9e8cff_100%)] text-[#050507] shadow-[0_18px_52px_rgba(158,140,255,0.18)] hover:brightness-[1.03] hover:text-[#050507]";

export function GuideDownloadForm() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    setError(null);
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/guide-download", {
        body: JSON.stringify(formState),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        success?: boolean;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? "We could not prepare the guide right now.");
      }

      setIsSubmitted(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We could not prepare the guide right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-[1.35rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.36)] sm:p-7">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white shadow-[0_0_34px_rgba(158,140,255,0.2)]">
          <Check className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-[1.75rem] font-semibold leading-tight tracking-[-0.04em] text-white">
          Your guide is ready.
        </h2>
        <p className="mt-3 text-[0.95rem] leading-7 text-white/66">
          We have also sent a copy to your email. You can download the complete playbook now or
          request a personalized sample next.
        </p>
        <div className="mt-6 grid gap-3">
          <Button asChild className={cn("h-[3.25rem] rounded-[0.9rem] text-[0.95rem] font-semibold", gradientButtonClassName)}>
            <a href={GUIDE_URL} target="_blank" rel="noreferrer">
              Download the playbook
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button
            asChild
            className="h-[3.25rem] rounded-[0.9rem] border-white/[0.1] bg-white/[0.03] text-white shadow-none hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white"
            variant="secondary"
          >
            <Link href="/sample">Request a personalized sample</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      id="download-guide"
      className="rounded-[1.35rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.36)] sm:p-7"
      onSubmit={handleSubmit}
    >
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/44">
          Instant download
        </p>
        <h2 className="mt-3 text-[1.65rem] font-semibold tracking-[-0.04em] text-white">
          Get the complete playbook
        </h2>
        <p className="mt-2 text-[0.94rem] leading-6 text-white/62">
          Enter your details and receive the full 20-page guide instantly.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="space-y-2">
          <Label className="text-[0.82rem] font-medium text-white/82" htmlFor="guide-first-name">
            First name
          </Label>
          <Input
            id="guide-first-name"
            autoComplete="given-name"
            className={inputClassName}
            required
            value={formState.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            placeholder="Alex"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[0.82rem] font-medium text-white/82" htmlFor="guide-work-email">
            Work email
          </Label>
          <Input
            id="guide-work-email"
            autoComplete="email"
            className={inputClassName}
            required
            type="email"
            value={formState.workEmail}
            onChange={(event) => updateField("workEmail", event.target.value)}
            placeholder="alex@company.com"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[0.82rem] font-medium text-white/82" htmlFor="guide-company-name">
            Company name
          </Label>
          <Input
            id="guide-company-name"
            autoComplete="organization"
            className={inputClassName}
            required
            value={formState.companyName}
            onChange={(event) => updateField("companyName", event.target.value)}
            placeholder="Northstar Systems"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label className="text-[0.82rem] font-medium text-white/82" htmlFor="guide-company-website">
              Company website
            </Label>
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/34">
              Optional
            </span>
          </div>
          <Input
            id="guide-company-website"
            autoComplete="url"
            className={inputClassName}
            value={formState.companyWebsite}
            onChange={(event) => updateField("companyWebsite", event.target.value)}
            placeholder="company.com"
          />
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-[0.85rem] border border-[#fb7185]/30 bg-[#2a1117]/65 px-4 py-3 text-[0.84rem] leading-6 text-[#ffd4dc]">
          {error}
        </p>
      ) : null}

      <Button
        className={cn("mt-6 h-14 w-full rounded-[0.95rem] text-[0.95rem] font-semibold", gradientButtonClassName)}
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Preparing guide...
          </>
        ) : (
          <>
            Get the free playbook
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </>
        )}
      </Button>
      <p className="mt-3 text-center text-[0.76rem] leading-5 text-white/42">
        No spam. Just the guide and occasional practical outbound insights.
      </p>
    </form>
  );
}
