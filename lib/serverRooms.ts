import type { GameConfig, Card, HistoryItem } from "./gameTypes";
import { buildDeck } from "./deck";

export interface RoomPlayer {
  id: string;
  name: string;
  joinedAt: number;
}

export interface RoomState {
  roomId: string;
  config: GameConfig;
  deck: Card[];
  currentCardIndex: number;
  createdAt: number;
  updatedAt: number;
  hostKey: string;
  players: RoomPlayer[];
  currentPlayerIndex: number;
  history: HistoryItem[];
}

const rooms = new Map<string, RoomState>();

function randomId(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function randomHostKey(): string {
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

function randomPlayerId(): string {
  return Math.random().toString(16).slice(2, 10);
}

export function createRoom(config: GameConfig, hostName?: string): RoomState {
  const roomId = randomId();
  const hostKey = randomHostKey();
  const deck = buildDeck(config);
  const now = Date.now();
  const players: RoomPlayer[] = [];

  if (hostName && hostName.trim()) {
    players.push({
      id: randomPlayerId(),
      name: hostName.trim(),
      joinedAt: now,
    });
  }

  const state: RoomState = {
    roomId,
    config,
    deck,
    currentCardIndex: -1,
    createdAt: now,
    updatedAt: now,
    hostKey,
    players,
    currentPlayerIndex: 0,
    history: [],
  };
  rooms.set(roomId, state);
  return state;
}

export function getRoom(roomId: string): RoomState | undefined {
  return rooms.get(roomId);
}

export type RoomAction = "draw" | "reset";

export function applyRoomAction(
  roomId: string,
  hostKey: string,
  action: RoomAction
): RoomState | undefined {
  const room = rooms.get(roomId);
  if (!room) return undefined;
  if (room.hostKey !== hostKey) {
    throw new Error("invalid_host_key");
  }

  const now = Date.now();

  if (action === "draw") {
    if (room.currentCardIndex < room.deck.length - 1) {
      room.currentCardIndex += 1;
      room.updatedAt = now;

      const card =
        room.currentCardIndex >= 0 && room.currentCardIndex < room.deck.length
          ? room.deck[room.currentCardIndex]
          : null;

      if (card) {
        const currentPlayer =
          room.players.length > 0
            ? room.players[room.currentPlayerIndex]?.name ?? "Player"
            : "Player";

        const historyItem: HistoryItem = {
          card,
          playerName: currentPlayer,
          timestamp: now,
        };
        room.history = [historyItem, ...room.history].slice(0, 50);
      }
    }
  } else if (action === "reset") {
    room.currentCardIndex = -1;
    room.history = [];
    room.updatedAt = now;
  }

  return room;
}

export function joinRoom(
  roomId: string,
  name: string
): { room: RoomState; player: RoomPlayer } | undefined {
  const room = rooms.get(roomId);
  if (!room) return undefined;

  const player: RoomPlayer = {
    id: randomPlayerId(),
    name: name.trim() || "Player",
    joinedAt: Date.now(),
  };

  room.players.push(player);
  room.updatedAt = Date.now();
  return { room, player };
}

export function advanceTurn(
  roomId: string,
  hostKey: string
): RoomState | undefined {
  const room = rooms.get(roomId);
  if (!room) return undefined;
  if (room.hostKey !== hostKey) {
    throw new Error("invalid_host_key");
  }
  if (room.players.length === 0) return room;

  room.currentPlayerIndex =
    (room.currentPlayerIndex + 1) % room.players.length;
  room.updatedAt = Date.now();
  return room;
}

export interface PublicRoomState {
  roomId: string;
  config: GameConfig;
  currentCard: Card | null;
  remainingCards: number;
  totalCards: number;
  createdAt: number;
  updatedAt: number;
  players: RoomPlayer[];
  currentPlayerIndex: number;
  history: HistoryItem[];
}

export function toPublicRoomState(room: RoomState): PublicRoomState {
  const currentCard =
    room.currentCardIndex >= 0 && room.currentCardIndex < room.deck.length
      ? room.deck[room.currentCardIndex]
      : null;

  const remainingCards =
    room.currentCardIndex >= 0
      ? Math.max(room.deck.length - (room.currentCardIndex + 1), 0)
      : room.deck.length;

  return {
    roomId: room.roomId,
    config: room.config,
    currentCard,
    remainingCards,
    totalCards: room.deck.length,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    players: room.players,
    currentPlayerIndex: room.currentPlayerIndex,
    history: room.history,
  };
}
