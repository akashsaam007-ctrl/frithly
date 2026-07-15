import "server-only";

import { cache } from "react";
import { isAfter, subDays } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { getBootstrapRoleForEmail, getUserRoleByEmail } from "@/lib/auth/admin-access";
import { PLANS, ROUTES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatLongDate } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type BatchRow = Database["public"]["Tables"]["batches"]["Row"];
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
type FeedbackRow = Database["public"]["Tables"]["feedback"]["Row"];
type IcpRow = Database["public"]["Tables"]["icps"]["Row"];
type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

const planIndex = Object.fromEntries(
  Object.values(PLANS).map((plan) => [plan.id, plan]),
) as Record<string, (typeof PLANS)[keyof typeof PLANS]>;

const getAdminBase = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.trim().toLowerCase();

  if (!user || !email) {
    redirect(ROUTES.LOGIN);
  }

  if ((await getUserRoleByEmail(email)) !== "admin") {
    redirect(ROUTES.HOME);
  }

  return {
    adminClient: createSupabaseAdminClient(),
    email,
    supabase,
    user,
  };
});

function getCustomerDisplayName(
  customer: Pick<CustomerRow, "company_name" | "email" | "full_name">,
) {
  return (
    customer.company_name?.trim() ||
    customer.full_name?.trim() ||
    customer.email.split("@")[0] ||
    "Unknown customer"
  );
}

function getPlanPrice(planId: CustomerRow["plan"]) {
  if (!planId) {
    return 0;
  }

  return planIndex[planId]?.price ?? 0;
}

function getPlanName(planId: CustomerRow["plan"]) {
  if (!planId) {
    return "Unassigned";
  }

  return planIndex[planId]?.name ?? planId;
}

function getLatestBatchByCustomer(batches: BatchRow[]) {
  const latest = new Map<string, BatchRow>();

  batches.forEach((batch) => {
    if (!batch.customer_id) {
      return;
    }

    const current = latest.get(batch.customer_id);

    if (!current || new Date(batch.delivery_date) > new Date(current.delivery_date)) {
      latest.set(batch.customer_id, batch);
    }
  });

  return latest;
}

function getApprovalRate(feedback: Pick<FeedbackRow, "created_at" | "rating">[]) {
  const cutoff = subDays(new Date(), 30);
  const rated = feedback.filter(
    (entry) => entry.rating && entry.created_at && isAfter(new Date(entry.created_at), cutoff),
  );

  if (rated.length === 0) {
    return null;
  }

  return Math.round(
    (rated.filter((entry) => entry.rating === "positive").length / rated.length) * 100,
  );
}

function classifyLeadType(lead: Pick<LeadRow, "trigger_signals" | "why_this_lead"> | undefined) {
  const source = `${lead?.trigger_signals?.join(" ") ?? ""} ${lead?.why_this_lead ?? ""}`.toLowerCase();

  if (source.includes("hired") || source.includes("hiring")) {
    return "Hiring-trigger leads";
  }

  if (source.includes("fund") || source.includes("raised")) {
    return "Funding-trigger leads";
  }

  if (source.includes("post") || source.includes("content") || source.includes("podcast")) {
    return "Content-signal leads";
  }

  return "Company-signal leads";
}

export type AdminOverviewData = {
  activeCustomers: number;
  customersNeedingAttention: { id: string; label: string; reason: string }[];
  leadApprovalRateLabel: string;
  openFeedbackIssues: number;
  recentActivity: { id: string; timestamp: Date; text: string }[];
  totalMrrLabel: string;
};

export type AdminBatchBuilderCustomer = {
  email: string;
  id: string;
  label: string;
  planId: CustomerRow["plan"];
  planLabel: string;
  recommendedLeadCount: number;
  status: string;
};

export type AdminLeadStudioCustomer = {
  activeIcp: {
    companySizeLabel: string;
    exclusions: string[];
    geographies: string[];
    id: string;
    industries: string[];
    name: string | null;
    productDescription: string;
    targetTitles: string[];
  } | null;
  email: string;
  id: string;
  label: string;
  planId: CustomerRow["plan"];
  planLabel: string;
  status: string;
};

