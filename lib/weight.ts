import { docMeta } from './corpus';
import type { User } from './db';

export type WeightResult = {
  weight: 1 | 3;
  /** The department the weight was judged against, null if none could be found. */
  matchedDepartment: string | null;
  /** Which doc supplied that department, for the toast. */
  basisDocId: string | null;
  /** One sentence, safe to put on screen. */
  reason: string;
};

/**
 * The spec says "expertise includes the doc's department", but an answer cites
 * several docs and they can be from different departments, so "the doc" is
 * ambiguous. One rule, in order:
 *
 *   1. If the correction overrides a specific doc, use that doc's department.
 *   2. Otherwise use the department of the first cited doc.
 *   3. No match, weight 1.
 *
 * Deliberately not cleverer than that. It has to be explainable in one sentence
 * on the Loom.
 */
export function computeWeight(
  user: User,
  overridesDocId: string | null,
  citations: string[],
): WeightResult {
  const basisDocId =
    (overridesDocId && docMeta(overridesDocId) ? overridesDocId : null) ??
    citations.find((id) => Boolean(docMeta(id))) ??
    null;

  const department = basisDocId ? docMeta(basisDocId)!.department : null;

  if (!department) {
    return {
      weight: 1,
      matchedDepartment: null,
      basisDocId: null,
      reason: `${user.name} (${user.role}) — no cited document to judge expertise against, weight 1.`,
    };
  }

  const expert = user.expertise.includes(department);
  return {
    weight: expert ? 3 : 1,
    matchedDepartment: department,
    basisDocId,
    reason: expert
      ? `${user.name} (${user.role}) has ${department} expertise and ${basisDocId} is a ${department} doc, weight 3.`
      : `${user.name} (${user.role}) does not have ${department} expertise, weight 1.`,
  };
}

/** The exact string the UI toast shows. Built here so the UI cannot get it wrong. */
export function buildToast(
  user: User,
  result: WeightResult,
  overridesDocId: string | null,
): string {
  const expertise = result.matchedDepartment && result.weight === 3
    ? `${result.matchedDepartment} expert, weight ${result.weight}`
    : `weight ${result.weight}`;
  const overrides = overridesDocId ? ` Overrides: ${overridesDocId}.` : '';
  return `Saved as knowledge entry. Author: ${user.name} (${expertise}).${overrides}`;
}
