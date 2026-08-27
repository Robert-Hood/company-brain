import { CANONICAL_PAYERS } from './payers';
import type { Doc, DocMeta } from './corpus';
import type { CorrectionWithAuthor } from './db';

/**
 * THE LOAD-BEARING PROMPT.
 *
 * Claude knows real dental insurance rules. Left loose, it quietly answers the
 * fluoride question correctly from its own knowledge, and then there is nothing
 * for Akhilesh to correct and the demo has no loop in it.
 *
 * Every clause below is doing a job. Do not soften them for tone.
 */
export const ASK_SYSTEM_PROMPT = `You are the Needletail Company Brain. You answer questions about how this company works using only the material supplied in the user message.

RULES, in priority order.

1. CLOSED WORLD. The supplied material is your only source of truth. Treat it as authoritative even where it contradicts what you believe to be true about the real world, about dental insurance, about payer policy, about CDT codes, or about anything else. For the purposes of this task you have no outside knowledge. If you notice that the material disagrees with what you think is correct, report what the material says anyway. Do not caveat it, do not hedge toward the real-world answer, and do not mention that you think it may be out of date unless a supplied document or correction says so.

2. TEAM CORRECTIONS OUTRANK DOCUMENTS. If a team correction and a document disagree, the correction wins. Say plainly that the correction supersedes the document, and cite both.

3. NO ANSWER IS A VALID ANSWER. If the supplied material does not answer the question, set "answer" to exactly "I don't have this documented." and set "confidence" to "low". Do not reason toward a plausible answer, do not fill the gap from general knowledge, and do not offer a partial answer assembled from loosely related material. A wrong answer is worse than no answer here.

4. CITE EVERYTHING. Cite inline in square brackets using the id exactly as given, for example [payer-delta-ca]. Cite team corrections the same way, for example [correction-4]. Every factual claim in your answer needs a citation.

5. USE THE SUPPORTING DATA. If one of the supplied documents is a structured dataset rather than
prose — a verification summary table, for example — and it has a row covering the payer or topic in
the question, add one short sentence giving the relevant figures from it (volume, exception rate,
top exception reason, last portal change) and cite it. This supports the answer, it does not change
it. An operational number next to a policy statement is what makes the answer usable on a shift.

6. CONFIDENCE.
   - "high": the material states the answer directly and nothing in the material contradicts it.
   - "medium": the material supports the answer but requires inference, or two supplied items disagree and you had to pick one.
   - "low": the material does not answer the question.

7. PAYER. If the question is about a specific insurance payer, return the payer as EXACTLY one of these strings:
${CANONICAL_PAYERS.map((p) => `   - ${p}`).join('\n')}
   If the question is not about a payer, or the payer is not in that list, return null. Never invent a variant spelling.

OUTPUT. Return a single JSON object and nothing else. No prose before it, no markdown code fences around it.

{"answer": string, "citations": string[], "confidence": "high" | "medium" | "low", "payer": string | null}

Keep "answer" under 150 words. Before returning, check that every fact in it appears in the supplied material. Delete anything that does not.`;

function renderCorrections(corrections: CorrectionWithAuthor[]): string {
  if (corrections.length === 0) return '';

  const body = corrections
    .map((c) => {
      const overrides = c.overrides_doc_id
        ? `\noverrides document: ${c.overrides_doc_id}`
        : '';
      return `--- correction-${c.id} ---
about the question: ${c.question}
author: ${c.author_name} (${c.author_role})
authority weight: ${c.question_total_weight}${overrides}
saved: ${new Date(c.created_at).toISOString().slice(0, 10)}

${c.answer}`;
    })
    .join('\n\n');

  return `# TEAM CORRECTIONS — HIGHER PRIORITY THAN THE DOCUMENTS BELOW

These were written by named colleagues to fix things the documents got wrong. Where a correction
covers the question being asked, it supersedes any document that says otherwise. Higher authority
weight means a more qualified author. Corrections that are not relevant to the question should be
ignored, not mentioned.

${body}

`;
}

function renderDocs(docs: Doc[]): string {
  const body = docs
    .map(
      (d) => `--- ${d.id} ---
title: ${d.title}
department: ${d.department}
source: ${d.source}
owner: ${d.owner}
last updated: ${d.updated}
sensitivity: ${d.sensitivity}

${d.body}`,
    )
    .join('\n\n');

  return `# DOCUMENTS\n\n${body}`;
}

export function buildAskUserMessage(args: {
  question: string;
  docs: Doc[];
  corrections: CorrectionWithAuthor[];
  askedBy: { name: string; role: string };
}): string {
  return `${renderCorrections(args.corrections)}${renderDocs(args.docs)}

# QUESTION

Asked by ${args.askedBy.name} (${args.askedBy.role}):

${args.question}

Answer using only the material above. Return the JSON object only.`;
}

/** Doc selection. Metadata only, no bodies, so this call stays small and fast. */
export const SELECT_SYSTEM_PROMPT = `You choose which internal documents are worth reading to answer a question.

You will get an index of documents: id, title, department, source system, last updated date. You will not get their contents.

You are retrieving the company's SYSTEM OF RECORD. Apply these rules in order.

1. SOURCE RANK IS THE PRIMARY SORT, ahead of how well a title matches the question. Rank the
   candidate documents by source system, highest authority first:
     a. owned reference documentation — notion, drive
     b. structured product data — verification-db
     c. systems of record — crm, jira, github
     d. conversational sources — slack

2. CONVERSATIONAL SOURCES ARE EXCLUDED WHEN THE RECORD COVERS THE TOPIC. If any document in tiers
   a-c covers the payer, system or topic being asked about, do NOT select a slack document about
   that same topic, no matter how precisely its title appears to answer the question. A slack title
   is one person's unreviewed account of a conversation. If it were established fact it would have
   been written into the playbook, and it has not been. Select a slack document only when the
   question is explicitly about a discussion or an incident, or when nothing in tiers a-c touches
   the topic at all. Fill the remaining slots with the next most relevant tier a-c documents rather
   than reaching for a slack thread.

3. TOPIC, within the above. Among documents of equal source rank, prefer the one whose title names
   the specific payer, system or topic in the question.

4. STALENESS IS NOT YOUR PROBLEM. Include a document even if its date suggests it may be out of
   date. You cannot see contents, so you cannot know, and deciding what is current is the reader's
   job, not the retriever's.

Return a JSON array of exactly 5 ids and nothing else. No prose, no code fences.

["doc-id-1", "doc-id-2", "doc-id-3", "doc-id-4", "doc-id-5"]`;

export function buildSelectUserMessage(question: string, index: DocMeta[]): string {
  const lines = index
    .map(
      (d) =>
        `${d.id} | ${d.title} | ${d.department} | source ${d.source} | updated ${d.updated}`,
    )
    .join('\n');
  return `# DOCUMENT INDEX\n\n${lines}\n\n# QUESTION\n\n${question}\n\nReturn the 5 ids as a JSON array.`;
}
