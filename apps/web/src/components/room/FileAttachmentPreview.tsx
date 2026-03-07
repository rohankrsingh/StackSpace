"use client";

import { X, FileIcon, ImageIcon, FileTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileAttachmentPreviewProps {
    file: File;
    onRemove: () => void;
}

export function FileAttachmentPreview({ file, onRemove }: FileAttachmentPreviewProps) {
    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : null;

    return (
        <div className="flex items-center gap-3 p-2 mb-2 rounded-lg bg-muted/50 border border-border group relative">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-background border border-border shrink-0 overflow-hidden">
                {isImage && previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : file.type === "application/pdf" ? (
                    <FileTextIcon className="w-5 h-5 text-red-500" />
                ) : (
                    <FileIcon className="w-5 h-5 text-muted-foreground" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                </p>
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onRemove}
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
}
