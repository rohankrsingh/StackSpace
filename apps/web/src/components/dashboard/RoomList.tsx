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

interface Room {
    $id: string; // Document ID (which is the roomId)
    roomId: string;
    name: string;
    stackId: string;
    status: "running" | "stopped";
    port: number;
    lastActiveAt: string;
}

import { addToast } from "@heroui/react";

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
        return <div className="text-center py-8 text-slate-500">Loading your rooms...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">{error}</div>;
    }

    if (rooms.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                <Server className="h-10 w-10 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No rooms yet</h3>
                <p className="text-slate-500 mb-4">Create your first collaborative workspace to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">My Rooms</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                    <Card key={room.roomId} className="group hover:shadow-md transition-all">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <Badge variant={room.status === "running" ? "default" : "secondary"} className="mb-2">
                                    {room.status === "running" ? "Running" : "Stopped"}
                                </Badge>
                                <DeleteRoomDialog
                                    roomId={room.roomId}
                                    roomName={room.name}
                                    onDelete={handleDeleteRoom}
                                />
                            </div>
                            <CardTitle className="line-clamp-1 text-lg">{room.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 text-xs mt-1">
                                <Code2 className="h-3 w-3" />
                                {getStackLabel(room.stackId)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDistanceToNow(new Date(room.lastActiveAt), { addSuffix: true })}</span>
                                </div>
                            </div>

                            <Link href={`/room/${room.roomId}`} className="block">
                                <Button className="w-full group-hover:bg-blue-600 transition-colors">
                                    Open Room <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
