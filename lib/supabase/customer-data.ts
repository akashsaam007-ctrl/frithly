import "server-only";

import { cache } from "react";
import { differenceInCalendarDays, isAfter, subDays } from "date-fns";
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatLongDate } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type BatchRow = Database["public"]["Tables"]["batches"]["Row"];
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];
type FeedbackRow = Database["public"]["Tables"]["feedback"]["Row"];
type IcpRow = Database["public"]["Tables"]["icps"]["Row"];
type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

export type CustomerBatchSummary = {
  deliveryDateLabel: string;
  id: string;
  leadCount: number;
  negativeCount: number;
  positiveCount: number;
  positiveRate: number | null;
  status: BatchRow["status"];
  verifiedEmails: number;
};

export type CustomerContext = {
  activeIcp: IcpRow | null;
  batches: CustomerBatchSummary[];
  companyName: string;
  customer: CustomerRow;
  daysSubscribed: number;
  firstName: string;
  latestBatch: CustomerBatchSummary | null;
  lifetimeLeadsDelivered: number;
  matchRateLast30Days: number | null;
};

export type CustomerBatchDetail = {
  batch: CustomerBatchSummary;
  leadFeedbackById: Record<string, "negative" | "positive" | null>;
  leads: LeadRow[];
};

const getCurrentCustomerBase = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect(ROUTES.LOGIN);
  }

  const normalizedEmail = user.email.trim().toLowerCase();
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("*")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (customerError || !customer) {
    redirect(ROUTES.LOGIN);
  }

  const { data: activeIcp } = await supabase
    .from("icps")
    .select("*")
    .eq("customer_id", customer.id)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { activeIcp, customer, normalizedEmail, supabase, user };
});

function getCustomerDisplayName(customer: CustomerRow, email: string) {
  return customer.company_name?.trim() || email.split("@")[0] || "Frithly customer";
}

function getFirstName(customer: CustomerRow, email: string) {
  const source = customer.full_name?.trim() || email.split("@")[0] || "there";
  return source.split(/\s+/)[0] || "there";
}

function buildIcpSummary(icp: IcpRow | null) {
  if (!icp) {
    return null;
  }

  const titles = icp.target_titles?.length ? icp.target_titles.join(", ") : "your target buyers";
  const industries = icp.target_industries?.length
    ? icp.target_industries.join(", ")
    : "your target industries";
  const sizeRange =
    icp.company_size_min || icp.company_size_max
      ? `${icp.company_size_min ?? 0}-${icp.company_size_max ?? "up"} employees`
      : "your preferred company size";
  const geographies = icp.geographies?.length
    ? icp.geographies.join(", ")
    : "your target geographies";
  const signals = icp.signals?.length
    ? `Prioritising ${icp.signals.slice(0, 3).join(", ")}.`
    : "";

  return `${titles} at ${industries} companies with ${sizeRange} across ${geographies}. ${signals}`.trim();
}

function summarizeBatches(
  batches: BatchRow[],
  leads: Pick<LeadRow, "batch_id" | "id">[],
  feedback: Pick<FeedbackRow, "created_at" | "lead_id" | "rating">[],
) {
  const leadIdToBatchId = new Map<string, string>();

  leads.forEach((lead) => {
    if (lead.batch_id) {
      leadIdToBatchId.set(lead.id, lead.batch_id);
    }
  });

  const counts = new Map<string, { negative: number; positive: number }>();
  const feedbackLast30Days: FeedbackRow["rating"][] = [];
  const cutoff = subDays(new Date(), 30);

  feedback.forEach((item) => {
    if (!item.lead_id || !item.rating) {
      return;
    }

    const batchId = leadIdToBatchId.get(item.lead_id);

    if (!batchId) {
      return;
    }

    const bucket = counts.get(batchId) ?? { negative: 0, positive: 0 };

    if (item.rating === "positive") {
      bucket.positive += 1;
    } else {
      bucket.negative += 1;
    }

    counts.set(batchId, bucket);

    if (item.created_at && isAfter(new Date(item.created_at), cutoff)) {
      feedbackLast30Days.push(item.rating);
    }
  });

  const batchSummaries = batches.map((batch) => {
    const bucket = counts.get(batch.id) ?? { negative: 0, positive: 0 };
    const totalRated = bucket.positive + bucket.negative;

    return {
      deliveryDateLabel: formatLongDate(batch.delivery_date),
      id: batch.id,
      leadCount: batch.total_leads ?? 0,
      negativeCount: bucket.negative,
      positiveCount: bucket.positive,
      positiveRate: totalRated > 0 ? Math.round((bucket.positive / totalRated) * 100) : null,
      status: batch.status,
      verifiedEmails: batch.verified_emails ?? 0,
    };
  });

  const ratedInLast30Days = feedbackLast30Days.length;

  return {
    batchSummaries,
    matchRateLast30Days:
      ratedInLast30Days > 0
        ? Math.round(
            (feedbackLast30Days.filter((rating) => rating === "positive").length /
              ratedInLast30Days) *
              100,
          )
        : null,
  };
}

