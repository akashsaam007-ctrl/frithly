import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SUPPORT_EMAIL } from "@/lib/constants";
import { sendSupportRequestEmail } from "@/lib/resend/send";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const helpRequestSchema = z.object({
  message: z.string().trim().min(10).max(5000),
  subject: z.string().trim().min(3).max(150),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json(
      {
        error: "You must be signed in to contact support.",
      },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "We couldn't read that support request. Please try again.",
      },
      { status: 400 },
    );
  }

  const parsed = helpRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Please check your support request and try again.",
      },
      { status: 400 },
    );
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  const { data: customer } = await supabase
    .from("customers")
    .select("company_name, full_name")
    .eq("email", normalizedEmail)
    .maybeSingle();

  try {
    await sendSupportRequestEmail({
      companyName: customer?.company_name ?? null,
      customerEmail: normalizedEmail,
      customerName: customer?.full_name?.trim() || normalizedEmail,
      message: parsed.data.message.trim(),
      recipientEmail: SUPPORT_EMAIL,
      subject: parsed.data.subject.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Support request delivery failed", {
      email: normalizedEmail,
      error,
    });

    return NextResponse.json(
      {
        error: "We couldn't send your support request right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
