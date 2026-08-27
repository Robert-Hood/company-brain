'use client';

import { useEffect, useState } from 'react';
import type { Doc } from './types';
import { DeptPill, SensitivityBadge, Spinner } from './ui';

/**
 * Right-hand slide-over for citation chips.
 *
 * The `updated` date is the point of this panel as much as the body is. The
 * Delta playbook is dated February and the thread that corrects it is June.
 * With both dates on screen the demo stops being "the AI was wrong" and becomes
 * "the document was stale and the app can see that".
 */
export function DocPanel({ docId, onClose }: { docId: string | null; onClose: () => void }) {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docId) return;
    setDoc(null);
    setError(null);
    let cancelled = false;

    fetch(`/api/docs/${docId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`No document ${docId}`))))
      .then((data) => !cancelled && setDoc(data.doc))
      .catch((e: Error) => !cancelled && setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [docId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!docId) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/20"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <p className="font-mono text-xs text-slate-500">{docId}</p>
            <h2 className="mt-1 text-base font-semibold text-slate-900">
              {doc?.title ?? (error ? 'Not found' : 'Loading…')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        {doc && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs">
            <Field label="Department">
              <DeptPill value={doc.department} />
            </Field>
            <Field label="Sensitivity">
              <SensitivityBadge value={doc.sensitivity} />
            </Field>
            <Field label="Source">
              <span className="font-mono text-slate-700">{doc.source}</span>
            </Field>
            <Field label="Owner">
              <span className="text-slate-700">{doc.owner}</span>
            </Field>
            <Field label="Last updated">
              <span className="font-medium text-slate-900">{doc.updated}</span>
            </Field>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {!doc && !error && <Spinner label="Loading document…" />}
          {doc && (
            <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-slate-700">
              {doc.body}
            </pre>
          )}
        </div>
      </aside>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mb-1 uppercase tracking-wide text-slate-400">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
