"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Palette, Monitor, Moon, Sun, Save, RotateCcw, Code, Check } from "lucide-react";
import { usePreferences } from "@/components/PreferencesProvider";
import { AccentSelector } from "./AccentSelector";
import { Separator } from "@/components/ui/separator";

const fontOptions = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Poppins", label: "Poppins" },
    { value: "Source Code Pro", label: "Source Code Pro" },
    { value: "JetBrains Mono", label: "JetBrains Mono" },
    { value: "Fira Code", label: "Fira Code" },
];

const fontSizeOptions = [
    { value: "small", label: "Small (14px)" },
    { value: "medium", label: "Medium (16px)" },
    { value: "large", label: "Large (18px)" },
];

const editorThemeOptions = [
    { value: "vs-dark", label: "VS Dark" },
    { value: "vs-light", label: "VS Light" },
    { value: "hc-black", label: "High Contrast" },
    { value: "monokai", label: "Monokai" },
    { value: "github-dark", label: "GitHub Dark" },
    { value: "dracula", label: "Dracula" },
];

import { addToast } from "@heroui/react";

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
                color: "primary",
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
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Theme Selection */}
            <Card className="border-border/50">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <Palette className="h-4 w-4 text-primary" />
                        </div>
                        Appearance
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Customize the look and feel of your workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Site Theme */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Site Theme</Label>
                        <RadioGroup
                            value={theme}
                            onValueChange={(value: "light" | "dark" | "system") => setTheme(value)}
                            className="flex flex-wrap gap-3"
                            disabled={saving}
                        >
                            <label htmlFor="light" className="cursor-pointer">
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${theme === "light"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-muted-foreground/30"
                                    }`}>
                                    <RadioGroupItem value="light" id="light" className="sr-only" />
                                    <Sun className="h-4 w-4" />
                                    <span className="text-sm font-medium">Light</span>
                                </div>
                            </label>
                            <label htmlFor="dark" className="cursor-pointer">
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${theme === "dark"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-muted-foreground/30"
                                    }`}>
                                    <RadioGroupItem value="dark" id="dark" className="sr-only" />
                                    <Moon className="h-4 w-4" />
                                    <span className="text-sm font-medium">Dark</span>
                                </div>
                            </label>
                            <label htmlFor="system" className="cursor-pointer">
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${theme === "system"
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-muted-foreground/30"
                                    }`}>
                                    <RadioGroupItem value="system" id="system" className="sr-only" />
                                    <Monitor className="h-4 w-4" />
                                    <span className="text-sm font-medium">System</span>
                                </div>
                            </label>
                        </RadioGroup>
                    </div>

                    <Separator />

                    {/* Accent Color */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Accent Color</Label>
                        <p className="text-sm text-muted-foreground">
                            Choose a color that highlights important elements.
                        </p>
                        <AccentSelector
                            selectedColor={accentColor}
                            onSelect={setAccentColor}
                            disabled={saving}
                        />
                    </div>

                    <Separator />

                    {/* Font Settings */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fontFamily" className="text-sm font-medium">Font Family</Label>
                            <Select
                                value={fontFamily}
                                onValueChange={setFontFamily}
                                disabled={saving}
                            >
                                <SelectTrigger id="fontFamily" className="h-10">
                                    <SelectValue placeholder="Select font" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fontOptions.map((font) => (
                                        <SelectItem key={font.value} value={font.value}>
                                            <span style={{ fontFamily: font.value }} className="font-medium">
                                                {font.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fontSize" className="text-sm font-medium">Font Size</Label>
                            <Select
                                value={fontSize}
                                onValueChange={(value: "small" | "medium" | "large") => setFontSize(value)}
                                disabled={saving}
                            >
                                <SelectTrigger id="fontSize" className="h-10">
                                    <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fontSizeOptions.map((size) => (
                                        <SelectItem key={size.value} value={size.value}>
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
            <Card className="border-border/50">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold tracking-tight">
                        <div className="p-1.5 rounded-md bg-primary/10">
                            <Code className="h-4 w-4 text-primary" />
                        </div>
                        Editor Preferences
                    </CardTitle>
                    <CardDescription className="text-sm">
                        Configure your code editor experience.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="editorTheme" className="text-sm font-medium">Editor Theme</Label>
                            <Select
                                value={editorTheme}
                                onValueChange={setEditorTheme}
                                disabled={saving}
                            >
                                <SelectTrigger id="editorTheme" className="h-10">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    {editorThemeOptions.map((theme) => (
                                        <SelectItem key={theme.value} value={theme.value}>
                                            {theme.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tabSize" className="text-sm font-medium">Tab Size</Label>
                            <Select
                                value={String(tabSize)}
                                onValueChange={(value: string) => setTabSize(Number(value))}
                                disabled={saving}
                            >
                                <SelectTrigger id="tabSize" className="h-10">
                                    <SelectValue placeholder="Select tab size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">2 spaces</SelectItem>
                                    <SelectItem value="4">4 spaces</SelectItem>
                                    <SelectItem value="8">8 spaces</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
                        <div className="space-y-1">
                            <Label htmlFor="wordWrap" className="text-sm font-medium">Word Wrap</Label>
                            <p className="text-sm text-muted-foreground">
                                Wrap long lines in the editor automatically.
                            </p>
                        </div>
                        <Switch
                            id="wordWrap"
                            checked={wordWrap}
                            onCheckedChange={setWordWrap}
                            disabled={saving}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-2">
                <Button onClick={handleSave} disabled={saving || resetting} className="h-10 px-6">
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
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={saving || resetting}
                    className="h-10"
                >
                    {resetting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                    <span className="flex items-center gap-1.5 text-sm text-green-500 font-medium">
                        <Check className="h-4 w-4" />
                        Settings saved successfully!
                    </span>
                )}
            </div>
        </div>
    );
}
