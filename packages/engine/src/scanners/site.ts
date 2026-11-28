import * as cheerio from 'cheerio';
import { sha256 } from '@frithly/core';
import { get } from '../http';
import { githubOrgFromHtml } from './infra';

/** Fingerprints for common tools, matched against raw HTML. */
const TECH: [string, RegExp][] = [
  ['HubSpot', /js\.hs-scripts\.com|hs-analytics|hubspot/i],
  ['Salesforce', /force\.com|pardot/i],
  ['Intercom', /widget\.intercom\.io|intercomSettings/i],
  ['Drift', /js\.driftt\.com/i],
  ['Segment', /cdn\.segment\.com/i],
  ['Google Tag Manager', /googletagmanager\.com\/gtm/i],
  ['Shopify', /cdn\.shopify\.com|myshopify\.com/i],
  ['WordPress', /wp-content|wp-includes/i],
  ['Webflow', /webflow\.(com|io)/i],
  ['Wix', /static\.wixstatic\.com/i],
  ['Stripe', /js\.stripe\.com/i],
  ['Zendesk', /zdassets\.com|zendesk/i],
  ['Calendly', /calendly\.com/i],
  ['Hotjar', /static\.hotjar\.com/i],
  ['Mixpanel', /cdn\.mxpnl\.com|mixpanel/i],
  ['Next.js', /__NEXT_DATA__|_next\/static/i],
];

export const detectTech = (html: string) => TECH.filter(([, re]) => re.test(html)).map(([n]) => n);

/** Visible text only, numbers kept, whitespace collapsed; so a re-deploy doesn't look like a change. */
export function visibleText(html: string) {
  const $ = cheerio.load(html);
  $('script,style,noscript,svg,iframe').remove();
  return $('body').text().replace(/\s+/g, ' ').trim();
}

export interface SiteScan {
  ok: boolean;
  name?: string;
  hash?: string;
  tech: string[];
  text: string;
  pricingText?: string;
  pricingHash?: string;
  githubOrg?: string | null;
  problems: string[];
}

export async function scanSite(domain: string): Promise<SiteScan> {
  const t0 = Date.now();
  const home = await get(`https://${domain}/`);
  const ms = Date.now() - t0;
  if (!home || home.status >= 400) return { ok: false, tech: [], text: '', problems: ['Website did not load'] };
  const $ = cheerio.load(home.text);
  const name = ($('meta[property="og:site_name"]').attr('content') || $('title').text().split(/[|\-–·]/)[0] || '').trim();
  const text = visibleText(home.text);
  const pricing = await get(`https://${domain}/pricing`);
  const pricingText = pricing && pricing.status < 400 ? visibleText(pricing.text) : undefined;
  const problems: string[] = [];
  if (ms > 4000) problems.push(`Homepage took ${(ms / 1000).toFixed(1)}s to load`);
  if (!$('meta[name="viewport"]').length) problems.push('No mobile viewport tag');
  if (!$('meta[name="description"]').attr('content')) problems.push('No meta description');
  if (home.url && !home.url.startsWith('https://')) problems.push('Site does not redirect to HTTPS');
  return { ok: true, name, hash: sha256(text + '|' + (pricingText ?? '')), tech: detectTech(home.text), text: text.slice(0, 6000), pricingText: pricingText?.slice(0, 3000), pricingHash: pricingText ? sha256(pricingText) : undefined, githubOrg: githubOrgFromHtml(home.text), problems };
}
