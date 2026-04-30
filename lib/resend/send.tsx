import type { ReactElement } from "react";
import { PLANS, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";
import { resend } from "@/lib/resend/client";
import {
  BriefDeliveredEmail,
  getBriefDeliveredEmailSubject,
  getBriefDeliveredEmailText,
  type BriefDeliveredEmailProps,
} from "@/lib/resend/templates/brief-delivered";
import {
  getPaymentFailedEmailSubject,
  getPaymentFailedEmailText,
  PaymentFailedEmail,
  type PaymentFailedEmailProps,
} from "@/lib/resend/templates/payment-failed";
import {
  getPaymentReceiptEmailSubject,
  getPaymentReceiptEmailText,
  PaymentReceiptEmail,
  type PaymentReceiptEmailProps,
} from "@/lib/resend/templates/payment-receipt";
import {
  SampleDeliveryEmail,
  getSampleDeliveryEmailSubject,
  getSampleDeliveryEmailText,
  type SampleDeliveryEmailProps,
} from "@/lib/resend/templates/sample-delivery";
import {
  SampleRequestAlertEmail,
  type SampleRequestAlertEmailProps,
} from "@/lib/resend/templates/sample-request-alert";
import {
  getSampleRequestReceivedEmailSubject,
  getSampleRequestReceivedEmailText,
  SampleRequestReceivedEmail,
  type SampleRequestReceivedEmailProps,
} from "@/lib/resend/templates/sample-request-received";
import {
  getSubscriptionCancelledEmailSubject,
  getSubscriptionCancelledEmailText,
  SubscriptionCancelledEmail,
  type SubscriptionCancelledEmailProps,
} from "@/lib/resend/templates/subscription-cancelled";
import {
  SupportRequestEmail,
  type SupportRequestEmailProps,
} from "@/lib/resend/templates/support-request";
import {
  getWelcomeEmailSubject,
  getWelcomeEmailText,
  WelcomeEmail,
  type WelcomeEmailProps,
} from "@/lib/resend/templates/welcome";
import { env } from "@/lib/utils/env";
import { formatCurrency } from "@/lib/utils";
import type { PlanId } from "@/types";

export function planNameFromId(planId: PlanId | null | undefined) {
  switch (planId) {
    case "design_partner":
      return PLANS.DESIGN_PARTNER.name;
    case "starter":
      return PLANS.STARTER.name;
    case "growth":
      return PLANS.GROWTH.name;
    case "scale":
      return PLANS.SCALE.name;
    default:
      return "Frithly";
  }
}

async function sendFrithlyEmail(params: {
  react: ReactElement;
  replyTo?: string;
  subject: string;
  text: string;
  to: string | string[];
}) {
  const html = buildEmailHtmlFromText(params.text);

  return resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    html,
    replyTo: params.replyTo ?? env.RESEND_REPLY_TO,
    subject: params.subject,
    text: params.text,
    to: params.to,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailHtmlFromText(text: string) {
  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((section) => section.trim())
    .filter(Boolean)
    .map((section) => `<p style="margin:0 0 16px;line-height:1.7;color:#1A1A1A;font-size:16px;">${escapeHtml(section).replaceAll("\n", "<br />")}</p>`)
    .join("");

  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    '<body style="margin:0;padding:24px 12px;background:#faf8f5;color:#1A1A1A;font-family:Inter,Arial,sans-serif;">',
    '<div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #E8E4DD;border-radius:24px;padding:32px;">',
    paragraphs,
    "</div>",
    "</body>",
    "</html>",
  ].join("");
}

export function getFirstName(value: string | null | undefined, fallback = "there") {
  const normalized = value?.trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.split(/\s+/)[0] ?? fallback;
}

export function getBillingUrl() {
  return `${env.NEXT_PUBLIC_APP_URL}${ROUTES.BILLING}`;
}

export function getDashboardUrl() {
  return `${env.NEXT_PUBLIC_APP_URL}${ROUTES.DASHBOARD}`;
}

export async function sendWelcomeEmail(props: WelcomeEmailProps) {
  return sendFrithlyEmail({
    react: <WelcomeEmail {...props} />,
    subject: getWelcomeEmailSubject(props.firstName),
    text: getWelcomeEmailText(props),
    to: props.recipientEmail,
  });
}

export async function sendBriefDeliveredEmail(props: BriefDeliveredEmailProps) {
  return sendFrithlyEmail({
    react: <BriefDeliveredEmail {...props} />,
    subject: getBriefDeliveredEmailSubject(props.firstName),
    text: getBriefDeliveredEmailText(props),
    to: props.recipientEmail,
  });
}

export async function sendSampleRequestReceivedEmail(
  props: SampleRequestReceivedEmailProps,
) {
  return sendFrithlyEmail({
    react: <SampleRequestReceivedEmail {...props} />,
    subject: getSampleRequestReceivedEmailSubject(),
    text: getSampleRequestReceivedEmailText(props),
    to: props.recipientEmail,
  });
}

export async function sendSampleDeliveryEmail(props: SampleDeliveryEmailProps) {
  return sendFrithlyEmail({
    react: <SampleDeliveryEmail {...props} />,
    subject: getSampleDeliveryEmailSubject(),
    text: getSampleDeliveryEmailText(props),
    to: props.recipientEmail,
  });
}

export async function sendPaymentReceiptEmail(props: PaymentReceiptEmailProps) {
  return sendFrithlyEmail({
    react: <PaymentReceiptEmail {...props} />,
    subject: getPaymentReceiptEmailSubject(props.planName),
    text: getPaymentReceiptEmailText(props),
    to: props.recipientEmail,
  });
}

export async function sendPaymentFailedEmail(props: PaymentFailedEmailProps) {
  return sendFrithlyEmail({
    react: <PaymentFailedEmail {...props} />,
    subject: getPaymentFailedEmailSubject(),
    text: getPaymentFailedEmailText(props),
    to: props.recipientEmail,
  });
}

export async function sendSubscriptionCancelledEmail(
  props: SubscriptionCancelledEmailProps,
) {
  return sendFrithlyEmail({
    react: <SubscriptionCancelledEmail {...props} />,
    subject: getSubscriptionCancelledEmailSubject(),
    text: getSubscriptionCancelledEmailText(props),
    to: props.recipientEmail,
  });
}

export async function sendSupportRequestEmail(props: SupportRequestEmailProps) {
  const text = [
    "New Frithly support request",
    "",
    `Customer: ${props.customerName}`,
    `Email: ${props.customerEmail}`,
    `Company: ${props.companyName ?? "Not provided"}`,
    `Subject: ${props.subject}`,
    "",
    props.message,
  ].join("\n");

  return sendFrithlyEmail({
    react: <SupportRequestEmail {...props} />,
    replyTo: props.customerEmail,
    subject: `Support request: ${props.subject}`,
    text,
    to: SUPPORT_EMAIL,
  });
}

export async function sendSampleRequestAlertEmail(props: SampleRequestAlertEmailProps) {
  const text = [
    "New sample request",
    "",
    `Name: ${props.fullName}`,
    `Email: ${props.email}`,
    `Company: ${props.company ?? "Not provided"}`,
    `Industry: ${props.industry ?? "Not provided"}`,
    `Target role: ${props.targetRole ?? "Not provided"}`,
    `Company size: ${props.companySize ?? "Not provided"}`,
    `Geography: ${props.geography ?? "Not provided"}`,
    "",
    props.frustration,
  ].join("\n");

  return sendFrithlyEmail({
    react: <SampleRequestAlertEmail {...props} />,
    replyTo: props.email,
    subject: `Sample request: ${props.fullName}`,
    text,
    to: SUPPORT_EMAIL,
  });
}

export function buildPaymentReceiptProps(params: {
  amount: number;
  currency: string;
  firstName: string;
  invoiceUrl?: string | null;
  paidAt: string;
  planId?: PlanId | null;
  recipientEmail: string;
}) {
  return {
    amountLabel: formatCurrency(params.amount / 100, params.currency),
    firstName: params.firstName,
    invoiceUrl: params.invoiceUrl ?? null,
    paidAt: params.paidAt,
    planName: planNameFromId(params.planId),
    recipientEmail: params.recipientEmail,
  } satisfies PaymentReceiptEmailProps;
}
