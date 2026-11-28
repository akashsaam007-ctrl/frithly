import Anthropic from '@anthropic-ai/sdk';
import { checkEmail, type CheckInput, type CheckResult, type ReplyClass } from '@frithly/core';

const FAST = process.env.CLAUDE_FAST_MODEL ?? 'claude-haiku-5-5';
const WRITER = process.env.CLAUDE_WRITER_MODEL ?? 'claude-sonnet-5-5';

let _c: Anthropic | null = null;
const claude = () => (_c ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }));

function text(m: Anthropic.Message) {
  return m.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
}

function json<T>(s: string): T | null {
  const m = s.match(/```(?:json)?\s*([\s\S]*?)```/) ?? s.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  try { return JSON.parse(m ? m[1] : s) as T; } catch { return null; }
}

export interface Person { name: string; title: string; linkedin?: string }

/** Pull named people and their job titles out of a company's team/about pages. */
export async function extractPeople(domain: string, pageText: string): Promise<Person[]> {
  if (!pageText.trim()) return [];
  const m = await claude().messages.create({
    model: FAST,
    max_tokens: 800,
    system: 'You extract structured data. Reply with JSON only.',
    messages: [{
      role: 'user',
      content: `From this text taken from ${domain}'s website, list the real people who work there with their job titles. Only include people whose name AND title both appear in the text. Do not guess.\nReply as JSON: [{"name":"","title":"","linkedin":""}] (linkedin only if a linkedin.com/in/ URL is present).\n\n<text>\n${pageText.slice(0, 12000)}\n</text>`,
    }],
  });
  return (json<Person[]>(text(m)) ?? []).filter((p) => p?.name && p?.title && p.name.split(' ').length <= 5);
}

/** Choose the best person for the user's target titles. Rule-based, no AI needed. */
export function pickContact(people: Person[], targetTitles: string[]): Person | null {
  if (!people.length) return null;
  const score = (t: string) => {
    const low = t.toLowerCase();
    let s = 0;
    targetTitles.forEach((tt, i) => { if (low.includes(tt.toLowerCase())) s = Math.max(s, 100 - i * 5); });
    if (/founder|ceo|owner|managing director/.test(low)) s = Math.max(s, 60);
    if (/head|vp|vice president|director|chief/.test(low)) s = Math.max(s, 50);
    if (/intern|assistant|junior|associate/.test(low)) s -= 40;
    return s;
  };
  return [...people].sort((a, b) => score(b.title) - score(a.title))[0];
}

export interface DraftContext {
  senderName: string;
  senderCompany: string;
  offer: string;
  proofPoint: string;
  company: { name: string; domain: string; industry?: string | null; siteSummary?: string };
  contact: { name: string; role?: string | null };
  signal: { type: string; label: string; detail?: string | null };
  /** Stacked evidence, operational hypothesis and angle from the scoring engine. */
  stack?: { label: string; evidence: string }[];
  hypothesis?: string | null;
  angle?: string | null;
  step: { index: number; brief: string; sameThread?: boolean };
  previous?: { subject: string; body: string }[];
}

const RULES = `Rules for every email:
- Open with the signal or a specific fact about them, never with yourself.
- One line on what that moment usually causes (use the word "usually" or "often").
- One line of proof from the sender's proof point. Never invent numbers or clients.
- End with exactly one easy yes/no question. Only one question mark in the whole email.
- Under 75 words (under 60 if the contact is a founder, owner or C-level).
- Problem first, no surveillance: never mention DNS, certificates, subdomains, code repositories, or that you were watching them. Public news and job posts may be referenced; infrastructure signals only shape the problem you name.
- Subject: 2 to 5 words, all lowercase, no "re:", no exclamation marks.
- Plain words. No em dashes, no exclamation marks, no emojis, no links, no [placeholders].
- Never use: platform, AI, solution, leverage, streamline, unlock, seamless, synergy, "hope this finds you", "I came across", kindly, moreover, furthermore, additionally.
- Start with "Hi {first name}," on its own line. Do not add a signature or sign-off; it is added later.`;

