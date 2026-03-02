## CollabCode Backend Implementation

This document describes the fully implemented backend with 6 API routes for managing collaborative rooms.

### ✅ Completed Implementation

**All 6 API routes have been implemented with comprehensive error handling and rollback logic:**

#### 1. POST `/api/rooms/create`
Creates a new collaborative room with workspace and Docker container.

**Request:**
```json
{
  "name": "My Project",
  "language": "javascript", // "python" | "javascript" | "java"
  "isPublic": true
}
```

**Response:**
```json
{
  "roomId": "abc123def45",
  "ideUrl": "http://localhost:5000",
  "status": "running",
  "containerName": "ovscode-abc123def45",
  "port": 4532
}
```

**What it does:**
1. Generates a unique room ID
2. Creates workspace folder at `<repo>/workspaces/<roomId>`
3. Writes starter files (main.py/js/java based on language)
4. Configures VS Code auto-save settings
5. Allocates random port (4000-6000)
6. Starts OpenVSCode Docker container
7. Creates room document in Appwrite
8. Adds owner as member
9. **Rollback on error**: Deletes workspace and room doc if any step fails

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing fields)
- `500` - Server error

---

#### 2. POST `/api/rooms/[roomId]/start`
Starts a stopped room's Docker container.

**Request:**
```
POST /api/rooms/abc123def45/start
```

**Response:**
```json
{
  "roomId": "abc123def45",
  "status": "running",
  "ideUrl": "http://localhost:5000",
  "port": 4532
}
```

**What it does:**
1. Fetches room from Appwrite
2. Checks if already running (early return if true)
3. Starts Docker container with stored port
4. Updates room status to "running"
5. Returns room with IDE URL

**Status Codes:**
- `200` - Success
- `400` - Bad request
- `404` - Room not found
- `500` - Container start failed

---

#### 3. POST `/api/rooms/[roomId]/stop`
Stops a running room's Docker container (workspace persists).

**Request:**
```
POST /api/rooms/abc123def45/stop
```

**Response:**
```json
{
  "roomId": "abc123def45",
  "status": "stopped"
}
```

**What it does:**
1. Fetches room from Appwrite
2. Stops Docker container
3. Updates room status to "stopped"
4. **Note:** Workspace is NOT deleted - it persists for restart

**Status Codes:**
- `200` - Success
- `400` - Bad request
- `404` - Room not found
- `500` - Container stop failed

---

#### 4. GET `/api/rooms/[roomId]/status`
Gets current room status and syncs with actual container state.

**Request:**
```
GET /api/rooms/abc123def45/status
```

**Response:**
```json
{
  "roomId": "abc123def45",
  "name": "My Project",
  "language": "javascript",
  "status": "running",
  "ideUrl": "http://localhost:5000",
  "port": 4532,
  "workspacePath": "/home/rohan/Documents/collabcode/workspaces/abc123def45",
  "createdAt": "2024-01-15T10:30:00Z",
  "lastActiveAt": "2024-01-15T11:45:00Z"
}
```

**What it does:**
1. Fetches room from Appwrite
2. Checks actual Docker container status
3. **Syncs if mismatch**: Updates DB if container state differs from DB state
4. Returns full room data

**Status Codes:**
- `200` - Success
- `400` - Bad request
- `404` - Room not found
- `500` - Status check failed

---

#### 5. GET `/api/rooms/list`
Lists all rooms for the current user.

**Request:**
```
GET /api/rooms/list
```

**Response:**
```json
{
  "rooms": [
    {
      "roomId": "abc123def45",
      "name": "My Project",
      "language": "javascript",
      "status": "running",
      "ideUrl": "http://localhost:5000",
      "port": 4532,
      "isPublic": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "lastActiveAt": "2024-01-15T11:45:00Z"
    }
  ]
}
```

**What it does:**
1. Queries Appwrite for all rooms by ownerId
2. Returns array of rooms with metadata

**Status Codes:**
- `200` - Success
- `500` - Query failed

**Note:** Currently returns rooms for ownerId="demo" (hardcoded). Should be updated to use authenticated user ID.

---

#### 6. POST `/api/rooms/[roomId]/join`
Adds a user as a member to an existing room.

**Request:**
```json
{
  "userId": "user456",
  "role": "member" // "member" | "editor" | "viewer"
}
```

**Response:**
```json
{
  "status": "ok",
  "roomId": "abc123def45",
  "userId": "user456",
  "role": "member"
}
```

