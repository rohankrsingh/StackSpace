# Stack Templates Feature - Implementation Guide

## Overview

When users click "Create Room" on the dashboard, they see a beautiful modal dialog to choose from popular programming stacks/templates instead of creating a blank room.

## Architecture

### 1. Data Model - StackTemplate

Located in `src/templates/stacks.ts`:

```typescript
type StackTemplate = {
  id: string;                    // "python-basic"
  name: string;                  // "Python (Basic)"
  description: string;           // Shown in UI
  tags: string[];                // ["Beginner", "DSA"]
  language: string;              // "python", "javascript", etc
  icon: string;                  // Emoji for UI
  files: Record<string, string>; // path -> file content
  run?: {
    entryFile: string;
    command?: string;
  };
};
```

### 2. Available Stacks

```
✅ Python (Basic)      - Simple Python starter
✅ Node.js (Basic)     - Express-ready Node
✅ React + Vite        - Modern frontend
✅ Next.js             - Full-stack React
✅ Java (Basic)        - Java starter
✅ C++ (Basic)         - C++ with iostream
✅ HTML/CSS/JS         - Vanilla web
✅ DSA Practice        - Coding interview prep
```

Each stack includes pre-configured files and run instructions.

## Component Architecture

### CreateRoomDialog Component

**Location**: `src/components/rooms/CreateRoomDialog.tsx`

**Features**:
- Search/filter stacks by name, description, or tags
- Stack cards grid with icons and badges
- Preview panel showing:
  - Language
  - List of starter files
  - Entry file highlighted
  - Run command
- Room name input
- Create/Cancel buttons

**Props**:
```typescript
interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRoom: (stackId: string, roomName: string) => Promise<void>;
  loading?: boolean;
}
```

**Usage**:
```tsx
<CreateRoomDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  onCreateRoom={handleCreateRoom}
  loading={isCreating}
/>
```

## Backend Flow

### API Route: `/api/rooms/create`

**Updated to handle**:
```typescript
{
  stackId: "python-basic",
  roomName: "My Python Project",
  isPublic: true
}
```

**Process**:
1. Validate stackId against available stacks
2. Create workspace directory
3. Write all template files to workspace
4. Create VS Code settings
5. Allocate port
6. Start Docker container
7. Create Appwrite room document with stackId
8. Add owner as member
9. Return room details

**Error Handling**:
- Invalid stackId → return 400 error
- File write fails → rollback everything
- Docker fails → rollback room doc and workspace

### New Helper Function

**Function**: `writeTemplateFiles(roomId, stack)`

**Location**: `src/lib/workspaces.ts`

**Responsibility**:
- Create nested directories as needed
- Write all files from stack.files to workspace
- Handles any directory structure

**Example**:
```typescript
// For Next.js stack with files:
// app/page.tsx
// app/layout.tsx
// package.json
// tsconfig.json

writeTemplateFiles(roomId, nextjsStack)
// Creates: /workspaces/<roomId>/app/page.tsx, etc
```

## Database Changes

### Rooms Collection - New Field

Added `stackId` field to room documents:

```typescript
{
  roomId: "room_xxxxx",
  name: "My Python Project",
  language: "python",
  stackId: "python-basic",  // NEW - tracks which template was used
  ownerId: "user_id",
  status: "running",
  containerName: "...",
  port: 5000,
  ideUrl: "http://localhost:5000",
  // ... other fields
}
```

**Benefits**:
- Track which stack was used for reporting
- Recreate room from template if needed
- Analytics on popular stacks

## User Flow

```
User clicks "Create Room" button
        ↓
Dialog opens with stack selection
        ↓
User sees:
  - Search bar
  - 8 stack cards
  - Preview panel (when selected)
        ↓
User:
  1. Searches or browses stacks
  2. Clicks a stack card
  3. Sees preview on right
  4. Enters room name
  5. Clicks "Create Room"
        ↓
Frontend:
  - Show loading state
  - POST to /api/rooms/create
        ↓
Backend:
  - Validate stack
  - Create workspace with template files
  - Start Docker
  - Create Appwrite doc
        ↓
Frontend:
  - Redirect to /room/<roomId>
  - User sees IDE with starter files
        ↓
Done! User ready to code
```

