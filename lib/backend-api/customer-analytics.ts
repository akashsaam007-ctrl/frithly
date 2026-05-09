import "server-only";

import {
  listCohortsForCustomer,
  type CohortReadinessFunnel,
  type WorkspaceCohort,
  type WorkspaceCohortMember,
} from "@/lib/backend-api/customer-cohorts";

const SENT_LIKE_EVENTS = new Set([
  "sent",
  "opened",
  "replied",
  "positive_reply",
  "meeting_booked",
  "bounced",
  "spam_complaint",
  "ignored",
]);

const OUTCOME_WEIGHTS = {
  bounced: -6,
  ignored: -1,
  meeting_booked: 10,
  opened: 1,
  positive_reply: 6,
  replied: 3,
  spam_complaint: -12,
} as const;

const GENERIC_EMAIL_LOCALS = new Set([
  "admin",
  "contact",
  "enquiries",
  "enquiry",
  "hello",
  "hi",
  "info",
  "office",
  "sales",
  "support",
  "team",
]);

export type AnalyticsRow = {
  avgFounderConfidence: number;
  avgLeadScore: number;
  avgOutcomeScore: number;
  avgRecommendationScore: number;
  bounceRate: number;
  bouncedCount: number;
  label: string;
  meetingCount: number;
  meetingRate: number;
  openedCount: number;
  positiveReplyCount: number;
  positiveReplyRate: number;
  repliedCount: number;
  replyRate: number;
  sentMembers: number;
  spamComplaintCount: number;
  spamRate: number;
  totalMembers: number;
};

export type AnalyticsInsight = {
  description: string;
  tone: "negative" | "neutral" | "positive";
  title: string;
};

export type CustomerAnalyticsSummary = {
  activeCampaigns: number;
  activeCohorts: number;
  avgLeadScore: number;
  avgOutcomeScore: number;
  bounceRate: number;
  bouncedCount: number;
  meetingCount: number;
  meetingRate: number;
  positiveReplyCount: number;
  positiveReplyRate: number;
  premiumPerformanceRate: number;
  recommendationLift: number;
  repliedCount: number;
  replyRate: number;
  sentMembers: number;
  smtpSafeSuccessRate: number;
  spamComplaintCount: number;
  spamRate: number;
  topCampaignLabel: string | null;
  topCityLabel: string | null;
  topCohortLabel: string | null;
  totalMembers: number;
};

export type CustomerAnalyticsWorkspace = {
  campaignPerformance: AnalyticsRow[];
  cityPerformance: AnalyticsRow[];
  cohortPerformance: AnalyticsRow[];
  cohorts: WorkspaceCohort[];
  contactabilityPerformance: AnalyticsRow[];
  emailRoutePerformance: AnalyticsRow[];
  founderConfidenceInsights: AnalyticsRow[];
  funnel: CohortReadinessFunnel;
  learningFeed: AnalyticsInsight[];
  nichePerformance: AnalyticsRow[];
  recommendationAccuracy: AnalyticsRow[];
  smtpPerformance: AnalyticsRow[];
  summary: CustomerAnalyticsSummary;
  topNegativeProfiles: AnalyticsRow[];
  topPositiveProfiles: AnalyticsRow[];
};

type AnalyticsMemberSnapshot = {
  campaignName: string;
  city: string;
  cohortName: string;
  contactability: string;
  emailRoute: string;
  founderConfidence: number | null;
  founderConfidenceBucket: string;
  founderEmailObserved: boolean;
  genericEmailOnly: boolean;
  ignored: boolean;
  linkedinFound: boolean;
  meeting: boolean;
  niche: string;
  opened: boolean;
  outcomeScore: number;
  positiveReply: boolean;
  profiles: string[];
  recommendationBand: string;
  recommendationScore: number;
  replied: boolean;
  score: number;
  scoreBand: string;
  selectedEmail: string;
  sent: boolean;
  smtpState: string;
  spam: boolean;
  bounced: boolean;
};

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

