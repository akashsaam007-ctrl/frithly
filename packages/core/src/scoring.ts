/**
 * Signal scoring: base weights, time decay, stacking gate, disqualifiers and persona routing.
 * Pure functions, no I/O, so the same rules run in the worker, the web app and tests.
 */

export type Category = 'HIRING_PAIN' | 'TECH_SHIFT' | 'LEADERSHIP' | 'UPMARKET_PREP' | 'COMPETITOR_PAIN' | 'EXPANSION' | 'DISQUALIFIER';

export type Subtype =
  | 'TECH_REMOVAL' | 'COMPETITOR_IN_JOB'
  | 'NEW_LEADER'
  | 'FIRST_IN_FUNCTION' | 'MIGRATION'
  | 'STALE_ROLE'
  | 'COMPLIANCE' | 'SSO_SUBDOMAIN' | 'ENTERPRISE_AE' | 'TRUST_SUBDOMAIN' | 'SECURITY_GATEWAY'
  | 'FUNDING' | 'REGIONAL'
  | 'DEV_SUBDOMAIN' | 'TECH_ADOPTION' | 'OUTBOUND_INFRA' | 'LAUNCH' | 'PRICING_CHANGE' | 'SITE_HEALTH'
  | 'ROLE_MATCH'
  | 'LAYOFF' | 'HEADCOUNT_DROP' | 'STAFFING_AGENCY';

export const SUBTYPES: Record<Subtype, { category: Category; weight: number; label: string }> = {
  TECH_REMOVAL: { category: 'TECH_SHIFT', weight: 45, label: 'Dropped a tool' },
  COMPETITOR_IN_JOB: { category: 'COMPETITOR_PAIN', weight: 45, label: 'Uses a competitor' },
  NEW_LEADER: { category: 'LEADERSHIP', weight: 40, label: 'New leader' },
  FIRST_IN_FUNCTION: { category: 'HIRING_PAIN', weight: 35, label: 'First hire in a function' },
  MIGRATION: { category: 'HIRING_PAIN', weight: 35, label: 'Migration or rebuild' },
  STALE_ROLE: { category: 'HIRING_PAIN', weight: 30, label: 'Role open 45+ days' },
  COMPLIANCE: { category: 'UPMARKET_PREP', weight: 30, label: 'Compliance push' },
  SSO_SUBDOMAIN: { category: 'UPMARKET_PREP', weight: 30, label: 'SSO rollout' },
  ENTERPRISE_AE: { category: 'UPMARKET_PREP', weight: 30, label: 'Hiring enterprise sales' },
  TRUST_SUBDOMAIN: { category: 'UPMARKET_PREP', weight: 20, label: 'Status or trust page' },
  SECURITY_GATEWAY: { category: 'UPMARKET_PREP', weight: 20, label: 'Email security upgrade' },
  FUNDING: { category: 'EXPANSION', weight: 25, label: 'Raised funding' },
  REGIONAL: { category: 'EXPANSION', weight: 25, label: 'New region' },
  DEV_SUBDOMAIN: { category: 'TECH_SHIFT', weight: 20, label: 'API or docs launch' },
  TECH_ADOPTION: { category: 'TECH_SHIFT', weight: 20, label: 'Added a tool' },
  OUTBOUND_INFRA: { category: 'TECH_SHIFT', weight: 20, label: 'New outbound setup' },
  LAUNCH: { category: 'TECH_SHIFT', weight: 20, label: 'Product launch' },
  PRICING_CHANGE: { category: 'TECH_SHIFT', weight: 15, label: 'Pricing page changed' },
  SITE_HEALTH: { category: 'TECH_SHIFT', weight: 15, label: 'Website problems' },
  ROLE_MATCH: { category: 'HIRING_PAIN', weight: 10, label: 'Hiring a role you serve' },
  LAYOFF: { category: 'DISQUALIFIER', weight: 0, label: 'Layoffs or restructuring' },
  HEADCOUNT_DROP: { category: 'DISQUALIFIER', weight: 0, label: 'Job openings fell sharply' },
  STAFFING_AGENCY: { category: 'DISQUALIFIER', weight: 0, label: 'Staffing agency' },
};

