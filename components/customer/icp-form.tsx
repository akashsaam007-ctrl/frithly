"use client";

import { useState } from "react";
import type { BrandVoice } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export type IcpFormValues = {
  brandVoice: BrandVoice;
  companySizeMax: string;
  companySizeMin: string;
  exclusions: string;
  geographies: string;
  industries: string;
  productDescription: string;
  signals: string;
  titles: string;
};

type IcpFormProps = {
  initialValues: IcpFormValues;
  initialUpdatedAtLabel: string | null;
};

export function IcpForm({ initialUpdatedAtLabel, initialValues }: IcpFormProps) {
  const [formState, setFormState] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(initialUpdatedAtLabel);

  function updateField<Key extends keyof IcpFormValues>(key: Key, value: IcpFormValues[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const companySizeMin = formState.companySizeMin.trim()
      ? Number.parseInt(formState.companySizeMin, 10)
      : null;
    const companySizeMax = formState.companySizeMax.trim()
      ? Number.parseInt(formState.companySizeMax, 10)
      : null;

    if (
      (companySizeMin !== null && Number.isNaN(companySizeMin)) ||
      (companySizeMax !== null && Number.isNaN(companySizeMax))
    ) {
      toast.error("Company size values must be valid numbers.");
      return;
    }

    if (companySizeMin !== null && companySizeMax !== null && companySizeMin > companySizeMax) {
      toast.error("Minimum company size cannot be greater than maximum company size.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/customer/icp", {
        body: JSON.stringify({
          ...formState,
          companySizeMax,
          companySizeMin,
          productDescription: formState.productDescription.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const payload = (await response.json()) as { error?: string; updatedAtLabel?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "We couldn't save your ICP changes.");
      }

      setLastUpdated(payload.updatedAtLabel ?? new Date().toLocaleString("en-GB"));
      toast.success("ICP changes saved for next Monday's batch.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "We couldn't save your ICP changes.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="titles">Target Job Titles</Label>
          <Input
            id="titles"
            placeholder="Head of Sales, VP Sales, CRO"
            value={formState.titles}
            onChange={(event) => updateField("titles", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industries">Target Industries</Label>
          <Input
            id="industries"
            placeholder="B2B SaaS, consulting, recruitment"
            value={formState.industries}
            onChange={(event) => updateField("industries", event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySizeMin">Company Size Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="companySizeMin"
              placeholder="Min"
              type="number"
              value={formState.companySizeMin}
              onChange={(event) => updateField("companySizeMin", event.target.value)}
            />
            <Input
              placeholder="Max"
              type="number"
              value={formState.companySizeMax}
              onChange={(event) => updateField("companySizeMax", event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="geographies">Geographies</Label>
          <Input
            id="geographies"
            placeholder="United Kingdom, United States"
            value={formState.geographies}
            onChange={(event) => updateField("geographies", event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signals">Trigger Signals to Look For</Label>
        <Textarea
          id="signals"
          placeholder="Recently raised funding, hired SDRs, posted about outbound..."
          value={formState.signals}
          onChange={(event) => updateField("signals", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="exclusions">Hard Exclusions</Label>
        <Textarea
          id="exclusions"
          placeholder="Solopreneurs, pre-revenue companies, agencies under 5 people..."
          value={formState.exclusions}
          onChange={(event) => updateField("exclusions", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="productDescription">Product Description</Label>
        <Textarea
          required
          id="productDescription"
          placeholder="What does your team sell? (1-2 sentences)"
          value={formState.productDescription}
          onChange={(event) => updateField("productDescription", event.target.value)}
        />
      </div>

      <div className="space-y-3">
        <Label>Brand Voice</Label>
        <div className="flex flex-wrap gap-3">
          {(["casual", "professional", "direct"] as BrandVoice[]).map((voice) => (
            <label
              key={voice}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-ink"
            >
              <input
                checked={formState.brandVoice === voice}
                className="h-4 w-4 accent-terracotta"
                name="brandVoice"
                type="radio"
                value={voice}
                onChange={() => updateField("brandVoice", voice)}
              />
              <span className="capitalize">{voice}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Button size="lg" type="submit">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <p className="text-sm text-muted">
          Changes apply to next Monday&apos;s batch. Email us if you need adjustments to this
          week&apos;s brief.
        </p>
        <p className="text-sm text-muted">
          Last updated: {lastUpdated ?? "Not saved yet"}
        </p>
      </div>
    </form>
  );
}
