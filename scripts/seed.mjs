/**
 * Seeds the four users. Names must match the ones the corpus refers to or the
 * dropdown looks broken next to documents owned by "Akhilesh T".
 *
 * Priya Menon, Danny Alvarez, Rhea Sharma, Tom Beckett, Wes Okafor and Maya Iyer
 * also appear in the docs. They are not users, they are people mentioned in
 * documents. Do not seed them.
 *
 *   npm run seed
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const USERS = [
  { id: 1, name: 'Jofin Joseph', role: 'CEO',      expertise: ['gtm', 'product'] },
  { id: 2, name: 'Akhilesh T',   role: 'RCM Lead', expertise: ['ops'] },
  { id: 3, name: 'Nakul R',      role: 'CTO',      expertise: ['engineering', 'product'] },
  { id: 4, name: 'Sam Ortiz',    role: 'Verifier', expertise: [] },
];

for (const u of USERS) {
  await sql`
    insert into users (id, name, role, expertise)
    values (${u.id}, ${u.name}, ${u.role}, ${u.expertise})
    on conflict (id) do update
      set name = excluded.name,
          role = excluded.role,
          expertise = excluded.expertise
  `;
}

// Explicit ids above mean the sequence is now behind. Without this the first
// user created any other way collides on id 1.
await sql`select setval('users_id_seq', (select max(id) from users))`;

const rows = await sql`select id, name, role, expertise from users order by id`;
console.table(rows);
