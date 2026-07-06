"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, User, Check } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import { AvatarSelector } from "./AvatarSelector";
import { updateName } from "@/lib/preferences";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { updateUserFields } from "@/store/slices/authSlice";
import { Separator } from "@/components/ui/separator";
import { addToast } from "@heroui/react";

export function ProfileSettings() {
    const { preferences, updatePreference, loading } = usePreferences();
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();

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
                dispatch(updateUserFields({ name }));
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

    const getInitials = (nameStr: string) => {
        return nameStr
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2.5">
                <Loader2Spinner />
                <span className="text-xs font-mono tracking-wider uppercase animate-pulse">Loading profile...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Avatar Selection */}
            <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
                        <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                            <User className="h-4 w-4" />
                        </div>
                        Avatar Selection
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                        Choose an avatar style to represent you in the collaborative workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    {/* Current Avatar Preview */}
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 p-0.5">
                            <Avatar className="h-full w-full border-2 border-zinc-950">
                                <AvatarImage src={selectedAvatar || undefined} alt="Avatar" />
                                <AvatarFallback className="text-lg font-bold bg-zinc-900 text-zinc-300">
                                    {getInitials(name || "U")}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <p className="font-bold text-base tracking-tight text-white">{name || "Your Name"}</p>
                            <p className="text-xs text-zinc-500 mt-1">{user?.email}</p>
                        </div>
                    </div>

                    <Separator className="bg-zinc-900" />

                    {/* Avatar Options */}
                    <div>
                        <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 block">
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
            <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold tracking-tight text-white">Profile Information</CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                        Update your display name and public bio.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs font-semibold text-zinc-400">Display Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your display name"
                            disabled={saving}
                            className="h-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/30 text-xs rounded-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-xs font-semibold text-zinc-400">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell others a bit about yourself..."
                            rows={3}
                            disabled={saving}
                            className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/30 text-xs rounded-lg resize-none"
                        />
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                            <span>Markdown is supported</span>
                            <span>{bio.length}/200 characters</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-2">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold shadow-lg shadow-green-950/20 px-6"
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
