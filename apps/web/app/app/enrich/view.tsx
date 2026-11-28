'use client';
import { useState } from 'react';
import { Modal, TopBar, useShell } from '@/components/shell';
import { EmailOk, fmt, when } from '@/components/ui';
import { addToWatchlist, bulkLookup, lookupCompany } from '../actions';

interface Row { id: string; at: string; company: string; domain: string; companyId: string; oppId: string | null; scanned: boolean; contact: { name: string; role: string | null; email: string | null; status: string } | null; signals: string[] }
export function EnrichView({ credits, resets, rows }: { credits: number; resets: string; rows: Row[] }) {
  const { run, setModal } = useShell();
  const [d, setD] = useState(''); const [bulk, setBulk] = useState(''); const [watch, setWatch] = useState('');
  const checkCost = () => {
    const list = [...new Set(bulk.split(/\s+/).map((s) => s.trim()).filter((s) => /\./.test(s)))];
    if (!list.length) return;
    setModal(<Modal title={`Look up ${list.length} companies?`} foot={<><button className="btn" onClick={() => setModal(null)}>Cancel</button><button className="btn p" disabled={credits < list.length * 2} onClick={() => { setModal(null); run(() => bulkLookup(list)); setBulk(''); }}>Look up {list.length}</button></>}>
      <p style={{ margin: 0 }}>This uses <strong>{list.length * 2} credits</strong>. You’ll have <strong>{fmt(credits - list.length * 2)}</strong> left.</p>
      <p className="xs mut" style={{ margin: 0 }}>{list.slice(0, 8).join(', ')}{list.length > 8 ? '…' : ''}</p>
    </Modal>);
  };
  return (
    <>
      <TopBar title="Find & enrich" sub={`Look up companies you found yourself · ${fmt(credits)} credits left · resets ${resets}`} />
      <div className="content" style={{ maxWidth: 980 }}>
        <div className="card pad col g12">
          <h2 style={{ fontSize: 17 }}>Look up a company</h2>
          <p className="sm mut" style={{ margin: 0 }}>We check its signals, find the right person and a verified email, and write a first draft. Costs 2 credits: 1 for the company, 1 for the email. Bounced emails refund their credit.</p>
          <form className="row wrap g8" onSubmit={(e) => { e.preventDefault(); run(() => lookupCompany(d)); setD(''); }}><label className="sr" htmlFor="ld">Company website</label><input id="ld" className="inp f1" placeholder="company.com" value={d} onChange={(e) => setD(e.target.value)} required style={{ minWidth: 220 }} /><button className="btn p">Look up · 2 credits</button></form>
        </div>
        <div className="card pad col g12">
          <h2 style={{ fontSize: 17 }}>Look up a list</h2>
          <p className="sm mut" style={{ margin: 0 }}>Paste one website per line. You’ll see the cost before anything is charged.</p>
          <textarea className="inp" rows={4} placeholder={'acme.com\nglobex.io'} value={bulk} onChange={(e) => setBulk(e.target.value)} />
          <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={checkCost}>Check cost</button>
        </div>
        <div className="card pad col g12">
          <h2 style={{ fontSize: 17 }}>Add to your watchlist · free</h2>
          <p className="sm mut" style={{ margin: 0 }}>We check these every day and add them to Today when they show a strong signal. One website per line, or CSV: domain,name,industry,size,country.</p>
          <textarea className="inp" rows={3} placeholder={'acme.com\nnorthwind.com,Northwind,SaaS,11-50,India'} value={watch} onChange={(e) => setWatch(e.target.value)} />
          <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => { run(() => addToWatchlist(watch)); setWatch(''); }}>Add to watchlist</button>
        </div>
        <div className="col g8">
          <h2 style={{ fontSize: 17 }}>Recent lookups</h2>
          {rows.length ? (
            <div className="tw"><table className="tbl"><thead><tr><th>Company</th><th>Contact</th><th>Signals</th><th>When</th><th /></tr></thead><tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <td><strong>{l.company}</strong><br /><span className="xs mut">{l.domain}</span></td>
                  <td className="sm">{l.contact ? <>{l.contact.name}{l.contact.role ? ` · ${l.contact.role}` : ''}<br /><EmailOk status={l.contact.status} /> <span className="xs">{l.contact.email}</span></> : <span className="mut">{l.scanned ? 'Finding the right person…' : 'Checking the company…'}</span>}</td>
                  <td>{l.signals.length ? l.signals.map((s) => <span key={s} className="chip lav" style={{ marginRight: 4 }}>{s}</span>) : <span className="xs mut">None yet</span>}</td>
                  <td className="sm mut">{when(l.at)}</td>
                  <td>{l.oppId && <a className="btn s" href={`/app/companies?open=${l.oppId}`}>Open</a>}</td>
                </tr>
              ))}
            </tbody></table></div>
          ) : <div className="empty">Companies you look up show here and in Companies.</div>}
        </div>
      </div>
    </>
  );
}