function rate(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }

  return roundToTwoDecimals(numerator / denominator);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return roundToTwoDecimals(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function scoreBand(score: number) {
  if (score >= 80) {
    return "premium";
  }

  if (score >= 60) {
    return "usable";
  }

  return "low priority";
}

function recommendationBand(score: number) {
  if (score >= 90) {
    return "90+";
  }

  if (score >= 80) {
    return "80-89";
  }

  if (score >= 70) {
    return "70-79";
  }

  return "<70";
}

function founderConfidenceBucket(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "unknown";
  }

  if (value > 0.9) {
    return ">0.9";
  }

  if (value >= 0.75) {
    return "0.75-0.9";
  }

  if (value >= 0.5) {
    return "0.5-0.75";
  }

  return "<0.5";
}

function deriveCityFromQuery(query: string | null | undefined) {
  const trimmed = (query ?? "").trim();

  if (!trimmed) {
    return "Unknown city";
  }

  const lower = trimmed.toLowerCase();
  const inIndex = lower.lastIndexOf(" in ");

  if (inIndex >= 0) {
    return trimmed.slice(inIndex + 4).trim();
  }

  const parts = trimmed.split(/\s+/);
  return parts[parts.length - 1] ?? trimmed;
}

function isGenericEmail(email: string | null | undefined) {
  const trimmed = (email ?? "").trim().toLowerCase();

  if (!trimmed.includes("@")) {
    return false;
  }

  const [localPart] = trimmed.split("@");
  return GENERIC_EMAIL_LOCALS.has(localPart ?? "");
}

function getSelectedEmail(member: WorkspaceCohortMember) {
  return (
    member.selected_email ??
    member.lead?.summary.review.selected_email ??
    member.lead?.summary.founder_email ??
    ""
  ).trim();
}

function getCampaignName(member: WorkspaceCohortMember) {
  return (
    member.recommendation?.campaign_name ??
    member.draft?.campaign_name ??
    member.lead?.summary.outbound_campaign ??
    "Unlinked campaign"
  );
}

function getCity(member: WorkspaceCohortMember) {
  return (
    member.recommendation?.city ??
    deriveCityFromQuery(member.source_query ?? member.lead?.summary.source_query)
  );
}

function getNiche(member: WorkspaceCohortMember) {
  return (
    member.recommendation?.niche ??
    member.lead?.summary.category ??
    member.lead?.services[0] ??
    "Unknown vertical"
  );
}

function getContactability(member: WorkspaceCohortMember) {
  return (
    member.recommendation?.contactability ??
    member.draft?.contactability ??
    member.lead?.summary.contactability_tier ??
    member.contactability_tier ??
    "unknown"
  );
}

function getRecommendationScore(member: WorkspaceCohortMember) {
  return member.recommendation?.recommendation_score ?? member.draft?.recommendation_score ?? member.score;
}

function getLeadScore(member: WorkspaceCohortMember) {
  return member.lead?.summary.score ?? member.recommendation?.lead_score ?? member.score;
}

function getFounderConfidence(member: WorkspaceCohortMember) {
  const value =
    member.recommendation?.founder_confidence ??
    member.draft?.founder_confidence ??
    member.lead?.summary.founder_confidence ??
    null;

  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return value;
}

function getSignalState(member: WorkspaceCohortMember) {
  const history = Array.isArray(member.lead?.outbound?.history)
    ? member.lead?.outbound?.history
    : [];
  const events = new Set<string>();

  for (const item of history) {
    if (item && typeof item === "object" && "event_type" in item) {
      const eventType = String(item.event_type ?? "").trim();

      if (eventType) {
        events.add(eventType);
      }
    }
  }

  if (member.latest_signal) {
    events.add(member.latest_signal);
  }

  const memberStatus = normalizeStatus(member.status);
  const sent =
    [...events].some((eventType) => SENT_LIKE_EVENTS.has(eventType)) ||
    ["sent", "opened", "replied", "positive_reply", "meeting_booked", "bounced", "ignored", "at_risk"].includes(memberStatus);
  const opened =
    events.has("opened") ||
    events.has("replied") ||
    events.has("positive_reply") ||
    events.has("meeting_booked") ||
    ["opened", "replied", "positive_reply", "meeting_booked"].includes(memberStatus);
  const replied =
    events.has("replied") ||
    events.has("positive_reply") ||
    events.has("meeting_booked") ||
    ["replied", "positive_reply", "meeting_booked"].includes(memberStatus);
  const positiveReply =
    events.has("positive_reply") ||
    events.has("meeting_booked") ||
    ["positive_reply", "meeting_booked"].includes(memberStatus);
  const meeting = events.has("meeting_booked") || memberStatus === "meeting_booked";
  const bounced = events.has("bounced") || memberStatus === "bounced";
  const spam = events.has("spam_complaint") || memberStatus === "spam_complaint";
  const ignored = events.has("ignored") || memberStatus === "ignored";

  return {
    bounced,
    ignored,
    meeting,
    opened,
    positiveReply,
    replied,
    sent,
    spam,
  };
}

