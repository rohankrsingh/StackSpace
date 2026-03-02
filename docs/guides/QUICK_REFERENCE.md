# CollabCode MVP - Quick Reference

## 🚀 Start Both Servers (Copy & Paste)

### Terminal 1 - Frontend
```bash
cd /home/rohan/Documents/collabcode/apps/web && npm run dev
```
→ Opens: http://localhost:3000

### Terminal 2 - Socket Server
```bash
cd /home/rohan/Documents/collabcode/apps/socket-server && npm run dev
```
→ Runs on: http://localhost:3001

---

## 🌐 Quick URLs

| Page | URL |
|------|-----|
| **Landing** | http://localhost:3000 |
| **Dashboard** | http://localhost:3000/dashboard |
| **Room** | http://localhost:3000/room/[roomId] |
| **Socket.IO** | http://localhost:3001 |

---

## 📁 Key Files to Know

```
Frontend (Next.js):
├── app/page.tsx              # Landing page
├── app/dashboard/page.tsx    # Dashboard
├── app/room/[roomId]/page.tsx # Room page with chat/presence
├── src/store/                # Redux store (4 slices)
└── src/lib/docker.ts         # Docker utilities

Backend (Socket.IO):
└── apps/socket-server/index.js # Main server file

Utilities:
├── README.md                 # Full setup guide
├── API_REFERENCE.md          # API documentation
├── BUILD_SUMMARY.md          # What was built
└── ACCEPTANCE_CHECKLIST.md   # Verification
```

---

## 🎯 Test Flow (5 Minutes)

1. Start both servers (terminals above)
2. Visit http://localhost:3000
3. Click "Get Started"
4. Click "Create New Room"
5. See room page open
6. Copy room link
7. Open in new tab/window
8. See presence update
9. Send chat message
10. Presence shows in both tabs

---

## 🏗️ Tech Stack at a Glance

| Layer | Tech |
|-------|------|
| **Frontend Framework** | Next.js 14 + React |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **State** | Redux Toolkit |
| **UI Components** | shadcn/ui, Aceternity, Kokonut |
| **Icons** | Lucide React |
| **Real-time** | Socket.IO |
| **IDE** | OpenVSCode (Docker) |
| **Storage** | Local filesystem |
| **Database** | Appwrite (optional) |

---

## 🔗 Important Environment Variables

File: `apps/web/.env.local`

```env
# Socket.IO Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Appwrite (optional)
NEXT_PUBLIC_APPWRITE_ENDPOINT=http://localhost/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=collabcode
```

---

## 📊 Redux Store Structure

```javascript
store = {
  room: {
    currentRoom,      // Current room data
    loading,          // Loading state
    error             // Error messages
  },
  chat: {
    messages[]        // Chat messages
  },
  activity: {
    activities[]      // File change activities
  },
  auth: {
    user,             // Current user
    isAuthenticated
  }
}
```

---

## 🔌 Socket.IO Quick Events

```javascript
// Emit (client → server)
socket.emit('join-room', { roomId, user })
socket.emit('leave-room', { roomId, userId })
socket.emit('chat:send', { roomId, message, user })

// Listen (server → client)
socket.on('presence:list', (data) => {})
socket.on('presence:join', (data) => {})
socket.on('presence:leave', (data) => {})
socket.on('chat:new', (data) => {})
socket.on('activity:new', (data) => {})
```

---

## 📦 Dependencies Quick Reference

### Frontend (apps/web/package.json)
```json
{
  "next": "^16.1.3",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.0.0",
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0",
  "socket.io-client": "^4.7.2",
  "lucide-react": "latest",
  "@heroui/react": "latest",
  "shadcn-ui": "latest"
}
```

### Backend (apps/socket-server/package.json)
```json
{
  "socket.io": "^4.7.2",
  "cors": "^2.8.5",
  "chokidar": "^3.5.3"
}
```

---

## 🐛 Common Commands

```bash
# Install everything
cd /home/rohan/Documents/collabcode
npm install && npm install --workspaces

# Frontend only
cd apps/web
npm install
npm run dev         # Dev mode
npm run build       # Production build
npm run lint        # Lint code

# Socket server
cd ../socket-server
npm install
npm run dev         # Start server

# View workspace files
ls -la ./workspaces/

# Docker check
docker ps           # See running containers
docker logs ovscode-ROOMID
```

---

## ⚠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3000 in use | Use 3001 instead (auto-fallback) |
| Docker: port bind fail | `lsof -i :4000` then kill process |
| Socket.IO not connecting | Ensure socket server on 3001 |
| Build fails TypeScript | Run `npm run build` to see errors |
| Workspace not persisting | Check `.gitignore` includes `workspaces/` |
| Docker image not found | `docker pull gitpod/openvscode-server:latest` |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Setup + features overview |
| **BUILD_SUMMARY.md** | What was built + architecture |
| **API_REFERENCE.md** | All APIs + Socket.IO events |
| **ACCEPTANCE_CHECKLIST.md** | Verification checklist |
| **QUICK_REFERENCE.md** | This file! |

---

## 🎨 UI Components Used

**shadcn/ui Components:**
- Button, Input, Card, Badge
- Tabs, Dialog, Textarea
- Separator, DropdownMenu, Sheet

**Aceternity UI:**
- BackgroundBeams (landing bg)
- Spotlight (landing effect)

**Kokonut UI:**
- DashboardLayout (sidebar + topbar)
- Sidebar, SidebarItem

**Lucide Icons:**
- Code2, Users, Zap, Copy, MessageSquare
- Activity, Power, LogOut, Loader2, etc.

---

## 📊 File Statistics

```
Total Size: ~3,500+ lines of code
Components: 15+ UI components
Pages: 3 (landing, dashboard, room)
APIs: 4 (create, status, start, stop)
Store Slices: 4 (room, chat, activity, auth)
Socket Events: 8 (presence, chat, activity)
```

---

## 🎯 MVP Limitations

- ❌ No authentication/login
- ❌ No database persistence
- ❌ Single machine only
- ❌ No HTTPS/SSL
- ❌ No rate limiting
- ❌ Activity only in memory

For production, add:
- ✅ User authentication
- ✅ Full database backend
- ✅ Redis + scaling
- ✅ SSL/TLS certificates
- ✅ Rate limiting
- ✅ Error monitoring

---

## 💡 Pro Tips

1. **Room IDs** are 10-char nanoid (e.g., `abc123xyz9`)
2. **Workspaces** stored in `./workspaces/<roomId>/`
3. **Docker containers** named `ovscode-<roomId>`
4. **Ports** auto-allocated 4000-6000
5. **Chat messages** stored in Redux (cleared on refresh)
6. **Activity** auto-generated from file watcher
7. **Presence** per-room, multi-tab aware

---

## 🚀 Deploy Checklist

- [ ] Setup authentication
- [ ] Connect real database
- [ ] Add HTTPS/WSS
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Setup monitoring
- [ ] Configure backups
- [ ] Test on staging
- [ ] Document API
- [ ] Setup logging

---

## 📞 Support

For issues:
1. Check terminal output
2. Review documentation files
3. Check Docker logs: `docker logs <container-id>`
4. Verify ports available: `lsof -i :3000` `lsof -i :3001`
5. Test Socket.IO: Open DevTools → Console

---

**Built with ❤️ by GitHub Copilot | CollabCode MVP**
