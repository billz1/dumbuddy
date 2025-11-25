"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { PublicRoomState } from "@/lib/serverRooms";

interface Props {
  params: { roomId: string };
}

export default function MultiRoomPage({ params }: Props) {
  const { roomId } = params;
  const search = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<PublicRoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(`tmt_player_${roomId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { id: string; name: string };
        setPlayerId(parsed.id);
        setPlayerName(parsed.name);
      } catch {
        // ignore
      }
    }
  }, [roomId]);

  useEffect(() => {
    const fromQuery = search.get("host");
    const storedKey =
      typeof window !== "undefined"
        ? window.localStorage.getItem(`tmt_hostKey_${roomId}`)
        : null;
    setIsHost(!!storedKey && fromQuery === "1");
  }, [roomId, search]);

  useEffect(() => {
    let cancelled = false;
    let interval: NodeJS.Timeout;

    const fetchState = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}`);
        if (!res.ok) {
          if (!cancelled) {
            setError("Room not found or expired.");
            setLoading(false);
          }
          return;
        }
        const json = (await res.json()) as PublicRoomState;
        if (!cancelled) {
          setState(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to connect to room.");
          setLoading(false);
        }
      }
    };

    fetchState();
    interval = setInterval(fetchState, 2500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [roomId]);

  const draw = async () => {
    if (!isHost) return;
    const hostKey =
      typeof window !== "undefined"
        ? window.localStorage.getItem(`tmt_hostKey_${roomId}`)
        : null;
    if (!hostKey) {
      alert("Missing host key on this device.");
      return;
    }
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "draw", hostKey }),
    });
    if (!res.ok) {
      if (res.status === 403) {
        alert("You are not authorized as host for this room.");
        setIsHost(false);
        return;
      }
      alert("Failed to draw card.");
      return;
    }
    const json = (await res.json()) as PublicRoomState;
    setState(json);
  };

  const resetDeck = async () => {
    if (!isHost) return;
    const hostKey =
      typeof window !== "undefined"
        ? window.localStorage.getItem(`tmt_hostKey_${roomId}`)
        : null;
    if (!hostKey) {
      alert("Missing host key on this device.");
      return;
    }
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset", hostKey }),
    });
    if (!res.ok) {
      if (res.status === 403) {
        alert("You are not authorized as host for this room.");
        setIsHost(false);
        return;
      }
      alert("Failed to reset deck.");
      return;
    }
    const json = (await res.json()) as PublicRoomState;
    setState(json);
  };

  const nextTurn = async () => {
    if (!isHost) return;
    const hostKey =
      typeof window !== "undefined"
        ? window.localStorage.getItem(`tmt_hostKey_${roomId}`)
        : null;
    if (!hostKey) {
      alert("Missing host key on this device.");
      return;
    }
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "next", hostKey }),
    });
    if (!res.ok) {
      if (res.status === 403) {
        alert("You are not authorized as host for this room.");
        setIsHost(false);
        return;
      }
      alert("Failed to change turn.");
      return;
    }
    const json = (await res.json()) as PublicRoomState;
    setState(json);
  };

  const joinRoom = async () => {
    if (!playerName.trim()) {
      alert("Please enter a name.");
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName }),
      });
      if (!res.ok) {
        alert("Failed to join room.");
        return;
      }
      const json = (await res.json()) as {
        state: PublicRoomState;
        player: { id: string; name: string };
      };
      setState(json.state);
      setPlayerId(json.player.id);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          `tmt_player_${roomId}`,
          JSON.stringify(json.player)
        );
      }
    } finally {
      setJoining(false);
    }
  };

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href.split("?")[0]
      : `https://example.com/multi/${roomId}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-300">Connecting to room…</p>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 text-sm">
          <p className="text-red-300 font-semibold">Error</p>
          <p className="text-slate-300">{error ?? "Room unavailable."}</p>
          <button
            type="button"
            onClick={() => router.push("/multi")}
            className="mt-2 inline-flex items-center justify-center rounded-2xl bg-brand-500 hover:bg-brand-400 px-4 py-2 text-xs font-semibold text-white"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const card = state.currentCard;
  const currentPlayer =
    state.players.length > 0
      ? state.players[state.currentPlayerIndex] ?? null
      : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-950 text-slate-100">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/40 p-6 sm:p-8 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Shared Deck — Room {state.roomId}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Everyone at the table opens this room on their phone. One host
              draws cards, everyone answers out loud — just like a physical
              deck.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            {currentPlayer ? (
              <>
                <p className="text-[11px] text-slate-400">Now answering</p>
                <p className="text-sm font-semibold text-slate-50">
                  {currentPlayer.name}
                </p>
              </>
            ) : (
              <p className="text-[11px] text-slate-500">
                Waiting for players to join…
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              {state.config.mode === "mixed"
                ? "Mixed deck"
                : state.config.mode === "1"
                ? "Level 1 only"
                : state.config.mode === "2"
                ? "Level 2 only"
                : "Level 3 only"}
            </p>
            <p className="text-[11px] text-slate-500">
              {state.remainingCards} of {state.totalCards} cards remaining
            </p>
            {isHost ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/60 text-brand-100">
                You are the host
              </span>
            ) : (
              <span className="text-[10px] text-slate-500">
                View-only: host controls the deck
              </span>
            )}
          </div>
        </header>

        {!playerId && (
          <section className="space-y-3 border border-slate-800 bg-slate-950/80 rounded-2xl p-4 text-sm">
            <p className="text-slate-200 font-semibold">Join this room</p>
            <p className="text-xs text-slate-400">
              Enter the name you want others to see. Everyone at the table will
              see whose turn it is.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={joinRoom}
                disabled={joining}
                className="px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 disabled:opacity-50"
              >
                {joining ? "Joining…" : "Join room"}
              </button>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="relative bg-slate-950/60 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-slate-900/60 pointer-events-none" />
            <div className="relative space-y-3">
              {card ? (
                <>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    {card.type === "wildcard"
                      ? "Wildcard"
                      : card.type === "go-deeper"
                      ? "Go Deeper"
                      : `Level ${card.level}`}
                    {" · "}
                    {capitalize(card.type)}
                  </p>
                  <p className="text-base sm:text-lg text-slate-50 leading-relaxed">
                    {card.text}
                  </p>
                  {card.note && (
                    <p className="text-xs text-slate-400 italic">
                      {card.note}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Ready when you are
                  </p>
                  <p className="text-base sm:text-lg text-slate-50 leading-relaxed">
                    When the host draws a card, it will appear here for
                    everyone. Sit together, breathe, and decide who answers
                    first — like drawing from a physical deck.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={draw}
              disabled={!isHost || state.remainingCards === 0}
              className="inline-flex items-center justify-center rounded-2xl bg-brand-500 hover:bg-brand-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {state.remainingCards === 0
                ? "No more cards"
                : isHost
                ? "Draw next card"
                : "Waiting for host"}
            </button>
            <button
              type="button"
              onClick={resetDeck}
              disabled={!isHost}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-600 hover:border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reset deck
            </button>
            <button
              type="button"
              onClick={nextTurn}
              disabled={!isHost || state.players.length === 0}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-600 hover:border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next player
            </button>
          </div>

          <section className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-3">
            <p className="font-semibold text-slate-200">Recent cards</p>
            {state.history.length === 0 && (
              <p className="text-slate-500">
                Cards drawn in this room will appear here.
              </p>
            )}
            {state.history.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {state.history.map((item) => (
                  <div
                    key={`${item.card.id}-${item.timestamp}`}
                    className="border border-slate-800 rounded-xl px-3 py-2 bg-slate-950/70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-100 text-[11px]">
                        {item.playerName}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                        {item.card.type === "wildcard"
                          ? "wildcard"
                          : item.card.type === "go-deeper"
                          ? "go deeper"
                          : `L${item.card.level}`}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-200">
                      {item.card.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2 text-xs text-slate-400 border-t border-slate-800 pt-3">
            <p className="font-semibold text-slate-200">Players in this room</p>
            {state.players.length === 0 && (
              <p className="text-slate-500">No one joined yet.</p>
            )}
            {state.players.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {state.players.map((p, index) => {
                  const isCurrent = index === state.currentPlayerIndex;
                  return (
                    <li
                      key={p.id}
                      className={[
                        "px-2.5 py-1 rounded-full border text-[11px]",
                        isCurrent
                          ? "border-brand-400 bg-brand-500/10 text-brand-100"
                          : "border-slate-700 bg-slate-950/80 text-slate-200",
                      ].join(" ")}
                    >
                      {p.name}
                      {isCurrent ? " • current" : ""}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <div className="space-y-1 text-xs text-slate-400 border-t border-slate-800 pt-3">
            <p className="font-semibold text-slate-200">Share this room</p>
            <p className="break-all">
              Link:{" "}
              <span className="text-slate-100">
                {shareUrl}
              </span>
            </p>
            <p>
              Code:{" "}
              <span className="font-mono text-slate-100">{state.roomId}</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
