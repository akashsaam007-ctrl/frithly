import "server-only";

import {
  buildBatchPreview,
  type ParsedBatchPreview,
  type ParsedLead,
} from "@/lib/admin/batch-builder";
import { backendApi } from "@/lib/backend-api/client";
import type {
  BackendCampaignCreateRequest,
  BackendCampaignDetail,
  BackendCampaignLead,
} from "@/lib/backend-api/types";
import type { Database } from "@/types/database.types";

type IcpRow = Database["public"]["Tables"]["icps"]["Row"];

export type BackendBatchGenerationDiagnostics = {
  crawledDomains: number;
  datasetCandidates: number;
  datasetSize: number;
  dedupedDomains: number;
  directorySeeds: number;
  excludedDuplicates: number;
  excludedExclusions: number;
  excludedNonCompany: number;
  excludedSize: number;
  finalLeads: number;
  localPipelineEnabled: boolean;
  localResults: number;
  minMatchPercent: number;
  pipelineCounts: Record<"company_search" | "directory" | "job_signal" | "local_search", number>;
  queriesExecuted: number;
  queriesGenerated: number;
  rawResults: number;
  scoredCandidates: number;
  belowThreshold: number;
};

type GenerateFromBackendCampaignParams = {
  customer: {
    email: string;
    id: string;
    name: string;
  };
  deliveryDate: string;
  excludedCompanyNames: string[];
  icp: IcpRow;
  minMatchPercent: number;
  queryBudget: number;
  requestedLeadCount: number;
};

type GenerateFromBackendCampaignResult = {
  campaign: BackendCampaignDetail;
  diagnostics: BackendBatchGenerationDiagnostics;
  leads: ParsedLead[];
  logs: string[];
  preview: ParsedBatchPreview;
};

const SERVICE_KEYWORDS = [
  "seo",
  "ppc",
  "web design",
  "branding",
  "digital marketing",
  "lead generation",
  "marketing agency",
  "marketing agencies",
  "webflow",
  "shopify",
  "wordpress",
];

const COUNTRY_CODE_MAP = new Map<string, string>([
  ["uk", "UK"],
  ["u.k.", "UK"],
  ["united kingdom", "UK"],
  ["great britain", "UK"],
  ["britain", "UK"],
  ["england", "UK"],
  ["us", "US"],
  ["u.s.", "US"],
  ["usa", "US"],
  ["united states", "US"],
  ["united states of america", "US"],
  ["canada", "CA"],
  ["ca", "CA"],
  ["uae", "UAE"],
  ["united arab emirates", "UAE"],
  ["dubai", "UAE"],
]);

const CITY_TO_COUNTRY_MAP = new Map<string, string>([
  ["london", "UK"],
  ["manchester", "UK"],
  ["birmingham", "UK"],
  ["leeds", "UK"],
  ["bristol", "UK"],
  ["liverpool", "UK"],
  ["glasgow", "UK"],
  ["edinburgh", "UK"],
  ["sheffield", "UK"],
  ["newcastle", "UK"],
  ["austin", "US"],
  ["dallas", "US"],
  ["houston", "US"],
  ["chicago", "US"],
  ["atlanta", "US"],
  ["seattle", "US"],
  ["denver", "US"],
  ["miami", "US"],
  ["phoenix", "US"],
  ["nashville", "US"],
  ["dubai", "UAE"],
]);

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeIdentity(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(
      /\b(agency|agencies|inc|llc|ltd|limited|corp|corporation|co|company|group|solutions|digital)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => normalizeWhitespace(value)).filter(Boolean))];
}

function splitCsv(values: string[] | null) {
  return uniqueStrings(values ?? []);
}

function parseEmployeeRange(icp: IcpRow) {
  const minimum = icp.company_size_min ?? null;
  const maximum = icp.company_size_max ?? null;

  if (minimum !== null && maximum !== null) {
    return `${minimum}-${maximum}`;
  }

  if (minimum !== null) {
    return `${minimum}+`;
  }

  if (maximum !== null) {
    return `1-${maximum}`;
  }

  return null;
}

