"use client";

import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const accentColors = [
    { name: "Red", value: "0 72.2% 50.6%" },
    { name: "Teal", value: "173.4 80.4% 40%" },
    { name: "Purple", value: "258.3 89.5% 66.3%" },
    { name: "Indigo", value: "238.7 83.5% 66.7%" },
    { name: "Cyan", value: "188.7 94.5% 42.7%" },
    { name: "Sky", value: "198.6 88.7% 48.4%" },
    { name: "Slate", value: "215.4 16.3% 46.9%" },
    { name: "Emerald", value: "160.1 84.1% 39.4%" },
    { name: "Green", value: "142.1 70.6% 45.3%" },
    { name: "Rose", value: "349.7 89.2% 60.2%" },
    { name: "Lime", value: "83.7 80.5% 44.3%" },
    { name: "Orange", value: "24.6 95% 53.1%" },
    { name: "Amber", value: "45.4 93.4% 47.5%" },
    { name: "Yellow", value: "47.9 95.8% 53.1%" },
    { name: "Fuchsia", value: "292.3 84.1% 60.6%" },
    { name: "Pink", value: "330.4 81.2% 60.4%" },
];

interface AccentSelectorProps {
    selectedColor: string;
    onSelect: (color: string) => void;
    disabled?: boolean;
}

export function AccentSelector({
    selectedColor,
    onSelect,
    disabled = false,
}: AccentSelectorProps) {
    return (
        <ScrollArea className="w-full whitespace-nowrap py-2">
            <div className="grid grid-cols-8 gap-3 max-sm:grid-cols-4">
                {accentColors.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => onSelect(color.value)}
                        disabled={disabled}
                        className={cn(
                            "group relative flex items-center justify-center size-12 cursor-pointer rounded-full border-2 transition-all duration-200",
                            "hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
                            selectedColor === color.value
                                ? "border-white/50 scale-95 ring-2 ring-white/30"
                                : "border-transparent hover:border-white/20",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        style={{
                            backgroundColor: `hsl(${color.value})`,
                        }}
                        title={color.name}
                    >
                        {selectedColor === color.value && (
                            <Check className="h-5 w-5 text-white drop-shadow-md" />
                        )}
                        <span className="sr-only">{color.name}</span>
                    </button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

export { accentColors };
