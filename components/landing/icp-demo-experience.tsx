"use client";

import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronRight,
  Clock3,
  Layers3,
  MailCheck,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/lib/constants";
import { captureEvent } from "@/lib/monitoring/posthog";

type ContactabilityThreshold = "premium" | "strong";
type CountryOption = "uae" | "uk" | "us";

type DemoFormState = {
  city: string;
  companySize: string;
  contactabilityThreshold: ContactabilityThreshold;
  country: CountryOption;
  industry: string;
  leadGoal: number;
};

type DemoOpportunity = {
  contactability: string;
  founder: string;
  founderConfidence: number;
  outreachAngle: string;
  readiness: string;
  recommendationScore: number;
  services: string[];
  summary: string;
  whyRecommended: string[];
};

type DemoScenario = {
  city: string;
  cohort: {
    approved: number;
    pendingManualReview: number;
    premiumDensity: string;
    smtpSafe: number;
    summary: string;
  };
  companySize: string;
  contactabilityThreshold: ContactabilityThreshold;
  country: CountryOption;
  freshness: string;
  headline: string;
  industry: string;
  leadGoal: number;
  opportunities: DemoOpportunity[];
  outcomeSignal: string;
  phaseSummaries: string[];
  phaseTimeline: Array<{
    detail: string;
    label: string;
  }>;
  queryExpansion: string[];
  stats: {
    cohortReady: number;
    discovered: number;
    enriched: number;
    recommended: number;
    smtpSafe: number;
  };
  whyItWins: string[];
};

const countryOptions: Array<{ label: string; value: CountryOption }> = [
  { label: "United Kingdom", value: "uk" },
  { label: "United States", value: "us" },
  { label: "United Arab Emirates", value: "uae" },
];

const cityOptions: Record<CountryOption, string[]> = {
  uae: ["Dubai", "Abu Dhabi", "Sharjah"],
  uk: ["Manchester", "Birmingham", "Bristol"],
  us: ["Austin", "Chicago", "New York"],
};

const industryOptions = [
  "SEO agencies",
  "PPC agencies",
  "Web design agencies",
];

const companySizeOptions = ["5-50", "11-50", "51-200"];

const presets = [
  {
    description: "Selective SEO agency campaign with premium contactability floor.",
    id: "uk-seo",
    label: "UK SEO agencies",
    state: {
      city: "Manchester",
      companySize: "5-50",
      contactabilityThreshold: "premium" as const,
      country: "uk" as const,
      industry: "SEO agencies",
      leadGoal: 50,
    },
  },
  {
    description: "PPC-heavy outbound campaign with stronger volume and broader routing.",
    id: "uk-ppc",
    label: "UK PPC agencies",
    state: {
      city: "Birmingham",
      companySize: "11-50",
      contactabilityThreshold: "strong" as const,
      country: "uk" as const,
      industry: "PPC agencies",
      leadGoal: 40,
    },
  },
  {
    description: "Premium creative-ops campaign with stricter SMTP-ready expectations.",
    id: "uk-design",
    label: "UK web design",
    state: {
      city: "Bristol",
      companySize: "5-50",
      contactabilityThreshold: "premium" as const,
      country: "uk" as const,
      industry: "Web design agencies",
      leadGoal: 30,
    },
  },
];

