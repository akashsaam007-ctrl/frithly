import "server-only";

import {
  getRecommendationAssets,
  type WorkspaceRecommendation,
} from "@/lib/backend-api/customer-recommendations";
import { listCohortsForCustomer, type WorkspaceCohort } from "@/lib/backend-api/customer-cohorts";
import type { WorkspaceDraft } from "@/lib/backend-api/customer-drafts";
import type { BackendLeadDetailResponse } from "@/lib/backend-api/types";

export type ExportProfileId =
  | "crm_export"
  | "csv_full_intelligence"
  | "outbound_ready"
  | "reviewed_only"
  | "premium_only"
  | "smtp_safe";

export type ExportFormat = "csv" | "json";

export type ExportFieldKey =
  | "campaign_name"
  | "category"
  | "city"
  | "cohort_name"
  | "company_name"
  | "contactability"
  | "country"
  | "cta"
  | "domain"
  | "draft_status"
  | "first_line"
  | "founder_confidence"
  | "founder_email"
  | "founder_email_observed"
  | "founder_name"
  | "founder_role"
  | "full_body"
  | "lead_score"
  | "linkedin_url"
  | "outreach_angle"
  | "recommended_routing"
  | "recommendation_score"
  | "review_notes"
  | "review_status"
  | "score_band"
  | "services"
  | "short_pitch"
  | "smtp_state"
  | "source_query"
  | "subject_line"
  | "tech_stack"
  | "website"
  | "why_recommended";

export type ExportFilterState = {
  campaign: string;
  city: string;
  cohort: string;
  contactability: string;
  draftReadiness: "all" | "approved" | "missing" | "ready";
  format: ExportFormat;
  minFounderConfidence: number;
  minScore: number;
  profile: ExportProfileId;
  smtpState: string;
};

export type ExportCandidateRow = {
  campaignName: string | null;
  category: string | null;
  city: string | null;
  cohortName: string | null;
  companyId: number;
  companyName: string;
  contactability: string;
  country: string | null;
  cta: string | null;
  domain: string | null;
  draftReady: boolean;
  draftStatus: string | null;
  firstLine: string | null;
  founderConfidence: number | null;
  founderEmail: string | null;
  founderEmailObserved: boolean;
  founderName: string | null;
  founderRole: string | null;
  fullBody: string | null;
  genericEmailOnly: boolean;
  leadScore: number;
  linkedinUrl: string | null;
  outreachAngle: string | null;
  recommendationScore: number;
  recommendedRouting: string;
  reviewNotes: string | null;
  reviewStatus: string;
  scoreBand: string;
  services: string[];
  shortPitch: string | null;
  smtpSafe: boolean;
  smtpState: string;
  sourceQuery: string | null;
  subjectLine: string | null;
  techStack: string[];
  website: string | null;
  whyRecommended: string;
};

export type ExportFieldDefinition = {
  key: ExportFieldKey;
  label: string;
};

export type ExportProfile = {
  defaultFormat: ExportFormat;
  description: string;
  destination: string;
  fields: ExportFieldKey[];
  id: ExportProfileId;
  label: string;
  modeLabel: string;
};

export type ExportWarning = {
  count: number;
  description: string;
  tone: "negative" | "neutral" | "positive";
};

export type ExportPreviewRow = {
  companyId: number;
  companyName: string;
  founderName: string | null;
  founderEmail: string | null;
  leadScore: number;
  recommendationScore: number;
  smtpState: string;
  values: Record<string, string>;
};

export type ExportWorkspaceSummary = {
  approvedDraftCount: number;
  exportReadyCohorts: number;
  premiumLeadCount: number;
  recommendedRouting: string;
  smtpSafeCount: number;
};

export type ExportWorkspace = {
  activeProfile: ExportProfile;
  allRows: ExportCandidateRow[];
  campaigns: string[];
  cities: string[];
  cohorts: string[];
  fields: ExportFieldDefinition[];
  filters: ExportFilterState;
  previewRows: ExportPreviewRow[];
  profileCounts: Array<ExportProfile & { count: number; href: string }>;
  selectedRows: ExportCandidateRow[];
  smtpStates: string[];
  summary: ExportWorkspaceSummary;
  warnings: ExportWarning[];
};

