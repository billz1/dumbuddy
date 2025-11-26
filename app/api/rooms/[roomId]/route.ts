import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getRoom,
  applyRoomAction,
  toPublicRoomState,
  advanceTurn,
} from "@/lib/serverRooms";

export async function GET(
  _req: NextRequest,
  context: { params: { roomId: string } }
) {
  const { roomId } = context.params;
  const room = getRoom(roomId);
  if (!room) {
    return new NextResponse("Room not found", { status: 404 });
  }
  return NextResponse.json(toPublicRoomState(room));
}

export async function POST(
  req: NextRequest,
  context: { params: { roomId: string } }
) {
  const { roomId } = context.params;
  const body = (await req.json().catch(() => ({}))) as {
    action?: "draw" | "reset" | "next";
    hostKey?: string;
  };

  if (!body.action || !body.hostKey) {
    return new NextResponse("Missing action or hostKey", { status: 400 });
  }

  try {
    if (body.action === "next") {
      const room = advanceTurn(roomId, body.hostKey);
      if (!room) {
        return new NextResponse("Room not found", { status: 404 });
      }
      return NextResponse.json(toPublicRoomState(room));
    }

    const room = await applyRoomAction(roomId, body.hostKey, body.action);
    if (!room) {
      return new NextResponse("Room not found", { status: 404 });
    }
    return NextResponse.json(toPublicRoomState(room));
  } catch (err: any) {
    if (err instanceof Error && err.message === "invalid_host_key") {
      return new NextResponse("Forbidden", { status: 403 });
    }
    return new NextResponse("Server error", { status: 500 });
  }
}
