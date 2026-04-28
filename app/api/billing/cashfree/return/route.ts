import { NextResponse } from "next/server";
import { env } from "@/lib/utils/env";

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
  const formData = await request.formData();
  const subscriptionId = String(formData.get("cf_subscriptionId") ?? "").trim();
  const checkoutStatus = String(formData.get("cf_checkoutStatus") ?? "").trim();
  const status = String(formData.get("cf_status") ?? "").trim();
  const message = String(formData.get("cf_message") ?? "").trim();
  const redirectUrl = new URL("/pricing", env.NEXT_PUBLIC_APP_URL);

  redirectUrl.searchParams.set(
    "checkout",
    resolveCheckoutState({
      checkoutStatus,
      status,
    }),
  );

  if (subscriptionId) {
    redirectUrl.searchParams.set("subscription", subscriptionId);
  }

  if (message) {
    redirectUrl.searchParams.set("message", message);
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}
