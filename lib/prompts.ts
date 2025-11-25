import type { Card } from "./gameTypes";

export const TMT_DECK: Card[] = [
  {
    id: "L1-01",
    level: 1,
    type: "question",
    text: "What's a small thing someone can do that instantly turns you on?",
  },
  {
    id: "L1-02",
    level: 1,
    type: "question",
    text: "Describe your first crush in one sentence.",
  },
  {
    id: "L1-03",
    level: 1,
    type: "question",
    text: "When do you feel most confident in your own skin?",
  },
  {
    id: "L1-04",
    level: 1,
    type: "question",
    text: "One thing you’d like to be told during intimacy.",
  },
  {
    id: "L1-05",
    level: 1,
    type: "question",
    text: "What kind of touch do you prefer first in a romantic setting?",
  },

  {
    id: "L2-01",
    level: 2,
    type: "question",
    text: "When was your first time feeling vulnerable with someone sexually? What helped?",
  },
  {
    id: "L2-02",
    level: 2,
    type: "question",
    text: "What emotional need do you seek through physical intimacy?",
  },
  {
    id: "L2-03",
    level: 2,
    type: "question",
    text: "How do you define consent beyond a simple yes or no?",
  },
  {
    id: "L2-04",
    level: 2,
    type: "question",
    text: "Share a moment when you felt your boundaries were respected perfectly.",
  },
  {
    id: "L2-05",
    level: 2,
    type: "question",
    text: "What are your non-sexual emotional needs in a relationship?",
  },

  {
    id: "L3-01",
    level: 3,
    type: "question",
    text: "Describe a sexual experience that left you deeply changed.",
  },
  {
    id: "L3-02",
    level: 3,
    type: "question",
    text: "What part of your past keeps affecting your intimacy now?",
  },
  {
    id: "L3-03",
    level: 3,
    type: "question",
    text: "What do you deeply crave in intimacy that you’re afraid to ask for?",
  },
  {
    id: "L3-04",
    level: 3,
    type: "question",
    text: "How do you cope when intimacy triggers emotional pain?",
  },
  {
    id: "L3-05",
    level: 3,
    type: "question",
    text: "What would you tell your younger sexual self to protect them?",
  },

  {
    id: "W-01",
    level: "wildcard",
    type: "wildcard",
    text: "Swap one answered card with someone of your choice and explain why.",
    note: "Both of you share how that card landed.",
  },
  {
    id: "W-02",
    level: "wildcard",
    type: "wildcard",
    text: "Ask any player a follow-up question from any previous card.",
    note: "They can pass if it’s too much.",
  },
  {
    id: "W-03",
    level: "wildcard",
    type: "wildcard",
    text: "“Pause & Share”: each player names one boundary they want respected for the next three turns.",
  },

  {
    id: "GD-01",
    level: "go-deeper",
    type: "go-deeper",
    text: "Share the earliest memory that shaped your idea of desire.",
    note: "One gentle clarifying question is allowed.",
  },
  {
    id: "GD-02",
    level: "go-deeper",
    type: "go-deeper",
    text: "Describe a moment of tenderness you cherish. Then name one behaviour you’d like more often.",
  },
];

export function allCards(): Card[] {
  return TMT_DECK;
}
