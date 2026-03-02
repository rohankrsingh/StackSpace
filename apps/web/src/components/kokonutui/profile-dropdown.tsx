"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Settings, LogOut, User, Home, Monitor, Keyboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { signOut } from "@/store/slices/authSlice";
import { getUserPreferences } from "@/lib/preferences";

interface MenuItem {
    label: string;
    value?: string;
    href?: string;
    icon: React.ReactNode;
    onClick?: () => void;
    external?: boolean;
}

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    showKeyboardShortcuts?: boolean;
    onKeyboardShortcutsClick?: () => void;
    avatarUrl?: string;
    compact?: boolean;
}

export default function ProfileDropdown({
    className,
    showKeyboardShortcuts = false,
    onKeyboardShortcutsClick,
    avatarUrl: propAvatarUrl,
    compact = false,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [avatarUrl, setAvatarUrl] = React.useState<string | undefined>(propAvatarUrl);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);

    // Fetch avatar from user preferences
    React.useEffect(() => {
        if (!propAvatarUrl) {
            getUserPreferences().then((prefs) => {
                if (prefs.avatar) {
                    setAvatarUrl(prefs.avatar);
                }
            });
        }
    }, [propAvatarUrl]);

    const handleSignOut = async () => {
        await dispatch(signOut());
        router.push("/auth/signin");
    };

    const menuItems: MenuItem[] = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: <Home className="w-4 h-4" />,
        },
        {
            label: "Profile",
            href: "/settings",
            icon: <User className="w-4 h-4" />,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: <Settings className="w-4 h-4" />,
        },
        {
            label: "Room Preferences",
            href: "/settings",
            icon: <Monitor className="w-4 h-4" />,
        },
    ];

    // Add keyboard shortcuts option if enabled
    if (showKeyboardShortcuts && onKeyboardShortcutsClick) {
        menuItems.push({
            label: "Keyboard Shortcuts",
            icon: <Keyboard className="w-4 h-4" />,
            onClick: onKeyboardShortcutsClick,
        });
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Compact version - just avatar trigger
    if (compact) {
        return (
            <div className={cn("relative", className)} {...props}>
                <DropdownMenu onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center justify-center rounded-full hover:ring-2 hover:ring-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-primary via-primary/80 to-primary/60 p-0.5">
                                <Avatar className="w-full h-full border-2 border-background">
                                    <AvatarImage src={avatarUrl} alt={user?.name || "User"} />
                                    <AvatarFallback className="text-xs font-semibold bg-background text-foreground">
                                        {getInitials(user?.name || "U")}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-64 p-2 bg-popover/95 backdrop-blur-sm border border-border/60 rounded-2xl shadow-xl"
                    >
                        {/* User Info Header */}
                        <div className="px-3 py-2 mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary via-primary/80 to-primary/60 p-0.5 shrink-0">
                                <Avatar className="w-full h-full border-2 border-background">
                                    <AvatarImage src={avatarUrl} alt={user?.name || "User"} />
                                    <AvatarFallback className="text-xs font-semibold bg-background text-foreground">
                                        {getInitials(user?.name || "U")}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{user?.name || "User"}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
                            </div>
                        </div>

                        <DropdownMenuSeparator className="bg-border/50" />

                        <div className="space-y-1 py-1">
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.label} asChild>
                                    {item.href ? (
                                        <Link
                                            href={item.href}
                                            className="flex items-center p-2.5 hover:bg-muted/80 rounded-xl transition-all duration-200 cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                    {item.label}
                                                </span>
                                            </div>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={item.onClick}
                                            className="w-full flex items-center p-2.5 hover:bg-muted/80 rounded-xl transition-all duration-200 cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                    {item.label}
                                                </span>
                                            </div>
                                        </button>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>

                        <DropdownMenuSeparator className="my-2 bg-linear-to-r from-transparent via-border to-transparent" />

                        <DropdownMenuItem asChild>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 p-2.5 duration-200 bg-destructive/10 rounded-xl hover:bg-destructive/20 cursor-pointer border border-transparent hover:border-destructive/30 hover:shadow-sm transition-all group"
                            >
                                <LogOut className="w-4 h-4 text-destructive group-hover:text-destructive" />
                                <span className="text-sm font-medium text-destructive group-hover:text-destructive">
                                    Sign Out
                                </span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    // Full version with name and email
    return (
        <div className={cn("relative", className)} {...props}>
            <DropdownMenu onOpenChange={setIsOpen}>
                <div className="group relative">
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="flex items-center gap-3 p-2.5 rounded-2xl bg-background/80 border border-border/60 hover:border-border hover:bg-muted/50 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <div className="text-left flex-1 min-w-0">
                                <div className="text-sm font-medium text-foreground tracking-tight leading-tight truncate">
                                    {user?.name || "User"}
                                </div>
                                <div className="text-xs text-muted-foreground tracking-tight leading-tight truncate">
                                    {user?.email || "user@example.com"}
                                </div>
                            </div>
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary via-primary/80 to-primary/60 p-0.5">
                                    <Avatar className="w-full h-full border-2 border-background">
                                        <AvatarImage src={avatarUrl} alt={user?.name || "User"} />
                                        <AvatarFallback className="text-xs font-semibold bg-background text-foreground">
                                            {getInitials(user?.name || "U")}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>

                    {/* Bending line indicator on the right */}
                    <div
                        className={cn(
                            "absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-200",
                            isOpen
                                ? "opacity-100"
                                : "opacity-60 group-hover:opacity-100"
                        )}
                    >
                        <svg
                            width="12"
                            height="24"
                            viewBox="0 0 12 24"
                            fill="none"
                            className={cn(
                                "transition-all duration-200",
                                isOpen
                                    ? "text-primary scale-110"
                                    : "text-muted-foreground group-hover:text-foreground"
                            )}
                            aria-hidden="true"
                        >
                            <path
                                d="M2 4C6 8 6 16 2 20"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                fill="none"
                            />
                        </svg>
                    </div>

                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-64 p-2 bg-popover/95 backdrop-blur-sm border border-border/60 rounded-2xl shadow-xl"
                    >
                        {/* User Info Header */}
                        <div className="px-3 py-2 mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary via-primary/80 to-primary/60 p-0.5 shrink-0">
                                <Avatar className="w-full h-full border-2 border-background">
                                    <AvatarImage src={avatarUrl} alt={user?.name || "User"} />
                                    <AvatarFallback className="text-xs font-semibold bg-background text-foreground">
                                        {getInitials(user?.name || "U")}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{user?.name || "User"}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</p>
                            </div>
                        </div>

                        <DropdownMenuSeparator className="bg-border/50" />

                        <div className="space-y-1 py-1">
                            {menuItems.map((item) => (
                                <DropdownMenuItem key={item.label} asChild>
                                    {item.href ? (
                                        <Link
                                            href={item.href}
                                            className="flex items-center p-2.5 hover:bg-muted/80 rounded-xl transition-all duration-200 cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                    {item.label}
                                                </span>
                                            </div>
                                            {item.value && (
                                                <span className="text-xs font-medium rounded-md py-1 px-2 tracking-tight text-primary bg-primary/10 border border-primary/20">
                                                    {item.value}
                                                </span>
                                            )}
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={item.onClick}
                                            className="w-full flex items-center p-2.5 hover:bg-muted/80 rounded-xl transition-all duration-200 cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm font-medium text-foreground tracking-tight leading-tight whitespace-nowrap group-hover:text-foreground transition-colors">
                                                    {item.label}
                                                </span>
                                            </div>
                                        </button>
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>

                        <DropdownMenuSeparator className="my-2 bg-linear-to-r from-transparent via-border to-transparent" />

                        <DropdownMenuItem asChild>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 p-2.5 duration-200 bg-destructive/10 rounded-xl hover:bg-destructive/20 cursor-pointer border border-transparent hover:border-destructive/30 hover:shadow-sm transition-all group"
                            >
                                <LogOut className="w-4 h-4 text-destructive group-hover:text-destructive" />
                                <span className="text-sm font-medium text-destructive group-hover:text-destructive">
                                    Sign Out
                                </span>
                            </button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
        </div>
    );
}
