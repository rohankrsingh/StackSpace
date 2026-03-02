/**
 * Vercel Cron Job — Idle Room Auto-Pause
 *
 * Schedule: every 2 minutes (configured in vercel.json)
 * Protection: CRON_SECRET header must match env var
 *
 * Logic:
 *  1. Query Appwrite for all rooms with status = "running"
 *  2. For each room where lastActiveAt > IDLE_TIMEOUT_MS ago:
 *     a. Call ECS to stop the Fargate task
 *     b. Update Appwrite room status → "stopped"
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllRunningRooms, updateRoomStatus } from "@/lib/rooms";
import { ecsStopTask } from "@/lib/ecs";

const IDLE_TIMEOUT_MS = parseInt(
    process.env.IDLE_TIMEOUT_MS || "600000", // 10 minutes
    10
);

export async function GET(request: NextRequest) {
    // Protect the cron endpoint
    const secret = request.headers.get("x-cron-secret") ||
        request.nextUrl.searchParams.get("secret");

    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = Date.now();
    const stopped: string[] = [];
    const errors: string[] = [];

    let runningRooms: Awaited<ReturnType<typeof getAllRunningRooms>> = [];
    try {
        runningRooms = await getAllRunningRooms();
    } catch (e) {
        console.error("[cron/idle-check] Failed to query running rooms:", e);
        return NextResponse.json({ error: "Failed to query rooms" }, { status: 500 });
    }

    console.log(`[cron/idle-check] Checking ${runningRooms.length} running room(s)`);

    for (const room of runningRooms) {
        const lastActive = new Date(room.lastActiveAt).getTime();
        const idleMs = now - lastActive;

        if (idleMs <= IDLE_TIMEOUT_MS) continue;

        console.log(
            `[cron/idle-check] Room ${room.roomId} idle ${Math.round(idleMs / 1000)}s — stopping`
        );

        try {
            // 1. Stop ECS task (workspace on EFS is preserved)
            if (room.taskArn) {
                await ecsStopTask(room.taskArn);
            }

            // 2. Update Appwrite status
            await updateRoomStatus(room.roomId, "stopped");

            stopped.push(room.roomId);
        } catch (e) {
            console.error(`[cron/idle-check] Error stopping room ${room.roomId}:`, e);
            errors.push(room.roomId);
        }
    }

    console.log(
        `[cron/idle-check] Done — stopped: ${stopped.length}, errors: ${errors.length}`
    );

    return NextResponse.json({
        checked: runningRooms.length,
        stopped,
        errors,
        ts: new Date().toISOString(),
    });
}
