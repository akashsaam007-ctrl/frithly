import { get, getJson } from '../http';

export type AtsRef = { provider: 'greenhouse' | 'lever' | 'ashby' | 'workable' | 'smartrecruiters'; slug: string };
export interface Job { id: string; title: string; location: string; postedAt: Date; url: string; text?: string }

/** Strip HTML (and HTML-escaped HTML, which Greenhouse returns) to plain text. */
export const plain = (html = '') =>
  html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/<(br|\/p|\/li|\/h\d)[^>]*>/gi, '. ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const ATS_RE: [AtsRef['provider'], RegExp][] = [
  ['greenhouse', /(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/(?:embed\/job_board\?for=)?([a-z0-9_-]+)/i],
  ['lever', /jobs\.(?:eu\.)?lever\.co\/([a-z0-9_-]+)/i],
  ['ashby', /jobs\.ashbyhq\.com\/([a-z0-9_.-]+)/i],
  ['workable', /apply\.workable\.com\/([a-z0-9_-]+)/i],
  ['smartrecruiters', /(?:jobs|careers)\.smartrecruiters\.com\/([a-z0-9_-]+)/i],
];

/** Look at the homepage and /careers for a link to a known job board. */
export async function detectAts(domain: string): Promise<AtsRef | null> {
  for (const path of ['/', '/careers', '/jobs', '/company/careers']) {
    const r = await get(`https://${domain}${path}`);
    if (!r || r.status >= 400) continue;
    for (const [provider, re] of ATS_RE) {
      const m = r.text.match(re);
      if (m) return { provider, slug: m[1] };
    }
  }
  return null;
}

export async function fetchJobs(ref: AtsRef): Promise<Job[]> {
  if (ref.provider === 'greenhouse') {
    const d = await getJson<{ jobs: { id: number; title: string; location?: { name: string }; updated_at: string; first_published?: string; absolute_url: string }[] }>(
      `https://boards-api.greenhouse.io/v1/boards/${ref.slug}/jobs?content=true`,
    );
    return (d?.jobs ?? []).map((j) => ({ id: String(j.id), title: j.title, location: j.location?.name ?? '', postedAt: new Date(j.first_published ?? j.updated_at), url: j.absolute_url, text: plain((j as { content?: string }).content) }));
  }
  if (ref.provider === 'lever') {
    const d = await getJson<{ id: string; text: string; categories?: { location?: string }; createdAt: number; hostedUrl: string; descriptionPlain?: string; lists?: { text: string; content: string }[] }[]>(
      `https://api.lever.co/v0/postings/${ref.slug}?mode=json`,
    );
    return (d ?? []).map((j) => ({
      id: j.id, title: j.text, location: j.categories?.location ?? '', postedAt: new Date(j.createdAt), url: j.hostedUrl,
      text: [j.descriptionPlain ?? '', ...(j.lists ?? []).map((l) => `${l.text}: ${plain(l.content)}`)].join(' '),
    }));
  }
  if (ref.provider === 'workable') {
    const d = await getJson<{ jobs: { shortcode: string; title: string; city?: string; country?: string; published_on?: string; created_at?: string; url: string; description?: string }[] }>(
      `https://apply.workable.com/api/v1/widget/accounts/${ref.slug}?details=true`,
    );
    return (d?.jobs ?? []).map((j) => ({ id: j.shortcode, title: j.title, location: [j.city, j.country].filter(Boolean).join(', '), postedAt: new Date(j.published_on ?? j.created_at ?? Date.now()), url: j.url, text: plain(j.description) }));
  }
  if (ref.provider === 'smartrecruiters') {
    const d = await getJson<{ content: { id: string; name: string; releasedDate?: string; location?: { city?: string; country?: string }; ref?: string }[] }>(
      `https://api.smartrecruiters.com/v1/companies/${ref.slug}/postings?limit=100`,
    );
    return (d?.content ?? []).map((j) => ({ id: j.id, title: j.name, location: [j.location?.city, j.location?.country].filter(Boolean).join(', '), postedAt: new Date(j.releasedDate ?? Date.now()), url: `https://jobs.smartrecruiters.com/${ref.slug}/${j.id}` }));
  }
  const d = await getJson<{ jobs: { id: string; title: string; location?: string; publishedAt?: string; jobUrl: string }[] }>(
    `https://api.ashbyhq.com/posting-api/job-board/${ref.slug}`,
  );
  return (d?.jobs ?? []).map((j) => ({ id: j.id, title: j.title, location: j.location ?? '', postedAt: new Date(j.publishedAt ?? Date.now()), url: j.jobUrl, text: (j as { descriptionPlain?: string }).descriptionPlain }));
}

/** Group fresh postings that match the roles the user cares about into one signal. */
export function hiringSignal(jobs: Job[], roles: string[], maxAgeDays = 30) {
  const since = Date.now() - maxAgeDays * 86_400_000;
  const re = roles.length ? new RegExp(roles.map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i') : null;
  const hits = jobs.filter((j) => j.postedAt.getTime() >= since && (!re || re.test(j.title)));
  if (!hits.length) return null;
  const top = hits.slice(0, 3).map((j) => j.title);
  const label = hits.length === 1 ? `Hiring a ${hits[0].title}` : `Hiring ${hits.length} roles incl. ${top[0]}`;
  return {
    label,
    detail: `${hits.length} open role${hits.length > 1 ? 's' : ''} posted in the last ${maxAgeDays} days: ${top.join(', ')}${hits.length > 3 ? '…' : ''}`,
    url: hits[0].url,
    fingerprint: `hiring:${hits.map((h) => h.id).sort().join(',')}`,
  };
}

