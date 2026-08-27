import { NextResponse } from 'next/server';
import { docMeta } from '@/lib/corpus';
import { getUser, insertKnowledgeEntry } from '@/lib/db';
import { buildToast, computeWeight } from '@/lib/weight';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: {
    question?: string;
    correctedAnswer?: string;
    userId?: number;
    overridesDocId?: string | null;
    citations?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 });
  }

  const question = (body.question ?? '').trim();
  const correctedAnswer = (body.correctedAnswer ?? '').trim();
  const userId = Number(body.userId);

  if (!question) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 });
  }
  if (!correctedAnswer) {
    return NextResponse.json({ error: 'correctedAnswer is required' }, { status: 400 });
  }
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const user = await getUser(userId);
  if (!user) {
    return NextResponse.json({ error: `No user with id ${userId}` }, { status: 404 });
  }

  const overridesDocId =
    body.overridesDocId && docMeta(body.overridesDocId) ? body.overridesDocId : null;

  // Keep only citations that are real doc ids. correction-N ids from the
  // previous answer are dropped, a correction is not a department.
  const citations = (body.citations ?? []).filter((id) => Boolean(docMeta(id)));

  const weightResult = computeWeight(user, overridesDocId, citations);

  const entry = await insertKnowledgeEntry({
    question,
    answer: correctedAnswer,
    sources: citations,
    authorId: user.id,
    weight: weightResult.weight,
    overridesDocId,
  });

  return NextResponse.json({
    entry: {
      id: entry.id,
      question: entry.question,
      answer: entry.answer,
      sources: entry.sources,
      authorId: entry.author_id,
      author: user.name,
      authorRole: user.role,
      weight: entry.weight,
      overridesDocId: entry.overrides_doc_id,
      createdAt: entry.created_at,
    },
    weight: weightResult.weight,
    weightReason: weightResult.reason,
    matchedDepartment: weightResult.matchedDepartment,
    toast: buildToast(user, weightResult, overridesDocId),
  });
}
