"use client";

import type { Card, GameConfig, HistoryItem } from "@/lib/gameTypes";

interface GameScreenProps {
  players: string[];
  currentPlayerIndex: number;
  config: GameConfig;
  currentCard: Card | null;
  history: HistoryItem[];
  remainingCards: number;
  onDrawCard: () => void;
  onPassCard: () => void;
  onNextPlayer: () => void;
  onBackToSetup: () => void;
}

export default function GameScreen({
  players,
  currentPlayerIndex,
  config,
  currentCard,
  history,
  remainingCards,
  onDrawCard,
  onPassCard,
  onNextPlayer,
  onBackToSetup,
}: GameScreenProps) {
  const currentPlayer = players[currentPlayerIndex] ?? "Player";

  const modeText =
    config.mode === "mixed"
      ? "Mixed deck"
      : config.mode === "1"
      ? "Level 1 only"
      : config.mode === "2"
      ? "Level 2 only"
      : "Level 3 only";

  const wildText = config.includeWildcards ? "Wildcards on" : "Wildcards off";
  const deepText = config.includeGoDeeper ? '"Go Deeper" on' : '"Go Deeper" off';

  const cardMeta = (() => {
    if (!currentCard) return "";
    if (currentCard.type === "wildcard") return "Wildcard";
    if (currentCard.type === "go-deeper") return "Go Deeper";
    return `Level ${currentCard.level}`;
  })();

  const cardTypeLabel = currentCard
    ? `${cardMeta} • ${capitalize(currentCard.type)}`
    : "";

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Now answering
          </p>
          <p className="text-lg font-semibold text-slate-50">{currentPlayer}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-400" />
            {modeText} • {wildText} • {deepText}
            {remainingCards >= 0 && (
              <span className="ml-1 text-slate-500">
                • {remainingCards} card{remainingCards === 1 ? "" : "s"} left
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToSetup}
          className="text-xs px-3 py-1.5 rounded-full border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-slate-100 transition"
        >
          ⟵ Change setup
        </button>
      </div>

      <div className="relative bg-slate-950/60 border border-slate-800 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-slate-900/60 pointer-events-none" />
        <div className="relative space-y-4">
          {currentCard ? (
            <>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {cardTypeLabel}
              </p>
              <p className="text-base sm:text-lg text-slate-50 leading-relaxed">
                {currentCard.text}
              </p>
              {currentCard.note && (
                <p className="text-xs text-slate-400 italic">
                  {currentCard.note}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Ready when you are
              </p>
              <p className="text-base sm:text-lg text-slate-50 leading-relaxed">
                Tap “Draw card” to begin. You can always say “pass” or ask for a
                pause.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onDrawCard}
          className="inline-flex items-center justify-center rounded-2xl bg-brand-500 hover:bg-brand-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition disabled:opacity-50"
          disabled={remainingCards === 0}
        >
          {remainingCards === 0 ? "No more cards" : "Draw card"}
        </button>
        <button
          type="button"
          onClick={onPassCard}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-600 hover:border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-100 transition"
        >
          Pass / Skip
        </button>
        <button
          type="button"
          onClick={onNextPlayer}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-600 hover:border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-100 transition"
        >
          Next player
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 border-t border-slate-800 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Recent cards
          </p>
        </div>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1 text-xs text-slate-300">
          {history.length === 0 && (
            <p className="text-slate-500 text-[11px]">
              Cards you draw will appear here so you can revisit them later.
            </p>
          )}
          {history.map((item) => (
            <div
              key={`${item.card.id}-${item.timestamp}`}
              className="border border-slate-800 rounded-xl px-3 py-2 bg-slate-950/70"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-100 text-[11px]">
                  {item.playerName}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                  {labelForHistory(item.card)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-200">
                {item.card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function labelForHistory(card: Card): string {
  if (card.type === "wildcard") return "wildcard";
  if (card.type === "go-deeper") return "go deeper";
  return `L${card.level}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
