import type { Card, GameConfig } from "./gameTypes";
import { allCards } from "./prompts";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildDeck(config: GameConfig): Card[] {
  const base = allCards();
  let cards: Card[] = [];

  if (config.mode === "mixed") {
    cards = base.filter((c) => c.type === "question");
  } else {
    const level = Number(config.mode) as 1 | 2 | 3;
    cards = base.filter((c) => c.level === level);
  }

  if (config.includeWildcards) {
    cards = cards.concat(base.filter((c) => c.type === "wildcard"));
  }

  if (config.includeGoDeeper) {
    cards = cards.concat(base.filter((c) => c.type === "go-deeper"));
  }

  return shuffle(cards);
}
