"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

type SalesInquiryFormState = {
  company: string;
  companySize: string;
  email: string;
  fullName: string;
  linkedinProfile: string;
  message: string;
  primaryNeed: string;
  preferredContactMethod: string;
  role: string;
  telegramHandle: string;
  whatsappNumber: string;
  website: string;
};

export const enquiryPlans = {
  engine: { label: "Engine", price: "$3,900/mo", summary: "25 briefings every Tuesday, 100 per month" },
  pipeline: { label: "Pipeline", price: "$2,400/mo", summary: "12 briefings every Tuesday, 50 per month" },
  signal: { label: "Signal", price: "$1,200/mo", summary: "5 briefings every Tuesday, 20 per month" },
  trial: { label: "Trial", price: "$750", summary: "Fifteen briefings over two weeks, credited if you continue" },
} as const;

export type EnquiryPlan = keyof typeof enquiryPlans;

export function isEnquiryPlan(value: string | undefined): value is EnquiryPlan {
  return value !== undefined && value in enquiryPlans;
}

function buildInitialState(plan?: EnquiryPlan): SalesInquiryFormState {
  const selected = plan ? enquiryPlans[plan] : undefined;

  return {
    company: "",
    companySize: "",
    email: "",
    fullName: "",
    linkedinProfile: "",
    message: selected
      ? `Enquiring about the ${selected.label} plan (${selected.price}). `
      : "",
    preferredContactMethod: "",
    primaryNeed: selected ? "plan-fit" : "",
    role: "",
    telegramHandle: "",
    whatsappNumber: "",
    website: "",
  };
}

const footNote =
  "I read every enquiry myself and reply from hello@frithly.com with the honest next step — a free briefing, a call, or a straight answer that this isn't a fit.";

