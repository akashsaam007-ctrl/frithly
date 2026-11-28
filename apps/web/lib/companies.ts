import 'server-only';
import { companies, db } from '@frithly/db';
import { PERSONAL_DOMAINS } from '@frithly/core';

export function normDomain(raw: string) {
  let d = raw.trim().toLowerCase();
  if (!d) return null;
  d = d.replace(/^[a-z]+:\/\//, '').replace(/^www\./, '').split(/[/?#\s]/)[0];
  if (d.includes('@')) d = d.split('@')[1];
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d) || PERSONAL_DOMAINS.has(d)) return null;
  return d;
}

/**
 * Accepts one company per line: `domain` or CSV `domain,name,industry,size,country`.
 * A header row is skipped. Returns how many were new.
 */
export async function importCompanies(workspaceId: string, text: string, source = 'import') {
  const rows = text.split(/\r?\n/).map((l) => l.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));
  let added = 0, skipped = 0;
  for (const [d, name, industry, size, country] of rows) {
    const domain = normDomain(d ?? '');
    if (!domain) { if (d && !/domain|website/i.test(d)) skipped++; continue; }
    const r = await db.insert(companies).values({
      workspaceId, domain, name: name || domain, industry: industry || null, size: size || null, country: country || null, source,
    }).onConflictDoNothing().returning({ id: companies.id });
    if (r.length) added++;
  }
  return { added, skipped };
}
