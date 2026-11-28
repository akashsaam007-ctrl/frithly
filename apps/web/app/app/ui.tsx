export function EmailBadge({ status }: { status: string }) {
  const m: Record<string, [string, string]> = {
    valid: ['g', 'Verified email'],
    catch_all: ['a', 'Unconfirmed (catch-all)'],
    unknown: ['a', 'Could not confirm'],
    invalid: ['r', 'No valid email'],
    none: ['', 'No email yet'],
  };
  const [c, l] = m[status] ?? m.none;
  return <span className={`pill ${c}`}>{l}</span>;
}

export const ago = (d: Date) => {
  const s = (Date.now() - d.getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
};
