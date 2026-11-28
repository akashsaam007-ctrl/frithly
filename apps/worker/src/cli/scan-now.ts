/**
 * Scan a workspace's companies right now and print what the engine found.
 *   pnpm --filter @frithly/worker scan-now <workspace-id> [domain ...]
 */
import { and, client, companies, db, eq, inArray, opportunities, signals } from '@frithly/db';
import { evaluateCompany, scanCompany } from '../jobs/scan';

const [wsId, ...domains] = process.argv.slice(2);
if (!wsId) throw new Error('usage: scan-now <workspace-id> [domain ...]');
const list = await db.select().from(companies).where(domains.length ? and(eq(companies.workspaceId, wsId), inArray(companies.domain, domains)) : eq(companies.workspaceId, wsId));
for (const c of list) {
  const t = Date.now();
  try { await scanCompany(c.id); } catch (e) { console.log(`! ${c.domain}: ${(e as Error).message}`); }
  console.log(`  scanned ${c.domain} in ${((Date.now() - t) / 1000).toFixed(1)}s`);
}
for (const c of list) await evaluateCompany(c.id);
const opps = await db.select({ o: opportunities, c: companies }).from(opportunities).innerJoin(companies, eq(companies.id, opportunities.companyId)).where(eq(opportunities.workspaceId, wsId));
const sig = await db.select().from(signals).where(eq(signals.workspaceId, wsId));
console.log(`\n${list.length} companies · ${sig.length} signals (${sig.filter((s) => s.verified === null).length} waiting for triage) · ${opps.length} qualified`);
await client().end();
