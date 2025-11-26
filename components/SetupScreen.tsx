"use client";

import type { GameConfig } from "@/lib/gameTypes";
import { useEffect } from "react";

interface SetupScreenProps {
  players: string[];
  onPlayersChange: (players: string[]) => void;
  config: GameConfig;
  onConfigChange: (config: GameConfig) => void;
  onStartGame: () => void;
  questionCount: number;
  onQuestionCountChange: (val: number) => void;
  theme: string;
  onThemeChange: (val: string) => void;
}

export default function SetupScreen({
  players,
  onPlayersChange,
  config,
  onConfigChange,
  onStartGame,
  questionCount,
  onQuestionCountChange,
  theme,
  onThemeChange,
}: SetupScreenProps) {
  useEffect(() => {
    if (players.length === 0) {
      onPlayersChange(["Player 1", "Player 2"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePlayerName = (index: number, name: string) => {
    const copy = [...players];
    copy[index] = name;
    onPlayersChange(copy);
  };

  const addPlayer = () => {
    onPlayersChange([...players, `Player ${players.length + 1}`]);
  };

  const removePlayer = (index: number) => {
    const copy = players.filter((_, i) => i !== index);
    onPlayersChange(copy);
  };

  const setMode = (mode: GameConfig["mode"]) => {
    onConfigChange({ ...config, mode });
  };

  const toggleWildcards = () => {
    onConfigChange({
      ...config,
      includeWildcards: !config.includeWildcards,
    });
  };

  const toggleGoDeeper = () => {
    onConfigChange({
      ...config,
      includeGoDeeper: !config.includeGoDeeper,
    });
  };

  const handleStart = () => {
    const cleaned = players.map((p) => p.trim()).filter(Boolean);
    if (!cleaned.length) {
      alert("Add at least one player name.");
      return;
    }
    if (!Number.isFinite(questionCount) || questionCount <= 0) {
      alert("Choose at least 1 question for this round.");
      return;
    }
    onPlayersChange(cleaned);
    onStartGame();
  };

  const handleQuestionCountChange = (value: string) => {
    const n = parseInt(value, 10);
    if (isNaN(n)) {
      onQuestionCountChange(0);
      return;
    }
    const clamped = Math.min(Math.max(n, 1), 80);
    onQuestionCountChange(clamped);
  };

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Game setup</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Players
          </h3>
          <button
            type="button"
            onClick={addPlayer}
            className="text-xs px-3 py-1 rounded-full border border-slate-600 hover:border-brand-400 hover:text-brand-200 transition"
          >
            + Add player
          </button>
        </div>
        <div className="space-y-2">
          {players.map((player, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-sm bg-slate-900/60 border border-slate-700 rounded-xl px-3 py-2"
            >
              <input
                type="text"
                value={player}
                onChange={(e) => updatePlayerName(idx, e.target.value)}
                className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-100 placeholder:text-slate-500 text-sm"
                placeholder={`Player ${idx + 1}`}
              />
              {players.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePlayer(idx)}
                  className="text-xs text-slate-500 hover:text-brand-300 px-2 py-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          Tip: 2–6 players works best. You can also play as a couple and answer
          together.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Level intensity
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { key: "1", label: "Level 1 — Warm & Flirty" },
              { key: "2", label: "Level 2 — Deeper" },
              { key: "3", label: "Level 3 — Most Vulnerable" },
              { key: "mixed", label: "Mixed" },
            ].map((item) => {
              const active = config.mode === item.key;
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
            This tells the AI how deep to go emotionally: from playful to very
            vulnerable.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Extras (for future use)
          </h3>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={config.includeWildcards}
              onChange={toggleWildcards}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500"
            />
            <span>Wildcards (AI-only deck ignores these for now)</span>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={config.includeGoDeeper}
              onChange={toggleGoDeeper}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-500 focus:ring-brand-500"
            />
            <span>“Go Deeper” prompts (AI can approximate this via level)</span>
          </label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Number of questions
          </h3>
          <input
            type="number"
            min={1}
            max={80}
            value={questionCount}
            onChange={(e) => handleQuestionCountChange(e.target.value)}
            className="w-28 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="text-[11px] text-slate-500">
            Choose how big this deck is. 15–30 works well for most sessions.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Theme (optional)
          </h3>
          <input
            type="text"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            placeholder="e.g. playful, healing, aftercare, long-term love"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="text-[11px] text-slate-500">
            The AI will steer questions toward this mood, while staying
            consent-first and non-explicit.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleStart}
        className="mt-2 inline-flex items-center justify-center rounded-2xl bg-brand-500 hover:bg-brand-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition"
      >
        Start game with AI deck
      </button>
    </section>
  );
}
