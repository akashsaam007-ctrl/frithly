import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const icpSchema = z
  .object({
    brandVoice: z.enum(["casual", "professional", "direct"]),
    companySizeMax: z.number().int().positive().nullable(),
    companySizeMin: z.number().int().positive().nullable(),
    exclusions: z.string(),
    geographies: z.string(),
    industries: z.string(),
    productDescription: z.string().min(10),
    signals: z.string(),
    titles: z.string(),
  })
  .refine(
    (value) =>
      value.companySizeMin === null ||
      value.companySizeMax === null ||
      value.companySizeMin <= value.companySizeMax,
    {
      message: "Minimum company size cannot be greater than maximum company size.",
      path: ["companySizeMin"],
    },
  );

function splitCsv(value: string) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatTimestampLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "You must be signed in to update your ICP." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = icpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Please review your ICP inputs and try again.",
      },
      { status: 400 },
    );
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  const adminClient = createSupabaseAdminClient();
  const { data: customer, error: customerError } = await adminClient
    .from("customers")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (customerError || !customer) {
    return NextResponse.json(
      {
        error: "We couldn't identify your customer record right now.",
      },
      { status: 500 },
    );
  }

  const { data: existingIcp, error: existingIcpError } = await adminClient
    .from("icps")
    .select("id")
    .eq("customer_id", customer.id)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingIcpError) {
    return NextResponse.json(
      {
        error: "We couldn't load your current ICP. Please try again.",
      },
      { status: 500 },
    );
  }

  const payload = {
    brand_voice: parsed.data.brandVoice,
    company_size_max: parsed.data.companySizeMax,
    company_size_min: parsed.data.companySizeMin,
    customer_id: customer.id,
    exclusions: splitCsv(parsed.data.exclusions),
    geographies: splitCsv(parsed.data.geographies),
    is_active: true,
    product_description: parsed.data.productDescription.trim(),
    signals: splitCsv(parsed.data.signals),
    target_industries: splitCsv(parsed.data.industries),
    target_titles: splitCsv(parsed.data.titles),
  };

  const { data: savedIcp, error: saveError } = existingIcp
    ? await adminClient
        .from("icps")
        .update(payload)
        .eq("id", existingIcp.id)
        .select("updated_at")
        .single()
    : await adminClient
        .from("icps")
        .insert(payload)
        .select("updated_at")
        .single();

  if (saveError || !savedIcp?.updated_at) {
    return NextResponse.json(
      {
        error: "We couldn't save your ICP changes. Please try again.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    updatedAtLabel: formatTimestampLabel(savedIcp.updated_at),
  });
}
