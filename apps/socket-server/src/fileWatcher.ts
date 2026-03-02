import chokidar, { FSWatcher } from "chokidar";
import path from "path";
import fs from "fs";
import { Server } from "socket.io";
import { WORKSPACES_DIR } from "./config";
import { FileActivity } from "./types";

const fileWatchers: Record<string, FSWatcher> = {};

// Debounce map to avoid duplicate events for rapid file changes
const debounceTimers: Record<string, NodeJS.Timeout> = {};

export function startFileWatcher(roomId: string, io: Server): void {
    if (fileWatchers[roomId]) {
        return; // Already watching
    }

    const workspacePath = path.join(WORKSPACES_DIR, roomId);

    if (!fs.existsSync(workspacePath)) {
        return;
    }

    const watcher = chokidar.watch(workspacePath, {
        ignored: [/node_modules/, /\.git/, /\.openvscode-data/, /\.openvscode-server/, /\.next/],
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 500,
            pollInterval: 100,
        },
    });

    const broadcastActivity = (type: FileActivity["type"], filePath: string) => {
        const relativePath = path.relative(workspacePath, filePath);

        // Skip hidden files and system files
        if (relativePath.startsWith(".") || relativePath.includes("node_modules")) {
            return;
        }

        // Debounce to prevent duplicate events
        const debounceKey = `${roomId}-${filePath}`;
        if (debounceTimers[debounceKey]) {
            clearTimeout(debounceTimers[debounceKey]);
        }

        debounceTimers[debounceKey] = setTimeout(() => {
            const activity: FileActivity = {
                id: `${Date.now()}-${Math.random()}`,
                type,
                path: relativePath,
                user: { id: "system", name: "System" },
                ts: new Date().toISOString(),
            };

            console.log(`[FileWatcher] Broadcasting ${type} for ${relativePath} in room ${roomId}`);
            io.to(roomId).emit("activity:new", activity);

            delete debounceTimers[debounceKey];
        }, 300);
    };

    watcher.on("change", (filePath) => broadcastActivity("file:update", filePath));
    watcher.on("add", (filePath) => broadcastActivity("file:create", filePath));
    watcher.on("unlink", (filePath) => broadcastActivity("file:delete", filePath));

    watcher.on("error", (error) => {
        console.error(`[FileWatcher] Error in room ${roomId}:`, error);
        // Don't crash the server, just log the error
    });

    fileWatchers[roomId] = watcher;
    console.log(`[FileWatcher] Started watching ${workspacePath}`);
}

export function stopFileWatcher(roomId: string): void {
    if (fileWatchers[roomId]) {
        fileWatchers[roomId].close();
        delete fileWatchers[roomId];
        console.log(`[FileWatcher] Stopped watching room ${roomId}`);
    }
}
