/**
 * Wipes corrections and gaps, leaves the seeded users alone.
 *
 * Run this immediately before recording. By then you will have run the demo
 * six or seven times, the fluoride correction will already be saved, and the
 * "before" state that the whole Loom depends on is gone.
 *
 *   npm run reset
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const [{ count: kBefore }] = await sql`select count(*)::int from knowledge_entries`;
const [{ count: gBefore }] = await sql`select count(*)::int from gap_log`;

await sql`delete from knowledge_entries`;
await sql`delete from gap_log`;
await sql`alter sequence knowledge_entries_id_seq restart with 1`;
await sql`alter sequence gap_log_id_seq restart with 1`;

const users = await sql`select count(*)::int as count from users`;

console.log(`Deleted ${kBefore} knowledge entries and ${gBefore} gap rows.`);
console.log(`${users[0].count} users left in place. Ready to record.`);
