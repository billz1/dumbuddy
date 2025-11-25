import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { joinRoom, toPublicRoomState } from "@/lib/serverRooms";

export async function POST(
  req: NextRequest,
  context: { params: { roomId: string } }
) {
  const { roomId } = context.params;
  const body = (await req.json().catch(() => ({}))) as { name?: string };

  const name = (body.name ?? "").trim();
  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  const result = joinRoom(roomId, name);
  if (!result) {
    return new NextResponse("Room not found", { status: 404 });
  }

  const { room, player } = result;

  return NextResponse.json({
    state: toPublicRoomState(room),
    player,
  });
}
