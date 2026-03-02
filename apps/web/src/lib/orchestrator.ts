/**
 * Orchestrator Client
 * Abstracts container management between local Docker and AWS Orchestrator.
 * Mode determined by ORCHESTRATOR_URL environment variable.
 */

import {
    startOpenVSCode,
    stopContainer,
    restartContainer,
    isContainerRunning,
    removeContainer,
    getRandomPort
} from "./docker";

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL;

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

export function isProductionMode(): boolean {
    return !!ORCHESTRATOR_URL;
}

export async function orchestratorStartRoom(
    roomId: string,
    workspacePath: string,
    stackId: string,
    existingPort?: number
): Promise<StartRoomResult> {
    if (isProductionMode()) {
        const response = await fetch(`${ORCHESTRATOR_URL}/rooms/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, stackId, workspacePath }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Unknown error" }));
            throw new Error(error.message || "Failed to start room via orchestrator");
        }

        const data = await response.json();
        return {
            ideUrl: data.ideUrl,
            containerName: data.containerName || `ecs-task-${roomId}`,
            port: data.port || 0,
            taskArn: data.taskArn,
        };
    }

    const port = existingPort || await getRandomPort();
    const { containerName } = await startOpenVSCode(roomId, workspacePath, port, stackId);
    return {
        ideUrl: `http://localhost:${port}`,
        containerName,
        port,
    };
}

export async function orchestratorRestartRoom(
    roomId: string,
    containerName: string,
    taskArn?: string
): Promise<void> {
    if (isProductionMode()) {
        const response = await fetch(`${ORCHESTRATOR_URL}/rooms/restart`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, taskArn }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Unknown error" }));
            throw new Error(error.message || "Failed to restart room via orchestrator");
        }
    } else {
        await restartContainer(containerName);
    }
}

export async function orchestratorStopRoom(
    roomId: string,
    containerName: string,
    taskArn?: string
): Promise<void> {
    if (isProductionMode()) {
        const response = await fetch(`${ORCHESTRATOR_URL}/rooms/stop`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, taskArn }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Unknown error" }));
            throw new Error(error.message || "Failed to stop room via orchestrator");
        }
    } else {
        await stopContainer(containerName);
    }
}

export async function orchestratorGetStatus(
    roomId: string,
    containerName: string,
    taskArn?: string
): Promise<RoomStatusResult> {
    if (isProductionMode()) {
        const response = await fetch(
            `${ORCHESTRATOR_URL}/rooms/status?roomId=${roomId}&taskArn=${taskArn || ""}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok) {
            return { running: false };
        }

        const data = await response.json();
        return { running: data.running, ideUrl: data.ideUrl };
    }

    return { running: await isContainerRunning(containerName) };
}

export async function orchestratorRemoveRoom(
    roomId: string,
    containerName: string,
    taskArn?: string
): Promise<void> {
    if (isProductionMode()) {
        const response = await fetch(`${ORCHESTRATOR_URL}/rooms/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, taskArn }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Unknown error" }));
            throw new Error(error.message || "Failed to delete room via orchestrator");
        }
    } else {
        await removeContainer(containerName);
    }
}

export async function orchestratorPingRoom(roomId: string, taskArn?: string): Promise<void> {
    if (isProductionMode()) {
        await fetch(`${ORCHESTRATOR_URL}/rooms/ping`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomId, taskArn }),
        }).catch(() => console.warn(`Failed to ping room ${roomId}`));
    }
}
