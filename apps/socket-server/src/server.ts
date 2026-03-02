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
});

initializeSocket(io);

httpServer.listen(PORT, () => {
    console.log(`Socket.IO server running on port ${PORT}`);
});
