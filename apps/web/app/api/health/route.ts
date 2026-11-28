import { db, sql } from '@/lib/db';

export async function GET() {
  await db.execute(sql`select 1`);
  return Response.json({ ok: true });
}
