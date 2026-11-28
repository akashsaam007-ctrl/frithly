import * as cheerio from 'cheerio';
import { get } from '../http';

export interface NewsItem { title: string; url: string; at: Date; source: string; kind: 'funding' | 'news' }

const FUNDING = /\b(raises?|raised|funding|series [a-e]|seed round|pre-seed|investment|backed by|secures? \$|₹\s?\d+\s?(crore|cr))/i;
const NOTABLE = /\b(launch(es|ed)?|expands?|acquires?|acquired|partners? with|opens?|appoints?|names .* (ceo|cro|vp))/i;

/** Google News RSS search for the company name. Only items from the last `days` days. */
export async function scanNews(companyName: string, domain: string, days = 45): Promise<NewsItem[]> {
  const q = encodeURIComponent(`"${companyName}"`);
  const r = await get(`https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`, { skipRobots: true });
  if (!r || r.status >= 400) return [];
  const $ = cheerio.load(r.text, { xml: true });
  const since = Date.now() - days * 86_400_000;
  const root = domain.split('.')[0].toLowerCase();
  const out: NewsItem[] = [];
  $('item').each((_, el) => {
    const title = $(el).find('title').text();
    const at = new Date($(el).find('pubDate').text());
    if (!(at.getTime() >= since)) return;
    const low = title.toLowerCase();
    if (!low.includes(companyName.toLowerCase()) && !low.includes(root)) return;
    const kind = FUNDING.test(title) ? 'funding' : NOTABLE.test(title) ? 'news' : null;
    if (!kind) return;
    out.push({ title, url: $(el).find('link').text(), at, source: $(el).find('source').text(), kind });
  });
  return out.sort((a, b) => b.at.getTime() - a.at.getTime());
}