export const getCurrentCustomerContext = cache(async (): Promise<CustomerContext> => {
  const { activeIcp, customer, normalizedEmail, supabase } = await getCurrentCustomerBase();
  const { data: batches, error: batchesError } = await supabase
    .from("batches")
    .select("*")
    .eq("customer_id", customer.id)
    .order("delivery_date", { ascending: false });

  if (batchesError) {
    throw new Error(`Unable to load customer batches: ${batchesError.message}`);
  }

  const batchIds = (batches ?? []).map((batch) => batch.id);
  const { data: leads, error: leadsError } =
    batchIds.length > 0
      ? await supabase.from("leads").select("id, batch_id").in("batch_id", batchIds)
      : { data: [], error: null };

  if (leadsError) {
    throw new Error(`Unable to load batch leads: ${leadsError.message}`);
  }

  const leadIds = (leads ?? []).map((lead) => lead.id);
  const { data: feedback, error: feedbackError } =
    leadIds.length > 0
      ? await supabase
          .from("feedback")
          .select("lead_id, rating, created_at")
          .eq("customer_id", customer.id)
          .in("lead_id", leadIds)
      : { data: [], error: null };

  if (feedbackError) {
    throw new Error(`Unable to load customer feedback: ${feedbackError.message}`);
  }

  const { batchSummaries, matchRateLast30Days } = summarizeBatches(
    batches ?? [],
    leads ?? [],
    feedback ?? [],
  );
  const signupDate = customer.signup_date ? new Date(customer.signup_date) : new Date();

  return {
    activeIcp,
    batches: batchSummaries,
    companyName: getCustomerDisplayName(customer, normalizedEmail),
    customer,
    daysSubscribed: Math.max(differenceInCalendarDays(new Date(), signupDate), 0),
    firstName: getFirstName(customer, normalizedEmail),
    latestBatch: batchSummaries[0] ?? null,
    lifetimeLeadsDelivered: batchSummaries.reduce((sum, batch) => sum + batch.leadCount, 0),
    matchRateLast30Days,
  };
});

export const getCurrentCustomerIcpSummary = cache(async () => {
  const { activeIcp } = await getCurrentCustomerBase();
  return buildIcpSummary(activeIcp);
});

export async function getCustomerBatchDetail(batchId: string): Promise<CustomerBatchDetail | null> {
  const { customer, supabase } = await getCurrentCustomerBase();
  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select("*")
    .eq("customer_id", customer.id)
    .eq("id", batchId)
    .maybeSingle();

  if (batchError) {
    throw new Error(`Unable to load batch detail: ${batchError.message}`);
  }

  if (!batch) {
    return null;
  }

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("*")
    .eq("batch_id", batch.id)
    .order("fit_score", { ascending: false })
    .order("created_at", { ascending: true });

  if (leadsError) {
    throw new Error(`Unable to load leads for batch ${batch.id}: ${leadsError.message}`);
  }

  const leadIds = (leads ?? []).map((lead) => lead.id);
  const { data: feedback, error: feedbackError } =
    leadIds.length > 0
      ? await supabase
          .from("feedback")
          .select("lead_id, rating, created_at")
          .eq("customer_id", customer.id)
          .in("lead_id", leadIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

  if (feedbackError) {
    throw new Error(`Unable to load feedback for batch ${batch.id}: ${feedbackError.message}`);
  }

  const { batchSummaries } = summarizeBatches([batch], leads ?? [], feedback ?? []);
  const leadFeedbackById: Record<string, "negative" | "positive" | null> = {};

  (feedback ?? []).forEach((item) => {
    if (item.lead_id && item.rating && !(item.lead_id in leadFeedbackById)) {
      leadFeedbackById[item.lead_id] = item.rating;
    }
  });

  return {
    batch: batchSummaries[0],
    leadFeedbackById,
    leads: leads ?? [],
  };
}
