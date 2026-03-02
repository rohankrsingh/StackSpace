import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/server-auth";
import { listRoomsByOwner } from "@/lib/rooms";

export async function GET(request: NextRequest) {
  try {
    const { account } = await createSessionClient(request);

    let user;
    try {
      user = await account.get();
    } catch (error: any) {
      console.error("Auth check failed:", error.message || error);
      return NextResponse.json({ error: "Unauthorized", details: error.message }, { status: 401 });
    }

    const ownerId = user.$id;

    // 1. Get rooms by owner
    const rooms = await listRoomsByOwner(ownerId);

    // 2. Return array of rooms
    return NextResponse.json({
      rooms: rooms.map((room: any) => ({
        roomId: room.roomId,
        name: room.name,
        language: room.language,
        status: room.status,
        ideUrl: room.ideUrl,
        port: room.port,
        isPublic: room.isPublic,
        createdAt: room.createdAt,
        lastActiveAt: room.lastActiveAt,
      })),
    });
  } catch (error) {
    console.error(`✗ Failed to list rooms: ${error}`);
    return NextResponse.json(
      { error: "Failed to list rooms" },
      { status: 500 }
    );
  }
}
