"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, FileStack, Loader2, Radar, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type AdminCustomerIcpEditorProps = {
  customer: {
    email: string;
    id: string;
    label: string;
    planLabel: string;
    status: string | null;
  };
  initialIcp: {
    brandVoice: "casual" | "direct" | "professional" | null;
    companySizeMax: number | null;
    companySizeMin: number | null;
    exclusions: string[];
    geographies: string[];
    id: string;
    name: string | null;
    productDescription: string;
    signals: string[];
    targetIndustries: string[];
    targetTitles: string[];
    updatedAt: string | null;
  } | null;
  leadStudioHref: string;
};

type SaveResponse = {
  error?: string;
  icp?: {
    brand_voice: "casual" | "direct" | "professional" | null;
    company_size_max: number | null;
    company_size_min: number | null;
    exclusions: string[] | null;
    geographies: string[] | null;
    id: string;
    is_active: boolean | null;
    name: string | null;
    product_description: string;
    signals: string[] | null;
    target_industries: string[] | null;
    target_titles: string[] | null;
    updated_at: string | null;
  };
  success?: boolean;
};

function formatList(values: string[] | null | undefined) {
  return values?.length ? values.join("\n") : "";
}

function parseList(value: string) {
  const parts = value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

  return [...new Set(parts)];
}

