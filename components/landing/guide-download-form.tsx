"use client";

import Link from "next/link";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const GUIDE_URL = "/guides/frithly-signal-based-outbound-playbook.pdf";

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-frithly-display",
  weight: ["600", "700"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
});

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
  "h-12 rounded-[3px] border-[#262b31] bg-[#0c0e11]/78 px-4 text-[15px] text-[#f3f1ea] placeholder:text-[#5c636b] shadow-none focus-visible:border-[#9ba1a8] focus-visible:ring-[#e7a6d6] focus-visible:ring-offset-[#0c0e11]";

const gradientButtonClassName =
  "border-0 bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] text-[#241522] shadow-none hover:brightness-[1.08] hover:text-[#241522]";

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
      <div className="rounded-[6px] border border-[#262b31] bg-[#14171b] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.26)] sm:p-7">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[3px] border border-[#262b31] bg-[#0c0e11]/78 text-[#f3f1ea] shadow-[0_0_22px_rgba(231,166,214,0.12)]">
          <Check className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className={cn(displayFont.className, "mt-5 text-[28px] font-semibold leading-tight text-[#f3f1ea]")}>
          Your guide is ready.
        </h2>
        <p className="mt-3 text-[15px] leading-[1.7] text-[#9ba1a8]">
          We have also sent a copy to your email. You can download the complete playbook now or
          request a personalized sample next.
        </p>
        <div className="mt-6 grid gap-3">
          <Button asChild className={cn("h-[3.25rem] rounded-[3px] text-[0.95rem] font-semibold", gradientButtonClassName)}>
            <a href={GUIDE_URL} target="_blank" rel="noreferrer">
              Download the playbook
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button
            asChild
            className="h-[3.25rem] rounded-[3px] border-[#262b31] bg-transparent text-[#f3f1ea] shadow-none hover:border-[#9ba1a8] hover:bg-transparent hover:text-[#f3f1ea]"
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
      id="guide-download-form"
      className="rounded-[6px] border border-[#262b31] bg-[#14171b] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.26)] sm:p-7"
      onSubmit={handleSubmit}
    >
      <div>
        <p className={cn(monoFont.className, "text-[11px] font-medium uppercase tracking-[0.14em] text-[#e7a6d6]")}>
          Instant download
        </p>
        <h2 className={cn(displayFont.className, "mt-3 text-[28px] font-semibold leading-tight text-[#f3f1ea]")}>
          Get the complete playbook
        </h2>
        <p className="mt-3 text-[15px] leading-[1.7] text-[#9ba1a8]">
          Enter your details and receive the full 20-page guide instantly.
        </p>
      </div>

      <div className="mt-6 grid gap-4">
        <div className="space-y-2">
          <Label className="text-[14px] font-medium text-[#f3f1ea]" htmlFor="guide-first-name">
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
          <Label className="text-[14px] font-medium text-[#f3f1ea]" htmlFor="guide-work-email">
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
          <Label className="text-[14px] font-medium text-[#f3f1ea]" htmlFor="guide-company-name">
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
            <Label className="text-[14px] font-medium text-[#f3f1ea]" htmlFor="guide-company-website">
              Company website
            </Label>
            <span className={cn(monoFont.className, "text-[11px] font-medium uppercase tracking-[0.12em] text-[#5c636b]")}>
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
        className={cn("mt-6 h-14 w-full rounded-[3px] text-[0.95rem] font-semibold", gradientButtonClassName)}
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
      <p className="mt-3 text-center text-[0.76rem] leading-5 text-[#5c636b]">
        No spam. Just the guide and occasional practical outbound insights.
      </p>
    </form>
  );
}