function getOutcomeScore(signalState: ReturnType<typeof getSignalState>) {
  let score = 0;

  if (signalState.meeting) {
    score += OUTCOME_WEIGHTS.meeting_booked;
  } else if (signalState.positiveReply) {
    score += OUTCOME_WEIGHTS.positive_reply;
  } else if (signalState.replied) {
    score += OUTCOME_WEIGHTS.replied;
  } else if (signalState.opened) {
    score += OUTCOME_WEIGHTS.opened;
  } else if (signalState.ignored) {
    score += OUTCOME_WEIGHTS.ignored;
  }

  if (signalState.bounced) {
    score += OUTCOME_WEIGHTS.bounced;
  }

  if (signalState.spam) {
    score += OUTCOME_WEIGHTS.spam_complaint;
  }

  return score;
}

function getEmailRoute(
  selectedEmail: string,
  smtpState: string,
  genericEmailOnly: boolean,
  founderEmailObserved: boolean,
) {
  if (!selectedEmail) {
    return "No email selected";
  }

  if (normalizeStatus(smtpState) === "verified") {
    return "SMTP-safe founder email";
  }

  if (genericEmailOnly || isGenericEmail(selectedEmail)) {
    return "Generic email only";
  }

  if (founderEmailObserved) {
    return "Observed founder email";
  }

  return "Founder email";
}

function buildProfiles(snapshot: AnalyticsMemberSnapshot) {
  const labels = [
    `Recommendation band: ${snapshot.recommendationBand}`,
    `Founder confidence: ${snapshot.founderConfidenceBucket}`,
    `Contactability: ${snapshot.contactability}`,
    `Email route: ${snapshot.emailRoute}`,
    `SMTP state: ${snapshot.smtpState}`,
    `City: ${snapshot.city}`,
    `Campaign: ${snapshot.campaignName}`,
  ];

  if (snapshot.linkedinFound && snapshot.selectedEmail) {
    labels.push("LinkedIn + founder email");
  }

  if (snapshot.founderEmailObserved) {
    labels.push("Observed founder email");
  }

  if (snapshot.genericEmailOnly) {
    labels.push("Generic email only");
  }

  return labels;
}

function buildSnapshot(cohort: WorkspaceCohort, member: WorkspaceCohortMember): AnalyticsMemberSnapshot {
  const signalState = getSignalState(member);
  const leadScore = getLeadScore(member);
  const founderConfidence = getFounderConfidence(member);
  const smtpState = normalizeStatus(member.smtp_status) || "unchecked";
  const selectedEmail = getSelectedEmail(member);
  const genericEmailOnly = Boolean(member.lead?.summary.generic_email_only) || isGenericEmail(selectedEmail);
  const founderEmailObserved = Boolean(member.lead?.summary.founder_email_observed);

  const snapshot: AnalyticsMemberSnapshot = {
    bounced: signalState.bounced,
    campaignName: getCampaignName(member),
    city: getCity(member),
    cohortName: cohort.name,
    contactability: normalizeStatus(getContactability(member)) || "unknown",
    emailRoute: getEmailRoute(selectedEmail, smtpState, genericEmailOnly, founderEmailObserved),
    founderConfidence,
    founderConfidenceBucket: founderConfidenceBucket(founderConfidence),
    founderEmailObserved,
    genericEmailOnly,
    ignored: signalState.ignored,
    linkedinFound: Boolean(member.lead?.summary.linkedin_url),
    meeting: signalState.meeting,
    niche: getNiche(member),
    opened: signalState.opened,
    outcomeScore: getOutcomeScore(signalState),
    positiveReply: signalState.positiveReply,
    profiles: [],
    recommendationBand: recommendationBand(getRecommendationScore(member)),
    recommendationScore: getRecommendationScore(member),
    replied: signalState.replied,
    score: leadScore,
    scoreBand: scoreBand(leadScore),
    selectedEmail,
    sent: signalState.sent,
    smtpState,
    spam: signalState.spam,
  };

  snapshot.profiles = buildProfiles(snapshot);
  return snapshot;
}

