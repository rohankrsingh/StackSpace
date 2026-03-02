"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Mail, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { updatePassword, updateEmail } from "@/lib/preferences";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AccountSettings() {
    const user = useSelector((state: RootState) => state.auth.user);

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
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                        Your current account details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="text-muted-foreground text-xs">Display Name</Label>
                            <p className="font-medium">{user?.name || "Not set"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground text-xs">Email</Label>
                            <p className="font-medium">{user?.email || "Not set"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {passwordError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{passwordError}</AlertDescription>
                        </Alert>
                    )}

                    {passwordSuccess && (
                        <Alert className="border-green-500 bg-green-500/10">
                            <AlertTitle className="text-green-500">Success!</AlertTitle>
                            <AlertDescription className="text-green-500/80">
                                Your password has been updated successfully.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="currentPassword"
                                type={showPasswords ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                disabled={passwordSaving}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type={showPasswords ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            disabled={passwordSaving}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type={showPasswords ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            disabled={passwordSaving}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => setShowPasswords(!showPasswords)}
                        >
                            {showPasswords ? (
                                <><EyeOff className="mr-2 h-4 w-4" /> Hide Passwords</>
                            ) : (
                                <><Eye className="mr-2 h-4 w-4" /> Show Passwords</>
                            )}
                        </Button>
                    </div>

                    <Button onClick={handlePasswordChange} disabled={passwordSaving}>
                        {passwordSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Password"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Email Change */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Change Email
                    </CardTitle>
                    <CardDescription>
                        Update your email address. You'll need to verify the new email.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {emailError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{emailError}</AlertDescription>
                        </Alert>
                    )}

                    {emailSuccess && (
                        <Alert className="border-green-500 bg-green-500/10">
                            <AlertTitle className="text-green-500">Success!</AlertTitle>
                            <AlertDescription className="text-green-500/80">
                                Your email has been updated successfully.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="newEmail">New Email Address</Label>
                        <Input
                            id="newEmail"
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Enter new email"
                            disabled={emailSaving}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emailPassword">Current Password</Label>
                        <Input
                            id="emailPassword"
                            type="password"
                            value={emailPassword}
                            onChange={(e) => setEmailPassword(e.target.value)}
                            placeholder="Enter your password to confirm"
                            disabled={emailSaving}
                        />
                        <p className="text-xs text-muted-foreground">
                            Password is required to change your email.
                        </p>
                    </div>

                    <Button onClick={handleEmailChange} disabled={emailSaving}>
                        {emailSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Email"
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Irreversible actions that affect your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Delete Account</p>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete your account and all associated data.
                            </p>
                        </div>
                        <Button variant="destructive" disabled>
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
