"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    size?: "sm" | "md" | "lg";
}

export default function LoaderKokonut({
    title = "Loading...",
    subtitle,
    size = "md",
    className,
    ...props
}: LoaderProps) {
    const sizeMap = {
        sm: "h-6 w-6",
        md: "h-10 w-10",
        lg: "h-16 w-16",
    };

    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background",
                className
            )}
            {...props}
        >
            <div className="flex flex-col items-center gap-4">
                <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
                <div className="text-center space-y-1">
                    <h3 className={cn(
                        "font-semibold tracking-tight text-foreground",
                        size === "sm" ? "text-base" : "text-lg"
                    )}>
                        {title}
                    </h3>
                    {subtitle && (
                        <p className={cn(
                            "text-muted-foreground max-w-[280px]",
                            size === "sm" ? "text-xs" : "text-sm"
                        )}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