function inferCountriesAndCities(geographies: string[]) {
  const countries = new Set<string>();
  const cities: string[] = [];

  for (const geography of geographies) {
    const normalized = geography.trim().toLowerCase();
    const countryCode = COUNTRY_CODE_MAP.get(normalized);

    if (countryCode) {
      countries.add(countryCode);
      if (!CITY_TO_COUNTRY_MAP.has(normalized)) {
        continue;
      }
    }

    if (normalized) {
      cities.push(geography.trim());
      const inferredCountry = CITY_TO_COUNTRY_MAP.get(normalized);

      if (inferredCountry) {
        countries.add(inferredCountry);
      }
    }
  }

  return {
    cities: uniqueStrings(cities),
    countries: [...countries],
  };
}

function inferServices(icp: IcpRow) {
  const haystack = normalizeWhitespace(
    [
      ...(icp.target_industries ?? []),
      ...(icp.signals ?? []),
      icp.product_description ?? "",
    ].join(" "),
  ).toLowerCase();

  return uniqueStrings(
    SERVICE_KEYWORDS.filter((keyword) => haystack.includes(keyword)),
  );
}

function inferTechnologies(icp: IcpRow) {
  const haystack = normalizeWhitespace(
    [
      ...(icp.target_industries ?? []),
      ...(icp.signals ?? []),
      icp.product_description ?? "",
    ].join(" "),
  ).toLowerCase();

  return uniqueStrings(
    ["wordpress", "shopify", "webflow", "react", "hubspot"].filter((keyword) =>
      haystack.includes(keyword),
    ),
  );
}

