import * as cheerio from 'cheerio';
import { get } from './http';
import { visibleText } from './scanners/site';
import { extractPeople, type Person } from './ai';

const TEAM_PATHS = ['/about', '/about-us', '/team', '/our-team', '/company', '/leadership', '/people', '/contact'];

/** Gather text from the pages most likely to name the team, following links found on the homepage first. */
export async function teamPageText(domain: string): Promise<string> {
  const paths = new Set<string>();
  const home = await get(`https://${domain}/`);
  if (home && home.status < 400) {
    const $ = cheerio.load(home.text);
    $('a[href]').each((_, a) => {
      const href = $(a).attr('href') ?? '';
      if (!/about|team|leadership|people|founder|company/i.test(href)) return;
      try {
        const u = new URL(href, `https://${domain}/`);
        if (u.hostname.replace(/^www\./, '') === domain.replace(/^www\./, '')) paths.add(u.pathname);
      } catch { /* ignore bad links */ }
    });
  }
  TEAM_PATHS.forEach((p) => paths.add(p));
  const chunks: string[] = [];
  for (const p of [...paths].slice(0, 6)) {
    const r = await get(`https://${domain}${p}`);
    if (!r || r.status >= 400) continue;
    const $ = cheerio.load(r.text);
    const li = $('a[href*="linkedin.com/in/"]').map((_, a) => $(a).attr('href')).get().join(' ');
    chunks.push(`[${p}] ${visibleText(r.text).slice(0, 4000)} ${li}`);
    if (chunks.join(' ').length > 12000) break;
  }
  return chunks.join('\n');
}

export async function findPeople(domain: string): Promise<Person[]> {
  return extractPeople(domain, await teamPageText(domain));
}
