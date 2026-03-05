# StackSpace

A real-time collaborative coding platform with cloud-based IDE, whiteboard, and chat features.

## Features

- **Cloud IDE**: Browser-based VS Code powered by OpenVSCode Server
- **Real-time Collaboration**: Multiple users can code together simultaneously
- **Stack Templates**: Pre-configured environments for Python, Node.js, Java, C++, and more
- **Whiteboard**: Collaborative drawing and diagramming
- **Chat**: Built-in messaging for team communication
- **Workspaces**: Persistent file storage across sessions

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16, React, TypeScript |
| Styling | Tailwind CSS, HeroUI, Shadcn/UI |
| Realtime | Socket.IO |
| Auth & DB | Appwrite Cloud |
| IDE | OpenVSCode Server (Docker) |
| State | Redux Toolkit |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker
- Appwrite account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/stackspace.git
cd stackspace

# Install dependencies
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your Appwrite credentials

# Start development server
npm run dev
```

### Environment Variables

See `apps/web/.env.example` for all required variables.

## Project Structure

```
stackspace/
├── apps/
│   ├── web/              # Next.js frontend + API
│   └── socket-server/    # Socket.IO realtime server
├── docker/               # Dockerfiles for IDE containers
├── docs/                 # Documentation
│   ├── architecture/     # System design docs
│   └── guides/           # Setup and usage guides
└── workspaces/           # Local workspace storage (gitignored)
```

## Available Stacks

| Stack | Description |
|-------|-------------|
| Python Basic | Python 3.12 with pip |
| Node.js Basic | Node.js 20 LTS |
| React + Vite | Modern React with Vite bundler |
| Next.js | Full-stack Next.js 14 |
| Java Basic | OpenJDK 21 (Temurin) |
| C++ Basic | g++ on Debian Bookworm |
| HTML/CSS/JS | Vanilla web starter |
| DSA Practice | Algorithm practice template |

## Deployment

See [docs/deployment.md](docs/deployment.md) for production deployment guide.

### Local Development

```bash
npm run dev
```

### Production (Vercel + AWS)

1. Deploy frontend to Vercel
2. Set up AWS ECS for containers
3. Configure orchestrator service

## Documentation

- [System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)
- [API Reference](docs/architecture/API_REFERENCE.md)
- [Deployment Guide](docs/deployment.md)
- [Quick Start Testing](docs/guides/QUICK_START_TESTING.md)

## License

MIT
