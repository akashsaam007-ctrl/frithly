import 'server-only';
import { PgBoss } from 'pg-boss';

/** Send work to the VPS worker (email finding needs port 25, which Vercel doesn't have). */
const g = globalThis as unknown as { __boss?: Promise<PgBoss> };

function boss() {
  g.__boss ??= (async () => {
    const b = new PgBoss({ connectionString: process.env.DATABASE_URL!, schema: 'pgboss', supervise: false, schedule: false, migrate: false });
    await b.start();
    return b;
  })();
  return g.__boss;
}

export async function enqueue(queue: 'scan-company' | 'enrich-opportunity', data: object, singletonKey?: string) {
  const b = await boss();
  return b.send(queue, data, { singletonKey, retryLimit: 2 });
}
