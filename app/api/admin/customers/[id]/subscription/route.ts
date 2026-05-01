import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserRoleByEmail } from "@/lib/auth/admin-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateSubscriptionSchema = z.object({
  plan: z.enum(["design_partner", "growth", "scale", "starter", "unassigned"]),
  status: z.enum(["active", "cancelled", "churned", "paused", "pending"]),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
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
      { error: "You are not allowed to change customer plans." },
      { status: 403 },
    );
  }

  const body = await request.json();
  const parsed = updateSubscriptionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Choose a valid plan and access status." },
      { status: 400 },
    );
  }

  const normalizedPlan = parsed.data.plan === "unassigned" ? null : parsed.data.plan;

  if (!normalizedPlan && (parsed.data.status === "active" || parsed.data.status === "pending")) {
    return NextResponse.json(
      { error: "Choose a plan before setting this customer to active or pending." },
      { status: 400 },
    );
  }

  const { id } = await params;
  const adminClient = createSupabaseAdminClient();
  const { data: targetCustomer, error: targetCustomerError } = await adminClient
    .from("customers")
    .select("id, plan, status")
    .eq("id", id)
    .maybeSingle();

  if (targetCustomerError) {
    return NextResponse.json(
      { error: "We couldn't load that customer account right now." },
      { status: 500 },
    );
  }

  if (!targetCustomer) {
    return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  }

  const { data: updatedCustomer, error: updateError } = await adminClient
    .from("customers")
    .update({
      plan: normalizedPlan,
      status: parsed.data.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetCustomer.id)
    .select("id, plan, status")
    .single();

  if (updateError || !updatedCustomer) {
    return NextResponse.json(
      { error: "We couldn't save the customer plan right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    plan: updatedCustomer.plan,
    status: updatedCustomer.status,
    success: true,
  });
}