function formatUpdatedAt(value: string | null) {
  if (!value) {
    return "Not saved yet";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatSizeRange(min: number | null, max: number | null) {
  if (min && max) {
    return `${min} to ${max} employees`;
  }

  if (min) {
    return `${min}+ employees`;
  }

  if (max) {
    return `Up to ${max} employees`;
  }

  return "Open company size";
}

export function CustomerIcpEditor({
  customer,
  initialIcp,
  leadStudioHref,
}: AdminCustomerIcpEditorProps) {
  const [name, setName] = useState(initialIcp?.name ?? `${customer.label} active ICP`);
  const [productDescription, setProductDescription] = useState(initialIcp?.productDescription ?? "");
  const [targetIndustries, setTargetIndustries] = useState(formatList(initialIcp?.targetIndustries));
  const [targetTitles, setTargetTitles] = useState(formatList(initialIcp?.targetTitles));
  const [geographies, setGeographies] = useState(formatList(initialIcp?.geographies));
  const [signals, setSignals] = useState(formatList(initialIcp?.signals));
  const [exclusions, setExclusions] = useState(formatList(initialIcp?.exclusions));
  const [companySizeMin, setCompanySizeMin] = useState(
    initialIcp?.companySizeMin ? String(initialIcp.companySizeMin) : "",
  );
  const [companySizeMax, setCompanySizeMax] = useState(
    initialIcp?.companySizeMax ? String(initialIcp.companySizeMax) : "",
  );
  const [brandVoice, setBrandVoice] = useState<"casual" | "direct" | "professional">(
    initialIcp?.brandVoice ?? "professional",
  );
  const [savedIcp, setSavedIcp] = useState(initialIcp);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: "error" | "success" } | null>(
    null,
  );

  const summary = useMemo(
    () => ({
      exclusions: parseList(exclusions),
      geographies: parseList(geographies),
      industries: parseList(targetIndustries),
      sizeLabel: formatSizeRange(
        companySizeMin.trim() ? Number(companySizeMin) : null,
        companySizeMax.trim() ? Number(companySizeMax) : null,
      ),
      signals: parseList(signals),
      titles: parseList(targetTitles),
    }),
    [companySizeMax, companySizeMin, exclusions, geographies, signals, targetIndustries, targetTitles],
  );

  async function handleSave() {
    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/admin/customers/${customer.id}/icp`, {
        body: JSON.stringify({
          brandVoice,
          companySizeMax: companySizeMax.trim() ? Number(companySizeMax) : null,
          companySizeMin: companySizeMin.trim() ? Number(companySizeMin) : null,
          exclusions: parseList(exclusions),
          geographies: parseList(geographies),
          name: name.trim() || null,
          productDescription: productDescription.trim(),
          signals: parseList(signals),
          targetIndustries: parseList(targetIndustries),
          targetTitles: parseList(targetTitles),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
      });

      const payload = (await response.json()) as SaveResponse;

      if (!response.ok || !payload.icp) {
        throw new Error(payload.error || "We couldn't save the active ICP right now.");
      }

      setSavedIcp({
        brandVoice: payload.icp.brand_voice,
        companySizeMax: payload.icp.company_size_max,
        companySizeMin: payload.icp.company_size_min,
        exclusions: payload.icp.exclusions ?? [],
        geographies: payload.icp.geographies ?? [],
        id: payload.icp.id,
        name: payload.icp.name,
        productDescription: payload.icp.product_description,
        signals: payload.icp.signals ?? [],
        targetIndustries: payload.icp.target_industries ?? [],
        targetTitles: payload.icp.target_titles ?? [],
        updatedAt: payload.icp.updated_at,
      });
      setFeedback({
        message: "Active ICP saved. Lead studio will now generate from this admin-managed brief.",
        tone: "success",
      });
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "We couldn't save the active ICP right now.",
        tone: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_380px]">
      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="gap-2 bg-terracotta/12 px-4 py-1.5 text-[0.72rem] uppercase tracking-[0.18em] text-terracotta">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin-managed ICP
            </Badge>
            <Badge variant="muted">{customer.planLabel}</Badge>
            <Badge variant="muted" className="capitalize">
              {customer.status ?? "pending"}
            </Badge>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl">Manage the active targeting brief.</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-7 text-white/62">
              Save the ICP that powers lead discovery for this customer. Once this brief is live,
              the admin lead studio uses it as the campaign source of truth.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {feedback ? (
            <div
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm leading-7",
                feedback.tone === "success"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                  : "border-rose-400/20 bg-rose-400/10 text-rose-100",
              )}
            >
              {feedback.message}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="icp-name">ICP name</Label>
              <Input
                id="icp-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Frithly primary ICP"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="icp-description">Product description</Label>
              <Textarea
                id="icp-description"
                rows={6}
                value={productDescription}
                onChange={(event) => setProductDescription(event.target.value)}
                placeholder="Describe the product, buyer problem, and what the lead generation should optimize for."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icp-industries">Target industries</Label>
              <Textarea
                id="icp-industries"
                rows={5}
                value={targetIndustries}
                onChange={(event) => setTargetIndustries(event.target.value)}
                placeholder={"B2B SaaS\nSales software\nRevOps"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icp-titles">Decision-makers</Label>
              <Textarea
                id="icp-titles"
                rows={5}
                value={targetTitles}
                onChange={(event) => setTargetTitles(event.target.value)}
                placeholder={"Founder\nCEO\nHead of Sales"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icp-geographies">Geographies</Label>
              <Textarea
                id="icp-geographies"
                rows={4}
                value={geographies}
                onChange={(event) => setGeographies(event.target.value)}
                placeholder={"United States\nUnited Kingdom\nWestern Europe"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icp-signals">Priority signals</Label>
              <Textarea
                id="icp-signals"
                rows={4}
                value={signals}
                onChange={(event) => setSignals(event.target.value)}
                placeholder={"Hiring SDRs\nRecent funding\nProduct launch"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icp-exclusions">Exclusions</Label>
              <Textarea
                id="icp-exclusions"
                rows={4}
                value={exclusions}
                onChange={(event) => setExclusions(event.target.value)}
                placeholder={"Crypto\nRecruiting\nLocal services"}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="icp-size-min">Company size min</Label>
                <Input
                  id="icp-size-min"
                  inputMode="numeric"
                  value={companySizeMin}
                  onChange={(event) => setCompanySizeMin(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icp-size-max">Company size max</Label>
                <Input
                  id="icp-size-max"
                  inputMode="numeric"
                  value={companySizeMax}
                  onChange={(event) => setCompanySizeMax(event.target.value.replace(/[^\d]/g, ""))}
                  placeholder="200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icp-brand-voice">Brand voice</Label>
              <Select value={brandVoice} onValueChange={(value: "casual" | "direct" | "professional") => setBrandVoice(value)}>
                <SelectTrigger id="icp-brand-voice">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => void handleSave()} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Save active ICP
            </Button>
            <Button asChild type="button" variant="secondary">
              <Link href={leadStudioHref}>Open lead studio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Radar className="h-5 w-5 text-terracotta" />
              Live ICP summary
            </CardTitle>
            <CardDescription>
              This is the active brief snapshot the admin studio will generate from.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-7 text-white/66">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Customer</p>
              <p className="mt-2 font-medium text-white/86">{customer.label}</p>
              <p className="text-white/50">{customer.email}</p>
            </div>

            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Updated</p>
              <p className="mt-2">{formatUpdatedAt(savedIcp?.updatedAt ?? null)}</p>
            </div>

            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Coverage</p>
              <p className="mt-2">{summary.geographies.join(", ") || "Open geography"}</p>
            </div>

            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Company size</p>
              <p className="mt-2">{summary.sizeLabel}</p>
            </div>

            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Industries</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {summary.industries.length > 0 ? (
                  summary.industries.slice(0, 8).map((industry) => (
                    <Badge key={industry} variant="outline">
                      {industry}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="muted">No industries yet</Badge>
                )}
              </div>
            </div>

            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Decision-makers</p>
              <p className="mt-2">{summary.titles.join(", ") || "No titles yet"}</p>
            </div>

            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Signals</p>
              <p className="mt-2">{summary.signals.join(", ") || "No signals yet"}</p>
            </div>

            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-white/42">Exclusions</p>
              <p className="mt-2">{summary.exclusions.join(", ") || "No exclusions yet"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/8 bg-[#0a131d] shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileStack className="h-5 w-5 text-terracotta" />
              How it flows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-white/64">
            <p>1. Save the customer’s active ICP here.</p>
            <p>2. Open lead studio with this customer preselected.</p>
            <p>3. Launch discovery from the admin-managed brief.</p>
            <p>4. Review qualified, review-required, and rejected leads inside admin.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
