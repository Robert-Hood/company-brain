/**
 * Applies db/schema.sql then seeds users. Idempotent, safe to re-run.
 *   npm run db:setup
 */
import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const schema = fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf8');

// neon() over HTTP runs one statement per call, so split the file.
const statements = schema
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s && !s.split('\n').every((l) => l.trim().startsWith('--')));

// 0.10.x has no sql.query(); the client accepts a plain string directly.
for (const statement of statements) {
  await sql(statement);
}
console.log(`Applied ${statements.length} statements from db/schema.sql`);

await import('./seed.mjs');
