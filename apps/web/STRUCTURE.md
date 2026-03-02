# 📁 CollabCode - Scalable Project Structure

## Directory Structure

```
apps/web/
├── src/
│   ├── appwrite/              # Backend services & Appwrite integration
│   │   ├── config.ts          # (legacy - use index.ts)
│   │   └── index.ts           # AppwriteService class
│   │
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # UI primitives (shadcn/ui components)
│   │   ├── layouts/           # Layout components (Dashboard, Hero, etc.)
│   │   └── forms/             # Form components
│   │
│   ├── conf/                  # Configuration files
│   │   └── conf.ts            # Centralized config (env variables)
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── index.ts           # useCopyToClipboard, useLocalStorage, etc.
│   │
│   ├── lib/                   # Utility functions
│   │   └── utils.ts           # General utilities
│   │
│   ├── services/              # Business logic services
│   │   ├── docker.ts          # Docker container management
│   │   └── socket.ts          # Socket.IO client
│   │
│   ├── store/                 # Redux state management
│   │   ├── index.ts           # Store configuration
│   │   └── slices/            # Redux slices (room, chat, activity, auth)
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Room, User, ChatMessage, Activity types
│   │
│   └── app/                   # Next.js app router
│       ├── page.tsx           # Landing page
│       ├── dashboard/         # Dashboard routes
│       ├── room/              # Room routes
│       ├── api/               # API routes
│       ├── layout.tsx         # Root layout
│       └── providers.tsx      # Redux provider
│
├── components/                # (old - migrate to src/components)
├── public/                    # Static files
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

## Best Practices

### 1. **Services** (`src/services/`)
Encapsulate business logic for features like Docker or Socket.IO:

```typescript
// src/services/docker.ts
export class DockerService {
  async startContainer(roomId: string) { }
  async stopContainer(roomId: string) { }
}

export const dockerService = new DockerService();
```

### 2. **Appwrite** (`src/appwrite/`)
Centralize all Appwrite operations:

```typescript
// src/appwrite/index.ts
export class AppwriteService {
  async createRoom(roomId: string, data: any) { }
  async getRoom(roomId: string) { }
}

export const appwriteService = new AppwriteService();
```

### 3. **Types** (`src/types/`)
Define all TypeScript interfaces centrally:

```typescript
// src/types/index.ts
export interface Room { roomId: string; status: "running" | "stopped"; }
export interface User { id: string; name: string; }
```

### 4. **Configuration** (`src/conf/`)
Manage all environment variables:

```typescript
// src/conf/conf.ts
const conf = {
  appwriteEndpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
};
```

### 5. **Components** (`src/components/`)
Organize by category:
- `ui/` - shadcn/ui primitives
- `layouts/` - Page layouts
- `forms/` - Form components

### 6. **Hooks** (`src/hooks/`)
Create reusable custom hooks:

```typescript
// src/hooks/index.ts
export function useCopyToClipboard() { }
export function useLocalStorage<T>(key: string, initial: T) { }
```

## Migration Path

1. ✅ Create new directory structure
2. ✅ Move files to appropriate locations
3. ⏳ Update imports in existing files
4. ⏳ Create index.ts files for easy imports
5. ⏳ Deprecate old locations

## Import Examples

**Before (Scattered):**
```typescript
import { appwriteService } from "@/src/lib/appwrite";
import { startContainer } from "@/src/lib/docker";
```

**After (Organized):**
```typescript
import { appwriteService } from "@/appwrite";
import { dockerService } from "@/services/docker";
import { Room, User } from "@/types";
import conf from "@/conf/conf";
```

## Next Steps

1. Update all imports in API routes to use new paths
2. Update all imports in page components
3. Create additional services as needed
4. Add more hooks for common patterns
5. Document component usage
