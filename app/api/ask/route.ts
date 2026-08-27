import { NextResponse } from 'next/server';
import { callClaude, parseJsonLoose } from '@/lib/claude';
import { CORPUS, CORPUS_INDEX, docMeta, getDoc, type DocMeta } from '@/lib/corpus';
import { getAllCorrections, getUser, insertGap } from '@/lib/db';
import { normalisePayer } from '@/lib/payers';
import {
  ASK_SYSTEM_PROMPT,
  SELECT_SYSTEM_PROMPT,
  buildAskUserMessage,
  buildSelectUserMessage,
} from '@/lib/prompts';

export const runtime = 'nodejs';
export const maxDuration = 60;

type ClaudeAnswer = {
  answer: string;
  citations: string[];
  confidence: 'high' | 'medium' | 'low';
  payer: string | null;
};

/**
 * Fallback doc picker for when the selection call fails or returns junk.
 * Crude term overlap against id and title. Never used in the happy path, but it
 * means a flaky first call does not produce an empty answer on stage.
 */
function fallbackSelect(question: string, n = 5): DocMeta[] {
  const terms = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);

  return [...CORPUS_INDEX]
    .map((doc) => {
      const haystack = `${doc.id} ${doc.title}`.toLowerCase();
      const score = terms.reduce((s, t) => s + (haystack.includes(t) ? 1 : 0), 0);
      return { doc, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.doc);
}

async function selectDocs(question: string): Promise<string[]> {
  try {
    const raw = await callClaude({
      system: SELECT_SYSTEM_PROMPT,
      user: buildSelectUserMessage(question, CORPUS_INDEX),
      maxTokens: 300,
    });
    const ids = parseJsonLoose<string[]>(raw);
    const valid = Array.isArray(ids) ? ids.filter((id) => Boolean(docMeta(id))) : [];
    if (valid.length > 0) return valid.slice(0, 5);
  } catch (err) {
    console.error('doc selection failed, falling back to keyword match', err);
  }
  return fallbackSelect(question).map((d) => d.id);
}

export async function POST(req: Request) {
  let body: {
    question?: string;
    userId?: number;
    sourceIds?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 });
  }

  const question = (body.question ?? '').trim();
  const userId = Number(body.userId);

  if (!question) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 });
  }
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const user = await getUser(userId);
  if (!user) {
    return NextResponse.json({ error: `No user with id ${userId}` }, { status: 404 });
  }

  // 1. Which docs go in the prompt.
  const requested = (body.sourceIds ?? []).filter((id) => Boolean(docMeta(id)));
  const autoSelected = requested.length === 0;
  const sourceIds = autoSelected ? await selectDocs(question) : requested;
  const docs = sourceIds.map((id) => getDoc(id)!).filter(Boolean);

  // 2. Every correction in the database. No fuzzy matching, Claude filters.
  const corrections = await getAllCorrections();

  // 3. Ask.
  let parsed: ClaudeAnswer | null = null;
  let rawText = '';
  try {
    rawText = await callClaude({
      system: ASK_SYSTEM_PROMPT,
      user: buildAskUserMessage({
        question,
        docs,
        corrections,
        askedBy: { name: user.name, role: user.role },
      }),
      maxTokens: 1500,
    });
    parsed = parseJsonLoose<ClaudeAnswer>(rawText);
  } catch (err) {
    console.error('ask call failed', err);
  }

  // 4. If the JSON did not parse, degrade to a low-confidence plain answer
  // rather than throwing. A blank page mid-demo is the worst outcome here.
  const answer = parsed?.answer?.trim() || rawText.trim() || "I don't have this documented.";
  const confidence: 'high' | 'medium' | 'low' =
    parsed && ['high', 'medium', 'low'].includes(parsed.confidence)
      ? parsed.confidence
      : 'low';
  const citations = Array.isArray(parsed?.citations) ? parsed!.citations : [];
  const payer = normalisePayer(parsed?.payer);

  // 5. Gaps only on low confidence. If medium logged too, the Gaps tab fills
  // with noise during testing and the demo looks broken.
  let loggedAsGap = false;
  if (confidence === 'low') {
    try {
      await insertGap({ question, askedBy: user.id, confidence, payer });
      loggedAsGap = true;
    } catch (err) {
      console.error('gap insert failed', err);
    }
  }

  // 6. Resolve citations so the UI does not have to know the corpus.
  const citedDocs = citations
    .map((id) => docMeta(id))
    .filter((d): d is DocMeta => Boolean(d));

  const citedCorrectionIds = citations
    .map((c) => /^correction-(\d+)$/.exec(c)?.[1])
    .filter((n): n is string => Boolean(n))
    .map(Number);

  const correctionsApplied = corrections
    .filter((c) => citedCorrectionIds.includes(c.id))
    .map((c) => ({
      id: c.id,
      citationId: `correction-${c.id}`,
      question: c.question,
      answer: c.answer,
      author: c.author_name,
      authorRole: c.author_role,
      weight: c.weight,
      totalWeight: c.question_total_weight,
      overridesDocId: c.overrides_doc_id,
      createdAt: c.created_at,
    }));

  return NextResponse.json({
    answer,
    citations,
    confidence,
    payer,
    citedDocs,
    correctionsApplied,
    sources: sourceIds.map((id) => docMeta(id)!).filter(Boolean),
    autoSelected,
    loggedAsGap,
    parseFailed: parsed === null,
  });
}

/** Convenience for the UI chat: GET /api/ask returns the corpus index. */
export async function GET() {
  return NextResponse.json({ index: CORPUS_INDEX, count: CORPUS.length });
}
