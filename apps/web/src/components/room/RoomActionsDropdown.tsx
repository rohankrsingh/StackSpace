"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import useMeasure from "react-use-measure";
import {
    LayoutGrid,
    Power,
    LogOut,
    Copy,
    ExternalLink,
    MoreHorizontal,
    Activity,
    Settings,
    Keyboard,
    User,
    Home,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProfileDropdown from "@/components/kokonutui/profile-dropdown";
import Link from "next/link";


interface RoomActionsDropdownProps {
    roomId: string;
    roomStatus: {
        status: "running" | "stopped";
        ideUrl?: string;
    };
    loading: boolean;
    handleCopyLink: () => void;
    handleStartRoom: () => void;
    handleStopRoom: () => void;
    handleLeaveRoom: () => void;
    onKeyboardShortcutsClick?: () => void;
    direction?: "up" | "down";
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType | null;
    onClick?: () => void;
    href?: string;
    internalLink?: boolean; // true for internal Next.js routes
    variant?: "default" | "danger" | "success" | "disabled";
    hidden?: boolean;
    custom?: React.ReactNode;
}

const easeOutQuint: [number, number, number, number] = [0.23, 1, 0.32, 1];

export default function RoomActionsDropdown({
    roomId,
    roomStatus,
    loading,
    handleCopyLink,
    handleStartRoom,
    handleStopRoom,
    handleLeaveRoom,
    onKeyboardShortcutsClick,
    direction = "down",
}: RoomActionsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [contentRef, contentBounds] = useMeasure();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleWindowBlur = () => {
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("blur", handleWindowBlur);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("blur", handleWindowBlur);
        };
    }, [isOpen]);

    const menuItems: MenuItem[] = [
        {
            id: "room-id",
            label: roomId,
            icon: null,
            custom: (
                <Badge variant="default" className="text-xs self-center px-4 py-1.5 font-mono rounded-full cursor-copy" onClick={handleCopyLink}>
                    {roomId}
                </Badge>
            )
        },
        { id: "divider0", label: "", icon: null },
        {
            id: "status",
            label: roomStatus.status === "running" ? "Running" : "Stopped",
            icon: Activity,
            variant: roomStatus.status === "running" ? "success" : "disabled",
        },
        { id: "divider1", label: "", icon: null },
        {
            id: "copy",
            label: "Copy Room Link",
            icon: Copy,
            onClick: () => {
                handleCopyLink();
                setIsOpen(false);
            },
        },
        {
            id: "openide",
            label: "Open IDE",
            icon: ExternalLink,
            href: roomStatus.ideUrl,
            hidden: !roomStatus.ideUrl || roomStatus.status !== "running",
        },
        { id: "divider2", label: "", icon: null },
        {
            id: "startstop",
            label: roomStatus.status === "stopped" ? "Start Room" : "Stop Room",
            icon: Power,
            onClick: () => {
                if (roomStatus.status === "stopped") {
                    handleStartRoom();
                } else {
                    handleStopRoom();
                }
                setIsOpen(false);
            },
            variant: roomStatus.status === "stopped" ? "success" : "default",
        },
        { id: "divider3", label: "", icon: null },
        {
            id: "leave",
            label: "Leave Room",
            icon: LogOut,
            onClick: handleLeaveRoom,
            variant: "danger",
        },
        { id: "divider4", label: "", icon: null },
        {
            id: "shortcuts",
            label: "Keyboard Shortcuts",
            icon: Keyboard,
            onClick: () => {
                onKeyboardShortcutsClick?.();
                setIsOpen(false);
            },
        },
        {
            id: "dashboard",
            label: "Dashboard",
            icon: Home,
            href: "/dashboard",
            internalLink: true,
        },
        {
            id: "settings",
            label: "Settings",
            icon: Settings,
            href: "/settings",
            internalLink: true,
        },
    ];

    const visibleItems = menuItems.filter((item) => !item.hidden);
    const openHeight = Math.max(40, Math.ceil(contentBounds.height));

    return (
        <div ref={containerRef} className="relative h-10 w-10 z-[100]">
            {isOpen && (
                <div
                    className="fixed inset-0 z-[90]"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                    }}
                />
            )}
            <motion.div
                layout
                initial={false}
                animate={{
                    width: isOpen ? 220 : 40,
                    height: isOpen ? openHeight : 40,
                    borderRadius: isOpen ? 14 : 12,
                }}
                transition={{
                    type: "spring" as const,
                    damping: 34,
                    stiffness: 380,
                    mass: 0.8,
                }}
                className={`absolute ${direction === "up" ? "bottom-0 origin-bottom-right" : "top-0 origin-top-right"} right-0 bg-popover  shadow-xl overflow-hidden cursor-pointer z-[100]`}
                onClick={() => !isOpen && setIsOpen(true)}
            >
                {/* Collapsed State - Three Dots Icon */}
                <motion.div
                    initial={false}
                    animate={{
                        opacity: isOpen ? 0 : 1,
                        scale: isOpen ? 0.8 : 1,
                    }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        pointerEvents: isOpen ? "none" : "auto",
                        willChange: "transform",
                    }}
                >
                    <LayoutGrid className="h-5 w-5" />
                </motion.div>

                {/* Menu Content */}
                <div ref={contentRef}>
                    <motion.div
                        layout
                        initial={false}
                        animate={{
                            opacity: isOpen ? 1 : 0,
                        }}
                        transition={{
                            duration: 0.2,
                            delay: isOpen ? 0.08 : 0,
                        }}
                        className="p-2"
                        style={{
                            pointerEvents: isOpen ? "auto" : "none",
                            willChange: "transform",
                        }}
                    >
                        <ul className="flex flex-col gap-0.5 m-0 p-0 list-none">
                            {visibleItems.map((item, index) => {
                                if (item.id.startsWith("divider")) {
                                    return (
                                        <motion.hr
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: isOpen ? 1 : 0 }}
                                            transition={{ delay: isOpen ? 0.12 + index * 0.015 : 0 }}
                                            className="border-green-900/30 my-1.5"
                                        />
                                    );
                                }

                                if (item.custom) {
                                    return (
                                        <motion.li
                                            key={item.id}
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: isOpen ? 1 : 0, y: 0 }}
                                            transition={{ delay: isOpen ? 0.05 : 0, duration: 0.2 }}
                                            className="m-0 p-0 mb-1"
                                        >
                                            {item.custom}
                                        </motion.li>
                                    );
                                }

                                const IconComponent = item.icon;
                                const isDanger = item.variant === "danger";
                                const isSuccess = item.variant === "success";
                                const isDisabled = item.variant === "disabled";
                                const showIndicator = hoveredItem === item.id;

                                const itemDelay = isOpen ? 0.06 + index * 0.02 : 0;

                                const getTextColor = () => {
                                    if (isDanger && showIndicator) return "text-red-400";
                                    if (isSuccess) return "text-green-400";
                                    if (isDisabled) return "text-gray-500";
                                    if (showIndicator) return "text-white";
                                    return "text-gray-300";
                                };

                                const content = (
                                    <motion.li
                                        key={item.id}
                                        initial={{ opacity: 0, x: 8 }}
                                        animate={{
                                            opacity: isOpen ? 1 : 0,
                                            x: isOpen ? 0 : 8,
                                        }}
                                        transition={{
                                            delay: itemDelay,
                                            duration: 0.15,
                                            ease: easeOutQuint,
                                        }}
                                        onClick={(e) => {
                                            if (item.onClick) {
                                                e.stopPropagation();
                                                item.onClick();
                                            }
                                        }}
                                        onMouseEnter={() => !isDisabled && setHoveredItem(item.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`relative flex items-center gap-3 rounded-lg text-sm cursor-pointer transition-colors duration-200 ease-out m-0 pl-3 py-2 ${getTextColor()} ${isDisabled ? "cursor-default" : ""}`}
                                    >
                                        {/* Hover background */}
                                        {showIndicator && !isDisabled && (
                                            <motion.div
                                                layoutId="roomActionIndicator"
                                                className={`absolute inset-0 rounded-lg ${isDanger ? "bg-red-900/30" : "bg-green-900/30"
                                                    }`}
                                                transition={{
                                                    type: "spring",
                                                    damping: 30,
                                                    stiffness: 520,
                                                    mass: 0.8,
                                                }}
                                            />
                                        )}
                                        {/* Left bar indicator */}
                                        {showIndicator && !isDisabled && (
                                            <motion.div
                                                layoutId="roomActionLeftBar"
                                                className={`absolute left-0 top-0 bottom-0 my-auto w-[3px] h-5 rounded-full ${isDanger ? "bg-red-500" : "bg-green-500"
                                                    }`}
                                                transition={{
                                                    type: "spring",
                                                    damping: 30,
                                                    stiffness: 520,
                                                    mass: 0.8,
                                                }}
                                            />
                                        )}
                                        {/* Status dot for status item */}
                                        {item.id === "status" && (
                                            <div
                                                className={`w-2 h-2 rounded-full relative z-10 ${roomStatus.status === "running"
                                                    ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"
                                                    : "bg-red-500/70"
                                                    }`}
                                            />
                                        )}
                                        {IconComponent && item.id !== "status" && (
                                            <IconComponent className="w-4 h-4 relative z-10" />
                                        )}
                                        <span className="font-medium relative z-10">
                                            {item.label}
                                        </span>
                                    </motion.li>
                                );

                                // Wrap in anchor/Link if it has href
                                if (item.href) {
                                    if (item.internalLink) {
                                        return (
                                            <Link
                                                key={item.id}
                                                href={item.href}
                                                className="no-underline"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                {content}
                                            </Link>
                                        );
                                    }
                                    return (
                                        <a
                                            key={item.id}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="no-underline"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {content}
                                        </a>
                                    );
                                }

                                return content;
                            })}
                        </ul>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