const demoScenarios: DemoScenario[] = [
  {
    city: "Manchester",
    cohort: {
      approved: 4,
      pendingManualReview: 1,
      premiumDensity: "80%",
      smtpSafe: 3,
      summary:
        "Four agencies are worth operator attention, three are safe enough for SMTP-gated validation, and one stays in manual review because contactability is strong but not premium yet.",
    },
    companySize: "5-50",
    contactabilityThreshold: "premium",
    country: "uk",
    freshness: "updated 2 days ago",
    headline: "Premium Manchester SEO opportunities with founder-led routing and clean signal density.",
    industry: "SEO agencies",
    leadGoal: 50,
    opportunities: [
      {
        contactability: "Premium",
        founder: "Chris Coussons",
        founderConfidence: 0.92,
        outreachAngle: "Lead with their strong SMB growth positioning, then show the gap between brand quality and outbound motion depth.",
        readiness: "SMTP-safe now",
        recommendationScore: 100,
        services: ["SEO", "PPC", "Growth strategy"],
        summary:
          "Positioning is sharp, founder path is clear, and the contact route is materially better than the market baseline.",
        whyRecommended: [
          "High-confidence founder path",
          "Premium contactability and fresh enrichment",
          "Strong service fit for outbound acceleration",
        ],
      },
      {
        contactability: "Premium",
        founder: "Darryl Antonio",
        founderConfidence: 0.88,
        outreachAngle: "Use their local-search credibility as the opener and frame Frithly as a way to make outbound match the quality of inbound positioning.",
        readiness: "Ready for approval",
        recommendationScore: 90,
        services: ["Local SEO", "Lead generation", "Analytics"],
        summary:
          "Strong commercial fit with recent enrichment and a contact path that looks safe enough for final review.",
        whyRecommended: [
          "Healthy routing signal with founder context",
          "Lead score and recommendation score both clear premium band",
          "High relevance for outbound-ops offer",
        ],
      },
      {
        contactability: "Strong",
        founder: "Nadia Ellis",
        founderConfidence: 0.79,
        outreachAngle: "Open on their credibility in paid media, then offer a more selective outbound layer for founder-led account targeting.",
        readiness: "Manual review",
        recommendationScore: 78,
        services: ["PPC", "Landing pages", "Attribution"],
        summary:
          "Good commercial fit and strong founder signal, but contactability still needs operator review before SMTP.",
        whyRecommended: [
          "Recommendation score above premium threshold",
          "Strong but not fully premium contactability",
          "Fresh enrichment with clean website quality",
        ],
      },
    ],
    outcomeSignal:
      "Founder confidence above 0.8 and premium contactability are outperforming baseline positive reply rates by 38% in similar UK agency cohorts.",
    phaseSummaries: [
      "Generating city-aware discovery queries for UK SEO agencies.",
      "Enriching websites, validating contact paths, and filtering weak domains.",
      "Ranking opportunities using founder confidence, contactability, and freshness.",
      "Packaging a cohort with manual approval and SMTP-safe gating preserved.",
    ],
    phaseTimeline: [
      {
        detail: "Queries expand from Manchester into adjacent high-yield city clusters only if quality stays above threshold.",
        label: "Campaign setup",
      },
      {
        detail: "Discovery and enrichment simulate the production filters that keep low-quality domains from polluting the queue.",
        label: "Discovery and enrichment",
      },
      {
        detail: "Recommendation score combines company quality, contact intelligence, and readiness instead of list volume.",
        label: "Recommendation filtering",
      },
      {
        detail: "Only the strongest opportunities advance into cohort packaging and SMTP review.",
        label: "Cohort formation",
      },
    ],
    queryExpansion: [
      "SEO agencies Manchester",
      "Digital marketing agencies Manchester",
      "PPC agencies Manchester",
      "SEO agencies Liverpool",
    ],
    stats: {
      cohortReady: 5,
      discovered: 120,
      enriched: 34,
      recommended: 12,
      smtpSafe: 3,
    },
    whyItWins: [
      "Maintains a premium contactability floor instead of padding with generic emails.",
      "Keeps recommendation feed scarce enough for real operator review.",
      "Protects deliverability by preserving SMTP gating until the final step.",
    ],
  },
  {
    city: "Birmingham",
    cohort: {
      approved: 5,
      pendingManualReview: 2,
      premiumDensity: "71%",
      smtpSafe: 4,
      summary:
        "This scenario produces a broader but still selective cohort, with four SMTP-safe opportunities and two held back because routing is strong rather than premium.",
    },
    companySize: "11-50",
    contactabilityThreshold: "strong",
    country: "uk",
    freshness: "updated 3 days ago",
    headline: "Birmingham PPC agencies with broader routing but still selective approval thresholds.",
    industry: "PPC agencies",
    leadGoal: 40,
    opportunities: [
      {
        contactability: "Premium",
        founder: "Samir Patel",
        founderConfidence: 0.89,
        outreachAngle: "Lead with paid media specialization, then show how selective outbound can complement their existing growth channels.",
        readiness: "SMTP-safe now",
        recommendationScore: 94,
        services: ["PPC", "Paid social", "CRO"],
        summary:
          "Strong founder signal, deeper service fit, and clear positioning around growth execution.",
        whyRecommended: [
          "High founder-confidence score",
          "Recent site refresh and active services footprint",
          "Clean routing with premium contact path",
        ],
      },
      {
        contactability: "Strong",
        founder: "Lucy Warren",
        founderConfidence: 0.82,
        outreachAngle: "Mention their PPC-to-revenue positioning and offer better outbound opportunity selection for founders or small account teams.",
        readiness: "Ready for approval",
        recommendationScore: 84,
        services: ["PPC", "Attribution", "Reporting"],
        summary:
          "Good strategic fit with clear operator value, held just below SMTP-safe because routing needs one more approval step.",
        whyRecommended: [
          "Recommendation score clears threshold comfortably",
          "Founder signal remains strong",
          "Strong contactability with safe manual-review posture",
        ],
      },
      {
        contactability: "Strong",
        founder: "Nathan Cole",
        founderConfidence: 0.75,
        outreachAngle: "Frame Frithly as a way to add confidence-aware outbound into a performance-first agency motion.",
        readiness: "Manual review",
        recommendationScore: 76,
        services: ["Search ads", "Remarketing", "Analytics"],
        summary:
          "Commercially useful, but operator review still matters because the founder path is good rather than exceptional.",
        whyRecommended: [
          "Founder context present",
          "Good service fit and city density",
          "Sits just below premium readiness",
        ],
      },
    ],
    outcomeSignal:
      "Strong contactability plus founder confidence above 0.75 is lifting meeting conversion on Birmingham agency cohorts even when SMTP-safe coverage is narrower.",
    phaseSummaries: [
      "Loading a broader paid-media campaign with Birmingham as the anchor city.",
      "Simulating enrichment with higher routing tolerance but the same quality floor.",
      "Filtering opportunities into premium, strong, and defer buckets.",
      "Packaging a cohort that stays operator-approved rather than auto-sent.",
    ],
    phaseTimeline: [
      {
        detail: "The campaign widens city-aware discovery while preserving the same selective scoring model.",
        label: "Campaign setup",
      },
      {
        detail: "Enrichment keeps weak domains and shallow contact paths out before they touch recommendations.",
        label: "Discovery and enrichment",
      },
      {
        detail: "Strong contactability is allowed here, but recommendation ranking still rewards premium readiness.",
        label: "Recommendation filtering",
      },
      {
        detail: "Cohort packaging keeps only the best candidates inside human review and SMTP-safe gates.",
        label: "Cohort formation",
      },
    ],
    queryExpansion: [
      "PPC agencies Birmingham",
      "Paid media agencies Birmingham",
      "Digital marketing agencies Birmingham",
      "PPC agencies Leeds",
    ],
    stats: {
      cohortReady: 7,
      discovered: 108,
      enriched: 31,
      recommended: 15,
      smtpSafe: 4,
    },
    whyItWins: [
      "Supports a slightly broader routing threshold without collapsing into generic list quality.",
      "Keeps the demo honest about which contacts are safe enough now versus later.",
      "Shows how recommendation quality still drives the visible opportunity feed.",
    ],
  },
  {
    city: "Bristol",
    cohort: {
      approved: 3,
      pendingManualReview: 1,
      premiumDensity: "100%",
      smtpSafe: 3,
      summary:
        "This is the most selective path in the demo set, producing fewer opportunities but an unusually clean premium cohort with no filler.",
    },
    companySize: "5-50",
    contactabilityThreshold: "premium",
    country: "uk",
    freshness: "updated 1 day ago",
    headline: "Highly selective Bristol web-design campaign with fewer leads but the cleanest premium density.",
    industry: "Web design agencies",
    leadGoal: 30,
    opportunities: [
      {
        contactability: "Premium",
        founder: "Hannah Cole",
        founderConfidence: 0.94,
        outreachAngle: "Open on design quality and then connect that polish to the value of a more selective outbound operating layer.",
        readiness: "SMTP-safe now",
        recommendationScore: 97,
        services: ["Web design", "Brand systems", "Webflow builds"],
        summary:
          "Very high founder confidence and a clean premium contact path make this a strong first-queue opportunity.",
        whyRecommended: [
          "Founder confidence above 0.9",
          "Premium routing and recent enrichment",
          "Strong fit for design-led outbound positioning",
        ],
      },
      {
        contactability: "Premium",
        founder: "James Fletcher",
        founderConfidence: 0.86,
        outreachAngle: "Mention design-forward brand quality, then frame Frithly as the pipeline layer that matches their polish.",
        readiness: "Ready for approval",
        recommendationScore: 89,
        services: ["Web design", "Branding", "CRO"],
        summary:
          "Slightly smaller surface area than the Manchester scenario, but extremely strong quality once the stack narrows.",
        whyRecommended: [
          "High-quality commercial fit",
          "Premium contactability maintained",
          "Fresh founder and services intelligence",
        ],
      },
      {
        contactability: "Premium",
        founder: "Amira Hassan",
        founderConfidence: 0.81,
        outreachAngle: "Position Frithly as a way to bring the same curation they apply to design into outbound account selection.",
        readiness: "Manual review",
        recommendationScore: 82,
        services: ["Creative strategy", "Brand refresh", "UI systems"],
        summary:
          "Still premium, but operator review holds this until messaging relevance is confirmed.",
        whyRecommended: [
          "Recommendation score comfortably above threshold",
          "Premium contactability preserved",
          "Needs human review for messaging alignment",
        ],
      },
    ],
    outcomeSignal:
      "When premium contactability is preserved end to end, Bristol creative-agency cohorts are showing the cleanest bounce profile in the demo set.",
    phaseSummaries: [
      "Building a tighter creative-agency campaign with stricter premium thresholds.",
      "Filtering out generic routing paths early to keep the opportunity set believable.",
      "Ranking only the strongest design-led accounts into the recommendation feed.",
      "Producing a small but high-confidence cohort that stays export-ready.",
    ],
    phaseTimeline: [
      {
        detail: "The campaign starts smaller on purpose so the quality floor never gets diluted.",
        label: "Campaign setup",
      },
      {
        detail: "Enrichment drops weak routing paths before recommendation scoring begins.",
        label: "Discovery and enrichment",
      },
      {
        detail: "Only premium-readiness opportunities make it through the final recommendation layer.",
        label: "Recommendation filtering",
      },
      {
        detail: "The resulting cohort is smaller, but almost every visible lead is worth operator time.",
        label: "Cohort formation",
      },
    ],
    queryExpansion: [
      "Web design agencies Bristol",
      "Branding agencies Bristol",
      "Creative agencies Bristol",
      "Webflow agencies Bristol",
    ],
    stats: {
      cohortReady: 4,
      discovered: 84,
      enriched: 22,
      recommended: 9,
      smtpSafe: 3,
    },
    whyItWins: [
      "Shows the product's willingness to return fewer leads when the quality floor is high.",
      "Makes premium contactability the visible bottleneck instead of pretending all leads are equal.",
      "Supports the product story that selectivity is the moat.",
    ],
  },
];