/** Age-based multiplier. Signals older than 45 days never trigger outreach. */
export function decay(eventDate: Date, now = new Date()) {
  const days = (now.getTime() - eventDate.getTime()) / 86_400_000;
  if (days < 0) return 1;
  if (days <= 7) return 1;
  if (days <= 21) return 0.65;
  if (days <= 45) return 0.35;
  return 0;
}

export interface ScoredSignal {
  id?: string;
  subtype: Subtype;
  eventDate: Date;
  verified: boolean | null;
  evidence?: string | null;
  /** For combo matching: job title, leader title, subdomain, etc. */
  meta?: Record<string, string>;
}

/**
 * An account qualifies through ANY of three routes (each can be switched off):
 *  - combo:  the live signals match a known pattern (e.g. new sales leader + SDR hiring)
 *  - single: one signal is strong enough on its own (decayed points ≥ strongSingle)
 *  - stack:  decayed total ≥ minScore across ≥ minCategories kinds of signal
 */
export interface Gate {
  minScore: number; minCategories: number; strongSingle: number;
  allowCombos: boolean; allowSingle: boolean;
  windowDays: number; cooldownDays: number;
}
export const DEFAULT_GATE: Gate = { minScore: 60, minCategories: 2, strongSingle: 35, allowCombos: true, allowSingle: true, windowDays: 45, cooldownDays: 45 };

export type PromotedBy = 'combo' | 'single' | 'stack';
export const PROMOTED_LABEL: Record<PromotedBy, string> = { combo: 'Signal combo', single: 'Strong single signal', stack: 'Stacked signals' };

export interface Evaluation {
  score: number;
  categories: Category[];
  active: (ScoredSignal & { points: number; category: Category })[];
  promote: boolean;
  /** Which route qualified it: combo first, then single, then stack. */
  promotedBy: PromotedBy | null;
  suppressed: string | null;
  combo: Combo | null;
}

/**
 * Two-stage gate: decayed total ≥ minScore AND at least minCategories distinct categories
 * in the rolling window. Any active disqualifier or cooldown suppresses the account.
 * Unverified (null) text signals don't count until triage confirms them.
 */
export function evaluate(signals: ScoredSignal[], opts: { gate?: Partial<Gate>; cooldownUntil?: Date | null; now?: Date } = {}): Evaluation {
  const overrides = Object.fromEntries(Object.entries(opts.gate ?? {}).filter(([, v]) => (typeof v === 'number' && v >= 0) || typeof v === 'boolean'));
  const g: Gate = { ...DEFAULT_GATE, ...overrides };
  const now = opts.now ?? new Date();
  const windowStart = now.getTime() - g.windowDays * 86_400_000;
  const live = signals.filter((s) => s.verified === true && s.eventDate.getTime() >= windowStart);

  const disq = live.find((s) => SUBTYPES[s.subtype].category === 'DISQUALIFIER');
  // Keep only the strongest instance of each subtype, so ten job posts don't add up to ten signals.
  const best = new Map<Subtype, ScoredSignal & { points: number; category: Category }>();
  for (const s of live) {
    const d = SUBTYPES[s.subtype];
    if (d.category === 'DISQUALIFIER') continue;
    const points = Math.round(d.weight * decay(s.eventDate, now));
    if (points <= 0) continue;
    const prev = best.get(s.subtype);
    if (!prev || points > prev.points) best.set(s.subtype, { ...s, points, category: d.category });
  }
  const active = [...best.values()].sort((a, b) => b.points - a.points);
  const score = active.reduce((t, s) => t + s.points, 0);
  const categories = [...new Set(active.map((s) => s.category))];
  const cooling = opts.cooldownUntil && opts.cooldownUntil > now;
  const suppressed = disq ? SUBTYPES[disq.subtype].label : cooling ? 'Contacted recently (cooldown)' : null;
  const combo = matchCombo(active);
  const promotedBy: PromotedBy | null = suppressed ? null
    : g.allowCombos && combo ? 'combo'
    : g.allowSingle && (active[0]?.points ?? 0) >= g.strongSingle ? 'single'
    : score >= g.minScore && categories.length >= g.minCategories ? 'stack'
    : null;
  return { score, categories, active, promote: !!promotedBy, promotedBy, suppressed, combo };
}

