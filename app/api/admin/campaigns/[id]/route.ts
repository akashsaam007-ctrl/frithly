import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserRoleByEmail } from "@/lib/auth/admin-access";
import { backendApi, BackendApiError } from "@/lib/backend-api/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const campaignIdSchema = z.coerce.number().int().positive();

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.trim().toLowerCase();

  if (!user || !email) {
    return {
      error: NextResponse.json({ error: "You must be signed in as an admin." }, { status: 401 }),
      ok: false as const,
    };
  }

  if ((await getUserRoleByEmail(email)) !== "admin") {
    return {
      error: NextResponse.json({ error: "You are not allowed to inspect lead campaigns." }, { status: 403 }),
      ok: false as const,
    };
  }

  return { ok: true as const };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const adminGate = await requireAdmin();

  if (!adminGate.ok) {
    return adminGate.error;
  }

  const params = await context.params;
  const parsedId = campaignIdSchema.safeParse(params.id);

  if (!parsedId.success) {
    return NextResponse.json({ error: "Campaign id is invalid." }, { status: 400 });
  }

  try {
    const detail = await backendApi.campaigns.get(parsedId.data);
    return NextResponse.json({ detail });
  } catch (error) {
    const status = error instanceof BackendApiError ? error.status : 502;
    const message =
      error instanceof BackendApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "We couldn't load that campaign right now.";

    return NextResponse.json({ error: message }, { status });
  }
}
