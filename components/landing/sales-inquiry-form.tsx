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
  message: string;
  primaryNeed: string;
  role: string;
  website: string;
};

const initialState: SalesInquiryFormState = {
  company: "",
  companySize: "",
  email: "",
  fullName: "",
  message: "",
  primaryNeed: "",
  role: "",
  website: "",
};

export function SalesInquiryForm() {
  const [formState, setFormState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <Label htmlFor="sales-full-name">Full name</Label>
          <Input
            required
            id="sales-full-name"
            placeholder="Alex Morgan"
            value={formState.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sales-email">Work email</Label>
          <Input
            required
            id="sales-email"
            placeholder="alex@company.com"
            type="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sales-company">Company</Label>
          <Input
            required
            id="sales-company"
            placeholder="Acme Growth"
            value={formState.company}
            onChange={(event) => updateField("company", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sales-role">Role</Label>
          <Input
            id="sales-role"
            placeholder="Founder, Head of Growth"
            value={formState.role}
            onChange={(event) => updateField("role", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sales-website">Website</Label>
          <Input
            id="sales-website"
            placeholder="https://yourcompany.com"
            value={formState.website}
            onChange={(event) => updateField("website", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sales-company-size">Company size</Label>
          <Select
            onValueChange={(value) => updateField("companySize", value)}
            value={formState.companySize}
          >
            <SelectTrigger id="sales-company-size">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sales-primary-need">What do you want to discuss?</Label>
          <Select
            onValueChange={(value) => updateField("primaryNeed", value)}
            value={formState.primaryNeed}
          >
            <SelectTrigger id="sales-primary-need">
              <SelectValue placeholder="Choose the main reason for reaching out" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plan-fit">Plan fit and pricing</SelectItem>
              <SelectItem value="outbound-goals">Outbound goals and ICP fit</SelectItem>
              <SelectItem value="onboarding">Onboarding and rollout questions</SelectItem>
              <SelectItem value="sample">Whether to start with a sample</SelectItem>
              <SelectItem value="reactivation">Reactivation or workspace access</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="sales-message">What should we know before we reply?</Label>
          <Textarea
            required
            id="sales-message"
            placeholder="Tell us what you sell, who you want to reach, and what you want help deciding."
            rows={6}
            value={formState.message}
            onChange={(event) => updateField("message", event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-7 text-muted">
          We&apos;ll review the details and reply from hello@frithly.com with the right next step,
          whether that&apos;s a plan recommendation, sample path, or a live conversation.
        </p>
        <Button className="w-full sm:w-auto" disabled={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Submitting..." : "Send to sales"}
        </Button>
      </div>
    </form>
  );
}
