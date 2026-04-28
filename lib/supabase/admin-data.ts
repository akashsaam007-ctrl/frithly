import "server-only";

import { cache } from "react";
import { isAfter, subDays } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth/admin-access";
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

  if (!isAdminEmail(email)) {
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
  planLabel: string;
  status: string;
};

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
      planLabel: getPlanName(customer.plan),
      status: customer.status ?? "pending",
    }))
    .sort((left, right) => left.label.localeCompare(right.label)) satisfies AdminBatchBuilderCustomer[];
}

export type AdminCustomerDetail = {
  activeIcp: IcpRow | null;
  approvalRateLabel: string;
  batches: BatchRow[];
  customer: CustomerRow;
  feedback: (FeedbackRow & { leadName: string; batchDateLabel: string | null })[];
  lifetimeLeadCount: number;
};

export async function getAdminCustomerDetail(customerId: string): Promise<AdminCustomerDetail> {
  const { adminClient } = await getAdminBase();
  const { data: customer } = await adminClient.from("customers").select("*").eq("id", customerId).maybeSingle();

  if (!customer) {
    notFound();
  }

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
    customer,
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