export function SalesInquiryForm({ plan }: { plan?: EnquiryPlan }) {
  const [formState, setFormState] = useState(() => buildInitialState(plan));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const selectedPlan = plan ? enquiryPlans[plan] : undefined;

  const fieldBase =
    "rounded-[3px] border-[#262b31] bg-[#14171b] text-[#f3f1ea] placeholder:text-[#5c636b] focus-visible:ring-[#e7a6d6] focus-visible:ring-offset-[#0c0e11] focus:ring-[#e7a6d6] focus:ring-offset-[#0c0e11]";
  const fieldClassName = `${fieldBase} h-12 md:h-11`;
  const areaClassName = fieldBase;
  const selectContentClassName =
    "rounded-[6px] border-[#262b31] bg-[#14171b] text-[#f3f1ea] shadow-[0_24px_70px_rgba(0,0,0,0.42)]";
  const selectItemClassName = "text-[#f3f1ea] focus:text-[#f3f1ea] focus:bg-[#1b1f24]";
  const labelClassName = "text-[13px] font-medium text-[#f3f1ea]";
  const helperTextClassName = "text-[12px] leading-6 text-[#5c636b]";
  const submitButtonClassName =
    "rounded-[3px] border-0 bg-[linear-gradient(135deg,#f3b583_0%,#ee9fcb_52%,#b6abe8_100%)] px-5 text-[#241522] shadow-none hover:brightness-[1.08] hover:text-[#241522] focus-visible:ring-[#e7a6d6]";

  function updateField<K extends keyof SalesInquiryFormState>(
    field: K,
    value: SalesInquiryFormState[K],
  ) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sales-request", {
        body: JSON.stringify(formState),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "We couldn't submit your details right now.");
      }

      setFormState(buildInitialState(plan));
      toast.success("Thanks. We have your details and will reply from hello@frithly.com.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We couldn't submit your details right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {selectedPlan ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-[#262b31] bg-[#1b1f24] px-4 py-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[#e7a6d6]">Enquiring about</div>
            <div className="mt-1 text-[15px] font-semibold text-[#f3f1ea]">
              {selectedPlan.label} · {selectedPlan.price}
            </div>
          </div>
          <div className="text-[13px] text-[#9ba1a8]">{selectedPlan.summary}</div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 md:gap-5">
        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="sales-full-name">Full name</Label>
          <Input
            className={fieldClassName}
            required
            id="sales-full-name"
            placeholder="Alex Morgan"
            value={formState.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="sales-email">Work email</Label>
          <Input
            className={fieldClassName}
            required
            id="sales-email"
            placeholder="alex@company.com"
            type="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="sales-whatsapp">WhatsApp</Label>
          <Input
            className={fieldClassName}
            required
            id="sales-whatsapp"
            placeholder="+91 98765 43210"
            value={formState.whatsappNumber}
            onChange={(event) => updateField("whatsappNumber", event.target.value)}
          />
          <p className={helperTextClassName}>Include country code so we can confirm quickly.</p>
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="sales-company">Company</Label>
          <Input
            className={fieldClassName}
            required
            id="sales-company"
            placeholder="Acme Growth"
            value={formState.company}
            onChange={(event) => updateField("company", event.target.value)}
          />
        </div>

        <button
          className="flex items-center justify-between rounded-[3px] border border-[#262b31] bg-[#14171b] px-4 py-3 text-left text-[13px] text-[#9ba1a8] md:hidden"
          onClick={() => setShowOptional((current) => !current)}
          type="button"
        >
          <span>{showOptional ? "Hide optional details" : "Add optional details — role, Telegram"}</span>
          <span className="text-[#e7a6d6]">{showOptional ? "−" : "+"}</span>
        </button>

        <div className={cn("grid gap-4 md:contents", showOptional ? "" : "hidden")}>
        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="sales-role">Role</Label>
          <Input
            className={fieldClassName}
            id="sales-role"
            placeholder="Founder, Head of Growth"
            value={formState.role}
            onChange={(event) => updateField("role", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="sales-linkedin">LinkedIn profile</Label>
          <Input
            className={fieldClassName}
            required
            id="sales-linkedin"
            placeholder="linkedin.com/in/alexmorgan"
            value={formState.linkedinProfile}
            onChange={(event) => updateField("linkedinProfile", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="sales-website">Website</Label>
          <Input
            className={fieldClassName}
            required
            id="sales-website"
            placeholder="https://yourcompany.com"
            value={formState.website}
            onChange={(event) => updateField("website", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="sales-company-size">Company size</Label>
          <Select
            onValueChange={(value) => updateField("companySize", value)}
            value={formState.companySize}
          >
            <SelectTrigger className={fieldClassName} id="sales-company-size">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              <SelectItem className={selectItemClassName} value="1-10">1-10 employees</SelectItem>
              <SelectItem className={selectItemClassName} value="11-50">11-50 employees</SelectItem>
              <SelectItem className={selectItemClassName} value="51-200">51-200 employees</SelectItem>
              <SelectItem className={selectItemClassName} value="201-500">201-500 employees</SelectItem>
              <SelectItem className={selectItemClassName} value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="sales-contact-method">Preferred contact method</Label>
          <Select
            onValueChange={(value) => updateField("preferredContactMethod", value)}
            value={formState.preferredContactMethod}
          >
            <SelectTrigger className={fieldClassName} id="sales-contact-method">
              <SelectValue placeholder="How should we follow up?" />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              <SelectItem className={selectItemClassName} value="email">Email</SelectItem>
              <SelectItem className={selectItemClassName} value="whatsapp">WhatsApp</SelectItem>
              <SelectItem className={selectItemClassName} value="linkedin">LinkedIn</SelectItem>
              <SelectItem className={selectItemClassName} value="telegram">Telegram</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className={labelClassName} htmlFor="sales-telegram">Telegram (optional)</Label>
          <Input
            className={fieldClassName}
            id="sales-telegram"
            placeholder="@alexmorgan"
            value={formState.telegramHandle}
            onChange={(event) => updateField("telegramHandle", event.target.value)}
          />
        </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className={labelClassName} htmlFor="sales-primary-need">What do you want to discuss?</Label>
          <Select
            onValueChange={(value) => updateField("primaryNeed", value)}
            value={formState.primaryNeed}
          >
            <SelectTrigger className={fieldClassName} id="sales-primary-need">
              <SelectValue placeholder="Choose the main reason for reaching out" />
            </SelectTrigger>
            <SelectContent className={selectContentClassName}>
              <SelectItem className={selectItemClassName} value="plan-fit">Plan fit and pricing</SelectItem>
              <SelectItem className={selectItemClassName} value="outbound-goals">Outbound goals and ICP fit</SelectItem>
              <SelectItem className={selectItemClassName} value="trial">The $750 trial</SelectItem>
              <SelectItem className={selectItemClassName} value="onboarding">Onboarding and rollout questions</SelectItem>
              <SelectItem className={selectItemClassName} value="application">Whether to request a briefing or book a call first</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className={labelClassName} htmlFor="sales-message">What should we know before we reply?</Label>
          <Textarea
            className={areaClassName}
            required
            id="sales-message"
            placeholder="What you sell, who you want to reach, and what you want help deciding."
            rows={6}
            value={formState.message}
            onChange={(event) => updateField("message", event.target.value)}
          />
          <p className={helperTextClassName}>A couple of sentences is enough — minimum 20 characters.</p>
        </div>
      </div>

      <p className="text-[13px] leading-6 text-[#9ba1a8] sm:hidden">{footNote}</p>

      <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-col gap-4 border-t border-[#1e2227] bg-[#0c0e11]/95 px-5 py-4 backdrop-blur sm:static sm:mx-0 sm:mb-0 sm:flex-row sm:items-center sm:justify-between sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-6 sm:backdrop-blur-none">
        <p className="hidden max-w-2xl text-[13px] leading-6 text-[#9ba1a8] sm:block">{footNote}</p>
        <Button className={`w-full sm:w-auto ${submitButtonClassName}`} disabled={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Sending..." : "Send details"}
        </Button>
      </div>
    </form>
  );
}
