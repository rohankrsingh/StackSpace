"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Code, Edit3, Bell, Layout, Save, Check } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import { Separator } from "@/components/ui/separator";

export function RoomSettings() {
    const { preferences, updateMultiplePreferences, loading } = usePreferences();

    const [defaultView, setDefaultView] = useState(preferences.defaultView);
    const [showDockOnStart, setShowDockOnStart] = useState(preferences.showDockOnStart);
    const [enableSoundNotifications, setEnableSoundNotifications] = useState(preferences.enableSoundNotifications);

    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        setDefaultView(preferences.defaultView);
        setShowDockOnStart(preferences.showDockOnStart);
        setEnableSoundNotifications(preferences.enableSoundNotifications);
    }, [preferences]);

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        try {
            await updateMultiplePreferences({
                defaultView,
                showDockOnStart,
                enableSoundNotifications,
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save room settings:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2.5">
                <Loader2Spinner />
                <span className="text-xs font-mono tracking-wider uppercase animate-pulse">Loading preferences...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Default View */}
            <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-bold text-white tracking-tight">
                        <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                            <Layout className="h-4 w-4" />
                        </div>
                        Default Canvas View
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                        Choose which workspace panel loads by default when joining a collaborative room.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={defaultView}
                        onValueChange={(value: "ide" | "whiteboard") => setDefaultView(value)}
                        className="flex flex-col sm:flex-row gap-4"
                        disabled={saving}
                    >
                        {[
                            { val: "ide", title: "Code Editor", sub: "Open the VS Code style editor", icon: Code },
                            { val: "whiteboard", title: "Whiteboard Canvas", sub: "Open the collaborative sketchpad", icon: Edit3 }
                        ].map((opt) => {
                            const isSel = defaultView === opt.val;
                            return (
                                <label key={opt.val} htmlFor={opt.val} className="flex-1 cursor-pointer">
                                    <div className={`flex items-center space-x-3 p-4 border rounded-xl transition-all duration-200 ${
                                        isSel
                                            ? "border-green-500 bg-green-500/5 text-white"
                                            : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                    }`}>
                                        <RadioGroupItem value={opt.val} id={opt.val} className="sr-only" />
                                        <opt.icon className="h-5 w-5 shrink-0 text-green-500/80" />
                                        <div className="text-left min-w-0">
                                            <p className="font-bold text-xs">{opt.title}</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{opt.sub}</p>
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* UI Preferences */}
            <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader>
                    <CardTitle className="text-base font-bold text-white tracking-tight">Interface Preferences</CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                        Customize visual details and sound alert cues.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="showDock" className="text-xs font-semibold text-zinc-400">Show Dock on Room Start</Label>
                            <p className="text-xs text-zinc-500">
                                Show the bottom settings dock immediately upon entering.
                            </p>
                        </div>
                        <Switch
                            id="showDock"
                            checked={showDockOnStart}
                            onCheckedChange={setShowDockOnStart}
                            disabled={saving}
                            className="data-[state=checked]:bg-green-500"
                        />
                    </div>

                    <Separator className="bg-zinc-900" />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="soundNotifications" className="flex items-center gap-1 text-xs font-semibold text-zinc-400">
                                <Bell className="h-3.5 w-3.5 text-zinc-500" />
                                Audio Event Alerts
                            </Label>
                            <p className="text-xs text-zinc-500">
                                Play subtle notification sounds for chats and peer join states.
                            </p>
                        </div>
                        <Switch
                            id="soundNotifications"
                            checked={enableSoundNotifications}
                            onCheckedChange={setEnableSoundNotifications}
                            disabled={saving}
                            className="data-[state=checked]:bg-green-500"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center gap-4">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold shadow-lg shadow-green-950/20 px-6 h-10"
                >
                    {saving ? (
                        <>
                            <Loader2Spinner className="mr-2 h-4 w-4 text-black" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
                {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-xs text-green-400 font-mono">
                        <Check className="h-4 w-4 stroke-[3]" />
                        Saved successfully!
                    </span>
                )}
            </div>
        </div>
    );
}

function Loader2Spinner({ className = "" }: { className?: string }) {
    return (
        <svg className={`animate-spin h-5 w-5 ${className || "text-green-500"}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );
}
