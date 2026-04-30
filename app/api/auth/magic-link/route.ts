import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Database } from "@/types/database.types";
import { env } from "@/lib/utils/env";

const magicLinkSchema = z.object({
  email: z.string().email(),
  nextPath: z.string().optional(),
});

function isSafeNextPath(value: string | undefined) {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

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
  const nextPath = parsed.data.nextPath?.trim();

  const authClient = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const emailRedirectUrl = new URL("/verify", env.NEXT_PUBLIC_APP_URL);

  if (isSafeNextPath(nextPath)) {
    emailRedirectUrl.searchParams.set("next", nextPath!);
  }

  const { error } = await authClient.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: emailRedirectUrl.toString(),
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
