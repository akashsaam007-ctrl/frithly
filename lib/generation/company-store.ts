import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/utils/env";

export type StoredContactRecord = {
  confidence: number;
  email: string | null;
  linkedinUrl: string | null;
  name: string;
  title: string;
};

export type StoredCompanyRecord = {
  categories: string[];
  companyName: string;
  contacts: StoredContactRecord[];
  domain: string;
  firstSeenAt: string;
  inferredEmployeeCount: number | null;
  lastSeenAt: string;
  location: string | null;
  matchedSignals: string[];
  notes: string[];
  signalStrength: "strong" | "medium" | "weak";
  sourceKinds: string[];
  sourceUrls: string[];
  summary: string;
  textCorpus: string;
  url: string;
};

type OwnedCompanyDatasetFile = {
  companies: StoredCompanyRecord[];
  updatedAt: string;
  version: 1;
};

const DEFAULT_STORE_PATH = path.join(process.cwd(), "data", "owned-company-dataset.json");

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeDomain(value: string) {
  return value.trim().toLowerCase().replace(/^www\./, "");
}

function dedupeStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function dedupeContacts(contacts: StoredContactRecord[]) {
  const byKey = new Map<string, StoredContactRecord>();

  for (const contact of contacts) {
    const key = [
      normalizeText(contact.name),
      normalizeText(contact.title),
      contact.email?.trim().toLowerCase() ?? "",
      contact.linkedinUrl?.trim().toLowerCase() ?? "",
    ].join("|");
    const existing = byKey.get(key);

    if (!existing || existing.confidence < contact.confidence) {
      byKey.set(key, {
        ...contact,
        email: contact.email?.trim().toLowerCase() ?? null,
        linkedinUrl: contact.linkedinUrl?.trim() ?? null,
        name: contact.name.trim(),
        title: contact.title.trim(),
      });
    }
  }

  return [...byKey.values()].sort((left, right) => right.confidence - left.confidence);
}

function getDatasetPath() {
  return env.OWNED_COMPANY_DATASET_PATH?.trim() || DEFAULT_STORE_PATH;
}

async function ensureDatasetDir() {
  await mkdir(path.dirname(getDatasetPath()), { recursive: true });
}

async function readDatasetFile() {
  try {
    const raw = await readFile(getDatasetPath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<OwnedCompanyDatasetFile>;
    const companies = Array.isArray(parsed.companies) ? parsed.companies : [];

    return {
      companies,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
      version: 1 as const,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return {
        companies: [],
        updatedAt: new Date(0).toISOString(),
        version: 1 as const,
      };
    }

    throw error;
  }
}

async function writeDatasetFile(file: OwnedCompanyDatasetFile) {
  await ensureDatasetDir();
  await writeFile(getDatasetPath(), `${JSON.stringify(file, null, 2)}\n`, "utf8");
}

function mergeStoredCompanies(
  existing: StoredCompanyRecord,
  incoming: StoredCompanyRecord,
): StoredCompanyRecord {
  return {
    categories: dedupeStrings([...existing.categories, ...incoming.categories]),
    companyName:
      incoming.companyName.length >= existing.companyName.length
        ? incoming.companyName
        : existing.companyName,
    contacts: dedupeContacts([...existing.contacts, ...incoming.contacts]).slice(0, 10),
    domain: existing.domain,
    firstSeenAt:
      existing.firstSeenAt < incoming.firstSeenAt ? existing.firstSeenAt : incoming.firstSeenAt,
    inferredEmployeeCount: existing.inferredEmployeeCount ?? incoming.inferredEmployeeCount,
    lastSeenAt:
      existing.lastSeenAt > incoming.lastSeenAt ? existing.lastSeenAt : incoming.lastSeenAt,
    location: existing.location ?? incoming.location,
    matchedSignals: dedupeStrings([...existing.matchedSignals, ...incoming.matchedSignals]),
    notes: dedupeStrings([...existing.notes, ...incoming.notes]),
    signalStrength:
      existing.signalStrength === "strong" || incoming.signalStrength === "strong"
        ? "strong"
        : existing.signalStrength === "medium" || incoming.signalStrength === "medium"
          ? "medium"
          : "weak",
    sourceKinds: dedupeStrings([...existing.sourceKinds, ...incoming.sourceKinds]),
    sourceUrls: dedupeStrings([...existing.sourceUrls, ...incoming.sourceUrls]),
    summary:
      incoming.summary.length >= existing.summary.length ? incoming.summary : existing.summary,
    textCorpus: dedupeStrings([existing.textCorpus, incoming.textCorpus]).join(" "),
    url: existing.url || incoming.url,
  };
}

export async function loadOwnedCompanies() {
  const file = await readDatasetFile();
  return file.companies
    .map((company) => ({
      ...company,
      domain: normalizeDomain(company.domain),
      categories: dedupeStrings(company.categories ?? []),
      contacts: dedupeContacts(company.contacts ?? []),
      matchedSignals: dedupeStrings(company.matchedSignals ?? []),
      notes: dedupeStrings(company.notes ?? []),
      sourceKinds: dedupeStrings(company.sourceKinds ?? []),
      sourceUrls: dedupeStrings(company.sourceUrls ?? []),
    }))
    .filter((company) => company.domain && company.companyName);
}

export async function upsertOwnedCompanies(companies: StoredCompanyRecord[]) {
  if (companies.length === 0) {
    return { totalCompanies: (await readDatasetFile()).companies.length, upserted: 0 };
  }

  const file = await readDatasetFile();
  const byDomain = new Map(
    file.companies
      .filter((company) => company.domain)
      .map((company) => [normalizeDomain(company.domain), company] as const),
  );

  let upserted = 0;

  for (const company of companies) {
    const domain = normalizeDomain(company.domain);

    if (!domain) {
      continue;
    }

    const normalizedIncoming: StoredCompanyRecord = {
      ...company,
      categories: dedupeStrings(company.categories ?? []),
      contacts: dedupeContacts(company.contacts ?? []),
      domain,
      matchedSignals: dedupeStrings(company.matchedSignals ?? []),
      notes: dedupeStrings(company.notes ?? []),
      sourceKinds: dedupeStrings(company.sourceKinds ?? []),
      sourceUrls: dedupeStrings(company.sourceUrls ?? []),
    };
    const existing = byDomain.get(domain);
    byDomain.set(domain, existing ? mergeStoredCompanies(existing, normalizedIncoming) : normalizedIncoming);
    upserted += 1;
  }

  const updatedFile: OwnedCompanyDatasetFile = {
    companies: [...byDomain.values()].sort((left, right) => left.domain.localeCompare(right.domain)),
    updatedAt: new Date().toISOString(),
    version: 1,
  };

  await writeDatasetFile(updatedFile);

  return {
    totalCompanies: updatedFile.companies.length,
    upserted,
  };
}
