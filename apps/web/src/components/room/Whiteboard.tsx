"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { WhiteboardService } from "@/lib/services";
import { getSocket } from "@/lib/socket";
import "@excalidraw/excalidraw/index.css";

// Excalidraw must be loaded dynamically (client-side only)
const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    { ssr: false }
) as any;

interface WhiteboardProps {
    roomId: string;
}

export function Whiteboard({ roomId }: WhiteboardProps) {
    const [initialData, setInitialData] = useState<any>(null);
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const socketRef = useRef<any>(null);

    // Load initial whiteboard data from Appwrite
    useEffect(() => {
        const loadWhiteboard = async () => {
            try {
                const data = await WhiteboardService.getWhiteboard(roomId);
                if (data) {
                    const parsed = JSON.parse(data);
                    setInitialData(parsed);
                } else {
                    setInitialData({ elements: [], appState: {} });
                }
            } catch (error) {
                console.error("Failed to load whiteboard:", error);
                setInitialData({ elements: [], appState: {} });
            } finally {
                setIsLoading(false);
            }
        };

        loadWhiteboard();
    }, [roomId]);

    // Setup Socket.IO for real-time updates
    useEffect(() => {
        const socket = getSocket(roomId);
        socketRef.current = socket;

        // Listen for whiteboard updates from other users
        socket.on("whiteboard-update", (data: any) => {
            if (excalidrawAPI) {
                try {
                    const parsed = JSON.parse(data);
                    excalidrawAPI.updateScene({
                        elements: parsed.elements,
                        appState: parsed.appState
                    });
                } catch (error) {
                    console.error("Failed to apply whiteboard update:", error);
                }
            }
        });

        return () => {
            socket.off("whiteboard-update");
        };
    }, [roomId, excalidrawAPI]);

    // Handle whiteboard changes
    const handleChange = (elements: any, appState: any) => {
        const data = JSON.stringify({
            elements,
            appState: { ...appState, collaborators: [] }
        });

        // Broadcast to other users via Socket.IO
        if (socketRef.current) {
            socketRef.current.emit("whiteboard-change", { roomId, data });
        }

        // Debounce save to Appwrite (save after 2 seconds of inactivity)
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await WhiteboardService.saveWhiteboard(roomId, data);
                console.log("Whiteboard saved to Appwrite");
            } catch (error) {
                console.error("Failed to save whiteboard:", error);
            }
        }, 2000);
    };

    if (isLoading || !initialData) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="h-full w-full border rounded-lg overflow-hidden bg-white">
            <Excalidraw
                initialData={initialData}
                excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                onChange={(elements: any, appState: any) => {
                    handleChange(elements, appState);
                }}
                UIOptions={{
                    canvasActions: {
                        loadScene: false,
                        saveToActiveFile: false,
                    }
                }}
            />
        </div>
    );
}
