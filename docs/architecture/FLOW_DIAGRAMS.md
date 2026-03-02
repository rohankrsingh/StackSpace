# CollabCode - Complete Flow Diagrams

## 1. Authentication & Room Access Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER JOURNEY                               │
└─────────────────────────────────────────────────────────────────┘

NEW USER
│
├─► http://localhost:3000 (Homepage)
│   └─► Not authenticated?
│       ├─ REDIRECT to dashboard ✗
│       └─ Show landing page ✓
│
├─► Click "Sign Up"
│   └─► /auth/signup page
│       ├─ Fill form: name, email, password, confirm
│       ├─ Validate locally
│       └─ Submit
│           ├─ dispatch(signUp({email, password, name}))
│           ├─ lib/auth.ts: createAccount() → Appwrite
│           ├─ lib/auth.ts: login() → Appwrite session
│           ├─ Redux: store user, set isAuthenticated=true
│           └─ Auto-redirect to /dashboard
│
├─► /dashboard [Protected Route]
│   ├─ ProtectedRoute checks Redux.auth.isAuthenticated
│   ├─ Yes? Show dashboard ✓
│   ├─ No? Redirect to /auth/signin
│   └─ Dashboard shows:
│       ├─ User name in sidebar ✓
│       ├─ "Create Room" button
│       ├─ "Join Room" input
│       └─ "Sign Out" button
│
└─► Create or Join Room
    └─► /room/[roomId] [Protected Route]
        ├─ ProtectedRoute checks auth
        ├─ Show IDE + chat + users + activity
        ├─ Socket.IO joins room with auth.user
        └─ Real-time collaboration with authenticated user


RETURNING USER
│
├─► http://localhost:3000 (or refresh page)
│   ├─ AuthProvider.tsx calls dispatch(checkAuth())
│   ├─ lib/auth.ts: getCurrentUser() → Appwrite
│   ├─ Appwrite returns current session user
│   ├─ Redux: store user, set isAuthenticated=true
│   └─ App redirects to /dashboard
│       └─ User stays logged in ✓
│
└─► Sign Out
    ├─ Click "Sign Out" button
    ├─ dispatch(signOut())
    ├─ lib/auth.ts: logout() → Appwrite deletes session
    ├─ Redux: clear user, set isAuthenticated=false
    └─ Redirect to /auth/signin
        └─ Must login again to access dashboard
```

## 2. Redux State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    REDUX STORE STRUCTURE                        │
└─────────────────────────────────────────────────────────────────┘

store
├── auth (authSlice)
│   ├── user: {
│   │   ├── id: "user_uuid_from_appwrite"
│   │   ├── name: "John Doe"
│   │   └── email: "john@example.com"
│   │}
│   ├── loading: boolean (true while API call)
│   ├── error: string | null (error message)
│   └── isAuthenticated: boolean
│
├── chat (chatSlice)
│   └── messages: [{id, user, message, ts}, ...]
│
└── activity (activitySlice)
    └── activities: [{id, user, type, path, ts}, ...]


STATE TRANSITIONS

signUp.pending
├── loading = true
├── error = null
└── isAuthenticated = false

signUp.fulfilled
├── loading = false
├── user = {...from Appwrite}
├── error = null
└── isAuthenticated = true

signUp.rejected
├── loading = false
├── user = null
├── error = "error message"
└── isAuthenticated = false


COMPONENTS USING AUTH STATE

useSelector(state => state.auth.isAuthenticated)
└── ProtectedRoute (allows/blocks access)
└── Layout (shows user name or login button)
└── Dashboard (shows user name + sign out)
└── Room (uses auth.user.id and auth.user.name)


DISPATCHING AUTH ACTIONS

dispatch(signUp({email, password, name}))
dispatch(signIn({email, password}))
dispatch(checkAuth())
dispatch(signOut())
dispatch(clearError())
```

## 3. Request Flow Diagrams

