'use client';

import { useEffect, useState } from 'react';
import { Header } from './KnowledgeTab';
import type { Gap, PayerCount } from './types';
import { EmptyState, Spinner, formatDate } from './ui';

export function GapsTab() {
  const [gaps, setGaps] = useState<Gap[] | null>(null);
  const [payerCounts, setPayerCounts] = useState<PayerCount[]>([]);

  useEffect(() => {
    fetch('/api/gaps')
      .then((r) => r.json())
      .then((d) => {
        setGaps(d.gaps);
        setPayerCounts(d.payerCounts);
      });
  }, []);

  if (!gaps) return <Spinner label="Loading gaps…" />;

  return (
    <div>
      <Header
        title="Gaps"
        subtitle="Questions the brain could not answer. Every row is a document somebody needs to write."
      />

      {/* The coverage map read. Just a GROUP BY, but it is the line that turns a
          list of failures into a map of where the corpus is thin. */}
      <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <div className="text-xs uppercase tracking-wide text-slate-400">
          Coverage map, by payer
        </div>
        <div className="mt-1.5 text-sm text-slate-800">
          {payerCounts.length === 0 ? (
            <span className="text-slate-400">Nothing logged yet</span>
          ) : (
            payerCounts.map((p) => `${p.payer} ${p.count}`).join(' · ')
          )}
        </div>
      </div>

      {gaps.length === 0 ? (
        <EmptyState>
          No gaps logged. Ask something the corpus does not cover, such as the refund
          policy for churned customers.
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Question</th>
                <th className="px-4 py-3 font-medium">Payer</th>
                <th className="px-4 py-3 font-medium">Asked by</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gaps.map((g) => (
                <tr key={g.id}>
                  <td className="px-4 py-3 text-slate-800">{g.question}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {g.payer ? (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {g.payer}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Unknown</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{g.askedBy}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                    {formatDate(g.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-600 transition hover:border-slate-400">
                      Assign owner
                    </button>
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
