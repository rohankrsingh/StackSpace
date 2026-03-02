"use client";

import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Avatar options using DiceBear API for variety
const avatarStyles = [
    "adventurer",
    "adventurer-neutral",
    "avataaars",
    "avataaars-neutral",
    "big-ears",
    "big-ears-neutral",
    "big-smile",
    "bottts",
    "bottts-neutral",
    "croodles",
    "croodles-neutral",
    "fun-emoji",
    "icons",
    "identicon",
    "initials",
    "lorelei",
    "lorelei-neutral",
    "micah",
    "miniavs",
    "notionists",
    "notionists-neutral",
    "open-peeps",
    "personas",
    "pixel-art",
    "pixel-art-neutral",
    "rings",
    "shapes",
    "thumbs",
];

// Generate avatar URLs
const generateAvatarUrl = (style: string, seed: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
};

interface AvatarSelectorProps {
    selectedAvatar: string;
    onSelect: (avatarUrl: string) => void;
    userName: string;
    disabled?: boolean;
}

export function AvatarSelector({
    selectedAvatar,
    onSelect,
    userName,
    disabled = false,
}: AvatarSelectorProps) {
    const seed = userName || "user";

    return (
        <ScrollArea className="w-full">
            <div className="grid grid-cols-7 gap-3 py-2 max-sm:grid-cols-4">
                {avatarStyles.slice(0, 21).map((style) => {
                    const avatarUrl = generateAvatarUrl(style, seed);
                    const isSelected = selectedAvatar === avatarUrl;

                    return (
                        <button
                            key={style}
                            onClick={() => onSelect(avatarUrl)}
                            disabled={disabled}
                            className={cn(
                                "group relative flex items-center justify-center transition-all duration-200",
                                "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-full",
                                isSelected && "ring-2 ring-primary",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                            title={style.replace(/-/g, " ")}
                        >
                            <Avatar className="h-12 w-12 border-2 border-muted">
                                <AvatarImage src={avatarUrl} alt={style} />
                                <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                                    <Check className="h-5 w-5 text-white" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

export { avatarStyles, generateAvatarUrl };
