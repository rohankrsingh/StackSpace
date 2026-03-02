import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/server-auth";
import { getRoomByRoomId, updateRoomLastActive } from "@/lib/rooms";
import { orchestratorPingRoom } from "@/lib/orchestrator";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { roomId } = await params;

        // Optionally verify auth (can be skipped for less overhead)
        try {
            const { account } = await createSessionClient(request);
            await account.get();
        } catch {
            // Allow ping even without auth for simplicity
        }

        let room;
        try {
            room = await getRoomByRoomId(roomId);
        } catch {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        // Update last active timestamp in Appwrite
        await updateRoomLastActive(roomId);

        // Forward ping to orchestrator (for idle timeout tracking)
        await orchestratorPingRoom(roomId, room.taskArn);

        return NextResponse.json({ success: true, lastActiveAt: new Date().toISOString() });
    } catch (error) {
        console.error(`Ping error: ${error}`);
        return NextResponse.json({ error: "Ping failed" }, { status: 500 });
    }
}
