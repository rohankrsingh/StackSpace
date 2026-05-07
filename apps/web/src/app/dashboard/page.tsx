"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { DashboardLayout, Sidebar, SidebarItem } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Home, Settings } from "lucide-react";
import ProfileDropdown from "@/components/kokonutui/profile-dropdown";
import { AppDispatch, RootState } from "@/store";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CreateRoomDialog } from "@/components/rooms/CreateRoomDialog";
import { RoomList } from "@/components/dashboard/RoomList";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  addToast,
  Button as HeroButton,
} from "@heroui/react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [creationState, setCreationState] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const creationStates = [
    { text: "Preparing workspace environment" },
    { text: "Building project template" },
    { text: "Provisioning isolated cloud container" },
    { text: "Allocating Fargate resources & networking" },
    { text: "Starting VS Code backend — this may take a moment" },
    { text: "Waiting for IDE to be ready..." },
    { text: "IDE Ready! Entering your workspace..." },
  ];

  const handleCreateRoom = async (stackId: string, roomName: string) => {
    let mockInterval: NodeJS.Timeout | null = null;
    try {
      setIsCreatingServer(true);
      setCreationState(0);
      setDialogOpen(false); // Close the dialog to show the full-screen loader

      await new Promise(r => setTimeout(r, 600));
      setCreationState(1);

      const { jwt } = await import("@/lib/auth").then(m => m.account.createJWT());
      setCreationState(2);

      mockInterval = setInterval(() => {
        setCreationState(prev => {
          if (prev < 5) return prev + 1; // Cap at "Almost there..."
          return prev;
        });
      }, 2000);

      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-JWT": jwt
        },
        body: JSON.stringify({
          stackId,
          roomName,
          isPublic: true,
        }),
      });
      const data = await response.json();
      
      if (mockInterval) clearInterval(mockInterval);
      setCreationState(6); // "IDE Ready!"
      await new Promise(r => setTimeout(r, 800)); // Let them see it finished

      if (data.roomId) {
        addToast({
          title: "Room Created",
          description: `Successfully created ${roomName}. Joining now...`,
          color: "success",
          variant: "flat"
        });
        router.push(`/room/${data.roomId}`);
      } else {
        console.error("Failed to create room:", data);
        setIsCreatingServer(false);
        addToast({
          title: "Creation Failed",
          description: data.message || "Could not create the room.",
          color: "danger",
          variant: "flat"
        });
      }
    } catch (error: any) {
      if (mockInterval) clearInterval(mockInterval);
      setIsCreatingServer(false);
      console.error("Failed to create room:", error);
      addToast({
        title: "Error",
        description: error.message || "An unexpected error occurred while creating the room.",
        color: "danger",
        variant: "flat"
      });
    }
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      router.push(`/room/${joinRoomId}`);
    }
  };

  // handleSignOut is now handled by ProfileDropdown

  return (
    <ProtectedRoute>
      <CreateRoomDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreateRoom={handleCreateRoom}
        loading={isCreatingServer}
      />
      <MultiStepLoader
        loadingStates={creationStates}
        loading={isCreatingServer}
        duration={1500}
        currentState={creationState}
      />
      <DashboardLayout
        sidebar={
          <Sidebar>
            <SidebarItem icon={<Home />} label="Dashboard" onClick={() => { }} />
            <SidebarItem icon={<Settings />} label="Settings" onClick={() => router.push("/settings")} />
            <div className="mt-auto">
              <div className="px-4 py-3 border-t border-border">
                <ProfileDropdown />
              </div>
            </div>
          </Sidebar>
        }
      >
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-foreground/60">Create or join a collaborative workspace</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl">
            {/* Create Room Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Plus className="h-6 w-6 text-blue-500" />
                  <CardTitle>Create Room</CardTitle>
                </div>
                <CardDescription>Start a new collaborative session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-foreground/70">
                  Create a new workspace where you and your team can code together. You&apos;ll get a unique room ID to share.
                </p>
                <Button onClick={() => setDialogOpen(true)} disabled={isCreatingServer} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreatingServer ? "Creating..." : "Create New Room"}
                </Button>
              </CardContent>
            </Card>

            {/* Join Room Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Join Room</CardTitle>
                <CardDescription>Enter an existing room ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Enter room ID"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                />
                <Button
                  onClick={handleJoinRoom}
                  disabled={!joinRoomId.trim()}
                  className="w-full"
                  variant="outline"
                >
                  Join Room
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* My Rooms List */}
          <div className="mt-12 max-w-5xl">
            <RoomList />
          </div>

          {/* Info Section */}
          <div className="mt-12 max-w-3xl">
            <Card className="bg-blue-50 dark:bg-slate-900 border-blue-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-300">How it works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p>• Create a room to start a new collaborative workspace</p>
                <p>• Share the room ID with others to invite them</p>
                <p>• Edit code together in real-time with presence updates</p>
                <p>• Chat and collaborate with others in real-time</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
