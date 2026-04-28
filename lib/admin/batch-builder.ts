import { format, nextMonday } from "date-fns";
import type { Database } from "@/types/database.types";
import { formatLongDate } from "@/lib/utils";

type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
type LeadEmailStatus = Database["public"]["Tables"]["leads"]["Row"]["email_status"];
type RecommendedOpener = Database["public"]["Tables"]["leads"]["Row"]["recommended_opener"];

type RecordValue = Record<string, unknown>;

export type ParsedLead = Omit<LeadInsert, "batch_id" | "created_at" | "id">;

export type BatchLeadPreview = {
  company: string;
  email: string | null;
  emailStatus: LeadEmailStatus;
  name: string;
  openers: string[];
  recommendedAngle: string;
  role: string;
  signals: string[];
  whyNow: string;
};

export type ParsedBatchPreview = {
  deliveryDate: string;
  deliveryDateLabel: string;
  leadCount: number;
  previewLeads: BatchLeadPreview[];
  verifiedEmails: number;
};

const fieldAliasMap = {
  company_location: ["company_location", "companylocation", "location"],
  company_name: ["company_name", "companyname", "company"],
  company_size: ["company_size", "companysize", "employees"],
  current_title: ["current_title", "currenttitle", "title", "role"],
  email: ["email"],
  email_status: ["email_status", "emailstatus"],
  fit_score: ["fit_score", "fitscore"],
  full_name: ["full_name", "fullname", "name"],
  linkedin_url: ["linkedin_url", "linkedinurl", "linkedin"],
  opener_a: ["opener_a", "openera"],
  opener_a_signal: ["opener_a_signal", "openerasignal"],
  opener_b: ["opener_b", "openerb"],
  opener_b_signal: ["opener_b_signal", "openerbsignal"],
  opener_c: ["opener_c", "openerc"],
  opener_c_signal: ["opener_c_signal", "openercsignal"],
  recommended_opener: ["recommended_opener", "recommendedopener"],
  recommended_reason: ["recommended_reason", "recommendedreason"],
  trigger_signals: ["trigger_signals", "triggersignals", "signals"],
  why_this_lead: ["why_this_lead", "whythislead", "whynow", "why_now"],
} as const;

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function splitList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/\r?\n|[|;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalInteger(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/[^\d.-]/g, "").trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseEmailStatus(value: unknown): LeadEmailStatus {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, "_");

  if (
    normalized === "verified" ||
    normalized === "risky" ||
    normalized === "unverified" ||
    normalized === "pattern_based"
  ) {
    return normalized;
  }

  return null;
}

function parseRecommendedOpener(
  value: unknown,
  openers: Pick<ParsedLead, "opener_a" | "opener_b" | "opener_c">,
): RecommendedOpener {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase().replace(/^option\s+/, "");

    if (normalized === "a" || normalized === "b" || normalized === "c") {
      return normalized;
    }
  }

  if (openers.opener_a) {
    return "a";
  }

  if (openers.opener_b) {
    return "b";
  }

  if (openers.opener_c) {
    return "c";
  }

  return null;
}

function readField(record: RecordValue, targetKey: keyof typeof fieldAliasMap) {
  const normalizedEntries = new Map(
    Object.entries(record).map(([key, value]) => [normalizeKey(key), value]),
  );

  for (const alias of fieldAliasMap[targetKey]) {
    const value = normalizedEntries.get(normalizeKey(alias));

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }

  return null;
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
}

function parseCsvRecords(input: string) {
  const lines = input
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV input must include a header row and at least one lead row.");
  }

  const headers = parseCsvLine(lines[0]);

  if (headers.length === 0) {
    throw new Error("CSV header row is empty.");
  }

  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);

    if (values.length > headers.length) {
      throw new Error(`CSV row ${index + 2} has more columns than the header row.`);
    }

    return headers.reduce<Record<string, string>>((record, header, headerIndex) => {
      record[header] = values[headerIndex] ?? "";
      return record;
    }, {});
  });
}

