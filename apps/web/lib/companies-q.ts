import 'server-only';
import { and, companies, eq, sql } from '@/lib/db';
export * from '@/lib/db';

/** Companies in this workspace that have no opportunity row. */
export const notExistsOpp = (wsId: string) =>
  and(eq(companies.workspaceId, wsId), sql`not exists (select 1 from opportunities o where o.company_id = ${companies.id})`);
