import { NextRequest, NextResponse } from "next/server";
import { getRoomByRoomId, updateRoomStatus } from "@/lib/rooms";
import { orchestratorGetStatus } from "@/lib/orchestrator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    // Get room from database
    let room;
    try {
      room = await getRoomByRoomId(roomId);
    } catch (error) {
      console.error(`✗ Room not found: ${roomId}`);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    try {
      // Check actual container/task status
      const { running, ideUrl: liveIdeUrl } = await orchestratorGetStatus(
        roomId,
        room.containerName,
        room.taskArn
      );

      // Sync status if mismatch
      const dbStatus = room.status;
      const actualStatus = running ? "running" : "stopped";

      if (dbStatus !== actualStatus) {
        console.log(`ℹ Status mismatch for ${roomId}: DB=${dbStatus}, actual=${actualStatus}. Updating...`);
        await updateRoomStatus(roomId, actualStatus);
        room.status = actualStatus;
      }

      // Return full room data
      return NextResponse.json({
        roomId: room.roomId,
        name: room.name,
        language: room.language,
        status: room.status,
        ideUrl: liveIdeUrl || room.ideUrl,
        port: room.port,
        workspacePath: room.workspacePath,
        createdAt: room.createdAt,
        lastActiveAt: room.lastActiveAt,
      });
    } catch (error) {
      console.error(`✗ Failed to get status: ${error}`);
      return NextResponse.json(
        { error: "Failed to get status" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`✗ API error: ${error}`);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
