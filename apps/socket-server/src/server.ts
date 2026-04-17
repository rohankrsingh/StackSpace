import { createServer } from "http";
import { Server } from "socket.io";
import { PORT, CORS_ORIGINS } from "./config";
import { initializeSocket } from "./socket";

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: CORS_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true,
    },
    // CRITICAL for Vercel/Proxy stability:
    // Low values ensure the connection is 're-poked' frequently, 
    // preventing the proxy (Vercel/Nginx/ALB) from timing out the long-polling request.
    pingTimeout: 10000,
    pingInterval: 5000,
    transports: ["polling", "websocket"]
});

initializeSocket(io);

httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
    console.log(`CORS allowed for: ${CORS_ORIGINS}`);
});
