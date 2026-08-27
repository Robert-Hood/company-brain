import { NextResponse } from 'next/server';
import { getDoc } from '@/lib/corpus';

export const runtime = 'nodejs';

/** Citation chips open the doc side panel from here. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const doc = getDoc(id);
  if (!doc) {
    return NextResponse.json({ error: `No document ${id}` }, { status: 404 });
  }
  return NextResponse.json({ doc });
}
