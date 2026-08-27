import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * Gaps tab. Returns the rows plus the payer counts for the one-line
 * coverage map above the table: "MetLife 3 - Aetna 1 - Unknown 2".
 */
export async function GET() {
  const gaps = await sql`
    select
      g.id, g.question, g.payer, g.confidence,
      g.created_at as "createdAt",
      u.name as "askedBy"
    from gap_log g
    join users u on u.id = g.asked_by
    order by g.created_at desc
  `;

  const counts = await sql`
    select coalesce(payer, 'Unknown') as payer, count(*)::int as count
    from gap_log
    group by coalesce(payer, 'Unknown')
    order by count desc, payer asc
  `;

  return NextResponse.json({ gaps, payerCounts: counts });
}
