import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getFirstName,
  sendSampleRequestAlertEmail,
  sendSampleRequestReceivedEmail,
} from "@/lib/resend/send";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SUPPORT_EMAIL } from "@/lib/constants";

const sampleRequestSchema = z.object({
  company: z.string().trim().optional(),
  companySize: z.string().trim().optional(),
  email: z.string().email(),
  frustration: z.string().trim().min(10),
  fullName: z.string().trim().min(2),
  geography: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  targetRole: z.string().trim().optional(),
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
          "Please provide your name, work email, and a short description of your current lead-sourcing frustration.",
      },
      { status: 400 },
    );
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const fullName = parsed.data.fullName.trim();
  const adminClient = createSupabaseAdminClient();

  try {
    const { data: sampleRequest, error: insertError } = await adminClient
      .from("sample_requests")
      .insert({
        company: normalizeOptionalValue(parsed.data.company),
        company_size: normalizeOptionalValue(parsed.data.companySize),
        email: normalizedEmail,
        frustration: parsed.data.frustration.trim(),
        full_name: fullName,
        geography: normalizeOptionalValue(parsed.data.geography),
        industry: normalizeOptionalValue(parsed.data.industry),
        target_role: normalizeOptionalValue(parsed.data.targetRole),
      })
      .select("id")
      .single();

    if (insertError || !sampleRequest) {
      throw new Error(insertError?.message ?? "Unable to save sample request.");
    }

    const firstName = getFirstName(fullName);
    const emailResults = await Promise.allSettled([
      sendSampleRequestReceivedEmail({
        firstName,
        recipientEmail: normalizedEmail,
      }),
      sendSampleRequestAlertEmail({
        company: normalizeOptionalValue(parsed.data.company),
        companySize: normalizeOptionalValue(parsed.data.companySize),
        email: normalizedEmail,
        frustration: parsed.data.frustration.trim(),
        fullName,
        geography: normalizeOptionalValue(parsed.data.geography),
        industry: normalizeOptionalValue(parsed.data.industry),
        recipientEmail: SUPPORT_EMAIL,
        targetRole: normalizeOptionalValue(parsed.data.targetRole),
      }),
    ]);

    emailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(index === 0 ? "Sample request confirmation email failed" : "Internal sample request alert failed", result.reason);
      }
    });

    return NextResponse.json({
      message: "Sample request received.",
      requestId: sampleRequest.id,
      success: true,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Sample request submission failed", {
      email: normalizedEmail,
      error,
    });

    return NextResponse.json(
      {
        error: "We couldn't submit your sample request right now. Please try again in a minute.",
      },
      { status: 500 },
    );
  }
}
