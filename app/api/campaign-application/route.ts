import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getFirstName,
  sendCampaignApplicationAlertEmail,
  sendCampaignApplicationReceivedEmail,
} from "@/lib/resend/send";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SUPPORT_EMAIL } from "@/lib/constants";

const campaignApplicationSchema = z.object({
  averageClientValue: z.number().min(500),
  cities: z.array(z.string().trim().min(1)).default([]),
  company: z.string().trim().min(2),
  companySize: z.string().trim().min(1),
  countries: z.array(z.string().trim().min(1)).min(1),
  currency: z.enum(["EUR", "GBP", "USD"]),
  currentChallenges: z.string().trim().min(20),
  email: z.string().trim().email(),
  founderConfidenceMin: z.number().min(0.5).max(0.95),
  fullName: z.string().trim().min(2),
  industry: z.string().trim().min(2),
  leadGoal: z.number().int().min(10).max(500),
  linkedinProfile: z.string().trim().min(3),
  minimumScore: z.number().int().min(50).max(90),
  outboundMaturity: z.enum(["manual", "none", "structured", "team"]),
  preferredContactMethod: z.enum(["email", "whatsapp", "linkedin", "telegram"]),
  requiredContactability: z.enum(["premium", "strong"]),
  role: z.string().trim().optional(),
  services: z.array(z.string().trim().min(1)).default([]),
  successDefinition: z.string().trim().optional(),
  telegramHandle: z.string().trim().optional(),
  targetTitles: z.array(z.string().trim().min(1)).default([]),
  whatsappNumber: z.string().trim().min(6),
  website: z.string().trim().min(3),
});

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const applicationAttempts = new Map<string, number[]>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ipAddress: string) {
  const now = Date.now();
  const recentAttempts = (applicationAttempts.get(ipAddress) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    applicationAttempts.set(ipAddress, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  applicationAttempts.set(ipAddress, recentAttempts);
  return false;
}

function normalizeOptionalValue(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeOptionalArray(values?: string[]) {
  const normalized = values?.map((value) => value.trim()).filter(Boolean) ?? [];
  return normalized.length > 0 ? normalized : null;
}

function normalizeWebsite(value?: string) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  return `https://${normalized}`;
}

function normalizeLinkedinProfile(value?: string) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  return normalized.startsWith("linkedin.com/")
    ? `https://${normalized}`
    : `https://linkedin.com/in/${normalized.replace(/^@/, "")}`;
}

function buildFallbackNotes(parsed: z.infer<typeof campaignApplicationSchema>) {
  return JSON.stringify(
    {
      averageClientValue: parsed.averageClientValue,
      cities: parsed.cities,
      countries: parsed.countries,
      currency: parsed.currency,
      founderConfidenceMin: parsed.founderConfidenceMin,
      leadGoal: parsed.leadGoal,
      linkedinProfile: normalizeLinkedinProfile(parsed.linkedinProfile),
      minimumScore: parsed.minimumScore,
      outboundMaturity: parsed.outboundMaturity,
      preferredContactMethod: parsed.preferredContactMethod,
      requiredContactability: parsed.requiredContactability,
      services: parsed.services,
      source: "campaign_application_fallback",
      successDefinition: normalizeOptionalValue(parsed.successDefinition),
      telegramHandle: normalizeOptionalValue(parsed.telegramHandle),
      targetTitles: parsed.targetTitles,
      whatsappNumber: parsed.whatsappNumber.trim(),
      website: normalizeWebsite(parsed.website),
    },
    null,
    2,
  );
}

async function insertCampaignApplicationRecord(parsed: z.infer<typeof campaignApplicationSchema>) {
  const adminClient = createSupabaseAdminClient();

  const insertPayload = {
    average_client_value: parsed.averageClientValue,
    cities: normalizeOptionalArray(parsed.cities),
    company: parsed.company.trim(),
    company_size: parsed.companySize.trim(),
    countries: parsed.countries.map((country) => country.trim()),
    currency: parsed.currency,
    current_challenges: parsed.currentChallenges.trim(),
    email: parsed.email.trim().toLowerCase(),
    founder_confidence_min: parsed.founderConfidenceMin,
    full_name: parsed.fullName.trim(),
    industry: parsed.industry.trim(),
    lead_goal: parsed.leadGoal,
    linkedin_profile: normalizeLinkedinProfile(parsed.linkedinProfile),
    minimum_score: parsed.minimumScore,
    outbound_maturity: parsed.outboundMaturity,
    preferred_contact_method: parsed.preferredContactMethod,
    required_contactability: parsed.requiredContactability,
    role: normalizeOptionalValue(parsed.role),
    services: normalizeOptionalArray(parsed.services),
    success_definition: normalizeOptionalValue(parsed.successDefinition),
    telegram_handle: normalizeOptionalValue(parsed.telegramHandle),
    target_titles: normalizeOptionalArray(parsed.targetTitles),
    whatsapp_number: parsed.whatsappNumber.trim(),
    website: normalizeWebsite(parsed.website),
  };

  try {
    const { data, error } = await adminClient
      .from("campaign_applications")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to save campaign application.");
    }

    return { id: data.id, storage: "campaign_applications" as const };
  } catch (error) {
    const { data, error: fallbackError } = await adminClient
      .from("sample_requests")
      .insert({
        company: parsed.company.trim(),
        company_size: parsed.companySize.trim(),
        email: parsed.email.trim().toLowerCase(),
        frustration: parsed.currentChallenges.trim(),
        full_name: parsed.fullName.trim(),
        geography: parsed.countries.concat(parsed.cities).join(", "),
        industry: parsed.industry.trim(),
        notes: buildFallbackNotes(parsed),
        target_role: parsed.targetTitles.join(", "),
      })
      .select("id")
      .single();

    if (fallbackError || !data) {
      throw error;
    }

    return { id: data.id, storage: "sample_requests_fallback" as const };
  }
}

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);

  if (isRateLimited(ipAddress)) {
    return NextResponse.json(
      {
        error: "Too many applications from this IP. Please try again in an hour.",
      },
      { status: 429 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "We couldn't read that request. Please refresh and try again.",
      },
      { status: 400 },
    );
  }

  const parsed = campaignApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Please provide your team details, ICP, lead goal, current challenges, and a realistic client value.",
      },
      { status: 400 },
    );
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const fullName = parsed.data.fullName.trim();

  try {
    const savedApplication = await insertCampaignApplicationRecord(parsed.data);
    const firstName = getFirstName(fullName);

    const geographyLabel = parsed.data.countries.concat(parsed.data.cities).join(", ");
    const emailResults = await Promise.allSettled([
      sendCampaignApplicationReceivedEmail({
        firstName,
        recipientEmail: normalizedEmail,
      }),
      sendCampaignApplicationAlertEmail({
        averageClientValueLabel: `${parsed.data.currency} ${parsed.data.averageClientValue.toLocaleString("en-GB")}`,
        company: parsed.data.company.trim(),
        companySize: parsed.data.companySize.trim(),
        currentChallenges: parsed.data.currentChallenges.trim(),
        email: normalizedEmail,
        founderConfidenceMin: parsed.data.founderConfidenceMin,
        fullName,
        geography: geographyLabel || "Not provided",
        industry: parsed.data.industry.trim(),
        leadGoal: parsed.data.leadGoal,
        linkedinProfile: normalizeLinkedinProfile(parsed.data.linkedinProfile),
        minimumScore: parsed.data.minimumScore,
        outboundMaturity: parsed.data.outboundMaturity,
        preferredContactMethod: parsed.data.preferredContactMethod,
        recipientEmail: SUPPORT_EMAIL,
        requiredContactability: parsed.data.requiredContactability,
        role: normalizeOptionalValue(parsed.data.role),
        services: parsed.data.services,
        storage: savedApplication.storage,
        successDefinition: normalizeOptionalValue(parsed.data.successDefinition),
        telegramHandle: normalizeOptionalValue(parsed.data.telegramHandle),
        targetTitles: parsed.data.targetTitles,
        whatsappNumber: parsed.data.whatsappNumber.trim(),
        website: normalizeWebsite(parsed.data.website),
      }),
    ]);

    emailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          index === 0
            ? "Campaign application confirmation email failed"
            : "Internal campaign application alert failed",
          result.reason,
        );
      }
    });

    return NextResponse.json({
      applicationId: savedApplication.id,
      message: "Campaign application received.",
      success: true,
      storage: savedApplication.storage,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Campaign application submission failed", {
      email: normalizedEmail,
      error,
    });

    return NextResponse.json(
      {
        error: "We couldn't submit your application right now. Please try again in a minute.",
      },
      { status: 500 },
    );
  }
}
