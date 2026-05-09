"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { backendApi } from "@/lib/backend-api/client";
import { sendWeeklyDeliveryReadyEmail } from "@/lib/resend/send";
import { ROUTES } from "@/lib/constants";
import { env } from "@/lib/utils/env";

function refreshDeliveryWorkspace() {
  revalidatePath(ROUTES.ADMIN_DELIVERIES);
  revalidatePath(ROUTES.ADMIN);
  revalidatePath(ROUTES.DASHBOARD);
  revalidatePath(ROUTES.COHORTS);
  revalidatePath(ROUTES.EXPORTS);
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : 0;
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function updateDeliveryStateAction(formData: FormData) {
  const cohortName = getString(formData, "cohortName");
  const state = getString(formData, "state") as
    | "preparing"
    | "reviewing"
    | "approved"
    | "scheduled"
    | "delivered";
  const notes = getString(formData, "notes") || undefined;

  if (!cohortName || !state) {
    redirect(ROUTES.ADMIN_DELIVERIES);
  }

  await backendApi.cohorts.updateDeliveryState(cohortName, {
    notes,
    state,
  });

  refreshDeliveryWorkspace();
  redirect(ROUTES.ADMIN_DELIVERIES);
}

export async function releaseDueDeliveriesAction() {
  await backendApi.cohorts.releaseDue("admin_console");
  refreshDeliveryWorkspace();
  redirect(ROUTES.ADMIN_DELIVERIES);
}

export async function updateDeliveryWorkflowAction(formData: FormData) {
  const cohortName = getString(formData, "cohortName");
  const reviewOwner = getString(formData, "reviewOwner");
  const opsNotes = getString(formData, "opsNotes");
  const blockerTags = parseTags(getString(formData, "blockerTags"));
  const qaNotes = getString(formData, "qaNotes");
  const qaConfirmed = getBoolean(formData, "qaConfirmed");

  if (!cohortName) {
    redirect(ROUTES.ADMIN_DELIVERIES);
  }

  await backendApi.cohorts.updateWorkflow(cohortName, {
    actor: "admin_console",
    blocker_tags: blockerTags,
    ops_notes: opsNotes || null,
    qa_confirmed: qaConfirmed,
    qa_notes: qaNotes || null,
    review_owner: reviewOwner || null,
  });

  refreshDeliveryWorkspace();
  redirect(ROUTES.ADMIN_DELIVERIES);
}

export async function sendDeliveryEmailAction(formData: FormData) {
  const cohortName = getString(formData, "cohortName");
  const customerEmail = getString(formData, "customerEmail");
  const customerFirstName = getString(formData, "customerFirstName") || "there";
  const deliveryWeekLabel = getString(formData, "deliveryWeekLabel") || "This week's delivery";
  const reviewedOpportunityCount = getNumber(formData, "reviewedOpportunityCount");
  const premiumOpportunityCount = getNumber(formData, "premiumOpportunityCount");
  const smtpSafeCount = getNumber(formData, "smtpSafeCount");
  const draftReadyCount = getNumber(formData, "draftReadyCount");

  if (!cohortName || !customerEmail) {
    redirect(ROUTES.ADMIN_DELIVERIES);
  }

  await sendWeeklyDeliveryReadyEmail({
    cohortName,
    cohortUrl: `${env.NEXT_PUBLIC_APP_URL}${ROUTES.COHORTS}?name=${encodeURIComponent(cohortName)}`,
    deliveryWeekLabel,
    draftReadyCount,
    firstName: customerFirstName,
    premiumOpportunityCount,
    recipientEmail: customerEmail,
    reviewedOpportunityCount,
    smtpSafeCount,
  });

  await backendApi.cohorts.markDeliveryEmailSent(cohortName, "admin_console");

  refreshDeliveryWorkspace();
  redirect(ROUTES.ADMIN_DELIVERIES);
}
