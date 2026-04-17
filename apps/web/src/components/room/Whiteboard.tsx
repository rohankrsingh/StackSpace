"use client";

import { useEffect, useState, useRef, useCallback, Component, ReactNode } from "react";
import dynamic from "next/dynamic";
import { WhiteboardService } from "@/lib/services";
import { getSocket } from "@/lib/socket";
import { Loader2, AlertCircle, RefreshCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

import "@excalidraw/excalidraw/index.css";

class WhiteboardErrorBoundary extends Component<{children: ReactNode, onReset: () => void}, {hasError: boolean}> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 p-6 text-center">
                    <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                    <h3 className="text-lg font-bold">Whiteboard crashed</h3>
                    <Button onClick={() => {
                        this.props.onReset();
                        this.setState({ hasError: false });
                    }} variant="outline" className="mt-4">
                        Reset Canvas
                    </Button>
                </div>
            );
        }
        return this.props.children;
    }
}

const Excalidraw = dynamic(
    async () => (await import("@excalidraw/excalidraw")).Excalidraw,
    { 
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-zinc-50 border rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-primary/20" />
            </div>
        )
    }
) as any;

interface WhiteboardProps {
    roomId: string;
}

export function Whiteboard({ roomId }: WhiteboardProps) {
    const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mountKey, setMountKey] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    
    const socketRef = useRef<any>(null);
    const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isRemoteUpdate = useRef(false);
    const lastSavedDataRef = useRef<string>("");

    const loadData = useCallback(async (forceClear = false) => {
        setIsLoading(true);
        try {
            if (forceClear) {
                const empty = JSON.stringify({ elements: [] });
                await WhiteboardService.saveWhiteboard(roomId, empty);
                lastSavedDataRef.current = empty;
                setInitialData({ elements: [], appState: { viewBackgroundColor: "#ffffff" } });
            } else {
                const raw = await WhiteboardService.getWhiteboard(roomId);
                lastSavedDataRef.current = raw || JSON.stringify({ elements: [] });
                const parsed = raw ? JSON.parse(raw) : { elements: [] };
                
                const elements = (parsed.elements ?? [])
                    .slice(0, 1000) 
                    .filter((el: any) => el && typeof el.x === 'number' && isFinite(el.x));
                
                setInitialData({ 
                    elements,
                    appState: {
                        viewBackgroundColor: "#ffffff",
                        currentItemFontFamily: 1,
                    }
                });
            }
        } catch (err) {
            setInitialData({ elements: [], appState: { viewBackgroundColor: "#ffffff" } });
        } finally {
            setIsLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!roomId) return;
        const socket = getSocket(roomId);
        socketRef.current = socket;

        const handleUpdate = (data: string) => {
            if (!excalidrawAPI) return;
            try {
                const parsed = JSON.parse(data);
                // Mark this as a remote update to prevent loopback
                isRemoteUpdate.current = true;
                lastSavedDataRef.current = data; // Sync local "last saved" with remote
                excalidrawAPI.updateScene({ elements: parsed.elements || [] });
                setTimeout(() => { isRemoteUpdate.current = false; }, 100);
            } catch (err) {}
        };

        socket.on("whiteboard-update", handleUpdate);
        return () => { socket.off("whiteboard-update", handleUpdate); };
    }, [roomId, excalidrawAPI]);

    const onChange = useCallback((elements: readonly any[]) => {
        if (isRemoteUpdate.current || !socketRef.current) return;

        const payload = JSON.stringify({ elements });
        
        // 1. Skip if data hasn't changed since last local/remote update
        if (payload === lastSavedDataRef.current) return;

        // 2. Broadcast immediately for real-time sync
        socketRef.current.emit("whiteboard-change", { roomId, data: payload });

        // 3. Debounced Persistent Save
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
            setIsSaving(true);
            try {
                await WhiteboardService.saveWhiteboard(roomId, payload);
                lastSavedDataRef.current = payload;
                console.log("[Whiteboard] Saved to cloud");
            } catch (err) {
                console.error("[Whiteboard] Save failed:", err);
            } finally {
                setIsSaving(false);
            }
        }, 1000); // 1s debounce is enough
    }, [roomId, excalidrawAPI]);

    const handleReset = () => {
        setMountKey(prev => prev + 1);
        loadData(true);
    };

    if (isLoading || !initialData) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-background border rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
            </div>
        );
    }

    return (
        <div className="w-full h-full relative bg-white overflow-hidden rounded-lg border">
            {isSaving && (
                <div className="absolute top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-black/80 text-white rounded-full text-[10px] font-medium backdrop-blur-sm border border-white/10 animate-in fade-in zoom-in duration-300">
                    <Save className="h-3 w-3 animate-pulse text-blue-400" />
                    SAVING...
                </div>
            )}
            
            <WhiteboardErrorBoundary key={mountKey + roomId} onReset={handleReset}>
                <Excalidraw
                    initialData={initialData}
                    excalidrawAPI={(api: any) => setExcalidrawAPI(api)}
                    onChange={onChange}
                    UIOptions={{
                        canvasActions: {
                            loadScene: false,
                            saveToActiveFile: false,
                            export: false,
                        }
                    }}
                />
            </WhiteboardErrorBoundary>
        </div>
    );
}
