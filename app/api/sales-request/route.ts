import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getFirstName,
  sendSalesInquiryAlertEmail,
  sendSalesInquiryReceivedEmail,
} from "@/lib/resend/send";
import { SUPPORT_EMAIL } from "@/lib/constants";

const salesRequestSchema = z.object({
  company: z.string().trim().min(2),
  companySize: z.string().trim().optional(),
  email: z.string().trim().email(),
  fullName: z.string().trim().min(2),
  message: z.string().trim().min(20).max(5000),
  primaryNeed: z.string().trim().min(2),
  role: z.string().trim().optional(),
  website: z.string().trim().optional(),
});

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const salesRequestAttempts = new Map<string, number[]>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ipAddress: string) {
  const now = Date.now();
  const recentAttempts = (salesRequestAttempts.get(ipAddress) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    salesRequestAttempts.set(ipAddress, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  salesRequestAttempts.set(ipAddress, recentAttempts);
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
        error: "Too many sales requests from this IP. Please try again in an hour.",
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

  const parsed = salesRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please provide your name, work email, company, and a short note about what you need.",
      },
      { status: 400 },
    );
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const fullName = parsed.data.fullName.trim();

  try {
    const firstName = getFirstName(fullName);
    const emailResults = await Promise.allSettled([
      sendSalesInquiryReceivedEmail({
        firstName,
        recipientEmail: normalizedEmail,
      }),
      sendSalesInquiryAlertEmail({
        company: parsed.data.company.trim(),
        companySize: normalizeOptionalValue(parsed.data.companySize),
        email: normalizedEmail,
        fullName,
        message: parsed.data.message.trim(),
        primaryNeed: parsed.data.primaryNeed.trim(),
        recipientEmail: SUPPORT_EMAIL,
        role: normalizeOptionalValue(parsed.data.role),
        website: normalizeOptionalValue(parsed.data.website),
      }),
    ]);

    emailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          index === 0 ? "Sales inquiry confirmation email failed" : "Internal sales inquiry alert failed",
          result.reason,
        );
      }
    });

    return NextResponse.json({
      message: "Sales inquiry received.",
      success: true,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Sales inquiry submission failed", {
      email: normalizedEmail,
      error,
    });

    return NextResponse.json(
      {
        error: "We couldn't submit your details right now. Please try again in a minute.",
      },
      { status: 500 },
    );
  }
}
