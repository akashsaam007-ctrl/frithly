/** Mailbox sending caps and sending windows. */

/** Warm-up ramp for a new mailbox: day 1 = 10/day, rising to the cap (default 40) over ~3 weeks. */
export function dailyCap(warmupDay: number, cap = 40) {
  if (warmupDay < 1) return 0;
  return Math.min(cap, Math.round(10 + ((warmupDay - 1) * (cap - 10)) / 20));
}

/** How many new companies the account can start today: total cap across mailboxes / 5 touches. */
export const startsPerDay = (totalCap: number) => Math.floor(totalCap / 5);

export interface Window {
  tz: string; // IANA, e.g. Asia/Kolkata
  days: number[]; // 1=Mon … 7=Sun
  startHour: number;
  endHour: number;
}

export const DEFAULT_WINDOW: Window = { tz: 'UTC', days: [1, 2, 3, 4, 5], startHour: 8, endHour: 17 };

function localParts(d: Date, tz: string) {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', hourCycle: 'h23' });
  const parts = Object.fromEntries(f.formatToParts(d).map((p) => [p.type, p.value]));
  const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.weekday) + 1;
  return { dow, hour: Number(parts.hour) };
}

export function inWindow(d: Date, w: Window) {
  const { dow, hour } = localParts(d, w.tz);
  return w.days.includes(dow) && hour >= w.startHour && hour < w.endHour;
}

/** Next time inside the window, scanning forward in 15-minute steps (max 8 days). */
export function nextInWindow(from: Date, w: Window): Date {
  let t = new Date(from);
  for (let i = 0; i < 8 * 24 * 4; i++) {
    if (inWindow(t, w)) return t;
    t = new Date(t.getTime() + 15 * 60_000);
  }
  return from;
}

/** Spread sends: 4–9 minutes apart per mailbox, randomised. */
export const sendGapMs = () => (4 + Math.random() * 5) * 60_000;

export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000);
