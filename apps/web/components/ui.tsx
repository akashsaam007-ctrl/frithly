'use client';
import type { Account } from '@/lib/accounts';

export const CHIP: Record<string, string> = { LEADERSHIP: 'lav', EXPANSION: 'pin', HIRING_PAIN: 'pea', TECH_SHIFT: 'mint', COMPETITOR_PAIN: 'li', UPMARKET_PREP: 'gray', DISQUALIFIER: 'pin' };
export const tcls = (t: string) => (t === 'Act today' ? 'pin' : t === 'This week' ? 'pea' : 'gray');
export const STATUS: Record<string, [string, string]> = {
  new: ['New', 'gray'], saved: ['Saved', 'gray'], approved: ['Queued', 'mint'], sequencing: ['Sequence running', 'mint'], replied: ['Replied', 'lav'],
  meeting: ['Meeting', 'lav'], won: ['Won', 'mint'], lost: ['Lost', 'gray'], skipped: ['Skipped', 'gray'], nofit: ['Not a fit', 'gray'],
};
export const fmt = (n: number) => n.toLocaleString('en-US');
export const money = (n: number) => '$' + fmt(n);
export const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};
export const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function Av({ a, s = 34 }: { a: Pick<Account, 'company' | 'main'>; s?: number }) {
  return <span className={`av ${CHIP[a.main?.category ?? ''] ?? 'gray'}`} style={{ width: s, height: s, fontSize: Math.round(s * 0.42) }}>{a.company.name[0]?.toUpperCase()}</span>;
}
export function EmailOk({ status }: { status: string }) {
  const m: Record<string, [string, string]> = { valid: ['✓ Email checked', 'var(--ok)'], catch_all: ['Email unconfirmed (catch-all)', 'var(--warn)'], unknown: ['Couldn’t confirm email', 'var(--warn)'], invalid: ['No valid email', 'var(--bad)'], none: ['Finding email…', 'var(--mut)'] };
  const [t, c] = m[status] ?? m.none;
  return <span className="xs b" style={{ color: c }}>{t}</span>;
}
