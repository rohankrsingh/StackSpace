// Type definitions for CollabCode
export interface Room {
  roomId: string;
  status: "running" | "stopped";
  ideUrl: string;
  containerName?: string;
  port?: number;
}

export interface User {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  user: User;
  message: string;
  ts: string;
  fileId?: string;
  fileType?: string;
  fileName?: string;
}

export interface Activity {
  id: string;
  type: "file:update" | "file:create" | "file:delete";
  path?: string;
  user: User;
  ts: string;
}

export interface Workspace {
  roomId: string;
  path: string;
  createdAt: string;
}
