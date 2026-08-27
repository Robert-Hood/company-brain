'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import icon from './icon.png';
import { AskTab } from './components/AskTab';
import { DocPanel } from './components/DocPanel';
import { GapsTab } from './components/GapsTab';
import { KnowledgeTab } from './components/KnowledgeTab';
import { BuildTab, OpportunitiesTab, SourcesTab } from './components/StaticTabs';
import type { User } from './components/types';
import { Toast } from './components/ui';

const TABS = [
  { id: 'ask', label: 'Ask', live: true },
  { id: 'knowledge', label: 'Knowledge', live: true },
  { id: 'gaps', label: 'Gaps', live: true },
  { id: 'sources', label: 'Sources', live: false },
  { id: 'build', label: 'Build', live: false },
  { id: 'opportunities', label: 'Opportunities', live: false },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Page() {
  const [tab, setTab] = useState<TabId>('ask');
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Read the picker from the API rather than hardcoding, so the dropdown
  // cannot drift from the seeded users the documents refer to by name.
  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((d: { users: User[] }) => {
        setUsers(d.users);
        // Sam Ortiz, the new verifier, is who the demo opens as.
        setUserId(d.users.find((u) => u.name.startsWith('Sam'))?.id ?? d.users[0]?.id ?? null);
      });
  }, []);

  const user = users.find((u) => u.id === userId) ?? null;
  const closeDoc = useCallback(() => setOpenDocId(null), []);
  const closeToast = useCallback(() => setToast(null), []);

  return (
    <div className="min-h-screen bg-slate-50">
      <p className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs text-amber-900">
        All data is synthetic and modelled on Needletail&apos;s public positioning.
      </p>

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-6">
        <nav className="w-48 shrink-0">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Image src={icon} alt="" width={28} height={28} priority />
              <div>
                <div className="text-sm font-semibold text-slate-900">Company Brain</div>
                <div className="text-xs text-slate-500">Needletail</div>
              </div>
            </div>
          </div>

          <ul className="space-y-0.5">
            {TABS.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setTab(t.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    tab === t.id
                      ? 'bg-slate-900 font-medium text-white'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {t.label}
                  {!t.live && (
                    <span
                      className={`text-[10px] uppercase tracking-wide ${
                        tab === t.id ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      static
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-end gap-3">
            <label htmlFor="user" className="text-xs text-slate-500">
              Acting as
            </label>
            <select
              id="user"
              value={userId ?? ''}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role}
                </option>
              ))}
            </select>
            {user && (
              <span className="text-xs text-slate-500">
                {user.expertise.length > 0
                  ? `expertise: ${user.expertise.join(', ')}`
                  : 'no expertise'}
              </span>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {tab === 'ask' && (
              <AskTab user={user} onOpenDoc={setOpenDocId} onToast={setToast} />
            )}
            {tab === 'knowledge' && <KnowledgeTab onOpenDoc={setOpenDocId} />}
            {tab === 'gaps' && <GapsTab />}
            {tab === 'sources' && <SourcesTab />}
            {tab === 'build' && <BuildTab />}
            {tab === 'opportunities' && <OpportunitiesTab />}
          </div>
        </main>
      </div>

      <DocPanel docId={openDocId} onClose={closeDoc} />
      {toast && <Toast message={toast} onClose={closeToast} />}
    </div>
  );
}
