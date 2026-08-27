/**
 * Reads every markdown file in /data/corpus and writes lib/corpus.ts.
 *
 * Why: Vercel serverless functions do not reliably ship loose files that sit
 * outside the code. Reading /data/corpus at runtime works locally and breaks
 * after deploy. So the corpus becomes a code file, imported like any module.
 *
 * Run once, commit the output. Re-run after editing any doc:
 *   npm run build:corpus
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const CORPUS_DIR = path.join(process.cwd(), 'data', 'corpus');
const OUT_FILE = path.join(process.cwd(), 'lib', 'corpus.ts');

const DEPARTMENTS = ['gtm', 'product', 'engineering', 'ga', 'ops'];
const SENSITIVITIES = ['public', 'internal', 'phi-restricted'];

// gray-matter hands back a JS Date for an unquoted YAML date (2026-06-14).
// Left alone that serialises as an ISO timestamp and the doc panel shows
// "2026-06-14T00:00:00.000Z". Force it back to a plain date string.
function asDateString(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function main() {
  const files = fs
    .readdirSync(CORPUS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();

  const docs = [];
  const problems = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CORPUS_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    const id = data.id ?? file.replace(/\.md$/, '');

    if (data.id && data.id !== file.replace(/\.md$/, '')) {
      problems.push(`${file}: frontmatter id "${data.id}" does not match filename`);
    }
    if (!DEPARTMENTS.includes(data.department)) {
      problems.push(`${file}: unknown department "${data.department}"`);
    }
    if (!SENSITIVITIES.includes(data.sensitivity)) {
      problems.push(`${file}: unknown sensitivity "${data.sensitivity}"`);
    }

    docs.push({
      id,
      title: data.title ?? id,
      department: data.department,
      source: data.source,
      owner: data.owner ?? 'Unknown',
      updated: asDateString(data.updated),
      sensitivity: data.sensitivity,
      body: content.trim(),
    });
  }

  const ids = docs.map((d) => d.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) problems.push(`duplicate ids: ${dupes.join(', ')}`);

  if (problems.length) {
    console.error('Corpus problems found:');
    for (const p of problems) console.error('  - ' + p);
    process.exit(1);
  }

  const header = `// GENERATED FILE. Do not edit by hand.
// Source: /data/corpus/*.md  ->  npm run build:corpus
// ${docs.length} documents, generated ${new Date().toISOString().slice(0, 10)}.

export type Department = 'gtm' | 'product' | 'engineering' | 'ga' | 'ops';
export type Sensitivity = 'public' | 'internal' | 'phi-restricted';

export type Doc = {
  id: string;
  title: string;
  department: Department;
  source: string;
  owner: string;
  updated: string;
  sensitivity: Sensitivity;
  body: string;
};

export type DocMeta = Omit<Doc, 'body'>;

export const CORPUS: Doc[] = ${JSON.stringify(docs, null, 2)};

const BY_ID = new Map(CORPUS.map((d) => [d.id, d]));

export function getDoc(id: string): Doc | undefined {
  return BY_ID.get(id);
}

export function docExists(id: string): boolean {
  return BY_ID.has(id);
}

/** Metadata only. This is what goes into the doc-selection prompt. */
export const CORPUS_INDEX: DocMeta[] = CORPUS.map(({ body, ...meta }) => meta);

export function docMeta(id: string): DocMeta | undefined {
  const d = BY_ID.get(id);
  if (!d) return undefined;
  const { body, ...meta } = d;
  return meta;
}
`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, header, 'utf8');

  const words = docs.reduce((n, d) => n + d.body.split(/\s+/).length, 0);
  const byDept = docs.reduce((acc, d) => {
    acc[d.department] = (acc[d.department] || 0) + 1;
    return acc;
  }, {});

  console.log(`Wrote lib/corpus.ts — ${docs.length} docs, ~${words} words total.`);
  console.log('By department:', byDept);
}

main();
