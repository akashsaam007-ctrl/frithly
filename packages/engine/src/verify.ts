import { resolveMx } from './dns';
import net from 'node:net';
import { randomBytes } from 'node:crypto';
import { emailCandidates, PERSONAL_DOMAINS } from '@frithly/core';

/**
 * In-house SMTP verification. Must run on a server with outbound port 25 open
 * (Hetzner/OVH after unblock request; AWS/GCP/Azure block it). Set VERIFY_HELO to a hostname
 * with matching forward/reverse DNS, and VERIFY_FROM to an address on a domain you own.
 */
export type RcptResult = 'valid' | 'invalid' | 'unknown';
export interface DomainProbe { mx: string | null; catchAll: boolean | null; results: Record<string, RcptResult>; error?: string }

export async function topMx(domain: string): Promise<string | null> {
  try {
    const mx = await resolveMx(domain);
    return mx.sort((a, b) => a.priority - b.priority)[0]?.exchange ?? null;
  } catch {
    return null;
  }
}

class SmtpLine {
  private buf = '';
  private waiters: ((s: string) => void)[] = [];
  constructor(private sock: net.Socket) {
    sock.on('data', (d) => {
      this.buf += d.toString('latin1');
      // A full reply ends with a line "NNN text" (space, not dash, after the code).
      const m = this.buf.match(/(?:^|\r\n)(\d{3}) [^\r\n]*\r\n$/);
      if (m && this.waiters.length) {
        const all = this.buf;
        this.buf = '';
        this.waiters.shift()!(all);
      }
    });
  }
  read(timeoutMs = 15000): Promise<number> {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('SMTP timeout')), timeoutMs);
      this.waiters.push((s) => {
        clearTimeout(t);
        const lines = s.trim().split('\r\n');
        resolve(Number(lines[lines.length - 1].slice(0, 3)));
      });
    });
  }
  async cmd(c: string, timeoutMs?: number) {
    this.sock.write(c + '\r\n');
    return this.read(timeoutMs);
  }
}

const classify = (code: number): RcptResult => (code === 250 || code === 251 ? 'valid' : code >= 550 && code <= 553 ? 'invalid' : 'unknown');

/** One SMTP session: checks a random address (catch-all test) and then each candidate. */
export async function probe(domain: string, candidates: string[], opts: { port?: number; host?: string } = {}): Promise<DomainProbe> {
  const mx = opts.host ?? (await topMx(domain));
  if (!mx) return { mx: null, catchAll: null, results: Object.fromEntries(candidates.map((c) => [c, 'invalid' as const])), error: 'No MX record' };
  const helo = process.env.VERIFY_HELO ?? 'verify.frithly.com';
  const from = process.env.VERIFY_FROM ?? 'verify@frithly.com';
  const sock = net.connect({ host: mx, port: opts.port ?? 25 });
  sock.setTimeout(20000);
  const results: Record<string, RcptResult> = {};
  try {
    await new Promise<void>((res, rej) => { sock.once('connect', () => res()); sock.once('error', rej); sock.once('timeout', () => rej(new Error('connect timeout'))); });
    const s = new SmtpLine(sock);
    if ((await s.read()) !== 220) throw new Error('No greeting');
    if ((await s.cmd(`EHLO ${helo}`)) !== 250 && (await s.cmd(`HELO ${helo}`)) !== 250) throw new Error('HELO rejected');
    if ((await s.cmd(`MAIL FROM:<${from}>`)) !== 250) throw new Error('MAIL FROM rejected');
    const fake = `zz${randomBytes(6).toString('hex')}@${domain}`;
    const fakeCode = await s.cmd(`RCPT TO:<${fake}>`);
    const catchAll = fakeCode === 250 || fakeCode === 251 ? true : fakeCode >= 550 ? false : null;
    for (const c of candidates) {
      results[c] = catchAll ? 'unknown' : classify(await s.cmd(`RCPT TO:<${c}>`));
      if (results[c] === 'valid') break; // stop at the first hit; fewer probes, less noise
    }
    await s.cmd('QUIT', 5000).catch(() => 0);
    return { mx, catchAll, results };
  } catch (e) {
    return { mx, catchAll: null, results, error: (e as Error).message };
  } finally {
    sock.destroy();
  }
}

export interface FoundEmail { email: string | null; status: 'valid' | 'catch_all' | 'invalid' | 'unknown' | 'none'; pattern?: string; source: string }

/** Optional paid fallback for catch-all domains (Prospeo). Only called when PROSPEO_API_KEY is set. */
async function prospeo(fullName: string, domain: string): Promise<FoundEmail | null> {
  const key = process.env.PROSPEO_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch('https://api.prospeo.io/email-finder', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'X-KEY': key },
      body: JSON.stringify({ full_name: fullName, company: domain }),
      signal: AbortSignal.timeout(20000),
    });
    const d = (await r.json()) as { error?: boolean; response?: { email?: string; email_status?: string } };
    const email = d.response?.email;
    if (d.error || !email) return null;
    return { email, status: /valid/i.test(d.response?.email_status ?? '') ? 'valid' : 'catch_all', source: 'prospeo' };
  } catch {
    return null;
  }
}

export interface DomainCache { mx?: string | null; catchAll?: boolean | null; pattern?: string | null }

/** Permutations → SMTP probe → fallback. Returns what was found plus what we learned about the domain. */
export async function findEmail(fullName: string, domain: string, cache: DomainCache = {}): Promise<{ found: FoundEmail; learned: DomainCache }> {
  if (PERSONAL_DOMAINS.has(domain)) return { found: { email: null, status: 'none', source: 'skip' }, learned: {} };
  const cands = emailCandidates(fullName, domain, cache.pattern ?? undefined).slice(0, 8);
  if (!cands.length) return { found: { email: null, status: 'none', source: 'none' }, learned: {} };

  if (cache.catchAll === true) {
    const paid = await prospeo(fullName, domain);
    if (paid) return { found: paid, learned: {} };
    return { found: { email: cands[0].email, status: 'catch_all', pattern: cands[0].pattern, source: 'pattern' }, learned: {} };
  }

  const p = await probe(domain, cands.map((c) => c.email));
  const learned: DomainCache = { mx: p.mx, catchAll: p.catchAll };
  if (!p.mx) return { found: { email: null, status: 'invalid', source: 'smtp' }, learned };
  const hit = cands.find((c) => p.results[c.email] === 'valid');
  if (hit) return { found: { email: hit.email, status: 'valid', pattern: hit.pattern, source: 'smtp' }, learned: { ...learned, pattern: hit.pattern } };
  if (p.catchAll) {
    const paid = await prospeo(fullName, domain);
    if (paid) return { found: paid, learned };
    return { found: { email: cands[0].email, status: 'catch_all', pattern: cands[0].pattern, source: 'pattern' }, learned };
  }
  const allInvalid = cands.every((c) => p.results[c.email] === 'invalid');
  return { found: { email: null, status: allInvalid ? 'invalid' : 'unknown', source: 'smtp' }, learned };
}
