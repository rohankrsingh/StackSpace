"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, User, Check } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import { AvatarSelector } from "./AvatarSelector";
import { updateName } from "@/lib/preferences";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Separator } from "@/components/ui/separator";

import { addToast } from "@heroui/react";

export function ProfileSettings() {
    const { preferences, updatePreference, loading } = usePreferences();
    const user = useSelector((state: RootState) => state.auth.user);

    const [name, setName] = useState(user?.name || "");
    const [bio, setBio] = useState(preferences.bio || "");
    const [selectedAvatar, setSelectedAvatar] = useState(preferences.avatar || "");
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (user?.name) setName(user.name);
    }, [user?.name]);

    useEffect(() => {
        setBio(preferences.bio || "");
        setSelectedAvatar(preferences.avatar || "");
    }, [preferences.bio, preferences.avatar]);

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        try {
            // Update name via Appwrite account
            if (name !== user?.name) {
                await updateName(name);
            }

            // Update preferences
            await updatePreference("bio", bio);
            if (selectedAvatar) {
                await updatePreference("avatar", selectedAvatar);
            }

            setSaveSuccess(true);
            addToast({
                title: "Profile Updated",
                description: "Your profile changes have been saved successfully.",
                color: "success",
                variant: "flat"
            });
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error: any) {
            console.error("Failed to save profile:", error);
            addToast({
                title: "Update Failed",
                description: error.message || "Failed to save profile changes.",
                color: "danger",
                variant: "flat"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Avatar Selection */}
            <Card className="border-border/50">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        Avatar
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Choose an avatar that represents you in the collaborative workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Current Avatar Preview */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-border shadow-lg">
                            <AvatarImage src={selectedAvatar || undefined} alt="Avatar" />
                            <AvatarFallback className="text-xl font-semibold bg-muted">
                                {name.slice(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-base tracking-tight">{name || "Your Name"}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Avatar Options */}
                    <div>
                        <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                            Select an avatar style
                        </Label>
                        <AvatarSelector
                            selectedAvatar={selectedAvatar}
                            onSelect={handleAvatarSelect}
                            userName={name || "user"}
                            disabled={saving}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Profile Information */}
            <Card className="border-border/50">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold tracking-tight">Profile Information</CardTitle>
                    <CardDescription className="text-sm">
                        Update your display name and bio visible to other users.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your display name"
                            disabled={saving}
                            className="h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell others a bit about yourself..."
                            rows={3}
                            disabled={saving}
                            className="resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            {bio.length}/200 characters
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-2">
                <Button onClick={handleSave} disabled={saving} className="h-10 px-6">
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
                    <span className="flex items-center gap-1.5 text-sm text-green-500 font-medium">
                        <Check className="h-4 w-4" />
                        Profile saved successfully!
                    </span>
                )}
            </div>
        </div>
    );
}
