import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserRoleByEmail } from "@/lib/auth/admin-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateRoleSchema = z.object({
  role: z.enum(["admin", "customer"]),
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
    return NextResponse.json({ error: "You are not allowed to change roles." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a valid role." }, { status: 400 });
  }

  const { id } = await params;
  const adminClient = createSupabaseAdminClient();
  const { data: targetCustomer, error: targetCustomerError } = await adminClient
    .from("customers")
    .select("id, email, role")
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

  if (targetCustomer.email.trim().toLowerCase() === viewerEmail && parsed.data.role !== "admin") {
    return NextResponse.json(
      { error: "You can't remove your own admin access." },
      { status: 400 },
    );
  }

  if (targetCustomer.role === "admin" && parsed.data.role === "customer") {
    const { count, error: countError } = await adminClient
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (countError) {
      return NextResponse.json(
        { error: "We couldn't verify the current admin count." },
        { status: 500 },
      );
    }

    if ((count ?? 0) <= 1) {
      return NextResponse.json(
        { error: "At least one admin account must remain." },
        { status: 400 },
      );
    }
  }

  const { data: updatedCustomer, error: updateError } = await adminClient
    .from("customers")
    .update({ role: parsed.data.role })
    .eq("id", targetCustomer.id)
    .select("id, role")
    .single();

  if (updateError || !updatedCustomer) {
    return NextResponse.json(
      { error: "We couldn't save the new role right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    role: updatedCustomer.role,
    success: true,
  });
}
