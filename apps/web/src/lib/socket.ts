import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (roomId?: string) => {
    if (!socket) {
        // Get Socket.IO server URL from environment or use default
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

        console.log(`[Socket] Connecting to ${socketUrl}`);
        socket = io(socketUrl, {
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            autoConnect: true,
        });

        socket.on("connect", () => {
            console.log(`[Socket] Connected: ${socket?.id}`);
        });

        socket.on("connect_error", (error) => {
            console.error(`[Socket] Connection error:`, error);
        });

        socket.on("disconnect", (reason) => {
            console.log(`[Socket] Disconnected: ${reason}`);
        });
    }

    if (!socket.connected) {
        socket.connect();
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        if (socket.connected) {
            socket.disconnect();
        }
        socket = null;
    }
};