function formatIcpCompanySizeLabel(icp: Pick<IcpRow, "company_size_max" | "company_size_min">) {
  if (icp.company_size_min && icp.company_size_max) {
    return `${icp.company_size_min}-${icp.company_size_max} employees`;
  }

  if (icp.company_size_min) {
    return `${icp.company_size_min}+ employees`;
  }

  if (icp.company_size_max) {
    return `Up to ${icp.company_size_max} employees`;
  }

  return "Open company size";
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const { adminClient } = await getAdminBase();
  const [{ data: customers }, { data: batches }, { data: feedback }] =
    await Promise.all([
      adminClient.from("customers").select("*").order("signup_date", { ascending: false }),
      adminClient.from("batches").select("*").order("delivery_date", { ascending: false }),
      adminClient.from("feedback").select("*").order("created_at", { ascending: false }).limit(100),
    ]);

  const customerRows = customers ?? [];
  const batchRows = batches ?? [];
  const feedbackRows = feedback ?? [];
  const latestBatchByCustomer = getLatestBatchByCustomer(batchRows);
  const activeCustomers = customerRows.filter((customer) => customer.status === "active").length;
  const totalMrr = customerRows
    .filter((customer) => customer.status === "active")
    .reduce((sum, customer) => sum + getPlanPrice(customer.plan), 0);
  const openFeedbackIssues = feedbackRows.filter((entry) => entry.rating === "negative").length;
  const approvalRate = getApprovalRate(feedbackRows);

  const recentActivity = [
    ...batchRows.slice(0, 5).map((batch) => ({
      id: `batch-${batch.id}`,
      text: `Batch scheduled for ${formatLongDate(batch.delivery_date)} with ${batch.total_leads ?? 0} leads.`,
      timestamp: new Date(batch.created_at ?? batch.delivery_date),
    })),
    ...feedbackRows.slice(0, 5).map((entry) => ({
      id: `feedback-${entry.id}`,
      text: `Feedback marked ${entry.rating ?? "unrated"}${entry.comment ? `: ${entry.comment}` : "."}`,
      timestamp: new Date(entry.created_at ?? new Date().toISOString()),
    })),
    ...customerRows.slice(0, 5).map((customer) => ({
      id: `customer-${customer.id}`,
      text: `${getCustomerDisplayName(customer)} is ${customer.status ?? "pending"} on ${getPlanName(customer.plan)}.`,
      timestamp: new Date(customer.signup_date ?? customer.created_at ?? new Date().toISOString()),
    })),
  ]
    .sort((left, right) => right.timestamp.getTime() - left.timestamp.getTime())
    .slice(0, 6);

  const customersNeedingAttention = customerRows
    .filter((customer) => customer.status === "active")
    .map((customer) => {
      const latestBatch = latestBatchByCustomer.get(customer.id);

      if (!latestBatch) {
        return {
          id: customer.id,
          label: getCustomerDisplayName(customer),
          reason: "No batch has been created for this customer yet.",
        };
      }

      const daysSinceLatestBatch = Math.abs(
        Math.floor(
          (new Date().getTime() - new Date(latestBatch.delivery_date).getTime()) / (1000 * 60 * 60 * 24),
        ),
      );

      if (daysSinceLatestBatch > 8 || latestBatch.status !== "delivered") {
        return {
          id: customer.id,
          label: getCustomerDisplayName(customer),
          reason:
            latestBatch.status !== "delivered"
              ? `Latest batch is still ${latestBatch.status ?? "pending"}.`
              : `Latest batch was ${daysSinceLatestBatch} days ago.`,
        };
      }

      return null;
    })
    .filter((value): value is { id: string; label: string; reason: string } => Boolean(value))
    .slice(0, 4);

  return {
    activeCustomers,
    customersNeedingAttention,
    leadApprovalRateLabel: approvalRate !== null ? `${approvalRate}%` : "--",
    openFeedbackIssues,
    recentActivity,
    totalMrrLabel: formatCurrency(totalMrr),
  };
}

export type AdminCustomerListItem = {
  email: string;
  id: string;
  lastBatchLabel: string;
  mrrLabel: string;
  name: string;
  planLabel: string;
  role: "admin" | "customer";
  signupDateLabel: string;
  status: string;
};

export async function getAdminCustomersData(filters?: { search?: string; status?: string }) {
  const { adminClient } = await getAdminBase();
  const [{ data: customers }, { data: batches }] = await Promise.all([
    adminClient.from("customers").select("*").order("signup_date", { ascending: false }),
    adminClient.from("batches").select("customer_id, delivery_date").order("delivery_date", { ascending: false }),
  ]);

  const latestBatchByCustomer = getLatestBatchByCustomer((batches ?? []) as BatchRow[]);
  const search = filters?.search?.trim().toLowerCase() ?? "";
  const statusFilter = filters?.status?.trim().toLowerCase() ?? "";

  return (customers ?? [])
    .filter((customer) => {
      const haystack = [
        getCustomerDisplayName(customer),
        customer.full_name ?? "",
        customer.email,
      ]
        .join(" ")
        .toLowerCase();

      if (search && !haystack.includes(search)) {
        return false;
      }

      if (statusFilter && customer.status?.toLowerCase() !== statusFilter) {
        return false;
      }

      return true;
    })
    .map((customer) => {
      const latestBatch = latestBatchByCustomer.get(customer.id);

      return {
        email: customer.email,
        id: customer.id,
        lastBatchLabel: latestBatch ? formatLongDate(latestBatch.delivery_date) : "No batches yet",
        mrrLabel: formatCurrency(getPlanPrice(customer.plan)),
        name: getCustomerDisplayName(customer),
        planLabel: getPlanName(customer.plan),
        role: customer.role ?? getBootstrapRoleForEmail(customer.email),
        signupDateLabel: customer.signup_date ? formatLongDate(customer.signup_date) : "Unknown",
        status: customer.status ?? "pending",
      } satisfies AdminCustomerListItem;
    });
}

export async function getAdminBatchBuilderData() {
  const { adminClient } = await getAdminBase();
  const { data: customers } = await adminClient
    .from("customers")
    .select("id, email, full_name, company_name, plan, status")
    .order("company_name", { ascending: true });

  return (customers ?? [])
    .map((customer) => ({
      email: customer.email,
      id: customer.id,
      label: `${getCustomerDisplayName(customer)} - ${customer.email}`,
      planId: customer.plan,
      planLabel: getPlanName(customer.plan),
      recommendedLeadCount:
        customer.plan === "growth"
          ? 100
          : customer.plan === "scale"
            ? 200
            : 50,
      status: customer.status ?? "pending",
    }))
    .sort((left, right) => left.label.localeCompare(right.label)) satisfies AdminBatchBuilderCustomer[];
}

