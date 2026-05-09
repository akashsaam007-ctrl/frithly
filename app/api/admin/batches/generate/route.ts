import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserRoleByEmail } from "@/lib/auth/admin-access";
import { generateLeadBatchFromBackendCampaign } from "@/lib/backend-api/campaign-generation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const generateBatchSchema = z.object({
  customerId: z.string().uuid(),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  minMatchPercent: z.number().int().min(40).max(100).default(60),
  queryBudget: z.number().int().min(20).max(500).default(120),
  requestedLeadCount: z.number().int().min(1).max(250).default(50),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.trim().toLowerCase();

  if (!user || !email) {
    return NextResponse.json(
      { error: "You must be signed in as an admin." },
      { status: 401 },
    );
  }

  if ((await getUserRoleByEmail(email)) !== "admin") {
    return NextResponse.json(
      { error: "You are not allowed to generate leads." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const parsed = generateBatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          "Please review the generation inputs and try again.",
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
      { error: "We couldn't find that customer account anymore." },
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
          "This customer does not have an active ICP yet. Save their ICP before generating leads.",
      },
      { status: 404 },
    );
  }

  const { data: existingBatches, error: batchLookupError } = await adminClient
    .from("batches")
    .select("id")
    .eq("customer_id", customer.id);

  if (batchLookupError) {
    return NextResponse.json(
      {
        error: "We couldn't load this customer's prior batches right now.",
      },
      { status: 500 },
    );
  }

  const batchIds = (existingBatches ?? []).map((batch) => batch.id);
  const { data: existingLeads, error: leadLookupError } =
    batchIds.length > 0
      ? await adminClient
          .from("leads")
          .select("company_name")
          .in("batch_id", batchIds)
      : { data: [], error: null };

  if (leadLookupError) {
    return NextResponse.json(
      {
        error: "We couldn't load this customer's previously delivered leads right now.",
      },
      { status: 500 },
    );
  }

  try {
    const batch = await generateLeadBatchFromBackendCampaign({
      customer: {
        email: customer.email,
        id: customer.id,
        name: customer.company_name?.trim() || customer.full_name?.trim() || customer.email,
      },
      deliveryDate: parsed.data.deliveryDate,
      excludedCompanyNames: (existingLeads ?? []).map((lead) => lead.company_name),
      icp: activeIcp,
      minMatchPercent: parsed.data.minMatchPercent,
      queryBudget: parsed.data.queryBudget,
      requestedLeadCount: parsed.data.requestedLeadCount,
    });

    return NextResponse.json({
      customer: {
        email: customer.email,
        id: customer.id,
        name: customer.company_name?.trim() || customer.full_name?.trim() || customer.email,
      },
      diagnostics: batch.diagnostics,
      leads: batch.leads,
      leadsJson: JSON.stringify(batch.leads, null, 2),
      logs: batch.logs,
      preview: batch.preview,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "We couldn't generate leads from the current ICP.",
      },
      { status: 500 },
    );
  }
}
