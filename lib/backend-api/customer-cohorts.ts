import "server-only";

import { backendApi } from "@/lib/backend-api/client";
import { listCampaignsForCustomer } from "@/lib/backend-api/customer-campaigns";
import { listDraftsForCustomer, type WorkspaceDraft } from "@/lib/backend-api/customer-drafts";
import {
  getRecommendationAssets,
  listRecommendationsForCustomer,
  type WorkspaceRecommendation,
} from "@/lib/backend-api/customer-recommendations";
import { tenantScopeFromCustomerContext } from "@/lib/backend-api/tenant-scope";
import type {
  BackendCampaignRead,
  BackendCohort,
  BackendCohortDetailResponse,
  BackendCohortMember,
  BackendLeadDetailResponse,
} from "@/lib/backend-api/types";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

export type CohortWorkspaceStats = {
  activeCohorts: number;
  meetingsBooked: number;
  positiveReplyRate: number;
  premiumOpportunities: number;
  readyToSend: number;
  smtpValidated: number;
};

export type CohortReadinessFunnel = {
  approved: number;
  cohortReady: number;
  discovered: number;
  qualified: number;
  recommended: number;
  smtpReady: number;
};

export type WorkspaceCohortMember = BackendCohortMember & {
  draft: WorkspaceDraft | null;
  lead: BackendLeadDetailResponse | null;
  recommendation: WorkspaceRecommendation | null;
  smtp_status: string | null;
};

export type WorkspaceCohort = BackendCohort & {
  members: WorkspaceCohortMember[];
  premium_density: number;
  readiness_percent: number;
  smtp_safe_count: number;
};

export type CohortWorkspace = {
  campaigns: BackendCampaignRead[];
  cohorts: WorkspaceCohort[];
  drafts: WorkspaceDraft[];
  funnel: CohortReadinessFunnel;
  recommendations: WorkspaceRecommendation[];
  stats: CohortWorkspaceStats;
};

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function deliveryStateRank(state: string | null | undefined) {
  switch (normalizeStatus(state)) {
    case "reviewing":
      return 0;
    case "approved":
      return 1;
    case "scheduled":
      return 2;
    case "delivered":
      return 3;
    case "preparing":
      return 4;
    default:
      return 5;
  }
}

function isReadyDraft(draft: WorkspaceDraft) {
  const contactability = normalizeStatus(draft.contactability);

  return (
    draft.status === "approved" &&
    Boolean(draft.founder_email) &&
    (contactability === "premium" || contactability === "strong")
  );
}

function buildVisibleCompanyIds(
  campaigns: BackendCampaignRead[],
  recommendations: WorkspaceRecommendation[],
  drafts: WorkspaceDraft[],
) {
  const ids = new Set<number>();

  for (const recommendation of recommendations) {
    ids.add(recommendation.company_id);
  }

  for (const draft of drafts) {
    ids.add(draft.company_id);
  }

  if (ids.size > 0) {
    return ids;
  }

  for (const campaign of campaigns) {
    if (campaign.send_ready_leads > 0 || campaign.premium_leads > 0 || campaign.generated_leads > 0) {
      // The page can still render empty cohorts if we only know campaigns, but this makes the intent explicit.
      continue;
    }
  }

  return ids;
}

async function buildCohortMembers(
  cohort: BackendCohortDetailResponse,
  visibleCompanyIds: Set<number>,
  recommendationByCompanyId: Map<number, WorkspaceRecommendation>,
  draftByCompanyId: Map<number, WorkspaceDraft>,
) {
  const scopedMembers = cohort.members.filter((member) => visibleCompanyIds.has(member.company_id));

  const enriched = await Promise.all(
    scopedMembers.map(async (member) => {
      const recommendation = recommendationByCompanyId.get(member.company_id) ?? null;
      const draft = draftByCompanyId.get(member.company_id) ?? null;
      const assets = await getRecommendationAssets(member.company_id).catch(() => null);

      return {
        ...member,
        draft,
        lead: assets?.lead ?? null,
        recommendation,
        smtp_status: assets?.lead?.summary.smtp_validation_status ?? null,
      };
    }),
  );

  return enriched;
}

function buildWorkspaceCohort(cohort: BackendCohort, members: WorkspaceCohortMember[]): WorkspaceCohort {
  const premiumCount = members.filter((member) => {
    const score = member.recommendation?.recommendation_score ?? member.lead?.summary.score ?? member.score;
    return score >= 80;
  }).length;
  const smtpSafeCount = members.filter((member) => normalizeStatus(member.smtp_status) === "verified").length;
  const readinessCount = members.filter((member) => member.draft && isReadyDraft(member.draft)).length;

  return {
    ...cohort,
    members,
    premium_density: members.length > 0 ? premiumCount / members.length : 0,
    readiness_percent: members.length > 0 ? readinessCount / members.length : 0,
    smtp_safe_count: smtpSafeCount,
  };
}

