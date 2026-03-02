import { createServer } from "http";
import { Server } from "socket.io";
import Client, { Socket as ClientSocket } from "socket.io-client";
import { initializeSocket } from "../src/socket";
import { AddressInfo } from "net";

describe("Socket Server", () => {
    let io: Server;
    let clientSocket: ClientSocket;
    let clientSocket2: ClientSocket;
    let httpServer: any;
    let port: number;

    beforeAll((done) => {
        httpServer = createServer();
        io = new Server(httpServer);
        initializeSocket(io);
        httpServer.listen(() => {
            const address = httpServer.address() as AddressInfo;
            port = address.port;
            done();
        });
    });

    afterAll((done) => {
        io.close();
        httpServer.close();
        done();
    });

    beforeEach((done) => {
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket2 = Client(`http://localhost:${port}`);
        let connectedCount = 0;
        const checkConnected = () => {
            connectedCount++;
            if (connectedCount === 2) done();
        }
        clientSocket.on("connect", checkConnected);
        clientSocket2.on("connect", checkConnected);
    });

    afterEach(() => {
        clientSocket.close();
        clientSocket2.close();
    });

    test("should allow a user to join a room", (done) => {
        const roomId = "test-room";
        const user = { id: "u1", name: "User 1" };

        clientSocket.emit("join-room", { roomId, user });

        clientSocket.on("presence:join", (data) => {
            expect(data.user).toEqual(user);
            done();
        });
    });

    test("should broadcast chat messages", (done) => {
        const roomId = "chat-room";
        const user1 = { id: "u1", name: "User 1" };
        const user2 = { id: "u2", name: "User 2" };

        clientSocket.emit("join-room", { roomId, user: user1 });
        clientSocket2.emit("join-room", { roomId, user: user2 });

        const message = "Hello World";

        // Wait for both to join
        setTimeout(() => {
            clientSocket2.on("chat:new", (data) => {
                expect(data.message).toBe(message);
                expect(data.user.id).toBe(user1.id);
                done();
            });

            clientSocket.emit("chat:send", { roomId, message, user: user1 });
        }, 100);
    });
});
