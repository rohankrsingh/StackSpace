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

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [joinRoomId, setJoinRoomId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateRoom = async (stackId: string, roomName: string) => {
    try {
      setIsCreating(true);
      // Import account dynamically or use from a helper, here we assume it's available or import it
      // Standard pattern: import { account } from "@/lib/auth"; at top level

      const { jwt } = await import("@/lib/auth").then(m => m.account.createJWT());

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
      if (data.roomId) {
        addToast({
          title: "Room Created",
          description: `Successfully created ${roomName}. Joining now...`,
          color: "success",
          variant: "flat"
        });
        router.push(`/room/${data.roomId}`);
        // Force a refresh of the room list if we were to stay on page, but we navigate away
      } else {
        console.error("Failed to create room:", data);
        addToast({
          title: "Creation Failed",
          description: data.message || "Could not create the room.",
          color: "danger",
          variant: "flat"
        });
      }
    } catch (error: any) {
      console.error("Failed to create room:", error);
      addToast({
        title: "Error",
        description: error.message || "An unexpected error occurred while creating the room.",
        color: "danger",
        variant: "flat"
      });
      throw error;
    } finally {
      setIsCreating(false);
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
        loading={isCreating}
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
                  Create a new workspace where you and your team can code together. You'll get a unique room ID to share.
                </p>
                <Button onClick={() => setDialogOpen(true)} disabled={isCreating} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? "Creating..." : "Create New Room"}
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
                <p>• Chat and view activity logs of all changes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
