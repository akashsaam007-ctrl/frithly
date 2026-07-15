"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BOOKING_URL } from "@/lib/constants";
import type { AnalyticsEventName } from "@/lib/monitoring/events";
import { captureEvent } from "@/lib/monitoring/posthog";
import { cn } from "@/lib/utils";

type FormStep = 1 | 2;

type ConfirmationState = {
  bookingUrl: string;
  requestId: string;
};

type SampleRequestFormState = {
  additionalRequirements: string;
  companySizes: string[];
  companyWebsite: string;
  fullName: string;
  offerDescription: string;
  targetDescription: string;
  targetRegions: string[];
  whatsappCode: string;
  whatsappNumber: string;
  workEmail: string;
};

type SampleRequestPayload = {
  additionalRequirements: string;
  companySizes: string[];
  companyWebsite: string;
  fullName: string;
  offerDescription: string;
  requestType: "personalized_sample_leads";
  targetDescription: string;
  targetRegions: string[];
  whatsapp: string;
  workEmail: string;
};

type FormErrors = Partial<Record<
  | "companySizes"
  | "companyWebsite"
  | "fullName"
  | "offerDescription"
  | "targetDescription"
  | "targetRegions"
  | "workEmail",
  string
>>;

const countryCodeOptions = [
  { label: "India (+91)", value: "+91" },
  { label: "United States (+1)", value: "+1" },
  { label: "United Kingdom (+44)", value: "+44" },
  { label: "Canada (+1)", value: "+1-ca" },
  { label: "Australia (+61)", value: "+61" },
  { label: "UAE (+971)", value: "+971" },
] as const;

const regionOptions = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "UAE",
  "Europe",
  "India",
  "Other",
] as const;

const companySizeOptions = ["1-10", "11-50", "51-200", "201-500", "500+"] as const;

const initialFormState: SampleRequestFormState = {
  additionalRequirements: "",
  companySizes: [],
  companyWebsite: "",
  fullName: "",
  offerDescription: "",
  targetDescription: "",
  targetRegions: [],
  whatsappCode: "+91",
  whatsappNumber: "",
  workEmail: "",
};

const fieldOrderStep1 = ["fullName", "workEmail", "companyWebsite"] as const;
const fieldOrderStep2 = ["offerDescription", "targetDescription", "targetRegions", "companySizes"] as const;

function getDeviceType() {
  if (typeof window === "undefined") {
    return "server";
  }

  return window.innerWidth < 768 ? "mobile" : "desktop";
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function buildWhatsappNumber(formState: SampleRequestFormState) {
  const number = formState.whatsappNumber.trim();

  if (!number) {
    return "";
  }

  return `${formState.whatsappCode.replace("-ca", "")} ${number}`.trim();
}

function buildBookingUrl(params: {
  companyWebsite: string;
  email: string;
  fullName: string;
  requestId: string;
}) {
  const url = new URL(BOOKING_URL);

  url.searchParams.set("email", params.email);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("name", params.fullName);
  url.searchParams.set("a1", params.companyWebsite);
  url.searchParams.set("a2", params.requestId);

  return url.toString();
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="mt-2 text-[0.75rem] leading-5 text-[#f38b86]">
      {message}
    </p>
  );
}

