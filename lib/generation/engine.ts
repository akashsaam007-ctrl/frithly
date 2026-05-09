import "server-only";

import type { ParsedBatchPreview, ParsedLead } from "@/lib/admin/batch-builder";
import { buildBatchPreview } from "@/lib/admin/batch-builder";
import { loadOwnedCompanies, upsertOwnedCompanies, type StoredCompanyRecord } from "@/lib/generation/company-store";
import { collectDirectorySeeds } from "@/lib/generation/directory-sources";
import { runGooglePlacesSearch, googleMapsSearchEnabled } from "@/lib/generation/google-places";
import { extractPersonaContacts } from "@/lib/generation/persona-engine";
import { env } from "@/lib/utils/env";
import type { Database } from "@/types/database.types";

type IcpRow = Database["public"]["Tables"]["icps"]["Row"];
type LeadEmailStatus = Database["public"]["Tables"]["leads"]["Row"]["email_status"];
type RecommendedOpener = Database["public"]["Tables"]["leads"]["Row"]["recommended_opener"];

type QueryKind = "company_search" | "directory" | "job_signal" | "local_search";

type QueryPlanItem = {
  kind: QueryKind;
  query: string;
  scoreHint: number;
};

type RawSearchResult = {
  kind: QueryKind;
  query: string;
  snippet: string;
  title: string;
  url: string;
};

type SearXngResult = {
  content?: string;
  engine?: string;
  title?: string;
  url?: string;
};

type SearXngResponse = {
  results?: SearXngResult[];
};

type CandidateContact = {
  confidence: number;
  email: string | null;
  linkedinUrl: string | null;
  name: string;
  title: string;
};

type CompanyCandidate = {
  companyName: string;
  contacts: CandidateContact[];
  domain: string;
  inferredEmployeeCount: number | null;
  location: string | null;
  matchedSignals: string[];
  notes: string[];
  signalStrength: "strong" | "medium" | "weak";
  sourceKinds: QueryKind[];
  sourceUrls: string[];
  summary: string;
  textCorpus: string;
  url: string;
};

type MatchScore = {
  breakdown: {
    geography: number;
    industry: number;
    persona: number;
    productFit: number;
    signal: number;
    size: number;
  };
  notes: string[];
  percent: number;
};

type NormalizedIcp = {
  brandVoice: IcpRow["brand_voice"];
  exclusions: string[];
  geographies: string[];
  industries: string[];
  maxCompanySize: number | null;
  minCompanySize: number | null;
  productDescription: string;
  productKeywords: string[];
  signals: string[];
  titles: string[];
};

export type GeneratedLeadDiagnostics = {
  crawledDomains: number;
  datasetCandidates: number;
  datasetSize: number;
  dedupedDomains: number;
  directorySeeds: number;
  excludedDuplicates: number;
  excludedExclusions: number;
  excludedNonCompany: number;
  excludedSize: number;
  finalLeads: number;
  localPipelineEnabled: boolean;
  localResults: number;
  minMatchPercent: number;
  pipelineCounts: Record<QueryKind, number>;
  queriesExecuted: number;
  queriesGenerated: number;
  rawResults: number;
  scoredCandidates: number;
  belowThreshold: number;
};

export type GeneratedLeadBatch = {
  diagnostics: GeneratedLeadDiagnostics;
  leads: ParsedLead[];
  logs: string[];
  preview: ParsedBatchPreview;
};

type GenerateLeadBatchOptions = {
  deliveryDate: string;
  excludedCompanyNames?: string[];
  minMatchPercent: number;
  queryBudget: number;
  requestedLeadCount: number;
};

const MATCH_SCORE_MAX = 105;

const SEARCH_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 FrithlyResearchBot/1.0";

const NOISE_DOMAINS = new Set([
  "bing.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "youtube.com",
  "wikipedia.org",
]);

const DIRECTORY_DOMAINS = new Set([
  "clutch.co",
  "goodfirms.co",
  "g2.com",
  "capterra.com",
  "producthunt.com",
  "trustradius.com",
  "sortlist.com",
]);

const NOISE_DOMAIN_PATTERNS = [
  /(?:^|\.)wikipedia\.org$/i,
  /(?:^|\.)wiktionary\.org$/i,
  /(?:^|\.)yahoo\.com$/i,
  /(?:^|\.)learn\.microsoft\.com$/i,
  /(?:^|\.)answers\.microsoft\.com$/i,
  /(?:^|\.)community\./i,
  /(?:^|\.)forum\./i,
  /(?:^|\.)printweek\./i,
  /(?:^|\.)builtin\.com$/i,
  /(?:^|\.)revopscareers\.com$/i,
  /(?:^|\.)techtarget\.com$/i,
  /(?:^|\.)digitalspy\.com$/i,
  /(?:^|\.)hearst\./i,
  /(?:^|\.)worldbank\.org$/i,
  /(?:^|\.)answers\.com$/i,
];

const BUYER_TITLE_FALLBACKS = [
  "founder",
  "co-founder",
  "ceo",
  "cro",
  "head of sales",
  "vp sales",
  "head of growth",
  "head of marketing",
  "cmo",
  "revops",
  "revenue operations",
];

const GENERIC_INBOXES = ["hello", "info", "contact", "team", "sales", "marketing"];

const STOPWORDS = new Set([
  "about",
  "across",
  "after",
  "agency",
  "agencies",
  "their",
  "there",
  "these",
  "those",
  "through",
  "while",
  "which",
  "would",
  "your",
  "from",
  "with",
  "that",
  "this",
  "into",
  "over",
  "under",
  "such",
  "than",
  "then",
  "them",
  "they",
  "have",
  "has",
  "will",
  "what",
  "when",
  "where",
  "build",
  "helps",
  "help",
  "deliver",
  "delivers",
  "team",
  "teams",
  "sales",
  "marketing",
  "software",
  "company",
  "companies",
]);

