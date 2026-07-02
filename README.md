<div align="center">

<img src="apps/web/public/icon.svg" width="80" height="80" alt="StackSpace Logo" />

# StackSpace

### **A full-stack, real-time collaborative cloud IDE — built from scratch.**

Code together in a real VS Code, in the cloud, from your browser. No setup. No installs. Just create a room, share a link, and start building.

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![AWS Fargate](https://img.shields.io/badge/AWS_Fargate-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/fargate/)
[![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)

</div>

---

## 🎬 Demo

> ⚠️ **Note:** The live deployment is currently offline — my free AWS tier expired. The video below shows the fully working project.

![StackSpace Demo](assets/demo.webm)

*Watch the full demo: room creation, launching a cloud IDE, real-time collaboration, whiteboard, and team chat — all running on AWS Fargate.*

---

## 🚀 What is StackSpace?

StackSpace lets you spin up a **full VS Code IDE in the cloud** inside an isolated Docker container, share it with teammates via a link, and collaborate in real time — complete with a synchronized whiteboard and built-in team chat.

Think of it as **your own private Repl.it**, but self-hosted on AWS and powered by the real VS Code.

- **No local installs** required for collaborators — just a browser
- **Full VS Code** experience (extensions, terminal, debugger, themes)
- **8 pre-configured language stacks** — from Python to C++
- **Persistent file storage** via AWS EFS — your code survives container restarts
- **Real-time presence** — see who's online, who's typing, who's in the room
- **Collaborative whiteboard** — draw diagrams together using Excalidraw, synced over WebSockets
- **Team chat** with file sharing — built-in, no need for a separate Slack window

---

## ✨ Features

### 🖥️ Cloud IDE (The Core)
- **Full OpenVSCode Server** running inside a Docker container on **AWS Fargate**
- Per-room isolated containers — each room gets its own compute
- Embedded directly inside the browser via `<iframe>`
- Container liveness detection — automatically shows "Start Room" if the container died
- **2-minute heartbeat** keeps idle containers from being shut down while you're active
- Multi-step loader with descriptive phases: "Allocating Fargate resources", "Starting VS Code backend", etc.

### 👥 Real-Time Collaboration
- **Socket.IO** server handles room presence, live user lists, and whiteboard sync
- **Knock-to-enter flow** — guests request to join, owner approves/rejects with a toast notification
- Owner/guest role separation baked into the socket layer
- Real-time reconnection handling — sockets re-register state on reconnect

### 🎨 Collaborative Whiteboard
- Powered by **Excalidraw** — the same whiteboard used by teams at major tech companies
- Changes broadcast in real-time over Socket.IO to all room members
- **1-second debounced persistence** to Appwrite DB — no data loss on refresh
- Remote-update loop prevention — your own changes don't echo back

### 💬 Team Chat
- Persistent chat history stored in **Appwrite Database** with Realtime subscriptions
- **File sharing** — upload and download any file type directly in chat
- Smart MIME type handling — `.docx`, `.xlsx`, `.pptx`, `.pdf` download correctly without renaming
- **Reply toasts** — get a non-intrusive popup when a teammate messages you while you're in the IDE
- Unread message badge on the chat dock icon

### 🛠️ 8 Language Stacks (Pre-configured IDE Environments)

Each stack is a custom Docker image with language tooling + VS Code extensions pre-installed:

| Stack | Runtime | Key Extensions |
|-------|---------|----------------|
| 🐍 **Python** | Python 3.12 | Pylance, Black formatter, isort |
| 🟢 **Node.js** | Node.js 20 LTS | ESLint, Prettier |
| ⚛️ **React + Vite** | Node.js 20 + Vite | ESLint, Prettier, Tailwind CSS |
| 🔺 **Next.js** | Node.js 20 + Next.js | ESLint, Prettier, Tailwind CSS, dotenv |
| ☕ **Java** | Eclipse Temurin JDK 21 | Java Extension Pack |
| ➕ **C++** | GCC on Debian Bookworm | clangd (LSP), CMake Tools |
| 🌐 **HTML/CSS/JS** | Node.js 20 | ESLint, Prettier |
| 📊 **DSA Practice** | Python 3.12 | Pylance, Black formatter |

### ⌨️ Keyboard Shortcuts
Full shortcut system built with a custom `useKeyboardShortcuts` hook (Ctrl+Alt to avoid VS Code conflicts):

| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+D` | Toggle Dock |
| `Ctrl+Alt+1` | Switch to IDE view |
| `Ctrl+Alt+2` | Switch to Whiteboard view |
| `Ctrl+Alt+C` | Open Chat panel |
| `Ctrl+Alt+U` | Open Users panel |
| `Ctrl+/` | Show shortcuts dialog |
| `Escape` | Close dock/dialog |

---

## 🏗️ Architecture

```
                          ┌─────────────────────┐
    Browser               │     Next.js App      │
    ──────                │   (Vercel / Self)    │
    User ──────────────►  │                      │
                          │  ┌───────────────┐   │
                          │  │  API Routes   │   │
                          │  │  /api/rooms/* │   │
                          │  └───────┬───────┘   │
                          └──────────┼───────────┘
                                     │
              ┌──────────────────────┼────────────────────────┐
              │                      │                        │
              ▼                      ▼                        ▼
    ┌─────────────────┐   ┌──────────────────┐   ┌──────────────────┐
    │   Appwrite Cloud│   │   AWS ECS Fargate │   │  Socket.IO Server│
    │                 │   │                  │   │  (Deployed on ECS│
    │  - Auth         │   │  Per-room Docker │   │   or standalone) │
    │  - Database     │   │  containers with │   │                  │
    │  - File Storage │   │  OpenVSCode      │   │  - Room presence │
    │  - Realtime     │   │  Server          │   │  - Whiteboard    │
    └─────────────────┘   └────────┬─────────┘   │  - Join requests │
                                   │              └──────────────────┘
                                   │ EFS Mount
                          ┌────────▼─────────┐
                          │    AWS EFS        │
                          │  (Persistent      │
                          │   workspace per   │
                          │   room)           │
                          └───────────────────┘
```

### Infrastructure
- **AWS ECS Fargate** — serverless container compute, one task per room
- **AWS EFS** — shared filesystem, workspace files persist across container restarts

- **AWS ECR** — private container registry for all language stack images
- **Vercel** — frontend and API routes deployment
- **Appwrite Cloud** — auth, database, realtime subscriptions, file storage

---

## 📁 Project Structure

```
stackspace/
├── apps/
│   ├── web/                   # Next.js 16 app (frontend + API)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── page.tsx          # Landing page
│   │   │   │   ├── dashboard/        # Room management dashboard
│   │   │   │   ├── room/[roomId]/    # The main collaborative room
│   │   │   │   └── api/
│   │   │   │       ├── rooms/        # Room CRUD, start/stop, status, ping
│   │   │   │       ├── auth/         # Auth endpoints
│   │   │   │       └── cron/         # Idle container cleanup cron
│   │   │   ├── components/
│   │   │   │   ├── room/             # Room UI (Whiteboard, Chat, JoinLobby)
│   │   │   │   ├── dashboard/        # Dashboard components
│   │   │   │   └── ui/               # Shadcn + HeroUI components
│   │   │   ├── templates/stacks.tsx  # All 8 stack definitions + starter files
│   │   │   ├── services/             # Docker, Appwrite service wrappers
│   │   │   ├── store/                # Redux slices (auth, chat)
│   │   │   └── hooks/                # useKeyboardShortcuts, etc.
│   │   └── package.json
│   │
│   └── socket-server/         # Standalone Socket.IO server (TypeScript)
│       └── src/
│           ├── server.ts             # HTTP + Socket.IO server setup
│           ├── socket.ts             # Room events, whiteboard sync
│           └── fileWatcher.ts        # File change notifications
│
├── docker/                    # Custom IDE Docker images per stack
│   ├── Dockerfile.python
│   ├── Dockerfile.nodejs
│   ├── Dockerfile.nextjs
│   ├── Dockerfile.java
│   ├── Dockerfile.cpp
│   └── build-and-push.sh      # Build + push all images to DockerHub & ECR
│
├── infra/                     # AWS infrastructure configuration (ECS, EFS, Security Groups)
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
│
└── assets/
    └── demo.webm              # Project demo video
```

---

## 🧰 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 16, React 19, TypeScript | App Router, server components, latest React |
| **Styling** | Tailwind CSS v4, HeroUI, Shadcn/UI | Rapid UI with polished components |
| **Animations** | Framer Motion / Motion | Smooth transitions and micro-interactions |
| **State** | Redux Toolkit | Predictable global state (auth, chat) |
| **Realtime** | Socket.IO | Bidirectional WebSocket events |
| **Auth & DB** | Appwrite Cloud | Auth, DB, File Storage, Realtime in one |
| **IDE Engine** | OpenVSCode Server | The real VS Code, open-source |
| **Containers** | Docker + AWS ECS Fargate | Serverless, per-room isolated containers |
| **Storage** | AWS EFS | Persistent workspace files, NFS-mounted |

| **Whiteboard** | Excalidraw | Best-in-class collaborative drawing |

| **Container Registry** | AWS ECR + Docker Hub | Multi-registry image distribution |

---

## 🚀 Running Locally

### Prerequisites

- Node.js 20+
- Docker (for running the IDE containers locally)
- An [Appwrite](https://appwrite.io) project (free tier works)

### 1. Clone & Install

```bash
git clone https://github.com/rohankrsingh/stackspace.git
cd stackspace
npm install
```

### 2. Configure Environment

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in your Appwrite credentials in `apps/web/.env.local`. See `.env.example` for all required variables.

### 3. Start Development Servers

```bash
# Start the Next.js app
npm run dev

# In another terminal, start the Socket.IO server
cd apps/socket-server
npm install
npm run dev
```

The app will be at `http://localhost:3000`.

> **Note:** For the IDE containers to work locally, Docker must be running. The app falls back gracefully if no containers are available.

---

## ☁️ Production Deployment

> The original deployment used AWS Fargate for containers and Vercel for the frontend. The free AWS tier has since expired, but the full setup is documented.

### High-Level Steps

1. **Frontend & API:** Deploy `apps/web` to Vercel
2. **Socket Server:** Deploy `apps/socket-server` to any Node.js host (ECS, Railway, Fly.io)
3. **AWS Infrastructure:** Set up ECS cluster, EFS filesystem, and security groups in AWS
4. **Docker Images:** Build and push all stack images using `docker/build-and-push.sh`


See `docs/` for detailed architecture notes and deployment guides.

---

## 📐 Design Decisions & Technical Highlights

**Why AWS Fargate instead of a single Docker host?**
Each room gets its own compute-isolated Fargate task. This means one user can't affect another room's resources, and there's no port conflict management needed.

**Why EFS for workspace storage?**
Fargate tasks are stateless — EFS provides a persistent NFS volume that survives container restarts and even task replacements, so your code is always there.

**Why Socket.IO for whiteboard sync instead of Appwrite Realtime?**
Lower latency for frequent updates (every canvas change). Appwrite Realtime is used for chat (less frequent, needs persistence) and Socket.IO for whiteboard (high-frequency, low-latency).

**Why OpenVSCode Server?**
It's the open-source core of VS Code (same codebase, open-source extensions via Open-VSX), maintained by Gitpod. It's the most mature self-hostable VS Code solution available.


---

## 🧑‍💻 About

Built entirely solo by **Rohan Kumar Singh** as a full-stack systems project — from custom Docker images to AWS cloud infrastructure to a polished Next.js UI.

This project covers:
- Containerized cloud compute management from a web app
- Real-time multi-user collaboration architecture
- Full-stack TypeScript development (frontend + backend + infra)
- DevOps: Docker image pipelines, AWS ECS, EFS, ECR

---

## 📄 License

MIT © 2026 Rohan Kumar Singh
