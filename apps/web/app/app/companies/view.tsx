'use client';
import { useState } from 'react';
import type { Account } from '@/lib/accounts';
import { Drawer } from '@/components/drawer';
import { TopBar, useShell } from '@/components/shell';
import { Ico } from '@/components/icons';
import { Av, CHIP, STATUS, ago } from '@/components/ui';
import { lookupCompany } from '../actions';

interface Watch { id: string; name: string; domain: string; industry: string | null; size: string | null; country: string | null; signals: number; scanned: string | null; source: string }
const ST: [string, string][] = [['all', 'All'], ['new', 'New'], ['approved', 'Queued'], ['sequencing', 'Sequence running'], ['replied', 'Replied'], ['meeting', 'Meeting'], ['skipped', 'Skipped'], ['nofit', 'Not a fit'], ['watching', 'Watching']];

export function CompaniesView({ accounts, watching, open }: { accounts: Account[]; watching: Watch[]; open: string | null }) {
  const { run } = useShell();
  const [q, setQ] = useState('');
  const [st, setSt] = useState('all');
  const [sel, setSel] = useState<string | null>(accounts.find((a) => a.id === open || a.company.id === open)?.id ?? null);
  const m = (s: string) => !q || s.toLowerCase().includes(q.toLowerCase());
  const accs = st === 'watching' ? [] : accounts.filter((a) => (st === 'all' || a.status === st) && m(a.company.name + a.company.domain + (a.company.industry ?? '') + (a.contact?.name ?? '')));
  const wl = st === 'all' || st === 'watching' ? watching.filter((w) => m(w.name + w.domain)) : [];
  const cur = accounts.find((a) => a.id === sel);
  return (
    <>
      <TopBar title="Companies" sub={`${accounts.length + watching.length} companies · ${accounts.length} with a reason to talk · ${watching.length} being watched`} right={<a className="btn" href="/api/export/companies"><Ico k="down" s={16} /> Export CSV</a>} />
      <div className="split">
        <section className="content f1" style={{ flex: '999 1 560px' }}>
          <div className="row wrap g8">
            <label className="srch" style={{ width: 280, color: 'var(--mut)' }}><Ico k="search" s={16} /><span className="sr">Search companies</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies" style={{ border: 0, outline: 'none', background: 'transparent', flex: 1, minWidth: 0 }} /></label>
            <div className="row wrap g6">{ST.map(([k, l]) => <button key={k} className={`fbtn ${st === k ? 'on' : ''}`} onClick={() => setSt(k)}>{l}</button>)}</div>
          </div>
          <div className="tw">
            <table className="tbl">
              <thead><tr><th>Company</th><th>Signals</th><th className="hide-sm">Industry</th><th className="hide-sm">Contact</th><th>Fit</th><th>Status</th></tr></thead>
              <tbody>
                {accs.map((x) => (
                  <tr key={x.id} className={`ro ${x.id === sel ? 'on' : ''}`} onClick={() => setSel(x.id === sel ? null : x.id)}>
                    <td><div className="row"><Av a={x} s={30} /><div className="col"><strong>{x.company.name}</strong><span className="xs mut">{x.company.domain}</span></div></div></td>
                    <td><div className="row wrap g4">{x.signals.filter((s) => s.counted && s.points).slice(0, 3).map((s) => <span key={s.id} className={`chip ${CHIP[s.category] ?? 'gray'}`}>{s.label}</span>)}{x.promotedBy === 'manual' && !x.signals.some((s) => s.counted && s.points) && <span className="chip gray">Looked up by you</span>}</div></td>
                    <td className="hide-sm sm">{[x.company.industry, x.company.country].filter(Boolean).join(' · ') || '—'}</td>
                    <td className="hide-sm sm">{x.contact ? `${x.contact.name} · ${x.contact.role ?? ''}` : <span className="mut">—</span>}</td>
                    <td><span className={`fit ${x.score >= 60 ? 'hi' : ''}`}>{x.score}</span></td>
                    <td><span className={`chip ${STATUS[x.status]?.[1] ?? 'gray'}`}>{STATUS[x.status]?.[0] ?? x.status}</span></td>
                  </tr>
                ))}
                {wl.map((w) => (
                  <tr key={w.id}>
                    <td><div className="row"><span className="av gray" style={{ width: 30, height: 30, fontSize: 13 }}>{w.name[0]?.toUpperCase()}</span><div className="col"><strong>{w.name}</strong><span className="xs mut">{w.domain}</span></div></div></td>
                    <td className="sm mut">{w.signals ? `${w.signals} signal${w.signals > 1 ? 's' : ''}, not enough yet` : w.scanned ? 'Nothing new yet' : 'First check queued'}</td>
                    <td className="hide-sm sm">{[w.industry, w.country].filter(Boolean).join(' · ') || '—'}</td>
                    <td className="hide-sm sm mut">{w.scanned ? `Checked ${ago(w.scanned)}` : '—'}</td>
                    <td><span className="fit">–</span></td>
                    <td><div className="row g6"><span className="chip gray">Watching</span><button className="btn s" onClick={() => run(() => lookupCompany(w.domain))}>Look up now · 2 credits</button></div></td>
                  </tr>
                ))}
                {!accs.length && !wl.length && <tr><td colSpan={6} className="mut">No companies match.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        {cur && <Drawer a={cur} />}
      </div>
    </>
  );
}
