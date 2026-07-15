import type { ReactElement } from "react";
import { APP_NAME, PLANS, ROUTES, SUPPORT_EMAIL } from "@/lib/constants";
import { resend } from "@/lib/resend/client";
import {
  CampaignApplicationAlertEmail,
  type CampaignApplicationAlertEmailProps,
} from "@/lib/resend/templates/campaign-application-alert";
import {
  CampaignApplicationReceivedEmail,
  getCampaignApplicationReceivedEmailSubject,
  getCampaignApplicationReceivedEmailText,
  type CampaignApplicationReceivedEmailProps,
} from "@/lib/resend/templates/campaign-application-received";
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
import {
  getWeeklyDeliveryReadyEmailSubject,
  getWeeklyDeliveryReadyEmailText,
  WeeklyDeliveryReadyEmail,
  type WeeklyDeliveryReadyEmailProps,
} from "@/lib/resend/templates/weekly-delivery-ready";
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

  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const result = await resend.emails.send({
        from: `${APP_NAME} <${env.RESEND_FROM_EMAIL}>`,
        html,
        replyTo: params.replyTo ?? env.RESEND_REPLY_TO,
        subject: params.subject,
        text: params.text,
        to: params.to,
      });

      if (result.error) {
        throw new Error(`Resend email failed: ${result.error.message}`);
      }

      return result;
    } catch (error) {
      lastError = error;

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }

  throw lastError;
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

export async function sendWeeklyDeliveryReadyEmail(props: WeeklyDeliveryReadyEmailProps) {
  return sendFrithlyEmail({
    react: <WeeklyDeliveryReadyEmail {...props} />,
    subject: getWeeklyDeliveryReadyEmailSubject(props.firstName),
    text: getWeeklyDeliveryReadyEmailText(props),
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

export async function sendCampaignApplicationReceivedEmail(
  props: CampaignApplicationReceivedEmailProps,
) {
  return sendFrithlyEmail({
    react: <CampaignApplicationReceivedEmail {...props} />,
    subject: getCampaignApplicationReceivedEmailSubject(),
    text: getCampaignApplicationReceivedEmailText(props),
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

export async function sendSalesInquiryReceivedEmail(props: {
  firstName: string;
  recipientEmail: string;
}) {
  const text = [
    `Hi ${props.firstName},`,
    "",
    "Thanks for reaching out to Frithly.",
    "",
    "We received your sales inquiry and will review your details before replying from hello@frithly.com with the right next step.",
    "",
    "If we need anything else, we'll ask by email.",
    "",
    "Frithly",
  ].join("\n");

  return sendFrithlyEmail({
    react: <></>,
    subject: "We received your Frithly inquiry",
    text,
    to: props.recipientEmail,
  });
}

export async function sendSalesInquiryAlertEmail(props: {
  company: string;
  companySize?: string | null;
  email: string;
  fullName: string;
  linkedinProfile: string;
  message: string;
  primaryNeed: string;
  preferredContactMethod: "email" | "linkedin" | "telegram" | "whatsapp";
  recipientEmail: string;
  role?: string | null;
  telegramHandle?: string | null;
  whatsappNumber: string;
  website?: string | null;
}) {
  const text = [
    "New sales inquiry",
    "",
    `Name: ${props.fullName}`,
    `Email: ${props.email}`,
    `Company: ${props.company}`,
    `Role: ${props.role ?? "Not provided"}`,
    `Website: ${props.website ?? "Not provided"}`,
    `LinkedIn: ${props.linkedinProfile}`,
    `Company size: ${props.companySize ?? "Not provided"}`,
    `WhatsApp: ${props.whatsappNumber}`,
    `Preferred contact method: ${props.preferredContactMethod}`,
    `Telegram: ${props.telegramHandle ?? "Not provided"}`,
    `Primary need: ${props.primaryNeed}`,
    "",
    props.message,
  ].join("\n");

  return sendFrithlyEmail({
    react: <></>,
    replyTo: props.email,
    subject: `Sales inquiry: ${props.fullName}`,
    text,
    to: props.recipientEmail,
  });
}

export async function sendSampleRequestAlertEmail(props: SampleRequestAlertEmailProps) {
  const text = [
    "New personalized sample request",
    "",
    `Request ID: ${props.requestId}`,
    `Full name: ${props.fullName}`,
    `Work email: ${props.email}`,
    `Company website: ${props.companyWebsite}`,
    `WhatsApp: ${props.whatsapp ?? "Not provided"}`,
    `Target regions: ${props.targetRegions.join(", ")}`,
    `Company sizes: ${props.companySizes.join(", ")}`,
    `Submitted at: ${props.submittedAt}`,
    "Meeting status: not_scheduled",
    "",
    "What the company sells:",
    props.offerDescription,
    "",
    "Who they want to target:",
    props.targetDescription,
    ...(props.additionalRequirements ? ["", "Additional requirements:", props.additionalRequirements] : []),
  ].join("\n");

  return sendFrithlyEmail({
    react: <SampleRequestAlertEmail {...props} />,
    replyTo: props.email,
    subject: `New personalized sample request: ${props.fullName}`,
    text,
    to: SUPPORT_EMAIL,
  });
}

export async function sendCampaignApplicationAlertEmail(
  props: CampaignApplicationAlertEmailProps,
) {
  const text = [
    "New campaign application",
    "",
    `Name: ${props.fullName}`,
    `Email: ${props.email}`,
    `Company: ${props.company}`,
    `Role: ${props.role ?? "Not provided"}`,
    `Website: ${props.website ?? "Not provided"}`,
    `LinkedIn: ${props.linkedinProfile ?? "Not provided"}`,
    `WhatsApp: ${props.whatsappNumber}`,
    `Preferred contact method: ${props.preferredContactMethod}`,
    `Telegram: ${props.telegramHandle ?? "Not provided"}`,
    `Industry: ${props.industry}`,
    `Geography: ${props.geography}`,
    `Company size: ${props.companySize}`,
    `Lead goal: ${props.leadGoal}`,
    `Minimum score: ${props.minimumScore}`,
    `Required contactability: ${props.requiredContactability}`,
    `Founder confidence min: ${props.founderConfidenceMin}`,
    `Average client value: ${props.averageClientValueLabel}`,
    `Outbound maturity: ${props.outboundMaturity}`,
    `Target titles: ${props.targetTitles.length > 0 ? props.targetTitles.join(", ") : "Not provided"}`,
    `Services: ${props.services.length > 0 ? props.services.join(", ") : "Not provided"}`,
    `Stored in: ${props.storage}`,
    "",
    props.currentChallenges,
    ...(props.successDefinition ? ["", props.successDefinition] : []),
  ].join("\n");

  return sendFrithlyEmail({
    react: <CampaignApplicationAlertEmail {...props} />,
    replyTo: props.email,
    subject: `Campaign application: ${props.fullName}`,
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