export type CustomerExportPayload = {
  content: string;
  contentType: string;
  filename: string;
};

const DEFAULT_FILTERS: ExportFilterState = {
  campaign: "all",
  city: "all",
  cohort: "all",
  contactability: "all",
  draftReadiness: "all",
  format: "csv",
  minFounderConfidence: 0.7,
  minScore: 70,
  profile: "csv_full_intelligence",
  smtpState: "all",
};

const EXPORT_FIELDS: Record<ExportFieldKey, ExportFieldDefinition> = {
  campaign_name: { key: "campaign_name", label: "Campaign" },
  category: { key: "category", label: "Category" },
  city: { key: "city", label: "City" },
  cohort_name: { key: "cohort_name", label: "Cohort" },
  company_name: { key: "company_name", label: "Company" },
  contactability: { key: "contactability", label: "Contactability" },
  country: { key: "country", label: "Country" },
  cta: { key: "cta", label: "CTA" },
  domain: { key: "domain", label: "Domain" },
  draft_status: { key: "draft_status", label: "Draft status" },
  first_line: { key: "first_line", label: "Opening line" },
  founder_confidence: { key: "founder_confidence", label: "Founder confidence" },
  founder_email: { key: "founder_email", label: "Founder email" },
  founder_email_observed: { key: "founder_email_observed", label: "Observed founder email" },
  founder_name: { key: "founder_name", label: "Founder" },
  founder_role: { key: "founder_role", label: "Founder role" },
  full_body: { key: "full_body", label: "Draft body" },
  lead_score: { key: "lead_score", label: "Opportunity score" },
  linkedin_url: { key: "linkedin_url", label: "LinkedIn URL" },
  outreach_angle: { key: "outreach_angle", label: "Outreach angle" },
  recommended_routing: { key: "recommended_routing", label: "Recommended routing" },
  recommendation_score: { key: "recommendation_score", label: "Recommendation score" },
  review_notes: { key: "review_notes", label: "Review notes" },
  review_status: { key: "review_status", label: "Review status" },
  score_band: { key: "score_band", label: "Score band" },
  services: { key: "services", label: "Services" },
  short_pitch: { key: "short_pitch", label: "Short pitch" },
  smtp_state: { key: "smtp_state", label: "SMTP state" },
  source_query: { key: "source_query", label: "Source query" },
  subject_line: { key: "subject_line", label: "Subject line" },
  tech_stack: { key: "tech_stack", label: "Tech stack" },
  website: { key: "website", label: "Website" },
  why_recommended: { key: "why_recommended", label: "Why recommended" },
};

