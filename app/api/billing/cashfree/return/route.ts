import { NextResponse } from "next/server";
import { fetchCashfreeSubscription, getFrithlyPlanIdFromCashfreeSubscription } from "@/lib/cashfree/client";
import { ROUTES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CustomerStatus } from "@/types";

function mapCashfreeStatusToCustomerStatus(status: string): CustomerStatus {
  const normalizedStatus = status.trim().toUpperCase();

  switch (normalizedStatus) {
    case "ACTIVE":
      return "active";
    case "BANK_APPROVAL_PENDING":
    case "CUSTOMER_PAUSED":
    case "ON_HOLD":
    case "PAUSED":
      return "paused";
    case "CANCELLED":
    case "CARD_EXPIRED":
    case "COMPLETED":
    case "CUSTOMER_CANCELLED":
    case "EXPIRED":
      return "cancelled";
    default:
      return "pending";
  }
}

function resolveCheckoutState(params: {
  checkoutStatus: string;
  status: string;
}) {
  const normalizedCheckoutStatus = params.checkoutStatus.trim().toUpperCase();
  const normalizedStatus = params.status.trim().toUpperCase();

  if (normalizedStatus === "ACTIVE" || normalizedCheckoutStatus === "SUCCESS") {
    return "authorized";
  }

  if (
    normalizedStatus === "BANK_APPROVAL_PENDING" ||
    normalizedCheckoutStatus === "SUCCESS_DEBIT_PENDING" ||
    normalizedCheckoutStatus === "SUCCESS_TOKENIZATION_PENDING"
  ) {
    return "pending";
  }

  return "failed";
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const subscriptionId = String(formData.get("cf_subscriptionId") ?? "").trim();
  const checkoutStatus = String(formData.get("cf_checkoutStatus") ?? "").trim();
  const status = String(formData.get("cf_status") ?? "").trim();
  const message = String(formData.get("cf_message") ?? "").trim();
  const emailFromReturnUrl = requestUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";
  const companyNameFromReturnUrl = requestUrl.searchParams.get("company_name")?.trim() ?? "";
  const planFromReturnUrl = requestUrl.searchParams.get("plan")?.trim() ?? "";
  const checkoutState = resolveCheckoutState({
    checkoutStatus,
    status,
  });
  const redirectPath =
    checkoutState === "authorized" || checkoutState === "pending"
      ? ROUTES.DASHBOARD
      : "/pricing";
  const redirectUrl = new URL(redirectPath, requestUrl.origin);

  redirectUrl.searchParams.set(
    "checkout",
    checkoutState,
  );

  if (subscriptionId) {
    redirectUrl.searchParams.set("subscription", subscriptionId);
  }

  if (message) {
    redirectUrl.searchParams.set("message", message);
  }

  if (emailFromReturnUrl) {
    redirectUrl.searchParams.set("email", emailFromReturnUrl);
  }

  if (subscriptionId) {
    try {
      const subscription = await fetchCashfreeSubscription(subscriptionId);
      const email =
        subscription.customer_details.customer_email.trim().toLowerCase() || emailFromReturnUrl;

      if (email) {
        redirectUrl.searchParams.set("email", email);
        const adminClient = createSupabaseAdminClient();
        const { data: existingCustomer, error: existingCustomerError } = await adminClient
          .from("customers")
          .select("id, company_name, full_name, plan, status, billing_customer_id, billing_subscription_id")
          .eq("email", email)
          .maybeSingle();

        if (existingCustomerError) {
          throw new Error(existingCustomerError.message);
        }

        const customerPayload = {
          billing_customer_id: subscription.cf_subscription_id ?? existingCustomer?.billing_customer_id ?? null,
          billing_subscription_id: subscription.subscription_id,
          cancelled_at:
            subscription.subscription_status.trim().toUpperCase() === "CANCELLED"
              ? new Date().toISOString()
              : null,
          company_name:
            subscription.subscription_tags?.company_name?.trim() ||
            companyNameFromReturnUrl ||
            existingCustomer?.company_name ||
            null,
          email,
          full_name:
            existingCustomer?.full_name ??
            subscription.customer_details.customer_name ??
            email.split("@")[0] ??
            null,
          plan:
            getFrithlyPlanIdFromCashfreeSubscription({
              planDetails: subscription.plan_details,
              subscriptionId: subscription.subscription_id,
              subscriptionTags: subscription.subscription_tags ?? null,
            }) ??
            (planFromReturnUrl === "design_partner" ||
            planFromReturnUrl === "starter" ||
            planFromReturnUrl === "growth"
              ? planFromReturnUrl
              : null) ??
            existingCustomer?.plan ??
            null,
          status: mapCashfreeStatusToCustomerStatus(subscription.subscription_status),
        };

        const writeResult = existingCustomer
          ? await adminClient.from("customers").update(customerPayload).eq("id", existingCustomer.id)
          : await adminClient.from("customers").insert(customerPayload);

        if (writeResult.error) {
          throw new Error(writeResult.error.message);
        }
      }
    } catch (error) {
      console.error("Failed to upsert customer from Cashfree return", {
        error,
        subscriptionId,
      });
    }
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
