"use client";

import React, { useState } from "react";
import { Button, Input, Avatar } from "@heroui/react";
import { Send } from "lucide-react";

interface ReplyToastProps {
    username: string;
    message: string;
    onReply: (reply: string) => void;
    onClose: () => void;
}

export function ReplyToast({ username, message, onReply, onClose }: ReplyToastProps) {
    const [replyText, setReplyText] = useState("");

    const handleSend = () => {
        if (replyText.trim()) {
            onReply(replyText);
            setReplyText("");
            onClose();
        }
    };

    return (
        <div className="flex flex-col gap-2.5 min-w-[320px]">
            <div className="flex items-center gap-2 mb-0.5 opacity-80">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-default-500">New Message</span>
            </div>

            <div className="flex gap-3 items-start">
                <Avatar
                    name={username}
                    size="sm"
                    className="shrink-0 bg-primary/10 text-primary font-bold"
                    isBordered
                    color="primary"
                />
                <div className="flex flex-col gap-1 overflow-hidden mt-0.5">
                    <span className="text-sm font-bold tracking-tight leading-none">{username}</span>
                    <p className="text-xs text-default-500 line-clamp-2 leading-snug">{message}</p>
                </div>
            </div>

            <div className="flex gap-2 items-center mt-1">
                <Input
                    size="sm"
                    placeholder="Type a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSend();
                    }}
                    className="flex-1"
                    variant="bordered"
                    classNames={{
                        inputWrapper: "h-9 bg-default-100/50 border-default-200 hover:border-primary/50 focus-within:!border-primary transition-colors",
                        input: "text-xs"
                    }}
                />
                <Button
                    isIconOnly
                    size="sm"
                    color="primary"
                    variant="shadow"
                    onClick={handleSend}
                    isDisabled={!replyText.trim()}
                    className="h-9 w-9 min-w-9 transition-transform active:scale-90"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
