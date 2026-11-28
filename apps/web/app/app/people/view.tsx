'use client';
import { useState } from 'react';
import { TopBar, useShell } from '@/components/shell';
import { Ico } from '@/components/icons';
import { EmailOk } from '@/components/ui';
import { findEmail } from '../actions';

interface P { id: string; name: string; role: string | null; email: string | null; status: string; linkedin: string | null; company: string; companyId: string; main: boolean }
export function PeopleView({ people }: { people: P[] }) {
  const { run, toast } = useShell();
  const [q, setQ] = useState('');
  const list = people.filter((p) => !q || (p.name + (p.role ?? '') + p.company).toLowerCase().includes(q.toLowerCase()));
  const cos = new Set(people.map((p) => p.companyId)).size;
  return (
    <>
      <TopBar title="People" sub={`${people.length} people across ${cos} companies`} right={<a className="btn" href="/api/export/people"><Ico k="down" s={16} /> Export CSV</a>} />
      <div className="content">
        <label className="srch" style={{ width: 300 }}><Ico k="search" s={16} /><span className="sr">Search people</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people, roles or companies" style={{ border: 0, outline: 'none', background: 'transparent', flex: 1, minWidth: 0 }} /></label>
        <div className="tw">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Role</th><th>Company</th><th>Email</th><th /></tr></thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id}>
                  <td><div className="row"><span className={`av ${p.main ? 'lav' : 'gray'}`} style={{ width: 30, height: 30, borderRadius: '50%', fontSize: 12 }}>{p.name[0]}</span><strong>{p.name}</strong>{p.main && <span className="chip mint">Main contact</span>}{p.linkedin && <a className="xs" href={p.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--li)' }}>LinkedIn</a>}</div></td>
                  <td className="sm">{p.role}</td>
                  <td className="sm"><a href={`/app/companies?open=${p.companyId}`} style={{ color: 'var(--acct)' }}>{p.company}</a></td>
                  <td className="sm">{p.email ? <span className="col">{p.email}<EmailOk status={p.status} /></span> : <span className="mut">Not looked up</span>}</td>
                  <td style={{ textAlign: 'right' }}>{p.email ? <button className="btn s" onClick={() => { navigator.clipboard?.writeText(p.email!); toast(`Copied ${p.email}`); }}>Copy</button> : <button className="btn s" onClick={() => run(() => findEmail(p.id))}>Find email · 1 credit</button>}</td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={5} className="mut">{people.length ? 'No one matches.' : 'People appear here as we find them on company team pages.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
