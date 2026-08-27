'use client';

import { useEffect, useState } from 'react';
import type { AskResponse, CorrectResponse, DocMeta, Department, User } from './types';
import {
  ConfidenceBadge,
  DeptPill,
  EmptyState,
  SensitivityBadge,
  Spinner,
  WeightBadge,
} from './ui';

const EXAMPLES = [
  'Does fluoride count under basic or preventive for Delta Dental of California?',
  "What's our refund policy for churned customers?",
];

const DEPT_ORDER: Department[] = ['ops', 'gtm', 'product', 'engineering', 'ga'];

export function AskTab({
  user,
  onOpenDoc,
  onToast,
}: {
  user: User | null;
  onOpenDoc: (id: string) => void;
  onToast: (message: string) => void;
}) {
  const [question, setQuestion] = useState('');
  /** The question that produced `result`. Corrections must be filed against this exact string. */
  const [askedQuestion, setAskedQuestion] = useState('');

  // The full corpus, browsable while composing a question. Reuses GET /api/ask,
  // which already returns the index — no backend change needed for this.
  const [allDocs, setAllDocs] = useState<DocMeta[]>([]);
  const [browseOpen, setBrowseOpen] = useState(false);
  // Empty = auto mode, the brain picks 5. Non-empty = the user's own selection.
  const [ticked, setTicked] = useState<string[]>([]);

  const [result, setResult] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [correcting, setCorrecting] = useState(false);
  const [correctionText, setCorrectionText] = useState('');
  const [overridesDocId, setOverridesDocId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/ask')
      .then((r) => r.json())
      .then((d: { index: DocMeta[] }) => setAllDocs(d.index));
  }, []);

  async function ask() {
    const q = question.trim();
    if (!q || !user) return;

    const manual = ticked.length > 0;

    setLoading(true);
    setError(null);
    setCorrecting(false);
    setCorrectionText('');

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question: q,
          userId: user.id,
          ...(manual ? { sourceIds: ticked } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Request failed');

      const answer = data as AskResponse;
      setResult(answer);
      setAskedQuestion(q);
      // Sync ticks to what was actually used, whether the brain picked it or
      // the user did, so the panel always shows the real state and can be
      // adjusted before the next ask.
      setTicked(answer.sources.map((s) => s.id));
      setOverridesDocId(answer.citedDocs[0]?.id ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function saveCorrection() {
    if (!user || !result || !correctionText.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question: askedQuestion,
          correctedAnswer: correctionText.trim(),
          userId: user.id,
          overridesDocId: overridesDocId || null,
          citations: result.citations,
        }),
      });
      const data = (await res.json()) as CorrectResponse & { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Save failed');

      // Rendered verbatim. Built server-side so the UI cannot drift from the weight rule.
      onToast(data.toast);
      setCorrecting(false);
      setCorrectionText('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save the correction');
    } finally {
      setSaving(false);
    }
  }

  function toggleChip(id: string) {
    setTicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <label htmlFor="question" className="mb-2 block text-sm font-medium text-slate-700">
          Ask the brain
        </label>
        <div className="flex gap-2">
          <input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && ask()}
            placeholder="Does fluoride count under basic or preventive for Delta Dental of California?"
            className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
          <button
            onClick={ask}
            disabled={loading || !question.trim() || !user}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Asking…' : 'Ask'}
          </button>
        </div>

        {!result && !loading && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Try:</span>
            {EXAMPLES.map((e) => (
              <button
                key={e}
                onClick={() => setQuestion(e)}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 transition hover:bg-slate-200"
              >
                {e.length > 52 ? `${e.slice(0, 52)}…` : e}
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="mb-6 rounded-lg border border-slate-200 bg-slate-50">
        <button
          onClick={() => setBrowseOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <span
              className={`inline-block text-slate-400 transition-transform ${browseOpen ? 'rotate-90' : ''}`}
              aria-hidden
            >
              ▸
            </span>
            Sources
          </span>
          <span className="text-xs text-slate-500">
            {ticked.length > 0
              ? `${ticked.length} ${result ? 'used' : 'chosen'} — ${
                  result?.autoSelected ? 'picked by the brain' : 'your selection'
                }`
              : `${allDocs.length || 31} documents available — the brain will pick 5`}
          </span>
        </button>

        {browseOpen && (
          <div className="border-t border-slate-200 px-4 py-3">
            {ticked.length > 0 && (
              <button
                onClick={() => setTicked([])}
                className="mb-3 text-xs text-slate-500 underline decoration-slate-300 hover:decoration-slate-700"
              >
                Clear selection — let the brain pick again
              </button>
            )}
            <div className="space-y-3">
              {DEPT_ORDER.map((dept) => {
                const docs = allDocs.filter((d) => d.department === dept);
                if (docs.length === 0) return null;
                return (
                  <div key={dept}>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <DeptPill value={dept} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {docs.map((doc) => {
                        const on = ticked.includes(doc.id);
                        return (
                          <button
                            key={doc.id}
                            onClick={() => toggleChip(doc.id)}
                            title={doc.title}
                            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                              on
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-300 bg-white text-slate-500 hover:border-slate-400'
                            }`}
                          >
                            <span aria-hidden>{on ? '✓' : '+'}</span>
                            <span className="font-mono">{doc.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-slate-200 p-6">
          <Spinner label="Reading the corpus and any team corrections…" />
        </div>
      )}

      {result && !loading && (
        <section className="rounded-lg border border-slate-200 shadow-sm">
          <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3">
            <ConfidenceBadge value={result.confidence} />
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {result.payer && (
                <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  {result.payer}
                </span>
              )}
              {result.loggedAsGap && (
                <span className="font-medium text-rose-600">Logged to Gaps</span>
              )}
            </div>
          </header>

          <div className="px-5 py-4">
            <p className="text-[15px] leading-relaxed text-slate-800">
              {renderAnswer(result.answer, onOpenDoc)}
            </p>
          </div>

          {result.citedDocs.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-4">
              <h4 className="mb-2.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                Cited documents
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.citedDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => onOpenDoc(doc.id)}
                    className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-slate-400 hover:shadow-sm"
                  >
                    <div>
                      <div className="font-mono text-xs text-slate-900 group-hover:underline">
                        {doc.id}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <SensitivityBadge value={doc.sensitivity} />
                        <span className="text-[10px] text-slate-400">
                          updated {doc.updated}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {result.correctionsApplied.length > 0 && (
            <div className="border-t border-slate-100 bg-emerald-50/40 px-5 py-4">
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wide text-emerald-700">
                Team corrections applied
              </h4>
              <ul className="space-y-3">
                {result.correctionsApplied.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-emerald-200 bg-white px-4 py-3"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-medium text-slate-900">{c.author}</span>
                      <span className="text-slate-500">{c.authorRole}</span>
                      <WeightBadge weight={c.weight} />
                      {c.overridesDocId && (
                        <span className="text-slate-500">
                          overrides{' '}
                          <button
                            onClick={() => onOpenDoc(c.overridesDocId!)}
                            className="font-mono text-slate-700 underline decoration-slate-300 hover:decoration-slate-700"
                          >
                            {c.overridesDocId}
                          </button>
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{c.answer}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <footer className="border-t border-slate-100 px-5 py-4">
            {!correcting ? (
              <button
                onClick={() => setCorrecting(true)}
                className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                Correct this
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="correction"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    What is the right answer?
                  </label>
                  <textarea
                    id="correction"
                    rows={4}
                    value={correctionText}
                    onChange={(e) => setCorrectionText(e.target.value)}
                    placeholder="Adult fluoride varnish (D1206) is Preventive at 100%, deductible waived, effective 2026-06-01 per the June Slack thread."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                {result.citedDocs.length > 0 && (
                  <div>
                    <label
                      htmlFor="overrides"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Overrides which document?
                    </label>
                    <select
                      id="overrides"
                      value={overridesDocId}
                      onChange={(e) => setOverridesDocId(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="">Nothing specific</option>
                      {result.citedDocs.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.id} — {d.title}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-slate-500">
                      Authority weight is judged against this document&apos;s department.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={saveCorrection}
                    disabled={saving || !correctionText.trim()}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {saving ? 'Saving…' : 'Save correction'}
                  </button>
                  <button
                    onClick={() => setCorrecting(false)}
                    className="px-3 py-2 text-sm text-slate-500 transition hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <span className="ml-auto text-xs text-slate-500">
                    Saving as <span className="font-medium text-slate-700">{user?.name}</span>
                  </span>
                </div>
              </div>
            )}
          </footer>
        </section>
      )}

      {!result && !loading && !error && (
        <EmptyState>
          Ask a question to see a cited answer. Corrections you save become part of the
          brain and change the next answer.
        </EmptyState>
      )}
    </div>
  );
}

/**
 * Turns inline [doc-id] markers into clickable chips. Correction ids get their
 * own colour so "the brain used a colleague's correction" reads at a glance.
 */
function renderAnswer(answer: string, onOpenDoc: (id: string) => void) {
  const parts = answer.split(/(\[[a-zA-Z0-9-]+\])/g);

  return parts.map((part, i) => {
    const match = /^\[([a-zA-Z0-9-]+)\]$/.exec(part);
    if (!match) return <span key={i}>{part}</span>;

    const id = match[1];
    const isCorrection = /^correction-\d+$/.test(id);

    if (isCorrection) {
      return (
        <span
          key={i}
          className="mx-0.5 inline-flex rounded bg-emerald-100 px-1.5 py-0.5 align-baseline font-mono text-[11px] font-medium text-emerald-800"
        >
          {id}
        </span>
      );
    }

    return (
      <button
        key={i}
        onClick={() => onOpenDoc(id)}
        className="mx-0.5 inline-flex rounded bg-slate-100 px-1.5 py-0.5 align-baseline font-mono text-[11px] font-medium text-slate-700 transition hover:bg-slate-900 hover:text-white"
      >
        {id}
      </button>
    );
  });
}
