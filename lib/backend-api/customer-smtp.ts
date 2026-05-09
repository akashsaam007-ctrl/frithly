import "server-only";

import { getRecommendationAssets, type WorkspaceRecommendation } from "@/lib/backend-api/customer-recommendations";
import { listCohortsForCustomer, type WorkspaceCohort } from "@/lib/backend-api/customer-cohorts";
import type { WorkspaceDraft } from "@/lib/backend-api/customer-drafts";
import type { BackendLeadDetailResponse } from "@/lib/backend-api/types";

export type SmtpGroupBy = "campaign" | "cohort" | "confidence" | "domain" | "risk";

export type SmtpQueueFilter =
  | "all"
  | "approved"
  | "blocked"
  | "catch_all"
  | "cautious"
  | "cooldown"
  | "pending";

export type SmtpRiskCategory =
  | "blocked"
  | "catch_all_risk"
  | "cautious"
  | "smtp_safe"
  | "strong_routing";

export type SmtpStageStatus = "cautious" | "failed" | "passed" | "pending" | "skipped";

export type SmtpValidationStage = {
  confidenceShift: string;
  detail: string;
  key: "catch_all" | "mx" | "smtp" | "syntax";
  label: string;
  status: SmtpStageStatus;
  timestamp: string | null;
};

export type SmtpWorkspaceLead = {
  approved: boolean;
  campaignName: string | null;
  city: string | null;
  cohortExists: boolean;
  cohortName: string | null;
  confidenceBucket: string;
  confidenceBucketLabel: string;
  contactability: string;
  cooldownUntil: string | null;
  companyId: number;
  companyName: string;
  domain: string | null;
  draftExists: boolean;
  draftReady: boolean;
  draftStatus: string | null;
  founderConfidence: number | null;
  founderEmail: string | null;
  founderEmailObserved: boolean;
  founderName: string | null;
  founderRole: string | null;
  freshnessLabel: string;
  genericEmailOnly: boolean;
  lastEnrichment: string | null;
  leadScore: number;
  policyReason: string | null;
  queueLabel: string;
  queueState: Exclude<SmtpQueueFilter, "all">;
  reason: string;
  recommendationExists: boolean;
  recommendationScore: number;
  recommendedRouting: string;
  reviewed: boolean;
  reviewStatus: string;
  riskCategory: SmtpRiskCategory;
  riskLabel: string;
  safetyExplanation: string;
  selectedEmailCatchAll: boolean | null;
  selectedEmailMxValid: boolean | null;
  selectedEmailSmtpValid: boolean | null;
  selectedEmailStatus: string | null;
  smtpCheckedAt: string | null;
  smtpProbeAttempted: boolean;
  smtpSafe: boolean;
  smtpState: string;
  sourceQuery: string | null;
  validationTimeline: SmtpValidationStage[];
};

export type SmtpQueueGroup = {
  count: number;
  description: string;
  key: string;
  label: string;
  leads: SmtpWorkspaceLead[];
};

export type SmtpWorkspaceFilters = {
  groupBy: SmtpGroupBy;
  queue: SmtpQueueFilter;
};

export type SmtpQueueCounts = Record<SmtpQueueFilter, number>;

export type SmtpWorkspaceStats = {
  catchAllDetections: number;
  cautiousLeads: number;
  checkedLeads: number;
  domainCooldowns: number;
  failedValidations: number;
  pendingApprovals: number;
  smtpSafeLeads: number;
  strongRouting: number;
  validationSuccessRate: number | null;
};

export type SmtpWorkspace = {
  filters: SmtpWorkspaceFilters;
  groups: SmtpQueueGroup[];
  items: SmtpWorkspaceLead[];
  queueCounts: SmtpQueueCounts;
  stats: SmtpWorkspaceStats;
};