function buildWorkspaceStats(cohorts: WorkspaceCohort[]) {
  const activeCohorts = cohorts.length;
  const readyToSend = cohorts.reduce(
    (sum, cohort) => sum + cohort.members.filter((member) => member.draft && isReadyDraft(member.draft)).length,
    0,
  );
  const smtpValidated = cohorts.reduce((sum, cohort) => sum + cohort.smtp_safe_count, 0);
  const premiumOpportunities = cohorts.reduce(
    (sum, cohort) =>
      sum +
      cohort.members.filter((member) => {
        const score = member.recommendation?.recommendation_score ?? member.lead?.summary.score ?? member.score;
        return score >= 80;
      }).length,
    0,
  );
  const totalSent = cohorts.reduce((sum, cohort) => sum + cohort.sent_count, 0);
  const positiveReplies = cohorts.reduce((sum, cohort) => sum + cohort.positive_reply_count, 0);
  const meetingsBooked = cohorts.reduce((sum, cohort) => sum + cohort.meeting_count, 0);

  return {
    activeCohorts,
    meetingsBooked,
    positiveReplyRate: totalSent > 0 ? positiveReplies / totalSent : 0,
    premiumOpportunities,
    readyToSend,
    smtpValidated,
  };
}

function buildReadinessFunnel(
  campaigns: BackendCampaignRead[],
  recommendations: WorkspaceRecommendation[],
  drafts: WorkspaceDraft[],
  cohorts: WorkspaceCohort[],
) {
  const discovered = campaigns.reduce((sum, campaign) => sum + campaign.generated_leads, 0);
  const qualified = campaigns.reduce((sum, campaign) => sum + campaign.qualified_leads, 0);
  const recommended = recommendations.length;
  const approved = recommendations.filter((item) => item.approved).length;
  const smtpReady = recommendations.filter((item) => {
    const contactability = normalizeStatus(item.contactability);

    return item.approved && Boolean(item.founder_email) && (contactability === "premium" || contactability === "strong");
  }).length;
  const cohortReady =
    cohorts.length > 0
      ? cohorts.reduce((sum, cohort) => sum + cohort.members.length, 0)
      : drafts.filter((draft) => isReadyDraft(draft)).length;

  return {
    approved,
    cohortReady,
    discovered,
    qualified,
    recommended,
    smtpReady,
  };
}

export async function listCohortsForCustomer(customerName: string): Promise<CohortWorkspace> {
  const tenant = tenantScopeFromCustomerContext(await getCurrentCustomerContext());
  const [campaigns, recommendationsWorkspace, draftsWorkspace, cohortNames] = await Promise.all([
    listCampaignsForCustomer(customerName, 50),
    listRecommendationsForCustomer(customerName, 100),
    listDraftsForCustomer(customerName, 100),
    backendApi.cohorts.list(tenant),
  ]);

  const visibleCompanyIds = buildVisibleCompanyIds(
    campaigns,
    recommendationsWorkspace.items,
    draftsWorkspace.items,
  );
  const recommendationByCompanyId = new Map(
    recommendationsWorkspace.items.map((item) => [item.company_id, item] as const),
  );
  const draftByCompanyId = new Map(
    draftsWorkspace.items.map((item) => [item.company_id, item] as const),
  );

  const cohortDetails = await Promise.all(
    cohortNames.map(async (cohort) => {
      const detail = await backendApi.cohorts.get(cohort.name, tenant).catch(() => null);

      if (!detail) {
        return null;
      }

      const members = await buildCohortMembers(
        detail,
        visibleCompanyIds,
        recommendationByCompanyId,
        draftByCompanyId,
      );

      if (members.length === 0) {
        return null;
      }

      return buildWorkspaceCohort(detail.cohort, members);
    }),
  );

  const cohorts = cohortDetails
    .filter((cohort): cohort is WorkspaceCohort => Boolean(cohort))
    .sort((left, right) => {
      const stateDelta = deliveryStateRank(left.delivery_state) - deliveryStateRank(right.delivery_state);
      if (stateDelta !== 0) {
        return stateDelta;
      }

      const leftScheduled = new Date(left.scheduled_for ?? left.delivered_at ?? left.created_at ?? 0).getTime();
      const rightScheduled = new Date(right.scheduled_for ?? right.delivered_at ?? right.created_at ?? 0).getTime();
      if (rightScheduled !== leftScheduled) {
        return rightScheduled - leftScheduled;
      }

      if (right.meeting_count !== left.meeting_count) {
        return right.meeting_count - left.meeting_count;
      }

      if (right.positive_reply_count !== left.positive_reply_count) {
        return right.positive_reply_count - left.positive_reply_count;
      }

      if (right.total_members !== left.total_members) {
        return right.total_members - left.total_members;
      }

      return new Date(right.last_run_at ?? right.created_at ?? 0).getTime() -
        new Date(left.last_run_at ?? left.created_at ?? 0).getTime();
    });

  return {
    campaigns,
    cohorts,
    drafts: draftsWorkspace.items,
    funnel: buildReadinessFunnel(campaigns, recommendationsWorkspace.items, draftsWorkspace.items, cohorts),
    recommendations: recommendationsWorkspace.items,
    stats: buildWorkspaceStats(cohorts),
  };
}

export async function getCohortForCustomer(customerName: string, cohortName: string) {
  const workspace = await listCohortsForCustomer(customerName);
  return workspace.cohorts.find((cohort) => cohort.name === cohortName) ?? null;
}