/* ---------- Persona routing ---------- */
export interface Combo { key: string; name: string; personaTitles: string[]; hypothesis: string; angle: string }

const SALES_LEADER = /\b(vp|vice president|head|director|chief)\b.*\b(sales|revenue|revops|gtm|growth)\b|\bcro\b/i;
const SALES_BUILD = /\b(sdr|bdr|sales development|business development|revops|revenue operations|account executive)\b/i;
const REGIONAL_HIRE = /\b(emea|apac|europe|uk|india|latam|anz|dach|nordics|mena|international|country manager|regional)\b/i;

export const COMBOS: (Combo & { test: (a: Evaluation['active']) => boolean })[] = [
  {
    key: 'sales_buildout',
    name: 'New sales leader + sales team buildout',
    personaTitles: ['VP Sales', 'CRO', 'Head of RevOps', 'Head of Sales'],
    hypothesis: 'A new sales leader has to hit pipeline targets within two quarters while onboarding reps and fixing messy CRM data.',
    angle: 'Acknowledge the team buildout indirectly; share one benchmark on how peer teams cut ramp time or pipeline leakage while scaling.',
    test: (a) => a.some((s) => s.subtype === 'NEW_LEADER' && SALES_LEADER.test(s.meta?.title ?? s.evidence ?? '')) &&
      a.some((s) => s.category === 'HIRING_PAIN' && SALES_BUILD.test(s.meta?.title ?? s.evidence ?? '')),
  },
  {
    key: 'upmarket_security',
    name: 'Compliance or SSO + first enterprise sales hire',
    personaTitles: ['CTO', 'CISO', 'VP Engineering', 'Head of Security'],
    hypothesis: 'Moving upmarket means enterprise buyers are stalling deals over security questionnaires and SLA gaps.',
    angle: 'Focus on removing the security-review bottleneck so enterprise deals don’t stall in procurement.',
    test: (a) => a.some((s) => s.subtype === 'COMPLIANCE' || s.subtype === 'SSO_SUBDOMAIN') && a.some((s) => s.subtype === 'ENTERPRISE_AE'),
  },
  {
    key: 'competitor_bottleneck',
    name: 'Competitor in job post + role open 45+ days',
    personaTitles: ['Director', 'Head of Engineering', 'Head of Operations', 'Head of Growth'],
    hypothesis: 'Their current tool needs heavy manual upkeep and they can’t hire fast enough to maintain it.',
    angle: 'Show how teams running the same workflow remove that maintenance work without adding headcount.',
    test: (a) => a.some((s) => s.subtype === 'COMPETITOR_IN_JOB') && a.some((s) => s.subtype === 'STALE_ROLE'),
  },
  {
    key: 'regional_launch',
    name: 'New region + regional hire',
    personaTitles: ['COO', 'VP International', 'Head of Expansion', 'Country Manager'],
    hypothesis: 'Entering a new territory creates compliance, localisation and pipeline-attribution blind spots.',
    angle: 'Share a short checklist or peer lesson on avoiding early operational bottlenecks in a new region.',
    test: (a) => a.some((s) => s.subtype === 'REGIONAL') && a.some((s) => s.category === 'HIRING_PAIN' && REGIONAL_HIRE.test(s.meta?.title ?? s.meta?.location ?? '')),
  },
  {
    key: 'funded_hiring',
    name: 'Fresh funding + building the team',
    personaTitles: ['Founder', 'CEO', 'COO'],
    hypothesis: 'New money has to turn into headcount and pipeline quickly, and the founders are stretched setting up the basics.',
    angle: 'Open on what usually breaks in the first 90 days after a round; offer one concrete shortcut.',
    test: (a) => a.some((s) => s.subtype === 'FUNDING') && a.some((s) => ['FIRST_IN_FUNCTION', 'STALE_ROLE', 'ROLE_MATCH', 'ENTERPRISE_AE'].includes(s.subtype)),
  },
  {
    key: 'tool_switch',
    name: 'Switching tools',
    personaTitles: ['Head of Operations', 'Head of RevOps', 'CTO', 'Director'],
    hypothesis: 'They are mid-switch between tools, so data, processes and reporting have gaps while both systems run.',
    angle: 'Name the usual mess during a migration and offer to take one piece of it off their plate.',
    test: (a) => a.some((s) => s.subtype === 'TECH_REMOVAL' || s.subtype === 'MIGRATION') && a.some((s) => s.subtype === 'TECH_ADOPTION' || s.subtype === 'COMPETITOR_IN_JOB'),
  },
  {
    key: 'enterprise_ready',
    name: 'Getting enterprise-ready',
    personaTitles: ['CTO', 'Head of Security', 'VP Engineering'],
    hypothesis: 'They are preparing for enterprise buyers’ security reviews and uptime commitments.',
    angle: 'Focus on getting through security reviews and SLA questions faster.',
    test: (a) => a.some((s) => s.subtype === 'SSO_SUBDOMAIN' || s.subtype === 'COMPLIANCE') && a.some((s) => s.subtype === 'TRUST_SUBDOMAIN' || s.subtype === 'SECURITY_GATEWAY'),
  },
];

