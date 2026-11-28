import { get, getJson } from '../http';

export type AtsRef = { provider: 'greenhouse' | 'lever' | 'ashby'; slug: string };
export interface Job { id: string; title: string; location: string; postedAt: Date; url: string }

const ATS_RE: [AtsRef['provider'], RegExp][] = [
  ['greenhouse', /(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/(?:embed\/job_board\?for=)?([a-z0-9_-]+)/i],
  ['lever', /jobs\.(?:eu\.)?lever\.co\/([a-z0-9_-]+)/i],
  ['ashby', /jobs\.ashbyhq\.com\/([a-z0-9_.-]+)/i],
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
      `https://boards-api.greenhouse.io/v1/boards/${ref.slug}/jobs`,
    );
    return (d?.jobs ?? []).map((j) => ({ id: String(j.id), title: j.title, location: j.location?.name ?? '', postedAt: new Date(j.first_published ?? j.updated_at), url: j.absolute_url }));
  }
  if (ref.provider === 'lever') {
    const d = await getJson<{ id: string; text: string; categories?: { location?: string }; createdAt: number; hostedUrl: string }[]>(
      `https://api.lever.co/v0/postings/${ref.slug}?mode=json`,
    );
    return (d ?? []).map((j) => ({ id: j.id, title: j.text, location: j.categories?.location ?? '', postedAt: new Date(j.createdAt), url: j.hostedUrl }));
  }
  const d = await getJson<{ jobs: { id: string; title: string; location?: string; publishedAt?: string; jobUrl: string }[] }>(
    `https://api.ashbyhq.com/posting-api/job-board/${ref.slug}`,
  );
  return (d?.jobs ?? []).map((j) => ({ id: j.id, title: j.title, location: j.location ?? '', postedAt: new Date(j.publishedAt ?? Date.now()), url: j.jobUrl }));
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

