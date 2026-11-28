import { resolveMx, resolveTxt } from '../dns';
import { mxProvider, txtVendors } from '@frithly/core';
import { get, getJson } from '../http';

/** Public DNS footprint: vendor verification strings, mail provider, SPF senders. */
export interface DnsState { vendors: string[]; mx: string; spf: string[] }

export async function dnsState(domain: string): Promise<DnsState | null> {
  try {
    const [txt, mx] = await Promise.all([
      resolveTxt(domain).catch(() => [] as string[]),
      resolveMx(domain).then((r) => r.sort((a, b) => a.priority - b.priority).map((x) => x.exchange)).catch(() => [] as string[]),
    ]);
    if (!txt.length && !mx.length) return null;
    const spf = txt.find((t) => t.startsWith('v=spf1'))?.match(/include:([^\s]+)/g)?.map((x) => x.slice(8)).sort() ?? [];
    return { vendors: txtVendors(txt), mx: mxProvider(mx), spf };
  } catch {
    return null;
  }
}

/** Subdomains seen in public certificate transparency logs (crt.sh), with first issue date. */
export async function certSubdomains(domain: string, sinceDays = 120): Promise<{ name: string; firstSeen: Date }[]> {
  const r = await get(`https://crt.sh/?q=${encodeURIComponent(`%.${domain}`)}&output=json&exclude=expired`, { json: true, skipRobots: true, timeoutMs: 45000 });
  if (!r || r.status >= 400) return [];
  let rows: { name_value: string; not_before: string }[] = [];
  try { rows = JSON.parse(r.text); } catch { return []; }
  const since = Date.now() - sinceDays * 86_400_000;
  const first = new Map<string, Date>();
  for (const row of rows) {
    const at = new Date(row.not_before + 'Z');
    for (const n of row.name_value.split('\n')) {
      const name = n.trim().toLowerCase().replace(/^\*\./, '');
      if (!name.endsWith(domain) || name === domain) continue;
      const prev = first.get(name);
      if (!prev || at < prev) first.set(name, at);
    }
  }
  return [...first.entries()].filter(([, d]) => d.getTime() >= since).map(([name, firstSeen]) => ({ name, firstSeen }));
}

/* ---------- GitHub ---------- */
const NOT_ORGS = new Set(['features', 'about', 'pricing', 'login', 'sponsors', 'topics', 'collections', 'marketplace', 'orgs', 'apps', 'site', 'enterprise']);

export function githubOrgFromHtml(html: string): string | null {
  for (const m of html.matchAll(/github\.com\/([A-Za-z0-9-]{2,39})(?=["'/?#\s])/g)) {
    if (!NOT_ORGS.has(m[1].toLowerCase())) return m[1];
  }
  return null;
}

/** Dependencies worth noticing: SaaS SDKs, clouds and AI providers. Everything else is noise. */
const NOTABLE: [string, RegExp][] = [
  ['Stripe', /^stripe$|^@stripe\//], ['Segment', /^@segment\/|^analytics-node$/], ['PostHog', /posthog/], ['Mixpanel', /mixpanel/],
  ['Amplitude', /amplitude/], ['Datadog', /datadog|dd-trace/], ['Sentry', /^@sentry\/|^sentry-sdk$/], ['New Relic', /newrelic/],
  ['Auth0', /auth0/], ['Okta', /okta/], ['Clerk', /^@clerk\//], ['Supabase', /supabase/], ['Firebase', /firebase/],
  ['AWS', /^@aws-sdk\/|^aws-sdk$|^boto3$|hashicorp\/aws/], ['Google Cloud', /^@google-cloud\/|^google-cloud-|hashicorp\/google/], ['Azure', /^@azure\/|^azure-|hashicorp\/azurerm/],
  ['OpenAI', /^openai$/], ['Anthropic', /anthropic/], ['LangChain', /langchain/], ['Twilio', /twilio/], ['SendGrid', /sendgrid/],
  ['Algolia', /algolia/], ['Elastic', /elasticsearch|@elastic\//], ['Kafka', /kafka/], ['Snowflake', /snowflake/], ['dbt', /^dbt-/],
  ['HubSpot', /hubspot/], ['Salesforce', /jsforce|simple-salesforce|salesforce/], ['Intercom', /intercom/], ['LaunchDarkly', /launchdarkly/],
];

const MANIFESTS = ['package.json', 'requirements.txt', 'pyproject.toml', 'go.mod', 'main.tf'];

function depNames(file: string, body: string): string[] {
  if (file === 'package.json') {
    try { const j = JSON.parse(body); return Object.keys({ ...j.dependencies, ...j.devDependencies }); } catch { return []; }
  }
  if (file === 'requirements.txt') return body.split('\n').map((l) => l.split(/[=<>~!\[; ]/)[0].trim().toLowerCase()).filter(Boolean);
  if (file === 'pyproject.toml') return [...body.matchAll(/^\s*"?([A-Za-z0-9_.-]+)"?\s*[=<>~]/gm)].map((m) => m[1].toLowerCase());
  if (file === 'go.mod') return [...body.matchAll(/^\s*([a-z0-9.-]+\/[^\s]+)\s+v/gm)].map((m) => m[1]);
  if (file === 'main.tf') return [...body.matchAll(/source\s*=\s*"([^"]+)"/g)].map((m) => m[1]);
  return [];
}

/** Notable tools used across an org's 5 most recently pushed public repos. */
export async function githubStack(org: string): Promise<{ tools: string[]; repos: string[] } | null> {
  const headers: Record<string, string> = { accept: 'application/vnd.github+json', 'user-agent': 'FrithlyBot' };
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const r = await fetch(`https://api.github.com/orgs/${org}/repos?sort=pushed&per_page=15&type=public`, { headers, signal: AbortSignal.timeout(20000) }).catch(() => null);
  if (!r || !r.ok) return null;
  const repos = ((await r.json()) as { name: string; fork: boolean; archived: boolean; default_branch: string }[]).filter((x) => !x.fork && !x.archived).slice(0, 5);
  const tools = new Set<string>();
  for (const repo of repos) {
    for (const f of MANIFESTS) {
      const raw = await get(`https://raw.githubusercontent.com/${org}/${repo.name}/${repo.default_branch}/${f}`, { skipRobots: true, timeoutMs: 10000 });
      if (!raw || raw.status >= 400) continue;
      for (const d of depNames(f, raw.text)) for (const [n, re] of NOTABLE) if (re.test(d)) tools.add(n);
    }
  }
  return { tools: [...tools].sort(), repos: repos.map((x) => x.name) };
}

/* ---------- Hacker News ---------- */
export async function hnLaunches(companyName: string, domain: string, days = 45) {
  const since = Math.floor((Date.now() - days * 86_400_000) / 1000);
  const d = await getJson<{ hits: { title: string; url?: string; objectID: string; created_at: string }[] }>(
    `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(companyName)}&tags=(show_hn,launch_hn)&numericFilters=created_at_i>${since}`,
  );
  return (d?.hits ?? [])
    // Their own launch: the post links to their site, or it's "Launch HN: <Name>".
    .filter((h) => {
      let host = '';
      try { host = new URL(h.url ?? '').hostname.replace(/^www\./, ''); } catch { /* text post */ }
      return host === domain || host.endsWith(`.${domain}`) || new RegExp(`^Launch HN: ${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(h.title);
    })
    .map((h) => ({ title: h.title, url: `https://news.ycombinator.com/item?id=${h.objectID}`, at: new Date(h.created_at) }));
}