function buildRow(label: string, items: AnalyticsMemberSnapshot[]): AnalyticsRow {
  const sentMembers = items.filter((item) => item.sent).length;
  const openedCount = items.filter((item) => item.opened).length;
  const repliedCount = items.filter((item) => item.replied).length;
  const positiveReplyCount = items.filter((item) => item.positiveReply).length;
  const meetingCount = items.filter((item) => item.meeting).length;
  const bouncedCount = items.filter((item) => item.bounced).length;
  const spamComplaintCount = items.filter((item) => item.spam).length;

  return {
    avgFounderConfidence: average(
      items
        .map((item) => item.founderConfidence)
        .filter((value): value is number => value !== null && Number.isFinite(value)),
    ),
    avgLeadScore: average(items.map((item) => item.score)),
    avgOutcomeScore: average(items.map((item) => item.outcomeScore)),
    avgRecommendationScore: average(items.map((item) => item.recommendationScore)),
    bounceRate: rate(bouncedCount, sentMembers),
    bouncedCount,
    label,
    meetingCount,
    meetingRate: rate(meetingCount, sentMembers),
    openedCount,
    positiveReplyCount,
    positiveReplyRate: rate(positiveReplyCount, sentMembers),
    repliedCount,
    replyRate: rate(repliedCount, sentMembers),
    sentMembers,
    spamComplaintCount,
    spamRate: rate(spamComplaintCount, sentMembers),
    totalMembers: items.length,
  };
}

function buildGroupedRows(
  items: AnalyticsMemberSnapshot[],
  labelFor: (item: AnalyticsMemberSnapshot) => string,
  sorter?: (left: AnalyticsRow, right: AnalyticsRow) => number,
) {
  const groups = new Map<string, AnalyticsMemberSnapshot[]>();

  for (const item of items) {
    const label = labelFor(item).trim() || "Unknown";
    const bucket = groups.get(label) ?? [];
    bucket.push(item);
    groups.set(label, bucket);
  }

  const rows = [...groups.entries()].map(([label, grouped]) => buildRow(label, grouped));

  if (sorter) {
    rows.sort(sorter);
    return rows;
  }

  rows.sort((left, right) => {
    if (right.positiveReplyRate !== left.positiveReplyRate) {
      return right.positiveReplyRate - left.positiveReplyRate;
    }

    if (right.meetingRate !== left.meetingRate) {
      return right.meetingRate - left.meetingRate;
    }

    return right.totalMembers - left.totalMembers;
  });

  return rows;
}

function buildProfileRows(items: AnalyticsMemberSnapshot[], positive: boolean) {
  const groups = new Map<string, AnalyticsMemberSnapshot[]>();

  for (const item of items) {
    for (const profile of item.profiles) {
      const bucket = groups.get(profile) ?? [];
      bucket.push(item);
      groups.set(profile, bucket);
    }
  }

  const rows = [...groups.entries()]
    .map(([label, grouped]) => buildRow(label, grouped))
    .filter((row) => row.totalMembers > 0)
    .sort((left, right) => {
      if (positive) {
        if (right.avgOutcomeScore !== left.avgOutcomeScore) {
          return right.avgOutcomeScore - left.avgOutcomeScore;
        }

        if (right.positiveReplyRate !== left.positiveReplyRate) {
          return right.positiveReplyRate - left.positiveReplyRate;
        }

        return right.totalMembers - left.totalMembers;
      }

      if (left.avgOutcomeScore !== right.avgOutcomeScore) {
        return left.avgOutcomeScore - right.avgOutcomeScore;
      }

      if (right.bounceRate !== left.bounceRate) {
        return right.bounceRate - left.bounceRate;
      }

      return right.totalMembers - left.totalMembers;
    });

  return rows.slice(0, 5);
}

