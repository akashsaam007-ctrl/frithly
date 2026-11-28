import { promises as sys } from 'node:dns';

/**
 * DNS with a DNS-over-HTTPS fallback (Google, then Cloudflare). Used when the system resolver
 * fails, or always when DNS_OVER_HTTPS=1 (serverless hosts and locked-down networks).
 */
async function doh(name: string, type: 'MX' | 'TXT'): Promise<string[] | null> {
  for (const base of ['https://dns.google/resolve', 'https://cloudflare-dns.com/dns-query']) {
    try {
      const r = await fetch(`${base}?name=${encodeURIComponent(name)}&type=${type}`, { headers: { accept: 'application/dns-json' }, signal: AbortSignal.timeout(8000) });
      if (!r.ok) continue;
      const d = (await r.json()) as { Status: number; Answer?: { type: number; data: string }[] };
      if (d.Status === 3) return []; // NXDOMAIN
      return (d.Answer ?? []).filter((a) => a.type === (type === 'MX' ? 15 : 16)).map((a) => a.data);
    } catch { /* try the next resolver */ }
  }
  return null;
}

const forced = () => process.env.DNS_OVER_HTTPS === '1';

export async function resolveMx(domain: string): Promise<{ exchange: string; priority: number }[]> {
  if (!forced()) {
    try { return await sys.resolveMx(domain); } catch (e) { if ((e as { code?: string }).code === 'ENOTFOUND') return []; }
  }
  const r = await doh(domain, 'MX');
  return (r ?? []).map((x) => { const [p, h] = x.split(/\s+/); return { priority: Number(p), exchange: (h ?? '').replace(/\.$/, '') }; }).filter((x) => x.exchange);
}

export async function resolveTxt(domain: string): Promise<string[]> {
  if (!forced()) {
    try { return (await sys.resolveTxt(domain)).map((x) => x.join('')); } catch (e) { if ((e as { code?: string }).code === 'ENOTFOUND') return []; }
  }
  // DoH returns each TXT record as quoted chunks: "abc" "def"
  return (await doh(domain, 'TXT') ?? []).map((t) => (t.match(/"((?:[^"\\]|\\.)*)"/g) ?? [t]).map((c) => c.replace(/^"|"$/g, '')).join(''));
}