**What it does:**
1. Validates room exists
2. Checks if member already exists
3. Adds member if not exists (idempotent)
4. Returns success status

**Status Codes:**
- `200` - Success
- `400` - Bad request (missing userId)
- `404` - Room not found
- `500` - Member add failed

---

### 📦 Helper Modules

All routes use these helper modules for clean, reusable code:

#### `src/appwrite/server.ts`
Initializes Appwrite Node SDK with API key authentication.

```typescript
import { databases, DATABASE_ID, ID } from "@/appwrite/server";

// Use in any helper:
const doc = await databases.createDocument(
  DATABASE_ID,
  "rooms",
  ID.unique(),
  roomData
);
```

#### `src/lib/workspaces.ts`
Manages local workspace folders and files.

**Functions:**
- `getRepoRoot()` - Returns absolute path to repo root
- `getWorkspacePath(roomId)` - Returns `/path/to/workspaces/<roomId>`
- `ensureWorkspace(roomId)` - Creates workspace folder
- `writeStarterFiles(roomId, language)` - Creates main.py/js/java
- `writeVSCodeSettings(roomId)` - Creates .vscode/settings.json with autosave
- `deleteWorkspace(roomId)` - Deletes workspace (used for rollback)

#### `src/lib/docker.ts`
Manages Docker container lifecycle for OpenVSCode.

**Functions:**
- `getRandomPort()` - Allocates random port (4000-6000)
- `startOpenVSCode(roomId, absWorkspacePath, port)` - Runs docker run
- `stopContainer(containerName)` - Stops container
- `isContainerRunning(containerName)` - Checks docker ps
- `getContainerPort(containerName)` - Gets mapped port from container

#### `src/lib/rooms.ts`
Appwrite CRUD operations for rooms and members.

**Functions:**
- `createRoomDoc(roomData)` - Creates rooms collection doc
- `getRoomByRoomId(roomId)` - Fetches single room
- `updateRoomStatus(roomId, status, updates?)` - Updates status + timestamps
- `deleteRoomDoc(roomId)` - Deletes room (for rollback)
- `addOwnerMember(roomId, ownerId)` - Adds owner as member
- `addMemberIfNotExists(roomId, userId, role)` - Adds member (idempotent)
- `listRoomsByOwner(ownerId)` - Queries rooms by owner

---

### 🗄️ Appwrite Collections

#### 1. `rooms` Collection
Stores room metadata and container info.

**Fields:**
- `roomId` (string) - Unique room identifier
- `name` (string) - Display name
- `language` (string) - Programming language (python/javascript/java)
- `ownerId` (string) - Room owner user ID
- `status` (string) - "running" | "stopped"
- `containerName` (string) - Docker container name
- `port` (number) - Mapped port (4000-6000)
- `ideUrl` (string) - Full IDE URL
- `workspacePath` (string) - Absolute path to workspace
- `isPublic` (boolean) - Whether room is discoverable
- `allowedUsers` (array) - List of allowed user IDs
- `maxUsers` (number) - Maximum concurrent members
- `lastActiveAt` (datetime) - Last activity timestamp
- `createdAt` (datetime) - Creation timestamp
- `updatedAt` (datetime) - Last update timestamp

#### 2. `room_members` Collection
Tracks users in each room.

**Fields:**
- `roomId` (string) - Associated room
- `userId` (string) - Member user ID
- `role` (string) - "owner" | "member" | "editor" | "viewer"
- `joinedAt` (datetime) - When user joined
- `lastSeenAt` (datetime) - Last activity timestamp

#### 3. `chat_messages` Collection (Optional)
Stores chat history.

**Fields:**
- `roomId` (string) - Associated room
- `userId` (string) - Message author
- `content` (string) - Message text
- `createdAt` (datetime) - Timestamp

#### 4. `activity_logs` Collection (Optional)
Tracks file activities.

**Fields:**
- `roomId` (string) - Associated room
- `userId` (string) - User who made change
- `action` (string) - "create" | "update" | "delete"
- `filePath` (string) - File path changed
- `createdAt` (datetime) - Timestamp

#### 5. `run_jobs` Collection (Optional)
Tracks code execution jobs.

**Fields:**
- `roomId` (string) - Associated room
- `userId` (string) - Job initiator
- `status` (string) - "pending" | "running" | "completed" | "failed"
- `output` (string) - Execution output
- `createdAt` (datetime) - Start time
- `completedAt` (datetime) - End time

---

### 🔑 Setup Instructions