/** Write one email. Retries up to twice, telling the model which checks failed. */
export async function writeEmail(ctx: DraftContext, checkBase: Omit<CheckInput, 'subject' | 'body'>): Promise<{ subject: string; body: string; checks: CheckResult[] }> {
  const first = ctx.contact.name.split(' ')[0];
  const prev = ctx.previous?.length ? `\nEarlier emails in this thread (do not repeat them):\n${ctx.previous.map((p, i) => `#${i + 1} ${p.subject}\n${p.body}`).join('\n---\n')}` : '';
  const base = `Write cold email step ${ctx.step.index + 1} from ${ctx.senderName} at ${ctx.senderCompany}.
What the sender offers: ${ctx.offer}
Sender's proof point: ${ctx.proofPoint || '(none given; skip the proof line)'}
Recipient: ${ctx.contact.name}${ctx.contact.role ? `, ${ctx.contact.role}` : ''} at ${ctx.company.name} (${ctx.company.domain})${ctx.company.industry ? `, ${ctx.company.industry}` : ''}.
Signal: ${ctx.signal.label}${ctx.signal.detail ? ` — ${ctx.signal.detail}` : ''}
${ctx.stack?.length ? `All current signals:\n${ctx.stack.map((x) => `- ${x.label}: "${x.evidence.slice(0, 200)}"`).join('\n')}` : ''}
${ctx.hypothesis ? `Likely problem: ${ctx.hypothesis}` : ''}
${ctx.angle ? `Angle: ${ctx.angle}` : ''}
${ctx.company.siteSummary ? `From their website: ${ctx.company.siteSummary.slice(0, 1200)}` : ''}
This step's job: ${ctx.step.brief}${ctx.step.sameThread ? ' (sent as a reply in the same thread, so the subject is ignored; keep it short)' : ''}
${prev}
${RULES.replace('{first name}', first)}
Reply as JSON: {"subject":"","body":""}`;

  let feedback = '';
  let last = { subject: '', body: '', checks: [] as CheckResult[] };
  for (let attempt = 0; attempt < 3; attempt++) {
    const m = await claude().messages.create({
      model: WRITER,
      max_tokens: 600,
      messages: [{ role: 'user', content: base + feedback }],
    });
    const out = json<{ subject: string; body: string }>(text(m));
    if (!out) continue;
    const checks = checkEmail({ ...checkBase, subject: out.subject, body: out.body });
    last = { subject: out.subject.trim(), body: out.body.trim(), checks };
    // Address and verified-email checks can't be fixed by rewriting.
    const fixable = checks.filter((c) => !c.pass && c.id !== 'verified' && c.id !== 'compliance');
    if (!fixable.length) break;
    feedback = `\n\nYour previous draft failed these checks, fix them:\n${fixable.map((c) => `- ${c.label}: ${c.tip}`).join('\n')}\nPrevious draft:\n${out.subject}\n${out.body}`;
  }
  return last;
}

/** Classify a reply when the quick rules could not. */
export async function classifyReply(body: string): Promise<ReplyClass> {
  const m = await claude().messages.create({
    model: FAST,
    max_tokens: 20,
    messages: [{
      role: 'user',
      content: `Classify this reply to a cold email. Answer with one word from: interested, meeting, later (not now, check back later), not_interested, optout, out_of_office, referral, other.\n\n${body.slice(0, 3000)}`,
    }],
  });
  const w = text(m).trim().toLowerCase().replace(/[^a-z_]/g, '') as ReplyClass;
  return (['interested', 'meeting', 'later', 'not_interested', 'optout', 'out_of_office', 'referral', 'other'] as ReplyClass[]).includes(w) ? w : 'other';
}

/** One-line summary of what the company does, for drafts. */
export async function summarizeSite(domain: string, siteText: string) {
  if (!siteText) return '';
  const m = await claude().messages.create({
    model: FAST,
    max_tokens: 120,
    messages: [{ role: 'user', content: `In one plain sentence, what does ${domain} sell and to whom? Use only this text:\n${siteText.slice(0, 5000)}` }],
  });
  return text(m).trim();
}

/* ---------- Signal triage and hypotheses ---------- */
export interface TriageItem { id: string; subtype: string; evidence: string; source: string }
export interface TriageVerdict { id: string; verified: boolean; reason: string }

