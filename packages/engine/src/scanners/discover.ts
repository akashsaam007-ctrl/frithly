/**
 * Company discovery for users who don't bring their own list: companies currently hiring for
 * the roles the user cares about, via TheirStack (paid, optional; THEIRSTACK_API_KEY).
 */
export interface Discovered {
  domain: string; name: string; industry?: string; size?: string; country?: string;
  jobTitle: string; jobUrl?: string; postedAt: Date; jobId: string;
}

const ISO: Record<string, string> = {
  india: 'IN', 'united states': 'US', usa: 'US', us: 'US', 'united kingdom': 'GB', uk: 'GB', canada: 'CA', australia: 'AU',
  germany: 'DE', france: 'FR', netherlands: 'NL', singapore: 'SG', 'united arab emirates': 'AE', uae: 'AE', ireland: 'IE',
  spain: 'ES', sweden: 'SE', israel: 'IL', brazil: 'BR', japan: 'JP', 'new zealand': 'NZ', switzerland: 'CH',
};
export const countryCodes = (names: string[]) => names.map((n) => (n.length === 2 ? n.toUpperCase() : ISO[n.trim().toLowerCase()])).filter(Boolean) as string[];

const sizeBand = (n?: number) => (!n ? undefined : n <= 10 ? '1-10' : n <= 50 ? '11-50' : n <= 200 ? '51-200' : n <= 1000 ? '201-1000' : '1000+');

export async function discoverHiring(roles: string[], countries: string[], limit = 50, maxAgeDays = 14): Promise<Discovered[]> {
  const key = process.env.THEIRSTACK_API_KEY;
  if (!key || !roles.length) return [];
  const codes = countryCodes(countries);
  const r = await fetch('https://api.theirstack.com/v1/jobs/search', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ job_title_or: roles, ...(codes.length ? { job_country_code_or: codes } : {}), posted_at_max_age_days: maxAgeDays, limit, page: 0 }),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error(`TheirStack ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const d = (await r.json()) as { data: { id: number; job_title: string; url?: string; date_posted?: string; company?: string; company_domain?: string; country_code?: string; company_object?: { name?: string; domain?: string; industry?: string; employee_count?: number; country_code?: string } }[] };
  const seen = new Set<string>();
  const out: Discovered[] = [];
  for (const j of d.data ?? []) {
    const domain = (j.company_domain ?? j.company_object?.domain ?? '').toLowerCase().replace(/^www\./, '');
    if (!domain || seen.has(domain)) continue;
    seen.add(domain);
    out.push({
      domain, name: j.company_object?.name ?? j.company ?? domain, industry: j.company_object?.industry,
      size: sizeBand(j.company_object?.employee_count), country: j.company_object?.country_code ?? j.country_code,
      jobTitle: j.job_title, jobUrl: j.url, postedAt: j.date_posted ? new Date(j.date_posted) : new Date(), jobId: String(j.id),
    });
  }
  return out;
}