## File Structure After Room Creation

### Example: Python Room

```
/workspaces/room_xxx/
├── main.py          # Main entry file
├── README.md        # Instructions
└── .vscode/
    └── settings.json # Auto-save config
```

### Example: Next.js Room

```
/workspaces/room_xxx/
├── app/
│   ├── page.tsx
│   └── layout.tsx
├── package.json
├── tsconfig.json
├── next.config.js
└── .vscode/
    └── settings.json
```

## UI/UX Details

### Stack Card Design

```
┌─────────────────────────────────┐
│ 🐍 Python (Basic)               │
│    Simple Python starter         │
│                                  │ ← Hover: border changes
│    [Beginner] [Python]           │ ← Click: Select
│                                  │ ← Shows checkmark if selected
└─────────────────────────────────┘
```

### Preview Panel

```
Stack Details
─────────────

Language
  Python

Files
  ├─ main.py (entry, highlighted)
  └─ README.md

Entry File
  main.py

Run Command
  python main.py
```

### Modal Responsiveness

- Desktop: 3-column layout (search + cards + preview)
- Mobile: Stack cards full width, preview below

## Implementation Checklist

- [x] Create `src/templates/stacks.ts` with 8 stacks
- [x] Add `StackTemplate` type
- [x] Create `CreateRoomDialog` component
- [x] Add stack card grid with search
- [x] Add preview panel
- [x] Implement `writeTemplateFiles()` function
- [x] Update `/api/rooms/create` to handle stackId
- [x] Update `createRoomDoc()` to include stackId
- [x] Update dashboard to use dialog
- [x] Add stackId to Appwrite rooms collection

## Testing Checklist

- [ ] Click "Create Room" → Dialog opens
- [ ] Search filters stacks by name
- [ ] Search filters stacks by tag
- [ ] Click stack card → Shows preview
- [ ] Checkmark appears on selected stack
- [ ] Enter room name → Button enabled
- [ ] Click "Create Room" → Loading state
- [ ] Room created with correct stack
- [ ] Workspace has all template files
- [ ] VS Code shows starter files
- [ ] Can modify and save files
- [ ] Room data includes stackId in DB

## Adding New Stacks

Easy to add more stacks to `src/templates/stacks.ts`:

```typescript
{
  id: "rust-basic",
  name: "Rust (Basic)",
  description: "Rust starter with Cargo",
  tags: ["Rust", "Systems", "Memory-safe"],
  language: "rust",
  icon: "🦀",
  files: {
    "Cargo.toml": `[package]
name = "rust-basic"
version = "0.1.0"
edition = "2021"
`,
    "src/main.rs": `fn main() {
  println!("Hello from Rust!");
}
`,
  },
  run: {
    entryFile: "src/main.rs",
    command: "cargo run",
  },
}
```

## Benefits

✅ **Better UX**: Users don't see empty folders
✅ **Faster onboarding**: Pre-configured starters
✅ **Less cognitive load**: Choose → Code → Go
✅ **Discoverable**: See popular languages
✅ **Reproducible**: Same stack = same environment
✅ **Trackable**: Know what stacks users choose
✅ **Scalable**: Easy to add new templates

## Future Enhancements

1. **Custom Templates**: Let teams create their own stacks
2. **Template Marketplace**: Share templates with community
3. **.gitignore**: Include for each stack
4. **Dependencies**: Pre-install common packages
5. **Dockerfiles**: Customize Docker per stack
6. **Run Configurations**: Multiple run options per stack
7. **Stack Preview**: Show file contents before creating
8. **Favorites**: Users bookmark preferred stacks
9. **Templates from GitHub**: Import from community repos
10. **Stack History**: Recent stacks for quick access

## Performance Notes

- Stacks defined in code (not DB) → Fast lookup
- Template files inlined → No network calls
- File creation optimized → Batch write
- Dialog only loads when opened → Lazy UI

## Security Considerations

- ✅ Stack IDs validated against known list
- ✅ No arbitrary file paths (whitelist via stack definition)
- ✅ File content safe (no executable scripts in template)
- ✅ Docker isolation still applies

---

This feature makes StackSpace feel like Replit - users see curated options instead of blank rooms. Clean, professional, and ready to code!
