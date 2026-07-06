"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, ArrowRight, Server, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { DeleteRoomDialog } from "./DeleteRoomDialog";
import { account } from "@/lib/auth";
import { addToast } from "@heroui/react";
import { motion } from "motion/react";

interface Room {
  $id: string; // Document ID (which is the roomId)
  roomId: string;
  name: string;
  stackId: string;
  status: "running" | "stopped";
  port: number;
  lastActiveAt: string;
}

export function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRooms = async () => {
    try {
      // Get JWT for auth
      const { jwt } = await account.createJWT();

      const response = await fetch("/api/rooms/list", {
        headers: {
          "X-Appwrite-JWT": jwt
        }
      });
      if (!response.ok) {
        console.error("Fetch Rooms Failed:", response.status);
        throw new Error(`Failed to fetch rooms: ${response.status}`);
      }
      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (err: any) {
      setError("Failed to load your rooms");
      console.error(err);
      addToast({
        title: "Load Error",
        description: err.message || "Could not retrieve your rooms.",
        color: "danger",
        variant: "flat"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDeleteRoom = async (roomId: string) => {
    try {
      const { jwt } = await account.createJWT();
      const response = await fetch(`/api/rooms/${roomId}/delete`, {
        method: "DELETE",
        headers: {
          "X-Appwrite-JWT": jwt
        }
      });

      if (!response.ok) {
        console.error("Delete failed");
        throw new Error("Failed to delete the room");
      }

      // Optimistically update list
      setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
      addToast({
        title: "Room Deleted",
        description: "The collaborative room has been removed.",
        color: "success",
        variant: "flat"
      });
    } catch (error: any) {
      console.error("Delete room error:", error);
      addToast({
        title: "Delete Failed",
        description: error.message || "An error occurred while deleting the room.",
        color: "danger",
        variant: "flat"
      });
    }
  };

  const getStackLabel = (stackId: string) => {
    const map: Record<string, string> = {
      "nodejs-basic": "Node.js",
      "react-vite": "React",
      "next-js": "Next.js",
      "python-basic": "Python",
      "cpp-basic": "C++",
      "java-basic": "Java",
      "html-css-js": "HTML/CSS",
    };
    return map[stackId] || stackId;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
        <Loader2Spinner />
        <span className="text-xs font-mono tracking-wider uppercase animate-pulse">Loading rooms...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 border border-red-950/20 bg-red-950/5 text-red-400 rounded-xl max-w-xl mx-auto text-sm font-medium">
        {error}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-zinc-800/80 bg-zinc-950/20 rounded-2xl max-w-xl mx-auto flex flex-col items-center">
        <Server className="h-10 w-10 text-zinc-600 mb-4 animate-pulse" />
        <h3 className="text-lg font-bold text-white mb-2">No rooms active</h3>
        <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
          Create your first isolated collaborative workspace to start coding with your team.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">Active Rooms</h2>
          <p className="text-xs text-zinc-500">List of collaborative cloud container sandboxes</p>
        </div>
        <Badge className="bg-zinc-900 border-zinc-800 text-zinc-400 font-mono text-xs px-2.5 py-1">
          Total: {rooms.length}
        </Badge>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
        }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {rooms.map((room) => (
          <motion.div
            key={room.roomId}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            whileHover={{ y: -3 }}
            className="group"
          >
            <Card className="bg-zinc-950/40 border-zinc-900 hover:border-green-500/20 hover:shadow-green-950/10 shadow-lg transition-all duration-300 h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-1.5">
                    {room.status === "running" ? (
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-700"></span>
                    )}
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-500 group-hover:text-zinc-400 transition-colors">
                      {room.status === "running" ? "Online" : "Stopped"}
                    </span>
                  </div>
                  <DeleteRoomDialog
                    roomId={room.roomId}
                    roomName={room.name}
                    onDelete={handleDeleteRoom}
                  />
                </div>
                <CardTitle className="line-clamp-1 text-base font-bold text-white tracking-tight">{room.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-xs font-mono text-zinc-500 mt-1">
                  <Code2 className="h-3.5 w-3.5 text-green-500/80" />
                  {getStackLabel(room.stackId)}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-2 flex flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-zinc-600" />
                    <span>{formatDistanceToNow(new Date(room.lastActiveAt), { addSuffix: true })}</span>
                  </div>
                </div>

                <Link href={`/room/${room.roomId}`} className="block">
                  <Button className="w-full bg-zinc-900/60 hover:bg-green-500 hover:text-black hover:border-green-400 border border-zinc-800 text-zinc-300 font-semibold transition-all duration-300">
                    Open Room <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function Loader2Spinner() {
  return (
    <svg className="animate-spin h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
