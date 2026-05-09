import "server-only";

import type { BackendCampaignDetail, BackendCampaignRead } from "@/lib/backend-api/types";
import { backendApi } from "@/lib/backend-api/client";
import { tenantScopeFromCustomerContext } from "@/lib/backend-api/tenant-scope";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

const CAMPAIGN_FETCH_LIMIT = 200;

function normalizeScope(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isVisibleToCustomer(campaign: BackendCampaignRead, customerName: string) {
  const normalizedCustomer = normalizeScope(customerName);

  if (!normalizedCustomer) {
    return false;
  }

  const normalizedClient = normalizeScope(campaign.client_name);

  if (normalizedClient) {
    return normalizedClient === normalizedCustomer;
  }

  const normalizedCampaignName = normalizeScope(campaign.name);
  return normalizedCampaignName.startsWith(`${normalizedCustomer} `);
}

function compareByRecency(a: BackendCampaignRead, b: BackendCampaignRead) {
  return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
}

export async function listCampaignsForCustomer(customerName: string, limit = 25) {
  const tenant = tenantScopeFromCustomerContext(await getCurrentCustomerContext());
  const campaigns = await backendApi.campaigns.list(CAMPAIGN_FETCH_LIMIT, tenant);

  return campaigns
    .filter((campaign) => isVisibleToCustomer(campaign, customerName))
    .sort(compareByRecency)
    .slice(0, limit);
}

export async function getCampaignForCustomer(customerName: string, campaignId: number) {
  const tenant = tenantScopeFromCustomerContext(await getCurrentCustomerContext());
  const detail = await backendApi.campaigns.get(campaignId, tenant);

  if (!isVisibleToCustomer(detail.campaign, customerName)) {
    return null;
  }

  return detail;
}

export function buildCampaignWorkspaceSummary(campaigns: BackendCampaignRead[]) {
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((campaign) =>
    ["created", "queued", "running"].includes(campaign.status.toLowerCase()),
  ).length;
  const generatedLeads = campaigns.reduce((sum, campaign) => sum + campaign.generated_leads, 0);
  const qualifiedLeads = campaigns.reduce((sum, campaign) => sum + campaign.qualified_leads, 0);
  const premiumLeads = campaigns.reduce((sum, campaign) => sum + campaign.premium_leads, 0);
  const sendReadyLeads = campaigns.reduce((sum, campaign) => sum + campaign.send_ready_leads, 0);
  const averageScore =
    totalCampaigns > 0
      ? Math.round(
          (campaigns.reduce((sum, campaign) => sum + campaign.average_score, 0) / totalCampaigns) *
            10,
        ) / 10
      : 0;

  return {
    activeCampaigns,
    averageScore,
    generatedLeads,
    premiumDensity: generatedLeads > 0 ? premiumLeads / generatedLeads : 0,
    premiumLeads,
    qualifiedLeads,
    sendReadyLeads,
    totalCampaigns,
  };
}

export function getFeaturedCampaigns(campaigns: BackendCampaignRead[], limit = 3) {
  return [...campaigns]
    .sort((left, right) => {
      if (right.send_ready_leads !== left.send_ready_leads) {
        return right.send_ready_leads - left.send_ready_leads;
      }

      if (right.qualified_leads !== left.qualified_leads) {
        return right.qualified_leads - left.qualified_leads;
      }

      if (right.premium_leads !== left.premium_leads) {
        return right.premium_leads - left.premium_leads;
      }

      return compareByRecency(left, right);
    })
    .slice(0, limit);
}

export function getTopCampaignOpportunities(detail: BackendCampaignDetail, limit = 8) {
  return [...detail.leads]
    .sort((left, right) => {
      const leftScore = left.recommendation_score ?? left.lead_score;
      const rightScore = right.recommendation_score ?? right.lead_score;

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return right.lead_score - left.lead_score;
    })
    .slice(0, limit);
}
