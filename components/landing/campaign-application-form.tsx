"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
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
import { captureEvent } from "@/lib/monitoring/posthog";

type RequiredContactability = "premium" | "strong";
type CurrencyOption = "EUR" | "GBP" | "USD";
type OutboundMaturity = "manual" | "none" | "structured" | "team";

type CampaignApplicationFormState = {
  averageClientValue: string;
  cities: string;
  company: string;
  companySize: string;
  countries: string;
  currency: CurrencyOption;
  currentChallenges: string;
  email: string;
  founderConfidenceMin: string;
  fullName: string;
  industry: string;
  leadGoal: string;
  minimumScore: string;
  outboundMaturity: OutboundMaturity;
  requiredContactability: RequiredContactability;
  role: string;
  services: string;
  successDefinition: string;
  targetTitles: string;
  website: string;
};

const initialFormState: CampaignApplicationFormState = {
  averageClientValue: "5000",
  cities: "",
  company: "",
  companySize: "5-50",
  countries: "United Kingdom",
  currency: "GBP",
  currentChallenges: "",
  email: "",
  founderConfidenceMin: "0.7",
  fullName: "",
  industry: "SEO agencies",
  leadGoal: "25",
  minimumScore: "70",
  outboundMaturity: "manual",
  requiredContactability: "premium",
  role: "",
  services: "SEO, PPC",
  successDefinition: "",
  targetTitles: "Founder, CEO",
  website: "",
};

