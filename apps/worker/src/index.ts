import { PgBoss } from 'pg-boss';
import { dueCompanies, scanCompany } from './jobs/scan';
import { enrichOpportunity, releaseAll } from './jobs/release';
import { enrollApproved, runDue } from './jobs/send';
import { pollAll } from './jobs/poll';
import { log } from './lib';

/**
 * Background worker. Runs on the VPS (needs outbound port 25 for email verification).
 * Queues live in Postgres (pg-boss), so there is no Redis to run.
 */
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const boss = new PgBoss({ connectionString: url, schema: 'pgboss' });
boss.on('error', (e) => log('boss', 'error', { error: String(e) }));
await boss.start();

const Q = {
  scanTick: 'scan-tick',
  scanCompany: 'scan-company',
  releaseTick: 'release-tick',
  enrich: 'enrich-opportunity',
  sendTick: 'send-tick',
  pollTick: 'poll-tick',
} as const;

for (const q of Object.values(Q)) await boss.createQueue(q).catch(() => undefined);

const one = <T>(fn: (data: T) => Promise<unknown>) => async (jobs: { data: T }[]) => {
  for (const j of jobs) await fn(j.data);
};

await boss.work(Q.scanTick, one(async () => {
  for (const c of await dueCompanies(Number(process.env.SCAN_BATCH ?? 60))) {
    await boss.send(Q.scanCompany, { companyId: c.id }, { singletonKey: c.id, retryLimit: 1 });
  }
}));
await boss.work<{ companyId: string }>(Q.scanCompany, { batchSize: 1, localConcurrency: Number(process.env.SCAN_CONCURRENCY ?? 4) }, one((d: { companyId: string }) => scanCompany(d.companyId)));
await boss.work(Q.releaseTick, one(() => releaseAll((oppId) => boss.send(Q.enrich, { oppId }, { singletonKey: oppId, retryLimit: 2, retryDelay: 300 }))));
await boss.work<{ oppId: string }>(Q.enrich, { batchSize: 1, localConcurrency: Number(process.env.ENRICH_CONCURRENCY ?? 3) }, one((d: { oppId: string }) => enrichOpportunity(d.oppId)));
await boss.work(Q.sendTick, one(async () => { await enrollApproved(); await runDue(); }));
await boss.work(Q.pollTick, one(() => pollAll()));

await boss.schedule(Q.scanTick, '*/20 * * * *');
await boss.schedule(Q.releaseTick, '5 * * * *');
await boss.schedule(Q.sendTick, '* * * * *');
await boss.schedule(Q.pollTick, '*/5 * * * *');

/** Web app can ask for an immediate scan or enrichment via these queues too. */
log('worker', 'started', { queues: Object.values(Q) });

const stop = async () => { await boss.stop({ graceful: true, timeout: 20_000 }); process.exit(0); };
process.on('SIGTERM', stop);
process.on('SIGINT', stop);