function buildLearningFeed(
  baseline: AnalyticsRow,
  founderConfidenceRows: AnalyticsRow[],
  contactabilityRows: AnalyticsRow[],
  emailRouteRows: AnalyticsRow[],
  smtpRows: AnalyticsRow[],
  cityRows: AnalyticsRow[],
  campaignRows: AnalyticsRow[],
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];
  const highFounderConfidence = founderConfidenceRows.find((row) => row.label === ">0.9");
  const premiumContactability = contactabilityRows.find((row) => row.label === "premium");
  const smtpVerified = smtpRows.find((row) => row.label === "verified");
  const genericOnly = emailRouteRows.find((row) => row.label === "Generic email only");
  const topCity = cityRows[0];
  const topCampaign = campaignRows[0];

  if (baseline.sentMembers === 0) {
    return [
      {
        description:
          "Outcome intelligence appears here once sends, replies, bounces, and meetings are recorded against cohort members.",
        title: "No live outbound outcomes yet",
        tone: "neutral",
      },
    ];
  }

  if (highFounderConfidence && highFounderConfidence.sentMembers > 0) {
    const delta = roundToTwoDecimals(highFounderConfidence.positiveReplyRate - baseline.positiveReplyRate);
    insights.push({
      description:
        delta >= 0
          ? `Founder confidence above 0.9 is outperforming the workspace baseline by ${(delta * 100).toFixed(0)} percentage points.`
          : `Founder confidence above 0.9 is under baseline by ${(Math.abs(delta) * 100).toFixed(0)} percentage points right now.`,
      title: "Founder confidence is shaping outcomes",
      tone: delta >= 0 ? "positive" : "negative",
    });
  }

  if (premiumContactability && premiumContactability.sentMembers > 0) {
    const delta = roundToTwoDecimals(premiumContactability.meetingRate - baseline.meetingRate);
    insights.push({
      description:
        delta >= 0
          ? `Premium contactability is beating the overall meeting rate by ${(delta * 100).toFixed(0)} percentage points.`
          : `Premium contactability is not yet beating the overall meeting rate in this sample.`,
      title: "Contactability quality matters",
      tone: delta >= 0 ? "positive" : "neutral",
    });
  }

  if (smtpVerified && smtpVerified.sentMembers > 0) {
    const delta = roundToTwoDecimals(smtpVerified.positiveReplyRate - baseline.positiveReplyRate);
    insights.push({
      description:
        delta >= 0
          ? `SMTP-safe members are returning ${(delta * 100).toFixed(0)} percentage points more positive replies than baseline.`
          : `SMTP-safe members are not yet outperforming baseline on positive replies.`,
      title: "SMTP-safe success is visible",
      tone: delta >= 0 ? "positive" : "neutral",
    });
  }

  if (topCity && topCity.sentMembers > 0) {
    insights.push({
      description: `${topCity.label} is currently the strongest city pocket with ${topCity.positiveReplyCount} positive replies and a ${Math.round(topCity.positiveReplyRate * 100)}% positive reply rate.`,
      title: "A city-level pattern is emerging",
      tone: "positive",
    });
  }

  if (topCampaign && topCampaign.sentMembers > 0) {
    insights.push({
      description: `${topCampaign.label} is the strongest campaign segment right now by outcome quality and response density.`,
      title: "One campaign is leading the pack",
      tone: "positive",
    });
  }

  if (genericOnly && genericOnly.sentMembers > 0 && genericOnly.bounceRate > baseline.bounceRate) {
    insights.push({
      description: `Generic-email routes are bouncing ${(Math.round((genericOnly.bounceRate - baseline.bounceRate) * 100)).toFixed(0)} percentage points more often than baseline.`,
      title: "Generic routes are underperforming",
      tone: "negative",
    });
  }

  return insights.slice(0, 5);
}

