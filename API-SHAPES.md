# API shapes

Paste this whole file into the UI chat alongside Part 5 and the demo script. It is the contract.
The UI should not need to know anything about the corpus, the weight rule or the payer list beyond
what is here.

Response bodies below are real field-for-field. The example *values* inside `answer` strings are
illustrative, since the exact wording comes from Claude at runtime.

---

## POST /api/ask

### Request

```json
{
  "question": "Does fluoride count under basic or preventive for Delta Dental of California?",
  "userId": 4,
  "sourceIds": ["payer-delta-ca", "payer-coverage-summary"]
}
```

| field | type | required | notes |
|---|---|---|---|
| `question` | string | yes | non-empty after trim |
| `userId` | number | yes | 1 Jofin Joseph, 2 Akhilesh T, 3 Nakul R, 4 Sam Ortiz |
| `sourceIds` | string[] | no | omit or send `[]` to let Claude pick 5. Unknown ids are silently dropped. |

The chips flow: send the first request with no `sourceIds`, read `sources` off the response, render
those as pre-ticked chips. When the user toggles chips and re-asks, send the ticked ids back as
`sourceIds`.

### Response, 200

```json
{
  "answer": "Fluoride varnish (D1206) is adjudicated under Basic at 80% ... [payer-delta-ca]",
  "citations": ["payer-delta-ca", "payer-coverage-summary"],
  "confidence": "high",
  "payer": "Delta Dental of California",
  "citedDocs": [
    {
      "id": "payer-delta-ca",
      "title": "Delta Dental of California verification playbook",
      "department": "ops",
      "source": "notion",
      "owner": "Akhilesh T",
      "updated": "2026-02-11",
      "sensitivity": "internal"
    }
  ],
  "correctionsApplied": [],
  "sources": [ /* same DocMeta shape, the docs that were put in the prompt */ ],
  "autoSelected": true,
  "loggedAsGap": false,
  "parseFailed": false
}
```

| field | type | notes |
|---|---|---|
| `answer` | string | contains inline `[doc-id]` markers. Render them as chips or leave as text, your call. |
| `citations` | string[] | doc ids **and** correction ids in the form `correction-4`. Raw, as returned. |
| `confidence` | `"high" \| "medium" \| "low"` | badge |
| `payer` | string \| null | one of the ten canonical payer strings, or null. Display null as "Unknown". |
| `citedDocs` | DocMeta[] | `citations` resolved to real docs. Correction ids are excluded. **Use this for citation chips.** |
| `correctionsApplied` | Correction[] | the corrections Claude actually cited. Empty array if none. Drives the "Team corrections applied" list. |
| `sources` | DocMeta[] | every doc that went into the prompt, in prompt order. **Use this for the source chips.** |
| `autoSelected` | boolean | true if Claude picked the docs, false if the caller supplied `sourceIds` |
| `loggedAsGap` | boolean | true when the question was written to `gap_log`. Only ever true when confidence is `low`. |
| `parseFailed` | boolean | true if Claude's JSON did not parse and the route degraded gracefully. Useful in dev, ignore in UI. |

`DocMeta`:

```ts
{ id, title, department, source, owner, updated, sensitivity }
// department: 'gtm' | 'product' | 'engineering' | 'ga' | 'ops'
// sensitivity: 'public' | 'internal' | 'phi-restricted'
```

`Correction` inside `correctionsApplied`:

```ts
{
  id: number,
  citationId: string,        // "correction-4", matches the entry in citations
  question: string,
  answer: string,
  author: string,            // "Akhilesh T"
  authorRole: string,        // "RCM Lead"
  weight: number,            // this entry's weight
  totalWeight: number,       // summed across all entries for the same question
  overridesDocId: string | null,
  createdAt: string          // ISO timestamp
}
```

### Errors

`400 {"error":"question is required"}`, `400 {"error":"userId is required"}`,
`404 {"error":"No user with id 9"}`. Nothing else 4xxs. Anthropic failures do not throw: the route
returns 200 with `parseFailed: true`, confidence `low` and a best-effort answer, so the page never
goes blank mid-demo.

---

## POST /api/correct

### Request

```json
{
  "question": "Does fluoride count under basic or preventive for Delta Dental of California?",
  "correctedAnswer": "Adult fluoride varnish (D1206) is Preventive at 100%, deductible waived, effective 2026-06-01.",
  "userId": 2,
  "overridesDocId": "payer-delta-ca",
  "citations": ["payer-delta-ca", "payer-coverage-summary"]
}
```