const DEFAULT_FILTERS: SmtpWorkspaceFilters = {
  groupBy: "risk",
  queue: "all",
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function readQueryValue(
  source: URLSearchParams | Record<string, string | string[] | undefined>,
  key: string,
) {
  if (source instanceof URLSearchParams) {
    return source.get(key);
  }

  const value = source[key];
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function readString(record: UnknownRecord | null | undefined, key: string) {
  if (!record) {
    return null;
  }

  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readBoolean(record: UnknownRecord | null | undefined, key: string) {
  if (!record) {
    return null;
  }

  const value = record[key];
  return typeof value === "boolean" ? value : null;
}

function readNumber(record: UnknownRecord | null | undefined, key: string) {
  if (!record) {
    return null;
  }

  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readRecord(record: UnknownRecord | null | undefined, key: string) {
  if (!record) {
    return null;
  }

  const value = record[key];
  return isRecord(value) ? value : null;
}

function readArray(record: UnknownRecord | null | undefined, key: string) {
  if (!record) {
    return [];
  }

  const value = record[key];
  return Array.isArray(value) ? value : [];
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

function formatFreshnessLabel(lastEnrichment: string | null) {
  if (!lastEnrichment) {
    return "Freshness unknown";
  }

  const timestamp = new Date(lastEnrichment);
  if (Number.isNaN(timestamp.getTime())) {
    return "Freshness unknown";
  }

  const diffMs = Date.now() - timestamp.getTime();
  const diffDays = Math.max(Math.floor(diffMs / 86_400_000), 0);

  if (diffDays === 0) {
    return "Fresh now";
  }

  if (diffDays <= 7) {
    return `Fresh within ${diffDays}d`;
  }

  if (diffDays <= 21) {
    return `Warm (${diffDays}d)`;
  }

  return `Stale (${diffDays}d)`;
}

function getConfidenceBucket(value: number | null) {
  if (value !== null && value > 0.9) {
    return {
      key: "excellent",
      label: "Excellent confidence (>90%)",
    };
  }

  if (value !== null && value >= 0.75) {
    return {
      key: "strong",
      label: "Strong confidence (75-90%)",
    };
  }

  if (value !== null && value >= 0.5) {
    return {
      key: "moderate",
      label: "Moderate confidence (50-75%)",
    };
  }

  return {
    key: "weak",
    label: "Weak confidence (<50%)",
  };
}

function getQueueLabel(queueState: Exclude<SmtpQueueFilter, "all">) {
  switch (queueState) {
    case "approved":
      return "Approved validation";
    case "blocked":
      return "Rejected or unsafe";
    case "catch_all":
      return "Catch-all risk";
    case "cautious":
      return "Cautious routing";
    case "cooldown":
      return "Cooldown-blocked";
    default:
      return "Pending validation";
  }
}

function getRiskLabel(riskCategory: SmtpRiskCategory) {
  switch (riskCategory) {
    case "smtp_safe":
      return "SMTP-safe";
    case "strong_routing":
      return "Strong routing";
    case "catch_all_risk":
      return "Catch-all risk";
    case "blocked":
      return "Blocked";
    default:
      return "Cautious";
  }
}

function pickSelectedEmail(
  lead: BackendLeadDetailResponse,
  recommendation: WorkspaceRecommendation | null,
  draft: WorkspaceDraft | null,
) {
  return (
    lead.summary.review.selected_email ??
    lead.summary.founder_email ??
    draft?.founder_email ??
    recommendation?.founder_email ??
    null
  );
}

function findSelectedEmailRecord(
  lead: BackendLeadDetailResponse,
  selectedEmail: string | null,
) {
  const emails = lead.emails.filter(isRecord);

  if (selectedEmail) {
    const normalizedEmail = selectedEmail.trim().toLowerCase();
    const matched = emails.find((record) => readString(record, "email")?.toLowerCase() === normalizedEmail);

    if (matched) {
      return matched;
    }
  }

  return (
    emails.find((record) => {
      const metadata = readRecord(record, "email_metadata");
      return readBoolean(metadata, "observed") === true;
    }) ??
    emails[0] ??
    null
  );
}

function buildStoredStageMap(lead: BackendLeadDetailResponse) {
  const smtpValidation = isRecord(lead.smtp_validation) ? lead.smtp_validation : {};
  const stageMap = new Map<string, UnknownRecord>();

  for (const stage of readArray(smtpValidation, "stages")) {
    if (!isRecord(stage)) {
      continue;
    }

    const key = readString(stage, "stage");
    if (key) {
      stageMap.set(key, stage);
    }
  }

  return {
    smtpValidation,
    stageMap,
  };
}

function resolveStageStatus(stageKey: SmtpValidationStage["key"], result: string | null) {
  const normalized = normalizeStatus(result);

  if (stageKey === "syntax") {
    if (normalized === "valid") {
      return "passed" as const;
    }

    if (normalized === "invalid") {
      return "failed" as const;
    }
  }

  if (stageKey === "mx") {
    if (normalized === "valid") {
      return "passed" as const;
    }

    if (normalized === "missing") {
      return "failed" as const;
    }
  }

  if (stageKey === "catch_all") {
    if (normalized === "detected") {
      return "cautious" as const;
    }

    if (normalized === "not_detected") {
      return "passed" as const;
    }

    if (normalized === "disabled" || normalized === "skipped") {
      return "skipped" as const;
    }
  }

  if (stageKey === "smtp") {
    if (normalized === "accepted" || normalized === "verified") {
      return "passed" as const;
    }

    if (normalized === "rejected" || normalized === "invalid") {
      return "failed" as const;
    }

    if (normalized === "temporary_failure") {
      return "cautious" as const;
    }

    if (normalized === "disabled" || normalized === "skipped") {
      return "skipped" as const;
    }
  }

  return "pending" as const;
}

function resolveStageShift(stageKey: SmtpValidationStage["key"], status: SmtpStageStatus) {
  if (stageKey === "smtp") {
    if (status === "passed") {
      return "Confidence upgraded";
    }

    if (status === "failed") {
      return "Confidence downgraded";
    }

    if (status === "cautious") {
      return "Confidence held cautiously";
    }

    return "Awaiting live verification";
  }

  if (stageKey === "catch_all") {
    if (status === "cautious") {
      return "Confidence reduced";
    }

    if (status === "passed") {
      return "Confidence held";
    }

    return "Awaiting catch-all check";
  }

  if (status === "failed") {
    return "Confidence downgraded";
  }

  if (status === "passed") {
    return "No material shift";
  }

  return "Awaiting more signal";
}

function resolveStoredStageDetail(
  stageKey: SmtpValidationStage["key"],
  status: SmtpStageStatus,
  detail: UnknownRecord | null,
) {
  if (stageKey === "syntax") {
    return status === "passed"
      ? "The selected founder route is syntactically well-formed."
      : "The current route does not normalize into a valid email shape.";
  }

  if (stageKey === "mx") {
    if (status === "passed") {
      const mxHosts = readArray(detail, "mx_hosts")
        .map((item) => (typeof item === "string" ? item : ""))
        .filter(Boolean);
      return mxHosts.length > 0
        ? `Mail exchange records were found (${mxHosts.slice(0, 2).join(", ")}).`
        : "Mail exchange records were found for this domain.";
    }

    return "No mail exchange record was found for this route.";
  }

  if (stageKey === "catch_all") {
    if (status === "cautious") {
      return "Catch-all behavior was detected, so mailbox certainty is lower.";
    }

    if (status === "passed") {
      return "Catch-all behavior was not detected.";
    }

    if (status === "skipped") {
      return "Catch-all detection was intentionally deferred.";
    }

    return "Catch-all behavior has not been confirmed yet.";
  }

  const resultCode = readNumber(detail, "code");
  const resultMessage = readString(detail, "message");

  if (status === "passed") {
    return "The manual SMTP probe accepted the selected route.";
  }

  if (status === "failed") {
    return resultCode !== null && resultMessage
      ? `The manual SMTP probe rejected the route (${resultCode}: ${resultMessage}).`
      : "The manual SMTP probe rejected the selected route.";
  }

  if (status === "cautious") {
    return "The SMTP probe returned a temporary or inconclusive result.";
  }

  if (status === "skipped") {
    return "Live SMTP probing was intentionally skipped or disabled.";
  }

  return "Live SMTP confirmation has not been attempted yet.";
}

function buildFallbackStage(
  stageKey: SmtpValidationStage["key"],
  lead: BackendLeadDetailResponse,
  emailRecord: UnknownRecord | null,
  smtpState: string,
  timestamp: string | null,
) {
  const founderEmail = lead.summary.review.selected_email ?? lead.summary.founder_email ?? null;
  const mxValid = readBoolean(emailRecord, "mx_valid");
  const catchAll = readBoolean(emailRecord, "catch_all");
  const smtpValid = readBoolean(emailRecord, "smtp_valid");

  if (stageKey === "syntax") {
    const status = founderEmail ? "passed" : "pending";
    return {
      confidenceShift: resolveStageShift(stageKey, status),
      detail:
        status === "passed"
          ? "A specific founder or executive route has been selected."
          : "SMTP review cannot begin until a specific route is selected.",
      key: stageKey,
      label: "Syntax",
      status,
      timestamp,
    } satisfies SmtpValidationStage;
  }

  if (stageKey === "mx") {
    const status =
      mxValid === true ? "passed" : mxValid === false ? "failed" : founderEmail ? "pending" : "skipped";
    return {
      confidenceShift: resolveStageShift(stageKey, status),
      detail:
        status === "passed"
          ? "Mail exchange records are available for this route."
          : status === "failed"
            ? "Mail exchange records were not found for this route."
            : "MX checks have not been confirmed yet.",
      key: stageKey,
      label: "MX",
      status,
      timestamp,
    } satisfies SmtpValidationStage;
  }

  if (stageKey === "catch_all") {
    const status =
      catchAll === true
        ? "cautious"
        : catchAll === false
          ? "passed"
          : smtpState === "smtp_skipped_disabled"
            ? "skipped"
            : "pending";
    return {
      confidenceShift: resolveStageShift(stageKey, status),
      detail:
        status === "cautious"
          ? "Catch-all behavior is making mailbox validity uncertain."
          : status === "passed"
            ? "No catch-all risk is currently recorded."
            : status === "skipped"
              ? "Catch-all probing is currently disabled."
              : "Catch-all behavior has not been checked yet.",
      key: stageKey,
      label: "Catch-all",
      status,
      timestamp,
    } satisfies SmtpValidationStage;
  }

  const status =
    smtpState === "verified"
      ? "passed"
      : smtpState === "rejected" || smtpState === "invalid_syntax" || smtpState === "mx_missing"
        ? "failed"
        : smtpState === "temporary_failure" || smtpState === "mx_only"
          ? "cautious"
          : smtpState === "policy_blocked" || smtpState === "smtp_skipped" || smtpState === "smtp_skipped_disabled"
            ? "skipped"
            : smtpValid === true
              ? "passed"
              : smtpValid === false
                ? "failed"
                : "pending";

  return {
    confidenceShift: resolveStageShift(stageKey, status),
    detail:
      status === "passed"
        ? "The route is currently considered SMTP-safe."
        : status === "failed"
          ? "The route is currently considered unsafe for live outbound use."
          : status === "cautious"
            ? "The route is structurally strong, but final confirmation is still cautious."
            : status === "skipped"
              ? "Live SMTP probing has not been run because the safety policy did not allow it yet."
              : "The route has not gone through live SMTP review yet.",
    key: stageKey,
    label: "SMTP",
    status,
    timestamp,
  } satisfies SmtpValidationStage;
}

function buildValidationTimeline(
  lead: BackendLeadDetailResponse,
  emailRecord: UnknownRecord | null,
  smtpState: string,
) {
  const { smtpValidation, stageMap } = buildStoredStageMap(lead);
  const timestamp =
    lead.summary.smtp_checked_at ??
    readString(smtpValidation, "validated_at") ??
    null;

  return (["syntax", "mx", "catch_all", "smtp"] as const).map((stageKey) => {
    const stored = stageMap.get(stageKey);

    if (stored) {
      const status = resolveStageStatus(stageKey, readString(stored, "result"));
      return {
        confidenceShift: resolveStageShift(stageKey, status),
        detail: resolveStoredStageDetail(stageKey, status, readRecord(stored, "detail")),
        key: stageKey,
        label:
          stageKey === "catch_all"
            ? "Catch-all"
            : stageKey.toUpperCase(),
        status,
        timestamp,
      } satisfies SmtpValidationStage;
    }

    return buildFallbackStage(stageKey, lead, emailRecord, smtpState, timestamp);
  });
}

function buildRecommendedRouting({
  approved,
  draftReady,
  smtpSafe,
}: {
  approved: boolean;
  draftReady: boolean;
  smtpSafe: boolean;
}) {
  if (smtpSafe && draftReady) {
    return "Ready for sending tools";
  }

  if (approved && draftReady) {
    return "Manual SMTP review";
  }

  if (approved) {
    return "Operator review queue";
  }

  return "Recommendation review queue";
}

function deriveQueueAndRisk(
  lead: BackendLeadDetailResponse,
  founderConfidence: number | null,
  founderEmail: string | null,
  genericEmailOnly: boolean,
  selectedEmailCatchAll: boolean | null,
  smtpState: string,
  policyReason: string | null,
  cooldownUntil: string | null,
) {
  const reviewStatus = normalizeStatus(lead.summary.review.status);
  const contactability = normalizeStatus(lead.summary.contactability_tier);
  const smtpSafe = smtpState === "verified";
  const catchAllRisk = smtpState === "catch_all_risky" || selectedEmailCatchAll === true;
  const cooldownBlocked =
    smtpState === "policy_blocked" &&
    (Boolean(cooldownUntil) || normalizeStatus(policyReason).includes("cooldown"));
  const blocked =
    smtpState === "rejected" ||
    smtpState === "invalid_syntax" ||
    smtpState === "mx_missing" ||
    smtpState === "policy_blocked";
  const strongRouting =
    reviewStatus === "approved" &&
    Boolean(founderEmail) &&
    !genericEmailOnly &&
    founderConfidence !== null &&
    founderConfidence >= 0.75 &&
    (contactability === "premium" || contactability === "strong") &&
    !catchAllRisk &&
    !blocked;

  if (smtpSafe) {
    return {
      queueState: "approved" as const,
      riskCategory: "smtp_safe" as const,
    };
  }

  if (cooldownBlocked) {
    return {
      queueState: "cooldown" as const,
      riskCategory: "blocked" as const,
    };
  }

  if (catchAllRisk) {
    return {
      queueState: "catch_all" as const,
      riskCategory: "catch_all_risk" as const,
    };
  }

  if (blocked) {
    return {
      queueState: "blocked" as const,
      riskCategory: "blocked" as const,
    };
  }

  if (reviewStatus !== "approved" || strongRouting) {
    return {
      queueState: "pending" as const,
      riskCategory: strongRouting ? ("strong_routing" as const) : ("cautious" as const),
    };
  }

  if (smtpState === "temporary_failure" || smtpState === "mx_only" || smtpState === "smtp_skipped_disabled") {
    return {
      queueState: "cautious" as const,
      riskCategory: "cautious" as const,
    };
  }

  return {
    queueState: "cautious" as const,
    riskCategory: "cautious" as const,
  };
}

function buildSafetyExplanation({
  founderEmail,
  genericEmailOnly,
  policyReason,
  queueState,
  reviewStatus,
  riskCategory,
  smtpSafe,
}: {
  founderEmail: string | null;
  genericEmailOnly: boolean;
  policyReason: string | null;
  queueState: Exclude<SmtpQueueFilter, "all">;
  reviewStatus: string;
  riskCategory: SmtpRiskCategory;
  smtpSafe: boolean;
}) {
  if (smtpSafe) {
    return "Validation completed and the currently selected route is considered SMTP-safe for outbound use.";
  }

  if (queueState === "cooldown") {
    return "Validation was deferred because cooldown protection is active for this domain or route.";
  }

  if (queueState === "blocked") {
    return policyReason ?? "This route is currently blocked because policy or validation marked it unsafe.";
  }

  if (riskCategory === "catch_all_risk") {
    return "Catch-all behavior was detected, so the route stays out of safe send-ready groups until a human decides otherwise.";
  }

  if (reviewStatus !== "approved") {
    return "SMTP validation is intentionally skipped until a human approves the lead and confirms the selected route.";
  }

  if (!founderEmail) {
    return "A specific founder or executive route still needs to be selected before SMTP review can happen.";
  }

  if (genericEmailOnly) {
    return "Generic inboxes stay out of manual SMTP validation because they weaken trust and outbound specificity.";
  }

  if (riskCategory === "strong_routing") {
    return "This route has strong enough founder, contactability, and freshness signals to justify manual SMTP review.";
  }

  return "The route has some structural signal, but the system is still treating it cautiously until stronger verification exists.";
}

function buildGroupDescription(groupBy: SmtpGroupBy, label: string) {
  switch (groupBy) {
    case "campaign":
      return `${label} is the current campaign bucket for these validation candidates.`;
    case "cohort":
      return `${label} groups leads by deployment set so SMTP work stays operationally scoped.`;
    case "confidence":
      return `${label} keeps confidence-aware routing visible instead of dumping everything into one queue.`;
    case "domain":
      return `${label} shows how validation pressure is clustering around specific domains.`;
    default:
      return `${label} keeps the safety queue selective and easy to triage.`;
  }
}

function buildGroupKey(lead: SmtpWorkspaceLead, groupBy: SmtpGroupBy) {
  switch (groupBy) {
    case "campaign":
      return lead.campaignName ?? "Unlinked campaign";
    case "cohort":
      return lead.cohortName ?? "Unassigned to cohorts";
    case "confidence":
      return lead.confidenceBucketLabel;
    case "domain":
      return lead.domain ?? "Unknown domain";
    default:
      return lead.riskLabel;
  }
}

function getGroupOrderLabel(groupBy: SmtpGroupBy, key: string) {
  if (groupBy !== "risk") {
    return key;
  }

  const riskOrder: SmtpRiskCategory[] = [
    "strong_routing",
    "smtp_safe",
    "cautious",
    "catch_all_risk",
    "blocked",
  ];
  const matching = riskOrder.find((risk) => getRiskLabel(risk) === key);
  return matching ? `${riskOrder.indexOf(matching)}-${key}` : key;
}

function isDraftReady(draft: WorkspaceDraft | null, contactability: string, founderEmail: string | null) {
  const normalized = normalizeStatus(contactability);

  return (
    draft?.status === "approved" &&
    Boolean(founderEmail) &&
    (normalized === "premium" || normalized === "strong")
  );
}

function buildWorkspaceLead(
  companyId: number,
  lead: BackendLeadDetailResponse,
  recommendation: WorkspaceRecommendation | null,
  draft: WorkspaceDraft | null,
  cohortName: string | null,
) {
  const selectedEmail = pickSelectedEmail(lead, recommendation, draft);
  const selectedEmailRecord = findSelectedEmailRecord(lead, selectedEmail);
  const selectedEmailMetadata = readRecord(selectedEmailRecord, "email_metadata");
  const smtpValidation = isRecord(lead.smtp_validation) ? lead.smtp_validation : {};
  const policy = readRecord(smtpValidation, "policy");
  const policyReason = readString(policy, "reason");
  const smtpState =
    normalizeStatus(lead.summary.smtp_validation_status) ||
    normalizeStatus(readString(smtpValidation, "status")) ||
    "unchecked";
  const founderConfidence =
    lead.summary.review.confidence_override ??
    lead.summary.founder_email_confidence ??
    recommendation?.founder_confidence ??
    lead.summary.founder_confidence ??
    null;
  const founderEmail = selectedEmail;
  const selectedEmailCatchAll = readBoolean(selectedEmailRecord, "catch_all");
  const cooldownUntil = readString(policy, "cooldown_until");
  const genericEmailOnly = Boolean(lead.summary.generic_email_only);
  const { queueState, riskCategory } = deriveQueueAndRisk(
    lead,
    founderConfidence,
    founderEmail,
    genericEmailOnly,
    selectedEmailCatchAll,
    smtpState,
    policyReason,
    cooldownUntil,
  );
  const confidenceBucket = getConfidenceBucket(founderConfidence);
  const smtpSafe = smtpState === "verified";
  const draftReady = isDraftReady(draft, lead.summary.contactability_tier, founderEmail);

  return {
    approved: lead.summary.review.status === "approved",
    campaignName:
      recommendation?.campaign_name ??
      draft?.campaign_name ??
      lead.summary.outbound_campaign ??
      null,
    city: recommendation?.city ?? deriveCityFromQuery(recommendation?.source_query ?? lead.summary.source_query),
    cohortExists: Boolean(cohortName),
    cohortName,
    confidenceBucket: confidenceBucket.key,
    confidenceBucketLabel: confidenceBucket.label,
    contactability: lead.summary.contactability_tier,
    cooldownUntil,
    companyId,
    companyName: lead.summary.company_name,
    domain: lead.summary.domain ?? recommendation?.domain ?? null,
    draftExists: Boolean(draft),
    draftReady,
    draftStatus: draft?.status ?? null,
    founderConfidence,
    founderEmail,
    founderEmailObserved: Boolean(
      lead.summary.founder_email_observed ?? readBoolean(selectedEmailMetadata, "observed"),
    ),
    founderName: lead.summary.founder_name ?? recommendation?.founder_name ?? draft?.founder_name ?? null,
    founderRole: lead.summary.founder_role ?? recommendation?.founder_role ?? null,
    freshnessLabel: formatFreshnessLabel(recommendation?.last_enrichment ?? null),
    genericEmailOnly,
    lastEnrichment: recommendation?.last_enrichment ?? null,
    leadScore: lead.summary.score,
    policyReason,
    queueLabel: getQueueLabel(queueState),
    queueState,
    reason:
      recommendation?.reason?.trim() ??
      draft?.recommendation_reason?.trim() ??
      lead.outreach_angle?.trim() ??
      lead.lead_score_reasons[0] ??
      "The intelligence layer still sees enough signal here to justify operator review.",
    recommendationExists: Boolean(recommendation),
    recommendationScore: recommendation?.recommendation_score ?? draft?.recommendation_score ?? lead.summary.score,
    recommendedRouting: buildRecommendedRouting({
      approved: lead.summary.review.status === "approved",
      draftReady,
      smtpSafe,
    }),
    reviewed: lead.summary.review.status !== "pending",
    reviewStatus: lead.summary.review.status,
    riskCategory,
    riskLabel: getRiskLabel(riskCategory),
    safetyExplanation: buildSafetyExplanation({
      founderEmail,
      genericEmailOnly,
      policyReason,
      queueState,
      reviewStatus: lead.summary.review.status,
      riskCategory,
      smtpSafe,
    }),
    selectedEmailCatchAll,
    selectedEmailMxValid: readBoolean(selectedEmailRecord, "mx_valid"),
    selectedEmailSmtpValid: readBoolean(selectedEmailRecord, "smtp_valid"),
    selectedEmailStatus: readString(selectedEmailRecord, "status"),
    smtpCheckedAt:
      lead.summary.smtp_checked_at ??
      readString(smtpValidation, "validated_at") ??
      null,
    smtpProbeAttempted: Boolean(
      lead.summary.smtp_probe_attempted ?? readBoolean(smtpValidation, "probe_attempted"),
    ),
    smtpSafe,
    smtpState,
    sourceQuery: lead.summary.source_query ?? recommendation?.source_query ?? draft?.source_query ?? null,
    validationTimeline: buildValidationTimeline(lead, selectedEmailRecord, smtpState),
  } satisfies SmtpWorkspaceLead;
}

function compareQueuePriority(left: SmtpWorkspaceLead, right: SmtpWorkspaceLead) {
  const queueOrder: Record<SmtpWorkspaceLead["queueState"], number> = {
    approved: 0,
    pending: 1,
    cautious: 2,
    catch_all: 3,
    cooldown: 4,
    blocked: 5,
  };

  if (queueOrder[left.queueState] !== queueOrder[right.queueState]) {
    return queueOrder[left.queueState] - queueOrder[right.queueState];
  }

  if (right.recommendationScore !== left.recommendationScore) {
    return right.recommendationScore - left.recommendationScore;
  }

  if (right.leadScore !== left.leadScore) {
    return right.leadScore - left.leadScore;
  }

  return left.companyName.localeCompare(right.companyName);
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

  const items = assets
    .map(([companyId, payload]) => {
      if (!payload) {
        return null;
      }

      return buildWorkspaceLead(
        companyId,
        payload.lead,
        recommendationByCompanyId.get(companyId) ?? null,
        draftByCompanyId.get(companyId) ?? null,
        cohortByCompanyId.get(companyId) ?? null,
      );
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort(compareQueuePriority);

  return {
    cohorts: workspace.cohorts,
    items,
  };
}

function applyQueueFilter(items: SmtpWorkspaceLead[], queue: SmtpQueueFilter) {
  if (queue === "all") {
    return items;
  }

  return items.filter((item) => item.queueState === queue);
}

function buildQueueCounts(items: SmtpWorkspaceLead[]): SmtpQueueCounts {
  const counts: SmtpQueueCounts = {
    all: items.length,
    approved: 0,
    blocked: 0,
    catch_all: 0,
    cautious: 0,
    cooldown: 0,
    pending: 0,
  };

  for (const item of items) {
    counts[item.queueState] += 1;
  }

  return counts;
}

function buildGroups(items: SmtpWorkspaceLead[], groupBy: SmtpGroupBy) {
  const groups = new Map<string, SmtpWorkspaceLead[]>();

  for (const item of items) {
    const key = buildGroupKey(item, groupBy);
    const bucket = groups.get(key) ?? [];
    bucket.push(item);
    groups.set(key, bucket);
  }

  return [...groups.entries()]
    .map(([key, leads]) => ({
      count: leads.length,
      description: buildGroupDescription(groupBy, key),
      key,
      label: key,
      leads: leads.sort(compareQueuePriority),
    }))
    .sort((left, right) => {
      const orderLeft = getGroupOrderLabel(groupBy, left.label);
      const orderRight = getGroupOrderLabel(groupBy, right.label);

      if (orderLeft !== orderRight) {
        return orderLeft.localeCompare(orderRight);
      }

      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.label.localeCompare(right.label);
    });
}

function buildStats(items: SmtpWorkspaceLead[], cohorts: WorkspaceCohort[]) {
  const checkedLeads = items.filter((item) => item.smtpState !== "unchecked").length;
  const smtpSafeLeads = items.filter((item) => item.smtpSafe).length;
  const validationSuccessRate =
    checkedLeads > 0 ? roundToSingleDecimal(smtpSafeLeads / checkedLeads) : null;
  const domainCooldowns = new Set(
    items
      .filter((item) => item.queueState === "cooldown")
      .map((item) => item.domain)
      .filter(Boolean),
  ).size;
  void cohorts;

  return {
    catchAllDetections: items.filter((item) => item.riskCategory === "catch_all_risk").length,
    cautiousLeads: items.filter((item) => item.riskCategory === "cautious").length,
    checkedLeads,
    domainCooldowns,
    failedValidations: items.filter(
      (item) => item.queueState === "blocked" || item.queueState === "cooldown",
    ).length,
    pendingApprovals: items.filter((item) => item.reviewStatus !== "approved").length,
    smtpSafeLeads,
    strongRouting: items.filter((item) => item.riskCategory === "strong_routing").length,
    validationSuccessRate,
  } satisfies SmtpWorkspaceStats;
}

export function parseSmtpFilterState(
  source: URLSearchParams | Record<string, string | string[] | undefined>,
): SmtpWorkspaceFilters {
  const groupBy = readQueryValue(source, "groupBy");
  const queue = readQueryValue(source, "queue");

  return {
    groupBy:
      groupBy === "campaign" ||
      groupBy === "cohort" ||
      groupBy === "confidence" ||
      groupBy === "domain" ||
      groupBy === "risk"
        ? groupBy
        : DEFAULT_FILTERS.groupBy,
    queue:
      queue === "approved" ||
      queue === "blocked" ||
      queue === "catch_all" ||
      queue === "cautious" ||
      queue === "cooldown" ||
      queue === "pending"
        ? queue
        : DEFAULT_FILTERS.queue,
  };
}

export async function getSmtpWorkspaceForCustomer(
  customerName: string,
  filters: SmtpWorkspaceFilters,
): Promise<SmtpWorkspace> {
  const { cohorts, items } = await buildRows(customerName);
  const filteredItems = applyQueueFilter(items, filters.queue);

  return {
    filters,
    groups: buildGroups(filteredItems, filters.groupBy),
    items: filteredItems,
    queueCounts: buildQueueCounts(items),
    stats: buildStats(items, cohorts),
  };
}
