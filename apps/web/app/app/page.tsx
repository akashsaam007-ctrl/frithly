import Link from 'next/link';
import { and, companies, contacts, count, db, desc, eq, inArray, isNotNull, opportunities, signals } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { EmailBadge } from './ui';

export default async function Today({ searchParams }: { searchParams: Promise<{ welcome?: string; show?: string }> }) {
  const { ws } = await requireWorkspace();
  const sp = await searchParams;
  const show = sp.show === 'saved' ? ['saved'] as const : ['new', 'saved'] as const;
  const rows = await db
    .select({ o: opportunities, c: companies, ct: contacts, s: signals })
    .from(opportunities)
    .innerJoin(companies, eq(companies.id, opportunities.companyId))
    .leftJoin(contacts, eq(contacts.id, opportunities.contactId))
    .leftJoin(signals, eq(signals.id, opportunities.signalId))
    .where(and(eq(opportunities.workspaceId, ws.id), isNotNull(opportunities.releasedOn), inArray(opportunities.status, [...show])))
    .orderBy(desc(opportunities.releasedOn), desc(opportunities.score))
    .limit(100);
  const [{ n: watched }] = await db.select({ n: count() }).from(companies).where(eq(companies.workspaceId, ws.id));
  const [{ n: inFlight }] = await db.select({ n: count() }).from(opportunities).where(and(eq(opportunities.workspaceId, ws.id), eq(opportunities.status, 'sequencing')));

  return (
    <>
      <div className="head">
        <div><h1>Today</h1><p className="mut">{rows.length} companies to review · {inFlight} in outreach · watching {watched} companies</p></div>
        <span className="sp" />
        <Link className="btn s" href={sp.show === 'saved' ? '/app' : '/app?show=saved'}>{sp.show === 'saved' ? 'Show all' : 'Saved only'}</Link>
      </div>
      {sp.welcome && <div className="ok" style={{ marginBottom: 16 }}>You’re set. We’re checking your companies now; your first list lands within a few hours. Connect a mailbox in Settings so approved emails can go out.</div>}
      {rows.length === 0 ? (
        <div className="card stack">
          <h2>Nothing to review yet</h2>
          <p className="mut">We check every company you watch once a day for hiring, funding, website and tech changes. New matches show up here each morning.</p>
          {watched === 0 && <Link className="btn pri" href="/app/companies" style={{ alignSelf: 'start' }}>Add companies to watch</Link>}
        </div>
      ) : (
        <div className="list">
          {rows.map(({ o, c, ct, s }) => (
            <Link key={o.id} href={`/app/o/${o.id}`} className="li">
              <div><strong>{c.name}</strong><div className="mut">{c.domain}</div></div>
              <div><span className="pill v">{o.activeSignals} signals</span> <span className="sm">{o.combo ?? s?.label ?? 'No signal'}</span>{s?.evidence && <div className="mut">{s.evidence.slice(0, 110)}</div>}</div>
              <div className="sm">{ct ? <>{ct.name}<div className="mut">{ct.role}</div></> : <span className="mut">Finding the right person…</span>}</div>
              <div className="row">{ct && <EmailBadge status={ct.emailStatus} />}{o.status === 'saved' && <span className="pill">Saved</span>}<span className="score">{o.score}</span></div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
