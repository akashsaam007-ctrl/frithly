export type Channel = 'email' | 'linkedin_invite' | 'linkedin_message' | 'call_task';

export interface SeqStep {
  channel: Channel;
  day: number;
  /** Brief for the AI writer. */
  brief: string;
  /** Email steps after the first reply in the same thread. */
  sameThread?: boolean;
}

export const SEQ_PRESETS: Record<string, { name: string; steps: SeqStep[] }> = {
  mix: {
    name: 'Email + LinkedIn (recommended)',
    steps: [
      { channel: 'email', day: 0, brief: 'Signal, what it usually causes, proof, one easy question' },
      { channel: 'linkedin_invite', day: 1, brief: 'Connection request, no note or a short one naming the signal' },
      { channel: 'email', day: 3, brief: 'Reply in the same thread with one new fact, not "just bumping this"', sameThread: true },
      { channel: 'linkedin_message', day: 5, brief: 'Short message if connected: one line on the signal and the question' },
      { channel: 'email', day: 9, brief: 'A useful give: a benchmark, a teardown or a 3-line idea', sameThread: true },
      { channel: 'call_task', day: 12, brief: 'Call if a number is on file; mention the emails' },
      { channel: 'email', day: 18, brief: 'Polite close: reply "later" and I will check back next quarter', sameThread: true },
    ],
  },
  email: {
    name: 'Email only',
    steps: [
      { channel: 'email', day: 0, brief: 'Signal, what it usually causes, proof, one easy question' },
      { channel: 'email', day: 3, brief: 'Same thread, one new fact', sameThread: true },
      { channel: 'email', day: 7, brief: 'A useful give: a benchmark, a teardown or a 3-line idea', sameThread: true },
      { channel: 'email', day: 14, brief: 'A different angle, or ask if someone else owns this', sameThread: true },
      { channel: 'email', day: 21, brief: 'Polite close', sameThread: true },
    ],
  },
};

export type SignalType = 'hiring' | 'funding' | 'site' | 'tech' | 'news' | 'import';

export const SIGNAL_LABELS: Record<SignalType, string> = {
  hiring: 'Hiring',
  funding: 'Funding',
  site: 'Website change',
  tech: 'Tech stack change',
  news: 'In the news',
  import: 'Imported',
};

/** Freshness-weighted score 0–100 for ranking the daily list. */
export function signalScore(type: SignalType, ageDays: number, fit: number) {
  const base: Record<SignalType, number> = { funding: 40, hiring: 35, tech: 25, site: 20, news: 20, import: 10 };
  const fresh = Math.max(0, 30 - ageDays * 2);
  return Math.min(100, Math.round(base[type] + fresh + fit * 30));
}