const FALLBACK_PERSONA: Record<Category, string[]> = {
  HIRING_PAIN: ['Head of the hiring team', 'Founder', 'CEO'],
  TECH_SHIFT: ['CTO', 'VP Engineering', 'Head of Product'],
  LEADERSHIP: ['the new leader'],
  UPMARKET_PREP: ['CTO', 'Head of Security', 'VP Sales'],
  COMPETITOR_PAIN: ['Head of the team using the tool'],
  EXPANSION: ['Founder', 'CEO', 'COO'],
  DISQUALIFIER: [],
};

export function matchCombo(active: Evaluation['active']): Combo | null {
  const c = COMBOS.find((x) => x.test(active));
  if (!c) return null;
  const { test: _t, ...rest } = c;
  return rest;
}

export function personaFor(e: Pick<Evaluation, 'combo' | 'active'>): string[] {
  if (e.combo) return e.combo.personaTitles;
  return FALLBACK_PERSONA[e.active[0]?.category ?? 'EXPANSION'];
}

/* ---------- Extraction rules: job posts ---------- */
const MIGRATION = /\b(migrat(e|ing|ion) (from|off|away)|consolidat(e|ing)|re-?architect(ing|ure)?|rebuild(ing)?|building (it )?from scratch|0[- ]to[- ]1|zero[- ]to[- ]one|greenfield|replac(e|ing) our)\b/i;
const FIRST_IN_FUNCTION = /\b(founding|first)\b|\bhead of\b/i;
const ENTERPRISE_AE = /\benterprise\b.*\b(account executive|ae|sales|seller)\b|\bstrategic account/i;
const SPECIALIST = /\b(revops|revenue operations|sales ops|security|devsecops|data engineer|analytics engineer|solutions engineer|sales engineer|platform engineer|sre|site reliability|compliance|salesforce admin|hubspot admin)\b/i;

export interface JobLike { id: string; title: string; text?: string; location?: string; firstSeen: Date; postedAt?: Date }

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Sentence around the first match, for evidence. */
export function snippet(text: string, re: RegExp, max = 220) {
  const m = re.exec(text);
  if (!m) return null;
  const start = Math.max(0, text.lastIndexOf('.', m.index) + 1);
  const endDot = text.indexOf('.', m.index + m[0].length);
  const end = endDot === -1 ? Math.min(text.length, m.index + max) : Math.min(endDot + 1, start + max);
  return text.slice(start, end).replace(/\s+/g, ' ').trim();
}

export interface Candidate { subtype: Subtype; evidence: string; eventDate: Date; fingerprint: string; needsTriage: boolean; meta?: Record<string, string>; url?: string }

