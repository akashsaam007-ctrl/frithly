'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, TopBar, useShell } from '@/components/shell';
import { Ico } from '@/components/icons';
import { money } from '@/components/ui';
import { moveDeal, newDeal, updateDeal } from '../actions';

const STAGES = ['Replied', 'Meeting', 'Proposal', 'Won', 'Lost'];
interface D { id: string; stage: string; value: number; note: string | null; updated: string; company: string; contact: string }

export function DealsView({ deals, companies, openNew }: { deals: D[]; companies: { id: string; name: string }[]; openNew: boolean }) {
  const { run, setModal } = useShell();
  const router = useRouter();
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [local, setLocal] = useState(deals);
  useEffect(() => setLocal(deals), [deals]);
  const open = local.filter((d) => !['Won', 'Lost'].includes(d.stage));
  const add = () => setModal(<NewDeal companies={companies} />);
  useEffect(() => { if (openNew) { add(); router.replace('/app/deals'); } }, [openNew]); // eslint-disable-line react-hooks/exhaustive-deps
  const move = (id: string, stage: string) => { setLocal((l) => l.map((d) => (d.id === id ? { ...d, stage, updated: new Date().toISOString() } : d))); run(() => moveDeal(id, stage)); };
  const days = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  return (
    <>
      <TopBar title="Deals" sub={`${open.length} open · ${money(open.reduce((a, d) => a + d.value, 0))} in pipeline · drag cards between stages`} right={<button className="btn p" onClick={add}><Ico k="plus" s={16} /> New deal</button>} />
      <div className="content">
        <div className="kb">
          {STAGES.map((s) => {
            const ds = local.filter((d) => d.stage === s);
            return (
              <div key={s} className={`kcol ${over === s ? 'over' : ''}`}
                onDragOver={(e) => { if (drag) { e.preventDefault(); setOver(s); } }} onDragLeave={() => setOver((o) => (o === s ? null : o))}
                onDrop={(e) => { e.preventDefault(); setOver(null); if (drag) { const d = local.find((x) => x.id === drag); if (d && d.stage !== s) move(drag, s); setDrag(null); } }}>
                <div className="row" style={{ padding: '2px 4px' }}><strong className="sm">{s}</strong><span className="xs mut">{ds.length} · {money(ds.reduce((a, d) => a + d.value, 0))}</span></div>
                {ds.map((d) => (
                  <div key={d.id} className="kc" draggable onDragStart={(e) => { setDrag(d.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', d.id); }}>
                    <div className="row"><strong className="sm">{d.company}</strong><button className="ml sm b" style={{ border: 0, background: 'none', padding: 0 }} title="Edit value and note" onClick={() => setModal(<EditDeal d={d} />)}>{money(d.value)}</button></div>
                    {d.contact && <span className="xs mut">{d.contact}</span>}
                    {d.note && <span className="xs">{d.note}</span>}
                    <div className="row g6">
                      {days(d.updated) >= 14 && !['Won', 'Lost'].includes(s) ? <span className="chip pin">No activity 14+ days</span> : <span className="xs mut">Updated {days(d.updated) ? `${days(d.updated)}d ago` : 'today'}</span>}
                      <label className="sr" htmlFor={`mv-${d.id}`}>Move {d.company}</label>
                      <select id={`mv-${d.id}`} className="ml xs" value={s} onChange={(e) => move(d.id, e.target.value)} style={{ border: '1px solid var(--line)', borderRadius: 6, padding: 2 }}>{STAGES.map((x) => <option key={x}>{x}</option>)}</select>
                    </div>
                  </div>
                ))}
                {!ds.length && <p className="xs mut" style={{ padding: 4 }}>Drop deals here</p>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function NewDeal({ companies }: { companies: { id: string; name: string }[] }) {
  const { run, setModal } = useShell();
  const [c, setC] = useState(companies[0]?.id ?? ''); const [v, setV] = useState(3000); const [s, setS] = useState('Replied');
  return (
    <Modal title="New deal" foot={<><button className="btn" onClick={() => setModal(null)}>Cancel</button><button className="btn p" disabled={!c} onClick={() => { setModal(null); run(() => newDeal(c, v, s)); }}>Add deal</button></>}>
      <label className="lb">Company<select className="inp" value={c} onChange={(e) => setC(e.target.value)}>{companies.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label className="lb">Value (USD)<input className="inp" type="number" min={0} value={v} onChange={(e) => setV(+e.target.value)} /></label>
      <label className="lb">Stage<select className="inp" value={s} onChange={(e) => setS(e.target.value)}>{STAGES.map((x) => <option key={x}>{x}</option>)}</select></label>
    </Modal>
  );
}

function EditDeal({ d }: { d: D }) {
  const { run, setModal } = useShell();
  const [v, setV] = useState(d.value); const [n, setN] = useState(d.note ?? '');
  return (
    <Modal title={d.company} foot={<><button className="btn" onClick={() => setModal(null)}>Cancel</button><button className="btn p" onClick={() => { setModal(null); run(() => updateDeal(d.id, v, n)); }}>Save</button></>}>
      <label className="lb">Value (USD)<input className="inp" type="number" min={0} value={v} onChange={(e) => setV(+e.target.value)} /></label>
      <label className="lb">Note<input className="inp" value={n} onChange={(e) => setN(e.target.value)} /></label>
    </Modal>
  );
}