function buildCampaignRequest(
  customer: GenerateFromBackendCampaignParams["customer"],
  icp: IcpRow,
  deliveryDate: string,
  minMatchPercent: number,
  requestedLeadCount: number,
) {
  const industries = splitCsv(icp.target_industries);
  const geographies = splitCsv(icp.geographies);

  if (industries.length === 0) {
    throw new Error(
      "The current ICP needs at least one target industry before it can be sent to the lead intelligence backend.",
    );
  }

  const { countries, cities } = inferCountriesAndCities(geographies);
  const services = inferServices(icp);
  const technologies = inferTechnologies(icp);
  const exclusions = splitCsv(icp.exclusions).map((value) => value.toLowerCase());

  if (exclusions.includes("freelancer") && !exclusions.includes("freelancers")) {
    exclusions.push("freelancers");
  }

  const payload: BackendCampaignCreateRequest = {
    campaign_name: `${customer.name} ${industries[0]} ${deliveryDate}`,
    client_name: customer.name,
    industry: industries[0],
    countries,
    cities,
    employee_range: parseEmployeeRange(icp),
    minimum_score: Math.min(100, Math.max(40, minMatchPercent)),
    lead_goal: requestedLeadCount,
    required_contactability: "strong",
    founder_confidence_min: 0.7,
    services,
    technologies,
    exclude: exclusions,
  };

  const notes: string[] = [];

  if (cities.length === 0 && countries.length > 0) {
    notes.push(
      `No explicit cities were supplied, so the backend used adaptive city expansion within ${countries.join(", ")}.`,
    );
  }

  if (cities.length > 0) {
    notes.push(`Initial campaign cities: ${cities.join(", ")}.`);
  }

  if (countries.length === 0) {
    notes.push(
      "No supported country code was detected from the saved ICP geographies, so campaign expansion may be limited.",
    );
  }

  if (services.length === 0) {
    notes.push(
      "No service keywords were inferred from the ICP, so discovery relied primarily on the target industry label.",
    );
  }

  return { notes, payload };
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function buildDiagnostics(
  campaign: BackendCampaignDetail,
  finalLeadCount: number,
  minMatchPercent: number,
): BackendBatchGenerationDiagnostics {
  const queryPlan = campaign.query_plan ?? [];
  const progress = campaign.progress ?? {};
  const queriesExecuted = queryPlan.filter((item) => {
    const status = String(item.status ?? "");
    return status === "completed" || status === "failed";
  }).length;
  const rawResults = queryPlan.reduce((sum, item) => sum + toNumber(item.total_results), 0);
  const mappedCompanies = queryPlan.reduce((sum, item) => sum + toNumber(item.mapped_companies), 0);
  const duplicateSuppression = Math.max(rawResults - mappedCompanies, 0);

  return {
    crawledDomains: toNumber(progress.enrichment_progress) || mappedCompanies,
    datasetCandidates: 0,
    datasetSize: 0,
    dedupedDomains: toNumber(progress.generated_leads) || campaign.leads.length,
    directorySeeds: 0,
    excludedDuplicates: duplicateSuppression,
    excludedExclusions: 0,
    excludedNonCompany: 0,
    excludedSize: 0,
    finalLeads: finalLeadCount,
    localPipelineEnabled: true,
    localResults: rawResults,
    minMatchPercent,
    pipelineCounts: {
      company_search: 0,
      directory: 0,
      job_signal: 0,
      local_search: rawResults,
    },
    queriesExecuted,
    queriesGenerated: queryPlan.length,
    rawResults,
    scoredCandidates: campaign.leads.length,
    belowThreshold: Math.max(campaign.leads.length - finalLeadCount, 0),
  };
}

function deriveRole(lead: BackendCampaignLead) {
  if (lead.founder_name) {
    const reasons = Array.isArray(lead.lead_metadata?.reasons)
      ? lead.lead_metadata.reasons.map((value) => String(value).toLowerCase())
      : [];

    if (reasons.some((value) => value.includes("founder"))) {
      return "Founder";
    }

    return "Leadership";
  }

  return "Team contact";
}

function buildWhyNow(lead: BackendCampaignLead) {
  const reasons = Array.isArray(lead.lead_metadata?.reasons)
    ? lead.lead_metadata.reasons.map((value) => String(value))
    : [];
  const serviceHint = lead.services.length > 0 ? `Services detected: ${lead.services.slice(0, 3).join(", ")}.` : "";
  const sourceHint = lead.source_query ? `Surfaced from query "${lead.source_query}".` : "";

  return normalizeWhitespace(
    [
      `${lead.company_name} cleared the active outbound recommendation filters with a score of ${lead.recommendation_score ?? lead.lead_score}.`,
      reasons.length > 0 ? reasons.join(" ") : "This company matched the current campaign thresholds.",
      serviceHint,
      sourceHint,
    ].join(" "),
  );
}

function buildSignals(lead: BackendCampaignLead) {
  const reasons = Array.isArray(lead.lead_metadata?.reasons)
    ? lead.lead_metadata.reasons.map((value) => String(value))
    : [];
  const signals = [
    ...reasons,
    lead.source_query ? `Source query: ${lead.source_query}` : "",
    lead.contactability ? `Contactability: ${lead.contactability}` : "",
  ];

  return uniqueStrings(signals.filter(Boolean));
}

function buildOpeners(lead: BackendCampaignLead) {
  const companyName = lead.company_name;
  const firstName = normalizeWhitespace(lead.founder_name ?? `${companyName} team`).split(" ")[0] ?? companyName;
  const serviceText =
    lead.services.length > 0 ? lead.services.slice(0, 2).join(" and ") : "your positioning";
  const sourceText = lead.source_query ? `while researching ${lead.source_query}` : "during a recent ICP run";

  const openerA = `Came across ${companyName} ${sourceText} and noticed ${serviceText} stood out immediately.`;
  const openerB = `${firstName}, one reason ${companyName} was surfaced is that the lead-intelligence signals around your site and contact setup looked stronger than most companies in the same run.`;
  const openerC = `We are building a tighter outbound intelligence workflow for teams that want fewer, higher-confidence opportunities instead of broad lists.`;

  return {
    openerA,
    openerB,
    openerC,
    recommended: lead.status === "send_ready" ? "a" : lead.founder_email ? "b" : "c",
  } as const;
}

function mapLeadToParsedLead(lead: BackendCampaignLead): ParsedLead {
  const openers = buildOpeners(lead);
  const triggerSignals = buildSignals(lead);
  const fitScore = Math.min(
    10,
    Math.max(1, Math.round((lead.recommendation_score ?? lead.lead_score) / 10)),
  );

  return {
    company_location: lead.source_query ?? null,
    company_name: lead.company_name,
    company_size: null,
    current_title: deriveRole(lead),
    email: lead.founder_email ?? null,
    email_status: lead.founder_email ? "pattern_based" : null,
    fit_score: fitScore,
    full_name: lead.founder_name ?? `${lead.company_name} team`,
    linkedin_url: null,
    opener_a: openers.openerA,
    opener_a_signal: triggerSignals[0] ?? null,
    opener_b: openers.openerB,
    opener_b_signal: triggerSignals[1] ?? null,
    opener_c: openers.openerC,
    opener_c_signal: triggerSignals[2] ?? "Recommendation-driven match",
    recommended_opener: openers.recommended,
    recommended_reason:
      openers.recommended === "a"
        ? "A send-ready founder contact exists, so the strongest opener is the direct contextual one."
        : openers.recommended === "b"
          ? "A founder contact exists, but the safest first move is a softer intelligence-led angle."
          : "No strong founder contact was available, so the broad value angle is safer.",
    trigger_signals: triggerSignals,
    why_this_lead: buildWhyNow(lead),
  };
}

function buildLogs(
  campaign: BackendCampaignDetail,
  notes: string[],
  finalLeadCount: number,
  excludedDuplicates: number,
  queryBudget: number,
) {
  const progress = campaign.progress ?? {};
  const logs: string[] = [
    `Backend campaign ${campaign.campaign.id} started for ${campaign.campaign.industry ?? "the selected ICP"} with goal ${campaign.campaign.lead_goal}.`,
    `Legacy query budget was ${queryBudget}. The backend used adaptive expansion and ran ${campaign.query_plan.length} campaign queries.`,
    ...notes,
  ];

  for (const item of campaign.query_plan) {
    const query = String(item.query ?? "unknown query");
    const status = String(item.status ?? "pending");
    const mapped = toNumber(item.mapped_companies);
    const qualified = toNumber(item.qualified_leads);
    const total = toNumber(item.total_results);

    if (status === "completed") {
      logs.push(`${query} -> ${total} mapped raw results, ${mapped} companies linked, ${qualified} campaign-qualified leads.`);
      continue;
    }

    if (status === "failed") {
      logs.push(`${query} -> failed: ${String(item.error ?? "unknown error")}`);
    }
  }

  if (excludedDuplicates > 0) {
    logs.push(`Duplicate suppression or unmatched raw rows removed approximately ${excludedDuplicates} search results before final campaign lead mapping.`);
  }

  logs.push(
    `Campaign progress: generated ${toNumber(progress.generated_leads)} leads, qualified ${toNumber(progress.qualified_leads)}, send-ready ${toNumber(progress.send_ready_leads)}, failed enrichments ${toNumber(progress.failed)}.`,
  );

  if (campaign.campaign.status === "exhausted") {
    const exhaustedReason = String((progress.exhausted_reason as string | undefined) ?? "") || String((campaign as unknown as { exhausted_reason?: string }).exhausted_reason ?? "");
    logs.push(
      exhaustedReason ||
        "The backend exhausted its safe query expansion options before lowering quality thresholds.",
    );
  }

  logs.push(
    finalLeadCount > 0
      ? `Returned ${finalLeadCount} qualified leads to the product shell.`
      : "No leads cleared the active backend thresholds, so the response returned an honest shortage instead of weak leads.",
  );

  return logs;
}

export async function generateLeadBatchFromBackendCampaign(
  params: GenerateFromBackendCampaignParams,
): Promise<GenerateFromBackendCampaignResult> {
  const { notes, payload } = buildCampaignRequest(
    params.customer,
    params.icp,
    params.deliveryDate,
    params.minMatchPercent,
    params.requestedLeadCount,
  );
  const createdCampaign = await backendApi.campaigns.create(payload);
  const completedCampaign = await backendApi.campaigns.run(createdCampaign.campaign.id);
  const duplicateCompanyNames = new Set(
    params.excludedCompanyNames.map((value) => normalizeIdentity(value)).filter(Boolean),
  );
  const qualifiedLeads = completedCampaign.leads.filter((lead) => {
    if (!["qualified", "send_ready"].includes(String(lead.status))) {
      return false;
    }

    return !duplicateCompanyNames.has(normalizeIdentity(lead.company_name));
  });
  const mappedLeads = qualifiedLeads.map(mapLeadToParsedLead);
  const diagnostics = buildDiagnostics(
    completedCampaign,
    mappedLeads.length,
    params.minMatchPercent,
  );
  const logs = buildLogs(
    completedCampaign,
    notes,
    mappedLeads.length,
    diagnostics.excludedDuplicates,
    params.queryBudget,
  );

  if (qualifiedLeads.length > mappedLeads.length) {
    logs.push(
      `Filtered out ${qualifiedLeads.length - mappedLeads.length} campaign-qualified leads because those company names were already delivered to this customer.`,
    );
  }

  return {
    campaign: completedCampaign,
    diagnostics,
    leads: mappedLeads,
    logs,
    preview: buildBatchPreview(params.deliveryDate, mappedLeads),
  };
}