**1. Get Appwrite API Key:**
- Go to https://cloud.appwrite.io/console
- Navigate to Settings → Security → API Keys
- Create a new API key with "databases.read, databases.write, databases.create"
- Copy the key

**2. Update `.env.local`:**
```bash
# In apps/web/.env.local
APPWRITE_API_KEY = "your_api_key_from_above"
```

**3. Create Appwrite Collections:**
The collections should already exist in the Appwrite console. If not, run:
```bash
bash setup-appwrite.sh
```

**4. Ensure Docker is running:**
```bash
docker ps
```

**5. Start the development servers:**
```bash
npm run dev:web      # Terminal 1: Frontend (localhost:3000)
npm run dev:socket   # Terminal 2: Socket.IO (localhost:3001)
```

---

### 🧪 Testing the API

**Create a room:**
```bash
curl -X POST http://localhost:3000/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Room", "language": "javascript", "isPublic": true}'
```

**List rooms:**
```bash
curl http://localhost:3000/api/rooms/list
```

**Get room status:**
```bash
curl http://localhost:3000/api/rooms/abc123def45/status
```

**Start room:**
```bash
curl -X POST http://localhost:3000/api/rooms/abc123def45/start
```

**Stop room:**
```bash
curl -X POST http://localhost:3000/api/rooms/abc123def45/stop
```

**Join room:**
```bash
curl -X POST http://localhost:3000/api/rooms/abc123def45/join \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123", "role": "member"}'
```

---

### 🛠️ Error Handling

All routes include:
- **Try/catch blocks** with detailed error logging
- **Validation** of required fields
- **404 handling** for missing resources
- **Rollback logic** for failed create operations
- **Idempotent operations** for safe retries (join, member add)
- **Status sync** (status route checks actual vs DB state)

---

### 📝 Code Structure

```
apps/web/
├── src/
│   ├── appwrite/
│   │   └── server.ts              # Appwrite Node SDK client
│   ├── lib/
│   │   ├── workspaces.ts          # Workspace folder management
│   │   ├── docker.ts              # Docker container operations
│   │   └── rooms.ts               # Appwrite CRUD helpers
│   └── [... other files]
├── app/
│   └── api/
│       └── rooms/
│           ├── create/
│           │   └── route.ts       # POST /api/rooms/create
│           ├── list/
│           │   └── route.ts       # GET /api/rooms/list
│           └── [roomId]/
│               ├── start/
│               │   └── route.ts   # POST /api/rooms/[roomId]/start
│               ├── stop/
│               │   └── route.ts   # POST /api/rooms/[roomId]/stop
│               ├── status/
│               │   └── route.ts   # GET /api/rooms/[roomId]/status
│               └── join/
│                   └── route.ts   # POST /api/rooms/[roomId]/join
```

---

### 🔄 Full Room Lifecycle

```
1. Create
   ├─ POST /api/rooms/create
   ├─ Creates workspace + writes starter files
   ├─ Allocates port + starts Docker
   └─ Creates room doc + adds owner

2. Join
   ├─ POST /api/rooms/[roomId]/join
   └─ Adds user as member

3. Status Check (Optional)
   ├─ GET /api/rooms/[roomId]/status
   ├─ Syncs DB with actual container state
   └─ Returns room data

4. Stop (Temporary)
   ├─ POST /api/rooms/[roomId]/stop
   ├─ Stops container (workspace persists)
   └─ Updates status to "stopped"

5. Restart
   ├─ POST /api/rooms/[roomId]/start
   ├─ Starts container again with same workspace
   └─ Updates status to "running"

6. Delete (Cleanup)
   ├─ Delete workspace manually
   └─ Delete room doc manually (or implement delete route)
```

---

### 🐛 Troubleshooting

**Collections don't exist:**
- Login to https://cloud.appwrite.io/console
- Create collections manually or use setup-appwrite.sh

**"No permissions provided":**
- Check APPWRITE_API_KEY is set in .env.local
- Verify collections have public read/write permissions
- Or create collections with proper permission rules

**Docker container won't start:**
- Ensure Docker daemon is running: `docker ps`
- Check port 4000-6000 range is available
- Check OpenVSCode image is available: `docker images | grep gitpod`

**Workspace not persisting:**
- Verify workspace folder exists: `ls -la workspaces/`
- Check file permissions: `ls -la workspaces/<roomId>`
- Verify absolute path resolution in getRepoRoot()

---

✅ **All 6 API routes fully implemented with error handling and production-ready patterns!**
