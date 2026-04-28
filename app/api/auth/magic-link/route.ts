import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ROUTES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";
import { env } from "@/lib/utils/env";

const magicLinkSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = magicLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please enter a valid work email address.",
      },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const adminClient = createSupabaseAdminClient();

  const { data: customer, error: customerError } = await adminClient
    .from("customers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (customerError) {
    console.error("Magic link customer lookup failed", {
      email,
      message: customerError.message,
    });

    return NextResponse.json(
      {
        error: "We couldn't verify your account right now. Please try again in a minute.",
      },
      { status: 500 },
    );
  }

  if (!customer) {
    console.warn("Magic link rejected because customer record was not found", { email });

    return NextResponse.json(
      {
        code: "account_not_found",
        error: "We don't have an account for this email.",
        redirectTo: ROUTES.SAMPLE,
      },
      { status: 404 },
    );
  }

  const authClient = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const { error } = await authClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${env.NEXT_PUBLIC_APP_URL}/verify`,
    },
  });

  if (error) {
    console.error("Supabase failed to send magic link", {
      email,
      message: error.message,
      status: error.status ?? null,
    });

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === "development"
            ? `Supabase could not send the magic link: ${error.message}`
            : "We couldn't send your magic link. Please try again.",
      },
      { status: 500 },
    );
  }

  console.log("Magic link requested successfully", { email });

  return NextResponse.json({
    success: true,
  });
}
