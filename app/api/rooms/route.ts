import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRoom, toPublicRoomState } from "@/lib/serverRooms";
import type { GameConfig } from "@/lib/gameTypes";
import { generateAIQuestions } from "@/lib/aiQuestions";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    config?: GameConfig;
    hostName?: string;
    questionCount?: number;
    theme?: string;
  };

  const defaultConfig: GameConfig = {
    mode: "mixed",
    includeWildcards: true,
    includeGoDeeper: true,
  };

  const config: GameConfig = body.config ?? defaultConfig;
  const hostName = (body.hostName ?? "").trim() || undefined;

  const rawCount = body.questionCount ?? 20;
  const questionCount = Math.min(Math.max(rawCount, 1), 80);
  const theme = body.theme?.slice(0, 120);

  const levelParam =
    config.mode === "mixed" ? "mixed" : (Number(config.mode) as 1 | 2 | 3);

  try {
    const deck = await generateAIQuestions({
      count: questionCount,
      level: levelParam,
      theme: theme || undefined,
    });

    if (!deck.length) {
      return new NextResponse("Failed to generate AI deck", { status: 500 });
    }

    const room = createRoom(config, hostName, {
      deck,
      questionCount,
      theme: theme || undefined,
      useAI: true,
    });
    const publicState = toPublicRoomState(room);

    const hostPlayer = hostName ? publicState.players[0] ?? null : null;

    return NextResponse.json({
      roomId: room.roomId,
      hostKey: room.hostKey,
      state: publicState,
      hostPlayer,
    });
  } catch (err) {
    console.error("Error creating AI room:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
