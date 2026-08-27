import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

/** Knowledge tab. Newest first. */
export async function GET() {
  const entries = await sql`
    select
      k.id, k.question, k.answer, k.sources, k.weight,
      k.overrides_doc_id as "overridesDocId",
      k.created_at as "createdAt",
      u.name as author, u.role as "authorRole"
    from knowledge_entries k
    join users u on u.id = k.author_id
    order by k.created_at desc
  `;
  return NextResponse.json({ entries });
}
