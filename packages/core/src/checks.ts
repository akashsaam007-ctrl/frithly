/** The 11-point pre-send check. Same rules as the demo; an email can only be approved when all pass. */
export interface CheckInput {
  subject: string;
  body: string;
  companyName: string;
  domain: string;
  contactRole?: string | null;
  signalLabel?: string | null;
  emailStatus: 'valid' | 'catch_all' | 'invalid' | 'unknown' | 'none';
  signature?: string | null;
  postalAddress?: string | null;
  optOutLine?: string | null;
  /** Word cap for non-exec contacts (industry default). */
  maxWords?: number;
}

export interface CheckResult {
  id: string;
  pass: boolean;
  label: string;
  tip: string;
}

const BUZZ = /synergy|leverage|streamline|unlock|game[- ]changer|seamless|revolutioni[sz]e|cutting[- ]edge|world[- ]class/i;
const AITELLS = /hope (this|you)[^.]*(finds|well)|i came across your|don'?t hesitate|kindly|moreover|furthermore|additionally|i hope you'?re/i;
const PITCH = /platform|ai[- ]powered|\bai\b|solution|leading provider|we help companies/i;

export const isExec = (role?: string | null) =>
  /ceo|founder|owner|chief|president|managing director|partner|principal/i.test(role ?? '');

export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

const shortCo = (name: string) => name.replace(/\b(inc|llc|ltd|pvt|private|limited|gmbh|co|corp)\.?$/i, '').trim();

/** Strip greeting line and signature so only the message itself is judged. */
export function coreBody(body: string, signature?: string | null) {
  let b = body.trim();
  const sig = (signature ?? '').trim();
  if (sig && b.endsWith(sig)) b = b.slice(0, -sig.length).trim();
  return b
    .split('\n')
    .filter((x, i) => !(i === 0 && /^(hi|hello|dear|hey)?\s*[\w.]+,\s*$/i.test(x.trim())))
    .join('\n')
    .trim();
}

export function checkEmail(i: CheckInput): CheckResult[] {
  const b = coreBody(i.body, i.signature);
  const cap = isExec(i.contactRole) ? 60 : i.maxWords ?? 90;
  const words = wordCount(b);
  const firstLine = (b.split(/\n+/)[0] ?? '').toLowerCase();
  const sigWords = (i.signalLabel ?? '').toLowerCase().split(/\W+/).filter((w) => w.length > 4);
  const specific =
    firstLine.includes(shortCo(i.companyName).toLowerCase()) ||
    firstLine.includes(i.domain.toLowerCase()) ||
    /\d/.test(firstLine) ||
    sigWords.some((w) => firstLine.includes(w));
  const q = (b.match(/\?/g) ?? []).length;
  const subject = i.subject.trim();
  const sw = subject.split(/\s+/).filter(Boolean);

  return [
    { id: 'specific', pass: specific, label: 'Opens with something specific to them', tip: 'Start with their signal or something on their site, not with you.' },
    { id: 'cause', pass: /usually|most |often|tends to|typically/i.test(b), label: 'Says what that usually causes', tip: 'Add one line on what this moment usually leads to.' },
    { id: 'length', pass: words <= cap, label: `Under ${cap} words (${words} now)`, tip: isExec(i.contactRole) ? 'Owners and execs: keep it under 60.' : 'Cut a sentence.' },
    { id: 'pitch', pass: !PITCH.test(b), label: 'No pitch words', tip: 'Drop "platform", "AI", "solution". Talk about their problem.' },
    { id: 'placeholders', pass: !/\[[^\]]*\]|\{\{/.test(b + subject), label: 'No placeholders left', tip: 'Replace every [bracket] with a real detail, or cut the line.' },
    { id: 'question', pass: q === 1, label: 'One easy question', tip: q === 0 ? 'End with one yes/no question.' : 'Keep just one question.' },
    {
      id: 'subject',
      pass: sw.length >= 2 && sw.length <= 5 && subject === subject.toLowerCase() && !/^(re|fwd):/i.test(subject) && !/!/.test(subject),
      label: 'Subject: 2 to 5 lowercase words',
      tip: 'Name their thing, in lowercase. No "Re:".',
    },
    {
      id: 'human',
      pass: !/[—–]/.test(b) && !AITELLS.test(b) && !/!/.test(b) && !/\p{Extended_Pictographic}/u.test(b),
      label: 'Sounds like a person',
      tip: 'No em dashes, "hope this finds you", exclamation marks or emojis.',
    },
    { id: 'buzz', pass: !BUZZ.test(b) && !/https?:\/\/|www\./i.test(b), label: 'No buzzwords or links', tip: 'No links in the first email; use plain verbs.' },
    { id: 'verified', pass: i.emailStatus === 'valid', label: 'Verified email', tip: 'Find a verified email before sending.' },
    {
      id: 'compliance',
      pass: !!(i.postalAddress?.trim() && i.optOutLine?.trim()),
      label: 'Postal address and opt-out line',
      tip: 'Anti-spam law needs your business address and an easy way to say no. Add both in Settings → Sending.',
    },
  ];
}

export const allPass = (r: CheckResult[]) => r.every((x) => x.pass);
