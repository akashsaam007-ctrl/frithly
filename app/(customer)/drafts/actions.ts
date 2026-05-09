"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { backendApi } from "@/lib/backend-api/client";
import { getDraftForCustomer } from "@/lib/backend-api/customer-drafts";
import { getRecommendationAssets } from "@/lib/backend-api/customer-recommendations";
import { tenantScopeFromCustomerContext } from "@/lib/backend-api/tenant-scope";
import { ROUTES } from "@/lib/constants";
import { getCurrentCustomerContext } from "@/lib/supabase/customer-data";

function getReturnTo(formData: FormData) {
  const returnTo = formData.get("returnTo");

  if (typeof returnTo === "string" && returnTo.trim()) {
    return returnTo;
  }

  return ROUTES.DRAFTS;
}

function getCompanyId(formData: FormData) {
  const rawValue = formData.get("companyId");
  const companyId = Number(rawValue);

  if (!Number.isFinite(companyId)) {
    throw new Error("Invalid draft target.");
  }

  return companyId;
}

function refreshWorkspace() {
  revalidatePath(ROUTES.COHORTS);
  revalidatePath(ROUTES.DRAFTS);
  revalidatePath(ROUTES.RECOMMENDATIONS);
  revalidatePath(ROUTES.CAMPAIGNS);
  revalidatePath(ROUTES.SMTP);
}

async function getScopedDraft(companyId: number) {
  const customerContext = await getCurrentCustomerContext();
  const draft = await getDraftForCustomer(customerContext.companyName, companyId);

  if (!draft) {
    throw new Error("Draft not found in this workspace.");
  }

  const assets = await getRecommendationAssets(companyId);

  return {
    assets,
    customerContext,
    draft,
  };
}

type DraftStatus = "approved" | "draft" | "rejected";

async function persistDraftEdits(formData: FormData, status?: DraftStatus) {
  const companyId = getCompanyId(formData);
  const returnTo = getReturnTo(formData);
  const { assets, customerContext, draft } = await getScopedDraft(companyId);

  const subjectLine = String(formData.get("subject_line") ?? draft.subject_line ?? "").trim();
  const firstLine = String(formData.get("first_line") ?? draft.first_line ?? "").trim();
  const shortPitch = String(formData.get("short_pitch") ?? draft.short_pitch ?? "").trim();
  const cta = String(formData.get("cta") ?? draft.cta ?? "").trim();
  const fullBody = String(formData.get("full_body") ?? draft.full_body ?? "").trim();
  const reviewNotes = String(formData.get("review_notes") ?? draft.review_notes ?? "").trim();
  const nextStatus = status ?? draft.status;
  const tenant = tenantScopeFromCustomerContext(customerContext);

  await backendApi.drafts.update(companyId, {
    cta,
    first_line: firstLine,
    full_body: fullBody,
    review_notes: reviewNotes || null,
    reviewer: customerContext.customer.email,
    short_pitch: shortPitch,
    status: nextStatus,
    subject_line: subjectLine,
  }, tenant);

  if (nextStatus === "approved" && assets.lead.summary.review.status !== "approved") {
    await backendApi.leads.review(companyId, {
      confidence_override:
        assets.lead.summary.review.confidence_override ??
        assets.lead.summary.founder_email_confidence ??
        assets.lead.summary.founder_confidence,
      notes: "Approved from drafts workspace",
      reviewer: customerContext.customer.email,
      selected_contact_id: assets.lead.summary.review.selected_contact_id,
      selected_email:
        assets.lead.summary.review.selected_email ?? assets.lead.summary.founder_email,
      status: "approved",
    }, tenant);
  }

  refreshWorkspace();
  redirect(returnTo);
}

export async function refreshDraftQueueAction(formData: FormData) {
  const returnTo = getReturnTo(formData);

  const customerContext = await getCurrentCustomerContext();
  await backendApi.drafts.generateApproved({
    force: false,
    limit: 200,
    tenant: tenantScopeFromCustomerContext(customerContext),
  });

  refreshWorkspace();
  redirect(returnTo);
}

export async function regenerateDraftAction(formData: FormData) {
  const companyId = getCompanyId(formData);
  const returnTo = getReturnTo(formData);
  const { assets, customerContext } = await getScopedDraft(companyId);

  if (assets.lead.summary.review.status !== "approved") {
    redirect(returnTo);
  }

  await backendApi.drafts.generateForCompany(companyId, true, tenantScopeFromCustomerContext(customerContext));
  refreshWorkspace();
  redirect(returnTo);
}

export async function saveDraftAction(formData: FormData) {
  await persistDraftEdits(formData);
}

export async function approveDraftAction(formData: FormData) {
  await persistDraftEdits(formData, "approved");
}

export async function rejectDraftAction(formData: FormData) {
  await persistDraftEdits(formData, "rejected");
}

export async function returnDraftToWorkingAction(formData: FormData) {
  await persistDraftEdits(formData, "draft");
}
