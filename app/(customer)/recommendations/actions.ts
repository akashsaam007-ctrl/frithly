"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { backendApi } from "@/lib/backend-api/client";
import { getRecommendationAssets, getRecommendationForCustomer } from "@/lib/backend-api/customer-recommendations";
import { tenantScopeFromCustomerContext } from "@/lib/backend-api/tenant-scope";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

function getReturnTo(formData: FormData) {
  const returnTo = formData.get("returnTo");

  if (typeof returnTo === "string" && returnTo.trim()) {
    return returnTo;
  }

  return ROUTES.RECOMMENDATIONS;
}

function getCompanyId(formData: FormData) {
  const rawValue = formData.get("companyId");
  const companyId = Number(rawValue);

  if (!Number.isFinite(companyId)) {
    throw new Error("Invalid recommendation target.");
  }

  return companyId;
}

async function getScopedRecommendation(companyId: number) {
  const customerContext = await getCurrentCustomerContext();
  const recommendation = await getRecommendationForCustomer(customerContext.companyName, companyId);

  if (!recommendation) {
    throw new Error("Recommendation not found in this workspace.");
  }

  const assets = await getRecommendationAssets(companyId);

  return {
    assets,
    customerContext,
    recommendation,
  };
}

function refreshWorkspace() {
  revalidatePath(ROUTES.COHORTS);
  revalidatePath(ROUTES.DRAFTS);
  revalidatePath(ROUTES.RECOMMENDATIONS);
  revalidatePath(ROUTES.CAMPAIGNS);
  revalidatePath(ROUTES.SMTP);
}

export async function refreshRecommendationsAction(formData: FormData) {
  const returnTo = getReturnTo(formData);

  const customerContext = await getCurrentCustomerContext();
  await backendApi.recommendations.generate(200, tenantScopeFromCustomerContext(customerContext));

  refreshWorkspace();
  redirect(returnTo);
}

export async function reviewRecommendationAction(formData: FormData) {
  const companyId = getCompanyId(formData);
  const returnTo = getReturnTo(formData);
  const rawStatus = formData.get("status");
  const status =
    rawStatus === "approved" || rawStatus === "rejected" || rawStatus === "pending"
      ? rawStatus
      : "pending";
  const { assets, customerContext } = await getScopedRecommendation(companyId);
  const { summary } = assets.lead;
  const tenant = tenantScopeFromCustomerContext(customerContext);

  await backendApi.leads.review(companyId, {
    confidence_override:
      summary.review.confidence_override ??
      summary.founder_email_confidence ??
      summary.founder_confidence,
    notes:
      status === "approved"
        ? "Approved from recommendations workspace"
        : status === "rejected"
          ? "Rejected from recommendations workspace"
          : "Returned to pending from recommendations workspace",
    reviewer: customerContext.customer.email,
    selected_contact_id: summary.review.selected_contact_id,
    selected_email: summary.review.selected_email ?? summary.founder_email,
    status,
  }, tenant);

  refreshWorkspace();
  redirect(returnTo);
}

export async function generateDraftAction(formData: FormData) {
  const companyId = getCompanyId(formData);
  const returnTo = getReturnTo(formData);
  const { assets, customerContext } = await getScopedRecommendation(companyId);

  if (assets.lead.summary.review.status !== "approved") {
    redirect(returnTo);
  }

  await backendApi.drafts.generateForCompany(companyId, true, tenantScopeFromCustomerContext(customerContext));
  refreshWorkspace();
  redirect(returnTo);
}

export async function validateSmtpAction(formData: FormData) {
  const companyId = getCompanyId(formData);
  const returnTo = getReturnTo(formData);
  const { assets, customerContext } = await getScopedRecommendation(companyId);
  const selectedEmail = assets.lead.summary.review.selected_email ?? assets.lead.summary.founder_email;

  if (!selectedEmail) {
    redirect(returnTo);
  }

  await backendApi.leads.validateSmtp(companyId, {
    email: selectedEmail,
    reviewer: customerContext.customer.email,
  }, tenantScopeFromCustomerContext(customerContext));

  refreshWorkspace();
  redirect(returnTo);
}

export async function addToCohortAction(formData: FormData) {
  const companyId = getCompanyId(formData);
  const returnTo = getReturnTo(formData);
  const { assets, customerContext } = await getScopedRecommendation(companyId);
  const { summary } = assets.lead;
  const selectedConfidence =
    summary.review.confidence_override ??
    summary.founder_email_confidence ??
    summary.founder_confidence ??
    0.0;

  if (summary.review.status !== "approved" || !summary.founder_email) {
    redirect(returnTo);
  }

  await backendApi.cohorts.create({
    category_contains: summary.category,
    contactability_tiers: [summary.contactability_tier],
    country: summary.country,
    limit: 1,
    min_founder_confidence: summary.founder_confidence ?? 0.0,
    min_founder_email_confidence: selectedConfidence,
    min_score: Math.max(70, summary.score),
    name: `${customerContext.companyName} Priority Cohort`,
    notes: "Added from recommendations workspace",
    reviewer: customerContext.customer.email,
    search: summary.company_name,
    smtp_statuses: [],
    source_query: summary.source_query,
  }, tenantScopeFromCustomerContext(customerContext));

  refreshWorkspace();
  redirect(returnTo);
}