function parseRawRecords(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Paste at least one lead in JSON or CSV format.");
  }

  if (trimmed.startsWith("[")) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error("The lead JSON is invalid. Please fix the syntax and try again.");
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Lead JSON must be a non-empty array of lead objects.");
    }

    return parsed.map((value, index) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error(`Lead ${index + 1} must be a JSON object.`);
      }

      return value as RecordValue;
    });
  }

  return parseCsvRecords(trimmed);
}

function toParsedLead(record: RecordValue, index: number): ParsedLead {
  const fullName = String(readField(record, "full_name") ?? "").trim();
  const currentTitle = String(readField(record, "current_title") ?? "").trim();
  const companyName = String(readField(record, "company_name") ?? "").trim();

  if (!fullName || !currentTitle || !companyName) {
    throw new Error(
      `Lead ${index + 1} is missing one of the required fields: full name, title, or company.`,
    );
  }

  const opener_a = String(readField(record, "opener_a") ?? "").trim() || null;
  const opener_b = String(readField(record, "opener_b") ?? "").trim() || null;
  const opener_c = String(readField(record, "opener_c") ?? "").trim() || null;
  const email = String(readField(record, "email") ?? "").trim() || null;
  const whyThisLead =
    String(readField(record, "why_this_lead") ?? "").trim() ||
    "No why-now context provided for this lead yet.";

  const lead = {
    company_location: String(readField(record, "company_location") ?? "").trim() || null,
    company_name: companyName,
    company_size: parseOptionalInteger(readField(record, "company_size")),
    current_title: currentTitle,
    email,
    email_status: parseEmailStatus(readField(record, "email_status")) ?? (email ? "verified" : null),
    fit_score: parseOptionalInteger(readField(record, "fit_score")),
    full_name: fullName,
    linkedin_url: String(readField(record, "linkedin_url") ?? "").trim() || null,
    opener_a,
    opener_a_signal: String(readField(record, "opener_a_signal") ?? "").trim() || null,
    opener_b,
    opener_b_signal: String(readField(record, "opener_b_signal") ?? "").trim() || null,
    opener_c,
    opener_c_signal: String(readField(record, "opener_c_signal") ?? "").trim() || null,
    recommended_opener: parseRecommendedOpener(
      readField(record, "recommended_opener"),
      { opener_a, opener_b, opener_c },
    ),
    recommended_reason: String(readField(record, "recommended_reason") ?? "").trim() || whyThisLead,
    trigger_signals: splitList(readField(record, "trigger_signals")),
    why_this_lead: whyThisLead,
  } satisfies ParsedLead;

  if (lead.fit_score !== null) {
    lead.fit_score = Math.min(10, Math.max(1, lead.fit_score));
  }

  return lead;
}

export function parseBatchLeads(input: string) {
  const records = parseRawRecords(input);
  return records.map((record, index) => toParsedLead(record, index));
}

export function getVerifiedEmailCount(leads: ParsedLead[]) {
  return leads.filter((lead) => lead.email_status === "verified").length;
}

function getRecommendedAngleLabel(opener: RecommendedOpener) {
  switch (opener) {
    case "a":
      return "Option A";
    case "b":
      return "Option B";
    case "c":
      return "Option C";
    default:
      return "Best angle";
  }
}

export function buildBatchPreview(deliveryDate: string, leads: ParsedLead[]): ParsedBatchPreview {
  return {
    deliveryDate,
    deliveryDateLabel: formatLongDate(deliveryDate),
    leadCount: leads.length,
    previewLeads: leads.slice(0, 3).map((lead) => ({
      company: lead.company_name,
      email: lead.email ?? null,
      emailStatus: lead.email_status ?? null,
      name: lead.full_name,
      openers: [lead.opener_a, lead.opener_b, lead.opener_c].filter(
        (value): value is string => Boolean(value),
      ),
      recommendedAngle: getRecommendedAngleLabel(lead.recommended_opener ?? null),
      role: lead.current_title,
      signals:
        lead.trigger_signals && lead.trigger_signals.length > 0
          ? lead.trigger_signals
          : ["No trigger signals provided yet."],
      whyNow: lead.why_this_lead ?? "No why-now context provided for this lead yet.",
    })),
    verifiedEmails: getVerifiedEmailCount(leads),
  };
}

export function getDefaultBatchDeliveryDate() {
  return format(nextMonday(new Date()), "yyyy-MM-dd");
}