export function SampleRequestForm() {
  const pathname = usePathname();
  const [formState, setFormState] = useState(initialFormState);
  const [step, setStep] = useState<FormStep>(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [scheduledLater, setScheduledLater] = useState(false);
  const [customRegion, setCustomRegion] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [hasSeenStepTwo, setHasSeenStepTwo] = useState(false);
  const [callBooked, setCallBooked] = useState(false);

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});
  const stepTwoHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const confirmationHeadingRef = useRef<HTMLHeadingElement | null>(null);

  const captureSampleEvent = useCallback((
    eventName: AnalyticsEventName,
    extra?: Record<string, string | number | boolean | null>,
  ) => {
    captureEvent(eventName, {
      device_type: getDeviceType(),
      location: pathname,
      referrer: typeof document === "undefined" ? null : document.referrer || "direct",
      source: "website_sample_request",
      step,
      timestamp: new Date().toISOString(),
      ...extra,
    });
  }, [pathname, step]);

  const markStarted = useCallback(() => {
    if (hasStarted) {
      return;
    }

    setHasStarted(true);
    captureSampleEvent("sample_form_started");
  }, [captureSampleEvent, hasStarted]);

  function setFieldValue<Key extends keyof SampleRequestFormState>(field: Key, value: SampleRequestFormState[Key]) {
    setFormState((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field as keyof FormErrors]) {
        return current;
      }

      const next = { ...current };
      delete next[field as keyof FormErrors];
      return next;
    });
    if (submitError) {
      setSubmitError(null);
    }
  }

  function scrollToField(field: string) {
    const element = fieldRefs.current[field];

    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });

    if ("focus" in element && typeof element.focus === "function") {
      element.focus();
    }
  }

  function validateStepOne() {
    const nextErrors: FormErrors = {};

    if (formState.fullName.trim().length < 2) {
      nextErrors.fullName = "Enter your full name.";
    }

    if (!isValidEmail(formState.workEmail)) {
      nextErrors.workEmail = "Enter a valid email address.";
    }

    if (!formState.companyWebsite.trim()) {
      nextErrors.companyWebsite = "Enter your company website.";
    }

    return nextErrors;
  }

  function validateStepTwo() {
    const nextErrors: FormErrors = {};

    if (!formState.offerDescription.trim()) {
      nextErrors.offerDescription = "Tell us briefly what your company sells.";
    }

    if (!formState.targetDescription.trim()) {
      nextErrors.targetDescription = "Describe the companies you want to target.";
    }

    if (formState.targetRegions.length === 0) {
      nextErrors.targetRegions = "Select at least one target region.";
    }

    if (formState.companySizes.length === 0) {
      nextErrors.companySizes = "Select at least one company size.";
    }

    return nextErrors;
  }

  function moveToStepTwo() {
    markStarted();
    const nextErrors = validateStepOne();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      scrollToField(fieldOrderStep1.find((field) => nextErrors[field]) ?? fieldOrderStep1[0]);
      return;
    }

    setErrors({});
    setStep(2);
    captureSampleEvent("sample_step_1_completed");
  }

  function handleBack() {
    setStep(1);
    setSubmitError(null);
  }

  function toggleCompanySize(size: string) {
    markStarted();
    setFieldValue(
      "companySizes",
      formState.companySizes.includes(size)
        ? formState.companySizes.filter((item) => item !== size)
        : [...formState.companySizes, size],
    );
  }

  function toggleRegion(region: string) {
    markStarted();
    setFieldValue(
      "targetRegions",
      formState.targetRegions.includes(region)
        ? formState.targetRegions.filter((item) => item !== region)
        : [...formState.targetRegions, region],
    );
  }

  function addCustomRegion() {
    const normalizedRegion = customRegion.trim();

    if (!normalizedRegion) {
      return;
    }

    if (!formState.targetRegions.includes(normalizedRegion)) {
      setFieldValue("targetRegions", [...formState.targetRegions, normalizedRegion]);
    }

    setCustomRegion("");
  }

  const updateMeetingStatus = useCallback(async (payload: {
    meetingId?: null | string;
    meetingStatus: "meeting_scheduled" | "scheduled_later";
    meetingTime?: null | string;
  }) => {
    if (!confirmation?.requestId) {
      return;
    }

    try {
      await fetch("/api/sample-request", {
        body: JSON.stringify({
          meetingId: payload.meetingId ?? null,
          meetingStatus: payload.meetingStatus,
          meetingTime: payload.meetingTime ?? null,
          requestId: confirmation.requestId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
    } catch {
      // Keep the UI optimistic if the background status update fails.
    }
  }, [confirmation?.requestId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    markStarted();
    const nextErrors = validateStepTwo();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      scrollToField(fieldOrderStep2.find((field) => nextErrors[field]) ?? fieldOrderStep2[0]);
      return;
    }

    const payload: SampleRequestPayload = {
      additionalRequirements: formState.additionalRequirements.trim(),
      companySizes: formState.companySizes,
      companyWebsite: normalizeWebsite(formState.companyWebsite),
      fullName: formState.fullName.trim(),
      offerDescription: formState.offerDescription.trim(),
      requestType: "personalized_sample_leads",
      targetDescription: formState.targetDescription.trim(),
      targetRegions: formState.targetRegions,
      whatsapp: buildWhatsappNumber(formState),
      workEmail: formState.workEmail.trim().toLowerCase(),
    };

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);
    captureSampleEvent("sample_form_submitted");

    try {
      const response = await fetch("/api/sample-request", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = (await response.json()) as {
        bookingUrl?: string;
        error?: string;
        requestId?: string;
      };

      if (!response.ok || !result.requestId) {
        throw new Error(result.error ?? "We could not submit your request. Please try again.");
      }

      setConfirmation({
        bookingUrl: result.bookingUrl ?? buildBookingUrl({
          companyWebsite: payload.companyWebsite,
          email: payload.workEmail,
          fullName: payload.fullName,
          requestId: result.requestId,
        }),
        requestId: result.requestId,
      });
      setScheduledLater(false);
      setShowCalendar(false);
      setCallBooked(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "We could not submit your request. Please try again.",
      );
      captureSampleEvent("sample_form_failed", {
        failure_reason: error instanceof Error ? error.message : "unknown_error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (step !== 2 || hasSeenStepTwo) {
      return;
    }

    setHasSeenStepTwo(true);
    captureSampleEvent("sample_step_2_viewed");
  }, [captureSampleEvent, hasSeenStepTwo, step]);

  useEffect(() => {
    if (step === 2) {
      stepTwoHeadingRef.current?.focus();
    }
  }, [step]);

  useEffect(() => {
    if (confirmation) {
      confirmationHeadingRef.current?.focus();
    }
  }, [confirmation]);

  useEffect(() => {
    if (!showCalendar || !confirmation || callBooked || typeof window === "undefined") {
      return;
    }

    const handleCalendlyMessage = (event: MessageEvent) => {
      if (!String(event.origin).includes("calendly.com")) {
        return;
      }

      const payload = event.data as {
        event?: string;
        payload?: {
          event?: { uri?: string };
          invitee?: { start_time?: string };
        };
      };

      if (payload?.event !== "calendly.event_scheduled") {
        return;
      }

      setCallBooked(true);
      captureSampleEvent("sample_call_booked", {
        request_id: confirmation.requestId,
      });
      void updateMeetingStatus({
        meetingId: payload.payload?.event?.uri ?? null,
        meetingStatus: "meeting_scheduled",
        meetingTime: payload.payload?.invitee?.start_time ?? null,
      });
    };

    window.addEventListener("message", handleCalendlyMessage);

    return () => {
      window.removeEventListener("message", handleCalendlyMessage);
    };
  }, [callBooked, confirmation, showCalendar, captureSampleEvent, updateMeetingStatus]);

  const gradientButtonClassName =
    "border-transparent bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)] text-[#050505] shadow-[0_18px_52px_rgba(201,183,255,0.18)] hover:brightness-[1.03] hover:text-[#050505]";
  const outlineButtonClassName =
    "border-white/[0.1] bg-white/[0.03] text-white shadow-none hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white";
  const inputClassName =
    "h-12 rounded-[0.65rem] border-white/[0.12] bg-[#0c0c0c] px-4 text-[0.92rem] text-[#f5f5f5] placeholder:text-[#666666] focus-visible:border-[rgba(241,181,64,0.85)] focus-visible:ring-[rgba(241,181,64,0.10)] focus-visible:ring-offset-[#111111]";
  const textareaClassName =
    "min-h-[96px] rounded-[0.65rem] border-white/[0.12] bg-[#0c0c0c] px-4 py-3 text-[0.92rem] leading-6 text-[#f5f5f5] placeholder:text-[#666666] focus-visible:border-[rgba(241,181,64,0.85)] focus-visible:ring-[rgba(241,181,64,0.10)] focus-visible:ring-offset-[#111111]";

  return (
    <div className="rounded-[1.25rem] border border-white/[0.1] bg-[rgba(17,17,17,0.92)] p-[1.375rem] shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
      {confirmation ? (
        <div className="space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#f1b540]/20 bg-[#f1b540]/10 text-[#f1b540]">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="space-y-3">
            <h2
              ref={confirmationHeadingRef}
              tabIndex={-1}
              className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[#f7f7f7] outline-none sm:text-[1.9rem]"
            >
              Your sample request has been received
            </h2>
            <p className="max-w-2xl text-[0.95rem] leading-7 text-[#a3a3a3]">
              Our team will review your criteria and prepare a personalized lead sample. Choose a
              convenient time below for the video walkthrough.
            </p>
            <p className="text-[0.82rem] uppercase tracking-[0.16em] text-[#737373]">
              Request ID {confirmation.requestId}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Button
              className={cn("h-[3.25rem] w-full rounded-[0.7rem] text-[0.95rem] font-semibold", gradientButtonClassName)}
              onClick={() => {
                setShowCalendar(true);
                setScheduledLater(false);
                captureSampleEvent("sample_calendar_opened", {
                  request_id: confirmation.requestId,
                });
              }}
              type="button"
            >
              Book my sample review
            </Button>
            <Button
              className={cn("h-[3.25rem] rounded-[0.7rem] px-5 text-[0.95rem]", outlineButtonClassName)}
              type="button"
              variant="secondary"
              onClick={() => {
                setScheduledLater(true);
                setShowCalendar(false);
                captureSampleEvent("sample_call_skipped", {
                  request_id: confirmation.requestId,
                });
                void updateMeetingStatus({ meetingStatus: "scheduled_later" });
              }}
            >
              I&apos;ll schedule later
            </Button>
          </div>

          {scheduledLater ? (
            <p className="rounded-[0.9rem] border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[0.86rem] leading-6 text-[#b8b8b8]">
              We have sent the booking link to your email.
            </p>
          ) : null}

          {showCalendar ? (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[0.9rem] border border-white/[0.08] bg-[#090909]">
                <iframe
                  className="h-[620px] w-full"
                  src={confirmation.bookingUrl}
                  title="Book your Frithly sample review"
                />
              </div>
              {callBooked ? (
                <p className="text-[0.86rem] leading-6 text-[#b8b8b8]">
                  Your review call has been logged. We will prepare the sample before the meeting.
                </p>
              ) : (
                <p className="text-[0.86rem] leading-6 text-[#737373]">
                  Your timezone is detected automatically. We will use the details you already
                  shared, so there is nothing to re-enter.
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <h2 className="text-[1.45rem] font-semibold tracking-[-0.03em] text-[#f7f7f7] sm:text-[1.5rem]">
              Request your sample
            </h2>
            <p className="text-[0.88rem] leading-6 text-[#a3a3a3]">
              {step === 1
                ? "Start with a few basic details. It takes less than two minutes."
                : "Define the companies you want Frithly to research."}
            </p>
          </div>

          <div className="mt-6 flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3 text-[0.78rem] font-semibold uppercase tracking-[0.12em]">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={cn("text-[#737373]", step === 1 && "text-[#f1b540]")}>01</span>
                  <span className={cn("truncate text-[#737373]", step === 1 && "text-[#f7f7f7]")}>
                    Your details
                  </span>
                </div>
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-px flex-1 rounded-full bg-white/[0.08]",
                    step === 2 && "bg-[#f1b540]",
                  )}
                />
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={cn("text-[#737373]", step === 2 && "text-[#f1b540]")}>02</span>
                  <span className={cn("truncate text-[#737373]", step === 2 && "text-[#f7f7f7]")}>
                    Targeting
                  </span>
                </div>
              </div>
            </div>
            <p className="shrink-0 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-[#737373]">
              Step {step} of 2
            </p>
          </div>

          {submitError ? (
            <div className="mt-5 rounded-[0.85rem] border border-[#f38b86]/30 bg-[#2a1110]/65 px-4 py-3 text-[0.84rem] leading-6 text-[#ffd4d1]">
              <p>{submitError}</p>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-7 space-y-5">
              <div className="grid gap-[1.125rem] md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[0.82rem] font-medium text-[#d4d4d4]" htmlFor="sample-full-name">
                    Full name
                  </Label>
                  <Input
                    id="sample-full-name"
                    ref={(node) => {
                      fieldRefs.current.fullName = node;
                    }}
                    aria-describedby={errors.fullName ? "sample-full-name-error" : undefined}
                    aria-invalid={Boolean(errors.fullName)}
                    className={inputClassName}
                    placeholder="Alex Morgan"
                    value={formState.fullName}
                    onChange={(event) => {
                      markStarted();
                      setFieldValue("fullName", event.target.value);
                    }}
                    onFocus={markStarted}
                  />
                  <FieldError id="sample-full-name-error" message={errors.fullName} />
                </div>

                <div className="space-y-2">
                  <Label className="text-[0.82rem] font-medium text-[#d4d4d4]" htmlFor="sample-work-email">
                    Work email
                  </Label>
                  <Input
                    id="sample-work-email"
                    ref={(node) => {
                      fieldRefs.current.workEmail = node;
                    }}
                    aria-describedby={errors.workEmail ? "sample-work-email-error" : "sample-work-email-help"}
                    aria-invalid={Boolean(errors.workEmail)}
                    className={inputClassName}
                    placeholder="alex@company.com"
                    type="email"
                    value={formState.workEmail}
                    onChange={(event) => {
                      markStarted();
                      setFieldValue("workEmail", event.target.value);
                    }}
                    onFocus={markStarted}
                  />
                  <p id="sample-work-email-help" className="text-[0.74rem] leading-5 text-[#737373]">
                    A work email helps us understand your company faster.
                  </p>
                  <FieldError id="sample-work-email-error" message={errors.workEmail} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[0.82rem] font-medium text-[#d4d4d4]" htmlFor="sample-company-website">
                    Company website
                  </Label>
                  <Input
                    id="sample-company-website"
                    ref={(node) => {
                      fieldRefs.current.companyWebsite = node;
                    }}
                    aria-describedby={errors.companyWebsite ? "sample-company-website-error" : undefined}
                    aria-invalid={Boolean(errors.companyWebsite)}
                    className={inputClassName}
                    placeholder="yourcompany.com"
                    value={formState.companyWebsite}
                    onBlur={() => {
                      if (formState.companyWebsite.trim()) {
                        setFieldValue("companyWebsite", normalizeWebsite(formState.companyWebsite));
                      }
                    }}
                    onChange={(event) => {
                      markStarted();
                      setFieldValue("companyWebsite", event.target.value);
                    }}
                    onFocus={markStarted}
                  />
                  <FieldError id="sample-company-website-error" message={errors.companyWebsite} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-[0.82rem] font-medium text-[#d4d4d4]" htmlFor="sample-whatsapp-number">
                      WhatsApp number
                    </Label>
                    <span className="text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#737373]">
                      Optional
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                    <Select
                      value={formState.whatsappCode}
                      onValueChange={(value) => {
                        markStarted();
                        setFieldValue("whatsappCode", value);
                      }}
                    >
                      <SelectTrigger className={cn(inputClassName, "justify-between")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodeOptions.map((option) => (
                          <SelectItem key={option.label} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="sample-whatsapp-number"
                      className={inputClassName}
                      placeholder="+91 98765 43210"
                      type="tel"
                      value={formState.whatsappNumber}
                      onChange={(event) => {
                        markStarted();
                        setFieldValue("whatsappNumber", event.target.value);
                      }}
                      onFocus={markStarted}
                    />
                  </div>
                  <p className="text-[0.74rem] leading-5 text-[#737373]">
                    We will only use this for sample updates or meeting coordination.
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <Button
                  className={cn(
                    "group h-[3.25rem] w-full rounded-[0.7rem] text-[0.95rem] font-semibold",
                    gradientButtonClassName,
                  )}
                  type="button"
                  onClick={moveToStepTwo}
                >
                  Continue to targeting
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-[2px]" />
                </Button>
                <p className="mt-3 text-center text-[0.74rem] leading-5 text-[#737373]">
                  Your information is used only to prepare your sample.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-7 space-y-5">
              <h3
                ref={stepTwoHeadingRef}
                tabIndex={-1}
                className="sr-only outline-none"
              >
                Step two: Targeting
              </h3>

              <div className="space-y-2">
                <Label className="text-[0.82rem] font-medium text-[#d4d4d4]" htmlFor="sample-offer-description">
                  What does your company sell?
                </Label>
                <Textarea
                  id="sample-offer-description"
                  ref={(node) => {
                    fieldRefs.current.offerDescription = node;
                  }}
                  aria-describedby={errors.offerDescription ? "sample-offer-description-error" : "sample-offer-description-help"}
                  aria-invalid={Boolean(errors.offerDescription)}
                  className={textareaClassName}
                  maxLength={500}
                  placeholder="Briefly describe your product or service and the problem it solves."
                  value={formState.offerDescription}
                  onChange={(event) => {
                    markStarted();
                    setFieldValue("offerDescription", event.target.value);
                  }}
                  onFocus={markStarted}
                />
                <p id="sample-offer-description-help" className="text-[0.74rem] leading-5 text-[#737373]">
                  Keep it brief - 1 or 2 sentences is enough.
                </p>
                <FieldError id="sample-offer-description-error" message={errors.offerDescription} />
              </div>

              <div className="space-y-2">
                <Label className="text-[0.82rem] font-medium text-[#d4d4d4]" htmlFor="sample-target-description">
                  Who do you want to target?
                </Label>
                <Textarea
                  id="sample-target-description"
                  ref={(node) => {
                    fieldRefs.current.targetDescription = node;
                  }}
                  aria-describedby={errors.targetDescription ? "sample-target-description-error" : "sample-target-description-help"}
                  aria-invalid={Boolean(errors.targetDescription)}
                  className={textareaClassName}
                  maxLength={500}
                  placeholder="Example: B2B SaaS companies hiring sales teams in the US and UK."
                  value={formState.targetDescription}
                  onChange={(event) => {
                    markStarted();
                    setFieldValue("targetDescription", event.target.value);
                  }}
                  onFocus={markStarted}
                />
                <p id="sample-target-description-help" className="text-[0.74rem] leading-5 text-[#737373]">
                  Mention the type of company, industry, stage, or buying situation.
                </p>
                <FieldError id="sample-target-description-error" message={errors.targetDescription} />
              </div>

              <div className="space-y-3">
                <Label className="text-[0.82rem] font-medium text-[#d4d4d4]" htmlFor="sample-custom-region">
                  Target countries or regions
                </Label>
                <div
                  ref={(node) => {
                    fieldRefs.current.targetRegions = node;
                  }}
                  className="flex flex-wrap gap-2"
                >
                  {regionOptions.map((region) => {
                    const selected = formState.targetRegions.includes(region);
                    return (
                      <button
                        key={region}
                        className={cn(
                          "rounded-full border px-3.5 py-2 text-[0.82rem] transition-colors",
                          selected
                            ? "border-[#f1b540]/70 bg-[#f1b540]/12 text-[#f7f7f7]"
                            : "border-white/[0.08] bg-white/[0.03] text-[#a3a3a3] hover:border-white/[0.16] hover:text-[#f3f3f3]",
                        )}
                        type="button"
                        onClick={() => toggleRegion(region)}
                      >
                        {region}
                      </button>
                    );
                  })}
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    id="sample-custom-region"
                    className={inputClassName}
                    placeholder="Select or type locations"
                    value={customRegion}
                    onChange={(event) => setCustomRegion(event.target.value)}
                    onFocus={markStarted}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        markStarted();
                        addCustomRegion();
                      }
                    }}
                  />
                  <Button
                    className={cn("h-12 rounded-[0.7rem] px-4 text-[0.88rem]", outlineButtonClassName)}
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      markStarted();
                      addCustomRegion();
                    }}
                  >
                    Add region
                  </Button>
                </div>
                {formState.targetRegions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {formState.targetRegions.map((region) => (
                      <button
                        key={region}
                        className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[0.78rem] text-[#d6d6d6] transition-colors hover:border-white/[0.16]"
                        type="button"
                        onClick={() => toggleRegion(region)}
                      >
                        {region} <span className="text-white/50">×</span>
                      </button>
                    ))}
                  </div>
                ) : null}
                <FieldError id="sample-target-regions-error" message={errors.targetRegions} />
              </div>

              <div className="space-y-3">
                <Label className="text-[0.82rem] font-medium text-[#d4d4d4]">
                  Target company size
                </Label>
                <div
                  ref={(node) => {
                    fieldRefs.current.companySizes = node;
                  }}
                  className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
                >
                  {companySizeOptions.map((size) => {
                    const selected = formState.companySizes.includes(size);
                    return (
                      <button
                        key={size}
                        className={cn(
                          "flex min-h-[3.15rem] items-center justify-center rounded-[0.8rem] border px-3 py-2 text-[0.84rem] font-medium transition-colors",
                          selected
                            ? "border-[#f1b540]/70 bg-[#f1b540]/12 text-[#f7f7f7]"
                            : "border-white/[0.08] bg-white/[0.03] text-[#a3a3a3] hover:border-white/[0.16] hover:text-[#f3f3f3]",
                        )}
                        type="button"
                        onClick={() => toggleCompanySize(size)}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <FieldError id="sample-company-sizes-error" message={errors.companySizes} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-[0.82rem] font-medium text-[#d4d4d4]" htmlFor="sample-additional-requirements">
                    Anything else we should know?
                  </Label>
                  <span className="text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#737373]">
                    Optional
                  </span>
                </div>
                <Textarea
                  id="sample-additional-requirements"
                  className={cn(textareaClassName, "min-h-[86px]")}
                  placeholder="Mention preferred industries, decision-maker roles, exclusions, competitors, or any special requirements."
                  value={formState.additionalRequirements}
                  onChange={(event) => {
                    markStarted();
                    setFieldValue("additionalRequirements", event.target.value);
                  }}
                  onFocus={markStarted}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-[0.35fr_1fr]">
                <Button
                  className={cn("h-[3.25rem] rounded-[0.7rem] text-[0.95rem]", outlineButtonClassName)}
                  type="button"
                  variant="secondary"
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  className={cn(
                    "h-[3.25rem] rounded-[0.7rem] text-[0.95rem] font-semibold",
                    gradientButtonClassName,
                  )}
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting your request...
                    </>
                  ) : (
                    <>
                      Request my sample
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-center text-[0.74rem] leading-5 text-[#737373]">
                After submitting, you can choose a time for the sample review call.
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
