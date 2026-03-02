import { ID, Query } from "appwrite";
import { client, databases } from "./auth";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "collabcode_db";
const MESSAGES_COLLECTION_ID = "chat_messages";
const ACTIVITIES_COLLECTION_ID = "activity_logs";

export interface Message {
    $id: string;
    roomId: string;
    userId: string;
    username: string;
    message: string;
    sentAt: string;
}

export interface Activity {
    $id: string;
    roomId: string;
    userId: string;
    username: string;
    type: string;
    path?: string;
    message?: string;
    createdAt: string;
}

export const ChatService = {
    async sendMessage(roomId: string, userId: string, username: string, message: string) {
        return databases.createDocument(
            DATABASE_ID,
            MESSAGES_COLLECTION_ID,
            ID.unique(),
            {
                roomId,
                userId,
                username,
                message,
                sentAt: new Date().toISOString()
            }
        );
    },

    async getMessages(roomId: string) {
        return databases.listDocuments(
            DATABASE_ID,
            MESSAGES_COLLECTION_ID,
            [
                Query.equal("roomId", roomId),
                Query.orderDesc("sentAt"),
                Query.limit(50)
            ]
        );
    },

    subscribe(roomId: string, callback: (payload: any) => void) {
        return client.subscribe(
            `databases.${DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
            (response) => {
                const payload = response.payload as any;
                if (payload.roomId === roomId) {
                    callback(payload);
                }
            }
        );
    }
};

export const ActivityService = {
    async logActivity(roomId: string, userId: string, username: string, type: string, path?: string) {
        return databases.createDocument(
            DATABASE_ID,
            ACTIVITIES_COLLECTION_ID,
            ID.unique(),
            {
                roomId,
                userId,
                username,
                type,
                path,
                message: `Activity: ${type}`, // Placeholder as user schema has message
                createdAt: new Date().toISOString()
            }
        );
    },

    async getActivities(roomId: string) {
        return databases.listDocuments(
            DATABASE_ID,
            ACTIVITIES_COLLECTION_ID,
            [
                Query.equal("roomId", roomId),
                Query.orderDesc("createdAt"),
                Query.limit(50)
            ]
        );
    },

    subscribe(roomId: string, callback: (payload: any) => void) {
        return client.subscribe(
            `databases.${DATABASE_ID}.collections.${ACTIVITIES_COLLECTION_ID}.documents`,
            (response) => {
                const payload = response.payload as any;
                if (payload.roomId === roomId) {
                    callback(payload);
                }
            }
        );
    }
};

const WHITEBOARD_COLLECTION_ID = "whiteboard_data";

export const WhiteboardService = {
    async saveWhiteboard(roomId: string, data: string) {
        try {
            // Try to find existing whiteboard for this room
            const existing = await databases.listDocuments(
                DATABASE_ID,
                WHITEBOARD_COLLECTION_ID,
                [Query.equal("roomId", roomId), Query.limit(1)]
            );

            if (existing.documents.length > 0) {
                // Update existing
                return await databases.updateDocument(
                    DATABASE_ID,
                    WHITEBOARD_COLLECTION_ID,
                    existing.documents[0].$id,
                    {
                        data,
                        updatedAt: new Date().toISOString()
                    }
                );
            } else {
                // Create new
                return await databases.createDocument(
                    DATABASE_ID,
                    WHITEBOARD_COLLECTION_ID,
                    ID.unique(),
                    {
                        roomId,
                        data,
                        updatedAt: new Date().toISOString()
                    }
                );
            }
        } catch (error) {
            console.error("Failed to save whiteboard:", error);
            throw error;
        }
    },

    async getWhiteboard(roomId: string) {
        try {
            const result = await databases.listDocuments(
                DATABASE_ID,
                WHITEBOARD_COLLECTION_ID,
                [Query.equal("roomId", roomId), Query.limit(1)]
            );

            if (result.documents.length > 0) {
                return result.documents[0].data;
            }
            return null;
        } catch (error) {
            console.error("Failed to get whiteboard:", error);
            return null;
        }
    }
};
