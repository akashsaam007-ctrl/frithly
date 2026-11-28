/** Time zone picker. Some runtimes list Asia/Calcutta instead of Asia/Kolkata, so the saved value is always offered. */
export function TzSelect({ name = 'tz', value }: { name?: string; value?: string | null }) {
  const zones = Intl.supportedValuesOf('timeZone');
  const v = value || 'Asia/Kolkata';
  const list = zones.includes(v) ? zones : [v, ...zones];
  return <select name={name} defaultValue={v}>{list.map((z) => <option key={z}>{z}</option>)}</select>;
}