const EXPORT_PROFILES: ExportProfile[] = [
  {
    defaultFormat: "csv",
    description: "Balanced packaging for CRM or rep workflow imports with the core intelligence attached.",
    destination: "HubSpot / Salesforce / Apollo",
    fields: [
      "campaign_name",
      "company_name",
      "founder_name",
      "founder_role",
      "founder_email",
      "lead_score",
      "recommendation_score",
      "contactability",
      "linkedin_url",
      "why_recommended",
    ] as ExportFieldKey[],
    id: "crm_export",
    label: "CRM export",
    modeLabel: "CRM export",
  },
  {
    defaultFormat: "csv",
    description: "The richest export, keeping recommendation reasoning, routing, confidence, and draft context intact.",
    destination: "CSV full intelligence",
    fields: [
      "campaign_name",
      "cohort_name",
      "company_name",
      "website",
      "domain",
      "city",
      "country",
      "category",
      "founder_name",
      "founder_role",
      "founder_email",
      "founder_confidence",
      "founder_email_observed",
      "lead_score",
      "recommendation_score",
      "score_band",
      "contactability",
      "smtp_state",
      "draft_status",
      "why_recommended",
      "outreach_angle",
      "recommended_routing",
      "services",
      "tech_stack",
      "source_query",
      "review_status",
      "review_notes",
    ] as ExportFieldKey[],
    id: "csv_full_intelligence",
    label: "CSV full intelligence",
    modeLabel: "Full intelligence",
  },
  {
    defaultFormat: "csv",
    description: "Packaging for manual sending tools where draft content, approved routing, and founder email quality matter most.",
    destination: "Instantly / Smartlead / manual outbound",
    fields: [
      "campaign_name",
      "cohort_name",
      "company_name",
      "founder_name",
      "founder_email",
      "lead_score",
      "recommendation_score",
      "contactability",
      "smtp_state",
      "subject_line",
      "first_line",
      "short_pitch",
      "cta",
      "full_body",
      "why_recommended",
      "outreach_angle",
      "recommended_routing",
    ] as ExportFieldKey[],
    id: "outbound_ready",
    label: "Outbound-ready export",
    modeLabel: "Outbound-ready",
  },
  {
    defaultFormat: "csv",
    description: "Only opportunities a human has already approved, useful for trusted review queues or CRM sync.",
    destination: "Reviewed operator queue",
    fields: [
      "campaign_name",
      "company_name",
      "founder_name",
      "founder_email",
      "lead_score",
      "recommendation_score",
      "contactability",
      "smtp_state",
      "why_recommended",
      "review_status",
      "review_notes",
    ] as ExportFieldKey[],
    id: "reviewed_only",
    label: "Reviewed-only export",
    modeLabel: "Reviewed-only",
  },
  {
    defaultFormat: "csv",
    description: "Only premium opportunities, keeping the export tightly focused on the strongest score band.",
    destination: "Premium opportunity list",
    fields: [
      "campaign_name",
      "company_name",
      "founder_name",
      "founder_email",
      "lead_score",
      "recommendation_score",
      "founder_confidence",
      "contactability",
      "why_recommended",
      "recommended_routing",
    ] as ExportFieldKey[],
    id: "premium_only",
    label: "Premium-only export",
    modeLabel: "Premium-only",
  },
  {
    defaultFormat: "csv",
    description: "Only SMTP-verified opportunities for the safest operational handoff into outbound sending tools.",
    destination: "SMTP-safe deployment",
    fields: [
      "campaign_name",
      "cohort_name",
      "company_name",
      "founder_name",
      "founder_email",
      "lead_score",
      "recommendation_score",
      "contactability",
      "smtp_state",
      "why_recommended",
      "recommended_routing",
    ] as ExportFieldKey[],
    id: "smtp_safe",
    label: "SMTP-safe export",
    modeLabel: "SMTP-safe",
  },
];

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

function deriveCityFromQuery(query: string | null | undefined) {
  const trimmed = (query ?? "").trim();

  if (!trimmed) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  const marker = lower.lastIndexOf(" in ");

  if (marker >= 0) {
    return trimmed.slice(marker + 4).trim();
  }

  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1] ?? trimmed;
}

function formatConfidence(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "";
  }

  return roundToTwoDecimals(value).toFixed(2);
}

function formatList(values: string[]) {
  return values.join(", ");
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "export";
}

function isDraftReady(row: Pick<ExportCandidateRow, "contactability" | "draftStatus" | "founderEmail">) {
  const contactability = normalizeStatus(row.contactability);
  return (
    row.draftStatus === "approved" &&
    Boolean(row.founderEmail) &&
    (contactability === "premium" || contactability === "strong")
  );
}

function getExportProfiles() {
  return EXPORT_PROFILES;
}

function getProfile(profileId: ExportProfileId) {
  return getExportProfiles().find((profile) => profile.id === profileId) ?? EXPORT_PROFILES[1];
}

