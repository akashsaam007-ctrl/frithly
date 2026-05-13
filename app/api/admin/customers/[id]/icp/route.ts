import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserRoleByEmail } from "@/lib/auth/admin-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateIcpSchema = z
  .object({
    brandVoice: z.enum(["casual", "direct", "professional"]).default("professional"),
    companySizeMax: z.number().int().positive().nullable(),
    companySizeMin: z.number().int().positive().nullable(),
    exclusions: z.array(z.string().trim().min(1)).max(40).default([]),
    geographies: z.array(z.string().trim().min(1)).max(40).default([]),
    name: z.string().trim().max(120).nullable(),
    productDescription: z.string().trim().min(20).max(5000),
    signals: z.array(z.string().trim().min(1)).max(40).default([]),
    targetIndustries: z.array(z.string().trim().min(1)).max(40).default([]),
    targetTitles: z.array(z.string().trim().min(1)).max(40).default([]),
  })
  .refine(
    (value) =>
      !value.companySizeMin ||
      !value.companySizeMax ||
      value.companySizeMax >= value.companySizeMin,
    {
      message: "Company size max must be greater than or equal to company size min.",
      path: ["companySizeMax"],
    },
  );

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const viewerEmail = user?.email?.trim().toLowerCase();

  if (!user || !viewerEmail) {
    return NextResponse.json({ error: "You must be signed in as an admin." }, { status: 401 });
  }

  if ((await getUserRoleByEmail(viewerEmail)) !== "admin") {
    return NextResponse.json(
      { error: "You are not allowed to manage customer ICPs." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const parsed = updateIcpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          "Review the ICP inputs and try saving again.",
      },
      { status: 400 },
    );
  }

  const { id } = await params;
  const adminClient = createSupabaseAdminClient();
  const { data: targetCustomer, error: customerError } = await adminClient
    .from("customers")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (customerError) {
    return NextResponse.json(
      { error: "We couldn't load that customer workspace right now." },
      { status: 500 },
    );
  }

  if (!targetCustomer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const { data: activeIcp, error: activeIcpError } = await adminClient
    .from("icps")
    .select("*")
    .eq("customer_id", targetCustomer.id)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeIcpError) {
    return NextResponse.json(
      { error: "We couldn't load the active ICP for this customer right now." },
      { status: 500 },
    );
  }

  const payload = {
    brand_voice: parsed.data.brandVoice,
    company_size_max: parsed.data.companySizeMax,
    company_size_min: parsed.data.companySizeMin,
    exclusions: parsed.data.exclusions,
    geographies: parsed.data.geographies,
    is_active: true,
    name: parsed.data.name,
    product_description: parsed.data.productDescription,
    signals: parsed.data.signals,
    target_industries: parsed.data.targetIndustries,
    target_titles: parsed.data.targetTitles,
    updated_at: now,
  };

  if (!activeIcp) {
    const { error: deactivateError } = await adminClient
      .from("icps")
      .update({ is_active: false, updated_at: now })
      .eq("customer_id", targetCustomer.id);

    if (deactivateError) {
      return NextResponse.json(
        { error: "We couldn't prepare the customer ICP history for a new active brief." },
        { status: 500 },
      );
    }

    const { data: insertedIcp, error: insertError } = await adminClient
      .from("icps")
      .insert({
        ...payload,
        created_at: now,
        customer_id: targetCustomer.id,
      })
      .select("*")
      .single();

    if (insertError || !insertedIcp) {
      return NextResponse.json(
        { error: "We couldn't create the active ICP right now." },
        { status: 500 },
      );
    }

    return NextResponse.json({ icp: insertedIcp, success: true });
  }

  const { data: updatedIcp, error: updateError } = await adminClient
    .from("icps")
    .update(payload)
    .eq("id", activeIcp.id)
    .select("*")
    .single();

  if (updateError || !updatedIcp) {
    return NextResponse.json(
      { error: "We couldn't save the active ICP right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({ icp: updatedIcp, success: true });
}
