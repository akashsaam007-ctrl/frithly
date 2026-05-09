import "server-only";

export type DirectorySeed = {
  categoryHints: string[];
  companyName: string;
  directoryDomain: string;
  locationHint: string | null;
  profileUrl: string;
  snippet: string;
};

type DirectoryQueryResult = {
  snippet: string;
  title: string;
  url: string;
};

type NormalizedDirectoryIcp = {
  geographies: string[];
  industries: string[];
};

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
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

function safeDomainFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function extractCompanyNameFromDirectoryResult(title: string, snippet: string, domain: string) {
  const combined = normalizeWhitespace(`${title} | ${snippet}`);
  const parts = combined
    .split(/[|\-–:]/)
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean)
    .filter(
      (part) =>
        part.length >= 3 &&
        !/reviews?|clutch|goodfirms|g2|capterra|product hunt|compare|top companies|best/i.test(part),
    );

  if (parts.length > 0) {
    return parts[0];
  }

  const root = domain.split(".")[0] ?? domain;
  return root
    .split(/[-_]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function seedLooksLikeNonCompany(title: string, snippet: string, companyName: string, url: string) {
  const text = normalizeToken(`${title} ${snippet} ${companyName} ${url}`);

  return /\b(careers?|jobs?|community|magazine|media|news|journal|guide|wiki|documentation|support|academy|answers|events)\b/.test(
    text,
  );
}

function buildDirectoryQueries(icp: NormalizedDirectoryIcp, requestedLeadCount: number) {
  const industries = icp.industries.length > 0 ? icp.industries : ["b2b saas"];
  const geographies =
    (icp.geographies.length > 0 ? icp.geographies : ["United States"]).map(searchGeographyLabel);
  const queries = new Map<string, string>();

  for (const industry of industries.slice(0, 4)) {
    queries.set(`site:clutch.co ${industry}`, `site:clutch.co "${industry}" company`);
    queries.set(`site:goodfirms.co ${industry}`, `site:goodfirms.co "${industry}" company`);

    for (const geography of geographies.slice(0, 3)) {
      queries.set(
        `site:clutch.co ${industry} ${geography}`,
        `site:clutch.co "${industry}" "${geography}" company`,
      );
      queries.set(
        `site:goodfirms.co ${industry} ${geography}`,
        `site:goodfirms.co "${industry}" "${geography}" company`,
      );
    }
  }

  return [...queries.values()].slice(0, Math.max(requestedLeadCount * 4, 16));
}

export async function collectDirectorySeeds(
  icp: NormalizedDirectoryIcp,
  requestedLeadCount: number,
  search: (query: string) => Promise<DirectoryQueryResult[]>,
) {
  const seeds = new Map<string, DirectorySeed>();
  const queries = buildDirectoryQueries(icp, requestedLeadCount);

  for (const query of queries) {
    const results = await search(query);

    for (const result of results) {
      const directoryDomain = safeDomainFromUrl(result.url);

      if (!directoryDomain) {
        continue;
      }

      const companyName = extractCompanyNameFromDirectoryResult(
        result.title,
        result.snippet,
        directoryDomain,
      );

      if (seedLooksLikeNonCompany(result.title, result.snippet, companyName, result.url)) {
        continue;
      }

      const key = normalizeToken(companyName);
      const existing = seeds.get(key);

      const nextSeed: DirectorySeed = {
        categoryHints: uniqueStrings([
          ...icp.industries.slice(0, 4),
          ...result.title.split(/[|\-–:]/).map((part) => normalizeWhitespace(part)),
        ]).slice(0, 8),
        companyName,
        directoryDomain,
        locationHint:
          icp.geographies.find((geo) =>
            normalizeToken(`${result.title} ${result.snippet}`).includes(
              normalizeToken(searchGeographyLabel(geo)),
            ),
          ) ?? null,
        profileUrl: result.url,
        snippet: normalizeWhitespace(result.snippet),
      };

      if (!existing || nextSeed.snippet.length > existing.snippet.length) {
        seeds.set(key, nextSeed);
      }
    }
  }

  return [...seeds.values()];
}