export function jobSignals(job: JobLike, o: { competitors: string[]; roles: string[]; sizeBand?: string | null; now?: Date; url?: string }): Candidate[] {
  const now = o.now ?? new Date();
  const text = `${job.title}. ${job.text ?? ''}`;
  const date = job.postedAt ?? job.firstSeen;
  const meta = { title: job.title, location: job.location ?? '' };
  const out: Candidate[] = [];
  const add = (subtype: Subtype, evidence: string | null, needsTriage: boolean, eventDate = date) => {
    if (evidence) out.push({ subtype, evidence, eventDate, fingerprint: `${subtype}:job:${job.id}`, needsTriage, meta, url: o.url });
  };
  if (o.competitors.length) {
    const re = new RegExp(`\\b(${o.competitors.map(escapeRe).join('|')})\\b`, 'i');
    add('COMPETITOR_IN_JOB', snippet(text, re), true);
  }
  add('MIGRATION', snippet(text, MIGRATION), true);
  const smallEnough = !o.sizeBand || ['1-10', '11-50', '51-200'].includes(o.sizeBand);
  if (smallEnough && FIRST_IN_FUNCTION.test(job.title)) add('FIRST_IN_FUNCTION', job.title, true);
  if (ENTERPRISE_AE.test(job.title)) add('ENTERPRISE_AE', job.title, false);
  const ageDays = (now.getTime() - job.firstSeen.getTime()) / 86_400_000;
  const specialist = SPECIALIST.test(job.title) || o.roles.some((r) => new RegExp(`\\b${escapeRe(r)}\\b`, 'i').test(job.title));
  // A stale role is a signal from the day it crosses 45 days, so it decays from then.
  if (specialist && ageDays >= 45) add('STALE_ROLE', `${job.title}, open since ${job.firstSeen.toISOString().slice(0, 10)}`, false, new Date(job.firstSeen.getTime() + 45 * 86_400_000));
  if (o.roles.length && o.roles.some((r) => new RegExp(`\\b${escapeRe(r)}\\b`, 'i').test(job.title))) add('ROLE_MATCH', job.title, false);
  return out;
}

const tokens = (t: string) => new Set(t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !['senior', 'junior', 'remote', 'the', 'and'].includes(w)));

/** A closed role re-posted under a tweaked title within 30 days counts as stale. */
export function isRepost(newTitle: string, closed: { title: string; closedAt: Date }[], now = new Date()) {
  const a = tokens(newTitle);
  return closed.find((c) => {
    if (now.getTime() - c.closedAt.getTime() > 30 * 86_400_000) return false;
    const b = tokens(c.title);
    const inter = [...a].filter((x) => b.has(x)).length;
    const union = new Set([...a, ...b]).size;
    return union > 0 && inter / union >= 0.5 && newTitle.toLowerCase() !== c.title.toLowerCase();
  }) ?? null;
}

/** >40% drop in open roles within 14 days (from at least 5). */
export function headcountDrop(history: { count: number; at: Date }[], current: number, now = new Date()) {
  const recent = history.filter((h) => now.getTime() - h.at.getTime() <= 14 * 86_400_000);
  const peak = Math.max(0, ...recent.map((h) => h.count));
  return peak >= 5 && current < peak * 0.6 ? { peak, current } : null;
}

/* ---------- Extraction rules: infrastructure ---------- */
export function classifySubdomain(name: string, domain: string): Subtype | null {
  const sub = name.toLowerCase().replace(/^\*\./, '').replace(new RegExp(`\\.?${escapeRe(domain)}$`), '');
  if (!sub || sub === 'www') return null;
  const all = sub.split('.');
  if (all.some((l) => /^(sso|auth|login|idp|okta|saml)$/.test(l))) return 'SSO_SUBDOMAIN';
  if (all.some((l) => /^(status|trust|security|compliance)$/.test(l))) return 'TRUST_SUBDOMAIN';
  if (all.some((l) => /^(api|docs|developers?|dev-portal|sandbox)$/.test(l))) return 'DEV_SUBDOMAIN';
  if (all.some((l) => /^(eu|uk|us|apac|in|au|de|fr|sg|jp|br|ca|emea|mena|latam)$/.test(l))) return 'REGIONAL';
  if (all.some((l) => /^(mail|get|try|go|hello|outreach|email|news|info)$/.test(l))) return 'OUTBOUND_INFRA';
  return null;
}

