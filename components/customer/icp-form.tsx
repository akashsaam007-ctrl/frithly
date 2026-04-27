"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

const initialState = {
  brandVoice: "professional",
  companySizeMax: "500",
  companySizeMin: "11",
  exclusions: "Solopreneurs, agencies under 5 people",
  geographies: "United Kingdom, United States",
  industries: "B2B SaaS, agencies, professional services",
  productDescription:
    "We help outbound teams replace manual lead research with researched intelligence and personalized opening lines.",
  signals: "Recently hired SDRs, raised funding, posted about outbound problems",
  titles: "Head of Sales, VP Sales, CRO",
};

export function IcpForm() {
  const [formState, setFormState] = useState(initialState);
  const [lastUpdated, setLastUpdated] = useState("28 Apr 2026, 09:12");

  function updateField<Key extends keyof typeof initialState>(key: Key, value: (typeof initialState)[Key]) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLastUpdated(new Date().toLocaleString("en-GB"));
    toast.success("ICP changes saved for next Monday's batch.");
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
          {["casual", "professional", "direct"].map((voice) => (
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
          Save Changes
        </Button>
        <p className="text-sm text-muted">
          Changes apply to next Monday&apos;s batch. Email us if you need adjustments to this
          week&apos;s brief.
        </p>
        <p className="text-sm text-muted">Last updated: {lastUpdated}</p>
      </div>
    </form>
  );
}
