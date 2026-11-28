import 'server-only';
import { resolveTxt } from '@frithly/engine';

/** SPF, DKIM and DMARC for a sending domain. DKIM is checked on the usual selectors for Google, Microsoft and Zoho. */
export async function domainHealth(domain: string): Promise<[boolean, boolean, boolean]> {
  const safe = (n: string) => resolveTxt(n).catch(() => [] as string[]);
  const [root, dmarc, ...dk] = await Promise.all([
    safe(domain), safe(`_dmarc.${domain}`),
    ...['google', 'selector1', 'selector2', 'zmail', 'default', 's1', 'k1'].map((s) => safe(`${s}._domainkey.${domain}`)),
  ]);
  return [root.some((t) => t.startsWith('v=spf1')), dk.some((r) => r.some((t) => /v=DKIM1|k=rsa|p=/.test(t))), dmarc.some((t) => t.startsWith('v=DMARC1'))];
}
