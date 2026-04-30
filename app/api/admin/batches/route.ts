import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildBatchPreview,
  getVerifiedEmailCount,
  parseBatchLeads,
} from "@/lib/admin/batch-builder";
import { getUserRoleByEmail } from "@/lib/auth/admin-access";
import { ROUTES } from "@/lib/constants";
import { sendBriefDeliveredEmail } from "@/lib/resend/send";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/utils/env";

const createBatchSchema = z.object({
  action: z.enum(["preview", "draft", "publish"]),
  customerId: z.string().uuid(),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  leads: z.string().min(1),
  notes: z.string().max(5000).optional(),
});

function getFirstName(fullName: string | null) {
  const normalizedName = fullName?.trim();

  if (!normalizedName) {
    return "there";
  }

  return normalizedName.split(/\s+/)[0] ?? "there";
}

async function sendBatchNotificationEmail(params: {
  batchId: string;
  customerEmail: string;
  customerName: string | null;
  deliveryDate: string;
  leadCount: number;
  verifiedEmails: number;
}) {
  const batchUrl = `${env.NEXT_PUBLIC_APP_URL}${ROUTES.BRIEFS}/${params.batchId}`;
  return sendBriefDeliveredEmail({
    batchUrl,
    firstName: getFirstName(params.customerName),
    founderName: "Frithly",
    highConfidenceLeadCount: Math.min(params.leadCount, 12),
    leadCount: params.leadCount,
    recentActivityLeadCount: Math.min(params.leadCount, 5),
    recipientEmail: params.customerEmail,
    verifiedEmails: params.verifiedEmails,
  });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.trim().toLowerCase();

  if (!user || !email) {
    return NextResponse.json({ error: "You must be signed in as an admin." }, { status: 401 });
  }

  if ((await getUserRoleByEmail(email)) !== "admin") {
    return NextResponse.json({ error: "You are not allowed to create batches." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createBatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Please review the batch inputs and try again.",
      },
      { status: 400 },
    );
  }

  let parsedLeads;

  try {
    parsedLeads = parseBatchLeads(parsed.data.leads);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "We couldn't parse the lead payload.",
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
      {
        error: "We couldn't find that customer account anymore.",
      },
      { status: 404 },
    );
  }

  const preview = buildBatchPreview(parsed.data.deliveryDate, parsedLeads);

  if (parsed.data.action === "preview") {
    return NextResponse.json({
      customer: {
        email: customer.email,
        id: customer.id,
        name: customer.company_name?.trim() || customer.full_name?.trim() || customer.email,
      },
      preview,
      success: true,
    });
  }

  const { data: activeIcp } = await adminClient
    .from("icps")
    .select("id")
    .eq("customer_id", customer.id)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const batchStatus = parsed.data.action === "draft" ? "draft" : "delivered";
  const deliveredAt = parsed.data.action === "publish" ? new Date().toISOString() : null;
  const verifiedEmails = getVerifiedEmailCount(parsedLeads);
  const { data: batch, error: batchError } = await adminClient
    .from("batches")
    .insert({
      customer_id: customer.id,
      delivered_at: deliveredAt,
      delivery_date: parsed.data.deliveryDate,
      icp_id: activeIcp?.id ?? null,
      notes: parsed.data.notes?.trim() || null,
      status: batchStatus,
      total_leads: parsedLeads.length,
      verified_emails: verifiedEmails,
    })
    .select("id")
    .single();

  if (batchError || !batch) {
    return NextResponse.json(
      {
        error: "We couldn't create the batch record. Please try again.",
      },
      { status: 500 },
    );
  }

  const { error: leadInsertError } = await adminClient.from("leads").insert(
    parsedLeads.map((lead) => ({
      ...lead,
      batch_id: batch.id,
    })),
  );

  if (leadInsertError) {
    await adminClient.from("batches").delete().eq("id", batch.id);

    return NextResponse.json(
      {
        error: "We couldn't save the leads for this batch. Nothing was published.",
      },
      { status: 500 },
    );
  }

  let warning: string | null = null;

  if (parsed.data.action === "publish") {
    try {
      await sendBatchNotificationEmail({
        batchId: batch.id,
        customerEmail: customer.email,
        customerName: customer.full_name ?? customer.company_name,
        deliveryDate: parsed.data.deliveryDate,
        leadCount: parsedLeads.length,
        verifiedEmails,
      });
    } catch (error) {
      console.error("Batch publish email failed", {
        batchId: batch.id,
        customerId: customer.id,
        email: customer.email,
        error,
      });

      warning = "The batch was saved, but the email notification could not be sent.";
    }
  }

  return NextResponse.json({
    batchId: batch.id,
    customer: {
      email: customer.email,
      id: customer.id,
      name: customer.company_name?.trim() || customer.full_name?.trim() || customer.email,
    },
    preview,
    success: true,
    warning,
  });
}
