import "server-only";

import type {
  BackendCampaignDetail,
  BackendCampaignRead,
  BackendDraft,
  BackendLeadDetailResponse,
  BackendRecommendation,
} from "@/lib/backend-api/types";
import { BackendApiError, backendApi } from "@/lib/backend-api/client";
import { listCampaignsForCustomer } from "@/lib/backend-api/customer-campaigns";
import { tenantScopeFromCustomerContext } from "@/lib/backend-api/tenant-scope";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

export type WorkspaceRecommendation = BackendRecommendation & {
  campaign_city?: string | null;
  campaign_id?: number | null;
  campaign_industry?: string | null;
  campaign_name?: string | null;
  campaign_status?: string | null;
};

export type RecommendationWorkspaceStats = {
  activeRecommendations: number;
  approved: number;
  avgFounderConfidence: number;
  avgRecommendationScore: number;
  pendingReview: number;
  premiumOpportunities: number;
  smtpReady: number;
};

export type RecommendationWorkspace = {
  campaigns: BackendCampaignRead[];
  items: WorkspaceRecommendation[];
  stats: RecommendationWorkspaceStats;
};

type CampaignCompanyMapValue = {
  campaign_city?: string | null;
  campaign_id: number;
  campaign_industry?: string | null;
  campaign_name: string;
  campaign_status: string;
  updated_at: string;
};

const DEFAULT_RECOMMENDATION_LIMIT = 100;

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function normalizeStatus(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function compareRecency(left: { updated_at: string }, right: { updated_at: string }) {
  return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
}

function buildCampaignCompanyMap(details: BackendCampaignDetail[]) {
  const map = new Map<number, CampaignCompanyMapValue>();

  for (const detail of details) {
    for (const lead of detail.leads) {
      const current = map.get(lead.company_id);

      if (current && new Date(current.updated_at).getTime() >= new Date(detail.campaign.updated_at).getTime()) {
        continue;
      }

      map.set(lead.company_id, {
        campaign_city: lead.source_query ?? detail.campaign.cities[0] ?? null,
        campaign_id: detail.campaign.id,
        campaign_industry: detail.campaign.industry ?? null,
        campaign_name: detail.campaign.name,
        campaign_status: detail.campaign.status,
        updated_at: detail.campaign.updated_at,
      });
    }
  }

  return map;
}

function isSmtpReady(recommendation: WorkspaceRecommendation) {
  const contactability = normalizeStatus(recommendation.contactability);

  return (
    recommendation.approved &&
    Boolean(recommendation.founder_email) &&
    (contactability === "premium" || contactability === "strong") &&
    normalizeStatus(recommendation.smtp_state) !== "failed"
  );
}

function buildWorkspaceStats(items: WorkspaceRecommendation[]): RecommendationWorkspaceStats {
  const activeRecommendations = items.length;
  const approved = items.filter((item) => item.approved).length;
  const pendingReview = items.filter((item) => !item.reviewed).length;
  const premiumOpportunities = items.filter(
    (item) => item.recommendation_score >= 80 || item.lead_score >= 80,
  ).length;
  const smtpReady = items.filter((item) => isSmtpReady(item)).length;
  const avgFounderConfidence = items.length
    ? roundToSingleDecimal(
        items.reduce((sum, item) => sum + (item.founder_confidence ?? 0), 0) / items.length,
      )
    : 0;
  const avgRecommendationScore = items.length
    ? roundToSingleDecimal(
        items.reduce((sum, item) => sum + item.recommendation_score, 0) / items.length,
      )
    : 0;

  return {
    activeRecommendations,
    approved,
    avgFounderConfidence,
    avgRecommendationScore,
    pendingReview,
    premiumOpportunities,
    smtpReady,
  };
}

export async function listRecommendationsForCustomer(
  customerName: string,
  limit = DEFAULT_RECOMMENDATION_LIMIT,
): Promise<RecommendationWorkspace> {
  const tenant = tenantScopeFromCustomerContext(await getCurrentCustomerContext());
  const campaigns = await listCampaignsForCustomer(customerName, 50);

  if (campaigns.length === 0) {
    return {
      campaigns: [],
      items: [],
      stats: buildWorkspaceStats([]),
    };
  }

  const details = (
    await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          return await backendApi.campaigns.get(campaign.id, tenant);
        } catch (error) {
          if (error instanceof BackendApiError && error.status === 404) {
            return null;
          }

          throw error;
        }
      }),
    )
  ).filter((detail): detail is BackendCampaignDetail => Boolean(detail));

  const companyMap = buildCampaignCompanyMap(details);
  const recommendations = await backendApi.recommendations.list({
    limit: Math.max(limit, DEFAULT_RECOMMENDATION_LIMIT),
    tenant,
  });

  const items = recommendations.items
    .filter((item) => companyMap.has(item.company_id))
    .map((item) => ({
      ...item,
      ...companyMap.get(item.company_id),
    }))
    .sort((left, right) => {
      if (right.recommendation_score !== left.recommendation_score) {
        return right.recommendation_score - left.recommendation_score;
      }

      if (right.lead_score !== left.lead_score) {
        return right.lead_score - left.lead_score;
      }

      if (Number(right.approved) !== Number(left.approved)) {
        return Number(right.approved) - Number(left.approved);
      }

      return compareRecency(left, right);
    })
    .slice(0, limit);

  return {
    campaigns,
    items,
    stats: buildWorkspaceStats(items),
  };
}

export async function getRecommendationAssets(companyId: number): Promise<{
  draft: BackendDraft | null;
  lead: BackendLeadDetailResponse;
}> {
  const tenant = tenantScopeFromCustomerContext(await getCurrentCustomerContext());
  const lead = await backendApi.leads.get(companyId, tenant);
  const draft = await backendApi.drafts
    .get(companyId, tenant)
    .catch((error) => {
      if (error instanceof BackendApiError && error.status === 404) {
        return null;
      }

      throw error;
    });

  return { draft, lead };
}

export async function getRecommendationForCustomer(
  customerName: string,
  companyId: number,
): Promise<WorkspaceRecommendation | null> {
  const workspace = await listRecommendationsForCustomer(customerName, DEFAULT_RECOMMENDATION_LIMIT);
  return workspace.items.find((item) => item.company_id === companyId) ?? null;
}