export async function getAdminLeadStudioData(): Promise<AdminLeadStudioCustomer[]> {
  const { adminClient } = await getAdminBase();
  const [{ data: customers }, { data: icps }] = await Promise.all([
    adminClient
      .from("customers")
      .select("id, email, full_name, company_name, plan, status")
      .order("company_name", { ascending: true }),
    adminClient
      .from("icps")
      .select("*")
      .order("updated_at", { ascending: false }),
  ]);

  const activeIcpByCustomer = new Map<string, IcpRow>();

  for (const icp of icps ?? []) {
    if (!icp.customer_id) {
      continue;
    }

    const current = activeIcpByCustomer.get(icp.customer_id);

    if (icp.is_active && !current) {
      activeIcpByCustomer.set(icp.customer_id, icp);
      continue;
    }

    if (!current) {
      activeIcpByCustomer.set(icp.customer_id, icp);
    }
  }

  return (customers ?? [])
    .map((customer) => {
      const activeIcp = activeIcpByCustomer.get(customer.id) ?? null;

      return {
        activeIcp: activeIcp
          ? {
              companySizeLabel: formatIcpCompanySizeLabel(activeIcp),
              exclusions: activeIcp.exclusions ?? [],
              geographies: activeIcp.geographies ?? [],
              id: activeIcp.id,
              industries: activeIcp.target_industries ?? [],
              name: activeIcp.name,
              productDescription: activeIcp.product_description,
              targetTitles: activeIcp.target_titles ?? [],
            }
          : null,
        email: customer.email,
        id: customer.id,
        label: `${getCustomerDisplayName(customer)} - ${customer.email}`,
        planId: customer.plan,
        planLabel: getPlanName(customer.plan),
        status: customer.status ?? "pending",
      } satisfies AdminLeadStudioCustomer;
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

export type AdminCustomerDetail = {
  activeIcp: IcpRow | null;
  approvalRateLabel: string;
  batches: BatchRow[];
  customer: CustomerRow;
  feedback: (FeedbackRow & { leadName: string; batchDateLabel: string | null })[];
  lifetimeLeadCount: number;
  viewerEmail: string;
};

export async function getAdminCustomerDetail(customerId: string): Promise<AdminCustomerDetail> {
  const { adminClient, email } = await getAdminBase();
  const { data: customer } = await adminClient.from("customers").select("*").eq("id", customerId).maybeSingle();

  if (!customer) {
    notFound();
  }

  const normalizedCustomer = {
    ...customer,
    role: customer.role ?? getBootstrapRoleForEmail(customer.email),
  };

  const [{ data: icps }, { data: batches }, { data: feedback }] = await Promise.all([
    adminClient.from("icps").select("*").eq("customer_id", customer.id).order("updated_at", { ascending: false }),
    adminClient.from("batches").select("*").eq("customer_id", customer.id).order("delivery_date", { ascending: false }),
    adminClient.from("feedback").select("*").eq("customer_id", customer.id).order("created_at", { ascending: false }),
  ]);

  const batchIds = (batches ?? []).map((batch) => batch.id);
  const { data: leads } =
    batchIds.length > 0
      ? await adminClient.from("leads").select("*").in("batch_id", batchIds)
      : { data: [] };
  const leadRows = leads ?? [];
  const leadById = new Map(leadRows.map((lead) => [lead.id, lead]));
  const batchById = new Map((batches ?? []).map((batch) => [batch.id, batch]));

  return {
    activeIcp: (icps ?? []).find((icp) => icp.is_active) ?? icps?.[0] ?? null,
    approvalRateLabel:
      getApprovalRate(feedback ?? []) !== null ? `${getApprovalRate(feedback ?? [])}%` : "--",
    batches: batches ?? [],
    customer: normalizedCustomer,
    feedback: (feedback ?? []).map((entry) => {
      const lead = entry.lead_id ? leadById.get(entry.lead_id) : undefined;
      const batch = lead?.batch_id ? batchById.get(lead.batch_id) : undefined;

      return {
        ...entry,
        batchDateLabel: batch ? formatLongDate(batch.delivery_date) : null,
        leadName: lead?.full_name ?? "General feedback",
      };
    }),
    lifetimeLeadCount: leadRows.length,
    viewerEmail: email,
  };
}

export type AdminFeedbackEntry = {
  batchDateLabel: string | null;
  comment: string | null;
  customerId: string;
  customerName: string;
  id: string;
  leadId: string | null;
  leadName: string;
  rating: string;
};

export type AdminFeedbackData = {
  entries: AdminFeedbackEntry[];
  positiveLast30Label: string;
  topComplainedCustomer: string;
  topPraisedLeadType: string;
};

export async function getAdminFeedbackData(filters?: { customer?: string; rating?: string }) {
  const { adminClient } = await getAdminBase();
  const feedbackQuery = adminClient.from("feedback").select("*").order("created_at", { ascending: false });
  const { data: feedback } = await feedbackQuery;
  const feedbackRows = feedback ?? [];
  const customerIds = [...new Set(feedbackRows.map((entry) => entry.customer_id).filter(Boolean))] as string[];
  const leadIds = [...new Set(feedbackRows.map((entry) => entry.lead_id).filter(Boolean))] as string[];

  const [{ data: customers }, { data: leads }] = await Promise.all([
    customerIds.length > 0
      ? adminClient.from("customers").select("id, company_name, full_name, email").in("id", customerIds)
      : { data: [] },
    leadIds.length > 0
      ? adminClient.from("leads").select("id, full_name, batch_id, trigger_signals, why_this_lead").in("id", leadIds)
      : { data: [] },
  ]);

  const batchIds = [...new Set((leads ?? []).map((lead) => lead.batch_id).filter(Boolean))] as string[];
  const { data: batches } =
    batchIds.length > 0
      ? await adminClient.from("batches").select("id, delivery_date").in("id", batchIds)
      : { data: [] };

  const customerById = new Map(
    (customers ?? []).map((customer) => [
      customer.id,
      customer.company_name?.trim() || customer.full_name?.trim() || customer.email,
    ]),
  );
  const leadById = new Map((leads ?? []).map((lead) => [lead.id, lead]));
  const batchById = new Map((batches ?? []).map((batch) => [batch.id, batch]));
  const customerFilter = filters?.customer?.trim().toLowerCase() ?? "";
  const ratingFilter = filters?.rating?.trim().toLowerCase() ?? "";

  const entries = feedbackRows
    .map((entry) => {
      const lead = entry.lead_id ? leadById.get(entry.lead_id) : undefined;
      const batch = lead?.batch_id ? batchById.get(lead.batch_id) : undefined;
      const customerName = customerById.get(entry.customer_id ?? "") ?? "Unknown customer";

      return {
        batchDateLabel: batch ? formatLongDate(batch.delivery_date) : null,
        comment: entry.comment,
        customerId: entry.customer_id ?? "",
        customerName,
        id: entry.id,
        leadId: entry.lead_id,
        leadName: lead?.full_name ?? "General feedback",
        rating: entry.rating ?? "unrated",
      } satisfies AdminFeedbackEntry;
    })
    .filter((entry) => {
      if (customerFilter && !entry.customerName.toLowerCase().includes(customerFilter)) {
        return false;
      }

      if (ratingFilter && entry.rating.toLowerCase() !== ratingFilter) {
        return false;
      }

      return true;
    });

  const cutoff = subDays(new Date(), 30);
  const ratedLast30 = feedbackRows.filter(
    (entry) => entry.rating && entry.created_at && isAfter(new Date(entry.created_at), cutoff),
  );
  const positiveLast30 =
    ratedLast30.length > 0
      ? `${Math.round((ratedLast30.filter((entry) => entry.rating === "positive").length / ratedLast30.length) * 100)}%`
      : "--";

  const complaints = new Map<string, number>();
  const praisedLeadTypes = new Map<string, number>();

  feedbackRows.forEach((entry) => {
    if (entry.rating === "negative" && entry.customer_id) {
      complaints.set(entry.customer_id, (complaints.get(entry.customer_id) ?? 0) + 1);
    }

    if (entry.rating === "positive" && entry.lead_id) {
      praisedLeadTypes.set(
        classifyLeadType(leadById.get(entry.lead_id)),
        (praisedLeadTypes.get(classifyLeadType(leadById.get(entry.lead_id))) ?? 0) + 1,
      );
    }
  });

  const topComplainedCustomerId =
    [...complaints.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
  const topPraisedLeadType =
    [...praisedLeadTypes.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ??
    "Not enough feedback yet";

  return {
    entries,
    positiveLast30Label: positiveLast30,
    topComplainedCustomer: topComplainedCustomerId
      ? customerById.get(topComplainedCustomerId) ?? "Unknown customer"
      : "No complaints yet",
    topPraisedLeadType,
  };
}

type CampaignApplicationRow = Database["public"]["Tables"]["campaign_applications"]["Row"];
type SampleRequestRow = Database["public"]["Tables"]["sample_requests"]["Row"];

const adminApplicationStatuses = [
  "pending",
  "reviewing",
  "qualified",
  "accepted",
  "rejected",
  "onboarding",
  "active",
] as const;

export const ADMIN_APPLICATION_STATUSES = adminApplicationStatuses;
export type AdminApplicationStatus = (typeof adminApplicationStatuses)[number];
export type AdminApplicationSource = "campaign_applications" | "sample_requests_fallback";

export type AdminApplicationRisk = {
  detail: string;
  level: "high" | "low" | "medium";
  title: string;
};

export type AdminApplicationPlanRecommendation = {
  label: string;
  planId: Exclude<CustomerRow["plan"], null>;
  reason: string;
};

export type AdminApplicationRecord = {
  averageClientValue: number;
  averageClientValueLabel: string;
  cities: string[];
  company: string;
  companySize: string;
  countries: string[];
  createdAtLabel: string;
  createdAtRaw: null | string;
  currentChallenges: string;
  densityLabel: string;
  email: string;
  encodedId: string;
  feasibilityBand: "Challenging" | "High confidence" | "Selective but workable";
  feasibilityLabel: string;
  feasibilityNotes: string | null;
  founderConfidenceMin: number;
  fullName: string;
  geographyLabel: string;
  id: string;
  industry: string;
  isFallback: boolean;
  linkedinProfile: string | null;
  linkedCustomerId: string | null;
  linkedCustomerName: string | null;
  linkedCustomerPlan: CustomerRow["plan"];
  linkedCustomerStatus: CustomerRow["status"];
  leadGoal: number;
  minimumScore: number;
  onboardingNotes: string | null;
  outboundMaturity: CampaignApplicationRow["outbound_maturity"];
  planRecommendation: AdminApplicationPlanRecommendation;
  preferredContactMethod: "email" | "linkedin" | "telegram" | "whatsapp";
  qualificationNotes: string | null;
  recommendedPlan: CampaignApplicationRow["recommended_plan"];
  requiredContactability: CampaignApplicationRow["required_contactability"];
  reviewedAtLabel: null | string;
  riskNotes: string | null;
  risks: AdminApplicationRisk[];
  role: string | null;
  services: string[];
  source: AdminApplicationSource;
  sourceLabel: string;
  status: AdminApplicationStatus;
  successDefinition: string | null;
  summary: string;
  targetTitles: string[];
  telegramHandle: string | null;
  updatedAtRaw: null | string;
  updatedAtLabel: null | string;
  whatsappNumber: string;
  website: string | null;
};

export type AdminApplicationsData = {
  counts: Record<AdminApplicationStatus, number>;
  groupedApplications: Array<{
    applications: AdminApplicationRecord[];
    count: number;
    status: AdminApplicationStatus;
    title: string;
  }>;
  hasFallbackApplications: boolean;
  migrationRequired: boolean;
  selectedApplication: AdminApplicationRecord | null;
  totalApplications: number;
};

function encodeAdminApplicationId(source: AdminApplicationSource, id: string) {
  return `${source}:${id}`;
}

function parseFallbackApplicationNotes(notes: string | null) {
  if (!notes?.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>;

    if (parsed.source !== "campaign_application_fallback") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function mapSampleRequestStatusToApplicationStatus(
  status: SampleRequestRow["status"],
): AdminApplicationStatus {
  switch (status) {
    case "under_review":
    case "researching":
      return "reviewing";
    case "sample_ready":
    case "meeting_scheduled":
    case "review_completed":
    case "qualified":
    case "delivered":
      return "qualified";
    case "converted":
      return "active";
    case "not_qualified":
    case "declined":
      return "rejected";
    case "closed":
      return "accepted";
    case "new":
    case "pending":
    default:
      return "pending";
  }
}

function normalizeStringArray(values: null | string[] | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function includesAny(haystack: string, needles: string[]) {
  return needles.some((needle) => haystack.includes(needle));
}

function humanizeApplicationStatus(status: AdminApplicationStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "reviewing":
      return "Reviewing";
    case "qualified":
      return "Qualified";
    case "accepted":
      return "Accepted";
    case "rejected":
      return "Rejected";
    case "onboarding":
      return "Onboarding";
    case "active":
      return "Active";
  }
}

function getAdminApplicationPlanRecommendation(application: {
  averageClientValue: number;
  cities: string[];
  countries: string[];
  leadGoal: number;
  outboundMaturity: string;
  requiredContactability: string;
}) {
  const multiRegion = application.countries.length > 1 || application.cities.length > 4;
  const heavierOps =
    application.leadGoal >= 100 ||
    multiRegion ||
    application.outboundMaturity === "team" ||
    application.outboundMaturity === "structured";

  if (heavierOps) {
    return {
      label: "GBP 1,999 Scale",
      planId: "scale",
      reason:
        "Higher lead volume, broader geography, or heavier ops complexity points toward the Scale plan.",
    } satisfies AdminApplicationPlanRecommendation;
  }

  if (
    application.leadGoal >= 50 ||
    application.averageClientValue >= 7500 ||
    application.requiredContactability === "premium"
  ) {
    return {
      label: "GBP 999 Growth",
      planId: "growth",
      reason:
        "This ICP likely needs denser recommendation coverage and a stronger operator workflow, which fits Growth best.",
    } satisfies AdminApplicationPlanRecommendation;
  }

  return {
    label: "GBP 499 Starter",
    planId: "starter",
    reason:
      "Single-region or lower-volume campaigns usually fit the Starter motion as long as the quality floor stays realistic.",
  } satisfies AdminApplicationPlanRecommendation;
}

function buildAdminApplicationIntelligence(application: {
  averageClientValue: number;
  cities: string[];
  companySize: string;
  countries: string[];
  founderConfidenceMin: number;
  industry: string;
  leadGoal: number;
  minimumScore: number;
  outboundMaturity: string;
  requiredContactability: string;
  services: string[];
}): {
  densityLabel: string;
  feasibilityBand: AdminApplicationRecord["feasibilityBand"];
  feasibilityLabel: string;
  risks: AdminApplicationRisk[];
  summary: string;
} {
  const nicheText = `${application.industry} ${application.services.join(" ")}`.toLowerCase();
  const geographyText = `${application.countries.join(" ")} ${application.cities.join(" ")}`.toLowerCase();

  const knownAgencyMotion = includesAny(nicheText, [
    "seo",
    "ppc",
    "marketing",
    "web design",
    "branding",
    "paid media",
    "growth",
    "agency",
  ]);
  const denseRegion = includesAny(geographyText, [
    "united kingdom",
    "uk",
    "england",
    "manchester",
    "birmingham",
    "bristol",
    "london",
    "united states",
    "usa",
    "austin",
    "chicago",
    "new york",
    "uae",
    "dubai",
  ]);

  const strictnessScore =
    (application.leadGoal >= 100 ? 2 : application.leadGoal >= 50 ? 1 : 0) +
    (application.minimumScore >= 80 ? 2 : application.minimumScore >= 70 ? 1 : 0) +
    (application.founderConfidenceMin >= 0.9 ? 2 : application.founderConfidenceMin >= 0.7 ? 1 : 0) +
    (application.requiredContactability === "premium" ? 1 : 0) +
    (application.countries.length > 1 ? 1 : 0) +
    (application.cities.length > 4 ? 1 : 0);

  const densityLabel =
    knownAgencyMotion && denseRegion
      ? "Above-average recommendation density"
      : denseRegion
        ? "Selective but workable density"
        : "Likely manual-density ICP";

  const feasibilityBand =
    knownAgencyMotion && denseRegion && strictnessScore <= 4
      ? "High confidence"
      : strictnessScore >= 7 || (!denseRegion && application.leadGoal >= 50)
        ? "Challenging"
        : "Selective but workable";

  const risks: AdminApplicationRisk[] = [];

  if (application.leadGoal >= 100 && application.requiredContactability === "premium") {
    risks.push({
      detail: "High lead volume plus premium contactability will narrow qualified output materially.",
      level: "high",
      title: "Volume-quality tension",
    });
  }

  if (application.founderConfidenceMin >= 0.9) {
    risks.push({
      detail: "A 0.9 founder-confidence floor is unusually strict and will reduce usable founder coverage.",
      level: "medium",
      title: "Strict founder threshold",
    });
  }

  if (application.minimumScore >= 80) {
    risks.push({
      detail: "An 80+ score floor prioritizes elite leads, but it also lowers recommendation density.",
      level: "medium",
      title: "Aggressive score floor",
    });
  }

  if (!denseRegion) {
    risks.push({
      detail: "This geography may require more manual discovery expansion before the queue reaches target density.",
      level: "medium",
      title: "Lower-density region",
    });
  }

  if (
    (application.outboundMaturity === "none" || application.outboundMaturity === "manual") &&
    application.leadGoal >= 50
  ) {
    risks.push({
      detail: "A larger initial lead goal may create onboarding overhead if outbound ops are still mostly manual.",
      level: "low",
      title: "Operational ramp risk",
    });
  }

  const feasibilityLabel =
    feasibilityBand === "High confidence"
      ? "Strong fit for a pilot campaign with healthy recommendation density."
      : feasibilityBand === "Selective but workable"
        ? "Commercially workable, but the campaign needs calibrated expectations on density or thresholds."
        : "High-touch operator review will matter here because the requested thresholds or region make yield less predictable.";

  const summary =
    feasibilityBand === "High confidence"
      ? `${application.countries.join(", ") || "This market"} ${application.industry} is a high-confidence ICP with ${densityLabel.toLowerCase()} and realistic thresholds for a pilot campaign.`
      : feasibilityBand === "Selective but workable"
        ? `${application.industry} in ${application.countries.join(", ") || "the chosen geography"} looks workable, but the current thresholds will likely produce a smaller, more selective queue than the requested lead goal implies.`
        : `${application.industry} in ${application.countries.join(", ") || "the chosen geography"} is possible, but the current lead goal and quality floor make this a challenging onboarding motion without tighter scope or expectation-setting.`;

  return {
    densityLabel,
    feasibilityBand,
    feasibilityLabel,
    risks,
    summary,
  };
}

function buildAdminApplicationRecord(params: {
  application: {
    averageClientValue: number;
    cities: string[];
    company: string;
    companySize: string;
    countries: string[];
    createdAt: null | string;
    currency: "EUR" | "GBP" | "USD";
    currentChallenges: string;
    email: string;
    feasibilityNotes: null | string;
    founderConfidenceMin: number;
    fullName: string;
    id: string;
    industry: string;
    linkedinProfile: string | null;
    leadGoal: number;
    minimumScore: number;
    onboardingNotes: null | string;
    outboundMaturity: string;
    preferredContactMethod: "email" | "linkedin" | "telegram" | "whatsapp";
    qualificationNotes: null | string;
    recommendedPlan: CampaignApplicationRow["recommended_plan"];
    requiredContactability: string;
    reviewedAt: null | string;
    riskNotes: null | string;
    role: null | string;
    services: string[];
    source: AdminApplicationSource;
    status: AdminApplicationStatus;
    successDefinition: null | string;
    targetTitles: string[];
    telegramHandle: string | null;
    updatedAt: null | string;
    whatsappNumber: string;
    website: null | string;
  };
  linkedCustomer?: {
    id: string;
    name: string;
    plan: CustomerRow["plan"];
    status: CustomerRow["status"];
  } | null;
}) {
  const intelligence = buildAdminApplicationIntelligence({
    averageClientValue: params.application.averageClientValue,
    cities: params.application.cities,
    companySize: params.application.companySize,
    countries: params.application.countries,
    founderConfidenceMin: params.application.founderConfidenceMin,
    industry: params.application.industry,
    leadGoal: params.application.leadGoal,
    minimumScore: params.application.minimumScore,
    outboundMaturity: params.application.outboundMaturity,
    requiredContactability: params.application.requiredContactability,
    services: params.application.services,
  });

  const planRecommendation =
    params.application.recommendedPlan
      ? {
          label: getPlanName(params.application.recommendedPlan),
          planId: params.application.recommendedPlan,
          reason: "Operator-selected plan recommendation.",
        }
      : getAdminApplicationPlanRecommendation({
          averageClientValue: params.application.averageClientValue,
          cities: params.application.cities,
          countries: params.application.countries,
          leadGoal: params.application.leadGoal,
          outboundMaturity: params.application.outboundMaturity,
          requiredContactability: params.application.requiredContactability,
        });

  return {
    averageClientValue: params.application.averageClientValue,
    averageClientValueLabel: formatApplicationCurrency(
      params.application.averageClientValue,
      params.application.currency,
    ),
    cities: params.application.cities,
    company: params.application.company,
    companySize: params.application.companySize,
    countries: params.application.countries,
    createdAtLabel: params.application.createdAt
      ? formatLongDate(params.application.createdAt)
      : "Unknown",
    createdAtRaw: params.application.createdAt,
    currentChallenges: params.application.currentChallenges,
    densityLabel: intelligence.densityLabel,
    email: params.application.email,
    encodedId: encodeAdminApplicationId(params.application.source, params.application.id),
    feasibilityBand: intelligence.feasibilityBand,
    feasibilityLabel: intelligence.feasibilityLabel,
    feasibilityNotes: params.application.feasibilityNotes,
    founderConfidenceMin: params.application.founderConfidenceMin,
    fullName: params.application.fullName,
    geographyLabel:
      params.application.cities.length > 0
        ? `${params.application.countries.join(", ")} | ${params.application.cities.join(", ")}`
        : params.application.countries.join(", "),
    id: params.application.id,
    industry: params.application.industry,
    isFallback: params.application.source === "sample_requests_fallback",
    linkedinProfile: params.application.linkedinProfile,
    linkedCustomerId: params.linkedCustomer?.id ?? null,
    linkedCustomerName: params.linkedCustomer?.name ?? null,
    linkedCustomerPlan: params.linkedCustomer?.plan ?? null,
    linkedCustomerStatus: params.linkedCustomer?.status ?? null,
    leadGoal: params.application.leadGoal,
    minimumScore: params.application.minimumScore,
    onboardingNotes: params.application.onboardingNotes,
    outboundMaturity: params.application.outboundMaturity as CampaignApplicationRow["outbound_maturity"],
    planRecommendation,
    preferredContactMethod: params.application.preferredContactMethod,
    qualificationNotes: params.application.qualificationNotes,
    recommendedPlan: params.application.recommendedPlan,
    requiredContactability: params.application.requiredContactability as CampaignApplicationRow["required_contactability"],
    reviewedAtLabel: params.application.reviewedAt
      ? formatLongDate(params.application.reviewedAt)
      : null,
    riskNotes: params.application.riskNotes,
    risks: intelligence.risks,
    role: params.application.role,
    services: params.application.services,
    source: params.application.source,
    sourceLabel:
      params.application.source === "campaign_applications"
        ? "Canonical application"
        : "Fallback application",
    status: params.application.status,
    successDefinition: params.application.successDefinition,
    summary: intelligence.summary,
    targetTitles: params.application.targetTitles,
    telegramHandle: params.application.telegramHandle,
    updatedAtRaw: params.application.updatedAt,
    updatedAtLabel: params.application.updatedAt
      ? formatLongDate(params.application.updatedAt)
      : null,
    whatsappNumber: params.application.whatsappNumber,
    website: params.application.website,
  } satisfies AdminApplicationRecord;
}

function formatApplicationCurrency(value: number, currency: "EUR" | "GBP" | "USD") {
  return new Intl.NumberFormat("en-GB", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export async function getAdminApplicationsData(filters?: {
  search?: string;
  selectedId?: string;
  status?: string;
}): Promise<AdminApplicationsData> {
  const { adminClient } = await getAdminBase();

  const [{ data: applications, error: applicationsError }, { data: sampleRequests }, { data: customers }] =
    await Promise.all([
      adminClient.from("campaign_applications").select("*").order("created_at", { ascending: false }),
      adminClient.from("sample_requests").select("*").order("created_at", { ascending: false }),
      adminClient.from("customers").select("id, email, company_name, full_name, status, plan"),
    ]);

  const customerByEmail = new Map(
    (customers ?? []).map((customer) => [
      customer.email.trim().toLowerCase(),
      {
        id: customer.id,
        name: getCustomerDisplayName(customer),
        plan: customer.plan,
        status: customer.status,
      },
    ]),
  );

  const canonicalApplications = (applications ?? []).map((application) =>
    buildAdminApplicationRecord({
      application: {
        averageClientValue: application.average_client_value,
        cities: normalizeStringArray(application.cities),
        company: application.company,
        companySize: application.company_size,
        countries: normalizeStringArray(application.countries),
        createdAt: application.created_at,
        currency: application.currency,
        currentChallenges: application.current_challenges,
        email: application.email,
        feasibilityNotes: application.feasibility_notes,
        founderConfidenceMin: application.founder_confidence_min,
        fullName: application.full_name,
        id: application.id,
        industry: application.industry,
        linkedinProfile: application.linkedin_profile,
        leadGoal: application.lead_goal,
        minimumScore: application.minimum_score,
        onboardingNotes: application.onboarding_notes,
        outboundMaturity: application.outbound_maturity,
        preferredContactMethod: application.preferred_contact_method,
        qualificationNotes: application.qualification_notes,
        recommendedPlan: application.recommended_plan,
        requiredContactability: application.required_contactability,
        reviewedAt: application.reviewed_at,
        riskNotes: application.risk_notes,
        role: application.role,
        services: normalizeStringArray(application.services),
        source: "campaign_applications",
        status: application.status ?? "pending",
        successDefinition: application.success_definition,
        targetTitles: normalizeStringArray(application.target_titles),
        telegramHandle: application.telegram_handle,
        updatedAt: application.updated_at,
        whatsappNumber: application.whatsapp_number,
        website: application.website,
      },
      linkedCustomer: customerByEmail.get(application.email.trim().toLowerCase()) ?? null,
    }),
  );

  const fallbackApplications = (sampleRequests ?? [])
    .map((request) => {
      const parsedNotes = parseFallbackApplicationNotes(request.notes);

      if (!parsedNotes) {
        return null;
      }

      return buildAdminApplicationRecord({
        application: {
          averageClientValue:
            typeof parsedNotes.averageClientValue === "number" ? parsedNotes.averageClientValue : 0,
          cities: Array.isArray(parsedNotes.cities)
            ? parsedNotes.cities.filter((value): value is string => typeof value === "string")
            : [],
          company: request.company ?? "Unknown company",
          companySize: request.company_size ?? "Unknown",
          countries: Array.isArray(parsedNotes.countries)
            ? parsedNotes.countries.filter((value): value is string => typeof value === "string")
            : normalizeStringArray(request.geography?.split(",")),
          createdAt: request.created_at,
          currency:
            parsedNotes.currency === "EUR" ||
            parsedNotes.currency === "GBP" ||
            parsedNotes.currency === "USD"
              ? parsedNotes.currency
              : "GBP",
          currentChallenges: request.frustration ?? "No challenges recorded.",
          email: request.email,
          feasibilityNotes:
            typeof parsedNotes.feasibilityNotes === "string" ? parsedNotes.feasibilityNotes : null,
          founderConfidenceMin:
            typeof parsedNotes.founderConfidenceMin === "number"
              ? parsedNotes.founderConfidenceMin
              : 0.7,
          fullName: request.full_name,
          id: request.id,
          industry: request.industry ?? "Unknown ICP",
          linkedinProfile:
            typeof parsedNotes.linkedinProfile === "string" ? parsedNotes.linkedinProfile : null,
          leadGoal: typeof parsedNotes.leadGoal === "number" ? parsedNotes.leadGoal : 25,
          minimumScore:
            typeof parsedNotes.minimumScore === "number" ? parsedNotes.minimumScore : 70,
          onboardingNotes:
            typeof parsedNotes.onboardingNotes === "string" ? parsedNotes.onboardingNotes : null,
          outboundMaturity:
            typeof parsedNotes.outboundMaturity === "string"
              ? parsedNotes.outboundMaturity
              : "manual",
          preferredContactMethod:
            parsedNotes.preferredContactMethod === "email" ||
            parsedNotes.preferredContactMethod === "linkedin" ||
            parsedNotes.preferredContactMethod === "telegram" ||
            parsedNotes.preferredContactMethod === "whatsapp"
              ? parsedNotes.preferredContactMethod
              : "email",
          qualificationNotes:
            typeof parsedNotes.qualificationNotes === "string"
              ? parsedNotes.qualificationNotes
              : null,
          recommendedPlan:
            parsedNotes.recommendedPlan === "design_partner" ||
            parsedNotes.recommendedPlan === "starter" ||
            parsedNotes.recommendedPlan === "growth" ||
            parsedNotes.recommendedPlan === "scale"
              ? parsedNotes.recommendedPlan
              : null,
          requiredContactability:
            parsedNotes.requiredContactability === "strong" ||
            parsedNotes.requiredContactability === "premium"
              ? parsedNotes.requiredContactability
              : "premium",
          reviewedAt:
            typeof parsedNotes.reviewedAt === "string" ? parsedNotes.reviewedAt : null,
          riskNotes: typeof parsedNotes.riskNotes === "string" ? parsedNotes.riskNotes : null,
          role: typeof parsedNotes.role === "string" ? parsedNotes.role : null,
          services: Array.isArray(parsedNotes.services)
            ? parsedNotes.services.filter((value): value is string => typeof value === "string")
            : [],
          source: "sample_requests_fallback",
          status: adminApplicationStatuses.includes(
            (typeof parsedNotes.status === "string" ? parsedNotes.status : "") as AdminApplicationStatus,
          )
            ? (parsedNotes.status as AdminApplicationStatus)
            : mapSampleRequestStatusToApplicationStatus(request.status),
          successDefinition:
            typeof parsedNotes.successDefinition === "string"
              ? parsedNotes.successDefinition
              : null,
          targetTitles: Array.isArray(parsedNotes.targetTitles)
            ? parsedNotes.targetTitles.filter((value): value is string => typeof value === "string")
            : normalizeStringArray(request.target_role?.split(",")),
          telegramHandle:
            typeof parsedNotes.telegramHandle === "string" ? parsedNotes.telegramHandle : null,
          updatedAt:
            typeof parsedNotes.updatedAt === "string" ? parsedNotes.updatedAt : request.created_at,
          whatsappNumber:
            typeof parsedNotes.whatsappNumber === "string"
              ? parsedNotes.whatsappNumber
              : "Not provided",
          website: typeof parsedNotes.website === "string" ? parsedNotes.website : null,
        },
        linkedCustomer: customerByEmail.get(request.email.trim().toLowerCase()) ?? null,
      });
    })
    .filter((value): value is AdminApplicationRecord => Boolean(value));

  const allApplications = [...canonicalApplications, ...fallbackApplications].sort((left, right) => {
    const leftTime = new Date(left.updatedAtRaw ?? left.createdAtRaw ?? 0).getTime();
    const rightTime = new Date(right.updatedAtRaw ?? right.createdAtRaw ?? 0).getTime();
    return rightTime - leftTime;
  });

  const search = filters?.search?.trim().toLowerCase() ?? "";
  const selectedId = filters?.selectedId?.trim() ?? "";
  const statusFilter = adminApplicationStatuses.includes(
    (filters?.status?.trim().toLowerCase() ?? "") as AdminApplicationStatus,
  )
    ? (filters?.status?.trim().toLowerCase() as AdminApplicationStatus)
    : "";

  const filteredApplications = allApplications.filter((application) => {
    if (statusFilter && application.status !== statusFilter) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [
      application.company,
      application.fullName,
      application.email,
      application.whatsappNumber,
      application.linkedinProfile ?? "",
      application.telegramHandle ?? "",
      application.website ?? "",
      application.industry,
      application.geographyLabel,
      application.currentChallenges,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });

  const counts = adminApplicationStatuses.reduce(
    (result, status) => {
      result[status] = allApplications.filter((application) => application.status === status).length;
      return result;
    },
    {} as Record<AdminApplicationStatus, number>,
  );

  const visibleStatuses = statusFilter ? [statusFilter] : adminApplicationStatuses;
  const groupedApplications = visibleStatuses.map((status) => ({
    applications: filteredApplications.filter((application) => application.status === status),
    count: filteredApplications.filter((application) => application.status === status).length,
    status,
    title: humanizeApplicationStatus(status),
  }));

  const selectedApplication =
    filteredApplications.find((application) => application.encodedId === selectedId) ??
    filteredApplications[0] ??
    null;

  return {
    counts,
    groupedApplications,
    hasFallbackApplications: fallbackApplications.length > 0,
    migrationRequired: Boolean(applicationsError),
    selectedApplication,
    totalApplications: allApplications.length,
  };
}
