import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { BOOKING_URL, SUPPORT_EMAIL } from "@/lib/constants";
import {
  getFirstName,
  sendSampleRequestAlertEmail,
  sendSampleRequestReceivedEmail,
} from "@/lib/resend/send";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const sampleRequestSchema = z.object({
  additionalRequirements: z.string().trim().max(2000).optional().default(""),
  companySizes: z.array(z.string().trim().min(1)).min(1),
  companyWebsite: z.string().trim().min(1),
  fullName: z.string().trim().min(2),
  offerDescription: z.string().trim().min(10).max(500),
  requestType: z.literal("personalized_sample_leads"),
  targetDescription: z.string().trim().min(10).max(500),
  targetRegions: z.array(z.string().trim().min(1)).min(1),
  whatsapp: z.string().trim().max(64).optional().default(""),
  workEmail: z.string().trim().email(),
});

const sampleRequestMeetingUpdateSchema = z.object({
  meetingId: z.string().trim().max(500).nullable().optional(),
  meetingStatus: z.enum(["meeting_scheduled", "scheduled_later"]),
  meetingTime: z.string().trim().datetime().nullable().optional(),
  requestId: z.string().trim().min(1),
});

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const sampleRequestAttempts = new Map<string, number[]>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ipAddress: string) {
  const now = Date.now();
  const recentAttempts = (sampleRequestAttempts.get(ipAddress) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    sampleRequestAttempts.set(ipAddress, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  sampleRequestAttempts.set(ipAddress, recentAttempts);
  return false;
}

function normalizeOptionalValue(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function extractWebsiteLabel(website: string) {
  try {
    const hostname = new URL(website).hostname.replace(/^www\./i, "");
    return hostname || website;
  } catch {
    return website;
  }
}

function generateRequestId() {
  const year = new Date().getUTCFullYear();
  const entropy = `${Date.now()}${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
  const sequence = entropy.slice(-6);
  return `FSL-${year}-${sequence}`;
}

function buildLegacyNotes(params: {
  additionalRequirements: string;
  requestId: string;
  targetDescription: string;
}) {
  const sections = [`Request ID: ${params.requestId}`];

  if (params.targetDescription.trim()) {
    sections.push(`Targeting: ${params.targetDescription.trim()}`);
  }

  if (params.additionalRequirements.trim()) {
    sections.push(`Additional requirements: ${params.additionalRequirements.trim()}`);
  }

  return sections.join("\n");
}

function buildLegacySummary(params: {
  additionalRequirements: string;
  offerDescription: string;
  targetDescription: string;
}) {
  const sections = [
    `Offer: ${params.offerDescription.trim()}`,
    `Targeting: ${params.targetDescription.trim()}`,
  ];

  if (params.additionalRequirements.trim()) {
    sections.push(`Additional requirements: ${params.additionalRequirements.trim()}`);
  }

  return sections.join("\n\n");
}

function buildBookingUrl(params: {
  companyWebsite: string;
  email: string;
  fullName: string;
  requestId: string;
}) {
  const url = new URL(BOOKING_URL);

  url.searchParams.set("email", params.email);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("name", params.fullName);
  url.searchParams.set("a1", params.companyWebsite);
  url.searchParams.set("a2", params.requestId);

  return url.toString();
}

async function runNonBlockingTask(
  label: string,
  task: () => Promise<unknown>,
  context: Record<string, unknown>,
) {
  try {
    await task();
  } catch (error) {
    console.warn(`${label} failed`, {
      ...context,
      error,
    });
  }
}

function logHandledFallback(
  label: string,
  context: Record<string, unknown>,
  error: unknown,
) {
  console.warn(label, {
    ...context,
    error,
  });
}

async function insertSampleRequest(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  params: {
    additionalRequirements: string;
    companySizes: string[];
    fullName: string;
    normalizedEmail: string;
    normalizedWebsite: string;
    offerDescription: string;
    requestId: string;
    submittedAt: string;
    targetDescription: string;
    targetRegions: string[];
    whatsapp: string;
  },
) {
  const modernPayload = {
    company: extractWebsiteLabel(params.normalizedWebsite),
    company_size: params.companySizes.join(", "),
    company_website: params.normalizedWebsite,
    created_at: params.submittedAt,
    email: params.normalizedEmail,
    frustration: buildLegacySummary({
      additionalRequirements: params.additionalRequirements,
      offerDescription: params.offerDescription,
      targetDescription: params.targetDescription,
    }),
    full_name: params.fullName,
    geography: params.targetRegions.join(", "),
    meeting_status: "not_scheduled" as const,
    notes: null,
    request_id: params.requestId,
    request_type: "personalized_sample_leads" as const,
    source: "website_sample_request",
    status: "new" as const,
    submitted_at: params.submittedAt,
    target_role: null,
    target_regions: params.targetRegions,
    company_sizes: params.companySizes,
    offer_description: params.offerDescription.trim(),
    target_description: params.targetDescription.trim(),
    additional_requirements: normalizeOptionalValue(params.additionalRequirements),
    whatsapp: normalizeOptionalValue(params.whatsapp),
  };

  const { error: modernInsertError } = await adminClient
    .from("sample_requests")
    .insert(modernPayload);

  if (!modernInsertError) {
    return { mode: "modern" as const };
  }

  logHandledFallback("Modern sample request insert failed, retrying legacy payload", {
    requestId: params.requestId,
    sample_insert_mode: "legacy_fallback",
  }, modernInsertError);

  const legacyPayload = {
    company: extractWebsiteLabel(params.normalizedWebsite),
    company_size: params.companySizes.join(", "),
    created_at: params.submittedAt,
    email: params.normalizedEmail,
    frustration: buildLegacySummary({
      additionalRequirements: params.additionalRequirements,
      offerDescription: params.offerDescription,
      targetDescription: params.targetDescription,
    }),
    full_name: params.fullName,
    geography: params.targetRegions.join(", "),
    notes: buildLegacyNotes({
      additionalRequirements: params.additionalRequirements,
      requestId: params.requestId,
      targetDescription: params.targetDescription,
    }),
    status: "new" as const,
    target_role: null,
  };

  const { error: legacyInsertError } = await adminClient
    .from("sample_requests")
    .insert(legacyPayload);

  if (legacyInsertError) {
    throw new Error(legacyInsertError.message);
  }

  return { mode: "legacy" as const };
}

async function persistSampleRequest(
  adminClient: ReturnType<typeof createSupabaseAdminClient>,
  params: {
    additionalRequirements: string;
    companySizes: string[];
    fullName: string;
    normalizedEmail: string;
    normalizedWebsite: string;
    offerDescription: string;
    requestId: string;
    submittedAt: string;
    targetDescription: string;
    targetRegions: string[];
    whatsapp: string;
  },
) {
  try {
    return await insertSampleRequest(adminClient, params);
  } catch (error) {
    logHandledFallback("Sample request database persistence failed, continuing with email-only fallback", {
      email: params.normalizedEmail,
      requestId: params.requestId,
      sample_insert_mode: "email_only_fallback",
    }, error);

    return { mode: "email_only" as const };
  }
}

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);

  if (isRateLimited(ipAddress)) {
    return NextResponse.json(
      {
        error: "Too many sample requests from this IP. Please try again in an hour.",
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

  const parsed = sampleRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Please provide your name, work email, website, offer details, target profile, region, and company size.",
      },
      { status: 400 },
    );
  }

  const adminClient = createSupabaseAdminClient();
  const normalizedEmail = parsed.data.workEmail.trim().toLowerCase();
  const fullName = parsed.data.fullName.trim();
  const normalizedWebsite = normalizeWebsite(parsed.data.companyWebsite);
  const submittedAt = new Date().toISOString();
  let requestId = "";

  try {
    requestId = generateRequestId();

    const insertResult = await persistSampleRequest(adminClient, {
      additionalRequirements: parsed.data.additionalRequirements,
      companySizes: parsed.data.companySizes,
      fullName,
      normalizedEmail,
      normalizedWebsite,
      offerDescription: parsed.data.offerDescription,
      requestId,
      submittedAt,
      targetDescription: parsed.data.targetDescription,
      targetRegions: parsed.data.targetRegions,
      whatsapp: parsed.data.whatsapp,
    });

    const firstName = getFirstName(fullName);
    const bookingUrl = buildBookingUrl({
      companyWebsite: normalizedWebsite,
      email: normalizedEmail,
      fullName,
      requestId,
    });

    console.info("Sample request accepted", {
      email: normalizedEmail,
      insert_mode: insertResult.mode,
      requestId,
    });

    await Promise.allSettled([
      runNonBlockingTask(
        "sample request confirmation email",
        () =>
          sendSampleRequestReceivedEmail({
            bookingLink: bookingUrl,
            firstName,
            recipientEmail: normalizedEmail,
            requestId,
          }),
        { email: normalizedEmail, insert_mode: insertResult.mode, requestId },
      ),
      runNonBlockingTask(
        "sample request internal alert email",
        () =>
          sendSampleRequestAlertEmail({
            additionalRequirements: normalizeOptionalValue(parsed.data.additionalRequirements),
            companySizes: parsed.data.companySizes,
            companyWebsite: normalizedWebsite,
            email: normalizedEmail,
            fullName,
            offerDescription: parsed.data.offerDescription.trim(),
            recipientEmail: SUPPORT_EMAIL,
            requestId,
            submittedAt,
            targetDescription: parsed.data.targetDescription.trim(),
            targetRegions: parsed.data.targetRegions,
            whatsapp: normalizeOptionalValue(parsed.data.whatsapp),
          }),
        { email: normalizedEmail, insert_mode: insertResult.mode, requestId },
      ),
    ]);

    return NextResponse.json({
      bookingUrl,
      message: "Sample request received.",
      requestId,
      success: true,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Sample request submission failed", {
      email: normalizedEmail,
      error,
      requestId,
    });

    return NextResponse.json(
      {
        error: "We couldn't submit your request right now. Please try again in a minute.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "We couldn't read that scheduling update.",
      },
      { status: 400 },
    );
  }

  const parsed = sampleRequestMeetingUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Provide a valid request ID and meeting status.",
      },
      { status: 400 },
    );
  }

  const adminClient = createSupabaseAdminClient();

  try {
    const updatePayload =
      parsed.data.meetingStatus === "meeting_scheduled"
        ? {
            meeting_id: parsed.data.meetingId ?? null,
            meeting_status: "meeting_scheduled" as const,
            meeting_time: parsed.data.meetingTime ?? null,
            status: "meeting_scheduled" as const,
          }
        : {
            meeting_status: "scheduled_later" as const,
          };

    const { data, error } = await adminClient
      .from("sample_requests")
      .update(updatePayload)
      .eq("request_id", parsed.data.requestId)
      .select("id")
      .maybeSingle();

    if (!error && data) {
      return NextResponse.json({ success: true });
    }

    const { data: legacyMatch, error: legacyLookupError } = await adminClient
      .from("sample_requests")
      .select("id")
      .ilike("notes", `%${parsed.data.requestId}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (legacyLookupError) {
      throw new Error(legacyLookupError.message);
    }

    if (!legacyMatch) {
      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({ error: "Sample request not found." }, { status: 404 });
    }

    const { error: legacyUpdateError } = await adminClient
      .from("sample_requests")
      .update({
        notes:
          parsed.data.meetingStatus === "meeting_scheduled"
            ? `${parsed.data.requestId}\nMeeting scheduled${parsed.data.meetingTime ? `\nMeeting time: ${parsed.data.meetingTime}` : ""}`
            : `${parsed.data.requestId}\nScheduling deferred`,
        status:
          parsed.data.meetingStatus === "meeting_scheduled"
            ? ("meeting_scheduled" as const)
            : ("new" as const),
      })
      .eq("id", legacyMatch.id);

    if (legacyUpdateError) {
      throw new Error(legacyUpdateError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Sample request meeting update failed", {
      error,
      requestId: parsed.data.requestId,
    });

    return NextResponse.json(
      {
        error: "We couldn't update that sample request right now.",
      },
      { status: 500 },
    );
  }
}
