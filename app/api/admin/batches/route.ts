import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildBatchPreview,
  getVerifiedEmailCount,
  parseBatchLeads,
} from "@/lib/admin/batch-builder";
import { isAdminEmail } from "@/lib/auth/admin-access";
import { ROUTES } from "@/lib/constants";
import { resend } from "@/lib/resend/client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatLongDate } from "@/lib/utils";
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
  const subject = `Your Frithly brief is ready, ${getFirstName(params.customerName)}`;
  const text = [
    `Hey ${getFirstName(params.customerName)},`,
    "",
    "Your Monday brief is ready.",
    "",
    `${params.leadCount} hyper-researched leads, fully briefed, with personalized openers ready to send.`,
    "",
    `View your brief: ${batchUrl}`,
    "",
    `Quick stats:`,
    `- ${params.verifiedEmails} verified emails`,
    `- Delivery date: ${formatLongDate(params.deliveryDate)}`,
    "",
    "Have a great week of meetings.",
    "",
    "Frithly",
  ].join("\n");
  const html = `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1A1A1A;">
      <h1 style="font-size: 28px; margin-bottom: 16px;">Your Frithly brief is ready</h1>
      <p style="font-size: 16px; line-height: 1.7;">Hey ${getFirstName(params.customerName)},</p>
      <p style="font-size: 16px; line-height: 1.7;">
        ${params.leadCount} hyper-researched leads, fully briefed, with personalized openers ready to send.
      </p>
      <p style="font-size: 16px; line-height: 1.7;">
        Delivery date: <strong>${formatLongDate(params.deliveryDate)}</strong><br />
        Verified emails: <strong>${params.verifiedEmails}</strong>
      </p>
      <p style="margin: 32px 0;">
        <a
          href="${batchUrl}"
          style="display: inline-block; background: #D4623A; color: white; text-decoration: none; padding: 14px 20px; border-radius: 12px; font-weight: 600;"
        >
          View your brief
        </a>
      </p>
      <p style="font-size: 16px; line-height: 1.7;">Have a great week of meetings.</p>
      <p style="font-size: 16px; line-height: 1.7;">Frithly</p>
    </div>
  `;

  return resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    html,
    replyTo: env.RESEND_REPLY_TO,
    subject,
    text,
    to: params.customerEmail,
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

  if (!isAdminEmail(email)) {
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
