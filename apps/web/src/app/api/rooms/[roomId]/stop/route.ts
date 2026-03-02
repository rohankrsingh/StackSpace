import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/server-auth";
import { getRoomByRoomId, updateRoomStatus } from "@/lib/rooms";
import { orchestratorStopRoom } from "@/lib/orchestrator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { account } = await createSessionClient(request);

    // Verify auth
    try {
      await account.get();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let room;
    try {
      room = await getRoomByRoomId(roomId);
    } catch (error) {
      console.error(`Room not found: ${roomId}`);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    try {
      // Stop container/task (don't delete workspace)
      await orchestratorStopRoom(roomId, room.containerName, room.taskArn);

      // Update status
      await updateRoomStatus(roomId, "stopped");

      return NextResponse.json({
        roomId,
        status: "stopped",
      });
    } catch (error) {
      console.error(`Failed to stop container: ${error}`);
      return NextResponse.json(
        { error: "Failed to stop container" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`API error: ${error}`);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