function parseNumber(value: string | null | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readQueryValue(
  source:
    | URLSearchParams
    | Record<string, string | string[] | undefined>,
  key: string,
) {
  if (source instanceof URLSearchParams) {
    return source.get(key);
  }

  const value = source[key];
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export function parseExportFilterState(
  source:
    | URLSearchParams
    | Record<string, string | string[] | undefined>,
): ExportFilterState {
  const profileValue = readQueryValue(source, "profile");
  const formatValue = readQueryValue(source, "format");
  const draftReadinessValue = readQueryValue(source, "draftReadiness");

  const parsed: ExportFilterState = {
    campaign: readQueryValue(source, "campaign") ?? DEFAULT_FILTERS.campaign,
    city: readQueryValue(source, "city") ?? DEFAULT_FILTERS.city,
    cohort: readQueryValue(source, "cohort") ?? DEFAULT_FILTERS.cohort,
    contactability: readQueryValue(source, "contactability") ?? DEFAULT_FILTERS.contactability,
    draftReadiness:
      draftReadinessValue === "approved" ||
      draftReadinessValue === "missing" ||
      draftReadinessValue === "ready"
        ? draftReadinessValue
        : DEFAULT_FILTERS.draftReadiness,
    format: formatValue === "json" ? "json" : DEFAULT_FILTERS.format,
    minFounderConfidence: parseNumber(
      readQueryValue(source, "minFounderConfidence"),
      DEFAULT_FILTERS.minFounderConfidence,
    ),
    minScore: parseNumber(readQueryValue(source, "minScore"), DEFAULT_FILTERS.minScore),
    profile:
      profileValue === "crm_export" ||
      profileValue === "csv_full_intelligence" ||
      profileValue === "outbound_ready" ||
      profileValue === "reviewed_only" ||
      profileValue === "premium_only" ||
      profileValue === "smtp_safe"
        ? profileValue
        : DEFAULT_FILTERS.profile,
    smtpState: readQueryValue(source, "smtpState") ?? DEFAULT_FILTERS.smtpState,
  };

  return parsed;
}

function profilePredicate(profile: ExportProfile, row: ExportCandidateRow) {
  switch (profile.id) {
    case "outbound_ready":
      return row.reviewStatus === "approved" && row.draftReady && Boolean(row.founderEmail);
    case "reviewed_only":
      return row.reviewStatus === "approved";
    case "premium_only":
      return row.leadScore >= 80 || row.recommendationScore >= 80;
    case "smtp_safe":
      return row.smtpSafe;
    default:
      return true;
  }
}

function applyGeneralFilters(rows: ExportCandidateRow[], filters: ExportFilterState) {
  return rows.filter((row) => {
    if (row.leadScore < filters.minScore) {
      return false;
    }

    if ((row.founderConfidence ?? 0) < filters.minFounderConfidence) {
      return false;
    }

    if (filters.contactability !== "all" && normalizeStatus(row.contactability) !== normalizeStatus(filters.contactability)) {
      return false;
    }

    if (filters.campaign !== "all" && row.campaignName !== filters.campaign) {
      return false;
    }

    if (filters.cohort !== "all" && row.cohortName !== filters.cohort) {
      return false;
    }

    if (filters.city !== "all" && row.city !== filters.city) {
      return false;
    }

    if (filters.smtpState !== "all" && normalizeStatus(row.smtpState) !== normalizeStatus(filters.smtpState)) {
      return false;
    }

    if (filters.draftReadiness === "approved" && row.draftStatus !== "approved") {
      return false;
    }

    if (filters.draftReadiness === "ready" && !row.draftReady) {
      return false;
    }

    if (filters.draftReadiness === "missing" && row.draftStatus) {
      return false;
    }

    return true;
  });
}

function getRouting(row: {
  approved: boolean;
  draftReady: boolean;
  smtpSafe: boolean;
}) {
  if (row.smtpSafe && row.draftReady) {
    return "Instantly / Smartlead";
  }

  if (row.draftReady) {
    return "Outbound-ready CSV";
  }

  if (row.approved) {
    return "CRM review queue";
  }

  return "Intelligence workspace";
}

function getFieldValue(row: ExportCandidateRow, key: ExportFieldKey) {
  switch (key) {
    case "campaign_name":
      return row.campaignName ?? "";
    case "category":
      return row.category ?? "";
    case "city":
      return row.city ?? "";
    case "cohort_name":
      return row.cohortName ?? "";
    case "contactability":
      return row.contactability;
    case "company_name":
      return row.companyName;
    case "country":
      return row.country ?? "";
    case "cta":
      return row.cta ?? "";
    case "domain":
      return row.domain ?? "";
    case "draft_status":
      return row.draftStatus ?? "";
    case "first_line":
      return row.firstLine ?? "";
    case "founder_confidence":
      return formatConfidence(row.founderConfidence);
    case "founder_email":
      return row.founderEmail ?? "";
    case "founder_email_observed":
      return row.founderEmailObserved ? "yes" : "no";
    case "founder_name":
      return row.founderName ?? "";
    case "founder_role":
      return row.founderRole ?? "";
    case "full_body":
      return row.fullBody ?? "";
    case "lead_score":
      return String(row.leadScore);
    case "linkedin_url":
      return row.linkedinUrl ?? "";
    case "outreach_angle":
      return row.outreachAngle ?? "";
    case "recommended_routing":
      return row.recommendedRouting;
    case "recommendation_score":
      return String(row.recommendationScore);
    case "review_notes":
      return row.reviewNotes ?? "";
    case "review_status":
      return row.reviewStatus;
    case "score_band":
      return row.scoreBand;
    case "services":
      return formatList(row.services);
    case "short_pitch":
      return row.shortPitch ?? "";
    case "smtp_state":
      return row.smtpState;
    case "source_query":
      return row.sourceQuery ?? "";
    case "subject_line":
      return row.subjectLine ?? "";
    case "tech_stack":
      return formatList(row.techStack);
    case "website":
      return row.website ?? "";
    case "why_recommended":
      return row.whyRecommended;
    default:
      return "";
  }
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

function serializeCsv(rows: Record<string, string>[], fieldDefinitions: ExportFieldDefinition[]) {
  const header = fieldDefinitions.map((field) => csvEscape(field.label)).join(",");
  const lines = rows.map((row) =>
    fieldDefinitions.map((field) => csvEscape(row[field.label] ?? "")).join(","),
  );
  return [header, ...lines].join("\n");
}

function buildWarnings(
  baseRows: ExportCandidateRow[],
  selectedRows: ExportCandidateRow[],
  profile: ExportProfile,
): ExportWarning[] {
  const warnings: ExportWarning[] = [];
  const excludedCount = Math.max(baseRows.length - selectedRows.length, 0);

  if (excludedCount > 0) {
    warnings.push({
      count: excludedCount,
      description: `${excludedCount} leads are excluded by the active ${profile.modeLabel.toLowerCase()} packaging rules.`,
      tone: "neutral",
    });
  }

  const failedSmtpCount = baseRows.filter((row) => row.smtpState === "failed").length;
  if (failedSmtpCount > 0) {
    warnings.push({
      count: failedSmtpCount,
      description: `${failedSmtpCount} leads have failed SMTP validation and should stay out of sending workflows.`,
      tone: "negative",
    });
  }

  const genericEmailCount = baseRows.filter((row) => row.genericEmailOnly).length;
  if (genericEmailCount > 0) {
    warnings.push({
      count: genericEmailCount,
      description: `${genericEmailCount} leads are still relying on generic inboxes, which weakens outbound readiness.`,
      tone: "neutral",
    });
  }

  const missingDraftCount = baseRows.filter((row) => !row.draftReady).length;
  if (profile.id === "outbound_ready" && missingDraftCount > 0) {
    warnings.push({
      count: missingDraftCount,
      description: `${missingDraftCount} leads were excluded because approved outbound-ready draft state is missing.`,
      tone: "neutral",
    });
  }

  return warnings.slice(0, 4);
}

function buildPreviewRows(rows: ExportCandidateRow[], fields: ExportFieldDefinition[]) {
  return rows.slice(0, 8).map((row) => {
    const values = Object.fromEntries(
      fields.map((field) => [field.label, getFieldValue(row, field.key)]),
    );

    return {
      companyId: row.companyId,
      companyName: row.companyName,
      founderEmail: row.founderEmail,
      founderName: row.founderName,
      leadScore: row.leadScore,
      recommendationScore: row.recommendationScore,
      smtpState: row.smtpState,
      values,
    };
  });
}

function buildProfileHref(filters: ExportFilterState, profileId: ExportProfileId) {
  const params = new URLSearchParams();
  params.set("profile", profileId);
  params.set("format", filters.format);
  params.set("minScore", String(filters.minScore));
  params.set("minFounderConfidence", String(filters.minFounderConfidence));
  params.set("contactability", filters.contactability);
  params.set("campaign", filters.campaign);
  params.set("cohort", filters.cohort);
  params.set("city", filters.city);
  params.set("smtpState", filters.smtpState);
  params.set("draftReadiness", filters.draftReadiness);
  return `/exports?${params.toString()}`;
}

function buildSummary(rows: ExportCandidateRow[], cohorts: WorkspaceCohort[]) {
  const routingCounts = new Map<string, number>();

  for (const row of rows) {
    routingCounts.set(row.recommendedRouting, (routingCounts.get(row.recommendedRouting) ?? 0) + 1);
  }

  const recommendedRouting =
    [...routingCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "Review queue";

  return {
    approvedDraftCount: rows.filter((row) => row.draftStatus === "approved").length,
    exportReadyCohorts: cohorts.filter((cohort) =>
      cohort.members.some((member) => rows.some((row) => row.companyId === member.company_id)),
    ).length,
    premiumLeadCount: rows.filter((row) => row.leadScore >= 80 || row.recommendationScore >= 80).length,
    recommendedRouting,
    smtpSafeCount: rows.filter((row) => row.smtpSafe).length,
  };
}

function mapExportableFields(profile: ExportProfile) {
  return profile.fields.map((fieldKey) => EXPORT_FIELDS[fieldKey]);
}

function buildExportRow(row: ExportCandidateRow, fields: ExportFieldDefinition[]) {
  return Object.fromEntries(fields.map((field) => [field.label, getFieldValue(row, field.key)]));
}

function buildCandidateRow(
  companyId: number,
  recommendation: WorkspaceRecommendation | null,
  draft: WorkspaceDraft | null,
  lead: BackendLeadDetailResponse,
  cohortName: string | null,
) {
  const founderEmail =
    lead.summary.review.selected_email ??
    lead.summary.founder_email ??
    draft?.founder_email ??
    recommendation?.founder_email ??
    null;
  const founderConfidence =
    lead.summary.review.confidence_override ??
    lead.summary.founder_email_confidence ??
    lead.summary.founder_confidence ??
    draft?.founder_confidence ??
    recommendation?.founder_confidence ??
    null;
  const contactability =
    lead.summary.contactability_tier ??
    draft?.contactability ??
    recommendation?.contactability ??
    "unknown";
  const draftStatus = draft?.status ?? null;
  const approved = lead.summary.review.status === "approved" || Boolean(recommendation?.approved);
  const smtpState = normalizeStatus(lead.summary.smtp_validation_status ?? recommendation?.smtp_state ?? "") || "unchecked";
  const candidate: ExportCandidateRow = {
    campaignName: recommendation?.campaign_name ?? draft?.campaign_name ?? lead.summary.outbound_campaign ?? null,
    category: lead.summary.category ?? null,
    city: recommendation?.city ?? deriveCityFromQuery(recommendation?.source_query ?? lead.summary.source_query),
    cohortName,
    companyId,
    companyName: lead.summary.company_name,
    contactability,
    country: lead.summary.country ?? null,
    cta: draft?.cta ?? null,
    domain: lead.summary.domain ?? null,
    draftReady: false,
    draftStatus,
    firstLine: draft?.first_line ?? null,
    founderConfidence,
    founderEmail,
    founderEmailObserved: Boolean(lead.summary.founder_email_observed),
    founderName: lead.summary.founder_name ?? recommendation?.founder_name ?? draft?.founder_name ?? null,
    founderRole: lead.summary.founder_role ?? recommendation?.founder_role ?? null,
    fullBody: draft?.full_body ?? null,
    genericEmailOnly: Boolean(lead.summary.generic_email_only),
    leadScore: lead.summary.score,
    linkedinUrl: lead.summary.linkedin_url ?? null,
    outreachAngle: lead.outreach_angle ?? null,
    recommendationScore: recommendation?.recommendation_score ?? draft?.recommendation_score ?? lead.summary.score,
    recommendedRouting: "",
    reviewNotes: draft?.review_notes ?? lead.summary.review.notes ?? null,
    reviewStatus: lead.summary.review.status,
    scoreBand: lead.summary.score_band ?? (lead.summary.score >= 80 ? "premium" : lead.summary.score >= 60 ? "usable" : "low_priority"),
    services: lead.services,
    shortPitch: draft?.short_pitch ?? null,
    smtpSafe: smtpState === "verified",
    smtpState,
    sourceQuery: lead.summary.source_query ?? recommendation?.source_query ?? draft?.source_query ?? null,
    subjectLine: draft?.subject_line ?? null,
    techStack: lead.tech_stack,
    website: lead.summary.website ?? null,
    whyRecommended:
      recommendation?.reason?.trim() ??
      draft?.recommendation_reason?.trim() ??
      lead.outreach_angle?.trim() ??
      lead.lead_score_reasons[0] ??
      "Selected because the intelligence layer saw a strong enough outbound opportunity.",
  };
  candidate.draftReady = isDraftReady(candidate);
  candidate.recommendedRouting = getRouting({
    approved,
    draftReady: candidate.draftReady,
    smtpSafe: candidate.smtpSafe,
  });
  return candidate;
}

async function buildRows(customerName: string) {
  const workspace = await listCohortsForCustomer(customerName);
  const recommendationByCompanyId = new Map(
    workspace.recommendations.map((item) => [item.company_id, item] as const),
  );
  const draftByCompanyId = new Map(
    workspace.drafts.map((item) => [item.company_id, item] as const),
  );
  const cohortByCompanyId = new Map<number, string>();

  for (const cohort of workspace.cohorts) {
    for (const member of cohort.members) {
      if (!cohortByCompanyId.has(member.company_id)) {
        cohortByCompanyId.set(member.company_id, cohort.name);
      }
    }
  }

  const companyIds = new Set<number>([
    ...workspace.recommendations.map((item) => item.company_id),
    ...workspace.drafts.map((item) => item.company_id),
    ...workspace.cohorts.flatMap((cohort) => cohort.members.map((member) => member.company_id)),
  ]);

  const assets = await Promise.all(
    [...companyIds].map(async (companyId) => {
      const payload = await getRecommendationAssets(companyId).catch(() => null);
      return [companyId, payload] as const;
    }),
  );

  const rows = assets
    .map(([companyId, payload]) => {
      if (!payload) {
        return null;
      }

      return buildCandidateRow(
        companyId,
        recommendationByCompanyId.get(companyId) ?? null,
        draftByCompanyId.get(companyId) ?? null,
        payload.lead,
        cohortByCompanyId.get(companyId) ?? null,
      );
    })
    .filter((row): row is ExportCandidateRow => Boolean(row))
    .sort((left, right) => {
      if (right.recommendationScore !== left.recommendationScore) {
        return right.recommendationScore - left.recommendationScore;
      }

      return right.leadScore - left.leadScore;
    });

  return {
    cohorts: workspace.cohorts,
    rows,
  };
}

export async function getExportWorkspaceForCustomer(
  customerName: string,
  filters: ExportFilterState,
): Promise<ExportWorkspace> {
  const { cohorts, rows } = await buildRows(customerName);
  const profile = getProfile(filters.profile);
  const baseRows = applyGeneralFilters(rows, filters);
  const selectedRows = baseRows.filter((row) => profilePredicate(profile, row));
  const fields = mapExportableFields(profile);
  const summary = buildSummary(selectedRows, cohorts);

  return {
    activeProfile: profile,
    allRows: rows,
    campaigns: [...new Set(rows.map((row) => row.campaignName).filter(Boolean))] as string[],
    cities: [...new Set(rows.map((row) => row.city).filter(Boolean))] as string[],
    cohorts: [...new Set(rows.map((row) => row.cohortName).filter(Boolean))] as string[],
    fields,
    filters,
    previewRows: buildPreviewRows(selectedRows, fields),
    profileCounts: getExportProfiles().map((candidateProfile) => ({
      ...candidateProfile,
      count: baseRows.filter((row) => profilePredicate(candidateProfile, row)).length,
      href: buildProfileHref(filters, candidateProfile.id),
    })),
    selectedRows,
    smtpStates: [...new Set(rows.map((row) => row.smtpState).filter(Boolean))].sort(),
    summary,
    warnings: buildWarnings(baseRows, selectedRows, profile),
  };
}

export async function buildCustomerExportPayload(
  customerName: string,
  filters: ExportFilterState,
): Promise<CustomerExportPayload> {
  const workspace = await getExportWorkspaceForCustomer(customerName, filters);
  const rows = workspace.selectedRows.map((row) => buildExportRow(row, workspace.fields));
  const timestamp = new Date().toISOString().slice(0, 10);
  const filenameBase = `${slugify(customerName)}-${workspace.activeProfile.id}-${timestamp}`;

  if (filters.format === "json") {
    return {
      content: JSON.stringify(rows, null, 2),
      contentType: "application/json; charset=utf-8",
      filename: `${filenameBase}.json`,
    };
  }

  return {
    content: serializeCsv(rows, workspace.fields),
    contentType: "text/csv; charset=utf-8",
    filename: `${filenameBase}.csv`,
  };
}
