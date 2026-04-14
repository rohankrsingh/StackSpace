import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/server-auth";
import { orchestratorRemoveRoom, isProductionMode } from "@/lib/orchestrator";
import { getOrCreateRoomAccessPoint, deleteRoomAccessPoint } from "@/lib/efs";
import { deleteWorkspace } from "@/lib/workspaces";
import {
    getRoomByRoomId,
    deleteRoomDoc,
    deleteRoomMembers,
    deleteRoomMessages,
    deleteRoomActivities,
    deleteRoomWhiteboard
} from "@/lib/rooms";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { roomId } = await params;
        const { account } = await createSessionClient(request);

        let user;
        try {
            user = await account.get();
        } catch {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get room
        let room;
        try {
            room = await getRoomByRoomId(roomId);
        } catch {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // 2. Check ownership
        // Note: ownerId in room doc is the Appwrite user ID
        if (room.ownerId !== user.$id) {
            return NextResponse.json(
                { error: "Forbidden: You don't own this room" },
                { status: 403 }
            );
        }

        console.log(`🗑️ Deleting room: ${roomId}`);

        // 3. Cleanup resources sequentially to prevent race conditions (e.g. deleting files while mounted)

        // A. Remove container/task first (releases file locks)
        try {
            await orchestratorRemoveRoom(roomId, room.containerName, room.taskArn);
        } catch (e) {
            console.error(`Warning: Container removal failed: ${e}`);
            // Continue cleanup even if container removal has issues
        }

        // B. Delete workspace data & EFS access point
        try {
            if (isProductionMode() && process.env.EFS_FILE_SYSTEM_ID) {
                // Fetch the existing access point ID by idempotently calling create with the exact same config
                console.log(`[DeleteRoom] Resolving Access Point ID for room: ${roomId}`);
                const efsFileSystemId = process.env.EFS_FILE_SYSTEM_ID;
                const accessPointId = await getOrCreateRoomAccessPoint(roomId, efsFileSystemId);
                if (accessPointId) {
                    await deleteRoomAccessPoint(accessPointId);
                }
            } else {
                // Only delete the local workspace directory if we are not in AWS EFS mode
                deleteWorkspace(roomId);
            }
        } catch (e) {
            console.error(`Warning: Workspace/EFS cleanup failed: ${e}`);
        }

        // C. Delete all related data (cascade delete)
        console.log(`🧹 Cleaning up related data for room: ${roomId}`);
        await deleteRoomMembers(roomId);
        await deleteRoomMessages(roomId);
        await deleteRoomActivities(roomId);
        await deleteRoomWhiteboard(roomId);

        // D. Delete Database Record (the room itself)
        await deleteRoomDoc(roomId);

        console.log(`✅ Room ${roomId} and all related data deleted successfully`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`✗ Delete API error: ${error}`);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
