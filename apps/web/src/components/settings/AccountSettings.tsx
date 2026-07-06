"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, AlertTriangle, Eye, EyeOff, ShieldAlert, Check } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { updateUserFields } from "@/store/slices/authSlice";
import { updatePassword, updateEmail } from "@/lib/preferences";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AccountSettings() {
    const user = useSelector((state: RootState) => state.auth.user);
    const dispatch = useDispatch();

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Email change state
    const [newEmail, setNewEmail] = useState("");
    const [emailPassword, setEmailPassword] = useState("");
    const [emailSaving, setEmailSaving] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailSuccess, setEmailSuccess] = useState(false);

    const handlePasswordChange = async () => {
        setPasswordError(null);
        setPasswordSuccess(false);

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters long.");
            return;
        }

        setPasswordSaving(true);
        try {
            await updatePassword(currentPassword, newPassword);
            setPasswordSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPasswordSuccess(false), 5000);
        } catch (error: any) {
            if (error.code === 401) {
                setPasswordError("Current password is incorrect.");
            } else {
                setPasswordError("Failed to update password. Please try again.");
            }
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleEmailChange = async () => {
        setEmailError(null);
        setEmailSuccess(false);

        // Validation
        if (!newEmail || !emailPassword) {
            setEmailError("Please fill in all fields.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            setEmailError("Please enter a valid email address.");
            return;
        }

        setEmailSaving(true);
        try {
            await updateEmail(newEmail, emailPassword);
            dispatch(updateUserFields({ email: newEmail }));
            setEmailSuccess(true);
            setNewEmail("");
            setEmailPassword("");
            setTimeout(() => setEmailSuccess(false), 5000);
        } catch (error: any) {
            if (error.code === 401) {
                setEmailError("Password is incorrect.");
            } else if (error.code === 409) {
                setEmailError("This email is already in use.");
            } else {
                setEmailError("Failed to update email. Please try again.");
            }
        } finally {
            setEmailSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Current Account Info */}
            <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader>
                    <CardTitle className="text-base font-bold text-white tracking-tight">Account Information</CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                        Your registered display details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-900">
                            <Label className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Display Name</Label>
                            <p className="font-semibold text-sm text-white mt-1">{user?.name || "Not set"}</p>
                        </div>
                        <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-900">
                            <Label className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Email Address</Label>
                            <p className="font-semibold text-sm text-white mt-1">{user?.email || "Not set"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-bold text-white tracking-tight">
                        <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                            <Lock className="h-4 w-4" />
                        </div>
                        Change Password
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                        Update your password to keep your developer credentials secure.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {passwordError && (
                        <Alert className="border-red-950 bg-red-950/10 text-red-400">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                            <AlertTitle className="text-xs font-bold uppercase tracking-wider">Update Error</AlertTitle>
                            <AlertDescription className="text-xs">{passwordError}</AlertDescription>
                        </Alert>
                    )}

                    {passwordSuccess && (
                        <Alert className="border-green-950 bg-green-950/10 text-green-400">
                            <Check className="h-4 w-4 shrink-0 text-green-400" />
                            <AlertTitle className="text-xs font-bold uppercase tracking-wider">Success!</AlertTitle>
                            <AlertDescription className="text-xs">
                                Your account password has been updated.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-xs font-semibold text-zinc-400">Current Password</Label>
                        <Input
                            id="currentPassword"
                            type={showPasswords ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            disabled={passwordSaving}
                            className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/30 text-xs rounded-lg h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-xs font-semibold text-zinc-400">New Password</Label>
                        <Input
                            id="newPassword"
                            type={showPasswords ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            disabled={passwordSaving}
                            className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/30 text-xs rounded-lg h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-xs font-semibold text-zinc-400">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type={showPasswords ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            disabled={passwordSaving}
                            className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/30 text-xs rounded-lg h-10"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                            className="text-zinc-400 hover:text-white hover:bg-zinc-900/60 text-xs"
                        >
                            {showPasswords ? (
                                <><EyeOff className="mr-2 h-3.5 w-3.5" /> Hide Passwords</>
                            ) : (
                                <><Eye className="mr-2 h-3.5 w-3.5" /> Show Passwords</>
                            )}
                        </Button>
                    </div>

                    <Button
                        onClick={handlePasswordChange}
                        disabled={passwordSaving}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold border border-zinc-800 transition-colors h-10 px-5 text-xs rounded-lg mt-2"
                    >
                        {passwordSaving ? (
                            <>
                                <Loader2Spinner className="mr-2 h-4 w-4" />
                                Updating...
                            </>
                        ) : (
                            "Update Password"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Email Change */}
            <Card className="bg-zinc-950/40 border-zinc-900 shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base font-bold text-white tracking-tight">
                        <div className="p-1.5 rounded-md bg-green-500/10 text-green-500">
                            <Mail className="h-4 w-4" />
                        </div>
                        Change Email Address
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                        Update your registered email. Verification is required.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {emailError && (
                        <Alert className="border-red-950 bg-red-950/10 text-red-400">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                            <AlertTitle className="text-xs font-bold uppercase tracking-wider">Update Error</AlertTitle>
                            <AlertDescription className="text-xs">{emailError}</AlertDescription>
                        </Alert>
                    )}

                    {emailSuccess && (
                        <Alert className="border-green-950 bg-green-950/10 text-green-400">
                            <Check className="h-4 w-4 shrink-0 text-green-400" />
                            <AlertTitle className="text-xs font-bold uppercase tracking-wider">Success!</AlertTitle>
                            <AlertDescription className="text-xs">
                                Your login email has been updated.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="newEmail" className="text-xs font-semibold text-zinc-400">New Email Address</Label>
                        <Input
                            id="newEmail"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new email"
                            disabled={emailSaving}
                            className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/30 text-xs rounded-lg h-10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emailPassword" className="text-xs font-semibold text-zinc-400">Current Password</Label>
                        <Input
                            id="emailPassword"
                            type="password"
                            value={emailPassword}
                            onChange={(e) => setEmailPassword(e.target.value)}
                            placeholder="Enter your account password to confirm"
                            disabled={emailSaving}
                            className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:border-green-500/30 text-xs rounded-lg h-10"
                        />
                        <p className="text-[10px] text-zinc-500 font-mono">
                            Security prompt: Re-entering your password is required to change emails.
                        </p>
                    </div>

                    <Button
                        onClick={handleEmailChange}
                        disabled={emailSaving}
                        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold border border-zinc-800 transition-colors h-10 px-5 text-xs rounded-lg mt-2"
                    >
                        {emailSaving ? (
                            <>
                                <Loader2Spinner className="mr-2 h-4 w-4" />
                                Updating...
                            </>
                        ) : (
                            "Update Email"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-zinc-950/40 border-red-950/50 shadow-md">
                <CardHeader>
                    <CardTitle className="text-red-400 flex items-center gap-2 text-base font-bold tracking-tight">
                        <div className="p-1.5 rounded-md bg-red-950/50 text-red-400">
                            <ShieldAlert className="h-4 w-4" />
                        </div>
                        Caution Zone
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500">
                        Destructive operations that cannot be reversed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-xs text-white">Delete Account</p>
                            <p className="text-[11px] text-zinc-500 mt-1">
                                Permanently delete your developer profile, templates, and active sandbox configurations.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            disabled
                            className="bg-red-950/40 border border-red-900/50 hover:bg-red-900 hover:text-white text-red-400 text-xs h-10 px-5 cursor-not-allowed rounded-lg"
                        >
                            Delete Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>
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
