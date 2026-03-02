/**
 * Orchestrator Client — abstracts container management.
 *
 * LOCAL (dev): uses local Docker via docker.ts
 * PRODUCTION:  uses AWS ECS Fargate directly via ecs.ts
 *
 * Production mode is active when AWS_REGION env var is set.
 */

import {
    startOpenVSCode,
    stopContainer,
    restartContainer,
    isContainerRunning,
    removeContainer,
    getRandomPort,
} from "./docker";
import { ecsRunTask, ecsStopTask, ecsGetTaskStatus } from "./ecs";

export interface StartRoomResult {
    ideUrl: string;
    containerName: string;
    port: number;
    taskArn?: string;
}

export interface RoomStatusResult {
    running: boolean;
    ideUrl?: string;
}

/** True when AWS env vars are present — enables ECS path */
export function isProductionMode(): boolean {
    return !!(process.env.AWS_REGION && process.env.ECS_CLUSTER);
}

// ── Start ─────────────────────────────────────────────────────────────────────

export async function orchestratorStartRoom(
    roomId: string,
    workspacePath: string,
    stackId: string,
    existingPort?: number
): Promise<StartRoomResult> {
    if (isProductionMode()) {
        const { taskArn, ideUrl } = await ecsRunTask(roomId, stackId);
        return {
            ideUrl,
            containerName: `ecs-task-${roomId}`,
            port: 3000,
            taskArn,
        };
    }

    const port = existingPort || (await getRandomPort());
    const { containerName } = await startOpenVSCode(roomId, workspacePath, port, stackId);
    return {
        ideUrl: `http://localhost:${port}`,
        containerName,
        port,
    };
}

// ── Restart ───────────────────────────────────────────────────────────────────

export async function orchestratorRestartRoom(
    roomId: string,
    containerName: string,
    taskArn?: string,
    stackId: string = "node-basic"
): Promise<StartRoomResult> {
    if (isProductionMode()) {
        // Stop old task (ignore errors if already stopped)
        if (taskArn) {
            await ecsStopTask(taskArn);
        }
        const { taskArn: newTaskArn, ideUrl } = await ecsRunTask(roomId, stackId);
        return {
            ideUrl,
            containerName: `ecs-task-${roomId}`,
            port: 3000,
            taskArn: newTaskArn,
        };
    }
    await restartContainer(containerName);
    return {
        ideUrl: `http://localhost:0`, // Placeholders for local dev
        containerName,
        port: 0,
    };
}

/**
 * Restart with explicit stackId (preferred over restartRoom for production).
 */
export async function orchestratorRestartRoomWithStack(
    roomId: string,
    containerName: string,
    stackId: string,
    taskArn?: string
): Promise<StartRoomResult> {
    if (isProductionMode()) {
        if (taskArn) await ecsStopTask(taskArn);
        const { taskArn: newTaskArn, ideUrl } = await ecsRunTask(roomId, stackId);
        return {
            ideUrl,
            containerName: `ecs-task-${roomId}`,
            port: 3000,
            taskArn: newTaskArn,
        };
    }
    await restartContainer(containerName);
    return { ideUrl: `http://localhost:0`, containerName, port: 0 };
}

// ── Stop ──────────────────────────────────────────────────────────────────────

export async function orchestratorStopRoom(
    roomId: string,
    containerName: string,
    taskArn?: string
): Promise<void> {
    if (isProductionMode()) {
        if (taskArn) await ecsStopTask(taskArn);
        return;
    }
    await stopContainer(containerName);
}

// ── Status ────────────────────────────────────────────────────────────────────

export async function orchestratorGetStatus(
    roomId: string,
    containerName: string,
    taskArn?: string
): Promise<RoomStatusResult> {
    if (isProductionMode()) {
        if (!taskArn) return { running: false };
        const { running, ideUrl } = await ecsGetTaskStatus(taskArn);
        return { running, ideUrl: ideUrl ?? undefined };
    }
    return { running: await isContainerRunning(containerName) };
}

// ── Remove ────────────────────────────────────────────────────────────────────

export async function orchestratorRemoveRoom(
    roomId: string,
    containerName: string,
    taskArn?: string
): Promise<void> {
    if (isProductionMode()) {
        if (taskArn) await ecsStopTask(taskArn);
        // EFS workspace is preserved intentionally
        return;
    }
    await removeContainer(containerName);
}

// ── Ping ──────────────────────────────────────────────────────────────────────

/**
 * In production, ping is handled by the Vercel Cron idle-check reading
 * lastActiveAt from Appwrite. This function is a no-op in production
 * (the /ping route updates Appwrite directly).
 */
export async function orchestratorPingRoom(
    _roomId: string,
    _taskArn?: string
): Promise<void> {
    // no-op — Appwrite lastActiveAt is the source of truth
}