```
SIGN UP REQUEST
┌──────────────┐
│   User Form  │
└──────┬───────┘
       │ submit
       ▼
┌──────────────────────────┐
│ authSlice.signUp thunk   │
└──────┬───────────────────┘
       │ dispatch
       ▼
┌──────────────────────────┐
│  lib/auth.ts             │
├──────────────────────────┤
│ 1. createAccount()       │──► Appwrite Account API
│    - Creates user        │    POST /users
│    - Returns user object │
│                          │
│ 2. login()               │──► Appwrite Account API
│    - Creates session     │    POST /sessions
│    - Returns session obj │
│                          │
│ 3. getCurrentUser()      │──► Appwrite Account API
│    - Gets user with      │    GET /users/me
│      current session     │
│    - Returns user object │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Redux authSlice         │
├──────────────────────────┤
│ fulfilled:               │
│ - user = {from Appwrite} │
│ - isAuthenticated = true │
│ - loading = false        │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Component Updates       │
├──────────────────────────┤
│ - Dashboard renders      │
│ - Shows user name        │
│ - Can create rooms       │
└──────────────────────────┘


CHECK AUTH REQUEST (On App Load)
┌──────────────┐
│ App.tsx load │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  AuthProvider            │
└──────┬───────────────────┘
       │ useEffect on mount
       ▼
┌──────────────────────────┐
│ dispatch(checkAuth())    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ authSlice.checkAuth      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ lib/auth.getCurrentUser()│──► Appwrite Account API
│                          │    GET /users/me
│ If session exists:       │
│ ├─ Return user object    │
│ └─ fulfilled             │
│                          │
│ If no session:           │
│ ├─ Return null           │
│ └─ rejected              │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Redux Update            │
├──────────────────────────┤
│ fulfilled:               │
│ - user = {from Appwrite} │
│ - isAuthenticated = true │
│                          │
│ rejected:                │
│ - user = null            │
│ - isAuthenticated = false│
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Route Decision          │
├──────────────────────────┤
│ If authenticated:        │
│ └─ Redirect /dashboard   │
│                          │
│ If not authenticated:    │
│ └─ Show /auth/signin     │
└──────────────────────────┘


ROOM CREATION WITH AUTH
┌──────────────┐
│ User clicks  │
│ "Create Room"│
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│ dashboard/page.tsx               │
│ handleCreateRoom()               │
└──────┬───────────────────────────┘
       │ POST /api/rooms/create
       │ body: {name, language, isPublic}
       │ + auth.user.id as ownerId (backend)
       ▼
┌──────────────────────────────────┐
│ Backend: /api/rooms/create       │
├──────────────────────────────────┤
│ 1. Generate roomId               │
│ 2. Create Appwrite document      │
│    - roomId                      │
│    - ownerId (from auth.user.id) │
│    - name, language, isPublic    │
│ 3. Create workspace folder       │
│    - /workspaces/<roomId>        │
│ 4. Create Docker container       │
│    - Mount workspace             │
│    - Port allocation             │
│ 5. Update Appwrite with port     │
│ 6. Return ideUrl + status        │
└──────┬───────────────────────────┘
       │ Response: {roomId, ideUrl, status}
       ▼
┌──────────────────────────────────┐
│ Frontend: room/[roomId]/page.tsx │
├──────────────────────────────────┤
│ 1. useSelector(auth.user)        │
│ 2. Socket.IO emit("join-room")   │
│    - roomId                      │
│    - user: {                     │
│        id: auth.user.id,         │
│        name: auth.user.name      │
│      }                           │
│ 3. Render IDE                    │
│ 4. Show user in presence panel   │
└──────────────────────────────────┘
```

## 4. Security & Access Control Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  ACCESS CONTROL FLOW                            │
└─────────────────────────────────────────────────────────────────┘

UNAUTHENTICATED USER TRIES TO ACCESS /dashboard

User directly navigates to /dashboard
│
▼
ProtectedRoute component runs
├─ Check Redux: state.auth.isAuthenticated
│
├─► FALSE (not authenticated)
│   ├─ useRouter.push("/auth/signin")
│   └─ User redirected away ✓
│
└─► TRUE (authenticated)
    ├─ Render dashboard
    └─ Access granted ✓


AUTHENTICATED USER ACCESSES /dashboard

User navigates to /dashboard (or redirected there after signin)
│
▼
ProtectedRoute component runs
├─ Check Redux: state.auth.isAuthenticated = true
│
▼
Dashboard rendered
├─ useSelector(auth.user) gets authenticated user
├─ Show user name in sidebar
├─ Can click "Create Room"
├─ Can click "Sign Out" (clears auth state)
└─ Full access ✓


UNAUTHENTICATED USER TRIES TO CREATE ROOM

Bypass frontend protection (edit JavaScript in console)
│
▼
POST /api/rooms/create
├─ No auth.user.id in request
│
▼
Backend can still process but:
├─ Should log: ownerId = undefined or error
├─ Room created without owner
└─ Access control issue detected ✓


SESSION EXPIRATION

