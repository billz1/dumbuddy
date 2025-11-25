"use client";

import { useEffect, useMemo, useState } from "react";
import { getEvents, summarizeEvents, type AnalyticsEvent } from "@/lib/analytics";

const ADMIN_CODE = "tellmetrueadmin";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    if (!authorized) return;
    const evts = getEvents();
    setEvents(evts);
  }, [authorized]);

  const summary = useMemo(() => summarizeEvents(events), [events]);

  const handleUnlock = () => {
    if (codeInput.trim() === ADMIN_CODE) {
      setAuthorized(true);
    } else {
      alert("Incorrect admin code.");
    }
  };

  const reload = () => {
    const evts = getEvents();
    setEvents(evts);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/40 p-6 sm:p-8 space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Tell Me True — Admin
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Local analytics dashboard. Data is stored in this browser only.
            </p>
          </div>
          <a
            href="/"
            className="text-xs px-3 py-1.5 rounded-full border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-slate-100 transition"
          >
            ⟵ Back to game
          </a>
        </header>

        {!authorized && (
          <section className="space-y-4">
            <p className="text-sm text-slate-300">
              Enter the admin code to view usage analytics for this browser
              session. For real production deployments, replace this with proper
              authentication.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-center max-w-md">
              <input
                type="password"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Admin code"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={handleUnlock}
                className="px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-sm font-semibold shadow-lg shadow-brand-500/30"
              >
                Unlock
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Default demo code:{" "}
              <code className="px-1 py-0.5 bg-slate-800 rounded">
                tellmetrueadmin
              </code>
            </p>
          </section>
        )}

        {authorized && (
          <>
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Overview
                </h2>
                <button
                  type="button"
                  onClick={reload}
                  className="text-xs px-3 py-1.5 rounded-full border border-slate-600 hover:border-slate-300 text-slate-200 transition"
                >
                  Refresh
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard label="Total events" value={summary.totalEvents} />
                <StatCard label="Sessions started" value={summary.sessions} />
                <StatCard label="Cards drawn" value={summary.cardsDrawn} />
                <StatCard label="Cards passed" value={summary.cardsPassed} />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                <StatCard
                  label="Next player actions"
                  value={summary.nextPlayerActions}
                />
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                  <p className="font-semibold text-slate-100">
                    Drawn by level
                  </p>
                  {Object.keys(summary.perLevelDrawn).length === 0 && (
                    <p className="text-slate-500">No card draws yet.</p>
                  )}
                  {Object.entries(summary.perLevelDrawn).map(([level, count]) => (
                    <p key={level} className="flex items-center justify-between">
                      <span className="text-slate-300">Level {level}</span>
                      <span className="font-semibold text-slate-100">
                        {count}
                      </span>
                    </p>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Recent events
                </h2>
                <p className="text-[11px] text-slate-500">
                  Showing up to {events.length} events stored in localStorage.
                </p>
              </div>

              <div className="max-h-80 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950/60">
                {events.length === 0 && (
                  <p className="text-xs text-slate-500 px-4 py-3">
                    No events recorded yet. Play a session to see data here.
                  </p>
                )}
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="px-4 py-3 border-b border-slate-800 last:border-b-0 text-xs"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-100">
                        {event.type}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {event.data && (
                      <pre className="mt-1 text-[10px] text-slate-300 whitespace-pre-wrap break-all">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-slate-50">{value}</p>
    </div>
  );
}
