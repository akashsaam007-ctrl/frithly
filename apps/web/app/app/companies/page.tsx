import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, companies, count, db, desc, eq, signals } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { importCompanies } from '@/lib/companies';
import { enqueue } from '@/lib/queue';
import { ago } from '../ui';

async function add(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  let text = String(fd.get('domains') ?? '');
  const file = fd.get('csv');
  if (file instanceof File && file.size) text += '\n' + (await file.text());
  const r = await importCompanies(ws.id, text);
  // Scan the new ones straight away instead of waiting for the next round.
  const fresh = await db.select({ id: companies.id }).from(companies).where(and(eq(companies.workspaceId, ws.id))).orderBy(desc(companies.createdAt)).limit(r.added);
  for (const c of fresh) await enqueue('scan-company', { companyId: c.id }, c.id).catch(() => null);
  redirect(`/app/companies?added=${r.added}&skipped=${r.skipped}`);
}

async function remove(fd: FormData) {
  'use server';
  const { ws } = await requireWorkspace();
  await db.delete(companies).where(and(eq(companies.id, String(fd.get('id'))), eq(companies.workspaceId, ws.id)));
  revalidatePath('/app/companies');
}

export default async function Companies({ searchParams }: { searchParams: Promise<{ added?: string; skipped?: string }> }) {
  const { ws } = await requireWorkspace();
  const sp = await searchParams;
  const rows = await db
    .select({ c: companies, n: count(signals.id) })
    .from(companies)
    .leftJoin(signals, eq(signals.companyId, companies.id))
    .where(eq(companies.workspaceId, ws.id))
    .groupBy(companies.id)
    .orderBy(desc(companies.createdAt))
    .limit(500);
  return (
    <>
      <div className="head"><div><h1>Companies you watch</h1><p className="mut">We check each one daily for hiring, funding, website and tech changes.</p></div></div>
      {sp.added && <div className="ok" style={{ marginBottom: 12 }}>Added {sp.added} companies{Number(sp.skipped) ? ` · ${sp.skipped} lines skipped (not a company website)` : ''}. Scanning now.</div>}
      <form action={add} className="card stack" style={{ marginBottom: 16 }}>
        <label>Add websites, one per line (or CSV: domain,name,industry,size,country)<textarea name="domains" placeholder={'acme.io\nnorthwind.com,Northwind,SaaS,11-50,India'} /></label>
        <div className="row"><label style={{ flexDirection: 'row', alignItems: 'center' }}>Or upload CSV <input type="file" name="csv" accept=".csv,text/csv" style={{ width: 'auto' }} /></label><span className="sp" /><button className="btn pri">Add companies</button></div>
      </form>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Company</th><th>Job board</th><th>Tech</th><th>Signals</th><th>Last checked</th><th /></tr></thead>
          <tbody>
            {rows.map(({ c, n }) => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong><div className="mut">{c.domain}</div></td>
                <td className="sm">{c.ats ? `${c.ats.provider}` : <span className="mut">—</span>}</td>
                <td className="sm">{c.tech.slice(0, 3).join(', ') || <span className="mut">—</span>}</td>
                <td className="num">{n}</td>
                <td className="mut">{c.lastScannedAt ? ago(c.lastScannedAt) : 'Queued'}</td>
                <td><form action={remove}><input type="hidden" name="id" value={c.id} /><button className="btn gh s">Remove</button></form></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="mut">No companies yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