Appwrite session expires
│
▼
User continues using app
│
▼
Next API call sends expired session
│
▼
Appwrite rejects request
│
▼
On next checkAuth():
├─ getCurrentUser() fails
├─ Redux: isAuthenticated = false
├─ ProtectedRoute redirects to signin
└─ User must login again ✓
```

## 5. Real-Time Collaboration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              REAL-TIME COLLABORATION                            │
└─────────────────────────────────────────────────────────────────┘

ROOM JOIN WITH AUTHENTICATED USERS

User 1 (Authenticated)          User 2 (Authenticated)
├─ room/[roomId]                ├─ room/[roomId]
│  ├─ useSelector(auth.user)    │  ├─ useSelector(auth.user)
│  │  = {                        │  │  = {
│  │    id: "user-uuid-1",       │  │    id: "user-uuid-2",
│  │    name: "Alice"            │  │    name: "Bob"
│  │  }                          │  │  }
│  │                             │  │
│  └─ Socket.IO emit:           │  └─ Socket.IO emit:
│     join-room({                │     join-room({
│       roomId: "room-123",      │       roomId: "room-123",
│       user: {                  │       user: {
│         id: "user-uuid-1",    │         id: "user-uuid-2",
│         name: "Alice"          │         name: "Bob"
│       }                        │       }
│     })                         │     })
│                                │
├────────────────────────────────┼─────────────────────┐
│                                │                     │
▼                                ▼                     ▼
Socket.IO Server (port 3001)     │                     │
├─ Receives join-room from User 1                      │
├─ Stores User 1 in room-123 members                   │
├─ Broadcasts presence:list to all in room-123         │
│  └─► {users: [{id: "user-uuid-1", name: "Alice"}]}   │
│                                │                     │
│                                ◄─────────────────────┘
│                                │
├─ Receives join-room from User 2
├─ Stores User 2 in room-123 members
├─ Broadcasts presence:list to all in room-123
│  └─► {users: [
│       {id: "user-uuid-1", name: "Alice"},
│       {id: "user-uuid-2", name: "Bob"}
│      ]}
│
└─► Broadcast presence:join
    └─► {user: {id: "user-uuid-2", name: "Bob"}}

User 1                           User 2
├─ Receives presence:list        ├─ Receives presence:list
│  ├─ setUsers([...])            │  ├─ setUsers([...])
│  ├─ Users panel shows:         │  ├─ Users panel shows:
│  │  - Alice                     │  │  - Alice
│  │  - Bob ✓ (sees User 2)       │  │  - Bob
│  └─ Redux dispatch(addMessage) │  └─ Redux dispatch(addMessage)
│                                │
└────────────────────────────────┘

CHAT MESSAGE FLOW

User 1 sends message "Hello Bob"
├─ Socket.IO emit("chat:send", {
│   roomId: "room-123",
│   message: "Hello Bob",
│   user: {id: "user-uuid-1", name: "Alice"},
│   ts: timestamp
│ })
│
▼
Socket.IO Server
├─ Receives message from User 1
├─ Stores in Appwrite chat_messages collection
├─ Broadcasts chat:new to all in room-123
│  └─► {id, user, message, ts}
│
├─► Broadcast to User 1
│   └─ Socket.IO on("chat:new")
│      ├─ Redux dispatch(addMessage(data))
│      ├─ Chat panel updates
│      └─ Shows "Alice: Hello Bob"
│
└─► Broadcast to User 2
    └─ Socket.IO on("chat:new")
       ├─ Redux dispatch(addMessage(data))
       ├─ Chat panel updates
       └─ Shows "Alice: Hello Bob" ✓

Both users see message immediately with sender name ✓
```

## 6. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                ERROR HANDLING SCENARIOS                         │
└─────────────────────────────────────────────────────────────────┘

INVALID EMAIL FORMAT

User types "invalid-email" and clicks Sign Up
│
▼
Form validation (client-side)
├─ /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
├─ FALSE - validation fails
├─ Display error: "Invalid email format"
└─ Prevent form submission ✓


PASSWORDS DON'T MATCH

User enters password: "abc123"
User enters confirm: "abc124"
Click Sign Up
│
▼
Form validation
├─ password !== confirmPassword
├─ Display error: "Passwords do not match"
└─ Prevent form submission ✓


APPWRITE CREATE ACCOUNT FAILS

User fills valid form and submits
│
▼
dispatch(signUp({...}))
│
▼
lib/auth.ts: createAccount()
│
▼
Appwrite rejects (e.g., email already exists)
├─ Appwrite throws error: "User with this email already exists"
│
▼
Catch block in signUp thunk
├─ catch(error)
├─ rejectWithValue(error.message)
│
▼
authSlice.signUp.rejected
├─ error = "User with this email already exists"
├─ loading = false
├─ isAuthenticated = false
│
▼
Component renders error message
├─ Display error: "User with this email already exists"
└─ User can retry with different email ✓


NETWORK ERROR DURING LOGIN

User submits sign in form
│
▼
Network request fails (no internet)
│
▼
Appwrite SDK throws NetworkError
│
▼
signIn thunk catches error
├─ catch(error)
├─ rejectWithValue("Network error")
│
▼
Component displays: "Network error"
├─ User can retry when network is available ✓


PROTECTED ROUTE - USER NOT AUTHENTICATED

Unauthenticated user navigates to /dashboard
│
▼
ProtectedRoute component renders
├─ while (loading) show spinner
│
▼
checkAuth() completes (no session found)
├─ isAuthenticated = false
│
▼
ProtectedRoute detects not authenticated
├─ useRouter.push("/auth/signin")
└─ User redirected away ✓


APPWRITE SESSION EXPIRES

User logged in, using dashboard
│
▼
Appwrite session expires (time-based)
│
▼
User tries to create room
│
▼
API call includes expired session token
│
▼
Appwrite rejects with "Invalid session"
│
▼
Frontend error handling
├─ Catch error
├─ Optionally dispatch(signOut())
├─ Show error message
└─ User must re-authenticate ✓
```

---

These diagrams show the complete flow of authentication, authorization, state management, and error handling throughout the CollabCode platform.
