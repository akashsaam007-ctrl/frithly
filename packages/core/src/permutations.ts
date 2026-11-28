/** Email address candidates from a person's name and company domain, most common patterns first. */
const strip = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .trim();

export function splitName(full: string) {
  const parts = strip(full)
    .split(/[\s-]+/)
    .filter((p) => p && !['mr', 'mrs', 'ms', 'dr', 'jr', 'sr', 'ii', 'iii'].includes(p));
  return { first: parts[0] ?? '', last: parts.length > 1 ? parts[parts.length - 1] : '', middle: parts.slice(1, -1) };
}

/**
 * Ordered by how often the pattern is seen at small and mid-size B2B companies.
 * If the domain's pattern is already known (from an earlier verified address), pass it as `knownPattern`
 * and it is tried first.
 */
export const PATTERNS = [
  '{f}', // first@
  '{f}.{l}',
  '{f}{l}',
  '{fi}{l}',
  '{f}{li}',
  '{fi}.{l}',
  '{f}_{l}',
  '{l}',
  '{l}.{f}',
  '{f}-{l}',
  '{l}{fi}',
  '{fi}{li}',
] as const;

export function emailCandidates(fullName: string, domain: string, knownPattern?: string): { email: string; pattern: string }[] {
  const { first: f, last: l } = splitName(fullName);
  if (!f) return [];
  const vars: Record<string, string> = { '{f}': f, '{l}': l, '{fi}': f[0] ?? '', '{li}': l[0] ?? '' };
  const order = knownPattern ? [knownPattern, ...PATTERNS.filter((p) => p !== knownPattern)] : [...PATTERNS];
  const out: { email: string; pattern: string }[] = [];
  const seen = new Set<string>();
  for (const p of order) {
    if (!l && /\{l\}|\{li\}/.test(p)) continue;
    const local = p.replace(/\{fi\}|\{li\}|\{f\}|\{l\}/g, (m) => vars[m]);
    const email = `${local}@${domain.toLowerCase()}`;
    if (!seen.has(email)) {
      seen.add(email);
      out.push({ email, pattern: p });
    }
  }
  return out;
}

export function detectPattern(email: string, fullName: string): string | null {
  const [local, domain] = email.toLowerCase().split('@');
  if (!domain) return null;
  return emailCandidates(fullName, domain).find((c) => c.email.split('@')[0] === local)?.pattern ?? null;
}

export const PERSONAL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.in', 'outlook.com', 'hotmail.com', 'live.com',
  'icloud.com', 'proton.me', 'protonmail.com', 'rediffmail.com', 'aol.com', 'zoho.com',
]);

export const ROLE_LOCALS = new Set(['info', 'hello', 'contact', 'sales', 'support', 'admin', 'team', 'office', 'hr', 'careers', 'jobs', 'press', 'marketing']);
