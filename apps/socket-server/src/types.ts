export interface User {
    id: string;
    name: string;
    color?: string;
    avatar?: string;
}

export interface RoomState {
    users: User[];
    ownerSocketId?: string;         // socket.id of the room owner
    pendingRequests: Map<string, { user: User; socketId: string }>; // userId → pending joiner info
}

export interface FileActivity {
    id: string;
    type: "file:update" | "file:create" | "file:delete";
    path: string;
    user: { id: string; name: string };
    ts: string;
}

export interface ChatMessage {
    id: string;
    message: string;
    user: User;
    ts: string;
    fileId?: string;
    fileType?: string;
    fileName?: string;
}
