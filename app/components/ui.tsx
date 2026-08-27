'use client';

import { useEffect } from 'react';
import type { Confidence, Department, Sensitivity } from './types';

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  high: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  medium: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  low: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

export function ConfidenceBadge({ value }: { value: Confidence }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${CONFIDENCE_STYLES[value]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value} confidence
    </span>
  );
}

const SENSITIVITY_STYLES: Record<Sensitivity, string> = {
  public: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  internal: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  'phi-restricted': 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

/**
 * The spec never uses the sensitivity field. Showing it costs a line and
 * answers the first question anyone asks about a company knowledge system.
 */
export function SensitivityBadge({ value }: { value: Sensitivity }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ${SENSITIVITY_STYLES[value]}`}
    >
      {value === 'phi-restricted' && <span aria-hidden>🔒</span>}
      {value}
    </span>
  );
}

const DEPARTMENT_STYLES: Record<Department, string> = {
  ops: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  gtm: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  product: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  engineering: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  ga: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export function DeptPill({ value }: { value: Department }) {
  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ring-1 ring-inset ${DEPARTMENT_STYLES[value]}`}
    >
      {value}
    </span>
  );
}

export function WeightBadge({ weight }: { weight: number }) {
  const heavy = weight >= 3;
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
        heavy
          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
          : 'bg-slate-100 text-slate-600 ring-slate-500/20'
      }`}
    >
      weight {weight}
    </span>
  );
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 7000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md rounded-lg bg-slate-900 px-4 py-3 text-sm text-white shadow-lg">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-emerald-400" aria-hidden>
          ✓
        </span>
        <p className="flex-1 leading-snug">{message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 transition hover:text-white"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-500">
      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      {label}
    </span>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
