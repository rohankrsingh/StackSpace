import { Server, Socket } from "socket.io";
import { RoomState, User, ChatMessage } from "./types";
import { startFileWatcher, stopFileWatcher } from "./fileWatcher";

const roomStates: Record<string, RoomState> = {};

// Maps socket.id → { roomId, userId } for cleanup on disconnect
const socketMeta: Record<string, { roomId: string; userId: string }> = {};

function getOrCreateRoom(roomId: string, io: Server): RoomState {
    if (!roomStates[roomId]) {
        roomStates[roomId] = {
            users: [],
            pendingRequests: new Map(),
        };
        console.log(`[Room] Starting file watcher for ${roomId}`);
        startFileWatcher(roomId, io);
    }
    return roomStates[roomId];
}

export function initializeSocket(io: Server): void {
    io.on("connection", (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        // ── Owner registers themselves ─────────────────────────────────────────
        // Emitted by the room owner immediately after connecting so the server
        // knows which socket belongs to the owner of a given room.
        socket.on("register-owner", (data: { roomId: string; userId: string }) => {
            const { roomId, userId } = data;
            const room = getOrCreateRoom(roomId, io);
            room.ownerSocketId = socket.id;
            socketMeta[socket.id] = { roomId, userId };
            console.log(`[Room] Owner registered: userId=${userId} socket=${socket.id} room=${roomId}`);
        });

        // ── Guest sends a join request (knock) ────────────────────────────────
        // Emitted by a non-owner before they can enter the room.
        // The server forwards it to the owner socket; if owner is absent it auto-rejects.
        socket.on("join-request", (data: { roomId: string; user: User }) => {
            const { roomId, user } = data;
            const room = roomStates[roomId];

            console.log(`[Room] Join request from ${user.name} (${user.id}) for room ${roomId}`);

            // Store pending request so we can resolve it when the owner responds
            if (!roomStates[roomId]) {
                roomStates[roomId] = { users: [], pendingRequests: new Map() };
            }
            roomStates[roomId].pendingRequests.set(user.id, { user, socketId: socket.id });
            socketMeta[socket.id] = { roomId, userId: user.id };

            if (!room?.ownerSocketId) {
                // Owner not present — auto-reject
                console.log(`[Room] No owner online for ${roomId}, auto-rejecting ${user.name}`);
                socket.emit("join-rejected", { reason: "Host is not currently online." });
                roomStates[roomId].pendingRequests.delete(user.id);
                return;
            }

            // Forward request to the owner
            io.to(room.ownerSocketId).emit("join-request", {
                roomId,
                user,
                requesterId: user.id,
            });

            // Auto-reject after 60 seconds if owner doesn't respond
            setTimeout(() => {
                const pending = roomStates[roomId]?.pendingRequests.get(user.id);
                if (pending) {
                    console.log(`[Room] Auto-rejecting ${user.name} after timeout`);
                    roomStates[roomId].pendingRequests.delete(user.id);
                    io.to(pending.socketId).emit("join-rejected", { reason: "Host did not respond in time." });
                }
            }, 60_000);
        });

        // ── Owner responds to a join request ──────────────────────────────────
        // Emitted by the owner with approved: true/false.
        socket.on("join-response", (data: { roomId: string; requesterId: string; approved: boolean }) => {
            const { roomId, requesterId, approved } = data;
            const room = roomStates[roomId];

            if (!room) return;

            const pending = room.pendingRequests.get(requesterId);
            if (!pending) {
                console.warn(`[Room] No pending request found for ${requesterId} in ${roomId}`);
                return;
            }

            room.pendingRequests.delete(requesterId);

            if (approved) {
                console.log(`[Room] Owner approved ${pending.user.name} for room ${roomId}`);
                io.to(pending.socketId).emit("join-approved", { roomId });
            } else {
                console.log(`[Room] Owner rejected ${pending.user.name} for room ${roomId}`);
                io.to(pending.socketId).emit("join-rejected", { reason: "Host declined your request." });
            }
        });

        // ── Standard join-room (after approval or for owner) ─────────────────
        socket.on("join-room", (data: any) => {
            const roomId = typeof data === "string" ? data : data.roomId;
            const user = typeof data === "string" ? null : data.user;

            console.log(`Socket ${socket.id} joined room ${roomId}`, user ? `as ${user.name}` : "");
            socket.join(roomId);

            const room = getOrCreateRoom(roomId, io);

            if (user) {
                socketMeta[socket.id] = { roomId, userId: user.id };

                const existingUser = room.users.find((u) => u.id === user.id);
                if (!existingUser) {
                    room.users.push(user);
                    console.log(`[Room] Added user ${user.name} to room ${roomId}`);
                }

                io.to(roomId).emit("users-update", room.users);
            }
        });

        // ── User left ─────────────────────────────────────────────────────────
        socket.on("user-left", (data: { roomId: string; userId: string }) => {
            const { roomId, userId } = data;
            console.log(`User ${userId} left room ${roomId}`);

            if (roomStates[roomId]) {
                roomStates[roomId].users = roomStates[roomId].users.filter(
                    (u) => u.id !== userId
                );

                // If owner left, clear ownerSocketId so late joiners get auto-rejected
                if (roomStates[roomId].ownerSocketId === socket.id) {
                    roomStates[roomId].ownerSocketId = undefined;
                }

                io.to(roomId).emit("users-update", roomStates[roomId].users);

                if (roomStates[roomId].users.length === 0) {
                    stopFileWatcher(roomId);
                    delete roomStates[roomId];
                }
            }

            socket.leave(roomId);
        });

        // ── Chat messages ─────────────────────────────────────────────────────
        socket.on("send-chat-message", (data: { roomId: string; userId: string; username: string; message: string; fileId?: string; fileType?: string; fileName?: string }) => {
            const { roomId, userId, username, message, fileId, fileType, fileName } = data;
            console.log(`Chat in ${roomId}: ${username}: ${message}${fileId ? " [Attachment]" : ""}`);

            const chatMessage = {
                id: `${Date.now()}-${Math.random()}`,
                userId,
                username,
                message,
                sentAt: new Date().toISOString(),
                fileId,
                fileType,
                fileName,
            };

            io.to(roomId).emit("chat-message", chatMessage);
        });

        // ── Whiteboard ────────────────────────────────────────────────────────
        socket.on("whiteboard-change", (data: { roomId: string; data: string }) => {
            const { roomId, data: whiteboardData } = data;
            socket.to(roomId).emit("whiteboard-update", whiteboardData);
        });

        // ── Legacy chat ───────────────────────────────────────────────────────
        socket.on("chat:send", (data: { roomId: string; message: string; user: User }) => {
            const { roomId, message, user } = data;
            const chatMessage: ChatMessage = {
                id: `${Date.now()}-${Math.random()}`,
                message,
                user,
                ts: new Date().toISOString(),
            };
            io.to(roomId).emit("chat:new", chatMessage);
        });

        // ── Disconnect cleanup ────────────────────────────────────────────────
        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
            const meta = socketMeta[socket.id];
            if (meta) {
                const { roomId, userId } = meta;
                const room = roomStates[roomId];
                if (room) {
                    // Clear owner tracking
                    if (room.ownerSocketId === socket.id) {
                        room.ownerSocketId = undefined;
                    }
                    // Remove from user list
                    room.users = room.users.filter((u) => u.id !== userId);
                    io.to(roomId).emit("users-update", room.users);

                    if (room.users.length === 0) {
                        stopFileWatcher(roomId);
                        delete roomStates[roomId];
                    }
                }
                delete socketMeta[socket.id];
            }
        });
    });
}
