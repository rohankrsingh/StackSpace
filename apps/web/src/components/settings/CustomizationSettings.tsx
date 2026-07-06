"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Palette, Monitor, Moon, Sun, Save, RotateCcw, Code, Check } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import { AccentSelector } from "./AccentSelector";
import { Separator } from "@/components/ui/separator";
import { addToast } from "@heroui/react";

const fontOptions = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Poppins", label: "Poppins" },
    { value: "Source Code Pro", label: "Source Code Pro" },
    { value: "JetBrains Mono", label: "JetBrains Mono" },
    { value: "Fira Code", label: "Fira Code" },
] as const;

const fontSizeOptions = [
    { value: "small", label: "Small (14px)" },
    { value: "medium", label: "Medium (16px)" },
    { value: "large", label: "Large (18px)" },
] as const;

const editorThemeOptions = [
    { value: "vs-dark", label: "VS Dark" },
    { value: "vs-light", label: "VS Light" },
    { value: "hc-black", label: "High Contrast" },
    { value: "monokai", label: "Monokai" },
    { value: "github-dark", label: "GitHub Dark" },
    { value: "dracula", label: "Dracula" },
] as const;

export function CustomizationSettings() {
    const { preferences, updateMultiplePreferences, resetToDefaults, loading } = usePreferences();

    const [saving, setSaving] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Local state for changes
    const [theme, setTheme] = useState(preferences.theme);
    const [accentColor, setAccentColor] = useState(preferences.accentColor);
    const [fontFamily, setFontFamily] = useState(preferences.fontFamily);
    const [fontSize, setFontSize] = useState(preferences.fontSize);
    const [editorTheme, setEditorTheme] = useState(preferences.editorTheme);
    const [tabSize, setTabSize] = useState(preferences.tabSize);
    const [wordWrap, setWordWrap] = useState(preferences.wordWrap);

    React.useEffect(() => {
        setTheme(preferences.theme);
        setAccentColor(preferences.accentColor);
        setFontFamily(preferences.fontFamily);
        setFontSize(preferences.fontSize);
        setEditorTheme(preferences.editorTheme);
        setTabSize(preferences.tabSize);
        setWordWrap(preferences.wordWrap);
    }, [preferences]);

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        try {
            await updateMultiplePreferences({
                theme,
                accentColor,
                fontFamily,
                fontSize,
                editorTheme,
                tabSize,
                wordWrap,
            });
            setSaveSuccess(true);
            addToast({
                title: "Settings Saved",
                description: "Your workspace preferences have been updated.",
                color: "success",
                variant: "flat"
            });
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error: any) {
            console.error("Failed to save customization:", error);
            addToast({
                title: "Save Failed",
                description: error.message || "Failed to save workspace preferences.",
                color: "danger",
                variant: "flat"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        setResetting(true);
        try {
            await resetToDefaults();
            addToast({
                title: "Settings Reset",
                description: "Preferences have been restored to default values.",
                color: "success",
                variant: "flat"
            });
        } catch (error: any) {
            console.error("Failed to reset preferences:", error);
            addToast({
                title: "Reset Failed",
                description: error.message || "Failed to reset preferences.",
                color: "danger",
                variant: "flat"
            });
        } finally {
            setResetting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-2.5">
                <Loader2Spinner />
                <span className="text-xs font-mono tracking-wider uppercase animate-pulse">Loading settings...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Theme Selection */}
            <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
                        <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                            <Palette className="h-4 w-4" />
                        </div>
                        Workspace Appearance
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                        Customize the theme and accents of your workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Site Theme */}
                    <div className="space-y-3">
                        <Label className="text-xs font-semibold text-zinc-400">Site Theme</Label>
                        <RadioGroup
                            value={theme}
                            onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}
                            className="flex flex-wrap gap-3"
                            disabled={saving}
                        >
                            {[
                                { val: "light", label: "Light", icon: Sun },
                                { val: "dark", label: "Dark", icon: Moon },
                                { val: "system", label: "System", icon: Monitor },
                            ].map((opt) => {
                                const isSel = theme === opt.val;
                                return (
                                    <label key={opt.val} htmlFor={opt.val} className="cursor-pointer">
                                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                                            isSel
                                                ? "border-green-500 bg-green-500/5 text-white"
                                                : "border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:border-zinc-700 hover:text-white"
                                        }`}>
                                            <RadioGroupItem value={opt.val} id={opt.val} className="sr-only" />
                                            <opt.icon className="h-4 w-4" />
                                            <span className="text-xs font-medium">{opt.label}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </RadioGroup>
                    </div>

                    <Separator className="bg-zinc-900" />

                    {/* Accent Color */}
                    <div className="space-y-3">
                        <Label className="text-xs font-semibold text-zinc-400">Accent Color</Label>
                        <p className="text-xs text-zinc-500">
                            Select a dashboard highlight color for active panels.
                        </p>
                        <AccentSelector
                            selectedColor={accentColor}
                            onSelect={setAccentColor}
                            disabled={saving}
                        />
                    </div>

                    <Separator className="bg-zinc-900" />

                    {/* Font Settings */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fontFamily" className="text-xs font-semibold text-zinc-400">Font Family</Label>
                            <Select
                                value={fontFamily}
                                onValueChange={setFontFamily}
                                disabled={saving}
                            >
                                <SelectTrigger id="fontFamily" className="h-10 bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-lg focus:ring-green-500/20">
                                    <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300">
                                    {fontOptions.map((font) => (
                                        <SelectItem key={font.value} value={font.value} className="focus:bg-zinc-900 focus:text-white cursor-pointer text-xs">
                                            <span style={{ fontFamily: font.value }}>
                                                {font.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fontSize" className="text-xs font-semibold text-zinc-400">Font Size</Label>
                            <Select
                                value={fontSize}
                                onValueChange={(value: "small" | "medium" | "large") => setFontSize(value)}
                                disabled={saving}
                            >
                                <SelectTrigger id="fontSize" className="h-10 bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-lg focus:ring-green-500/20">
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300 text-xs">
                                    {fontSizeOptions.map((size) => (
                                        <SelectItem key={size.value} value={size.value} className="focus:bg-zinc-900 focus:text-white cursor-pointer text-xs">
                                            {size.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Editor Settings */}
            <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-bold tracking-tight text-white">
                        <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                            <Code className="h-4 w-4" />
                        </div>
                        Editor Configurations
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                        Configure the defaults for your browser editor terminals.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="editorTheme" className="text-xs font-semibold text-zinc-400">Editor Theme</Label>
                            <Select
                                value={editorTheme}
                                onValueChange={setEditorTheme}
                                disabled={saving}
                            >
                                <SelectTrigger id="editorTheme" className="h-10 bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-lg focus:ring-green-500/20">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300 text-xs">
                                    {editorThemeOptions.map((themeOpt) => (
                                        <SelectItem key={themeOpt.value} value={themeOpt.value} className="focus:bg-zinc-900 focus:text-white cursor-pointer text-xs">
                                            {themeOpt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tabSize" className="text-xs font-semibold text-zinc-400">Tab Size</Label>
                            <Select
                                value={String(tabSize)}
                                onValueChange={(value: string) => setTabSize(Number(value))}
                                disabled={saving}
                            >
                                <SelectTrigger id="tabSize" className="h-10 bg-zinc-900 border-zinc-800 text-zinc-100 text-xs rounded-lg focus:ring-green-500/20">
                                    <SelectValue placeholder="Select tab size" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-900 text-zinc-300 text-xs">
                                    <SelectItem value="2" className="focus:bg-zinc-900 focus:text-white cursor-pointer">2 spaces</SelectItem>
                                    <SelectItem value="4" className="focus:bg-zinc-900 focus:text-white cursor-pointer">4 spaces</SelectItem>
                                    <SelectItem value="8" className="focus:bg-zinc-900 focus:text-white cursor-pointer">8 spaces</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-900">
                        <div className="space-y-1">
                            <Label htmlFor="wordWrap" className="text-xs font-semibold text-zinc-400">Word Wrap</Label>
                            <p className="text-xs text-zinc-500">
                                Automatically wrap extra long lines in the code preview pane.
                            </p>
                        </div>
                        <Switch
                            id="wordWrap"
                            checked={wordWrap}
                            onCheckedChange={setWordWrap}
                            disabled={saving}
                            className="data-[state=checked]:bg-green-500"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
                <Button
                    onClick={handleSave}
                    disabled={saving || resetting}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-black font-semibold shadow-lg shadow-green-950/20 px-6 h-10"
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
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={saving || resetting}
                    className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white h-10 px-6 rounded-lg"
                >
                    {resetting ? (
                        <>
                            <Loader2Spinner className="mr-2 h-4 w-4" />
                            Resetting...
                        </>
                    ) : (
                        <>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset to Defaults
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
