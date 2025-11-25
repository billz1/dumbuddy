export type CardLevel = 1 | 2 | 3 | "wildcard" | "go-deeper";

export type CardType = "question" | "wildcard" | "go-deeper";

export interface Card {
  id: string;
  level: CardLevel;
  type: CardType;
  text: string;
  note?: string;
}

export interface GameConfig {
  mode: "1" | "2" | "3" | "mixed";
  includeWildcards: boolean;
  includeGoDeeper: boolean;
}

export interface HistoryItem {
  card: Card;
  playerName: string;
  timestamp: number;
}
