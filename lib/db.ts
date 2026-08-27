import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let client: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local.');
    }
    client = neon(url);
  }
  return client;
}

/**
 * Neon's HTTP driver. No connection pooling to think about on serverless,
 * which is the whole reason to use it over node-postgres here.
 *
 * Connected lazily on purpose. Next collects route metadata at build time,
 * which imports this module. Connecting at import would fail `next build` on
 * Vercel whenever DATABASE_URL is set as a runtime-only variable, and that is
 * a confusing failure to debug at 1am.
 */
export const sql = new Proxy((() => {}) as unknown as NeonQueryFunction<false, false>, {
  apply(_target, _thisArg, args: unknown[]) {
    return (getClient() as (...a: unknown[]) => unknown)(...args);
  },
  get(_target, prop) {
    // Build tooling probes things like Symbol.toStringTag on module exports.
    // Answering those must not require a connection string.
    if (typeof prop === 'symbol') return undefined;
    const c = getClient() as unknown as Record<string, unknown>;
    const value = c[prop];
    return typeof value === 'function' ? value.bind(c) : value;
  },
});

export type User = {
  id: number;
  name: string;
  role: string;
  expertise: string[];
};

export type KnowledgeEntry = {
  id: number;
  question: string;
  answer: string;
  sources: string[];
  author_id: number;
  weight: number;
  overrides_doc_id: string | null;
  created_at: string;
};

/** A knowledge entry joined to its author, plus the summed weight for its question. */
export type CorrectionWithAuthor = KnowledgeEntry & {
  author_name: string;
  author_role: string;
  question_total_weight: number;
};

export async function getUser(id: number): Promise<User | null> {
  const rows = (await sql`
    select id, name, role, expertise from users where id = ${id}
  `) as User[];
  return rows[0] ?? null;
}

export async function listUsers(): Promise<User[]> {
  return (await sql`
    select id, name, role, expertise from users order by id
  `) as User[];
}

/**
 * Every correction in the database, highest-weight question groups first.
 *
 * No fuzzy matching on purpose. In a demo there are under 20 of these. Pulling
 * them all and letting Claude decide which are relevant is fewer moving parts
 * than a string-similarity step that can misfire on stage.
 *
 * question_total_weight implements the spec's summing rule: two entries for the
 * same question add up, and the heaviest question group is ordered first so it
 * lands earliest in the prompt.
 */
export async function getAllCorrections(): Promise<CorrectionWithAuthor[]> {
  return (await sql`
    select
      k.id, k.question, k.answer, k.sources, k.author_id, k.weight,
      k.overrides_doc_id, k.created_at,
      u.name as author_name,
      u.role as author_role,
      sum(k.weight) over (partition by lower(trim(k.question)))::int
        as question_total_weight
    from knowledge_entries k
    join users u on u.id = k.author_id
    order by question_total_weight desc, k.created_at desc
  `) as CorrectionWithAuthor[];
}

export async function insertKnowledgeEntry(args: {
  question: string;
  answer: string;
  sources: string[];
  authorId: number;
  weight: number;
  overridesDocId: string | null;
}): Promise<KnowledgeEntry> {
  const rows = (await sql`
    insert into knowledge_entries
      (question, answer, sources, author_id, weight, overrides_doc_id)
    values (
      ${args.question}, ${args.answer}, ${args.sources},
      ${args.authorId}, ${args.weight}, ${args.overridesDocId}
    )
    returning *
  `) as KnowledgeEntry[];
  return rows[0];
}

export async function insertGap(args: {
  question: string;
  askedBy: number;
  confidence: string;
  payer: string | null;
}): Promise<void> {
  await sql`
    insert into gap_log (question, asked_by, confidence, payer)
    values (${args.question}, ${args.askedBy}, ${args.confidence}, ${args.payer})
  `;
}
