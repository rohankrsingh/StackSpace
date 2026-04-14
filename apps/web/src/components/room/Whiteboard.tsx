"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import LoaderKokonut from "@/components/kokonutui/loader";
import { WhiteboardService } from "@/lib/services";
import { getSocket } from "@/lib/socket";


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
                    let cleanElements = [];
                    if (Array.isArray(parsed.elements)) {
                        cleanElements = parsed.elements.filter((el: any) => 
                            el && 
                            Number.isFinite(el.x) && Math.abs(el.x) < 8000 &&
                            Number.isFinite(el.y) && Math.abs(el.y) < 8000 &&
                            Number.isFinite(el.width) && Math.abs(el.width) < 8000 &&
                            Number.isFinite(el.height) && Math.abs(el.height) < 8000
                        );
                    }
                    // Extract initial view details from previous appState if valid
                    let viewState = { viewBackgroundColor: "#ffffff", currentItemFontFamily: 1 };
                    if (parsed.appState && typeof parsed.appState === 'object') {
                        if (parsed.appState.viewBackgroundColor) viewState.viewBackgroundColor = parsed.appState.viewBackgroundColor;
                    }
                    setInitialData({ elements: cleanElements, appState: viewState });
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
                        elements: parsed.elements
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
            elements
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
                <LoaderKokonut
                    title="Loading Whiteboard..."
                    subtitle="Syncing collaborative canvas"
                    size="sm"
                />
            </div>
        );
    }

    return (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", minHeight: "500px" }} className="border rounded-lg overflow-hidden bg-white">
            <Excalidraw
                initialData={{ 
                    elements: initialData.elements || [],
                    appState: initialData.appState || { viewBackgroundColor: "#ffffff", currentItemFontFamily: 1 }
                }}
                excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                onChange={(elements: readonly any[], appState: any) => {
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
