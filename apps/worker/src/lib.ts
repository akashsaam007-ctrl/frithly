import { and, db, eq, isNull, or, sql, suppressions, usage, monthKey, workspaces } from '@frithly/db';
import { DEFAULT_WINDOW, type Window } from '@frithly/core';

export const log = (scope: string, msg: string, extra?: unknown) =>
  console.log(JSON.stringify({ t: new Date().toISOString(), scope, msg, ...(extra ? { extra } : {}) }));

export async function isSuppressed(workspaceId: string, email: string) {
  const e = email.toLowerCase();
  const domain = e.split('@')[1] ?? '';
  const r = await db
    .select({ id: suppressions.id })
    .from(suppressions)
    .where(and(
      or(eq(suppressions.workspaceId, workspaceId), isNull(suppressions.workspaceId)),
      or(eq(suppressions.email, e), eq(suppressions.email, `@${domain}`)),
    ))
    .limit(1);
  return r.length > 0;
}

/** Add to the workspace do-not-contact list, and to the global list when `global` is true. */
export async function suppress(workspaceId: string, email: string, reason: string, global = false) {
  const e = email.toLowerCase();
  await db.insert(suppressions).values({ workspaceId, email: e, reason }).onConflictDoNothing();
  if (global) await db.insert(suppressions).values({ workspaceId: null, email: e, reason }).onConflictDoNothing();
}

export async function bumpUsage(workspaceId: string, field: 'opportunities' | 'lookups' | 'aiDrafts', n = 1) {
  const col = { opportunities: usage.opportunities, lookups: usage.lookups, aiDrafts: usage.aiDrafts }[field];
  await db
    .insert(usage)
    .values({ workspaceId, month: monthKey(), [field]: n })
    .onConflictDoUpdate({ target: [usage.workspaceId, usage.month], set: { [field]: sql`${col} + ${n}` } });
}

export function windowOf(ws: typeof workspaces.$inferSelect): Window {
  const s = ws.sending;
  if (!s) return DEFAULT_WINDOW;
  return { tz: s.tz || 'UTC', days: s.days?.length ? s.days : DEFAULT_WINDOW.days, startHour: s.startHour ?? 8, endHour: s.endHour ?? 17 };
}

/** Today's date (YYYY-MM-DD) in the given time zone. */
export const todayIn = (tz: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
