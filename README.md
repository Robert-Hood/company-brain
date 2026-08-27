# Company Brain — backend

Ask a question, get a cited answer, correct it, watch the correction change the next answer.
Everything else is UI on top of these routes.

All data is synthetic and modelled on Needletail's public positioning.

## Setup

```bash
npm install
cp .env.example .env.local     # fill in DATABASE_URL and ANTHROPIC_API_KEY
npm run db:setup               # applies db/schema.sql, then seeds the 4 users
npm run dev
```

In a second terminal:

```bash
npm run smoke
```

That runs the four demo steps against the running server and asserts on each one. **Do not start
the UI until it passes.** It takes about 30 seconds and it tests the only things that can kill the
Loom.

## Scripts

| command | what it does |
|---|---|
| `npm run db:setup` | schema + seed, idempotent |
| `npm run seed` | users only |
| `npm run reset` | wipes `knowledge_entries` and `gap_log`, leaves users. **Run this immediately before recording.** |
| `npm run build:corpus` | regenerates `lib/corpus.ts` from `data/corpus/*.md`. Run after editing any doc. |
| `npm run smoke` | the four demo steps, with assertions |
| `npm run build` | runs `build:corpus` then `next build` |

## The four decisions worth knowing about

**The corpus is a code file, not files on disk.** `scripts/build-corpus.mjs` reads the 31 markdown
docs and writes `lib/corpus.ts`, which is committed. Serverless functions do not reliably ship loose
files outside the code tree, so reading `/data/corpus` at runtime works locally and 500s after
deploy. Nothing to configure on Vercel and the docs load instantly. Re-run `npm run build:corpus`
after editing a doc; `npm run build` does it for you.

**The prompt is closed-world, on purpose.** `ASK_SYSTEM_PROMPT` in `lib/prompts.ts` tells Claude the
supplied material is the only source of truth, explicitly including where it contradicts real-world
dental insurance rules. Without that clause Claude answers the fluoride question correctly from its
own knowledge, and then there is nothing for Akhilesh to correct and the demo has no loop in it.
Step 1 of the smoke test exists to catch exactly this regression. If it fails, the prompt is wrong,
not the corpus.

**Retrieval ranks by source authority, not just relevance.** `SELECT_SYSTEM_PROMPT` sorts candidate
documents by source system first — owned documentation (notion, drive), then structured product data
(verification-db), then systems of record (crm, jira, github), then chat (slack) — and will not pull
a Slack thread about a topic the documentation already covers.

This is load-bearing, and worth knowing before anyone asks about it. Without it the fluoride question
retrieves `slack-fluoride-delta-june`, whose title states the June change outright, and the very first
answer is already correct. There is then nothing for Akhilesh to correct and the demo has no loop in
it. With it, the brain retrieves the official playbook and the verification summary, answers Basic
with high confidence, and is wrong — because the truth was in a Slack thread that never got written
back into the playbook. That is the real failure mode of retrieval over a company corpus, and it is
the one the correction loop exists to fix.

**All corrections go into the prompt, unfiltered.** No fuzzy matching. Under 20 rows in a demo, so
they all get pulled and Claude decides which are relevant. Fewer moving parts than a string
similarity step that can misfire live. `question_total_weight` implements the spec's summing rule and
orders the heaviest question group first. Add real matching only if the table gets large, which it
will not.

**Payer values are constrained twice.** The prompt names the ten allowed strings, and
`normalisePayer()` in `lib/payers.ts` maps loose spellings onto them anyway. If Claude returned
"MetLife" once and "Metlife Dental" the next time, the Gaps `GROUP BY payer` would show two payers
and the coverage map would stop meaning anything.

## The weight rule, in one sentence

A correction is weight 3 if the author's expertise includes the department of the doc being
overridden, otherwise 1.

The spec says "the doc's department", but answers cite several docs from different departments, so
`lib/weight.ts` resolves it in a fixed order: the overridden doc if there is one, else the first
cited doc, else weight 1. Deliberately not cleverer than that.

## Gap logging

Only on `confidence: "low"`. Not medium. If medium logged too, the Gaps tab fills with noise during
testing and the demo looks broken.

## Files

```
app/api/ask/route.ts        the query flow
app/api/correct/route.ts    the correction flow
app/api/users|knowledge|gaps|docs/[id]   reads for the UI tabs
lib/prompts.ts              the load-bearing prompts
lib/claude.ts               Anthropic call + defensive JSON parsing
lib/corpus.ts               GENERATED, do not edit
lib/weight.ts               the weight rule and the toast string
lib/payers.ts               canonical payer list and normalisation
lib/db.ts                   Neon client and queries
db/schema.sql               users, knowledge_entries, gap_log
data/corpus/                the 31 source docs
data/PLANTED.md             the four deliberate contradictions
data/CANON.md               internal fact sheet. NOT part of the corpus, never goes in a prompt.
API-SHAPES.md               the contract. Paste into the UI chat.
```

## Deploy

Set `DATABASE_URL` and `ANTHROPIC_API_KEY` in Vercel project settings, then push. The build does not
touch the database or the Anthropic API, so a missing env var fails at request time rather than
breaking the build in a confusing way.