| field | type | required | notes |
|---|---|---|---|
| `question` | string | yes | send the **original question text**, unmodified, or the correction will not group with it |
| `correctedAnswer` | string | yes | the textarea contents |
| `userId` | number | yes | whoever is selected in the picker |
| `overridesDocId` | string \| null | no | the doc the user picked to override. Unknown ids are treated as null. |
| `citations` | string[] | no | pass `citations` straight through from the ask response. `correction-N` entries are filtered out server-side, so no need to clean them. |

### Response, 200

```json
{
  "entry": {
    "id": 1,
    "question": "Does fluoride count under basic or preventive for Delta Dental of California?",
    "answer": "Adult fluoride varnish (D1206) is Preventive at 100% ...",
    "sources": ["payer-delta-ca", "payer-coverage-summary"],
    "authorId": 2,
    "author": "Akhilesh T",
    "authorRole": "RCM Lead",
    "weight": 3,
    "overridesDocId": "payer-delta-ca",
    "createdAt": "2026-08-27T10:14:02.113Z"
  },
  "weight": 3,
  "matchedDepartment": "ops",
  "weightReason": "Akhilesh T (RCM Lead) has ops expertise and payer-delta-ca is a ops doc, weight 3.",
  "toast": "Saved as knowledge entry. Author: Akhilesh T (ops expert, weight 3). Overrides: payer-delta-ca."
}
```

**Render `toast` verbatim.** It is built server-side precisely so the UI cannot drift from the
weight rule. `weightReason` is a longer sentence if you want it in a tooltip.

### Errors

`400` for missing `question`, `correctedAnswer` or `userId`. `404` for an unknown user.

---

## Supporting reads

The Knowledge and Gaps tabs read from these. All plain `GET`, no params.

### GET /api/users

```json
{ "users": [ { "id": 1, "name": "Jofin Joseph", "role": "CEO", "expertise": ["gtm","product"] } ] }
```

Populate the picker from this rather than hardcoding, so the dropdown cannot drift from the seed.

### GET /api/knowledge

Newest first. Knowledge tab table.

```json
{
  "entries": [
    {
      "id": 1,
      "question": "...",
      "answer": "...",
      "sources": ["payer-delta-ca"],
      "weight": 3,
      "overridesDocId": "payer-delta-ca",
      "createdAt": "2026-08-27T10:14:02.113Z",
      "author": "Akhilesh T",
      "authorRole": "RCM Lead"
    }
  ]
}
```

### GET /api/gaps

```json
{
  "gaps": [
    {
      "id": 1,
      "question": "What's our refund policy for churned customers?",
      "payer": null,
      "confidence": "low",
      "createdAt": "2026-08-27T10:16:44.902Z",
      "askedBy": "Sam Ortiz"
    }
  ],
  "payerCounts": [ { "payer": "MetLife", "count": 3 }, { "payer": "Unknown", "count": 2 } ]
}
```

`payerCounts` is already `GROUP BY`-ed and null is already collapsed to `"Unknown"`. The one-line
coverage map is just `payerCounts.map(p => p.payer + ' ' + p.count).join(' · ')`.

### GET /api/docs/[id]

For the citation-chip side panel. Returns the full document including `body` (markdown).

```json
{ "doc": { "id": "payer-delta-ca", "title": "...", "department": "ops", "source": "notion",
           "owner": "Akhilesh T", "updated": "2026-02-11", "sensitivity": "internal",
           "body": "# Delta Dental of California\n\n..." } }
```

404 with `{"error":"No document x"}` for an unknown id.

### GET /api/ask

Yes, a GET on the ask route. Returns `{ index: DocMeta[], count: 31 }` — the whole corpus index,
metadata only. Handy if you want a source browser without 31 round trips.

---

## Two things the UI should show that the spec never mentions

Both are near-free and both answer the first question anyone asks about a company knowledge system.

1. **`sensitivity` badge** on citation chips and in the doc side panel. Three docs are
   `phi-restricted` (`eng-oncall-notes`, `escalation-sop`, `hitl-verifier-onboarding`). Showing it
   signals the brain understands access control.
2. **`updated` date** in the doc side panel. The fluoride playbook is `2026-02-11`, the Slack thread
   that corrects it is `2026-06-11`. With the dates on screen the demo stops being "the AI was
   wrong" and becomes "the document was stale and the app can see that". That is a much better
   story and it costs one line of JSX.
