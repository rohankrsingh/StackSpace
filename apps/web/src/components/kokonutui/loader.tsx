"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
}

export default function LoaderKokonut({
    title = "Loading...",
    subtitle,
    className,
    ...props
}: LoaderProps) {
    return (
        <div
            className={cn(
                "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background",
                className
            )}
            {...props}
        >
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground max-w-[240px]">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
