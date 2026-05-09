"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { backendApi } from "@/lib/backend-api/client";
import { getSmtpWorkspaceForCustomer } from "@/lib/backend-api/customer-smtp";
import { getRecommendationAssets } from "@/lib/backend-api/customer-recommendations";
import { tenantScopeFromCustomerContext } from "@/lib/backend-api/tenant-scope";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

function getReturnTo(formData: FormData) {
  const returnTo = formData.get("returnTo");

  if (typeof returnTo === "string" && returnTo.trim()) {
    return returnTo;
  }

  return ROUTES.SMTP;
}

function getCompanyId(formData: FormData) {
  const rawValue = formData.get("companyId");
  const companyId = Number(rawValue);

  if (!Number.isFinite(companyId)) {
    throw new Error("Invalid SMTP workspace target.");
  }

  return companyId;
}

function refreshWorkspace() {
  revalidatePath(ROUTES.SMTP);
  revalidatePath(ROUTES.COHORTS);
  revalidatePath(ROUTES.DRAFTS);
  revalidatePath(ROUTES.RECOMMENDATIONS);
  revalidatePath(ROUTES.CAMPAIGNS);
  revalidatePath(ROUTES.EXPORTS);
}

async function getScopedSmtpLead(companyId: number) {
  const customerContext = await getCurrentCustomerContext();
  const workspace = await getSmtpWorkspaceForCustomer(customerContext.companyName, {
    groupBy: "risk",
    queue: "all",
  });
  const item = workspace.items.find((candidate) => candidate.companyId === companyId);

  if (!item) {
    throw new Error("Lead not found in this SMTP workspace.");
  }

  const assets = await getRecommendationAssets(companyId);

  return {
    assets,
    customerContext,
    item,
  };
}

export async function reviewSmtpLeadAction(formData: FormData) {
  const companyId = getCompanyId(formData);
  const returnTo = getReturnTo(formData);
  const rawStatus = formData.get("status");
  const status =
    rawStatus === "approved" || rawStatus === "rejected" || rawStatus === "pending"
      ? rawStatus
      : "pending";
  const { assets, customerContext } = await getScopedSmtpLead(companyId);
  const { summary } = assets.lead;
  const tenant = tenantScopeFromCustomerContext(customerContext);

  await backendApi.leads.review(companyId, {
    confidence_override:
      summary.review.confidence_override ??
      summary.founder_email_confidence ??
      summary.founder_confidence,
    notes:
      status === "approved"
        ? "Approved from SMTP workspace"
        : status === "rejected"
          ? "Rejected from SMTP workspace"
          : "Returned to pending from SMTP workspace",
    reviewer: customerContext.customer.email,
    selected_contact_id: summary.review.selected_contact_id,
    selected_email: summary.review.selected_email ?? summary.founder_email,
    status,
  }, tenant);

  refreshWorkspace();
  redirect(returnTo);
}

export async function generateSmtpDraftAction(formData: FormData) {
  const companyId = getCompanyId(formData);
  const returnTo = getReturnTo(formData);
  const { assets, customerContext } = await getScopedSmtpLead(companyId);

  if (assets.lead.summary.review.status !== "approved") {
    redirect(returnTo);
  }

  await backendApi.drafts.generateForCompany(companyId, true, tenantScopeFromCustomerContext(customerContext));
  refreshWorkspace();
  redirect(returnTo);
}

export async function validateSmtpLeadAction(formData: FormData) {
  const companyId = getCompanyId(formData);
  const returnTo = getReturnTo(formData);
  const { assets, customerContext } = await getScopedSmtpLead(companyId);
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

export async function addSmtpLeadToCohortAction(formData: FormData) {
  const companyId = getCompanyId(formData);
  const returnTo = getReturnTo(formData);
  const { assets, customerContext, item } = await getScopedSmtpLead(companyId);
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
    name: `${customerContext.companyName} SMTP Ready Cohort`,
    notes: "Added from SMTP workspace",
    reviewer: customerContext.customer.email,
    search: summary.company_name,
    smtp_statuses: item.smtpSafe ? ["verified"] : [],
    source_query: summary.source_query,
  }, tenantScopeFromCustomerContext(customerContext));

  refreshWorkspace();
  redirect(returnTo);
}
