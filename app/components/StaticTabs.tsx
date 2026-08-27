'use client';

import { Header } from './KnowledgeTab';

/** Doc counts are the real ones from the corpus index, so the grid is not a lie. */
const CONNECTORS = [
  { name: 'Notion', connected: true, docs: 12, note: 'Playbooks, SOPs, QA rubric' },
  { name: 'Google Drive', connected: true, docs: 5, note: 'Call notes, policies' },
  { name: 'Slack', connected: true, docs: 3, note: '#verification-help' },
  { name: 'GitHub', connected: true, docs: 4, note: 'Runbooks, architecture' },
  { name: 'HubSpot', connected: true, docs: 4, note: 'Discovery notes, lost deals' },
  { name: 'Jira', connected: true, docs: 2, note: 'Tickets, PRDs' },
  { name: 'Gmail', connected: false, docs: 0, note: 'Payer correspondence' },
];

export function SourcesTab() {
  return (
    <div>
      <Header
        title="Sources"
        subtitle="Where the brain reads from. 31 documents across six connectors and the verification database."
      />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {CONNECTORS.map((c) => (
          <div
            key={c.name}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium text-slate-900">{c.name}</div>
              {c.connected ? (
                <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  Connected
                </span>
              ) : (
                <button className="whitespace-nowrap rounded-full border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:border-slate-400">
                  Connect
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">{c.note}</p>
            <p className="mt-2 text-xs text-slate-400">
              {c.docs > 0 ? `${c.docs} documents` : 'Not indexed'}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-3 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-semibold text-slate-900">Product data</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          The verification platform itself as a source, alongside the documents.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-300 bg-white px-4 py-4">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium text-slate-900">Verification DB (structured)</div>
            <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Connected
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-600">
            Volume, exception rate and top exception reason per payer. Cited in answers
            next to the human-written playbooks.
          </p>
        </div>

        <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-4">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium text-slate-900">Claims outcomes</div>
            <span className="whitespace-nowrap rounded-full border border-slate-300 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              Not connected
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-700">
            Joining eligibility to claim outcome is what turns the corpus into a model.
          </p>
        </div>
      </div>
    </div>
  );
}

export function BuildTab() {
  return (
    <div className="max-w-3xl">
      <Header
        title="Build"
        subtitle="The brain is an API. Point Claude, Cursor or a script at it."
      />

      <p className="mb-5 text-sm leading-relaxed text-slate-600">
        Everything the UI does goes through two routes. Anything that can make an HTTP
        request can ask the company a question and get a cited answer back, which means
        the brain can sit inside a verifier&apos;s workflow rather than in another tab.
      </p>

      <div className="mb-6 overflow-x-auto rounded-lg bg-slate-900 px-4 py-3.5">
        <pre className="font-mono text-xs leading-relaxed text-slate-100">
          {`curl -X POST https://company-brain.vercel.app/api/ask \\
  -H 'content-type: application/json' \\
  -d '{
    "question": "Does Delta CA need a call for perio frequency?",
    "userId": 4
  }'`}
        </pre>
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 p-4">
        <h3 className="mb-3 text-sm font-medium text-slate-900">
          Save this query as an automation
        </h3>
        <div className="space-y-3">
          <input
            placeholder="Name, e.g. Daily Delta CA frequency check"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400"
          />
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600">
            <option>Run every morning at 08:00</option>
            <option>Run on every new discovery call</option>
            <option>Run when a payer portal changes</option>
          </select>
          <button className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400">
            Create automation
          </button>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-600">
        The same two routes exposed as an MCP server would let Claude read the brain
        directly, so a verifier could ask in the tool they already have open.
      </p>
    </div>
  );
}

export function OpportunitiesTab() {
  return (
    <div className="max-w-3xl">
      <Header
        title="Opportunities"
        subtitle="Where two parts of the company are talking about the same thing without knowing it."
      />

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-orange-700 ring-1 ring-inset ring-orange-600/20">
            gtm
          </span>
          <span className="text-slate-300">→</span>
          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-600/20">
            product
          </span>
        </div>

        <p className="text-[15px] leading-relaxed text-slate-800">
          Discovery call with Bright Smile DSO (Aug 12) mentioned needing claims status
          inside Eaglesoft. Matches roadmap item{' '}
          <span className="font-mono text-sm">PRD-014</span> (Claims status v1).
        </p>

        <p className="mt-2 text-sm text-slate-500">Owner: Nakul R</p>

        <div className="mt-4 flex gap-2">
          <button className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
            Useful
          </button>
          <button className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
