import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createRoom, toPublicRoomState } from "@/lib/serverRooms";
import type { GameConfig } from "@/lib/gameTypes";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    config?: GameConfig;
    hostName?: string;
  };

  const defaultConfig: GameConfig = {
    mode: "mixed",
    includeWildcards: true,
    includeGoDeeper: true,
  };

  const config: GameConfig = {
    ...defaultConfig,
    ...(body.config ?? {}),
  };

  const hostName = (body.hostName ?? "").trim() || undefined;

  const room = createRoom(config, hostName);
  const publicState = toPublicRoomState(room);

  const hostPlayer = hostName ? publicState.players[0] ?? null : null;

  return NextResponse.json({
    roomId: room.roomId,
    hostKey: room.hostKey,
    state: publicState,
    hostPlayer,
  });
}
