/** Footer, unsubscribe headers and reply classification helpers. */
export function footer(signature: string, postalAddress: string, optOutLine: string) {
  return `${signature.trim()}\n\n${optOutLine.trim()}\n${postalAddress.trim()}`.trim();
}

export function unsubscribeHeaders(appUrl: string, unsubToken: string, mailto: string) {
  const url = `${appUrl.replace(/\/$/, '')}/u/${unsubToken}/one-click`;
  return {
    'List-Unsubscribe': `<${url}>, <mailto:${mailto}?subject=unsubscribe>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

export type ReplyClass = 'interested' | 'meeting' | 'not_interested' | 'optout' | 'out_of_office' | 'bounce' | 'referral' | 'other';

/** Cheap rule-based first pass; the worker asks Claude only when this returns 'other'. */
export function quickClassify(subject: string, text: string): ReplyClass {
  const s = `${subject}\n${text}`.toLowerCase();
  if (/mailer-daemon|delivery status notification|undeliverable|address not found|recipient address rejected/.test(s)) return 'bounce';
  if (/out of (the )?office|on (annual )?leave|automatic reply|auto-reply|away until|vacation/.test(s)) return 'out_of_office';
  if (/unsubscribe|remove me|stop emailing|don'?t (email|contact) me|take me off|opt.?out/.test(s)) return 'optout';
  const first = text.trim().split(/\n/)[0]?.toLowerCase().replace(/[^a-z ]/g, '').trim() ?? '';
  if (/^(no|nope|no thanks|not interested|not relevant|no thank you|pass)$/.test(first)) return 'not_interested';
  return 'other';
}

/** Outcomes that end the sequence and add the address to the workspace do-not-contact list. */
export const STOP_AND_DNC: ReplyClass[] = ['not_interested', 'optout', 'bounce'];
/** Opt-outs are also added to the global list, shared across all workspaces. */
export const GLOBAL_SUPPRESS: ReplyClass[] = ['optout'];
