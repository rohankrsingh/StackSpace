import { databases, DATABASE_ID, ID } from "@/appwrite/server";
import { Query } from "node-appwrite";

export async function createRoomDoc(roomData: {
  roomId: string;
  name?: string;
  language: string;
  stackId?: string;
  ownerId: string;
  status: "running" | "stopped";
  containerName: string;
  port: number;
  ideUrl: string;
  workspacePath: string;
  isPublic?: boolean;
  maxUsers?: number;
  taskArn?: string;
}) {
  const now = new Date().toISOString();
  const doc = await databases.createDocument(
    DATABASE_ID,
    "rooms",
    roomData.roomId,
    {
      roomId: roomData.roomId,
      name: roomData.name || `Room-${roomData.roomId.slice(0, 5)}`,
      stackId: roomData.stackId || roomData.language || "custom",
      ownerId: roomData.ownerId,
      status: roomData.status,
      containerName: roomData.containerName,
      port: roomData.port,
      ideUrl: roomData.ideUrl,
      workspacePath: roomData.workspacePath,
      isPublic: roomData.isPublic !== false,
      maxUsers: roomData.maxUsers || 10,
      taskArn: roomData.taskArn || null,
      lastActiveAt: now,
      createdAt: now,
      updatedAt: now,
    }
  );
  console.log(`✓ Room created: ${roomData.roomId}`);
  return doc;
}

export async function getRoomByRoomId(roomId: string) {
  return databases.getDocument(DATABASE_ID, "rooms", roomId);
}

export async function updateRoomStatus(
  roomId: string,
  status: "running" | "stopped",
  updates?: Record<string, any>
) {
  const doc = await databases.updateDocument(DATABASE_ID, "rooms", roomId, {
    status,
    lastActiveAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...updates,
  });
  console.log(`✓ Room updated: ${roomId} -> ${status}`);
  return doc;
}

export async function updateRoomLastActive(roomId: string) {
  try {
    return await databases.updateDocument(DATABASE_ID, "rooms", roomId, {
      lastActiveAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`✗ Failed to update lastActiveAt: ${error}`);
  }
}

export async function deleteRoomDoc(roomId: string) {
  await databases.deleteDocument(DATABASE_ID, "rooms", roomId);
  console.log(`✓ Room deleted: ${roomId}`);
}

export async function deleteRoomMembers(roomId: string) {
  try {
    const members = await databases.listDocuments(
      DATABASE_ID,
      "room_members",
      [Query.equal("roomId", roomId), Query.limit(100)]
    );
    for (const member of members.documents) {
      await databases.deleteDocument(DATABASE_ID, "room_members", member.$id);
    }
    console.log(`✓ Deleted ${members.documents.length} members for room: ${roomId}`);
  } catch (error) {
    console.error(`✗ Failed to delete room members: ${error}`);
  }
}

export async function deleteRoomMessages(roomId: string) {
  try {
    const messages = await databases.listDocuments(
      DATABASE_ID,
      "chat_messages",
      [Query.equal("roomId", roomId), Query.limit(500)]
    );
    for (const msg of messages.documents) {
      await databases.deleteDocument(DATABASE_ID, "chat_messages", msg.$id);
    }
    console.log(`✓ Deleted ${messages.documents.length} messages for room: ${roomId}`);
  } catch (error) {
    console.error(`✗ Failed to delete room messages: ${error}`);
  }
}

export async function deleteRoomActivities(roomId: string) {
  try {
    const activities = await databases.listDocuments(
      DATABASE_ID,
      "activity_logs",
      [Query.equal("roomId", roomId), Query.limit(500)]
    );
    for (const activity of activities.documents) {
      await databases.deleteDocument(DATABASE_ID, "activity_logs", activity.$id);
    }
    console.log(`✓ Deleted ${activities.documents.length} activities for room: ${roomId}`);
  } catch (error) {
    console.error(`✗ Failed to delete room activities: ${error}`);
  }
}

export async function deleteRoomWhiteboard(roomId: string) {
  try {
    const whiteboards = await databases.listDocuments(
      DATABASE_ID,
      "whiteboard_data",
      [Query.equal("roomId", roomId), Query.limit(10)]
    );
    for (const wb of whiteboards.documents) {
      await databases.deleteDocument(DATABASE_ID, "whiteboard_data", wb.$id);
    }
    console.log(`✓ Deleted ${whiteboards.documents.length} whiteboard(s) for room: ${roomId}`);
  } catch (error) {
    console.error(`✗ Failed to delete room whiteboard: ${error}`);
  }
}

export async function addOwnerMember(roomId: string, ownerId: string) {
  return addMemberIfNotExists(roomId, ownerId, "owner");
}

export async function addMemberIfNotExists(
  roomId: string,
  userId: string,
  role: "owner" | "editor" | "viewer" = "viewer"
) {
  const existingDocs = await databases.listDocuments(
    DATABASE_ID,
    "room_members",
    [Query.equal("roomId", roomId), Query.equal("userId", userId)]
  );

  if (existingDocs.documents.length > 0) {
    return existingDocs.documents[0];
  }

  const doc = await databases.createDocument(
    DATABASE_ID,
    "room_members",
    ID.unique(),
    {
      roomId,
      userId,
      role,
      joinedAt: new Date().toISOString(),
    }
  );
  console.log(`✓ Member added: ${doc.$id}`);
  return doc;
}

export async function listRoomsByOwner(ownerId: string) {
  const docs = await databases.listDocuments(
    DATABASE_ID,
    "rooms",
    [Query.equal("ownerId", ownerId)]
  );
  return docs.documents;
}

/**
 * Returns all rooms currently marked as "running" in Appwrite.
 * Used by the Vercel Cron idle-check job to find stale rooms.
 */
export async function getAllRunningRooms() {
  const docs = await databases.listDocuments(
    DATABASE_ID,
    "rooms",
    [Query.equal("status", "running"), Query.limit(100)]
  );
  return docs.documents as unknown as Array<{
    roomId: string;
    taskArn?: string;
    lastActiveAt: string;
    status: string;
  }>;
}