const simulationStageDelays = [0, 900, 1800, 2800] as const;

const initialFormState: DemoFormState = {
  city: "Manchester",
  companySize: "5-50",
  contactabilityThreshold: "premium",
  country: "uk",
  industry: "SEO agencies",
  leadGoal: 50,
};

function findScenario(formState: DemoFormState) {
  return (
    demoScenarios.find(
      (scenario) =>
        scenario.industry === formState.industry &&
        scenario.country === formState.country &&
        scenario.city === formState.city,
    ) ?? demoScenarios[0]
  );
}

export function IcpDemoExperience() {
  const pathname = usePathname();
  const [formState, setFormState] = useState(initialFormState);
  const [activeStage, setActiveStage] = useState(-1);
  const [logCount, setLogCount] = useState(0);
  const [opportunityCount, setOpportunityCount] = useState(0);
  const [phaseSummaryIndex, setPhaseSummaryIndex] = useState(-1);
  const [runState, setRunState] = useState<"complete" | "idle" | "running">("idle");
  const [simulationKey, setSimulationKey] = useState(0);
  const hasAutoStartedRef = useRef(false);

  const scenario = findScenario(formState);

  useEffect(() => {
    if (hasAutoStartedRef.current) {
      return;
    }

    hasAutoStartedRef.current = true;

    const timer = window.setTimeout(() => {
      captureEvent("icp_demo_started", {
        city: scenario.city,
        country: scenario.country,
        industry: scenario.industry,
        location: pathname,
        source: "auto",
      });

      startTransition(() => {
        setSimulationKey((current) => current + 1);
      });
    }, 240);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname, scenario.city, scenario.country, scenario.industry]);

  useEffect(() => {
    if (simulationKey === 0) {
      return;
    }

    setRunState("running");
    setActiveStage(-1);
    setLogCount(0);
    setOpportunityCount(0);
    setPhaseSummaryIndex(-1);

    const timers = simulationStageDelays.flatMap((delay, index) => [
      window.setTimeout(() => {
        setActiveStage(index);
        setPhaseSummaryIndex(index);
        setLogCount(Math.min(scenario.queryExpansion.length, index + 1));
        if (index >= 1) {
          setOpportunityCount(Math.min(scenario.opportunities.length, index));
        }
      }, delay),
    ]);

    const completionTimer = window.setTimeout(() => {
      setActiveStage(scenario.phaseTimeline.length - 1);
      setLogCount(scenario.queryExpansion.length);
      setOpportunityCount(scenario.opportunities.length);
      setPhaseSummaryIndex(scenario.phaseTimeline.length - 1);
      setRunState("complete");
      captureEvent("icp_demo_completed", {
        city: scenario.city,
        country: scenario.country,
        industry: scenario.industry,
        location: pathname,
      });
    }, simulationStageDelays[simulationStageDelays.length - 1] + 1000);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(completionTimer);
    };
  }, [pathname, scenario, simulationKey]);

  function updateFormState<K extends keyof DemoFormState>(key: K, value: DemoFormState[K]) {
    startTransition(() => {
      setFormState((current) => {
        if (key === "country") {
          const nextCountry = value as CountryOption;
          const nextCity = cityOptions[nextCountry][0];

          return {
            ...current,
            city: cityOptions[nextCountry].includes(current.city) ? current.city : nextCity,
            country: nextCountry,
          };
        }

        return {
          ...current,
          [key]: value,
        };
      });
    });
  }

  function runDemo(source: "manual" | "preset") {
    captureEvent("icp_demo_started", {
      city: scenario.city,
      country: scenario.country,
      industry: scenario.industry,
      location: pathname,
      source,
    });

    startTransition(() => {
      setSimulationKey((current) => current + 1);
    });
  }

  function applyPreset(presetId: string) {
    const preset = presets.find((entry) => entry.id === presetId);

    if (!preset) {
      return;
    }

    startTransition(() => {
      setFormState(preset.state);
    });

    window.setTimeout(() => {
      runDemo("preset");
    }, 60);
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <Card className="overflow-hidden border-border/80 bg-white/90 shadow-[0_26px_70px_rgba(26,26,26,0.06)]">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline">Demo controls</Badge>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Curated preview
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle>Build your outbound campaign</CardTitle>
              <CardDescription>
                This is a staged intelligence preview based on real campaign patterns, not a live
                scraping run. The quality logic is real. The timing is intentionally choreographed.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  className={`rounded-[1.15rem] border px-4 py-4 text-left transition-all duration-300 ${
                    preset.state.city === formState.city && preset.state.industry === formState.industry
                      ? "border-terracotta/30 bg-terracotta/10 shadow-sm"
                      : "border-border/80 bg-stone-50 hover:border-terracotta/20 hover:bg-white"
                  }`}
                  onClick={() => applyPreset(preset.id)}
                  type="button"
                >
                  <div className="text-sm font-semibold text-ink">{preset.label}</div>
                  <p className="mt-2 text-xs leading-6 text-muted">{preset.description}</p>
                </button>
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={formState.industry} onValueChange={(value) => updateFormState("industry", value)}>
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Choose an industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formState.country} onValueChange={(value) => updateFormState("country", value as CountryOption)}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Choose a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select value={formState.city} onValueChange={(value) => updateFormState("city", value)}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Choose a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptions[formState.country].map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">Company size</Label>
                <Select value={formState.companySize} onValueChange={(value) => updateFormState("companySize", value)}>
                  <SelectTrigger id="companySize">
                    <SelectValue placeholder="Choose a size band" />
                  </SelectTrigger>
                  <SelectContent>
                    {companySizeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadGoal">Lead goal</Label>
                <Input
                  id="leadGoal"
                  min={10}
                  max={200}
                  type="number"
                  value={formState.leadGoal}
                  onChange={(event) =>
                    updateFormState("leadGoal", Math.max(10, Math.min(200, Number(event.target.value) || 10)))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactabilityThreshold">Contactability floor</Label>
                <Select
                  value={formState.contactabilityThreshold}
                  onValueChange={(value) =>
                    updateFormState("contactabilityThreshold", value as ContactabilityThreshold)
                  }
                >
                  <SelectTrigger id="contactabilityThreshold">
                    <SelectValue placeholder="Choose a threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium contactability</SelectItem>
                    <SelectItem value="strong">Strong contactability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-border/80 bg-stone-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                <Clock3 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                Demo mode
              </div>
              <p className="mt-3 text-sm leading-7 text-muted">
                Frithly will stage discovery, enrichment, recommendation filtering, and cohort
                formation using a believable campaign pattern instead of waiting on live queue
                infrastructure during a marketing flow.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="sm:flex-1" size="lg" onClick={() => runDemo("manual")}>
                <span className="inline-flex items-center gap-2">
                  Build campaign preview
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Button>
              <Button asChild className="sm:flex-1" size="lg" variant="secondary">
                <Link href={ROUTES.APPLY}>
                  Apply for a custom campaign
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="surface-card-dark overflow-hidden px-5 py-6 shadow-[0_28px_80px_rgba(12,12,12,0.32)] sm:px-6 sm:py-7">
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                  Live campaign preview
                </div>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">{scenario.headline}</h2>
              </div>
              <Badge className="border-white/10 bg-white/10 text-white" variant="outline">
                {scenario.freshness}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: "Discovered", value: scenario.stats.discovered },
                { label: "Enriched", value: activeStage >= 1 ? scenario.stats.enriched : 0 },
                { label: "Recommended", value: activeStage >= 2 ? scenario.stats.recommended : 0 },
                { label: "Cohort-ready", value: activeStage >= 3 ? scenario.stats.cohortReady : 0 },
                { label: "SMTP-safe", value: activeStage >= 3 ? scenario.stats.smtpSafe : 0 },
              ].map((metric) => (
                <div key={metric.label} className="rounded-[1rem] border border-white/10 bg-white/[0.05] px-4 py-4">
                  <div className="text-2xl font-semibold tracking-tighter text-white">{metric.value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Radar className="h-4 w-4 text-terracotta" aria-hidden="true" />
                  Campaign phases
                </div>
                <div className="mt-4 space-y-3">
                  {scenario.phaseTimeline.map((phase, index) => {
                    const state =
                      activeStage > index ? "complete" : activeStage === index ? "active" : "upcoming";

                    return (
                      <div
                        key={phase.label}
                        className={`rounded-[1rem] border px-4 py-4 transition-all duration-500 ${
                          state === "complete"
                            ? "border-emerald-400/20 bg-emerald-400/10"
                            : state === "active"
                              ? "border-terracotta/30 bg-white/[0.07]"
                              : "border-white/10 bg-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">{phase.label}</div>
                            <p className="mt-2 text-sm leading-7 text-white/65">{phase.detail}</p>
                          </div>
                          <div
                            className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                              state === "complete"
                                ? "bg-emerald-400/20 text-emerald-200"
                                : state === "active"
                                  ? "bg-terracotta/20 text-terracotta-light"
                                  : "bg-white/10 text-white/45"
                            }`}
                          >
                            {state === "complete" ? "OK" : index + 1}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Layers3 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                  Quality funnel
                </div>
                <div className="mt-4 space-y-4">
                  {[
                    {
                      label: "Discovered",
                      value: scenario.stats.discovered,
                      visible: true,
                      width: "100%",
                    },
                    {
                      label: "Enriched",
                      value: scenario.stats.enriched,
                      visible: activeStage >= 1,
                      width: "72%",
                    },
                    {
                      label: "Recommended",
                      value: scenario.stats.recommended,
                      visible: activeStage >= 2,
                      width: "41%",
                    },
                    {
                      label: "Outbound-ready",
                      value: scenario.stats.cohortReady,
                      visible: activeStage >= 3,
                      width: "22%",
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/70">{item.label}</span>
                        <span className="font-semibold text-white">{item.visible ? item.value : 0}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-terracotta to-terracotta-light transition-all duration-700"
                          style={{ width: item.visible ? item.width : "0%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[1rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
                    What the funnel means
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/70">
                    Frithly is willing to stop short of the lead goal when quality is not there.
                    The visible narrowing is the product story: fewer, stronger outbound bets.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Target className="h-4 w-4 text-terracotta" aria-hidden="true" />
                Discovery and enrichment notes
              </div>
              <div className="mt-4 space-y-3">
                {scenario.queryExpansion.slice(0, Math.max(logCount, 1)).map((entry, index) => (
                  <div
                    key={`${entry}-${index}`}
                    className="flex items-start gap-3 rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-terracotta" />
                    <span>{entry}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart3 className="h-4 w-4 text-terracotta" aria-hidden="true" />
                Outcome signal
              </div>
              <p className="mt-4 text-sm leading-7 text-white/70">{scenario.outcomeSignal}</p>
              <p className="mt-4 text-sm font-medium text-terracotta-light">
                {phaseSummaryIndex >= 0 ? scenario.phaseSummaries[phaseSummaryIndex] : scenario.phaseSummaries[0]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                Curated opportunities
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-ink">A believable subset, not a giant lead dump.</h2>
            </div>
            <Badge variant="success">{runState === "complete" ? "Preview complete" : "Running preview"}</Badge>
          </div>

          <div className="grid gap-4">
            {scenario.opportunities.map((opportunity, index) => {
              const visible = index < opportunityCount;

              return (
                <div
                  key={`${opportunity.founder}-${opportunity.recommendationScore}`}
                  className={`surface-card overflow-hidden p-5 transition-all duration-700 ${
                    visible
                      ? "translate-y-0 opacity-100 shadow-[0_24px_70px_rgba(26,26,26,0.08)]"
                      : "pointer-events-none translate-y-5 opacity-25"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-terracotta">
                          Recommended opportunity
                        </div>
                        <h3 className="mt-2 text-2xl font-semibold text-ink">{opportunity.founder}</h3>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{opportunity.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.services.map((service) => (
                          <span
                            key={service}
                            className="rounded-full border border-border/80 bg-stone-50 px-3 py-1 text-xs font-medium text-ink"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1rem] border border-terracotta/20 bg-terracotta/10 px-4 py-3 text-center">
                      <div className="text-2xl font-semibold tracking-tighter text-ink">
                        {opportunity.recommendationScore}
                      </div>
                      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        Recommendation
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1rem] border border-border/70 bg-white p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Founder confidence
                      </div>
                      <div className="mt-2 text-lg font-semibold text-ink">
                        {(opportunity.founderConfidence * 100).toFixed(0)}%
                      </div>
                      <div className="mt-1 text-xs text-terracotta">High-trust routing</div>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-white p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Contactability
                      </div>
                      <div className="mt-2 text-lg font-semibold text-ink">{opportunity.contactability}</div>
                      <div className="mt-1 text-xs text-terracotta">{opportunity.readiness}</div>
                    </div>
                    <div className="rounded-[1rem] border border-border/70 bg-white p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        Outreach angle
                      </div>
                      <div className="mt-2 text-sm leading-7 text-ink">{opportunity.outreachAngle}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[1rem] border border-border/70 bg-stone-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <BadgeCheck className="h-4 w-4 text-terracotta" aria-hidden="true" />
                        Why recommended
                      </div>
                      <div className="mt-3 space-y-2">
                        {opportunity.whyRecommended.map((reason) => (
                          <div key={reason} className="flex items-start gap-3 text-sm text-muted">
                            <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-terracotta" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1rem] border border-emerald-100 bg-emerald-50/70 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <MailCheck className="h-4 w-4 text-terracotta" aria-hidden="true" />
                        Readiness state
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted">
                        {opportunity.readiness === "SMTP-safe now"
                          ? "This route is strong enough for manual SMTP validation once a human approves the lead."
                          : opportunity.readiness === "Ready for approval"
                            ? "This opportunity is selective enough to move into operator review, but still preserves a manual gate."
                            : "The system is intentionally holding this one back until a human reviews the fit and contact path."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6 shadow-[0_24px_70px_rgba(26,26,26,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                  Cohort formation
                </div>
                <h2 className="mt-1 text-2xl font-semibold text-ink">Ready cohort preview</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-border/70 bg-white p-4">
                <div className="text-2xl font-semibold tracking-tighter text-ink">
                  {runState === "complete" ? scenario.cohort.approved : 0}
                </div>
                <div className="mt-1 text-sm text-muted">Approved opportunities</div>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-white p-4">
                <div className="text-2xl font-semibold tracking-tighter text-ink">
                  {runState === "complete" ? scenario.cohort.smtpSafe : 0}
                </div>
                <div className="mt-1 text-sm text-muted">SMTP-safe candidates</div>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-white p-4">
                <div className="text-2xl font-semibold tracking-tighter text-ink">
                  {runState === "complete" ? scenario.cohort.pendingManualReview : 0}
                </div>
                <div className="mt-1 text-sm text-muted">Manual-review holds</div>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-white p-4">
                <div className="text-2xl font-semibold tracking-tighter text-ink">
                  {runState === "complete" ? scenario.cohort.premiumDensity : "--"}
                </div>
                <div className="mt-1 text-sm text-muted">Premium density</div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-muted">{scenario.cohort.summary}</p>
          </div>

          <div className="surface-card-dark p-6 shadow-[0_28px_80px_rgba(12,12,12,0.32)]">
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                Why this preview is believable
              </div>
              <h2 className="text-2xl font-semibold text-white">The demo is curated, but the message is real.</h2>
              <div className="space-y-3">
                {scenario.whyItWins.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm leading-7 text-white/72">
                    <Sparkles className="mt-1 h-4 w-4 text-terracotta" aria-hidden="true" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[1rem] border border-white/10 bg-white/[0.05] p-4">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
                Request the real thing
              </div>
              <p className="mt-3 text-sm leading-7 text-white/70">
                If you want this run against your actual ICP, the next step is not a free trial.
                It&apos;s a guided outbound campaign review.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link href={ROUTES.APPLY}>
                    <span className="inline-flex items-center gap-2">
                      Apply for a custom campaign
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="w-full">
                  <Link href={ROUTES.ROI}>
                    Model revenue opportunity
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



