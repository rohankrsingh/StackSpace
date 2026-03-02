"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
    UserPreferences,
    DEFAULT_PREFERENCES,
    getUserPreferences,
    updateUserPreferences,
    resetPreferences,
} from "@/lib/preferences";

interface PreferencesContextType {
    preferences: UserPreferences;
    loading: boolean;
    error: string | null;
    updatePreference: <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
    ) => Promise<void>;
    updateMultiplePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
    resetToDefaults: () => Promise<void>;
    refetch: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPreferences = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const prefs = await getUserPreferences();
            setPreferences(prefs);
        } catch (err) {
            setError("Failed to load preferences");
            console.error("Failed to load preferences:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPreferences();
    }, [fetchPreferences]);

    // Apply theme preference
    useEffect(() => {
        if (preferences.theme === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
        } else if (preferences.theme === "light") {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
        } else {
            // System preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            if (prefersDark) {
                document.documentElement.classList.add("dark");
                document.documentElement.classList.remove("light");
            } else {
                document.documentElement.classList.remove("dark");
                document.documentElement.classList.add("light");
            }
        }
    }, [preferences.theme]);

    // Apply accent color
    useEffect(() => {
        if (preferences.accentColor) {
            document.documentElement.style.setProperty("--accent", preferences.accentColor);
            document.documentElement.style.setProperty("--primary", preferences.accentColor);
        }
    }, [preferences.accentColor]);

    // Apply font family
    useEffect(() => {
        if (preferences.fontFamily) {
            document.documentElement.style.setProperty("--font-sans", preferences.fontFamily);
        }
    }, [preferences.fontFamily]);

    const updatePreference = useCallback(
        async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
            try {
                setError(null);
                const updatedPrefs = await updateUserPreferences({ [key]: value });
                setPreferences(updatedPrefs);
            } catch (err) {
                setError("Failed to update preference");
                throw err;
            }
        },
        []
    );

    const updateMultiplePreferences = useCallback(
        async (prefs: Partial<UserPreferences>) => {
            try {
                setError(null);
                const updatedPrefs = await updateUserPreferences(prefs);
                setPreferences(updatedPrefs);
            } catch (err) {
                setError("Failed to update preferences");
                throw err;
            }
        },
        []
    );

    const resetToDefaults = useCallback(async () => {
        try {
            setError(null);
            const defaultPrefs = await resetPreferences();
            setPreferences(defaultPrefs);
        } catch (err) {
            setError("Failed to reset preferences");
            throw err;
        }
    }, []);

    return (
        <PreferencesContext.Provider
            value={{
                preferences,
                loading,
                error,
                updatePreference,
                updateMultiplePreferences,
                resetToDefaults,
                refetch: fetchPreferences,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error("usePreferences must be used within a PreferencesProvider");
    }
    return context;
}
