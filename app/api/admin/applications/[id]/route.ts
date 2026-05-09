import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserRoleByEmail } from "@/lib/auth/admin-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database.types";

const applicationStatusSchema = z.enum([
  "pending",
  "reviewing",
  "qualified",
  "accepted",
  "rejected",
  "onboarding",
  "active",
]);

const planSchema = z.enum(["design_partner", "starter", "growth", "scale"]);

const updateApplicationSchema = z.object({
  feasibilityNotes: z.string().max(5000).nullable().optional(),
  onboardingNotes: z.string().max(5000).nullable().optional(),
  qualificationNotes: z.string().max(5000).nullable().optional(),
  recommendedPlan: planSchema.nullable().optional(),
  riskNotes: z.string().max(5000).nullable().optional(),
  status: applicationStatusSchema,
});

type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
type ApplicationSource = "campaign_applications" | "sample_requests_fallback";
type CustomerPlan = Database["public"]["Tables"]["customers"]["Row"]["plan"];
type CustomerStatus = Database["public"]["Tables"]["customers"]["Row"]["status"];
type SampleRequestStatus = Database["public"]["Tables"]["sample_requests"]["Row"]["status"];

type RouteContext = {
  params: Promise<{ id: string }>;
};

function decodeApplicationId(encodedId: string): { id: string; source: ApplicationSource } | null {
  const [source, ...rest] = encodedId.split(":");
  const id = rest.join(":").trim();

  if (!id) {
    return null;
  }

  if (source !== "campaign_applications" && source !== "sample_requests_fallback") {
    return null;
  }

  return {
    id,
    source,
  };
}

function normalizeOptionalText(value: null | string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function mapApplicationStatusToSampleRequestStatus(status: ApplicationStatus): SampleRequestStatus {
  switch (status) {
    case "reviewing":
      return "researching";
    case "qualified":
    case "accepted":
    case "onboarding":
      return "delivered";
    case "active":
      return "converted";
    case "rejected":
      return "declined";
    case "pending":
    default:
      return "pending";
  }
}

function parseFallbackNotes(notes: string | null): Record<string, Json> {
  if (!notes?.trim()) {
    return {
      source: "campaign_application_fallback",
    };
  }

  try {
    const parsed = JSON.parse(notes) as Json;

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        ...parsed,
        source: "campaign_application_fallback",
      };
    }
  } catch {}

  return {
    source: "campaign_application_fallback",
  };
}

