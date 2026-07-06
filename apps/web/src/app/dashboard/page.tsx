"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { DashboardLayout, Sidebar, SidebarItem } from "@/components/layouts/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Home, Settings, ShieldAlert, Cpu, HardDrive, Users, Check, ChevronRight } from "lucide-react";
import ProfileDropdown from "@/components/kokonutui/profile-dropdown";
import { AppDispatch, RootState } from "@/store";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CreateRoomDialog } from "@/components/rooms/CreateRoomDialog";
import { RoomList } from "@/components/dashboard/RoomList";
import { addToast } from "@heroui/react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { motion } from "motion/react";

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

  // Motion variants for dashboard grid stagger
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  } as const;

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
            <SidebarItem icon={<Home className="text-green-500/80" />} label="Dashboard" onClick={() => { }} />
            <SidebarItem icon={<Settings className="text-zinc-500 hover:text-green-500/80" />} label="Settings" onClick={() => router.push("/settings")} />
            <div className="mt-auto">
              <div className="px-4 py-3 border-t border-zinc-900">
                <ProfileDropdown />
              </div>
            </div>
          </Sidebar>
        }
      >
        {/* Topbar inside layout */}
        <div className="border-b border-zinc-900 bg-black/60 px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <BadgeAWSExpired />
          </div>
        </div>

        {/* Dashboard Area */}
        <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 bg-black/10 min-h-[calc(100vh-4rem)]">
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none mb-2">
                Welcome back, <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">{user?.name || "Developer"}</span>
              </h1>
              <p className="text-sm text-zinc-500">Configure stacks, invite team members, and start isolated environments.</p>
            </div>
            
            <Button
              onClick={() => setDialogOpen(true)}
              disabled={isCreatingServer}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold shadow-lg shadow-green-950/20 px-6"
            >
              <Plus className="h-4.5 w-4.5 mr-2 stroke-[3]" />
              New Sandbox Room
            </Button>
          </div>

          {/* Stats Analytics Row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { title: "Fargate Sandbox", val: "Fargate cluster", sub: "ECS status online", icon: Cpu },
              { title: "Team limit", val: "4+ Members", sub: "Collaborators limit", icon: Users },
              { title: "Fargate Storage", val: "1 GB", sub: "Room storage allocation", icon: HardDrive },
              { title: "Uptime credits", val: "AWS Free Tier", sub: "Account plan expired", icon: ShieldAlert, alert: true }
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-500">{stat.title}</span>
                    <stat.icon className={`h-4 w-4 ${stat.alert ? "text-red-400" : "text-green-500/80"}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-base md:text-lg font-bold text-white tracking-tight">{stat.val}</div>
                    <p className="text-[11px] text-zinc-500 mt-1">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Rooms list on Left */}
            <div className="lg:col-span-2 space-y-6">
              <RoomList />
            </div>

            {/* Quick Actions & Help on Right */}
            <div className="space-y-6 lg:col-span-1">
              {/* Join Room Card */}
              <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white tracking-tight">Quick Join Room</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">Access an active room by ID</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Enter Room ID"
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                    className="bg-zinc-900 border-zinc-800 focus:border-green-500/30 text-xs rounded-lg"
                  />
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!joinRoomId.trim()}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold border border-zinc-800 transition-colors"
                  >
                    Join Room
                  </Button>
                </CardContent>
              </Card>

              {/* Collapsible Help Widget */}
              <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-white tracking-tight">Quick Guide</CardTitle>
                  <CardDescription className="text-xs text-zinc-500">How collaborative workspaces function</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-zinc-400 font-medium leading-relaxed">
                  <div className="flex gap-2.5 items-start">
                    <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <span>Create a room to provision an isolated cloud Docker workspace.</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <span>Invite teammates by sharing the unique room link from the address bar.</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <span>Compile and execute commands synchronously within your shared terminal.</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <span>Communicate via room chat and share markdown files side-by-side.</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function BadgeAWSExpired() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/20 border border-red-900/30 rounded-full text-red-400 text-[10px] font-mono font-semibold animate-pulse">
      <ShieldAlert className="h-3.5 w-3.5" />
      <span>AWS Cloud Sandbox Demo Offline (Free tier plan expired)</span>
      <a
        href="https://github.com/rohankrsingh/StackSpace#readme"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-red-300 ml-1 inline-flex items-center gap-0.5"
      >
        README <ChevronRight className="h-2.5 w-2.5" />
      </a>
    </div>
  );
}
