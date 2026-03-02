"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { User, Palette, Settings, UserCog, ArrowLeft, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PreferencesProvider } from "@/components/PreferencesProvider";
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
];

function SettingsContent() {
    const [activeTab, setActiveTab] = useState("profile");

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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Settings className="h-5 w-5 text-primary" />
                            </div>
                            <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-full md:w-72 shrink-0">
                        <nav className="space-y-1.5 md:sticky md:top-24">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left group",
                                        activeTab === item.id
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                            : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        activeTab === item.id
                                            ? "bg-primary-foreground/20"
                                            : "bg-muted group-hover:bg-background"
                                    )}>
                                        <item.icon className="h-4 w-4 shrink-0" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm tracking-tight">{item.label}</p>
                                        <p className={cn(
                                            "text-xs tracking-tight mt-0.5",
                                            activeTab === item.id
                                                ? "text-primary-foreground/70"
                                                : "text-muted-foreground"
                                        )}>
                                            {item.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <Separator orientation="vertical" className="hidden md:block h-auto" />

                    {/* Content Area */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold tracking-tight">
                                        {sidebarItems.find((item) => item.id === activeTab)?.label}
                                    </h2>
                                    <p className="text-muted-foreground mt-2 text-sm">
                                        {sidebarItems.find((item) => item.id === activeTab)?.description}
                                    </p>
                                </div>
                                <PreferencesProvider>
                                    {renderContent()}
                                </PreferencesProvider>
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
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
