import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (roomId?: string) => {
    if (!socket) {
        // DETECT ENVIRONMENT
        const isBrowser = typeof window !== 'undefined';
        const isLocalhost = isBrowser && (
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' || 
            window.location.hostname.startsWith('192.168')
        );

        // Logic: 
        // 1. If NEXT_PUBLIC_SOCKET_URL is set (and starts with http), use it.
        // 2. If we are in the browser and NOT on localhost, use the current origin (Vercel Proxy).
        // 3. Otherwise, use localhost:3001.
        let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        
        if (!socketUrl) {
            if (isBrowser && !isLocalhost) {
                socketUrl = window.location.origin; // Use the HTTPS proxy
            } else {
                socketUrl = "http://localhost:3001";
            }
        }

        console.log(`[Socket] Initializing connection to ${socketUrl} | Proxy Mode: ${!isLocalhost && isBrowser}`);

        socket = io(socketUrl, {
            transports: ["polling", "websocket"],
            reconnection: true,
            reconnectionAttempts: 15,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            autoConnect: true,
            timeout: 15000,
            withCredentials: true,
            // The path must match the Vercel rewrite AND the Socket Server's config
            path: "/socket.io/"
        });

        socket.on("connect", () => {
            console.log(`[Socket] Connected successfully! ID: ${socket?.id} | Transport: ${socket?.io.engine.transport.name}`);
        });

        socket.on("connect_error", (error) => {
            console.warn(`[Socket] Connection error on ${socketUrl}:`, error.message);
            // Fallback for mixed content detection if it still fails
            if (error.message.includes("xhr poll error") && socketUrl?.startsWith("http://")) {
                console.error("[Socket] Possible Mixed Content error detected. Check your proxy settings.");
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`[Socket] Disconnected: ${reason}`);
            if (reason === "io server disconnect") {
                socket?.connect();
            }
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