async function ensureCustomerRecord(params: {
  adminClient: ReturnType<typeof createSupabaseAdminClient>;
  company: string;
  email: string;
  fullName: string;
  recommendedPlan: CustomerPlan;
  status: ApplicationStatus;
}) {
  const { adminClient, company, email, fullName, recommendedPlan, status } = params;
  const now = new Date().toISOString();
  const { data: existingCustomer, error: lookupError } = await adminClient
    .from("customers")
    .select("id, company_name, email, full_name, plan, signup_date, status")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    throw new Error("We couldn't load the linked customer record.");
  }

  const nextStatus: CustomerStatus =
    status === "active"
      ? "active"
      : existingCustomer?.status === "active"
        ? "active"
        : "pending";
  const nextPlan = recommendedPlan ?? existingCustomer?.plan ?? null;

  if (status === "active" && !nextPlan) {
    throw new Error("Choose a plan before activating this customer.");
  }

  if (existingCustomer) {
    const { data: updatedCustomer, error: updateError } = await adminClient
      .from("customers")
      .update({
        company_name: existingCustomer.company_name?.trim() ? existingCustomer.company_name : company,
        full_name: existingCustomer.full_name?.trim() ? existingCustomer.full_name : fullName,
        plan: nextPlan,
        signup_date: existingCustomer.signup_date ?? now,
        status: nextStatus,
        updated_at: now,
      })
      .eq("id", existingCustomer.id)
      .select("id, plan, status")
      .single();

    if (updateError || !updatedCustomer) {
      throw new Error("We couldn't update the linked customer record.");
    }

    return updatedCustomer;
  }

  const { data: createdCustomer, error: insertError } = await adminClient
    .from("customers")
    .insert({
      company_name: company,
      email,
      full_name: fullName,
      plan: nextPlan,
      signup_date: now,
      status: nextStatus,
      updated_at: now,
    })
    .select("id, plan, status")
    .single();

  if (insertError || !createdCustomer) {
    throw new Error("We couldn't create the linked customer record.");
  }

  return createdCustomer;
}

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
      { error: "You are not allowed to review campaign applications." },
      { status: 403 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "We couldn't read that application update." },
      { status: 400 },
    );
  }

  const parsed = updateApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a valid status, review notes, and plan recommendation." },
      { status: 400 },
    );
  }

  const { id: encodedId } = await params;
  const decoded = decodeApplicationId(decodeURIComponent(encodedId));

  if (!decoded) {
    return NextResponse.json({ error: "Application reference is invalid." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const nextStatus = parsed.data.status;
  const normalizedNotes = {
    feasibility_notes: normalizeOptionalText(parsed.data.feasibilityNotes),
    onboarding_notes: normalizeOptionalText(parsed.data.onboardingNotes),
    qualification_notes: normalizeOptionalText(parsed.data.qualificationNotes),
    recommended_plan: parsed.data.recommendedPlan ?? null,
    risk_notes: normalizeOptionalText(parsed.data.riskNotes),
  };

  try {
    if (decoded.source === "campaign_applications") {
      const { data: application, error: applicationError } = await adminClient
        .from("campaign_applications")
        .select("*")
        .eq("id", decoded.id)
        .maybeSingle();

      if (applicationError) {
        return NextResponse.json(
          { error: "We couldn't load that application right now." },
          { status: 500 },
        );
      }

      if (!application) {
        return NextResponse.json({ error: "Application not found." }, { status: 404 });
      }

      const recommendedPlan = normalizedNotes.recommended_plan ?? application.recommended_plan ?? null;
      let linkedCustomer:
        | { id: string; plan: CustomerPlan; status: CustomerStatus }
        | undefined;

      if (nextStatus === "accepted" || nextStatus === "onboarding" || nextStatus === "active") {
        linkedCustomer = await ensureCustomerRecord({
          adminClient,
          company: application.company,
          email: application.email.trim().toLowerCase(),
          fullName: application.full_name,
          recommendedPlan,
          status: nextStatus,
        });
      }

      const { data: updatedApplication, error: updateError } = await adminClient
        .from("campaign_applications")
        .update({
          feasibility_notes: normalizedNotes.feasibility_notes,
          onboarding_notes: normalizedNotes.onboarding_notes,
          qualification_notes: normalizedNotes.qualification_notes,
          recommended_plan: recommendedPlan,
          reviewed_at: now,
          risk_notes: normalizedNotes.risk_notes,
          status: nextStatus,
          updated_at: now,
        })
        .eq("id", application.id)
        .select("id, recommended_plan, reviewed_at, status")
        .single();

      if (updateError || !updatedApplication) {
        return NextResponse.json(
          { error: "We couldn't save the application review right now." },
          { status: 500 },
        );
      }

      return NextResponse.json({
        linkedCustomerId: linkedCustomer?.id ?? null,
        linkedCustomerPlan: linkedCustomer?.plan ?? null,
        linkedCustomerStatus: linkedCustomer?.status ?? null,
        recommendedPlan: updatedApplication.recommended_plan,
        reviewedAt: updatedApplication.reviewed_at,
        status: updatedApplication.status,
        success: true,
      });
    }

    const { data: fallbackApplication, error: fallbackError } = await adminClient
      .from("sample_requests")
      .select("*")
      .eq("id", decoded.id)
      .maybeSingle();

    if (fallbackError) {
      return NextResponse.json(
        { error: "We couldn't load that fallback application right now." },
        { status: 500 },
      );
    }

    if (!fallbackApplication) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }

    const parsedNotes = parseFallbackNotes(fallbackApplication.notes);
    const recommendedPlan =
      normalizedNotes.recommended_plan ??
      (typeof parsedNotes.recommendedPlan === "string" ? (parsedNotes.recommendedPlan as CustomerPlan) : null);
    let linkedCustomer:
      | { id: string; plan: CustomerPlan; status: CustomerStatus }
      | undefined;

    if (nextStatus === "accepted" || nextStatus === "onboarding" || nextStatus === "active") {
      linkedCustomer = await ensureCustomerRecord({
        adminClient,
        company: fallbackApplication.company?.trim() || "Unknown company",
        email: fallbackApplication.email.trim().toLowerCase(),
        fullName: fallbackApplication.full_name,
        recommendedPlan,
        status: nextStatus,
      });
    }

    const mergedNotes: Record<string, Json> = {
      ...parsedNotes,
      feasibilityNotes: normalizedNotes.feasibility_notes,
      onboardingNotes: normalizedNotes.onboarding_notes,
      qualificationNotes: normalizedNotes.qualification_notes,
      recommendedPlan,
      reviewedAt: now,
      riskNotes: normalizedNotes.risk_notes,
      source: "campaign_application_fallback",
      status: nextStatus,
      updatedAt: now,
    };

    const { data: updatedFallback, error: fallbackUpdateError } = await adminClient
      .from("sample_requests")
      .update({
        delivered_at:
          nextStatus === "qualified" ||
          nextStatus === "accepted" ||
          nextStatus === "onboarding" ||
          nextStatus === "active"
            ? fallbackApplication.delivered_at ?? now
            : fallbackApplication.delivered_at,
        notes: JSON.stringify(mergedNotes, null, 2),
        status: mapApplicationStatusToSampleRequestStatus(nextStatus),
      })
      .eq("id", fallbackApplication.id)
      .select("id, notes, status")
      .single();

    if (fallbackUpdateError || !updatedFallback) {
      return NextResponse.json(
        { error: "We couldn't save the fallback application review right now." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      linkedCustomerId: linkedCustomer?.id ?? null,
      linkedCustomerPlan: linkedCustomer?.plan ?? null,
      linkedCustomerStatus: linkedCustomer?.status ?? null,
      recommendedPlan,
      reviewedAt: now,
      status: nextStatus,
      success: true,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "We couldn't save the application review right now.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