/**
 * Confirm or reject text-based signals in one cheap call per company:
 * is the quote really about this company, and does it mean what the rule thinks?
 * Also flags staffing agencies posting for undisclosed clients.
 */
export async function triageSignals(company: { name: string; domain: string; about?: string }, items: TriageItem[]): Promise<{ verdicts: TriageVerdict[]; staffingAgency: boolean }> {
  if (!items.length) return { verdicts: [], staffingAgency: false };
  const m = await claude().messages.create({
    model: FAST,
    max_tokens: 1200,
    system: 'You check sales signals for false positives. Be strict. Reply with JSON only.',
    messages: [{
      role: 'user',
      content: `Company: ${company.name} (${company.domain}).${company.about ? `\nWhat they do (from their website): ${company.about.slice(0, 400)}` : ''}
Reject anything about a different organisation with a similar name (e.g. a biotech called "Fathom Therapeutics" when the company is fathom.video).
For each candidate, decide if the evidence really shows the signal FOR THIS COMPANY:
- COMPETITOR_IN_JOB: the job requires or mentions using that product at this company (not a generic list of tools).
- MIGRATION: they are moving off, consolidating, or rebuilding a system now.
- FIRST_IN_FUNCTION: first or founding person in that function, or a new Head of.
- NEW_LEADER: a named person newly joined or was promoted into that role at this company (not another company with a similar name).
- COMPLIANCE / FUNDING / REGIONAL / LAYOFF: the headline is about this company doing that.
Also say whether this company is a staffing or recruiting agency hiring for undisclosed clients.

Candidates:
${items.map((i) => `[${i.id}] ${i.subtype} (${i.source}): "${i.evidence.slice(0, 400)}"`).join('\n')}

Reply: {"staffing_agency": false, "verdicts": [{"id":"","verified":true,"reason":"few words"}]}`,
    }],
  });
  const out = json<{ staffing_agency?: boolean; verdicts?: TriageVerdict[] }>(text(m));
  return { verdicts: out?.verdicts ?? [], staffingAgency: !!out?.staffing_agency };
}

/** For a promoted account: who owns the pain, what the pain probably is, and the angle — grounded in the evidence and the user's offer. */
export async function writeHypothesis(input: {
  company: { name: string; domain: string };
  offer: string;
  targetTitles: string[];
  combo: { name: string; personaTitles: string[]; hypothesis: string; angle: string } | null;
  signals: { label: string; evidence: string; eventDate: Date }[];
}): Promise<{ persona: string; hypothesis: string; angle: string }> {
  const m = await claude().messages.create({
    model: FAST,
    max_tokens: 400,
    system: 'You write short, concrete sales hypotheses. Reply with JSON only.',
    messages: [{
      role: 'user',
      content: `Company: ${input.company.name} (${input.company.domain})
What we sell: ${input.offer}
Who we usually sell to: ${input.targetTitles.join(', ') || 'not set'}
${input.combo ? `Matched pattern: ${input.combo.name}. Typical owner: ${input.combo.personaTitles.join(', ')}. Typical pain: ${input.combo.hypothesis}` : ''}
Signals (newest first):
${input.signals.map((s) => `- ${s.label} (${s.eventDate.toISOString().slice(0, 10)}): "${s.evidence.slice(0, 300)}"`).join('\n')}

1. persona: the single job title who owns this problem AND would buy what we sell.
2. hypothesis: one sentence on the operational problem these signals point to. Only claim what the evidence supports.
3. angle: one sentence on how to open the email. Problem first. Never mention DNS records, certificates, code repositories or how we noticed; public news and job posts may be referenced.
Reply: {"persona":"","hypothesis":"","angle":""}`,
    }],
  });
  const o = json<{ persona: string; hypothesis: string; angle: string }>(text(m));
  return {
    persona: o?.persona || input.combo?.personaTitles[0] || input.targetTitles[0] || 'Founder',
    hypothesis: o?.hypothesis || input.combo?.hypothesis || '',
    angle: o?.angle || input.combo?.angle || '',
  };
}
