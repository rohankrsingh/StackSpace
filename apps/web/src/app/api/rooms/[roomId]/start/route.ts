import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/server-auth";
import { getRoomByRoomId, updateRoomStatus } from "@/lib/rooms";
import {
  orchestratorRestartRoom,
  orchestratorGetStatus,
  isProductionMode
} from "@/lib/orchestrator";

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
      console.error(`✗ Room not found: ${roomId}`);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check actual container/task status
    const { running } = await orchestratorGetStatus(
      roomId,
      room.containerName,
      room.taskArn
    );

    // If DB says running but container is actually stopped, sync and restart
    if (room.status === "running" && !running) {
      console.log(`ℹ Room ${roomId} marked as running but container is stopped. Restarting...`);
      const result = await orchestratorRestartRoom(roomId, room.containerName, room.taskArn, room.stackId);

      // Update DB with new Public IP / Task ARN
      await updateRoomStatus(roomId, "running", {
        ideUrl: result.ideUrl,
        taskArn: result.taskArn,
      });

      // Wait a bit for the IDE server to initialize
      await new Promise(resolve => setTimeout(resolve, 3000));
      return NextResponse.json({
        roomId,
        status: "running",
        ideUrl: result.ideUrl,
        port: result.port,
      });
    }

    // If already running, return success
    if (room.status === "running" && running) {
      return NextResponse.json({
        roomId,
        status: "running",
        ideUrl: room.ideUrl,
        port: room.port,
      });
    }

    try {
      // Restart the stopped container/task
      const result = await orchestratorRestartRoom(roomId, room.containerName, room.taskArn, room.stackId);

      // Update room status and new cloud metadata
      await updateRoomStatus(roomId, "running", {
        ideUrl: result.ideUrl,
        taskArn: result.taskArn,
      });

      // Wait for IDE server initialization
      await new Promise(resolve => setTimeout(resolve, isProductionMode() ? 5000 : 3000));

      return NextResponse.json({
        roomId,
        status: "running",
        ideUrl: result.ideUrl,
        port: result.port,
      });
    } catch (error) {
      console.error(`✗ Failed to start container: ${error}`);
      return NextResponse.json(
        { error: "Failed to start container" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error(`✗ API error: ${error}`);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
