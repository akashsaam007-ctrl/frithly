import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export * from './schema';
export { schema };
export { and, asc, count, desc, eq, gt, gte, ilike, inArray, isNull, isNotNull, like, lt, lte, ne, or, sql, sum } from 'drizzle-orm';

const g = globalThis as unknown as { __frithlySql?: postgres.Sql };

export function client() {
  if (!g.__frithlySql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is not set');
    g.__frithlySql = postgres(url, { max: Number(process.env.DB_POOL ?? 5), prepare: false });
  }
  return g.__frithlySql;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_t, p) {
    const real = ((g as { __frithlyDb?: ReturnType<typeof drizzle<typeof schema>> }).__frithlyDb ??= drizzle(client(), { schema }));
    return Reflect.get(real, p, real);
  },
});

export type DB = typeof db;

export const monthKey = (d = new Date()) => d.toISOString().slice(0, 7);
export type { SQL } from 'drizzle-orm';
