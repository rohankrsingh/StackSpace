import chokidar, { FSWatcher } from "chokidar";
import path from "path";
import fs from "fs";
import { Server } from "socket.io";
import { WORKSPACES_DIR } from "./config";
import { FileActivity } from "./types";

const fileWatchers: Record<string, FSWatcher> = {};
const debounceTimers: Record<string, NodeJS.Timeout> = {};

// Polling timers while waiting for the workspace dir to appear
const waitTimers: Record<string, NodeJS.Timeout> = {};

const MAX_WAIT_MS = 5 * 60 * 1000;   // give up after 5 minutes
const POLL_INTERVAL_MS = 5_000;       // check every 5 seconds

export function startFileWatcher(roomId: string, io: Server): void {
    if (fileWatchers[roomId] || waitTimers[roomId]) {
        return; // Already watching or waiting
    }

    const workspacePath = path.join(WORKSPACES_DIR, roomId);
    const started = Date.now();

    console.log(`[FileWatcher] Waiting for workspace to appear: ${workspacePath}`);

    const tryStart = () => {
        if (fileWatchers[roomId]) return; // Already started by now

        if (!fs.existsSync(workspacePath)) {
            if (Date.now() - started > MAX_WAIT_MS) {
                console.warn(`[FileWatcher] Timed out waiting for ${workspacePath}`);
                delete waitTimers[roomId];
                return;
            }
            // Not ready yet — try again after interval
            waitTimers[roomId] = setTimeout(tryStart, POLL_INTERVAL_MS);
            return;
        }

        delete waitTimers[roomId];
        launchWatcher(roomId, workspacePath, io);
    };

    tryStart();
}

function launchWatcher(roomId: string, workspacePath: string, io: Server): void {
    const watcher = chokidar.watch(workspacePath, {
        ignored: [
            /node_modules/,
            /\.git/,
            /\.openvscode-data/,
            /\.openvscode-server/,
            /\.openvscode-server-extensions/,
            /\.next/,
            /\.cache/,
            /\.vscode\/settings\.json$/,
            /\.stackspace-init$/,
        ],
        persistent: true,
        // ⚠️  EFS is an NFS-backed network filesystem. Kernel inotify does NOT
        //     work over NFS — chokidar must fall back to stat-based polling.
        usePolling: true,
        interval: 2000,          // poll every 2 s (balances freshness vs API cost)
        binaryInterval: 5000,    // poll binary files less frequently
        awaitWriteFinish: {
            stabilityThreshold: 1000,
            pollInterval: 200,
        },
        ignoreInitial: true,     // don't spam "file:create" for existing files on start
    });

    const broadcastActivity = (type: FileActivity["type"], filePath: string) => {
        const relativePath = path.relative(workspacePath, filePath);

        // Skip hidden files and system files
        if (relativePath.startsWith(".") || relativePath.includes("node_modules")) {
            return;
        }

        // Debounce to prevent duplicate events for rapid saves
        const debounceKey = `${roomId}-${filePath}`;
        if (debounceTimers[debounceKey]) {
            clearTimeout(debounceTimers[debounceKey]);
        }

        debounceTimers[debounceKey] = setTimeout(() => {
            const activity: FileActivity = {
                id: `${Date.now()}-${Math.random()}`,
                type,
                path: relativePath,
                user: { id: "system", name: "File System" },
                ts: new Date().toISOString(),
            };

            console.log(`[FileWatcher] ${type} → ${relativePath} in room ${roomId}`);
            io.to(roomId).emit("activity:new", activity);

            delete debounceTimers[debounceKey];
        }, 300);
    };

    watcher.on("change", (filePath) => broadcastActivity("file:update", filePath));
    watcher.on("add",    (filePath) => broadcastActivity("file:create", filePath));
    watcher.on("unlink", (filePath) => broadcastActivity("file:delete", filePath));
    watcher.on("error",  (error)    => console.error(`[FileWatcher] Error in room ${roomId}:`, error));

    fileWatchers[roomId] = watcher;
    console.log(`[FileWatcher] Started watching ${workspacePath}`);
}

export function stopFileWatcher(roomId: string): void {
    // Cancel any pending "wait for dir" polling
    if (waitTimers[roomId]) {
        clearTimeout(waitTimers[roomId]);
        delete waitTimers[roomId];
    }

    if (fileWatchers[roomId]) {
        fileWatchers[roomId].close();
        delete fileWatchers[roomId];
        console.log(`[FileWatcher] Stopped watching room ${roomId}`);
    }
}
