import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (roomId?: string) => {
    if (!socket) {
        // In production, use the current domain (which proxies via Vercel Rewrites)
        // In local dev, use the environment variable or localhost:3001
        const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
        const socketUrl = isProd
            ? window.location.origin
            : (process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");

        console.log(`[Socket] Initializing connection to ${socketUrl} (Proxy: ${isProd})`);

        socket = io(socketUrl, {
            // Use polling first - Vercel Rewrites work reliably for HTTP polling
            transports: ["polling"],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            autoConnect: true,
            timeout: 20000,
            withCredentials: true
        });

        socket.on("connect", () => {
            console.log(`[Socket] Connected: ${socket?.id} (Transport: ${socket?.io.engine.transport.name})`);
        });

        socket.on("connect_error", (error) => {
            console.error(`[Socket] Connection error:`, error.message);
            // If websocket failed, we're likely in a mixed content scenario
            if (socket?.io.engine.transport.name === "websocket") {
                console.log("[Socket] WebSocket failed, falling back to polling...");
            }
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
