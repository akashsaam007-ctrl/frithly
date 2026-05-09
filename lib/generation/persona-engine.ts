import "server-only";

export type PersonaContact = {
  confidence: number;
  email: string | null;
  linkedinUrl: string | null;
  name: string;
  title: string;
};

type ExtractPersonaOptions = {
  companyName: string;
  domain: string;
  titles: string[];
};

const GENERIC_INBOXES = ["hello", "info", "contact", "team", "sales", "marketing"];
const NAME_PARTICLES = new Set(["al", "bin", "da", "de", "del", "der", "di", "dos", "du", "la", "le", "van", "von"]);
const NAME_STOPWORDS = new Set([
  "about",
  "advantage",
  "ago",
  "and",
  "answers",
  "co",
  "community",
  "daily",
  "deal",
  "desk",
  "engineering",
  "featured",
  "for",
  "from",
  "growth",
  "hooray",
  "if",
  "including",
  "india",
  "is",
  "it",
  "jobs",
  "managing",
  "marketing",
  "member",
  "new",
  "outbound",
  "performance",
  "pipeline",
  "platform",
  "profile",
  "roles",
  "responsibilities",
  "said",
  "support",
  "team",
  "the",
  "view",
]);

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeNameFragment(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
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

function stripHtml(value: string) {
  return normalizeWhitespace(decodeHtml(value).replace(/<[^>]+>/g, " "));
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function dedupeContacts(contacts: PersonaContact[]) {
  const byKey = new Map<string, PersonaContact>();

  for (const contact of contacts) {
    const key = [
      normalizeToken(contact.name),
      normalizeToken(contact.title),
      contact.email?.trim().toLowerCase() ?? "",
      contact.linkedinUrl?.trim().toLowerCase() ?? "",
    ].join("|");
    const existing = byKey.get(key);

    if (!existing || existing.confidence < contact.confidence) {
      byKey.set(key, {
        ...contact,
        email: contact.email?.trim().toLowerCase() ?? null,
        linkedinUrl: contact.linkedinUrl?.trim() ?? null,
        name: normalizeWhitespace(contact.name),
        title: normalizeWhitespace(contact.title),
      });
    }
  }

  return [...byKey.values()];
}

function titleMatches(title: string, titles: string[]) {
  const normalized = normalizeToken(title);
  return titles.some((candidate) => normalized.includes(normalizeToken(candidate)));
}

function generatePatternEmails(name: string, domain: string) {
  const parts = normalizeWhitespace(name).split(/\s+/).filter(Boolean);
  const first = normalizeNameFragment(parts[0] ?? "");
  const last = normalizeNameFragment(parts.at(-1) ?? "");
  const f = first[0] ?? "";
  const l = last[0] ?? "";

  if (!domain || !first) {
    return [];
  }

  const patterns = [
    `${first}@${domain}`,
    first && last ? `${first}.${last}@${domain}` : "",
    first && last ? `${first}${last}@${domain}` : "",
    f && last ? `${f}${last}@${domain}` : "",
    first && l ? `${first}${l}@${domain}` : "",
    first && last ? `${last}.${first}@${domain}` : "",
    first && last ? `${last}${first}@${domain}` : "",
  ];

  return uniqueStrings(patterns.filter(Boolean));
}

function inferNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "";
  return localPart
    .split(/[._-]/)
    .filter((part) => part.length >= 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function slugToName(linkedinUrl: string) {
  try {
    const path = new URL(linkedinUrl).pathname;
    const slug = path.split("/").filter(Boolean).at(-1) ?? "";
    const cleaned = slug
      .replace(/-\d+$/, "")
      .split("-")
      .filter((part) => part.length >= 2)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return normalizeWhitespace(cleaned);
  } catch {
    return "";
  }
}

function isValidPersonName(name: string, companyName: string) {
  const normalized = normalizeWhitespace(name);

  if (!normalized || normalized.length < 3) {
    return false;
  }

  if (normalized.toLowerCase().includes(companyName.toLowerCase())) {
    return false;
  }

  if (
    /\b(daily|roles|deal desk|platform|support|careers|community|newsletter|podcast)\b/i.test(
      normalized,
    )
  ) {
    return false;
  }

  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length < 2 || words.length > 4) {
    return false;
  }

  for (const word of words) {
    const lower = word.toLowerCase();

    if (NAME_STOPWORDS.has(lower)) {
      return false;
    }

    const isParticle = NAME_PARTICLES.has(lower);
    const startsUpper = /^[A-Z][A-Za-z'’.-]+$/.test(word);
    const isInitial = /^[A-Z]\.?$/.test(word);

    if (!isParticle && !startsUpper && !isInitial) {
      return false;
    }
  }

  return true;
}

function extractSectionBlocks(html: string) {
  const sectionPattern =
    /<(section|div|li|article)[^>]*(?:team|leadership|leader|founder|member|bio|author|staff|people)[^>]*>([\s\S]{80,2200}?)<\/\1>/gi;
  const blocks: string[] = [];

  for (const match of html.matchAll(sectionPattern)) {
    blocks.push(match[2]);
  }

  return blocks;
}

function extractTextPatternContacts(
  textBlocks: string[],
  htmlBlocks: string[],
  options: ExtractPersonaOptions,
) {
  const contacts: PersonaContact[] = [];
  const normalizedTitles = uniqueStrings(options.titles);
  const titlePattern = normalizedTitles
    .sort((left, right) => right.length - left.length)
    .map((title) => title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  if (!titlePattern) {
    return contacts;
  }

  const namePattern = "[A-Z][A-Za-z'’.-]+(?:\\s+[A-Z][A-Za-z'’.-]+){1,3}";
  const patterns = [
    new RegExp(`(${namePattern})\\s*(?:[-|,:]|\\u2013|\\u2014)\\s*(${titlePattern})`, "gi"),
    new RegExp(`(${titlePattern})\\s*(?:[-|,:]|\\u2013|\\u2014)\\s*(${namePattern})`, "gi"),
  ];

  for (const block of [...textBlocks, ...htmlBlocks.map(stripHtml)]) {
    for (const pattern of patterns) {
      for (const match of block.matchAll(pattern)) {
        const candidateA = normalizeWhitespace(match[1] ?? "");
        const candidateB = normalizeWhitespace(match[2] ?? "");
        const name = titleMatches(candidateA, normalizedTitles) ? candidateB : candidateA;
        const title = titleMatches(candidateA, normalizedTitles) ? candidateA : candidateB;
        const lowerName = name.toLowerCase();

        if (
          !name ||
          !title ||
          lowerName.includes("team") ||
          lowerName.includes("contact") ||
          lowerName.includes(options.companyName.toLowerCase()) ||
          !isValidPersonName(name, options.companyName)
        ) {
          continue;
        }

        contacts.push({
          confidence: 0.84,
          email: generatePatternEmails(name, options.domain)[1] ?? generatePatternEmails(name, options.domain)[0] ?? null,
          linkedinUrl: null,
          name,
          title,
        });
      }
    }
  }

  return contacts;
}

function extractLinkedinProfileContacts(htmlBlocks: string[], options: ExtractPersonaOptions) {
  const contacts: PersonaContact[] = [];
  const profilePattern = /<a[^>]+href="([^"]*linkedin\.com\/in\/[^"]+)"[^>]*>([\s\S]{0,280}?)<\/a>/gi;

  for (const html of htmlBlocks) {
    for (const match of html.matchAll(profilePattern)) {
      const linkedinUrl = decodeHtml(match[1]);
      const anchorText = stripHtml(match[2] ?? "");
      const parentSlice = html.slice(Math.max(0, match.index - 600), Math.min(html.length, match.index + 1200));
      const blockText = stripHtml(parentSlice);
      const nameMatch = blockText.match(/[A-Z][A-Za-z'’.-]+(?:\s+[A-Z][A-Za-z'’.-]+){1,3}/);
      const title = options.titles.find((candidate) =>
        normalizeToken(blockText).includes(normalizeToken(candidate)),
      );
      const anchorName = normalizeWhitespace(anchorText);
      const slugName = slugToName(linkedinUrl);
      const fallbackName = normalizeWhitespace(nameMatch?.[0] ?? "");
      const name =
        [anchorName, slugName, fallbackName].find((candidate) =>
          isValidPersonName(candidate, options.companyName),
        ) ?? "";

      if (!name || !title || name.toLowerCase().includes("linkedin")) {
        continue;
      }

      contacts.push({
        confidence: 0.89,
        email: generatePatternEmails(name, options.domain)[1] ?? generatePatternEmails(name, options.domain)[0] ?? null,
        linkedinUrl,
        name,
        title,
      });
    }
  }

  return contacts;
}

function extractStructuredContacts(htmlBlocks: string[], options: ExtractPersonaOptions) {
  const contacts: PersonaContact[] = [];

  for (const html of htmlBlocks) {
    for (const match of html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    )) {
      try {
        const parsed = JSON.parse(match[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];

        for (const item of items.flatMap((entry) => (Array.isArray(entry?.member) ? entry.member : [entry]))) {
          const typeValue = Array.isArray(item?.["@type"]) ? item["@type"].join(" ") : item?.["@type"];
          const type = typeof typeValue === "string" ? typeValue.toLowerCase() : "";
          const name = typeof item?.name === "string" ? normalizeWhitespace(item.name) : "";
          const jobTitle = typeof item?.jobTitle === "string" ? normalizeWhitespace(item.jobTitle) : "";
          const sameAs =
            typeof item?.sameAs === "string"
              ? item.sameAs
              : Array.isArray(item?.sameAs)
                ? item.sameAs.find((value: unknown) => typeof value === "string" && value.includes("linkedin.com")) ?? null
                : null;
          const email = typeof item?.email === "string" ? item.email.replace(/^mailto:/i, "") : null;

          if (!name || (!jobTitle && !type.includes("person"))) {
            continue;
          }

          if (jobTitle && !titleMatches(jobTitle, options.titles)) {
            continue;
          }

          if (!isValidPersonName(name, options.companyName)) {
            continue;
          }

          contacts.push({
            confidence: 0.93,
            email,
            linkedinUrl: typeof sameAs === "string" ? sameAs : null,
            name,
            title: jobTitle || "Team member",
          });
        }
      } catch {
        continue;
      }
    }
  }

  return contacts;
}

function extractMailtoContacts(htmlBlocks: string[], options: ExtractPersonaOptions) {
  const contacts: PersonaContact[] = [];

  for (const html of htmlBlocks) {
    for (const match of html.matchAll(/mailto:([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi)) {
      const email = match[1].toLowerCase();
      const localPart = email.split("@")[0] ?? "";
      const inferredName = inferNameFromEmail(email);
      const finalName = isValidPersonName(inferredName, options.companyName)
        ? inferredName
        : `${options.companyName} team`;

      contacts.push({
        confidence: GENERIC_INBOXES.includes(localPart) ? 0.42 : 0.72,
        email,
        linkedinUrl: null,
        name: finalName,
        title: finalName === `${options.companyName} team` ? "Team inbox" : "Team member",
      });
    }
  }

  return contacts;
}

function rankContacts(contacts: PersonaContact[], titles: string[]) {
  return dedupeContacts(contacts)
    .map((contact) => {
      let score = contact.confidence * 100;
      const title = normalizeToken(contact.title);
      const localPart = contact.email?.split("@")[0] ?? "";

      if (titles.some((candidate) => title.includes(normalizeToken(candidate)))) {
        score += 30;
      }

      if (contact.linkedinUrl) {
        score += 18;
      }

      if (contact.email && !GENERIC_INBOXES.includes(localPart)) {
        score += 16;
      } else if (contact.email) {
        score -= 10;
      }

      if (contact.title.toLowerCase().includes("founder") || contact.title.toLowerCase().includes("ceo")) {
        score += 12;
      }

      return {
        contact,
        score,
      };
    })
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.contact);
}

export function extractPersonaContacts(
  textBlocks: string[],
  htmlBlocks: string[],
  options: ExtractPersonaOptions,
) {
  const sectionHtmlBlocks = htmlBlocks.flatMap((html) => extractSectionBlocks(html));
  const allHtmlBlocks = [...htmlBlocks, ...sectionHtmlBlocks];
  const patternContacts = extractTextPatternContacts(textBlocks, allHtmlBlocks, options);
  const linkedinContacts = extractLinkedinProfileContacts(allHtmlBlocks, options);
  const structuredContacts = extractStructuredContacts(allHtmlBlocks, options);
  const mailtoContacts = extractMailtoContacts(allHtmlBlocks, options);

  return rankContacts(
    [...structuredContacts, ...linkedinContacts, ...patternContacts, ...mailtoContacts],
    options.titles,
  );
}
