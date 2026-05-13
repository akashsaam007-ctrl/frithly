import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserRoleByEmail } from "@/lib/auth/admin-access";
import { backendApi, BackendApiError } from "@/lib/backend-api/client";
import { buildBackendCampaignRequestFromIcp } from "@/lib/backend-api/campaign-generation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createCampaignSchema = z.object({
  customerId: z.string().uuid(),
  executionMode: z.enum(["background", "direct"]).default("background"),
  leadGoal: z.number().int().min(5).max(250).default(50),
  minimumScore: z.number().int().min(40).max(95).default(70),
});

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
      error: NextResponse.json({ error: "You are not allowed to manage lead campaigns." }, { status: 403 }),
      ok: false as const,
    };
  }

  return { ok: true as const };
}

export async function GET(request: Request) {
  const adminGate = await requireAdmin();

  if (!adminGate.ok) {
    return adminGate.error;
  }

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "24");

  try {
    const campaigns = await backendApi.campaigns.list(Number.isFinite(limit) ? limit : 24);
    return NextResponse.json({ campaigns });
  } catch (error) {
    const message =
      error instanceof BackendApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "We couldn't load campaign history right now.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const adminGate = await requireAdmin();

  if (!adminGate.ok) {
    return adminGate.error;
  }

  const body = await request.json();
  const parsed = createCampaignSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          "Please review the lead studio inputs and try again.",
      },
      { status: 400 },
    );
  }

  const adminClient = createSupabaseAdminClient();
  const { data: customer, error: customerError } = await adminClient
    .from("customers")
    .select("id, email, full_name, company_name")
    .eq("id", parsed.data.customerId)
    .maybeSingle();

  if (customerError || !customer) {
    return NextResponse.json(
      { error: "We couldn't find that customer workspace anymore." },
      { status: 404 },
    );
  }

  const { data: activeIcp, error: icpError } = await adminClient
    .from("icps")
    .select("*")
    .eq("customer_id", customer.id)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (icpError || !activeIcp) {
    return NextResponse.json(
      {
        error:
          "This customer doesn't have an active ICP yet. Upload the admin-managed ICP before launching discovery.",
      },
      { status: 404 },
    );
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const { notes, payload } = buildBackendCampaignRequestFromIcp(
      {
        email: customer.email,
        id: customer.id,
        name: customer.company_name?.trim() || customer.full_name?.trim() || customer.email,
      },
      activeIcp,
      today,
      parsed.data.minimumScore,
      parsed.data.leadGoal,
    );

    const created = await backendApi.campaigns.create(payload);
    const detail =
      parsed.data.executionMode === "direct"
        ? await backendApi.campaigns.run(created.campaign.id)
        : await backendApi.campaigns.launch(created.campaign.id, true);

    return NextResponse.json({
      detail,
      executionMode: parsed.data.executionMode,
      notes,
    });
  } catch (error) {
    const message =
      error instanceof BackendApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "We couldn't launch the lead campaign right now.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
