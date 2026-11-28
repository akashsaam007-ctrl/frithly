/** Polite fetch for scanners: timeout, identifying user agent, per-host spacing, robots.txt respect. */
const UA = process.env.SCANNER_USER_AGENT ?? 'FrithlyBot/1.0 (+https://frithly.com/bot)';
const lastHit = new Map<string, number>();
const robotsCache = new Map<string, string[]>();
const MIN_GAP_MS = 1500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function spacing(host: string) {
  const last = lastHit.get(host) ?? 0;
  const wait = last + MIN_GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastHit.set(host, Date.now());
}

async function disallowed(url: URL): Promise<boolean> {
  if (!robotsCache.has(url.host)) {
    let rules: string[] = [];
    try {
      const r = await fetch(`${url.protocol}//${url.host}/robots.txt`, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(8000) });
      if (r.ok) {
        let applies = false;
        for (const raw of (await r.text()).split('\n')) {
          const line = raw.split('#')[0].trim();
          const [k, ...rest] = line.split(':');
          const v = rest.join(':').trim();
          if (/^user-agent$/i.test(k)) applies = v === '*' || /frithly/i.test(v);
          else if (applies && /^disallow$/i.test(k) && v) rules.push(v);
        }
      }
    } catch { rules = []; }
    robotsCache.set(url.host, rules);
  }
  return robotsCache.get(url.host)!.some((p) => url.pathname.startsWith(p));
}

export interface GetOpts { json?: boolean; timeoutMs?: number; skipRobots?: boolean }

/** Returns null on any failure, so scanners can just move on. */
export async function get(urlStr: string, o: GetOpts = {}): Promise<{ status: number; text: string; url: string } | null> {
  try {
    const url = new URL(urlStr);
    if (!o.skipRobots && (await disallowed(url))) return null;
    await spacing(url.host);
    const r = await fetch(url, {
      headers: { 'user-agent': UA, accept: o.json ? 'application/json' : 'text/html,application/xhtml+xml,*/*' },
      redirect: 'follow',
      signal: AbortSignal.timeout(o.timeoutMs ?? 15000),
    });
    const text = await r.text();
    return { status: r.status, text: text.slice(0, 2_000_000), url: r.url };
  } catch {
    return null;
  }
}

export async function getJson<T>(url: string): Promise<T | null> {
  const r = await get(url, { json: true, skipRobots: true });
  if (!r || r.status >= 400) return null;
  try { return JSON.parse(r.text) as T; } catch { return null; }
}
