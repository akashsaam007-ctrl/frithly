import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getFirstName,
  sendGuideDownloadAlertEmail,
  sendGuideDownloadEmail,
} from "@/lib/resend/send";
import { env } from "@/lib/utils/env";

const guideDownloadSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  companyWebsite: z.string().trim().max(180).optional(),
  firstName: z.string().trim().min(2).max(80),
  workEmail: z.string().trim().email().max(180),
});

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const guideDownloadAttempts = new Map<string, number[]>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ipAddress: string) {
  const now = Date.now();
  const recentAttempts = (guideDownloadAttempts.get(ipAddress) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    guideDownloadAttempts.set(ipAddress, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  guideDownloadAttempts.set(ipAddress, recentAttempts);
  return false;
}

function normalizeOptionalWebsite(value?: string) {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  return `https://${normalized}`;
}

export async function POST(request: Request) {
  const ipAddress = getClientIp(request);

  if (isRateLimited(ipAddress)) {
    return NextResponse.json(
      {
        error: "Too many guide requests from this IP. Please try again in an hour.",
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
        error: "We could not read that request. Please refresh and try again.",
      },
      { status: 400 },
    );
  }

  const parsed = guideDownloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please enter your first name, work email, and company name.",
      },
      { status: 400 },
    );
  }

  const firstName = getFirstName(parsed.data.firstName);
  const workEmail = parsed.data.workEmail.trim().toLowerCase();
  const companyName = parsed.data.companyName.trim();
  const companyWebsite = normalizeOptionalWebsite(parsed.data.companyWebsite);
  const guideUrl = `${env.NEXT_PUBLIC_APP_URL}/guides/frithly-signal-based-outbound-playbook.pdf`;

  try {
    const emailResults = await Promise.allSettled([
      sendGuideDownloadEmail({
        firstName,
        guideUrl,
        recipientEmail: workEmail,
      }),
      sendGuideDownloadAlertEmail({
        companyName,
        companyWebsite,
        firstName,
        submittedAt: new Date().toISOString(),
        workEmail,
      }),
    ]);

    emailResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          index === 0 ? "Guide download email failed" : "Internal guide download alert failed",
          result.reason,
        );
      }
    });

    return NextResponse.json({
      guideUrl: "/guides/frithly-signal-based-outbound-playbook.pdf",
      message: "Guide ready.",
      success: true,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Guide download request failed", {
      email: workEmail,
      error,
    });

    return NextResponse.json(
      {
        error: "We could not prepare the guide right now. Please try again in a minute.",
      },
      { status: 500 },
    );
  }
}
