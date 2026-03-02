"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { Shortcut, formatShortcut } from "@/hooks/useKeyboardShortcuts";
import { Separator } from "@/components/ui/separator";

interface ShortcutsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shortcuts: Shortcut[];
}

export function ShortcutsDialog({
    open,
    onOpenChange,
    shortcuts,
}: ShortcutsDialogProps) {
    // Group shortcuts by category
    const groupedShortcuts = shortcuts.reduce(
        (acc, shortcut) => {
            const category = shortcut.category || "General";
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(shortcut);
            return acc;
        },
        {} as Record<string, Shortcut[]>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Keyboard Shortcuts
                    </DialogTitle>
                    <DialogDescription>
                        Quick access shortcuts. These are designed to not conflict with VS Code.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                        <div key={category}>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                {category}
                            </h4>
                            <div className="space-y-2">
                                {categoryShortcuts.map((shortcut, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors"
                                    >
                                        <span className="text-sm">{shortcut.description}</span>
                                        <ShortcutKeys shortcut={shortcut} />
                                    </div>
                                ))}
                            </div>
                            {Object.keys(groupedShortcuts).indexOf(category) <
                                Object.keys(groupedShortcuts).length - 1 && (
                                    <Separator className="mt-3" />
                                )}
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground text-center">
                        Press <Kbd>Esc</Kbd> to close
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ShortcutKeys({ shortcut }: { shortcut: Shortcut }) {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push("Ctrl");
    if (shortcut.alt) parts.push("Alt");
    if (shortcut.shift) parts.push("Shift");

    let key = shortcut.key;
    if (key === "Escape") key = "Esc";

    return (
        <div className="flex items-center gap-1">
            {parts.map((part, i) => (
                <React.Fragment key={part}>
                    <Kbd>{part}</Kbd>
                    <span className="text-muted-foreground text-xs">+</span>
                </React.Fragment>
            ))}
            <Kbd>{key.toUpperCase()}</Kbd>
        </div>
    );
}
