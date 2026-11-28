'use client';
import { TopBar } from '@/components/shell';

const INTS: [string, string][] = [
  ['HubSpot', 'Contacts, threads and deals sync both ways.'], ['Pipedrive', 'Push replies and deals into your pipeline.'], ['Salesforce', 'Sync accounts, contacts and activity.'],
  ['Google Calendar', 'Book meetings from replies with your real availability.'], ['Slack', 'Get interested replies in a channel.'], ['Zapier', 'Send Frithly events to other apps.'],
];
export function IntegrationsView({ microsoft }: { microsoft: boolean }) {
  return (
    <>
      <TopBar title="Integrations" sub="Connect the tools you already use" />
      <div className="content"><div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(min(300px,100%),1fr))' }}>
        <div className="card pad col g12">
          <div className="row"><span className="av gray" style={{ width: 40, height: 40, fontSize: 16 }}>M</span><div className="col"><strong>Microsoft 365 / Outlook</strong><span className="xs mut">{microsoft ? 'Available' : 'Not set up on this server'}</span></div></div>
          <p className="sm mut" style={{ margin: 0, flex: 1 }}>Send from and read replies in an Outlook mailbox.</p>
          <div className="row g8"><a className="btn s p" href="/app/outreach?mailbox=1">Connect a mailbox</a></div>
        </div>
        {INTS.map(([n, d]) => (
          <div key={n} className="card pad col g12">
            <div className="row"><span className="av gray" style={{ width: 40, height: 40, fontSize: 16 }}>{n[0]}</span><div className="col"><strong>{n}</strong><span className="xs mut">Coming soon</span></div></div>
            <p className="sm mut" style={{ margin: 0, flex: 1 }}>{d}</p>
            <div className="row g8"><button className="btn s" disabled>Coming soon</button></div>
          </div>
        ))}
        <div className="card pad col g12">
          <div className="row"><span className="av gray" style={{ width: 40, height: 40, fontSize: 13 }}>CSV</span><div className="col"><strong>CSV export</strong><span className="xs" style={{ color: 'var(--ok)', fontWeight: 600 }}>● Always available</span></div></div>
          <p className="sm mut" style={{ margin: 0, flex: 1 }}>Download companies and people as a spreadsheet.</p>
          <div className="row g8"><a className="btn s" href="/api/export/companies">Export companies</a><a className="btn s" href="/api/export/people">Export people</a></div>
        </div>
      </div></div>
    </>
  );
}
