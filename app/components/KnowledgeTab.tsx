'use client';

import { useEffect, useState } from 'react';
import type { KnowledgeEntry } from './types';
import { EmptyState, Spinner, WeightBadge, formatDate } from './ui';

export function KnowledgeTab({ onOpenDoc }: { onOpenDoc: (id: string) => void }) {
  const [entries, setEntries] = useState<KnowledgeEntry[] | null>(null);

  useEffect(() => {
    fetch('/api/knowledge')
      .then((r) => r.json())
      .then((d) => setEntries(d.entries));
  }, []);

  if (!entries) return <Spinner label="Loading knowledge entries…" />;

  return (
    <div>
      <Header
        title="Knowledge"
        subtitle={`${entries.length} correction${entries.length === 1 ? '' : 's'} written by the team. Higher weight wins at retrieval.`}
      />

      {entries.length === 0 ? (
        <EmptyState>
          No corrections yet. Answer a question on the Ask tab and correct it.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Question</th>
                <th className="px-4 py-3 font-medium">Correction</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Weight</th>
                <th className="px-4 py-3 font-medium">Overrides</th>
                <th className="px-4 py-3 font-medium">Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e) => (
                <tr key={e.id} className="align-top">
                  <td className="max-w-[16rem] px-4 py-3 text-slate-800">{e.question}</td>
                  <td className="max-w-[22rem] px-4 py-3 text-slate-600">
                    {e.answer.length > 160 ? `${e.answer.slice(0, 160)}…` : e.answer}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="font-medium text-slate-900">{e.author}</div>
                    <div className="text-xs text-slate-500">{e.authorRole}</div>
                  </td>
                  <td className="px-4 py-3">
                    <WeightBadge weight={e.weight} />
                  </td>
                  <td className="px-4 py-3">
                    {e.overridesDocId ? (
                      <button
                        onClick={() => onOpenDoc(e.overridesDocId!)}
                        className="font-mono text-xs text-slate-700 underline decoration-slate-300 hover:decoration-slate-700"
                      >
                        {e.overridesDocId}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                    {formatDate(e.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
