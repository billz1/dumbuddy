import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateAIQuestions } from "@/lib/aiQuestions";
import type { CardLevel } from "@/lib/gameTypes";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    count?: number;
    level?: CardLevel | "mixed";
    theme?: string;
  };

  const rawCount = body.count ?? 20;
  const count = Math.min(Math.max(rawCount, 1), 80); // clamp 1–80
  const level = body.level ?? "mixed";
  const theme = body.theme?.slice(0, 120);

  try {
    const cards = await generateAIQuestions({ count, level, theme });
    return NextResponse.json({ cards });
  } catch (err) {
    console.error("AI generation error:", err);
    return new NextResponse("AI error", { status: 500 });
  }
}
