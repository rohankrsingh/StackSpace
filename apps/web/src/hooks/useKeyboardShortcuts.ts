"use client";

import { useEffect, useCallback } from "react";

export interface Shortcut {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    action: () => void;
    description: string;
    category?: string;
}

export interface UseKeyboardShortcutsOptions {
    shortcuts: Shortcut[];
    enabled?: boolean;
}

/**
 * Custom hook for handling keyboard shortcuts
 * Designed to avoid conflicts with VS Code shortcuts by using Ctrl+Alt combinations
 */
export function useKeyboardShortcuts({
    shortcuts,
    enabled = true,
}: UseKeyboardShortcutsOptions) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!enabled) return;

            // Don't trigger shortcuts when typing in input fields (except for Escape)
            const target = event.target as HTMLElement;
            const isInputField =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable;

            for (const shortcut of shortcuts) {
                const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
                const altMatch = shortcut.alt ? event.altKey : !event.altKey;
                const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

                // Special case for Escape - always allow
                if (shortcut.key === "Escape" && event.key === "Escape") {
                    event.preventDefault();
                    shortcut.action();
                    return;
                }

                // Skip other shortcuts when in input fields
                if (isInputField && shortcut.key !== "Escape") continue;

                if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
                    event.preventDefault();
                    event.stopPropagation();
                    shortcut.action();
                    return;
                }
            }
        },
        [shortcuts, enabled]
    );

    useEffect(() => {
        if (enabled) {
            window.addEventListener("keydown", handleKeyDown, true);
            return () => {
                window.removeEventListener("keydown", handleKeyDown, true);
            };
        }
    }, [handleKeyDown, enabled]);
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: Shortcut): string {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push("Ctrl");
    if (shortcut.alt) parts.push("Alt");
    if (shortcut.shift) parts.push("Shift");
    if (shortcut.meta) parts.push("⌘");

    // Format special keys
    let key = shortcut.key;
    if (key === "Escape") key = "Esc";
    if (key === "/") key = "/";
    if (key === "?") key = "?";
    if (key === "1") key = "1";
    if (key === "2") key = "2";

    parts.push(key.toUpperCase());
    return parts.join(" + ");
}
