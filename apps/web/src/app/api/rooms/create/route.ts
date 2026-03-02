import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/server-auth";
import { ensureWorkspace, writeVSCodeSettings, deleteWorkspace, writeTemplateFiles } from "@/lib/workspaces";
import { orchestratorStartRoom, isProductionMode } from "@/lib/orchestrator";
import { createRoomDoc, addOwnerMember, deleteRoomDoc } from "@/lib/rooms";
import { STACKS } from "@/templates/stacks";

// Generate Appwrite-safe room ID (alphanumeric only, max 36 chars)
function generateRoomId(): string {
  const timestamp = Date.now().toString(36); // base36 timestamp
  const random = Math.random().toString(36).substring(2, 8); // 6 random chars
  return `room_${timestamp}${random}`.substring(0, 36);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stackId, roomName, isPublic = true } = body;

    // Validate stackId
    const stack = STACKS.find((s) => s.id === stackId);
    if (!stack) {
      return NextResponse.json(
        { error: "Invalid stack ID" },
        { status: 400 }
      );
    }

    // Authenticate user
    const { account } = await createSessionClient(request);
    let user;
    try {
      user = await account.get();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roomId = generateRoomId();
    const ownerId = user.$id;
    let workspacePath: string;

    try {
      // 1. Create workspace directory (local only - in production, orchestrator handles this)
      if (!isProductionMode()) {
        workspacePath = ensureWorkspace(roomId);
        console.log(`✓ Workspace created: ${workspacePath}`);

        // 2. Write template files (local only)
        writeTemplateFiles(roomId, stack);
        writeVSCodeSettings(roomId);
        console.log(`✓ Template files created for stack: ${stack.name}`);
      } else {
        // In production, workspace path will be on EFS
        workspacePath = `/stackspace/workspaces/${roomId}`;
      }

      // 3. Start container via orchestrator (handles both local Docker and AWS)
      const { ideUrl, containerName, port, taskArn } = await orchestratorStartRoom(
        roomId,
        workspacePath,
        stackId
      );

      // 4. Create Appwrite room document
      await createRoomDoc({
        roomId,
        name: roomName,
        language: stack.language,
        stackId: stack.id,
        ownerId,
        status: "running",
        containerName,
        port,
        ideUrl,
        workspacePath,
        isPublic,
        taskArn, // Store AWS task ARN for production
      });

      // 5. Add owner as member
      await addOwnerMember(roomId, ownerId);

      return NextResponse.json(
        {
          roomId,
          ideUrl,
          status: "running",
          containerName,
          port,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error(`✗ Room creation failed: ${error}`);

      // Rollback: delete workspace and Appwrite doc
      try {
        if (!isProductionMode()) {
          deleteWorkspace(roomId);
        }
        await deleteRoomDoc(roomId);
      } catch (rollbackError) {
        console.error(`⚠ Rollback error: ${rollbackError}`);
      }

      return NextResponse.json(
        { error: "Failed to create room", details: String(error) },
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
