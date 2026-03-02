# CollabCode Deployment Guide

This guide covers deploying CollabCode to production using Vercel and AWS.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Vercel        │     │  AWS Orchestrator│     │  AWS ECS        │
│   (Frontend)    │────▶│  (Node.js)       │────▶│  (Containers)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                                                 │
         ▼                                                 ▼
┌─────────────────┐                              ┌─────────────────┐
│   Appwrite      │                              │   AWS EFS       │
│   (Auth + DB)   │                              │   (Storage)     │
└─────────────────┘                              └─────────────────┘
```

## Deployment Modes

### 1. Local Development (Default)

No `ORCHESTRATOR_URL` set - uses local Docker.

```bash
# Start development server
npm run dev

# API routes will use local Docker commands
```

### 2. Production (Vercel + AWS)

Set `ORCHESTRATOR_URL` to your AWS orchestrator endpoint.

```bash
ORCHESTRATOR_URL=https://orchestrator.collabcode.io
```

## Phase 1: Deploy to Vercel

### Prerequisites

1. GitHub repository
2. Vercel account
3. Appwrite Cloud project

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git remote add origin https://github.com/your-username/collabcode.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `apps/web`

3. **Configure Environment Variables**

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `NEXT_PUBLIC_APPWRITE_ENDPOINT` | `https://cloud.appwrite.io/v1` | Appwrite API |
   | `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Your project ID | From Appwrite Console |
   | `APPWRITE_API_KEY` | Server API key | Create in API Keys section |
   | `APPWRITE_DATABASE_ID` | `main` | Your database ID |
   | `ORCHESTRATOR_URL` | (empty for now) | AWS orchestrator URL |

4. **Deploy**
   - Vercel will automatically deploy on push to main

### Testing Without Orchestrator

While `ORCHESTRATOR_URL` is empty:
- Room creation will fail (no local Docker on Vercel)
- Other features (auth, dashboard) will work

Set up mock responses or proceed to Phase 4 for the orchestrator.

## API Routes Updated

The following routes now use the orchestrator abstraction:

| Route | Mode Decision |
|-------|---------------|
| `POST /api/rooms/create` | Orchestrator for container start |
| `POST /api/rooms/[roomId]/start` | Orchestrator for restart |
| `POST /api/rooms/[roomId]/stop` | Orchestrator for stop |
| `GET /api/rooms/[roomId]/status` | Orchestrator for status check |
| `DELETE /api/rooms/[roomId]/delete` | Orchestrator for removal |
| `POST /api/rooms/[roomId]/ping` | Updates activity timestamp |

## Orchestrator Client

Location: `apps/web/src/lib/orchestrator.ts`

The client automatically switches between:
- **Local mode**: Direct Docker commands (when `ORCHESTRATOR_URL` is empty)
- **Production mode**: HTTP calls to AWS orchestrator

## Next Steps

1. **Phase 2**: Prepare Docker images for AWS ECR
2. **Phase 3**: Set up AWS infrastructure (ECS, EFS, ALB)
3. **Phase 4**: Build and deploy the orchestrator service
4. **Phase 5**: Connect Vercel to orchestrator