/** Vendor verification strings in DNS TXT records. */
export const TXT_VENDORS: [string, RegExp][] = [
  ['HubSpot', /hubspot/i], ['Pardot', /pardot/i], ['Marketo', /marketo/i], ['Salesforce', /salesforce|sfdc/i], ['Okta', /okta/i],
  ['Zendesk', /zendesk/i], ['Intercom', /intercom/i], ['Segment', /segment/i], ['PostHog', /posthog/i], ['Datadog', /datadog/i],
  ['Atlassian', /atlassian/i], ['Slack', /slack/i], ['Notion', /notion/i], ['Zoom', /zoom/i], ['Docusign', /docusign/i],
  ['Microsoft 365', /^MS=|ms-domain-verification/i], ['Google Workspace', /google-site-verification/i], ['Stripe', /stripe/i],
  ['Apple', /apple-domain-verification/i], ['Facebook', /facebook-domain-verification/i], ['Mailchimp', /mailchimp|mandrill/i],
  ['SendGrid', /sendgrid/i], ['Outreach', /outreach/i], ['Gong', /gong/i], ['Vanta', /vanta/i], ['Drata', /drata/i],
];

export const txtVendors = (records: string[]) => [...new Set(records.flatMap((r) => TXT_VENDORS.filter(([, re]) => re.test(r)).map(([n]) => n)))].sort();

export function mxProvider(mx: string[]): string {
  const s = mx.join(' ').toLowerCase();
  if (/mimecast/.test(s)) return 'Mimecast';
  if (/pphosted|proofpoint/.test(s)) return 'Proofpoint';
  if (/barracuda/.test(s)) return 'Barracuda';
  if (/google|googlemail/.test(s)) return 'Google Workspace';
  if (/outlook|microsoft/.test(s)) return 'Microsoft 365';
  if (/zoho/.test(s)) return 'Zoho';
  return mx[0] ?? 'none';
}
export const SECURITY_GATEWAYS = ['Mimecast', 'Proofpoint', 'Barracuda'];

/* ---------- News classification ---------- */
export const NEWS_QUERIES = {
  leadership: '("appoints" OR "joins as" OR "names" OR "hires") ("VP" OR "CRO" OR "CTO" OR "CISO" OR "Head of" OR "Chief")',
  compliance: '("SOC 2" OR "ISO 27001" OR "HIPAA" OR "GDPR" OR "DPDP")',
  expansion: '("Series A" OR "Series B" OR "Series C" OR "seed round" OR "raises" OR "acquires" OR "expands to")',
  layoff: '("layoffs" OR "lays off" OR "restructuring" OR "job cuts" OR "hiring freeze")',
} as const;

export function classifyNews(title: string, query: keyof typeof NEWS_QUERIES): Subtype | null {
  const t = title.toLowerCase();
  if (query === 'layoff') return /layoff|lays off|restructur|job cuts|hiring freeze|downsiz/.test(t) ? 'LAYOFF' : null;
  if (query === 'leadership') return /appoint|joins as|names|hires|welcomes|promot/.test(t) && /\b(vp|cro|cto|ciso|cfo|coo|cmo|head of|chief|president|director)\b/.test(t) ? 'NEW_LEADER' : null;
  if (query === 'compliance') return /soc ?2|iso ?27001|hipaa|gdpr|dpdp|fedramp/.test(t) ? 'COMPLIANCE' : null;
  if (/expands? (to|into)|opens? (office|hub)|launch(es)? in|enters? /.test(t)) return 'REGIONAL';
  if (/raise|funding|series [a-e]|seed|investment|backed/.test(t)) return 'FUNDING';
  return null;
}