const CONTENT_PATH_PATTERNS = [
  /\/blog\//i,
  /\/news\//i,
  /\/article/i,
  /\/articles\//i,
  /\/community\//i,
  /\/wiki\//i,
  /\/docs?\//i,
  /\/learn\//i,
  /\/glossary\//i,
  /\/guide\//i,
  /\/guides\//i,
  /\/jobs?\//i,
  /\/careers?\//i,
  /\/stock/i,
  /\/quote/i,
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeCompanyIdentity(value: string) {
  return normalizeToken(value)
    .replace(
      /\b(inc|llc|ltd|limited|corp|corporation|co|company|technologies|technology|systems|solutions|group)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function searchGeographyLabel(geography: string) {
  const normalized = geography.trim().toUpperCase();

  switch (normalized) {
    case "US":
      return "United States";
    case "CA":
      return "Canada";
    case "UK":
      return "United Kingdom";
    default:
      return geography;
  }
}

function geographyAliases(geography: string) {
  const normalized = geography.trim().toUpperCase();

  switch (normalized) {
    case "US":
      return ["united states", "usa", "u s", "u.s.", "america"];
    case "CA":
      return ["canada"];
    case "UK":
      return ["united kingdom", "great britain", "britain", "uk", "u.k."];
    default:
      return [geography];
  }
}

function textMatchesGeography(text: string, geography: string) {
  const haystack = ` ${normalizeToken(text)} `;

  return geographyAliases(geography).some((alias) => {
    const normalizedAlias = normalizeToken(alias);
    return normalizedAlias.length > 0 && haystack.includes(` ${normalizedAlias} `);
  });
}

function normalizeNameFragment(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function splitKeywords(values: string[] | null) {
  return uniqueStrings(values ?? []).map((value) => normalizeWhitespace(value));
}

function extractKeywords(text: string, limit = 6) {
  const counts = new Map<string, number>();

  normalizeToken(text)
    .split(" ")
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word))
    .forEach((word) => {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

function normalizeIcp(icp: IcpRow): NormalizedIcp {
  const industries = splitKeywords(icp.target_industries);
  const geographies = splitKeywords(icp.geographies);
  const signals = splitKeywords(icp.signals);
  const titles = uniqueStrings([...(icp.target_titles ?? []), ...BUYER_TITLE_FALLBACKS]).map(
    (value) => normalizeWhitespace(value),
  );
  const productDescription = normalizeWhitespace(icp.product_description);
  const productKeywords = extractKeywords(
    `${productDescription} ${industries.join(" ")} ${signals.join(" ")}`,
    8,
  );

  return {
    brandVoice: icp.brand_voice,
    exclusions: splitKeywords(icp.exclusions).map((value) => value.toLowerCase()),
    geographies,
    industries,
    maxCompanySize: icp.company_size_max,
    minCompanySize: icp.company_size_min,
    productDescription,
    productKeywords,
    signals,
    titles,
  };
}

function buildQueryCatalog(icp: NormalizedIcp, requestedLeadCount: number) {
  const industries = icp.industries.length > 0 ? icp.industries : ["b2b company"];
  const geographies =
    (icp.geographies.length > 0 ? icp.geographies : ["United States"]).map(searchGeographyLabel);
  const services = uniqueStrings([
    ...icp.productKeywords,
    ...industries.flatMap((industry) => industry.split(/\s+/)),
  ]).filter((value) => value.length >= 4);
  const signals = icp.signals.length > 0 ? icp.signals : ["hiring", "careers", "growth"];
  const titleTokens = icp.titles.slice(0, 6);
  const localPipelineEnabled = shouldUseLocalPipeline(icp);
  const querySet = new Map<string, QueryPlanItem>();

  function addQuery(kind: QueryKind, query: string, scoreHint: number) {
    const normalized = normalizeWhitespace(query);

    if (!normalized || querySet.has(`${kind}:${normalized.toLowerCase()}`)) {
      return;
    }

    querySet.set(`${kind}:${normalized.toLowerCase()}`, {
      kind,
      query: normalized,
      scoreHint,
    });
  }

  for (const industry of industries) {
    for (const geography of geographies) {
      addQuery("company_search", `${industry} ${geography}`, 100);
      addQuery("company_search", `"${industry}" "${geography}" about`, 96);
      addQuery("company_search", `"${industry}" "${geography}" contact us`, 92);
      addQuery("job_signal", `"${industry}" "${geography}" careers`, 94);
      addQuery("job_signal", `"${industry}" "${geography}" "we're hiring"`, 98);

      if (localPipelineEnabled) {
        addQuery("local_search", `${industry} ${geography}`, 88);
        addQuery("local_search", `${industry} near ${geography}`, 86);
        addQuery("local_search", `${industry} ${geography} office`, 82);
      }

      for (const signal of signals) {
        addQuery("job_signal", `"${industry}" "${geography}" "${signal}"`, 95);
      }

      for (const service of services.slice(0, 6)) {
        addQuery("company_search", `${industry} ${service} ${geography}`, 90);

        if (localPipelineEnabled) {
          addQuery("local_search", `${service} ${industry} ${geography}`, 82);
          addQuery("local_search", `${service} provider ${geography}`, 78);
        }
      }

      for (const title of titleTokens) {
        addQuery("company_search", `"${industry}" "${geography}" "${title}"`, 84);
      }

      addQuery("directory", `site:clutch.co "${industry}" "${geography}"`, 91);
      addQuery("directory", `site:goodfirms.co "${industry}" "${geography}"`, 89);
      addQuery("directory", `site:g2.com "${industry}" "${geography}"`, 82);
      addQuery("directory", `site:capterra.com "${industry}" "${geography}"`, 80);
      addQuery("directory", `site:producthunt.com "${industry}" "${geography}"`, 78);
    }

    for (const signal of signals) {
      addQuery("job_signal", `"${industry}" "${signal}"`, 84);
    }
  }

  for (const geography of geographies) {
    for (const service of services.slice(0, 8)) {
      addQuery("company_search", `${service} ${geography} software company`, 76);

      if (localPipelineEnabled) {
        addQuery("local_search", `${service} ${geography}`, 74);
        addQuery("local_search", `${service} ${geography} agency`, 70);
      }
    }
  }

  const expanded = [...querySet.values()].sort(
    (left, right) => right.scoreHint - left.scoreHint || left.query.localeCompare(right.query),
  );

  const targetQueryCount = Math.min(Math.max(requestedLeadCount * 20, 120), 500);
  return expanded.slice(0, targetQueryCount);
}

function shouldUseLocalPipeline(icp: NormalizedIcp) {
  const text = normalizeToken(
    `${icp.industries.join(" ")} ${icp.productDescription} ${icp.productKeywords.join(" ")}`,
  );

  const softwareCues =
    /\b(saas|software|platform|api|crm|revops|martech|fintech|hr tech|recruiting software|ai saas|sales intelligence|revenue intelligence)\b/.test(
      text,
    );
  const localBusinessCues =
    /\b(agency|firm|studio|restaurant|clinic|dentist|salon|spa|lawyer|law firm|accounting|contractor|plumber|roofer|real estate|local business|marketing agency)\b/.test(
      text,
    );

  return localBusinessCues && !softwareCues;
}

function chunk<T>(items: T[], size: number) {
  const result: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
}

async function runInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>,
) {
  const output: R[] = [];

  for (const group of chunk(items, batchSize)) {
    const settled = await Promise.all(group.map((item) => fn(item)));
    output.push(...settled);
  }

  return output;
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function domainRoot(value: string) {
  const parts = value.split(".");

  if (parts.length <= 2) {
    return parts[0] ?? value;
  }

  return parts.at(-2) ?? value;
}

function registrableDomain(hostname: string) {
  const clean = hostname.replace(/^www\./, "").toLowerCase();
  const parts = clean.split(".");

  if (parts.length <= 2) {
    return clean;
  }

  const last = parts.at(-1) ?? "";
  const secondLast = parts.at(-2) ?? "";
  const thirdLast = parts.at(-3) ?? "";

  if (last.length === 2 && secondLast.length <= 3 && thirdLast) {
    return `${thirdLast}.${secondLast}.${last}`;
  }

  return `${secondLast}.${last}`;
}

function stripHtml(value: string) {
  return normalizeWhitespace(
    decodeHtml(
      value
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " "),
    ),
  );
}

function safeDomainFromUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
    return hostname || null;
  } catch {
    return null;
  }
}

function canonicalUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString();
  } catch {
    return value;
  }
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": SEARCH_USER_AGENT,
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.text();
}

function getSearXngBaseUrl() {
  return (env.SEARXNG_BASE_URL ?? "http://127.0.0.1:8080").replace(/\/+$/, "");
}

