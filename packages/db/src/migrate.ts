import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');
const sql = postgres(url, { max: 1 });
const folder = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
await migrate(drizzle(sql), { migrationsFolder: folder });
console.log('migrations applied');
await sql.end();
