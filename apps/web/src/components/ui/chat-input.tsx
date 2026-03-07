"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTextareaResize } from "@/hooks/use-textarea-resize";
import { ArrowUpIcon, PaperclipIcon } from "lucide-react";
import type React from "react";
import { createContext, useContext, useRef } from "react";

interface ChatInputContextValue {
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    onSubmit?: () => void;
    loading?: boolean;
    onStop?: () => void;
    variant?: "default" | "unstyled";
    rows?: number;
    onFileSelect?: (file: File) => void;
    hasFile?: boolean;
}

const ChatInputContext = createContext<ChatInputContextValue>({});

interface ChatInputProps extends Omit<ChatInputContextValue, "variant"> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "unstyled";
    rows?: number;
    hasFile?: boolean;
}

function ChatInput({
    children,
    className,
    variant = "default",
    value,
    onChange,
    onSubmit,
    loading,
    onStop,
    rows = 1,
    onFileSelect,
    hasFile,
}: ChatInputProps) {
    const contextValue: ChatInputContextValue = {
        value,
        onChange,
        onSubmit,
        loading,
        onStop,
        variant,
        rows,
        onFileSelect,
        hasFile,
    };

    return (
        <ChatInputContext.Provider value={contextValue}>
            <div
                className={cn(
                    variant === "default" &&
                    "flex flex-col items-stretch w-full p-2 rounded-2xl border border-input bg-transparent focus-within:ring-1 focus-within:ring-ring focus-within:outline-none",
                    variant === "unstyled" && "flex items-start gap-2 w-full",
                    className,
                )}
            >
                {children}
            </div>
        </ChatInputContext.Provider>
    );
}

ChatInput.displayName = "ChatInput";

interface ChatInputTextAreaProps extends React.ComponentProps<typeof Textarea> {
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    onSubmit?: () => void;
    variant?: "default" | "unstyled";
}

function ChatInputTextArea({
    onSubmit: onSubmitProp,
    value: valueProp,
    onChange: onChangeProp,
    className,
    variant: variantProp,
    ...props
}: ChatInputTextAreaProps) {
    const context = useContext(ChatInputContext);
    const value = valueProp ?? context.value ?? "";
    const onChange = onChangeProp ?? context.onChange;
    const onSubmit = onSubmitProp ?? context.onSubmit;
    const rows = context.rows ?? 1;

    // Convert parent variant to textarea variant unless explicitly overridden
    const variant =
        variantProp ?? (context.variant === "default" ? "unstyled" : "default");

    const textareaRef = useTextareaResize(value, rows);
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!onSubmit) {
            return;
        }
        if (e.key === "Enter" && !e.shiftKey) {
            if ((typeof value !== "string" || value.trim().length === 0) && !context.hasFile) {
                return;
            }
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <Textarea
            ref={textareaRef}
            {...props}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className={cn(
                "max-h-[400px] min-h-0 resize-none overflow-x-hidden",
                variant === "unstyled" &&
                "border-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
                className,
            )}
            rows={rows}
        />
    );
}

ChatInputTextArea.displayName = "ChatInputTextArea";

interface ChatInputSubmitProps extends React.ComponentProps<typeof Button> {
    onSubmit?: () => void;
    loading?: boolean;
    onStop?: () => void;
}

function ChatInputSubmit({
    onSubmit: onSubmitProp,
    loading: loadingProp,
    onStop: onStopProp,
    className,
    ...props
}: ChatInputSubmitProps) {
    const context = useContext(ChatInputContext);
    const loading = loadingProp ?? context.loading;
    const onStop = onStopProp ?? context.onStop;
    const onSubmit = onSubmitProp ?? context.onSubmit;

    if (loading && onStop) {
        return (
            <Button
                onClick={onStop}
                className={cn(
                    "shrink-0 rounded-full p-1.5 h-fit border dark:border-zinc-600",
                    className,
                )}
                {...props}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-label="Stop"
                >
                    <title>Stop</title>
                    <rect x="6" y="6" width="12" height="12" />
                </svg>
            </Button>
        );
    }

    const isDisabled =
        context.loading || (!context.value?.trim() && !context.hasFile);
    // Note: we'll handle the actual file presence check in RoomPage, 
    // but this allows the button to be enabled if we have a way to send something.
    // For now, let's keep it simple: allow if value isn't empty.
    // Actually, if we have a file selected, we want to enable it.

    return (
        <Button
            className={cn(
                "shrink-0 rounded-full p-1.5 h-fit border dark:border-zinc-600",
                className,
            )}
            disabled={isDisabled}
            onClick={(event) => {
                event.preventDefault();
                if (!isDisabled) {
                    onSubmit?.();
                }
            }}
            {...props}
        >
            <ArrowUpIcon />
        </Button>
    );
}

ChatInputSubmit.displayName = "ChatInputSubmit";

interface ChatInputFileProps extends React.ComponentProps<typeof Button> {
    onFileSelect?: (file: File) => void;
}

function ChatInputFile({
    onFileSelect: onFileSelectProp,
    className,
    ...props
}: ChatInputFileProps) {
    const context = useContext(ChatInputContext);
    const onFileSelect = onFileSelectProp ?? context.onFileSelect;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileSelect) {
            onFileSelect(file);
        }
        // Reset input so the same file can be selected again
        e.target.value = "";
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-full", className)}
                onClick={handleClick}
                type="button"
                {...props}
            >
                <PaperclipIcon className="h-4 w-4" />
            </Button>
        </>
    );
}

ChatInputFile.displayName = "ChatInputFile";

export { ChatInput, ChatInputTextArea, ChatInputSubmit, ChatInputFile };