function splitCsv(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function CampaignApplicationForm() {
  const pathname = usePathname();
  const hasTrackedStartRef = useRef(false);
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateFormState<K extends keyof CampaignApplicationFormState>(
    field: K,
    value: CampaignApplicationFormState[K],
  ) {
    setFormState((current) => ({ ...current, [field]: value }));

    if (!hasTrackedStartRef.current) {
      hasTrackedStartRef.current = true;
      captureEvent("apply_flow_started", {
        location: pathname,
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    captureEvent("apply_flow_submitted", {
      location: pathname,
    });

    try {
      const response = await fetch("/api/campaign-application", {
        body: JSON.stringify({
          averageClientValue: Number(formState.averageClientValue),
          cities: splitCsv(formState.cities),
          company: formState.company,
          companySize: formState.companySize,
          countries: splitCsv(formState.countries),
          currency: formState.currency,
          currentChallenges: formState.currentChallenges,
          email: formState.email,
          founderConfidenceMin: Number(formState.founderConfidenceMin),
          fullName: formState.fullName,
          industry: formState.industry,
          leadGoal: Number(formState.leadGoal),
          minimumScore: Number(formState.minimumScore),
          outboundMaturity: formState.outboundMaturity,
          requiredContactability: formState.requiredContactability,
          role: formState.role,
          services: splitCsv(formState.services),
          successDefinition: formState.successDefinition,
          targetTitles: splitCsv(formState.targetTitles),
          website: formState.website,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        let errorMessage = "We couldn't submit your application right now.";

        try {
          const payload = (await response.json()) as { error?: string };
          if (payload.error) {
            errorMessage = payload.error;
          }
        } catch {
          // Keep the generic message when the response body is not JSON.
        }

        throw new Error(errorMessage);
      }

      setFormState(initialFormState);
      captureEvent("apply_flow_completed", {
        location: pathname,
      });
      toast.success("Application received. We'll review it and reply within one business day.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We couldn't submit your application right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
            Team context
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">Who should we build this around?</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              required
              id="fullName"
              name="fullName"
              onChange={(event) => updateFormState("fullName", event.target.value)}
              placeholder="Alex Morgan"
              value={formState.fullName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              required
              id="email"
              name="email"
              onChange={(event) => updateFormState("email", event.target.value)}
              placeholder="alex@company.com"
              type="email"
              value={formState.email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              required
              id="company"
              name="company"
              onChange={(event) => updateFormState("company", event.target.value)}
              placeholder="Acme Growth"
              value={formState.company}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Your role</Label>
            <Input
              id="role"
              name="role"
              onChange={(event) => updateFormState("role", event.target.value)}
              placeholder="Founder, Head of Growth"
              value={formState.role}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              onChange={(event) => updateFormState("website", event.target.value)}
              placeholder="https://yourcompany.com"
              value={formState.website}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
            ICP definition
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">What should qualify as a strong lead?</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="industry">Industry or niche</Label>
            <Input
              required
              id="industry"
              name="industry"
              onChange={(event) => updateFormState("industry", event.target.value)}
              placeholder="SEO agencies"
              value={formState.industry}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companySize">Target company size</Label>
            <Select
              onValueChange={(value) => updateFormState("companySize", value)}
              value={formState.companySize}
            >
              <SelectTrigger id="companySize">
                <SelectValue placeholder="Select target company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="5-50">5-50 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-500">201-500 employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="countries">Countries</Label>
            <Input
              required
              id="countries"
              name="countries"
              onChange={(event) => updateFormState("countries", event.target.value)}
              placeholder="United Kingdom, Ireland"
              value={formState.countries}
            />
            <p className="text-xs leading-6 text-muted">Use commas if you want more than one country.</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cities">Cities or regions</Label>
            <Input
              id="cities"
              name="cities"
              onChange={(event) => updateFormState("cities", event.target.value)}
              placeholder="Manchester, Birmingham, Bristol"
              value={formState.cities}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetTitles">Target roles</Label>
            <Input
              id="targetTitles"
              name="targetTitles"
              onChange={(event) => updateFormState("targetTitles", event.target.value)}
              placeholder="Founder, CEO, Head of Growth"
              value={formState.targetTitles}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="services">Relevant services or categories</Label>
            <Input
              id="services"
              name="services"
              onChange={(event) => updateFormState("services", event.target.value)}
              placeholder="SEO, PPC, web design"
              value={formState.services}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
            Readiness and economics
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-ink">What does good look like commercially?</h3>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="leadGoal">Lead goal</Label>
            <Select
              onValueChange={(value) => updateFormState("leadGoal", value)}
              value={formState.leadGoal}
            >
              <SelectTrigger id="leadGoal">
                <SelectValue placeholder="Select monthly lead goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 leads</SelectItem>
                <SelectItem value="50">50 leads</SelectItem>
                <SelectItem value="100">100 leads</SelectItem>
                <SelectItem value="150">150 leads</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumScore">Minimum lead score</Label>
            <Select
              onValueChange={(value) => updateFormState("minimumScore", value)}
              value={formState.minimumScore}
            >
              <SelectTrigger id="minimumScore">
                <SelectValue placeholder="Select minimum score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">60+</SelectItem>
                <SelectItem value="70">70+</SelectItem>
                <SelectItem value="80">80+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredContactability">Required contactability</Label>
            <Select
              onValueChange={(value) =>
                updateFormState("requiredContactability", value as RequiredContactability)
              }
              value={formState.requiredContactability}
            >
              <SelectTrigger id="requiredContactability">
                <SelectValue placeholder="Select contactability floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="founderConfidenceMin">Founder confidence floor</Label>
            <Select
              onValueChange={(value) => updateFormState("founderConfidenceMin", value)}
              value={formState.founderConfidenceMin}
            >
              <SelectTrigger id="founderConfidenceMin">
                <SelectValue placeholder="Select founder-confidence minimum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5+</SelectItem>
                <SelectItem value="0.7">0.7+</SelectItem>
                <SelectItem value="0.9">0.9+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="averageClientValue">Average client value</Label>
            <div className="grid grid-cols-[7rem_1fr] gap-3">
              <Select
                onValueChange={(value) => updateFormState("currency", value as CurrencyOption)}
                value={formState.currency}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
              <Input
                min={500}
                id="averageClientValue"
                name="averageClientValue"
                onChange={(event) => updateFormState("averageClientValue", event.target.value)}
                placeholder="5000"
                type="number"
                value={formState.averageClientValue}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outboundMaturity">Outbound maturity</Label>
            <Select
              onValueChange={(value) => updateFormState("outboundMaturity", value as OutboundMaturity)}
              value={formState.outboundMaturity}
            >
              <SelectTrigger id="outboundMaturity">
                <SelectValue placeholder="Select your current outbound maturity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No real outbound system yet</SelectItem>
                <SelectItem value="manual">Mostly manual outbound</SelectItem>
                <SelectItem value="structured">Some structure already exists</SelectItem>
                <SelectItem value="team">Dedicated outbound team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="currentChallenges">Current outbound or lead-quality challenges</Label>
          <Textarea
            required
            id="currentChallenges"
            minLength={20}
            name="currentChallenges"
            onChange={(event) => updateFormState("currentChallenges", event.target.value)}
            placeholder="We can find agencies, but too many leads are generic, founder confidence is weak, and SDRs still spend hours cleaning contact data..."
            rows={6}
            value={formState.currentChallenges}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="successDefinition">What would make this successful in the first 30 days?</Label>
          <Textarea
            id="successDefinition"
            name="successDefinition"
            onChange={(event) => updateFormState("successDefinition", event.target.value)}
            placeholder="For us, success means 10-15 outbound-ready opportunities, cleaner founder routing, and at least a few meetings from the first cohort."
            rows={4}
            value={formState.successDefinition}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-7 text-muted">
          We review every application manually. If there is a fit, we&apos;ll come back with the
          recommended campaign shape and best next step.
        </p>
        <Button className="w-full sm:w-auto" disabled={isSubmitting} size="lg" type="submit">
          {isSubmitting ? "Submitting..." : "Apply for a campaign"}
        </Button>
      </div>
    </form>
  );
}
