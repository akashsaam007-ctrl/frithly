"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { backendApi } from "@/lib/backend-api/client";
import { listDraftsForCustomer } from "@/lib/backend-api/customer-drafts";
import { getRecommendationAssets } from "@/lib/backend-api/customer-recommendations";
import { tenantScopeFromCustomerContext } from "@/lib/backend-api/tenant-scope";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

function getReturnTo(formData: FormData) {
  const returnTo = formData.get("returnTo");

  if (typeof returnTo === "string" && returnTo.trim()) {
    return returnTo;
  }

  return ROUTES.COHORTS;
}

function refreshWorkspace() {
  revalidatePath(ROUTES.COHORTS);
  revalidatePath(ROUTES.DRAFTS);
  revalidatePath(ROUTES.RECOMMENDATIONS);
  revalidatePath(ROUTES.CAMPAIGNS);
  revalidatePath(ROUTES.SMTP);
}

function getCampaignId(formData: FormData) {
  const rawValue = formData.get("campaignId");
  const campaignId = Number(rawValue);

  if (!Number.isFinite(campaignId)) {
    throw new Error("Invalid cohort member target.");
  }

  return campaignId;
}

async function getReadyDraftsForCustomer() {
  const customerContext = await getCurrentCustomerContext();
  const draftsWorkspace = await listDraftsForCustomer(customerContext.companyName, 100);
  const readyDrafts = draftsWorkspace.items.filter((draft) => {
    const contactability = (draft.contactability ?? "").trim().toLowerCase();

    return (
      draft.status === "approved" &&
      Boolean(draft.founder_email) &&
      (contactability === "premium" || contactability === "strong")
    );
  });

  return {
    customerContext,
    readyDrafts,
  };
}

export async function buildReadyCohortAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const { customerContext, readyDrafts } = await getReadyDraftsForCustomer();

  if (readyDrafts.length === 0) {
    redirect(returnTo);
  }

  const cohortName = `${customerContext.companyName} Launch Cohort`;
  const tenant = tenantScopeFromCustomerContext(customerContext);

  for (const draft of readyDrafts.slice(0, 12)) {
    const assets = await getRecommendationAssets(draft.company_id).catch(() => null);
    const summary = assets?.lead?.summary;

    await backendApi.cohorts.create({
      category_contains: summary?.category ?? undefined,
      contactability_tiers: [draft.contactability ?? "strong"],
      country: summary?.country ?? undefined,
      limit: 1,
      min_founder_confidence: summary?.founder_confidence ?? 0.0,
      min_founder_email_confidence:
        summary?.review.confidence_override ??
        summary?.founder_email_confidence ??
        summary?.founder_confidence ??
        0.0,
      min_score: Math.max(70, draft.lead_score ?? 70),
      name: cohortName,
      notes: "Built from the cohorts workspace using approved ready drafts",
      reviewer: customerContext.customer.email,
      search: draft.company_name ?? undefined,
      smtp_statuses: [],
      source_query: draft.source_query ?? undefined,
    }, tenant);
  }

  refreshWorkspace();
  redirect(returnTo);
}

export async function recordCohortSignalAction(formData: FormData) {
  const returnTo = getReturnTo(formData);
  const campaignId = getCampaignId(formData);
  const rawEventType = formData.get("eventType");
  const eventType =
    rawEventType === "sent" ||
    rawEventType === "opened" ||
    rawEventType === "replied" ||
    rawEventType === "positive_reply" ||
    rawEventType === "bounced" ||
    rawEventType === "spam_complaint" ||
    rawEventType === "meeting_booked" ||
    rawEventType === "ignored"
      ? rawEventType
      : "sent";
  const customerContext = await getCurrentCustomerContext();
  const tenant = tenantScopeFromCustomerContext(customerContext);

  await backendApi.cohorts.recordSignal(campaignId, {
    actor: customerContext.customer.email,
    channel: "email",
    event_type: eventType,
    notes: `Recorded from cohorts workspace: ${eventType}`,
  }, tenant);

  refreshWorkspace();
  redirect(returnTo);
}
