import { NextRequest, NextResponse } from "next/server";
import { getRoomByRoomId, addMemberIfNotExists } from "@/lib/rooms";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { userId, role = "member" } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // 1. Validate room exists
    let room;
    try {
      room = await getRoomByRoomId(roomId);
    } catch (error) {
      console.error(`✗ Room not found: ${roomId}`);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    try {
      // 2. Add member if not exists
      await addMemberIfNotExists(roomId, userId, role);

      return NextResponse.json({
        status: "ok",
        roomId,
        userId,
        role,
      });
    } catch (error) {
      console.error(`✗ Failed to join room: ${error}`);
      return NextResponse.json(
        { error: "Failed to join room" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`✗ API error: ${error}`);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