function getSearXngEngines() {
  return uniqueStrings(
    (env.SEARXNG_ENGINES ?? "google,bing")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

type SearchProviderHealth = {
  message: string;
  ok: boolean;
};

async function checkSearXngHealth(): Promise<SearchProviderHealth> {
  const searchUrl = new URL(`${getSearXngBaseUrl()}/search`);
  searchUrl.searchParams.set("q", "frithly health");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("language", env.SEARXNG_LANGUAGE ?? "en-US");
  searchUrl.searchParams.set("categories", "general");
  searchUrl.searchParams.set("pageno", "1");

  const engines = getSearXngEngines();

  if (engines.length > 0) {
    searchUrl.searchParams.set("engines", engines.join(","));
  }

  try {
    const response = await fetch(searchUrl.toString(), {
      headers: {
        Accept: "application/json",
        "user-agent": SEARCH_USER_AGENT,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        message: `SearXNG responded with HTTP ${response.status}.`,
        ok: false,
      };
    }

    return {
      message: `SearXNG is reachable at ${getSearXngBaseUrl()}.`,
      ok: true,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? `SearXNG could not be reached at ${getSearXngBaseUrl()} (${error.message}).`
          : `SearXNG could not be reached at ${getSearXngBaseUrl()}.`,
      ok: false,
    };
  }
}

function parseSearXngResults(data: SearXngResponse, query: QueryPlanItem) {
  return (data.results ?? [])
    .map((result) => {
      const href = result.url ? canonicalUrl(result.url) : null;

      if (!href) {
        return null;
      }

      return {
        kind: query.kind,
        query: query.query,
        snippet: normalizeWhitespace(result.content ?? ""),
        title: normalizeWhitespace(result.title ?? safeDomainFromUrl(href) ?? href),
        url: href,
      } satisfies RawSearchResult;
    })
    .filter((result): result is RawSearchResult => Boolean(result));
}

async function runSearxngQuery(query: QueryPlanItem) {
  const searchUrl = new URL(`${getSearXngBaseUrl()}/search`);
  searchUrl.searchParams.set("q", query.query);
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("language", env.SEARXNG_LANGUAGE ?? "en-US");
  searchUrl.searchParams.set("safesearch", "0");
  searchUrl.searchParams.set("categories", "general");
  searchUrl.searchParams.set("pageno", "1");

  const engines = getSearXngEngines();

  if (engines.length > 0) {
    searchUrl.searchParams.set("engines", engines.join(","));
  }

  const response = await fetch(searchUrl.toString(), {
    headers: {
      Accept: "application/json",
      "user-agent": SEARCH_USER_AGENT,
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`SearXNG HTTP ${response.status}`);
  }

  const data = (await response.json()) as SearXngResponse;
  const parsed = parseSearXngResults(data, query);

  if (query.kind === "directory") {
    return parsed.filter((result) => {
      const domain = safeDomainFromUrl(result.url);
      return domain ? domainLooksLikeDirectory(domain) : false;
    });
  }

  if (query.kind === "job_signal") {
    return parsed.filter((result) => {
      const haystack = normalizeToken(`${result.title} ${result.snippet} ${result.url}`);
      return /career|careers|hiring|jobs|join our team|open role/.test(haystack);
    });
  }

  if (query.kind === "company_search") {
    return parsed.filter((result) => {
      const domain = safeDomainFromUrl(result.url);
      return domain ? !domainLooksLikeDirectory(domain) : false;
    });
  }

  return parsed;
}

async function runSearchQuery(query: QueryPlanItem) {
  if (query.kind === "local_search" && googleMapsSearchEnabled()) {
    const places = await runGooglePlacesSearch(query.query, 10);

    return places
      .filter((place) => Boolean(place.url || place.mapsUrl))
      .map((place) => ({
        kind: query.kind,
        query: query.query,
        snippet: normalizeWhitespace(
          [
            place.snippet,
            place.address ?? "",
            place.categoryHints.join(" "),
          ]
            .filter(Boolean)
            .join(" "),
        ),
        title: place.companyName,
        url: canonicalUrl(place.url ?? place.mapsUrl ?? ""),
      }))
      .filter((result) => Boolean(result.url));
  }

  return runSearxngQuery(query);
}

function interleaveQueries(queryPlan: QueryPlanItem[]) {
  const buckets = new Map<QueryKind, QueryPlanItem[]>();

  queryPlan.forEach((item) => {
    const current = buckets.get(item.kind) ?? [];
    current.push(item);
    buckets.set(item.kind, current);
  });

  const orderedKinds: QueryKind[] = ["company_search", "directory", "job_signal", "local_search"];
  const output: QueryPlanItem[] = [];
  let advanced = true;
  let index = 0;

  while (advanced) {
    advanced = false;

    for (const kind of orderedKinds) {
      const bucket = buckets.get(kind) ?? [];

      if (index < bucket.length) {
        output.push(bucket[index]);
        advanced = true;
      }
    }

    index += 1;
  }

  return output;
}

function domainLooksLikeNoise(domain: string) {
  return NOISE_DOMAINS.has(domain) || NOISE_DOMAIN_PATTERNS.some((pattern) => pattern.test(domain));
}

function domainLooksLikeDirectory(domain: string) {
  return DIRECTORY_DOMAINS.has(domain);
}

function isLikelyExternalWebsite(hostname: string, pageHost: string) {
  if (!hostname || hostname === pageHost || hostname.endsWith(`.${pageHost}`)) {
    return false;
  }

  if (domainLooksLikeNoise(hostname) || domainLooksLikeDirectory(hostname)) {
    return false;
  }

  return true;
}

async function resolveOfficialWebsite(result: RawSearchResult) {
  const domain = safeDomainFromUrl(result.url);

  if (!domain || !domainLooksLikeDirectory(domain)) {
    return result.url;
  }

  try {
    const html = await fetchText(result.url);
    const pageHost = safeDomainFromUrl(result.url) ?? "";
    const hrefMatches = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    let bestCandidate: { score: number; url: string } | null = null;

    for (const match of hrefMatches) {
      const href = decodeHtml(match[1]);
      const anchorText = stripHtml(match[2] ?? "");

      try {
        const resolvedUrl = new URL(href, result.url).toString();

        const score = scoreExternalLink(anchorText, resolvedUrl, pageHost);

        if (!bestCandidate || score > bestCandidate.score) {
          bestCandidate = {
            score,
            url: resolvedUrl,
          };
        }
      } catch {
        continue;
      }
    }

    if (bestCandidate && bestCandidate.score > 0) {
      return bestCandidate.url;
    }
  } catch {
    return result.url;
  }

  return result.url;
}

async function findOfficialWebsiteForCompany(
  companyName: string,
  icp: NormalizedIcp,
  categoryHints: string[] = [],
  locationHint: string | null = null,
) {
  const location = locationHint ?? icp.geographies[0] ?? "";
  const productHint = categoryHints[0] ?? icp.industries[0] ?? "";
  const queries = uniqueStrings([
    `"${companyName}" official site ${location}`.trim(),
    `"${companyName}" ${productHint} ${location}`.trim(),
    `"${companyName}" ${location}`.trim(),
  ]);

  for (const query of queries) {
    try {
      const results = await runSearxngQuery({
        kind: "company_search",
        query,
        scoreHint: 90,
      });
      const match = results.find((result) => {
        const domain = safeDomainFromUrl(result.url);
        return domain ? !domainLooksLikeNoise(domain) && !domainLooksLikeDirectory(domain) : false;
      });

      if (match) {
        return match;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function uniqueUrls(urls: string[]) {
  return [...new Set(urls.map((url) => canonicalUrl(url)).filter(Boolean))];
}

function scoreExternalLink(anchorText: string, url: string, pageHost: string) {
  const hostname = safeDomainFromUrl(url);

  if (!hostname || !isLikelyExternalWebsite(hostname, pageHost)) {
    return -999;
  }

  const text = normalizeToken(anchorText);
  const path = new URL(url).pathname.toLowerCase();
  let score = 0;

  if (
    text.includes("website") ||
    text.includes("visit site") ||
    text.includes("visit website") ||
    text.includes("company site") ||
    text.includes("official site")
  ) {
    score += 40;
  }

  if (!path || path === "/") {
    score += 25;
  }

  if (
    /linkedin|facebook|instagram|x\.com|twitter|youtube|medium|crunchbase|glassdoor/.test(
      hostname,
    )
  ) {
    score -= 50;
  }

  if (text.includes("learn more") || text.includes("read more")) {
    score -= 10;
  }

  if (hostname.includes(domainRoot(pageHost))) {
    score -= 5;
  }

  return score;
}

function pickPriorityLinks(homepageUrl: string, html: string) {
  const hrefMatches = [...html.matchAll(/href="([^"]+)"/gi)];
  const homepageHost = safeDomainFromUrl(homepageUrl);

  if (!homepageHost) {
    return [];
  }

  const priorityKeywords = [
    "about",
    "authors",
    "company",
    "contact",
    "founders",
    "jobs",
    "leadership",
    "people",
    "staff",
    "team",
  ];
  const links: string[] = [];

  for (const match of hrefMatches) {
    const href = decodeHtml(match[1]);

    try {
      const resolved = new URL(href, homepageUrl);
      const host = resolved.hostname.replace(/^www\./, "").toLowerCase();

      if (host !== homepageHost) {
        continue;
      }

      const lowerPath = `${resolved.pathname}${resolved.search}`.toLowerCase();

      if (priorityKeywords.some((keyword) => lowerPath.includes(keyword))) {
        links.push(resolved.toString());
      }
    } catch {
      continue;
    }
  }

  return uniqueUrls(links).slice(0, 8);
}

function extractEmailsFromHtml(html: string) {
  const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
  const emails = html.match(emailRegex) ?? [];
  return uniqueStrings(emails.map((email) => email.toLowerCase()));
}

function inferEmployeeCount(text: string) {
  const rangeMatch = text.match(/\b(\d{1,4})\s*[-–]\s*(\d{1,4})\s+(?:employees|people|staff)\b/i);

  if (rangeMatch) {
    const lower = Number.parseInt(rangeMatch[1], 10);
    const upper = Number.parseInt(rangeMatch[2], 10);

    if (Number.isFinite(lower) && Number.isFinite(upper) && lower >= 2 && upper >= 2) {
      return Math.round((lower + upper) / 2);
    }
  }

  const directMatch = text.match(
    /\b(\d{1,4})(?:\+)?\s+(?:employees|people|teammates|team members|staff)\b/i,
  );

  if (directMatch) {
    const count = Number.parseInt(directMatch[1], 10);
    return Number.isFinite(count) && count >= 2 ? count : null;
  }

  if (/small team|lean team/i.test(text)) {
    return 15;
  }

  if (/growing team|fast-growing team/i.test(text)) {
    return 40;
  }

  return null;
}

function inferLocation(text: string, geographies: string[]) {
  for (const geography of geographies) {
    if (textMatchesGeography(text, geography)) {
      return searchGeographyLabel(geography);
    }
  }

  const cityHint = text.match(
    /\b(Austin|London|New York|San Francisco|Toronto|Chicago|Los Angeles|Bangalore|Mumbai|Delhi|Berlin|Sydney)\b/i,
  );
  return cityHint ? cityHint[1] : null;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findNamedContacts(
  textBlocks: string[],
  htmlBlocks: string[],
  titles: string[],
  companyName: string,
  domain: string,
) {
  const results: CandidateContact[] = [];
  const normalizedTitles = uniqueStrings([...titles, ...BUYER_TITLE_FALLBACKS]);
  const titlePattern = normalizedTitles
    .sort((left, right) => right.length - left.length)
    .map((title) => escapeRegex(title))
    .join("|");

  if (!titlePattern) {
    return results;
  }

  const patterns = [
    new RegExp(
      `([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,2})\\s*(?:[-–|,:]\\s*)(${titlePattern})`,
      "gi",
    ),
    new RegExp(
      `(${titlePattern})\\s*(?:[-–|,:]\\s*)([A-Z][a-z]+(?:\\s+[A-Z][a-z]+){1,2})`,
      "gi",
    ),
  ];

  for (const block of textBlocks) {
    for (const pattern of patterns) {
      for (const match of block.matchAll(pattern)) {
        const rawName = normalizeWhitespace(match[1] ?? match[2] ?? "");
        const rawTitle = normalizeWhitespace(match[2] ?? match[1] ?? "");
        const lowerName = rawName.toLowerCase();

        if (
          !rawName ||
          !rawTitle ||
          lowerName.includes("contact") ||
          lowerName.includes("team") ||
          lowerName.includes("sales") ||
          lowerName.includes("marketing") ||
          lowerName.includes(companyName.toLowerCase())
        ) {
          continue;
        }

        results.push({
          confidence: 0.85,
          email: null,
          linkedinUrl: null,
          name: rawName,
          title: rawTitle,
        });
      }
    }
  }

  const linkedinProfiles = uniqueUrls(
    htmlBlocks.flatMap((html) =>
      [...html.matchAll(/href="([^"]*linkedin\.com\/in\/[^"]+)"/gi)].map((match) =>
        decodeHtml(match[1]),
      ),
    ),
  );

  return dedupeContacts(
    results.map((contact, index) => ({
      ...contact,
      linkedinUrl: linkedinProfiles[index] ?? null,
      email: contact.email ?? generatePatternEmail(contact.name, domain),
    })),
  );
}

function extractStructuredContacts(
  htmlBlocks: string[],
  titles: string[],
) {
  const normalizedTitles = uniqueStrings([...titles, ...BUYER_TITLE_FALLBACKS]);

  return htmlBlocks.flatMap((html) => {
    const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];

    return scripts.flatMap((match) => {
      try {
        const payload = JSON.parse(decodeHtml(match[1]));
        const items = Array.isArray(payload)
          ? payload
          : Array.isArray(payload["@graph"])
            ? payload["@graph"]
            : [payload];

        return items.flatMap((item) => {
          const typeValue = Array.isArray(item?.["@type"]) ? item["@type"].join(" ") : item?.["@type"];
          const type = typeof typeValue === "string" ? typeValue.toLowerCase() : "";
          const name = typeof item?.name === "string" ? normalizeWhitespace(item.name) : "";
          const jobTitle = typeof item?.jobTitle === "string" ? normalizeWhitespace(item.jobTitle) : "";
          const sameAs = typeof item?.sameAs === "string" ? item.sameAs : null;
          const email = typeof item?.email === "string" ? item.email.replace(/^mailto:/i, "") : null;

          if (!name || (!type.includes("person") && !jobTitle)) {
            return [];
          }

          if (
            !jobTitle &&
            !normalizedTitles.some((title) => normalizeToken(type).includes(normalizeToken(title)))
          ) {
            return [];
          }

          return [
            {
              confidence: 0.92,
              email,
              linkedinUrl: sameAs && sameAs.includes("linkedin.com") ? sameAs : null,
              name,
              title: jobTitle || "Team member",
            } satisfies CandidateContact,
          ];
        });
      } catch {
        return [];
      }
    });
  });
}

function extractMailtoContacts(htmlBlocks: string[], companyName: string) {
  return htmlBlocks.flatMap((html) =>
    [...html.matchAll(/mailto:([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)].map((match) => {
      const email = match[1].toLowerCase();
      const localPart = email.split("@")[0] ?? "";
      const inferredName = localPart
        .split(/[._-]/)
        .filter((part) => part.length > 1)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

      return {
        confidence: GENERIC_INBOXES.includes(localPart) ? 0.42 : 0.68,
        email,
        linkedinUrl: null,
        name: inferredName || `${companyName} team`,
        title: inferredName ? "Team member" : "Team inbox",
      } satisfies CandidateContact;
    }),
  );
}

function generatePatternEmail(name: string, domain: string) {
  const parts = normalizeWhitespace(name).split(" ");
  const first = normalizeNameFragment(parts[0] ?? "");
  const last = normalizeNameFragment(parts.at(-1) ?? "");

  if (!first || !last || !domain) {
    return null;
  }

  const candidates = uniqueStrings([
    `${first}@${domain}`,
    `${first}.${last}@${domain}`,
    `${first}${last}@${domain}`,
    `${first[0]}${last}@${domain}`,
    `${first}${last[0]}@${domain}`,
  ]);

  return candidates[1] ?? candidates[0] ?? null;
}

void [findNamedContacts, extractStructuredContacts, extractMailtoContacts, generatePatternEmail];

function dedupeContacts(contacts: CandidateContact[]) {
  const byKey = new Map<string, CandidateContact>();

  contacts.forEach((contact) => {
    const key = `${normalizeToken(contact.name)}|${normalizeToken(contact.title)}|${contact.email ?? ""}`;
    const current = byKey.get(key);

    if (!current || current.confidence < contact.confidence) {
      byKey.set(key, contact);
    }
  });

  return [...byKey.values()].sort((left, right) => right.confidence - left.confidence);
}

function buildFallbackContacts(
  companyName: string,
  emails: string[],
  domain: string,
) {
  const mapped = emails.map((email) => {
    const localPart = email.split("@")[0] ?? "";
    const confidence = GENERIC_INBOXES.includes(localPart) ? 0.45 : 0.55;

    return {
      confidence,
      email,
      linkedinUrl: null,
      name: confidence >= 0.55 ? companyName : `${companyName} team`,
      title: confidence >= 0.55 ? "General contact" : "Team inbox",
    } satisfies CandidateContact;
  });

  if (mapped.length > 0) {
    return dedupeContacts(mapped);
  }

  return GENERIC_INBOXES.map((localPart) => ({
    confidence: 0.3,
    email: `${localPart}@${domain}`,
    linkedinUrl: null,
    name: `${companyName} team`,
    title: "Team inbox",
  }));
}

function summarizeSignals(text: string, icpSignals: string[]) {
  const matchedSignals: string[] = [];
  const normalizedText = normalizeToken(text);

  for (const signal of icpSignals) {
    if (normalizedText.includes(normalizeToken(signal))) {
      matchedSignals.push(signal);
    }
  }

  if (/\bcareer|careers|we re hiring|we're hiring|open roles|join our team\b/i.test(text)) {
    matchedSignals.push("Hiring activity");
  }

  if (/\bcase study|webinar|podcast|blog\b/i.test(text)) {
    matchedSignals.push("Fresh content activity");
  }

  if (/\bpricing\b/i.test(text)) {
    matchedSignals.push("Pricing page present");
  }

  const deduped = uniqueStrings(matchedSignals);
  const strength: CompanyCandidate["signalStrength"] =
    deduped.length >= 3 ? "strong" : deduped.length >= 1 ? "medium" : "weak";

  return {
    matchedSignals: deduped,
    signalStrength: strength,
  };
}

function extractCompanyName(url: string, title: string, domain: string) {
  const titleCandidate = title
    .split(/[\|\-–:]/)
    .map((part) => normalizeWhitespace(part))
    .find(
      (part) =>
        part.length >= 3 &&
        !/careers|about|contact|pricing|community|guide|what is|definition|jobs|log in|stock price|quote|history/i.test(
          part,
        ),
    );

  if (titleCandidate) {
    return titleCandidate;
  }

  const hostname = safeDomainFromUrl(url) ?? domain;
  const firstPart = hostname.split(".")[0] ?? hostname;
  return firstPart
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function extractMetaContent(html: string, attribute: "property" | "name", value: string) {
  const pattern = new RegExp(
    `<meta[^>]+${attribute}=["']${value}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const reversePattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${value}["'][^>]*>`,
    "i",
  );

  const match = html.match(pattern) ?? html.match(reversePattern);
  return match ? normalizeWhitespace(decodeHtml(match[1])) : null;
}

function extractStructuredOrganizationName(html: string) {
  for (const match of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const payload = JSON.parse(decodeHtml(match[1]));
      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload["@graph"])
          ? payload["@graph"]
          : [payload];

      for (const item of items) {
        const typeValue = Array.isArray(item?.["@type"]) ? item["@type"].join(" ") : item?.["@type"];
        const type = typeof typeValue === "string" ? typeValue.toLowerCase() : "";
        const name = typeof item?.name === "string" ? normalizeWhitespace(item.name) : "";

        if (!name) {
          continue;
        }

        if (/organization|corporation|localbusiness|softwareapplication|product|webpage|website/.test(type)) {
          return name;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

function extractBrandNameFromHomepage(html: string, officialUrl: string, domain: string) {
  const candidates = uniqueStrings([
    extractMetaContent(html, "property", "og:site_name") ?? "",
    extractMetaContent(html, "name", "application-name") ?? "",
    extractStructuredOrganizationName(html) ?? "",
    extractCompanyName(officialUrl, stripHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? domain), domain),
  ]);

  const domainTokens = normalizeToken(domainRoot(domain)).split(" ").filter(Boolean);
  const domainFallback = domainRoot(domain)
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    candidates.find((candidate) => {
      const normalized = normalizeToken(candidate);

      if (!normalized || candidate.length < 2) {
        return false;
      }

      if (companyNameLooksInvalid(candidate, {
        brandVoice: null,
        exclusions: [],
        geographies: [],
        industries: [],
        maxCompanySize: null,
        minCompanySize: null,
        productDescription: "",
        productKeywords: [],
        signals: [],
        titles: [],
      })) {
        return false;
      }

      return domainTokens.some((token) => normalized.includes(token));
    }) ?? domainFallback
  );
}

function looksLikeContentPath(url: string) {
  try {
    const parsed = new URL(url);
    return CONTENT_PATH_PATTERNS.some((pattern) => pattern.test(`${parsed.pathname}${parsed.search}`));
  } catch {
    return false;
  }
}

function buildHomepageUrl(url: string) {
  const parsed = new URL(url);
  const host = registrableDomain(parsed.hostname);
  return `${parsed.protocol}//${host}/`;
}

function companyNameLooksInvalid(name: string, icp: NormalizedIcp) {
  const normalized = normalizeToken(name);

  if (!normalized || normalized.length < 3) {
    return true;
  }

  if (
    /^(what is|how to|guide to|complete guide|definition|revops 101|student log in|software as a service|united kingdom)/i.test(
      name,
    )
  ) {
    return true;
  }

  if (
    /(community|careers?|jobs|restaurants|stock price|quote|history|guide|login|log in|download|where are|future of|frameworks|definitions?|choice in|built for|powerful|easy|leading|platform for|premium sales intelligence|news|magazine|media|journal|printweek|digital spy|built in|answers)/i.test(
      name,
    )
  ) {
    return true;
  }

  if (icp.industries.some((industry) => normalized === normalizeToken(industry))) {
    return true;
  }

  if (icp.signals.some((signal) => normalized === normalizeToken(signal))) {
    return true;
  }

  return false;
}

function contactLooksInvalid(contact: CandidateContact, companyName: string) {
  const normalizedName = normalizeWhitespace(contact.name);
  const lowered = normalizedName.toLowerCase();
  const normalizedTitle = normalizeToken(contact.title);

  if (!normalizedName || normalizedName.length < 2) {
    return true;
  }

  if (
    lowered.includes("view profile") ||
    lowered.includes("team") ||
    lowered.includes("jobs in") ||
    lowered.includes("is responsible for") ||
    lowered.includes("the simplest definition") ||
    lowered.includes("including daily responsibilities") ||
    lowered.includes("featured managing director") ||
    lowered.includes("outbound ") ||
    lowered.includes("marketing professionals") ||
    lowered.includes("performance intelligence") ||
    lowered.includes("new roles daily") ||
    lowered.includes("deal desk platform") ||
    lowered.includes("platform hooray") ||
    lowered === "support" ||
    lowered.includes(companyName.toLowerCase())
  ) {
    return true;
  }

  if (
    normalizedTitle === "general contact" &&
    (!contact.email || (contact.email && contact.email.includes("apple-touch-icon")))
  ) {
    return true;
  }

  if (normalizedName.split(/\s+/).length > 5 && !contact.linkedinUrl) {
    return true;
  }

  if (normalizedName.split(/\s+/).length < 2 && !contact.linkedinUrl) {
    return true;
  }

  return false;
}

function candidateLooksLikeNonCompanyEntity(candidate: CompanyCandidate) {
  const text = normalizeToken(
    `${candidate.companyName} ${candidate.summary} ${candidate.textCorpus} ${candidate.sourceUrls.join(" ")}`,
  );
  const domainText = normalizeToken(
    `${candidate.companyName} ${candidate.domain} ${domainRoot(candidate.domain)} ${candidate.sourceUrls.join(" ")}`,
  );

  if (
    companyNameLooksInvalid(candidate.companyName, {
      brandVoice: null,
      exclusions: [],
      geographies: [],
      industries: [],
      maxCompanySize: null,
      minCompanySize: null,
      productDescription: "",
      productKeywords: [],
      signals: [],
      titles: [],
    })
  ) {
    return true;
  }

  if (
    /\b(printweek|digital spy|built in|builtin|revops careers|techtarget|world bank|hearst|answers)\b/.test(
      domainText,
    )
  ) {
    return true;
  }

  if (
    /\b(community|job board|jobs marketplace|documentation|support article|wikipedia|encyclopedia|stock price|quote history|country profile|world bank|restaurant|locations|answer site|university|guide to)\b/.test(
      text,
    )
  ) {
    return true;
  }

  const hasCommercialCue = /\b(book a demo|request demo|schedule demo|get started|free trial|pricing|contact sales|talk to sales|customers|integrations|trusted by)\b/.test(
    text,
  );
  const hasPublisherCue = /\b(news|article|articles|community|jobs|career advice|help center|documentation|support|editorial|magazine|media|journal|publisher|podcast|newsletter|events)\b/.test(
    text,
  );

  return hasPublisherCue && !hasCommercialCue;
}

function failsHardSizeConstraints(candidate: CompanyCandidate, icp: NormalizedIcp) {
  const employeeCount = candidate.inferredEmployeeCount;

  if (employeeCount === null) {
    return false;
  }

  if (icp.maxCompanySize !== null && employeeCount > icp.maxCompanySize * 2) {
    return true;
  }

  return false;
}

function storedRecordToCandidate(record: StoredCompanyRecord) {
  return {
    companyName: record.companyName,
    contacts: record.contacts.map((contact) => ({
      confidence: contact.confidence,
      email: contact.email,
      linkedinUrl: contact.linkedinUrl,
      name: contact.name,
      title: contact.title,
    })),
    domain: record.domain,
    inferredEmployeeCount: record.inferredEmployeeCount,
    location: record.location,
    matchedSignals: uniqueStrings(record.matchedSignals ?? []),
    notes: uniqueStrings(record.notes ?? []),
    signalStrength: record.signalStrength,
    sourceKinds: uniqueStrings(record.sourceKinds ?? []) as QueryKind[],
    sourceUrls: uniqueUrls(record.sourceUrls ?? []),
    summary: record.summary,
    textCorpus: record.textCorpus,
    url: record.url,
  } satisfies CompanyCandidate;
}

function candidateToStoredRecord(candidate: CompanyCandidate): StoredCompanyRecord {
  return {
    categories: extractKeywords(candidate.textCorpus, 8),
    companyName: candidate.companyName,
    contacts: candidate.contacts.map((contact) => ({
      confidence: contact.confidence,
      email: contact.email,
      linkedinUrl: contact.linkedinUrl,
      name: contact.name,
      title: contact.title,
    })),
    domain: candidate.domain,
    firstSeenAt: new Date().toISOString(),
    inferredEmployeeCount: candidate.inferredEmployeeCount,
    lastSeenAt: new Date().toISOString(),
    location: candidate.location,
    matchedSignals: candidate.matchedSignals,
    notes: candidate.notes,
    signalStrength: candidate.signalStrength,
    sourceKinds: candidate.sourceKinds,
    sourceUrls: candidate.sourceUrls,
    summary: candidate.summary,
    textCorpus: candidate.textCorpus,
    url: candidate.url,
  };
}

async function crawlCompany(result: RawSearchResult, icp: NormalizedIcp) {
  const resolvedUrl = canonicalUrl(await resolveOfficialWebsite(result));
  const officialUrl = buildHomepageUrl(resolvedUrl);
  const domain = safeDomainFromUrl(officialUrl);

  if (!domain || domainLooksLikeNoise(domain) || domainLooksLikeDirectory(domain)) {
    return null;
  }

  const homepageHtml = await fetchText(officialUrl);
  const homepageTitleMatch = homepageHtml.match(/<title>([\s\S]*?)<\/title>/i);
  const homepageTitle = homepageTitleMatch ? stripHtml(homepageTitleMatch[1]) : domain;
  const priorityLinks = pickPriorityLinks(officialUrl, homepageHtml);
  const shouldIncludeResolvedPage =
    canonicalUrl(resolvedUrl) !== canonicalUrl(officialUrl) &&
    safeDomainFromUrl(resolvedUrl) === domain &&
    !looksLikeContentPath(resolvedUrl);
  const resolvedPage =
    shouldIncludeResolvedPage
      ? await (async () => {
          try {
            return {
              html: await fetchText(resolvedUrl),
              url: resolvedUrl,
            };
          } catch {
            return null;
          }
        })()
      : null;
  const additionalPages = await runInBatches(priorityLinks.slice(0, 6), 2, async (url) => {
    try {
      return {
        html: await fetchText(url),
        url,
      };
    } catch {
      return null;
    }
  });
  const allPages = [
    { html: homepageHtml, url: officialUrl },
    ...(resolvedPage ? [resolvedPage] : []),
    ...additionalPages.filter(
      (page): page is { html: string; url: string } => Boolean(page && page.html),
    ),
  ];
  const textBlocks = allPages.map((page) => stripHtml(page.html));
  const textCorpus = normalizeWhitespace(
    [homepageTitle, result.snippet, ...textBlocks].filter(Boolean).join(" "),
  );
  const companyName =
    extractBrandNameFromHomepage(homepageHtml, officialUrl, domain) ??
    extractCompanyName(officialUrl, homepageTitle, domain);
  if (companyNameLooksInvalid(companyName, icp)) {
    return null;
  }
  const emails = uniqueStrings(allPages.flatMap((page) => extractEmailsFromHtml(page.html)));
  const personaContacts = extractPersonaContacts(textBlocks, allPages.map((page) => page.html), {
    companyName,
    domain,
    titles: icp.titles,
  });
  const contacts =
    personaContacts.length > 0
      ? dedupeContacts([...personaContacts, ...buildFallbackContacts(companyName, emails, domain)])
      : buildFallbackContacts(companyName, emails, domain);
  const cleanedContacts = contacts.filter((contact) => !contactLooksInvalid(contact, companyName));
  if (cleanedContacts.length === 0) {
    return null;
  }
  const { matchedSignals, signalStrength } = summarizeSignals(textCorpus, icp.signals);
  const location = inferLocation(textCorpus, icp.geographies);
  const inferredEmployeeCount = inferEmployeeCount(textCorpus);

  return {
    companyName,
    contacts: cleanedContacts.slice(0, 4),
    domain,
    inferredEmployeeCount,
    location,
    matchedSignals,
    notes:
      personaContacts.length > 0
        ? [`Persona engine found ${personaContacts.length} contact candidates.`]
        : ([] as string[]),
    signalStrength,
    sourceKinds: [result.kind],
    sourceUrls: uniqueUrls([result.url, resolvedUrl, officialUrl]),
    summary: homepageTitle || result.snippet,
    textCorpus,
    url: officialUrl,
  } satisfies CompanyCandidate;
}

function mergeCandidates(candidates: CompanyCandidate[]) {
  const merged = new Map<string, CompanyCandidate>();

  for (const candidate of candidates) {
    const existing = merged.get(candidate.domain);

    if (!existing) {
      merged.set(candidate.domain, candidate);
      continue;
    }

    merged.set(candidate.domain, {
      ...existing,
      contacts: dedupeContacts([...existing.contacts, ...candidate.contacts]).slice(0, 5),
      inferredEmployeeCount: existing.inferredEmployeeCount ?? candidate.inferredEmployeeCount,
      location: existing.location ?? candidate.location,
      matchedSignals: uniqueStrings([...existing.matchedSignals, ...candidate.matchedSignals]),
      notes: uniqueStrings([...existing.notes, ...candidate.notes]),
      signalStrength:
        existing.signalStrength === "strong" || candidate.signalStrength === "strong"
          ? "strong"
          : existing.signalStrength === "medium" || candidate.signalStrength === "medium"
            ? "medium"
            : "weak",
      sourceKinds: uniqueStrings([
        ...existing.sourceKinds,
        ...candidate.sourceKinds,
      ]) as QueryKind[],
      sourceUrls: uniqueUrls([...existing.sourceUrls, ...candidate.sourceUrls]),
      summary: existing.summary.length >= candidate.summary.length ? existing.summary : candidate.summary,
      textCorpus: `${existing.textCorpus} ${candidate.textCorpus}`.trim(),
      url: existing.url,
    });
  }

  return [...merged.values()];
}

function scoreRawResultPriority(result: RawSearchResult) {
  let score = 0;

  if (result.kind === "company_search") {
    score += 30;
  } else if (result.kind === "job_signal") {
    score += 24;
  } else if (result.kind === "directory") {
    score += 18;
  } else {
    score += 10;
  }

  try {
    const url = new URL(result.url);
    const path = url.pathname.toLowerCase();

    if (!path || path === "/") {
      score += 20;
    } else if (/about|team|leadership|contact|careers|jobs/.test(path)) {
      score += 12;
    } else {
      score -= Math.min(path.split("/").filter(Boolean).length * 3, 12);
    }
  } catch {
    score -= 5;
  }

  if (result.snippet.length >= 120) {
    score += 4;
  }

  return score;
}

function selectResultsForCrawl(results: RawSearchResult[]) {
  const directByDomain = new Map<string, RawSearchResult>();

  for (const result of results) {
    const domain = safeDomainFromUrl(result.url);

    if (!domain || domainLooksLikeNoise(domain)) {
      continue;
    }

    if (domainLooksLikeDirectory(domain)) {
      continue;
    }

    const existing = directByDomain.get(domain);

    if (!existing) {
      directByDomain.set(domain, result);
      continue;
    }

    const existingScore = scoreRawResultPriority(existing);
    const incomingScore = scoreRawResultPriority(result);

    if (incomingScore > existingScore) {
      directByDomain.set(domain, {
        ...result,
        query: uniqueStrings([result.query, existing.query]).join(" | "),
        snippet: uniqueStrings([result.snippet, existing.snippet]).join(" "),
      });
    } else {
      directByDomain.set(domain, {
        ...existing,
        query: uniqueStrings([existing.query, result.query]).join(" | "),
        snippet: uniqueStrings([existing.snippet, result.snippet]).join(" "),
      });
    }
  }

  return [
    ...[...directByDomain.values()].sort(
      (left, right) => scoreRawResultPriority(right) - scoreRawResultPriority(left),
    ),
  ];
}

function personaScore(contact: CandidateContact, icp: NormalizedIcp) {
  const title = normalizeToken(contact.title);

  if (!title) {
    return contact.email ? 6 : 0;
  }

  if (icp.titles.some((target) => title.includes(normalizeToken(target)))) {
    return 15;
  }

  if (BUYER_TITLE_FALLBACKS.some((target) => title.includes(normalizeToken(target)))) {
    return 10;
  }

  return contact.name.toLowerCase().includes("team") ? 5 : 8;
}

function sizeScore(candidate: CompanyCandidate, icp: NormalizedIcp) {
  const employeeCount = candidate.inferredEmployeeCount;

  if (icp.minCompanySize === null && icp.maxCompanySize === null) {
    return 10;
  }

  if (employeeCount === null) {
    return 5;
  }

  if (
    (icp.minCompanySize === null || employeeCount >= icp.minCompanySize) &&
    (icp.maxCompanySize === null || employeeCount <= icp.maxCompanySize)
  ) {
    return 10;
  }

  const lowerDiff =
    icp.minCompanySize !== null ? Math.abs(employeeCount - icp.minCompanySize) : Number.POSITIVE_INFINITY;
  const upperDiff =
    icp.maxCompanySize !== null ? Math.abs(employeeCount - icp.maxCompanySize) : Number.POSITIVE_INFINITY;

  return Math.min(lowerDiff, upperDiff) <= 25 ? 4 : 0;
}

function geographyScore(candidate: CompanyCandidate, icp: NormalizedIcp) {
  if (icp.geographies.length === 0) {
    return 20;
  }

  const text = `${candidate.location ?? ""} ${candidate.textCorpus}`;

  if (icp.geographies.some((geo) => textMatchesGeography(text, geo))) {
    return 20;
  }

  return 0;
}

function industryScore(candidate: CompanyCandidate, icp: NormalizedIcp) {
  if (icp.industries.length === 0) {
    return 25;
  }

  const text = normalizeToken(candidate.textCorpus);
  const exactMatches = icp.industries.filter((industry) =>
    text.includes(normalizeToken(industry)),
  ).length;

  if (exactMatches >= 2) {
    return 25;
  }

  if (exactMatches === 1) {
    return 18;
  }

  const tokenMatches = icp.industries.flatMap((industry) => industry.split(/\s+/)).filter((token) => {
    const normalized = normalizeToken(token);
    return normalized.length >= 4 && text.includes(normalized);
  }).length;

  return tokenMatches >= 2 ? 10 : 0;
}

function productFitScore(candidate: CompanyCandidate, icp: NormalizedIcp) {
  const text = normalizeToken(candidate.textCorpus);
  const hits = icp.productKeywords.filter((keyword) => text.includes(normalizeToken(keyword))).length;

  if (hits >= 4) {
    return 20;
  }

  if (hits >= 2) {
    return 14;
  }

  if (hits >= 1) {
    return 8;
  }

  return 0;
}

function signalScore(candidate: CompanyCandidate) {
  if (candidate.signalStrength === "strong") {
    return 15;
  }

  if (candidate.signalStrength === "medium") {
    return 10;
  }

  return candidate.matchedSignals.length > 0 ? 5 : 0;
}

function datasetCandidateLooksRelevant(candidate: CompanyCandidate, icp: NormalizedIcp) {
  if (candidateLooksLikeNonCompanyEntity(candidate) || failsHardSizeConstraints(candidate, icp)) {
    return false;
  }

  const text = normalizeToken(
    `${candidate.companyName} ${candidate.summary} ${candidate.textCorpus} ${candidate.location ?? ""}`,
  );
  const industryMatch =
    icp.industries.length === 0 ||
    icp.industries.some((industry) => text.includes(normalizeToken(industry)));
  const geographyMatch =
    icp.geographies.length === 0 ||
    icp.geographies.some((geography) => text.includes(normalizeToken(geography)));
  const productMatch =
    icp.productKeywords.length === 0 ||
    icp.productKeywords.some((keyword) => text.includes(normalizeToken(keyword)));

  return industryMatch || geographyMatch || productMatch;
}

function scoreCandidate(candidate: CompanyCandidate, icp: NormalizedIcp) {
  const primaryContact = candidate.contacts[0] ?? null;
  const breakdown = {
    geography: geographyScore(candidate, icp),
    industry: industryScore(candidate, icp),
    persona: primaryContact ? personaScore(primaryContact, icp) : 0,
    productFit: productFitScore(candidate, icp),
    signal: signalScore(candidate),
    size: sizeScore(candidate, icp),
  } satisfies MatchScore["breakdown"];
  const rawScore = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  const percent = Math.round((rawScore / MATCH_SCORE_MAX) * 100);
  const notes = [
    breakdown.industry >= 18 ? "Industry fit matched strongly." : null,
    breakdown.productFit >= 14 ? "Product relevance showed up on the website." : null,
    breakdown.geography >= 20 ? `Matched geography${candidate.location ? ` (${candidate.location})` : ""}.` : null,
    breakdown.persona >= 10 && primaryContact
      ? `Found target-side persona: ${primaryContact.name} (${primaryContact.title}).`
      : null,
    breakdown.signal >= 10 && candidate.matchedSignals.length > 0
      ? `Signals: ${candidate.matchedSignals.slice(0, 3).join(", ")}.`
      : null,
    breakdown.size >= 10 && candidate.inferredEmployeeCount
      ? `Employee size looks close (${candidate.inferredEmployeeCount}).`
      : breakdown.size === 5
        ? "Company size could not be confirmed, so it received a partial score."
        : null,
  ].filter((value): value is string => Boolean(value));

  return {
    breakdown,
    notes,
    percent,
  } satisfies MatchScore;
}

function chooseEmailStatus(contact: CandidateContact): LeadEmailStatus {
  if (!contact.email) {
    return null;
  }

  const localPart = contact.email.split("@")[0] ?? "";
  return GENERIC_INBOXES.includes(localPart) ? "unverified" : "pattern_based";
}

function buildWhyThisLead(candidate: CompanyCandidate, matchScore: MatchScore) {
  const leadIn = [
    `${candidate.companyName} matched ${matchScore.percent}% of the ICP.`,
    candidate.matchedSignals.length > 0
      ? `Key signals: ${candidate.matchedSignals.slice(0, 3).join(", ")}.`
      : "The website and company language still fit the target profile even without a strong fresh signal.",
  ];

  return leadIn.join(" ");
}

function buildOpeners(
  candidate: CompanyCandidate,
  contact: CandidateContact,
  matchScore: MatchScore,
  icp: NormalizedIcp,
): {
  openerA: string;
  openerB: string;
  openerC: string;
  recommendedOpener: RecommendedOpener;
} {
  const signalLine =
    candidate.matchedSignals[0] ??
    "the way your site positions the company right now";
  const firstName = normalizeWhitespace(contact.name).split(" ")[0] ?? contact.name;
  const company = candidate.companyName;
  const productAngle = icp.productDescription.replace(/\.$/, "");
  const openerA = `Saw ${company} showing signal around ${signalLine.toLowerCase()} — usually when pipeline quality or prioritisation gets exposed fast. Curious how you are handling that today, ${firstName}?`;
  const openerB = `${company} looks like a ${icp.industries[0] ?? "strong ICP"} fit for Frithly because ${matchScore.notes[0]?.toLowerCase() ?? "the company language aligns well with the ICP"}. Worth sharing a few accounts we would prioritise for you?`;
  const openerC = `You are likely hearing a lot of generic outreach already, so I will keep this direct: Frithly helps teams selling ${productAngle.toLowerCase()} with signal-backed target accounts instead of broad lists.`;

  const recommendedOpener: RecommendedOpener =
    candidate.signalStrength === "strong"
      ? "a"
      : matchScore.breakdown.productFit >= 14
        ? "b"
        : "c";

  return {
    openerA,
    openerB,
    openerC,
    recommendedOpener,
  };
}

function mapCandidateToLead(candidate: CompanyCandidate, matchScore: MatchScore, icp: NormalizedIcp) {
  const primaryContact = candidate.contacts[0] ?? {
    confidence: 0.2,
    email: null,
    linkedinUrl: null,
    name: `${candidate.companyName} team`,
    title: "General contact",
  };
  const fitScore = Math.min(10, Math.max(1, Math.round(matchScore.percent / 10)));
  const openers = buildOpeners(candidate, primaryContact, matchScore, icp);

  return {
    company_location: candidate.location,
    company_name: candidate.companyName,
    company_size: candidate.inferredEmployeeCount,
    current_title: primaryContact.title,
    email: primaryContact.email,
    email_status: chooseEmailStatus(primaryContact),
    fit_score: fitScore,
    full_name: primaryContact.name,
    linkedin_url: primaryContact.linkedinUrl,
    opener_a: openers.openerA,
    opener_a_signal: candidate.matchedSignals[0] ?? null,
    opener_b: openers.openerB,
    opener_b_signal: matchScore.notes[0] ?? null,
    opener_c: openers.openerC,
    opener_c_signal: candidate.signalStrength === "weak" ? "Broader ICP relevance" : "Signal-backed fit",
    recommended_opener: openers.recommendedOpener,
    recommended_reason:
      openers.recommendedOpener === "a"
        ? "Strong live signal made the timing angle the best opener."
        : openers.recommendedOpener === "b"
          ? "Product/ICP fit was clear enough to lead with specificity."
          : "A direct value angle is safer when signal confidence is softer.",
    trigger_signals: candidate.matchedSignals,
    why_this_lead: buildWhyThisLead(candidate, matchScore),
  } satisfies ParsedLead;
}

function looksExcluded(candidate: CompanyCandidate, icp: NormalizedIcp) {
  if (candidateLooksLikeNonCompanyEntity(candidate) || failsHardSizeConstraints(candidate, icp)) {
    return true;
  }

  const text = normalizeToken(
    `${candidate.companyName} ${candidate.summary} ${candidate.textCorpus} ${candidate.sourceUrls.join(" ")}`,
  );

  return icp.exclusions.some((exclusion) => text.includes(normalizeToken(exclusion)));
}

export async function generateLeadBatchFromIcp(
  icp: IcpRow,
  options: GenerateLeadBatchOptions,
) {
  const normalizedIcp = normalizeIcp(icp);
  const localPipelineEnabled = shouldUseLocalPipeline(normalizedIcp);
  const mapsAvailable = googleMapsSearchEnabled();
  const excludedCompanySet = new Set(
    uniqueStrings(options.excludedCompanyNames ?? []).map((value) => normalizeCompanyIdentity(value)),
  );
  const logs: string[] = [];
  const ownedDataset = await loadOwnedCompanies();
  const storedCandidates = mergeCandidates(
    ownedDataset.map((record) => storedRecordToCandidate(record)),
  ).filter(
    (candidate) =>
      datasetCandidateLooksRelevant(candidate, normalizedIcp) &&
      !looksExcluded(candidate, normalizedIcp) &&
      !excludedCompanySet.has(normalizeCompanyIdentity(candidate.companyName)),
  );
  const queryPlan = buildQueryCatalog(normalizedIcp, options.requestedLeadCount);
  const orderedQueries = interleaveQueries(queryPlan).slice(0, options.queryBudget);
  logs.push(
    `Loaded ${ownedDataset.length} companies from the owned dataset. ${storedCandidates.length} look relevant to this ICP.`,
  );
  logs.push(`Generated ${queryPlan.length} query variations for this ICP.`);
  logs.push(
    localPipelineEnabled
      ? "Local/Maps pipeline is enabled for this ICP."
      : "Local/Maps pipeline is disabled for this ICP because it looks software/SaaS-oriented.",
  );
  logs.push(
    mapsAvailable
      ? "Google Maps local search is configured."
      : "Google Maps local search is not configured.",
  );

  const searchHealth = await checkSearXngHealth();
  logs.push(searchHealth.message);

  if (!searchHealth.ok && storedCandidates.length === 0 && (!localPipelineEnabled || !mapsAvailable)) {
    throw new Error(
      `Lead generation could not start because SearXNG is unavailable at ${getSearXngBaseUrl()}. Start the SearXNG service or update SEARXNG_BASE_URL in .env.local.`,
    );
  }

  const runnableQueries = searchHealth.ok
    ? orderedQueries
    : orderedQueries.filter((query) => query.kind === "local_search" && mapsAvailable);

  logs.push(`Executing ${runnableQueries.length} queries across search, directory, jobs, and local pipelines.`);

  const directorySeeds = await collectDirectorySeeds(
    {
      geographies: normalizedIcp.geographies,
      industries: normalizedIcp.industries,
    },
    options.requestedLeadCount,
    async (query) => {
      if (!searchHealth.ok) {
        return [];
      }

      try {
        const results = await runSearxngQuery({
          kind: "directory",
          query,
          scoreHint: 88,
        });

        return results.map((result) => ({
          snippet: result.snippet,
          title: result.title,
          url: result.url,
        }));
      } catch {
        return [];
      }
    },
  );
  logs.push(`Collected ${directorySeeds.length} dedicated directory company seeds.`);

  const resolvedDirectoryResults: RawSearchResult[] = (
    await runInBatches(
      directorySeeds.slice(0, Math.min(Math.max(options.requestedLeadCount * 5, 20), 80)),
      4,
      async (seed) => {
        const officialResult = await findOfficialWebsiteForCompany(
          seed.companyName,
          normalizedIcp,
          seed.categoryHints,
          seed.locationHint,
        );

        if (!officialResult) {
          logs.push(`Directory seed ${seed.companyName} (${seed.directoryDomain}) could not be resolved to an official site.`);
          return null;
        }

        return {
          kind: "directory",
          query: `directory:${seed.directoryDomain}:${seed.companyName}`,
          snippet: normalizeWhitespace([seed.snippet, officialResult.snippet].filter(Boolean).join(" ")),
          title: seed.companyName,
          url: officialResult.url,
        } satisfies RawSearchResult;
      },
    )
  ).flatMap((result) => (result ? [result] : []));
  logs.push(`Resolved ${resolvedDirectoryResults.length} directory seeds to official websites.`);

  const searchResultsNested = await runInBatches(runnableQueries, 4, async (query) => {
    try {
      const results = await runSearchQuery(query);
      logs.push(`[${query.kind}] ${query.query} -> ${results.length} results`);
      return results;
    } catch (error) {
      logs.push(
        `[${query.kind}] ${query.query} -> failed (${error instanceof Error ? error.message : "unknown error"})`,
      );
      return [];
    }
  });
  const rawResults = [...searchResultsNested.flat(), ...resolvedDirectoryResults];
  const rawResultPool = rawResults.filter((result) => {
    const domain = safeDomainFromUrl(result.url);
    return domain ? !domainLooksLikeNoise(domain) : false;
  });
  const pipelineCounts = rawResultPool.reduce<Record<QueryKind, number>>(
    (counts, result) => {
      counts[result.kind] += 1;
      return counts;
    },
    {
      company_search: 0,
      directory: 0,
      job_signal: 0,
      local_search: 0,
    },
  );
  logs.push(`Collected ${rawResultPool.length} raw search results before domain dedupe.`);
  const crawlTargets = selectResultsForCrawl(rawResultPool);
  logs.push(`Prepared ${crawlTargets.length} crawl targets after domain-level pre-dedupe.`);

  const freshCandidates = (
    await runInBatches(
    crawlTargets.slice(0, Math.min(Math.max(options.requestedLeadCount * 12, 45), 160)),
    4,
    async (result) => {
      try {
        const candidate = await crawlCompany(result, normalizedIcp);

        if (!candidate) {
          return null;
        }

        logs.push(
          `Crawled ${candidate.domain} (${candidate.contacts.length} contacts, ${candidate.matchedSignals.length} signals).`,
        );
        return candidate;
      } catch (error) {
        logs.push(
          `Crawl failed for ${result.url}: ${error instanceof Error ? error.message : "unknown error"}.`,
        );
        return null;
      }
    },
  )
  ).filter((candidate): candidate is CompanyCandidate => Boolean(candidate));

  const persistedDataset = await upsertOwnedCompanies(freshCandidates.map((candidate) => candidateToStoredRecord(candidate)));
  logs.push(
    `Persisted ${freshCandidates.length} fresh companies into the owned dataset (${persistedDataset.totalCompanies} total stored).`,
  );

  const mergedUniverse = mergeCandidates([...storedCandidates, ...freshCandidates]);
  let excludedNonCompany = 0;
  let excludedSize = 0;
  let excludedDuplicates = 0;
  let excludedExclusions = 0;

  const mergedCandidates = mergedUniverse.filter((candidate) => {
    if (candidateLooksLikeNonCompanyEntity(candidate)) {
      excludedNonCompany += 1;
      return false;
    }

    if (failsHardSizeConstraints(candidate, normalizedIcp)) {
      excludedSize += 1;
      return false;
    }

    if (excludedCompanySet.has(normalizeCompanyIdentity(candidate.companyName))) {
      excludedDuplicates += 1;
      return false;
    }

    const exclusionText = normalizeToken(
      `${candidate.companyName} ${candidate.summary} ${candidate.textCorpus} ${candidate.sourceUrls.join(" ")}`,
    );

    if (normalizedIcp.exclusions.some((exclusion) => exclusionText.includes(normalizeToken(exclusion)))) {
      excludedExclusions += 1;
      return false;
    }

    return true;
  });
  logs.push(`Merged down to ${mergedCandidates.length} unique company domains after crawling.`);
  logs.push(
    `Excluded after crawl -> non-company: ${excludedNonCompany}, size: ${excludedSize}, exclusion rules: ${excludedExclusions}, duplicate history: ${excludedDuplicates}.`,
  );

  const scoredCandidates = mergedCandidates
    .map((candidate) => ({
      candidate,
      score: scoreCandidate(candidate, normalizedIcp),
    }))
    .sort((left, right) => right.score.percent - left.score.percent);

  const qualifiedCandidates = scoredCandidates.filter((entry) => entry.score.percent >= options.minMatchPercent);
  const finalLeads = qualifiedCandidates
    .slice(0, options.requestedLeadCount)
    .map((entry) => mapCandidateToLead(entry.candidate, entry.score, normalizedIcp));

  logs.push(
    `Scored ${scoredCandidates.length} candidates. ${qualifiedCandidates.length} cleared the ${options.minMatchPercent}% ICP match floor.`,
  );

  const diagnostics = {
    crawledDomains: freshCandidates.length,
    datasetCandidates: storedCandidates.length,
    datasetSize: ownedDataset.length,
    dedupedDomains: mergedCandidates.length,
    directorySeeds: directorySeeds.length,
    excludedDuplicates,
    excludedExclusions,
    excludedNonCompany,
    excludedSize,
    belowThreshold: Math.max(scoredCandidates.length - qualifiedCandidates.length, 0),
    finalLeads: finalLeads.length,
    localPipelineEnabled,
    localResults: pipelineCounts.local_search,
    minMatchPercent: options.minMatchPercent,
    pipelineCounts,
    queriesExecuted: orderedQueries.length,
    queriesGenerated: queryPlan.length,
    rawResults: rawResultPool.length,
    scoredCandidates: scoredCandidates.length,
  } satisfies GeneratedLeadDiagnostics;

  return {
    diagnostics,
    leads: finalLeads,
    logs,
    preview: buildBatchPreview(options.deliveryDate, finalLeads),
  } satisfies GeneratedLeadBatch;
}
