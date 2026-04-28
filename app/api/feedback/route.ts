import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const feedbackSchema = z
  .object({
    batchId: z.string().uuid().optional(),
    comment: z.string().trim().min(1).max(2000).optional(),
    leadId: z.string().uuid().optional(),
    rating: z.enum(["positive", "negative"]).optional(),
  })
  .refine((value) => Boolean(value.leadId || value.comment), {
    message: "Please include a lead selection or feedback comment.",
    path: ["leadId"],
  });

async function getCurrentCustomer() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { customer: null, supabase };
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  const { data: customer } = await supabase
    .from("customers")
    .select("id, email")
    .eq("email", normalizedEmail)
    .maybeSingle();

  return { customer, supabase };
}

export async function POST(request: Request) {
  const { customer, supabase } = await getCurrentCustomer();

  if (!customer) {
    return NextResponse.json(
      {
        error: "You must be signed in to submit feedback.",
      },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = feedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Please review your feedback and try again.",
      },
      { status: 400 },
    );
  }

  const adminClient = createSupabaseAdminClient();
  const { leadId, rating } = parsed.data;
  const comment = parsed.data.comment?.trim();

  if (leadId) {
    const { data: visibleLead, error: visibleLeadError } = await supabase
      .from("leads")
      .select("id")
      .eq("id", leadId)
      .maybeSingle();

    if (visibleLeadError || !visibleLead) {
      return NextResponse.json(
        {
          error: "That lead isn't available in your account.",
        },
        { status: 404 },
      );
    }

    const { data: existingFeedback } = await adminClient
      .from("feedback")
      .select("id")
      .eq("customer_id", customer.id)
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const payload = {
      comment: comment ?? null,
      customer_id: customer.id,
      lead_id: leadId,
      rating: rating ?? null,
    };

    const { error: saveError } = existingFeedback
      ? await adminClient.from("feedback").update(payload).eq("id", existingFeedback.id)
      : await adminClient.from("feedback").insert(payload);

    if (saveError) {
      return NextResponse.json(
        {
          error: "We couldn't save your lead feedback. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  }

  if (parsed.data.batchId) {
    const { data: visibleBatch, error: visibleBatchError } = await supabase
      .from("batches")
      .select("id")
      .eq("id", parsed.data.batchId)
      .maybeSingle();

    if (visibleBatchError || !visibleBatch) {
      return NextResponse.json(
        {
          error: "That batch isn't available in your account.",
        },
        { status: 404 },
      );
    }
  }

  const { error: insertError } = await adminClient.from("feedback").insert({
    comment: parsed.data.batchId ? `[Batch ${parsed.data.batchId}] ${comment}` : comment,
    customer_id: customer.id,
    lead_id: null,
    rating: rating ?? null,
  });

  if (insertError) {
    return NextResponse.json(
      {
        error: "We couldn't save your feedback note. Please try again.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
