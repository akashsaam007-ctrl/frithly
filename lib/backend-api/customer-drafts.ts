import "server-only";

import type { BackendDraft } from "@/lib/backend-api/types";
import { backendApi } from "@/lib/backend-api/client";
import {
  listRecommendationsForCustomer,
  type WorkspaceRecommendation,
} from "@/lib/backend-api/customer-recommendations";
import { tenantScopeFromCustomerContext } from "@/lib/backend-api/tenant-scope";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

export type WorkspaceDraft = BackendDraft & {
  campaign_city?: string | null;
  campaign_id?: number | null;
  campaign_name?: string | null;
  campaign_status?: string | null;
  contactability?: string | null;
  domain?: string | null;
  founder_confidence?: number | null;
  recommendation_reason?: string | null;
  source_query?: string | null;
};

export type DraftGenerationType = "ai_refined" | "template_guided";

export type DraftSourceGroup = {
  campaignName: string;
  drafts: WorkspaceDraft[];
};

export type DraftWorkspaceStats = {
  activeDrafts: number;
  aiRefined: number;
  avgRecommendationScore: number;
  humanPolished: number;
  readyToSend: number;
};

export type DraftWorkspace = {
  groups: DraftSourceGroup[];
  items: WorkspaceDraft[];
  recommendations: WorkspaceRecommendation[];
  stats: DraftWorkspaceStats;
};

const DEFAULT_DRAFT_LIMIT = 100;

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export function isHumanPolishedDraft(draft: WorkspaceDraft) {
  return Boolean(draft.reviewer) || Boolean(draft.review_notes) || draft.status === "approved";
}

function isReadyToSend(draft: WorkspaceDraft) {
  const contactability = (draft.contactability ?? "").trim().toLowerCase();

  return (
    draft.status === "approved" &&
    Boolean(draft.founder_email) &&
    (contactability === "premium" || contactability === "strong")
  );
}

export function getDraftGenerationType(draft: WorkspaceDraft): DraftGenerationType {
  return draft.generated_with_ai ? "ai_refined" : "template_guided";
}

function compareByPriority(left: WorkspaceDraft, right: WorkspaceDraft) {
  const rightRecommendationScore = right.recommendation_score ?? 0;
  const leftRecommendationScore = left.recommendation_score ?? 0;

  if (rightRecommendationScore !== leftRecommendationScore) {
    return rightRecommendationScore - leftRecommendationScore;
  }

  const rightLeadScore = right.lead_score ?? 0;
  const leftLeadScore = left.lead_score ?? 0;

  if (rightLeadScore !== leftLeadScore) {
    return rightLeadScore - leftLeadScore;
  }

  if (Number(right.status === "approved") !== Number(left.status === "approved")) {
    return Number(right.status === "approved") - Number(left.status === "approved");
  }

  return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
}

function buildWorkspaceStats(items: WorkspaceDraft[]): DraftWorkspaceStats {
  return {
    activeDrafts: items.length,
    aiRefined: items.filter((item) => getDraftGenerationType(item) === "ai_refined").length,
    avgRecommendationScore: items.length
      ? roundToSingleDecimal(
          items.reduce((sum, item) => sum + (item.recommendation_score ?? 0), 0) / items.length,
        )
      : 0,
    humanPolished: items.filter((item) => isHumanPolishedDraft(item)).length,
    readyToSend: items.filter((item) => isReadyToSend(item)).length,
  };
}

export async function listDraftsForCustomer(
  customerName: string,
  limit = DEFAULT_DRAFT_LIMIT,
): Promise<DraftWorkspace> {
  const tenant = tenantScopeFromCustomerContext(await getCurrentCustomerContext());
  const workspace = await listRecommendationsForCustomer(customerName, 100);
  const recommendationByCompanyId = new Map(
    workspace.items.map((item) => [item.company_id, item] as const),
  );
  const draftsResponse = await backendApi.drafts.list({ limit, status: undefined, tenant });

  const items = draftsResponse.items
    .filter((draft) => recommendationByCompanyId.has(draft.company_id))
    .map((draft) => {
      const recommendation = recommendationByCompanyId.get(draft.company_id)!;

      return {
        ...draft,
        campaign_city: recommendation.campaign_city,
        campaign_id: recommendation.campaign_id,
        campaign_name: recommendation.campaign_name,
        campaign_status: recommendation.campaign_status,
        contactability: recommendation.contactability,
        domain: recommendation.domain,
        founder_confidence: recommendation.founder_confidence,
        recommendation_reason: recommendation.reason,
        source_query: recommendation.source_query,
      };
    })
    .sort(compareByPriority);

  const groupsMap = new Map<string, WorkspaceDraft[]>();

  for (const draft of items) {
    const campaignName = draft.campaign_name ?? "Unlinked recommendations";
    const bucket = groupsMap.get(campaignName) ?? [];
    bucket.push(draft);
    groupsMap.set(campaignName, bucket);
  }

  const groups = [...groupsMap.entries()]
    .map(([campaignName, drafts]) => ({
      campaignName,
      drafts: drafts.sort(compareByPriority),
    }))
    .sort((left, right) => {
      const leftTop = left.drafts[0];
      const rightTop = right.drafts[0];

      if (!leftTop || !rightTop) {
        return 0;
      }

      return compareByPriority(leftTop, rightTop);
    });

  return {
    groups,
    items,
    recommendations: workspace.items,
    stats: buildWorkspaceStats(items),
  };
}

export async function getDraftForCustomer(customerName: string, companyId: number) {
  const workspace = await listDraftsForCustomer(customerName, DEFAULT_DRAFT_LIMIT);
  return workspace.items.find((item) => item.company_id === companyId) ?? null;
}
