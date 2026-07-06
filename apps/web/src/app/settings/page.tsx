"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { User, Palette, Settings, UserCog, ArrowLeft, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { CustomizationSettings } from "@/components/settings/CustomizationSettings";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { RoomSettings } from "@/components/settings/RoomSettings";
import { Separator } from "@/components/ui/separator";

const sidebarItems = [
    { id: "profile", icon: User, label: "Profile", description: "Avatar and display info" },
    { id: "customization", icon: Palette, label: "Customization", description: "Theme and appearance" },
    { id: "room", icon: Monitor, label: "Room Preferences", description: "Default room settings" },
    { id: "account", icon: UserCog, label: "Account", description: "Security and passwords" },
] as const;

function SettingsContent() {
    const [activeTab, setActiveTab] = useState<string>("profile");

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return <ProfileSettings />;
            case "customization":
                return <CustomizationSettings />;
            case "room":
                return <RoomSettings />;
            case "account":
                return <AccountSettings />;
            default:
                return <ProfileSettings />;
        }
    };

    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-zinc-900 bg-black/60 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex h-16 items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900/60">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Settings className="h-5 w-5 text-green-500" />
                            </div>
                            <h1 className="text-lg font-bold tracking-tight text-white">Settings</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0">
                    <nav className="space-y-1.5 md:sticky md:top-24">
                        {sidebarItems.map((item) => {
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-left group",
                                        isActive
                                            ? "bg-green-500 text-black shadow-lg shadow-green-950/20 font-semibold"
                                            : "hover:bg-zinc-900/40 text-zinc-400 hover:text-white"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        isActive
                                            ? "bg-black/10 text-black"
                                            : "bg-zinc-900 text-zinc-400 group-hover:text-white"
                                    )}>
                                        <item.icon className="h-4 w-4 shrink-0" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm tracking-tight">{item.label}</p>
                                        <p className={cn(
                                            "text-[10px] tracking-tight mt-0.5",
                                            isActive
                                                ? "text-black/70"
                                                : "text-zinc-500"
                                        )}>
                                            {item.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator orientation="vertical" className="hidden md:block bg-zinc-900 h-auto self-stretch w-px" />

                {/* Content Area */}
                <main className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-extrabold text-white tracking-tight leading-none">
                                    {sidebarItems.find((item) => item.id === activeTab)?.label}
                                </h2>
                                <p className="text-zinc-500 mt-2 text-xs">
                                    {sidebarItems.find((item) => item.id === activeTab)?.description}
                                </p>
                            </div>
                            
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <ProtectedRoute>
            <SettingsContent />
        </ProtectedRoute>
    );
}
