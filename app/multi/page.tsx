"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GameConfig } from "@/lib/gameTypes";

export default function MultiHomePage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [config, setConfig] = useState<GameConfig>({
    mode: "mixed",
    includeWildcards: true,
    includeGoDeeper: true,
  });
  const [hostName, setHostName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [theme, setTheme] = useState<string>("");

  const createRoom = async () => {
    if (!questionCount || questionCount <= 0) {
      alert("Choose at least 1 question for this room.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          hostName,
          questionCount,
          theme,
        }),
      });
      if (!res.ok) {
        alert("Failed to create room.");
        return;
      }
      const json = (await res.json()) as {
        roomId: string;
        hostKey: string;
        hostPlayer?: { id: string; name: string } | null;
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          `tmt_hostKey_${json.roomId}`,
          json.hostKey
        );
        if (json.hostPlayer) {
          window.localStorage.setItem(
            `tmt_player_${json.roomId}`,
            JSON.stringify(json.hostPlayer)
          );
        }
      }
      router.push(`/multi/${json.roomId}?host=1`);
    } finally {
      setCreating(false);
    }
  };

  const setMode = (mode: GameConfig["mode"]) => {
    setConfig((prev) => ({ ...prev, mode }));
  };

  const handleQuestionCountChange = (value: string) => {
    const n = parseInt(value, 10);
    if (isNaN(n)) {
      setQuestionCount(0);
      return;
    }
    const clamped = Math.min(Math.max(n, 1), 80);
    setQuestionCount(clamped);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/40 p-6 sm:p-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            dümBuddy — Shared Deck
          </h1>
          <p className="text-sm text-slate-300">
            Host a shared deck so everyone at the table can join the
            same game. One host controls the cards, everyone plays.
          </p>
        </header>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Host name
            </h2>
            <input
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="text-xs text-slate-500">
              This name will appear as your username in the room.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Deck mode
            </h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { key: "1", label: "Level 1 — Warm & Flirty" },
                { key: "2", label: "Level 2 — Deeper" },
                { key: "3", label: "Level 3 — Most Vulnerable" },
                { key: "mixed", label: "Mixed deck" },
              ].map((item) => {
                const active = config.mode === (item.key as GameConfig["mode"]);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMode(item.key as GameConfig["mode"])}
                    className={[
                      "px-3 py-1.5 rounded-full border text-left transition",
                      active
                        ? "border-brand-400 bg-brand-500/10 text-brand-100"
                        : "border-slate-600 hover:border-brand-400 hover:text-brand-200",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500">
              How deep to go emotionally: from playful to very
              vulnerable.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Number of questions
              </h2>
              <input
                type="number"
                min={1}
                max={80}
                value={questionCount}
                onChange={(e) => handleQuestionCountChange(e.target.value)}
                className="w-28 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <p className="text-[11px] text-slate-500">
                Choose how many cards will be in this shared deck. 15–30 is a good start.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Theme (optional)
              </h2>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. playful, healing, long-term love"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <p className="text-[11px] text-slate-500">
                Steer questions toward this mood.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Extras
            </h2>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={config.includeWildcards}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    includeWildcards: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500"
              />
              <span>Include Wildcards (Smash the ice!)</span>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={config.includeGoDeeper}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    includeGoDeeper: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500"
              />
              <span>Include “Go Deeper” prompts(A push to open up, go beneath the surface, and say the real thing.)</span>
            </label>
          </div>

          <button
            type="button"
            onClick={createRoom}
            disabled={creating}
            className="w-full inline-flex items-center justify-center rounded-2xl bg-brand-500 hover:bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? "Creating room..." : "Create shared room"}
          </button>
        </section>

        <section className="space-y-3 border-t border-slate-800 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Join existing room
          </h2>
          <p className="text-xs text-slate-400">
            If someone has already created a room, enter the room code.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md">
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
              placeholder="Room code (e.g. F7K3QZ)"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => {
                if (!joinRoomId.trim()) return;
                router.push(`/multi/${joinRoomId.trim()}`);
              }}
              className="px-4 py-2.5 rounded-2xl border border-slate-600 hover:border-slate-300 text-sm font-semibold text-slate-100"
            >
              Join
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
