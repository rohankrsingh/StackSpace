# CollabCode API Reference

## Room Management APIs

All APIs are served from the Next.js app at `http://localhost:3000/api/`.

### 1. Create Room
**Endpoint:** `POST /api/rooms/create`

Creates a new room with:
- Generates unique room ID
- Creates local workspace folder
- Starts Docker OpenVSCode container
- Allocates port (4000-6000)

**Request:**
```bash
curl -X POST http://localhost:3000/api/rooms/create
```

**Response:**
```json
{
  "roomId": "abc123xyz",
  "status": "running",
  "ideUrl": "http://localhost:4000",
  "port": 4000,
  "containerName": "ovscode-abc123xyz"
}
```

**Status Codes:**
- `200` - Room created successfully
- `500` - Container startup failed

---

### 2. Get Room Status
**Endpoint:** `GET /api/rooms/[roomId]/status`

Gets current status of a room.

**Request:**
```bash
curl http://localhost:3000/api/rooms/abc123xyz/status
```

**Response:**
```json
{
  "roomId": "abc123xyz",
  "status": "running",
  "ideUrl": "http://localhost:4000",
  "containerName": "ovscode-abc123xyz",
  "port": 4000
}
```

**Response (When Stopped):**
```json
{
  "roomId": "abc123xyz",
  "status": "stopped",
  "ideUrl": "",
  "containerName": "ovscode-abc123xyz",
  "port": 4000
}
```

**Status Codes:**
- `200` - Room found
- `404` - Room not found

---

### 3. Stop Room
**Endpoint:** `POST /api/rooms/[roomId]/stop`

Stops the Docker container for a room. Workspace folder persists.

**Request:**
```bash
curl -X POST http://localhost:3000/api/rooms/abc123xyz/stop
```

**Response:**
```json
{
  "roomId": "abc123xyz",
  "status": "stopped"
}
```

**Effects:**
- Stops Docker container
- Workspace folder remains
- Room can be restarted later
- All files preserved

**Status Codes:**
- `200` - Room stopped successfully
- `500` - Stop failed

---

### 4. Start Room
**Endpoint:** `POST /api/rooms/[roomId]/start`

Starts a stopped room's container.

**Request:**
```bash
curl -X POST http://localhost:3000/api/rooms/abc123xyz/start
```

**Response:**
```json
{
  "roomId": "abc123xyz",
  "status": "running",
  "ideUrl": "http://localhost:4000",
  "port": 4000,
  "containerName": "ovscode-abc123xyz"
}
```

**Effects:**
- Restarts Docker container
- Mounts existing workspace
- All previous files still present
- May get different port if previous was taken

**Status Codes:**
- `200` - Room started successfully
- `404` - Room not found
- `500` - Start failed

---

## Socket.IO Events

The Socket.IO server runs on `http://localhost:3001`.

### Client → Server Events

#### `join-room`
Joins a collaboration room and announces presence.

```javascript
socket.emit('join-room', {
  roomId: 'abc123xyz',
  user: {
    id: 'user-456',
    name: 'Alice'
  }
});
```

#### `leave-room`
Leaves a room and removes presence.

```javascript
socket.emit('leave-room', {
  roomId: 'abc123xyz',
  userId: 'user-456'
});
```

#### `chat:send`
Sends a chat message to all users in the room.

```javascript
socket.emit('chat:send', {
  roomId: 'abc123xyz',
  message: 'Hello everyone!',
  user: {
    id: 'user-456',
    name: 'Alice'
  }
});
```

---

### Server → Client Events

#### `presence:list`
Broadcast when room joins or user updates.

```javascript
socket.on('presence:list', (data) => {
  console.log('Users in room:', data.users);
  // data.users = [{id: 'user-456', name: 'Alice'}, ...]
});
```

#### `presence:join`
Broadcast when a user joins the room.

```javascript
socket.on('presence:join', (data) => {
  console.log(`${data.user.name} joined`);
  // data.user = {id: 'user-456', name: 'Alice'}
  // data.ts = '2026-01-17T22:00:00.000Z'
});
```

#### `presence:leave`
Broadcast when a user leaves the room.

```javascript
socket.on('presence:leave', (data) => {
  console.log(`User ${data.userId} left`);
  // data.userId = 'user-456'
  // data.ts = '2026-01-17T22:00:00.000Z'
});
```

#### `chat:new`
Broadcast when a new chat message arrives.

```javascript
socket.on('chat:new', (data) => {
  console.log(`${data.user.name}: ${data.message}`);
  // data.id = '1705531200000'
  // data.message = 'Hello everyone!'
  // data.user = {id: 'user-456', name: 'Alice'}
  // data.ts = '2026-01-17T22:00:00.000Z'
});
```

#### `activity:new`
Broadcast when files change in the workspace.

```javascript
socket.on('activity:new', (data) => {
  console.log(`${data.type}: ${data.path}`);
  // data.id = '1705531200000'
  // data.type = 'file:update' | 'file:create' | 'file:delete'
  // data.path = 'src/main.py'
  // data.user = {id: 'system', name: 'System'}
  // data.ts = '2026-01-17T22:00:00.000Z'
});
```

---

## Example: Complete Flow

```javascript
import io from 'socket.io-client';

// Connect to Socket.IO server
const socket = io('http://localhost:3001');

const roomId = 'abc123xyz';
const user = { id: 'user-456', name: 'Alice' };

// Step 1: Join room
socket.emit('join-room', { roomId, user });

// Step 2: Listen for presence updates
socket.on('presence:list', (data) => {
  console.log('Online users:', data.users);
});

// Step 3: Listen for new messages
socket.on('chat:new', (data) => {
  console.log(`${data.user.name}: ${data.message}`);
});

// Step 4: Send a message
socket.emit('chat:send', {
  roomId,
  message: 'Hello from CollabCode!',
  user
});

// Step 5: Listen for file changes
socket.on('activity:new', (data) => {
  console.log(`File ${data.type}: ${data.path}`);
});

// Step 6: Leave room
socket.emit('leave-room', { roomId, userId: user.id });
socket.disconnect();
```

---

## Error Handling

### API Errors

```json
{
  "error": "Room not found"
}
```

### Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| Docker error: port already in use | Port conflict | Kill process on port: `lsof -i :4000` |
| Room not found (404) | Room ID doesn't exist | Create new room first |
| Failed to start container | Docker not running | Start Docker daemon |
| Socket connection refused | Socket server not running | Start socket server on 3001 |

---

## Rate Limiting

Currently no rate limiting. For production:
- Implement request throttling
- Add authentication
- Limit rooms per user
- Monitor Docker resource usage

---

## Database Integration (Optional)

Room metadata can be stored in Appwrite:

```
Database: collabcode_db
Collection: rooms

Fields:
- roomId (string, unique)
- status (string: "running" | "stopped")
- ideUrl (string)
- containerName (string)
- port (integer)
- language (string)
- workspacePath (string)
- createdAt (datetime)
- updatedAt (datetime)
```

Without Appwrite, metadata is stored in Docker container/env only.

---

## Deployment Notes

### For Production:

1. Replace `localhost` with actual domain
2. Use HTTPS/WSS for Socket.IO
3. Add authentication middleware
4. Implement database persistence
5. Add rate limiting
6. Use Redis for multi-server scaling
7. Configure proper CORS
8. Add error monitoring (Sentry, etc.)

### Environment Variables:

```env
NEXT_PUBLIC_SOCKET_URL=https://your-domain.com:3001
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://appwrite.your-domain.com/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
```

---

Built with ❤️ | CollabCode MVP
