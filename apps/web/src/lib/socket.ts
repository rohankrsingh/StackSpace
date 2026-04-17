import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (roomId?: string) => {
    if (!socket) {
        // In production, use the current domain (which proxies via Vercel Rewrites)
        const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('192.168');
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (isProd ? window.location.origin : "http://localhost:3001");

        console.log(`[Socket] Initializing connection to ${socketUrl} (Mode: ${isProd ? "Production/Proxy" : "Local/Direct"})`);

        socket = io(socketUrl, {
            transports: ["polling", "websocket"],
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            autoConnect: true,
            timeout: 15000,
            withCredentials: true,
            path: "/socket.io/"
        });

        socket.on("connect", () => {
            console.log(`[Socket] Connected successfully! ID: ${socket?.id} | Transport: ${socket?.io.engine.transport.name}`);
        });

        socket.on("connect_error", (error) => {
            console.warn(`[Socket] Connection error on ${socketUrl}:`, error.message);
        });

        socket.on("disconnect", (reason) => {
            console.log(`[Socket] Disconnected: ${reason}`);
            if (reason === "io server disconnect") {
                socket?.connect();
            }
        });
    }

    // Check if we need to manually connect
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
