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

const initialState: SalesInquiryFormState = {
  company: "",
  companySize: "",
  email: "",
  fullName: "",
  linkedinProfile: "",
  message: "",
  primaryNeed: "",
  preferredContactMethod: "",
  role: "",
  telegramHandle: "",
  whatsappNumber: "",
  website: "",
};

export function SalesInquiryForm() {
  const [formState, setFormState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fieldClassName =
    "rounded-[1rem] border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/34 focus-visible:ring-[rgba(201,183,255,0.34)] focus-visible:ring-offset-[#050505]";
  const selectContentClassName =
    "border-white/[0.08] bg-[#0a0a0a] text-white shadow-[0_24px_70px_rgba(0,0,0,0.42)]";
  const selectItemClassName = "text-white focus:text-white";
  const labelClassName = "text-white";
  const helperTextClassName = "text-xs leading-6 text-white/46";
  const submitButtonClassName =
    "border-transparent bg-[linear-gradient(135deg,#f4c28b_0%,#e8a7d7_52%,#c9b7ff_100%)] text-[#050505] shadow-[0_18px_52px_rgba(201,183,255,0.18)] hover:brightness-[1.03] hover:text-[#050505]";

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

      setFormState(initialState);
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
      <div className="grid gap-5 md:grid-cols-2">
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
              <SelectItem className={selectItemClassName} value="onboarding">Onboarding and rollout questions</SelectItem>
              <SelectItem className={selectItemClassName} value="application">Whether to request a sample or book a call first</SelectItem>
              <SelectItem className={selectItemClassName} value="reactivation">Reactivation or workspace access</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className={labelClassName} htmlFor="sales-message">What should we know before we reply?</Label>
          <Textarea
            className={fieldClassName}
            required
            id="sales-message"
            placeholder="Tell us what you sell, who you want to reach, and what you want help deciding."
            rows={6}
            value={formState.message}
            onChange={(event) => updateField("message", event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-7 text-white/52">
          We&apos;ll review the details first and reply from hello@frithly.com with the best next
          step. If there&apos;s a fit, we&apos;ll point you toward the right sample or call instead
          of sending you through unnecessary steps.
        </p>
        <Button className={`w-full sm:w-auto ${submitButtonClassName}`} disabled={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Submitting..." : "Send details"}
        </Button>
      </div>
    </form>
  );
}
