"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Loader2, Code, Edit3, Bell, Layout, Save } from "lucide-react";
import LoaderKokonut from "@/components/kokonutui/loader";
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
            <div className="flex items-center justify-center h-64">
                <LoaderKokonut
                    title="Loading Preferences..."
                    subtitle="Getting your personalized settings"
                    size="sm"
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Default View */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layout className="h-5 w-5" />
                        Default View
                    </CardTitle>
                    <CardDescription>
                        Choose which view opens by default when you join a room.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={defaultView}
                        onValueChange={(value: "ide" | "whiteboard") => setDefaultView(value)}
                        className="flex gap-6"
                        disabled={saving}
                    >
                        <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="ide" id="ide" />
                            <Label htmlFor="ide" className="flex items-center gap-2 cursor-pointer">
                                <Code className="h-5 w-5" />
                                <div>
                                    <p className="font-medium">Code Editor</p>
                                    <p className="text-xs text-muted-foreground">Start with the VS Code editor</p>
                                </div>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value="whiteboard" id="whiteboard" />
                            <Label htmlFor="whiteboard" className="flex items-center gap-2 cursor-pointer">
                                <Edit3 className="h-5 w-5" />
                                <div>
                                    <p className="font-medium">Whiteboard</p>
                                    <p className="text-xs text-muted-foreground">Start with the collaborative canvas</p>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            {/* UI Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Interface Preferences</CardTitle>
                    <CardDescription>
                        Customize how the room interface behaves.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="showDock">Show Dock on Room Start</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically show the dock when you join a room.
                            </p>
                        </div>
                        <Switch
                            id="showDock"
                            checked={showDockOnStart}
                            onCheckedChange={setShowDockOnStart}
                            disabled={saving}
                        />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="soundNotifications" className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Sound Notifications
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Play sounds for new messages and user join/leave events.
                            </p>
                        </div>
                        <Switch
                            id="soundNotifications"
                            checked={enableSoundNotifications}
                            onCheckedChange={setEnableSoundNotifications}
                            disabled={saving}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center gap-4">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                    <span className="text-sm text-green-500">Settings saved successfully!</span>
                )}
            </div>
        </div>
    );
}
