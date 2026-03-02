"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LayoutGrid, Users, MessageSquare, Activity, Loader2, Power, LogOut, Code, Edit3, Maximize2, Layout, FilePlus, FileText, Trash2, Clock, Keyboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { addMessage, incrementUnread, resetUnread } from "@/store/slices/chatSlice";
import { addActivity } from "@/store/slices/activitySlice";
import { ChatService, ActivityService } from "@/lib/services";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Whiteboard } from "@/components/room/Whiteboard";
import RoomActionsDropdown from "@/components/room/RoomActionsDropdown";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { Dock, DockIcon } from "@/components/ui/dock";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  addToast,
  Badge as HeroBadge,
  Avatar,
} from "@heroui/react";
import { ReplyToast } from "@/components/room/ReplyToast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useKeyboardShortcuts, Shortcut } from "@/hooks/useKeyboardShortcuts";
import { ShortcutsDialog } from "@/components/room/ShortcutsDialog";
import { ChatInput, ChatInputTextArea, ChatInputSubmit } from "@/components/ui/chat-input";

interface RoomStatus {
  roomId: string;
  status: "running" | "stopped";
  ideUrl: string;
  containerName?: string;
}

interface User {
  id: string;
  name: string;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const dispatch = useDispatch<AppDispatch>();

  const authUser = useSelector((state: RootState) => state.auth.user);
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const chatMessages = useSelector((state: RootState) => state.chat.messages);
  const unreadCount = useSelector((state: RootState) => state.chat.unreadCount);
  const activities = useSelector((state: RootState) => state.activity.activities);

  // Set current user from auth OR create guest user
  useEffect(() => {
    if (authUser) {
      setCurrentUser({
        id: authUser.id,
        name: authUser.name,
      });
    } else {
      // Create a guest user if not authenticated
      const guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
      setCurrentUser({
        id: guestId,
        name: `Guest ${guestId.substr(-4)}`,
      });
    }
  }, [authUser]);

