import type { Card, CardLevel } from "./gameTypes";
import { allCards } from "./prompts";

interface AIQuestionRequest {
  count: number;
  level: CardLevel | "mixed";
  theme?: string;
}

/**
 * Shuffle helper so fallback decks are randomized every time.
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a fallback deck from the built-in 300+ questions.
 * Respects requested level and count, and shuffles so order changes every game.
 */
function buildFallbackQuestions(req: AIQuestionRequest): Card[] {
  const base = allCards().filter((card) => card.type === "question");

  let pool: Card[];
  if (req.level === "mixed") {
    pool = base;
  } else {
    const lvl = Number(req.level);
    const filtered = base.filter((c) => c.level === lvl);
    pool = filtered.length ? filtered : base;
  }

  const shuffled = shuffle(pool);
  const count = Math.max(1, Math.min(req.count, shuffled.length));
  const slice = shuffled.slice(0, count);

  // Attach a small note so we know this came from the offline deck
  return slice.map((card) => ({
    ...card,
    note: card.note ?? "From built-in intimacy deck",
  }));
}

/**
 * Generate a batch of AI intimacy questions that match our safety & tone rules.
 * This runs on the server only (never expose your API key to the client).
 *
 * IMPORTANT:
 * - If OpenAI fails (429, network, etc.), we return a shuffled subset of the
 *   built-in 300-question deck so the game is always playable.
 */
export async function generateAIQuestions(
  req: AIQuestionRequest
): Promise<Card[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  // If there's no API key at all, just use fallback and don't even try OpenAI.
  if (!apiKey) {
    console.warn("OPENAI_API_KEY missing, using built-in deck only.");
    return buildFallbackQuestions(req);
  }

  const levelLabel =
    req.level === "mixed"
      ? "a mix of Level 1, Level 2, and Level 3"
      : `Level ${req.level}`;

  const systemPrompt = `
You are an intimacy game writer for a consent-first, trauma-informed adult (18+) question game.
Tone: warm, caring, non-judgmental, emotionally intelligent.
NO explicit sexual content, NO graphic descriptions, NO illegal content.
Focus on feelings, boundaries, consent, vulnerability, emotional and sensual context.

Write questions similar in spirit to deep intimacy card games, but fully original.
They must be safe to read aloud in a mixed group of consenting adults.

Rules:
- English only.
- Do NOT number the questions.
- Do NOT reference any brand or game name.
- 1–2 sentences per question.
- Make each question concrete and answerable.
- Avoid clinical/therapy language and diagnoses.
`.trim();

  const userPrompt = `
Generate ${req.count} intimacy questions for ${levelLabel}.
${req.theme ? `Theme: ${req.theme}.` : ""}

Return the questions as plain text, one question per line.
Do NOT add numbering, bullet points, or quotes.
Do NOT wrap the response in JSON or code fences.
`.trim();

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    // If rate-limited or any other non-OK status, fall back.
    if (!response.ok) {
      console.error(
        `OpenAI error status ${response.status}, using built-in deck.`
      );
      return buildFallbackQuestions(req);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    const lines =
      content
        .split("\n")
        .map((line: string) => line.trim())
        .filter(
          (line: string) =>
            line.length > 0 &&
            !line.startsWith("```") &&
            line.toLowerCase() !== "json"
        ) ?? [];

    if (!lines.length) {
      console.warn("AI returned empty content, using built-in deck.");
      return buildFallbackQuestions(req);
    }

    const now = Date.now();
    return lines.map((text: string, index: number) => {
      const id = `ai-${now}-${index}`;
      const level: CardLevel =
        req.level === "mixed"
          ? (([1, 2, 3] as CardLevel[])[
              Math.floor(Math.random() * 3)
            ] as CardLevel)
          : (req.level as CardLevel);

      return {
        id,
        level,
        type: "question",
        text,
        note: "AI-generated question",
      } as Card;
    });
  } catch (err) {
    console.error("Error calling OpenAI, using built-in deck:", err);
    return buildFallbackQuestions(req);
  }
}