export async function getAnalyticsForCustomer(customerName: string): Promise<CustomerAnalyticsWorkspace> {
  const workspace = await listCohortsForCustomer(customerName);
  const snapshots = workspace.cohorts.flatMap((cohort) =>
    cohort.members.map((member) => buildSnapshot(cohort, member)),
  );
  const summaryRow = buildRow("All outcomes", snapshots);
  const cohortPerformance = buildGroupedRows(
    snapshots,
    (item) => item.cohortName,
  );
  const campaignPerformance = buildGroupedRows(
    snapshots,
    (item) => item.campaignName,
  );
  const cityPerformance = buildGroupedRows(
    snapshots,
    (item) => item.city,
  );
  const nichePerformance = buildGroupedRows(
    snapshots.filter((item) => item.niche.trim().length > 0),
    (item) => item.niche,
  );
  const founderConfidenceInsights = buildGroupedRows(
    snapshots,
    (item) => item.founderConfidenceBucket,
    (left, right) => {
      const order = {
        "<0.5": 3,
        "0.5-0.75": 2,
        "0.75-0.9": 1,
        ">0.9": 0,
        unknown: 4,
      } as const;

      return (order[left.label as keyof typeof order] ?? 99) - (order[right.label as keyof typeof order] ?? 99);
    },
  );
  const contactabilityPerformance = buildGroupedRows(
    snapshots,
    (item) => item.contactability,
  );
  const emailRoutePerformance = buildGroupedRows(
    snapshots,
    (item) => item.emailRoute,
  );
  const recommendationAccuracy = buildGroupedRows(
    snapshots,
    (item) => item.recommendationBand,
    (left, right) => {
      const order = { "<70": 3, "70-79": 2, "80-89": 1, "90+": 0 } as const;
      return (order[left.label as keyof typeof order] ?? 99) - (order[right.label as keyof typeof order] ?? 99);
    },
  );
  const smtpPerformance = buildGroupedRows(
    snapshots,
    (item) => item.smtpState,
  );
  const topPositiveProfiles = buildProfileRows(snapshots, true);
  const topNegativeProfiles = buildProfileRows(snapshots, false);
  const premiumMembers = snapshots.filter((item) => item.score >= 80);
  const premiumRow = buildRow("Premium", premiumMembers);
  const highRecommendationMembers = snapshots.filter((item) => item.recommendationScore >= 80);
  const highRecommendationRow = buildRow("High recommendation", highRecommendationMembers);
  const smtpVerifiedMembers = snapshots.filter((item) => item.smtpState === "verified");
  const smtpVerifiedRow = buildRow("SMTP verified", smtpVerifiedMembers);
  const learningFeed = buildLearningFeed(
    summaryRow,
    founderConfidenceInsights,
    contactabilityPerformance,
    emailRoutePerformance,
    smtpPerformance,
    cityPerformance,
    campaignPerformance,
  );
  const summary: CustomerAnalyticsSummary = {
    activeCampaigns: new Set(snapshots.map((item) => item.campaignName)).size,
    activeCohorts: workspace.cohorts.length,
    avgLeadScore: summaryRow.avgLeadScore,
    avgOutcomeScore: summaryRow.avgOutcomeScore,
    bounceRate: summaryRow.bounceRate,
    bouncedCount: summaryRow.bouncedCount,
    meetingCount: summaryRow.meetingCount,
    meetingRate: summaryRow.meetingRate,
    positiveReplyCount: summaryRow.positiveReplyCount,
    positiveReplyRate: summaryRow.positiveReplyRate,
    premiumPerformanceRate: premiumRow.positiveReplyRate,
    recommendationLift:
      summaryRow.positiveReplyRate > 0
        ? roundToTwoDecimals(highRecommendationRow.positiveReplyRate - summaryRow.positiveReplyRate)
        : highRecommendationRow.positiveReplyRate,
    repliedCount: summaryRow.repliedCount,
    replyRate: summaryRow.replyRate,
    sentMembers: summaryRow.sentMembers,
    smtpSafeSuccessRate: smtpVerifiedRow.positiveReplyRate,
    spamComplaintCount: summaryRow.spamComplaintCount,
    spamRate: summaryRow.spamRate,
    topCampaignLabel: campaignPerformance[0]?.label ?? null,
    topCityLabel: cityPerformance[0]?.label ?? null,
    topCohortLabel: cohortPerformance[0]?.label ?? null,
    totalMembers: summaryRow.totalMembers,
  };

  return {
    campaignPerformance,
    cityPerformance,
    cohortPerformance,
    cohorts: workspace.cohorts,
    contactabilityPerformance,
    emailRoutePerformance,
    founderConfidenceInsights,
    funnel: workspace.funnel,
    learningFeed,
    nichePerformance,
    recommendationAccuracy,
    smtpPerformance,
    summary,
    topNegativeProfiles,
    topPositiveProfiles,
  };
}