  // Fetch room status on load
  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/rooms/${roomId}/status`);
        if (!response.ok) {
          throw new Error("Room not found");
        }
        const data = await response.json();
        setRoomStatus(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load room");
        setRoomStatus(null);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomStatus();
    }
  }, [roomId]);

  // Setup Socket.IO for real-time features
  useEffect(() => {
    if (!roomId || !currentUser) return;

    const socket = getSocket(roomId);
    console.log(`[Room] Setting up Socket.IO for room ${roomId} with user ${currentUser.name}`);

    // Emit join-room with user info (for file watcher)
    socket.emit("join-room", { roomId, user: currentUser });
    console.log(`[Room] Emitted join-room event`);

    // Listen for online users updates
    socket.on("users-update", (users: User[]) => {
      console.log(`[Room] Users update:`, users);
      setOnlineUsers(users);
    });



    // Listen for file activity from file watcher
    socket.on("activity:new", (activity: any) => {
      console.log(`[Room] Activity received:`, activity);
      dispatch(addActivity({
        id: activity.id,
        user: activity.user,
        type: activity.type,
        path: activity.path,
        ts: activity.ts
      }));
    });

    socket.on("connect", () => {
      console.log(`[Room] Socket.IO connected`);
    });

    socket.on("disconnect", () => {
      console.log(`[Room] Socket.IO disconnected`);
    });

    return () => {
      console.log(`[Room] Cleaning up Socket.IO listeners`);
      if (socket.connected) {
        socket.emit("user-left", { roomId, userId: currentUser.id });
      }
      socket.off("users-update");

      socket.off("activity:new");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [roomId, currentUser, dispatch]);

  // Initial data load
  useEffect(() => {
    if (!roomId) return;

    const loadData = async () => {
      try {
        const [msgs, acts] = await Promise.all([
          ChatService.getMessages(roomId),
          ActivityService.getActivities(roomId)
        ]);

        [...msgs.documents].reverse().forEach(doc => {
          dispatch(addMessage({
            id: doc.$id,
            user: { id: doc.userId, name: doc.username },
            message: doc.message,
            ts: doc.sentAt
          }));
        });

        [...acts.documents].reverse().forEach(doc => {
          dispatch(addActivity({
            id: doc.$id,
            user: { id: doc.userId, name: doc.username },
            type: doc.type,
            path: doc.path,
            ts: doc.createdAt
          }));
        });
      } catch (e) {
        console.error("Failed to load room data:", e);
      }
    };

    loadData();
  }, [roomId, dispatch]);

  const handleCopyLink = useCallback(() => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    addToast({
      title: "Link Copied",
      description: "Room link has been copied to your clipboard.",
      color: "success",
      variant: "flat",
    });
  }, [roomId]);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    if (!currentUser || !currentUser.id || !currentUser.name) {
      console.error("Cannot send message: user not authenticated");
      return;
    }

    try {
      await ChatService.sendMessage(
        roomId,
        currentUser.id,
        currentUser.name,
        chatMessage
      );
      setChatMessage("");

      // Emit via Socket.IO for instant update
      // const socket = getSocket(roomId);
      // socket.emit("send-chat-message", {
      //   roomId,
      //   userId: currentUser.id,
      //   username: currentUser.name,
      //   message: chatMessage
      // });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleStopRoom = async () => {
    try {
      const { account } = await import("@/lib/auth").then(m => ({ account: m.account }));
      const { jwt } = await account.createJWT();

      const response = await fetch(`/api/rooms/${roomId}/stop`, {
        method: "POST",
        headers: {
          "X-Appwrite-JWT": jwt
        }
      });
      if (response.ok) {
        setRoomStatus((prev) => prev ? { ...prev, status: "stopped" } : null);
        addToast({
          title: "Room Stopped",
          description: "IDE server has been shut down.",
          color: "warning",
          variant: "flat",
        });
      } else {
        const error = await response.json();
        console.error("Failed to stop room:", error);
        addToast({
          title: "Error Stopping Room",
          description: error.message || "Something went wrong.",
          color: "danger",
          variant: "flat",
        });
      }
    } catch (error: any) {
      console.error("Failed to stop room:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to stop room.",
        color: "danger",
        variant: "flat",
      });
    }
  };

  const handleStartRoom = async () => {
    try {
      setLoading(true);
      const { account } = await import("@/lib/auth").then(m => ({ account: m.account }));
      const { jwt } = await account.createJWT();

      const response = await fetch(`/api/rooms/${roomId}/start`, {
        method: "POST",
        headers: {
          "X-Appwrite-JWT": jwt
        }
      });
      if (response.ok) {
        const data = await response.json();

        // Wait for IDE to be truly ready (ping it)
        let ready = false;
        let attempts = 0;
        const maxAttempts = 5;

        while (!ready && attempts < maxAttempts) {
          try {
            console.log(`[Room] Pinging IDE (attempt ${attempts + 1})...`);
            // We use a simple fetch to see if it responds
            const ping = await fetch(data.ideUrl, { mode: 'no-cors' });
            ready = true;
          } catch (e) {
            attempts++;
            await new Promise(r => setTimeout(r, 2000));
          }
        }

        setRoomStatus((prev) => prev ? { ...prev, status: "running", ideUrl: data.ideUrl } : null);
        addToast({
          title: "Room Started",
          description: ready ? "IDE server is now running." : "IDE server is starting up...",
          color: ready ? "success" : "warning",
          variant: "flat",
        });
      } else {
        const error = await response.json();
        console.error("Failed to start room:", error);
        addToast({
          title: "Error Starting Room",
          description: error.message || "Something went wrong.",
          color: "danger",
          variant: "flat",
        });
      }
    } catch (error: any) {
      console.error("Failed to start room:", error);
      addToast({
        title: "Error",
        description: error.message || "Failed to start room.",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    disconnectSocket();
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12">
              <Loader2 className="h-12 w-12 animate-spin text-green-500" />
            </div>
            <p className="text-white text-lg font-medium">Loading room...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !roomStatus) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Card className="max-w-md border-destructive/50 bg-card">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Error Loading Room
              </CardTitle>
              <CardDescription className="text-gray-400">{error || "Room not found"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/dashboard")} className="w-full bg-green-600 hover:bg-green-700">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <RoomContent
        roomId={roomId}
        roomStatus={roomStatus}
        users={(() => {
          // Deduplicate users: combine currentUser and onlineUsers, removing duplicates by id
          const allUsers = currentUser ? [currentUser, ...onlineUsers] : onlineUsers;
          const uniqueUsers = allUsers.filter((user, index, self) =>
            index === self.findIndex((u) => u.id === user.id)
          );
          return uniqueUsers;
        })()}
        chatMessages={chatMessages}
        activities={activities}
        chatMessage={chatMessage}
        setChatMessage={setChatMessage}
        handleSendMessage={handleSendMessage}
        handleCopyLink={handleCopyLink}
        handleStartRoom={handleStartRoom}
        handleStopRoom={handleStopRoom}
        handleLeaveRoom={handleLeaveRoom}
        loading={loading}
      />
    </ProtectedRoute>
  );
}

function RoomContent({
  roomId, roomStatus, users, chatMessages, activities,
  chatMessage, setChatMessage, handleSendMessage,
  handleCopyLink, handleStartRoom, handleStopRoom, handleLeaveRoom, loading
}: any) {
  const [activeView, setActiveView] = useState<"ide" | "whiteboard">("ide");
  const [isDockVisible, setIsDockVisible] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [activeTab, setActiveTab] = useState("chat");
  const [shortcutsDialogOpen, setShortcutsDialogOpen] = useState(false);

  const handleDockItemClick = (type: string) => {
    if (type === "ide" || type === "whiteboard") {
      setActiveView(type);
    } else {
      setActiveTab(type);
      onOpen();
      if (type === "chat") {
        dispatch(resetUnread());
      }
    }
    setIsDockVisible(false);
  };

  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const unreadCount = useSelector((state: RootState) => state.chat.unreadCount);

  // Subscribe to Realtime Events inside Content so we have access to isOpen and activeTab
  useEffect(() => {
    if (!roomId) return;

    const unsubscribeChat = ChatService.subscribe(roomId, (payload) => {
      const isMyMessage = authUser && payload.userId === authUser.id;

      dispatch(addMessage({
        id: payload.$id,
        user: { id: payload.userId, name: payload.username },
        message: payload.message,
        ts: payload.sentAt
      }));

      // Show notification if it's not our message and chat is not visible
      if (!isMyMessage && (!isOpen || activeTab !== "chat")) {
        dispatch(incrementUnread());
        addToast({
          hideIcon: true,
          variant: "flat",
          description: (
            <ReplyToast
              username={payload.username}
              message={payload.message}
              onReply={(reply) => {
                ChatService.sendMessage(roomId, authUser?.id || "guest", authUser?.name || "Guest", reply);
              }}
              onClose={() => {
                // Toast close logic handled by timeout or user
              }}
            />
          ),
          timeout: 10000,
        });
      }
    });

    const unsubscribeActivity = ActivityService.subscribe(roomId, (payload) => {
      dispatch(addActivity({
        id: payload.$id,
        user: { id: payload.userId, name: payload.username },
        type: payload.type,
        path: payload.path,
        ts: payload.createdAt
      }));
    });

    return () => {
      try { unsubscribeChat(); } catch (e) { }
      try { unsubscribeActivity(); } catch (e) { }
    };
  }, [roomId, isOpen, activeTab, authUser, dispatch]);

  // Define keyboard shortcuts (using Ctrl+Alt to avoid VS Code conflicts)
  const shortcuts: Shortcut[] = [
    {
      key: "d",
      ctrl: true,
      alt: true,
      action: () => setIsDockVisible((prev) => !prev),
      description: "Toggle Dock",
      category: "Navigation",
    },
    {
      key: "Escape",
      action: () => {
        if (isDockVisible) setIsDockVisible(false);
        else if (shortcutsDialogOpen) setShortcutsDialogOpen(false);
      },
      description: "Close Dock/Dialog",
      category: "Navigation",
    },
    {
      key: "1",
      ctrl: true,
      alt: true,
      action: () => {
        setActiveView("ide");
        setIsDockVisible(false);
      },
      description: "Switch to IDE",
      category: "Views",
    },
    {
      key: "2",
      ctrl: true,
      alt: true,
      action: () => {
        setActiveView("whiteboard");
        setIsDockVisible(false);
      },
      description: "Switch to Whiteboard",
      category: "Views",
    },
    {
      key: "c",
      ctrl: true,
      alt: true,
      action: () => {
        setActiveTab("chat");
        onOpen();
        setIsDockVisible(false);
      },
      description: "Open Chat",
      category: "Panels",
    },
    {
      key: "u",
      ctrl: true,
      alt: true,
      action: () => {
        setActiveTab("users");
        onOpen();
        setIsDockVisible(false);
      },
      description: "Open Users",
      category: "Panels",
    },
    {
      key: "a",
      ctrl: true,
      alt: true,
      action: () => {
        setActiveTab("activity");
        onOpen();
        setIsDockVisible(false);
      },
      description: "Open Activity",
      category: "Panels",
    },
    {
      key: "/",
      ctrl: true,
      action: () => setShortcutsDialogOpen(true),
      description: "Show Shortcuts",
      category: "Help",
    },
  ];

  // Enable keyboard shortcuts
  useKeyboardShortcuts({ shortcuts });

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Central Workspace (IDE or Whiteboard) */}
        <div className="flex-1 relative transition-all duration-300">
          {/* View: IDE */}
          <div className={`absolute inset-0 ${activeView === "ide" ? "z-10 bg-background" : "z-0 hidden"}`}>
            {roomStatus.status === "running" && roomStatus.ideUrl ? (
              <iframe
                src={(() => {
                  // If on a remote host, replace localhost with the host IP/domain
                  if (typeof window !== 'undefined' &&
                    window.location.hostname !== 'localhost' &&
                    roomStatus.ideUrl.includes('localhost')) {
                    return roomStatus.ideUrl.replace('localhost', window.location.hostname);
                  }
                  return roomStatus.ideUrl;
                })()}
                className="w-full h-full border-0 bg-background"
                title="IDE"
                // Standard Permissions Policy directives for VS Code/OpenVSCode Server
                // Only using widely supported features to avoid console warnings
                allow={[
                  "clipboard-read",
                  "clipboard-write",
                  "fullscreen",
                  "autoplay",
                  "encrypted-media",
                  "picture-in-picture",
                  "microphone",
                  "camera",
                  "geolocation",
                  "accelerometer",
                  "gyroscope",
                  "magnetometer",
                  "midi",
                  "usb",
                  "serial",
                  "hid",
                  "payment",
                  "display-capture",
                  "xr-spatial-tracking",
                ].join("; ")}
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                <Activity className="h-12 w-12 opacity-50" />
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">IDE is Stopped</h3>
                  <p className="max-w-xs mx-auto">Restart the room server from the actions menu in the top right.</p>
                </div>
                <Button onClick={handleStartRoom} disabled={loading} className="mt-2 bg-blue-600 hover:bg-blue-700 h-10 px-6">
                  {loading ? "Starting..." : "Start IDE Server"}
                </Button>
              </div>
            )}
          </div>

          {/* View: Whiteboard */}
          <div className={`absolute inset-0 ${activeView === "whiteboard" ? "z-10" : "z-0 h-0 w-0 overflow-hidden"}`}>
            <Whiteboard roomId={roomId} />
          </div>
        </div>



      </div>

      {/* Trigger Button */}
      <AnimatePresence>
        {!isDockVisible && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed h- top-auto bottom-0 left-1/2 -translate-x-1/2 z-50 backdrop-blur-md rounded-t-2xl px-6 py-1.5 cursor-pointer shadow-lg bg-background/50 border-t border-l border-r border-border/50"
            onClick={() => setIsDockVisible(true)}
          >
            <ChevronDown className="h-5 w-5 pb-1 text-foreground/80 rotate-180" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock */}
      <AnimatePresence>
        {isDockVisible && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDockVisible(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
            />
            <motion.div
              initial={{ y: 100, x: "-50%", opacity: 0 }}
              animate={{ y: -20, x: "-50%", opacity: 1 }}
              exit={{ y: 100, x: "-50%", opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 z-100"
            >
              <TooltipProvider>
                <Dock className="bg-background/80 backdrop-blur-md border border-border/50 p-2 rounded-2xl shadow-2xl z-50">
                  <DockIcon>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => handleDockItemClick("ide")}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12 rounded-full cursor-pointer", activeView === "ide" && "bg-primary/10")}
                        >
                          <Code className={cn("size-5", activeView === "ide" ? "text-primary" : "text-foreground")} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>IDE</p>
                      </TooltipContent>
                    </Tooltip>
                  </DockIcon>

                  <DockIcon>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => handleDockItemClick("whiteboard")}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12 rounded-full cursor-pointer", activeView === "whiteboard" && "bg-primary/10")}
                        >
                          <Edit3 className={cn("size-5", activeView === "whiteboard" ? "text-primary" : "text-foreground")} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Whiteboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </DockIcon>

                  <Separator orientation="vertical" className="bg-border/70" />

                  <DockIcon>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => handleDockItemClick("chat")}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12 rounded-full cursor-pointer relative")}
                        >
                          <HeroBadge content={unreadCount > 0 ? unreadCount : null} color="danger" shape="circle" placement="top-right" isInvisible={unreadCount === 0}>
                            <MessageSquare className="size-5 text-foreground" />
                          </HeroBadge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Chat</p>
                      </TooltipContent>
                    </Tooltip>
                  </DockIcon>

                  <DockIcon>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => handleDockItemClick("users")}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12 rounded-full cursor-pointer")}
                        >
                          <Users className="size-5 text-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Users</p>
                      </TooltipContent>
                    </Tooltip>
                  </DockIcon>

                  <DockIcon>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => handleDockItemClick("activity")}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12 rounded-full cursor-pointer")}
                        >
                          <Activity className="size-5 text-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Activity</p>
                      </TooltipContent>
                    </Tooltip>
                  </DockIcon>

                  <Separator orientation="vertical" className=" bg-border/70" />

                  <DockIcon>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => {
                            setShortcutsDialogOpen(true);
                            setIsDockVisible(false);
                          }}
                          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-12 rounded-full cursor-pointer")}
                        >
                          <Keyboard className="size-5 text-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Shortcuts (Ctrl+/)</p>
                      </TooltipContent>
                    </Tooltip>
                  </DockIcon>

                  {/* Room Actions Dropdown in Dock */}
                  <DockIcon disableMagnification>
                    <RoomActionsDropdown
                      roomId={roomId}
                      roomStatus={roomStatus}
                      loading={loading}
                      handleCopyLink={handleCopyLink}
                      handleStartRoom={handleStartRoom}
                      handleStopRoom={handleStopRoom}
                      handleLeaveRoom={handleLeaveRoom}
                      onKeyboardShortcutsClick={() => setShortcutsDialogOpen(true)}
                      direction="up"
                    />
                  </DockIcon>
                </Dock>
              </TooltipProvider>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="right" size="sm" backdrop="transparent" disableAnimation>
        <DrawerContent className="max-w-[320px] bg-background border-l border-border">
          {(onClose) => (
            <>
              <DrawerHeader className="px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Collaboration</h3>
              </DrawerHeader>
              <DrawerBody className="p-0 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col px-4 pt-3 h-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 bg-muted">
                    <TabsTrigger value="chat" className="text-xs">
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="users" className="text-xs">
                      <Users className="h-3.5 w-3.5 mr-1" />
                      Users
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="text-xs">
                      <Activity className="h-3.5 w-3.5 mr-1" />
                      Logs
                    </TabsTrigger>
                  </TabsList>

                  {/* Chat Tab */}
                  <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mb-4 data-[state=inactive]:hidden">
                    <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-2">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageSquare className="h-8 w-8 mx-auto opacity-50 mb-2" />
                          <p className="text-xs">No messages yet</p>
                        </div>
                      ) : (
                        chatMessages.map((msg: any) => (
                          <div key={msg.id} className="p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start gap-3">
                              <Avatar
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user.name}`}
                                name={msg.user.name}
                                size="sm"
                                className="shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-semibold text-xs text-foreground truncate">{msg.user.name}</span>
                                </div>
                                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap wrap-anywhere">
                                  {msg.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="pt-3 border-t border-border">
                      <ChatInput
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onSubmit={handleSendMessage}
                        className=" border-border h-full w-full"
                        variant="default"
                      >
                        <ChatInputTextArea
                          placeholder="Type a message..."
                        />
                        <ChatInputSubmit className="!p-2 !px-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground" />
                      </ChatInput>
                    </div>
                  </TabsContent>

                  {/* Users Tab */}
                  <TabsContent value="users" className="flex-1 overflow-y-auto pr-2 mb-4 data-[state=inactive]:hidden">
                    {users.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Users className="h-8 w-8 mx-auto opacity-50 mb-2" />
                        <p className="text-xs">No users online</p>
                      </div>
                    ) : (
                      users.map((u: any) => (
                        <div key={u.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors mb-1">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <span className="text-sm text-foreground">{u.name}</span>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  {/* Activity Tab */}
                  <TabsContent value="activity" className="flex-1 overflow-y-auto pr-1 mb-4 data-[state=inactive]:hidden">
                    {activities.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8 flex flex-col items-center">
                        <Activity className="h-8 w-8 opacity-50 mb-2" />
                        <p className="text-xs">No activities yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activities.map((a: any) => {
                          const getActivityIcon = (type: string) => {
                            switch (type) {
                              case 'file:create': return <FilePlus className="h-4 w-4 text-green-500" />;
                              case 'file:update': return <FileText className="h-4 w-4 text-blue-500" />;
                              case 'file:delete': return <Trash2 className="h-4 w-4 text-red-500" />;
                              default: return <FileText className="h-4 w-4 text-muted-foreground" />;
                            }
                          };

                          const getActivityColor = (type: string) => {
                            switch (type) {
                              case 'file:create': return 'bg-green-500/10 border-green-500/20';
                              case 'file:update': return 'bg-blue-500/10 border-blue-500/20';
                              case 'file:delete': return 'bg-red-500/10 border-red-500/20';
                              default: return 'bg-muted border-border';
                            }
                          };

                          const getActivityLabel = (type: string) => {
                            switch (type) {
                              case 'file:create': return 'created';
                              case 'file:update': return 'updated';
                              case 'file:delete': return 'deleted';
                              default: return type;
                            }
                          };

                          const fileName = a.path.split('/').pop() || 'file';
                          const timestamp = new Date(a.ts).toLocaleTimeString();

                          return (
                            <div key={a.id} className={`rounded-lg p-2 border transition-all ${getActivityColor(a.type)}`}>
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5 flex-shrink-0">
                                  {getActivityIcon(a.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-baseline gap-1 flex-wrap">
                                    <span className="font-semibold text-xs text-foreground">{a.user.name}</span>
                                    <span className="text-xs text-muted-foreground">{getActivityLabel(a.type)}</span>
                                  </div>
                                  <div className="text-xs text-foreground mt-1 break-all font-mono bg-background/50 px-1.5 py-1 rounded border border-border">
                                    {fileName}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {timestamp}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsDialog
        open={shortcutsDialogOpen}
        onOpenChange={setShortcutsDialogOpen}
        shortcuts={shortcuts}
      />

    </div>
  );
}
