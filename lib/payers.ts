/**
 * The Gaps tab counts gaps with GROUP BY payer. If Claude returns "MetLife"
 * once and "Metlife Dental" the next time, that reads as two payers and the
 * coverage map stops meaning anything.
 *
 * Two defences: the prompt tells Claude to return exactly one of these strings,
 * and normalisePayer() catches it if Claude ignores that.
 */
export const CANONICAL_PAYERS = [
  'Delta Dental of California',
  'MetLife',
  'Cigna Dental',
  'Aetna Dental',
  'Guardian',
  'UnitedHealthcare Dental',
  'Humana Dental',
  'Ameritas',
  'Principal',
  'BCBS regional plans',
] as const;

export type CanonicalPayer = (typeof CANONICAL_PAYERS)[number];

/** Loose spellings mapped onto the canonical value. */
const ALIASES: Record<string, CanonicalPayer> = {
  'delta dental': 'Delta Dental of California',
  'delta dental ca': 'Delta Dental of California',
  'delta dental of ca': 'Delta Dental of California',
  'delta dental california': 'Delta Dental of California',
  'delta ca': 'Delta Dental of California',
  'metlife': 'MetLife',
  'metlife dental': 'MetLife',
  'met life': 'MetLife',
  'cigna': 'Cigna Dental',
  'aetna': 'Aetna Dental',
  'guardian dental': 'Guardian',
  'guardian life': 'Guardian',
  'unitedhealthcare': 'UnitedHealthcare Dental',
  'united healthcare dental': 'UnitedHealthcare Dental',
  'uhc dental': 'UnitedHealthcare Dental',
  'uhc': 'UnitedHealthcare Dental',
  'humana': 'Humana Dental',
  'ameritas dental': 'Ameritas',
  'principal dental': 'Principal',
  'bcbs': 'BCBS regional plans',
  'blue cross blue shield': 'BCBS regional plans',
  'anthem': 'BCBS regional plans',
};

export function normalisePayer(value: unknown): CanonicalPayer | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || /^(null|none|n\/a|unknown)$/i.test(trimmed)) return null;

  const exact = CANONICAL_PAYERS.find(
    (p) => p.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) return exact;

  const key = trimmed.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ');
  if (ALIASES[key]) return ALIASES[key];

  // Last resort: a canonical name contained in the string, or vice versa.
  const partial = CANONICAL_PAYERS.find((p) => {
    const pk = p.toLowerCase();
    return key.includes(pk) || pk.includes(key);
  });
  return partial ?? null;
}

/** The UI shows null as "Unknown". */
export function displayPayer(payer: string | null): string {
  return payer ?? 'Unknown';
}
