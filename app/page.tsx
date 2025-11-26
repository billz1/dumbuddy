"use client";

import AgeGate from "@/components/AgeGate";
import SetupScreen from "@/components/SetupScreen";
import GameScreen from "@/components/GameScreen";
import type { GameConfig, HistoryItem, Card } from "@/lib/gameTypes";
import { useEffect, useState } from "react";
import { addEvent } from "@/lib/analytics";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HomePage() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const [players, setPlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const [config, setConfig] = useState<GameConfig>({
    mode: "mixed",
    includeWildcards: true,
    includeGoDeeper: true,
  });

  const [questionCount, setQuestionCount] = useState<number>(20);
  const [theme, setTheme] = useState<string>("");

  const [deck, setDeck] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Restore last players/config/basic preferences
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("tmt_session_v1");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as {
        players: string[];
        config: GameConfig;
        questionCount?: number;
        theme?: string;
      };
      if (parsed.players?.length) {
        setPlayers(parsed.players);
      }
      if (parsed.config) {
        setConfig(parsed.config);
      }
      if (typeof parsed.questionCount === "number") {
        setQuestionCount(parsed.questionCount);
      }
      if (typeof parsed.theme === "string") {
        setTheme(parsed.theme);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "tmt_session_v1",
      JSON.stringify({ players, config, questionCount, theme })
    );
  }, [players, config, questionCount, theme]);

  const startGame = async () => {
    if (!players.length) return;

    const levelParam =
      config.mode === "mixed"
        ? "mixed"
        : (Number(config.mode) as 1 | 2 | 3);

    let aiDeck: Card[] = [];
    try {
      const res = await fetch("/api/ai-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: questionCount,
          level: levelParam,
          theme: theme || undefined,
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as { cards: Card[] };
        if (Array.isArray(json.cards)) {
          aiDeck = json.cards;
        }
      }
    } catch (e) {
      console.error("Failed to get AI deck", e);
    }

    if (!aiDeck.length) {
      alert(
        "Could not generate questions from AI right now. Please try again in a moment."
      );
      return;
    }

    aiDeck = shuffle(aiDeck);

    setDeck(aiDeck);
    setCurrentCard(null);
    setHistory([]);
    setCurrentPlayerIndex(0);

    addEvent("session_start", {
      players: players.length,
      mode: config.mode,
      includeWildcards: config.includeWildcards,
      includeGoDeeper: config.includeGoDeeper,
      useAIOnly: true,
      questionCount,
      theme,
    });
  };

  const drawCard = () => {
    if (!deck.length) return;
    const [next, ...rest] = deck;
    setDeck(rest);
    setCurrentCard(next);
    const playerName =
      players[currentPlayerIndex] ?? `Player ${currentPlayerIndex + 1}`;
    const item: HistoryItem = {
      card: next,
      playerName,
      timestamp: Date.now(),
    };
    setHistory((prev) => [item, ...prev].slice(0, 30));
    addEvent("card_drawn", {
      cardId: next.id,
      level: next.level,
      type: next.type,
      playerName,
    });
  };

  const nextPlayer = () => {
    if (!players.length) return;
    setCurrentPlayerIndex((prev) => {
      const nextIndex = (prev + 1) % players.length;
      addEvent("next_player", {
        from: prev,
        to: nextIndex,
      });
      return nextIndex;
    });
  };

  const passCard = () => {
    addEvent("card_passed", {
      cardId: currentCard ? currentCard.id : null,
      level: currentCard ? currentCard.level : null,
      type: currentCard ? currentCard.type : null,
    });
    // Treat pass / skip as "next player's turn"
    nextPlayer();
  };

  const resetToSetup = () => {
    setCurrentCard(null);
    setDeck([]);
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 md:py-10">
      <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col md:flex-row">
        <main className="w-full md:w-2/3 p-5 sm:p-8 lg:p-10 space-y-6">
          <header className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                dümBuddy
                <span className="text-brand-400"> — Friendsgiving Edition</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 mt-1">
                Smash the ice!
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 border border-brand-500/60 px-3 py-1 text-xs font-medium text-brand-100">
              18+ Only
            </span>
          </header>

          {!ageConfirmed && (
            <AgeGate onConfirm={() => setAgeConfirmed(true)} />
          )}

          {ageConfirmed && !deck.length && !currentCard && (
            <SetupScreen
              players={players}
              onPlayersChange={(val) => {
                setPlayers(val);
                addEvent("config_change", {
                  kind: "players_change",
                  count: val.length,
                });
              }}
              config={config}
              onConfigChange={(cfg) => {
                setConfig(cfg);
                addEvent("config_change", { kind: "config_change", config: cfg });
              }}
              onStartGame={startGame}
              questionCount={questionCount}
              onQuestionCountChange={setQuestionCount}
              theme={theme}
              onThemeChange={setTheme}
            />
          )}

          {ageConfirmed && (deck.length > 0 || currentCard) && (
            <GameScreen
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              config={config}
              currentCard={currentCard}
              history={history}
              remainingCards={deck.length}
              onDrawCard={drawCard}
              onPassCard={passCard}
              onNextPlayer={nextPlayer}
              onBackToSetup={resetToSetup}
            />
          )}

          <footer className="pt-4 border-t border-slate-800 mt-4">
            <p className="text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span>
                
              </span>
              <span className="flex items-center gap-3">
                <a
                  href="/multi"
                  className="underline-offset-2 hover:underline text-slate-500 hover:text-slate-300"
                >
                  Shared deck mode
                </a>
                <a
                  href="/admin"
                  className="underline-offset-2 hover:underline text-slate-500 hover:text-slate-300"
                >
                  Admin
                </a>
              </span>
            </p>
          </footer>
        </main>

        <aside className="w-full md:w-1/3 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/60 p-5 sm:p-7 lg:p-8 flex flex-col gap-6 text-sm">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              How to play
            </h2>
            <ol className="mt-2 space-y-1 list-decimal list-inside text-slate-300">
              <li>Confirm age &amp; consent.</li>
              <li>Add player names.</li>
              <li>Choose level, number of questions, and theme.</li>
              <li>Start game to generate a fresh AI deck.</li>
              <li>Draw a card, answer honestly — or pass.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Safety &amp; Boundaries
            </h2>
            <ul className="mt-2 space-y-1 list-disc list-inside text-slate-300">
              <li>You can say “pass” to any card.</li>
              <li>Use a word like “pause” if you need a break.</li>
              <li>No one owes an explanation for their boundaries.</li>
              <li>Offer aftercare: water, a check-in, or quiet time.</li>
            </ul>
          </div>

          <div className="mt-auto space-y-1 text-xs text-slate-500">
            <p>For the culture of hapiness must reign... Hola 42</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
