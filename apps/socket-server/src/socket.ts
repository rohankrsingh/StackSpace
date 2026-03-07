import { Server, Socket } from "socket.io";
import { RoomState, User, ChatMessage } from "./types";
import { startFileWatcher, stopFileWatcher } from "./fileWatcher";

const roomStates: Record<string, RoomState> = {};

export function initializeSocket(io: Server): void {
    io.on("connection", (socket: Socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Handle user joining a room with user info
        socket.on("join-room", (data: any) => {
            const roomId = typeof data === "string" ? data : data.roomId;
            const user = typeof data === "string" ? null : data.user;

            console.log(`Socket ${socket.id} joined room ${roomId}`, user ? `as ${user.name}` : "");
            socket.join(roomId);

            if (!roomStates[roomId]) {
                roomStates[roomId] = { users: [] };
                console.log(`[Room] Starting file watcher for ${roomId}`);
                startFileWatcher(roomId, io);
            }

            // If user info provided, add to room state
            if (user) {
                const existingUser = roomStates[roomId].users.find((u) => u.id === user.id);
                if (!existingUser) {
                    roomStates[roomId].users.push(user);
                    console.log(`[Room] Added user ${user.name} to room ${roomId}`);
                }

                // Emit updated user list to all clients in the room
                io.to(roomId).emit("users-update", roomStates[roomId].users);
            }
        });

        // Handle user joined with user info
        socket.on("user-joined", (data: { roomId: string; user: User }) => {
            const { roomId, user } = data;
            console.log(`User ${user.name} (${user.id}) joined room ${roomId}`);

            if (!roomStates[roomId]) {
                roomStates[roomId] = { users: [] };
            }

            const existingUser = roomStates[roomId].users.find((u) => u.id === user.id);
            if (!existingUser) {
                roomStates[roomId].users.push(user);
            }

            // Emit updated user list to all clients in the room
            io.to(roomId).emit("users-update", roomStates[roomId].users);
        });

        // Handle user leaving
        socket.on("user-left", (data: { roomId: string; userId: string }) => {
            const { roomId, userId } = data;
            console.log(`User ${userId} left room ${roomId}`);

            if (roomStates[roomId]) {
                roomStates[roomId].users = roomStates[roomId].users.filter(
                    (u) => u.id !== userId
                );

                // Emit updated user list
                io.to(roomId).emit("users-update", roomStates[roomId].users);

                if (roomStates[roomId].users.length === 0) {
                    stopFileWatcher(roomId);
                    delete roomStates[roomId];
                }
            }

            socket.leave(roomId);
        });

        // Handle chat messages
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

            // Broadcast to all clients in the room (including sender for confirmation)
            io.to(roomId).emit("chat-message", chatMessage);
        });

        // Handle whiteboard changes
        socket.on("whiteboard-change", (data: { roomId: string; data: string }) => {
            const { roomId, data: whiteboardData } = data;
            console.log(`Whiteboard update in room ${roomId}`);

            // Broadcast to all OTHER clients in the room (not the sender)
            socket.to(roomId).emit("whiteboard-update", whiteboardData);
        });

        // Legacy chat event for backwards compatibility
        socket.on("chat:send", (data: { roomId: string; message: string; user: User }) => {
            const { roomId, message, user } = data;
            console.log(`Chat in ${roomId}: ${user.name}: ${message}`);

            const chatMessage: ChatMessage = {
                id: `${Date.now()}-${Math.random()}`,
                message,
                user,
                ts: new Date().toISOString(),
            };

            io.to(roomId).emit("chat:new", chatMessage);
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
}
