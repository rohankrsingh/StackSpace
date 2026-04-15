"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JoinRequest {
  roomId: string;
  user: { id: string; name: string };
  requesterId: string;
}

interface JoinApprovalToastProps {
  request: JoinRequest;
  onAllow: (requesterId: string) => void;
  onReject: (requesterId: string) => void;
  timeoutSeconds?: number;
}

const TIMEOUT_SECS = 60;

/**
 * Floating approval toast shown to the room owner when a guest
 * sends a join-request. Auto-rejects after timeoutSeconds.
 */
export function JoinApprovalToast({ request, onAllow, onReject, timeoutSeconds = TIMEOUT_SECS }: JoinApprovalToastProps) {
  const [remaining, setRemaining] = useState(timeoutSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onReject(request.requesterId);
      return;
    }
    const timer = setInterval(() => setRemaining((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [remaining, request.requesterId, onReject]);

  const progress = (remaining / timeoutSeconds) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-[9999] w-80 rounded-xl border border-border bg-card shadow-2xl shadow-black/30 overflow-hidden"
    >
      {/* Countdown progress bar */}
      <motion.div
        className="h-1 bg-primary"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "linear" }}
      />

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center font-bold text-primary text-sm">
            {request.user.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {request.user.name}
            </p>
            <p className="text-xs text-muted-foreground">
              wants to join your room
            </p>
          </div>

          {/* Countdown badge */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Clock className="w-3 h-3" />
            <span>{remaining}s</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onAllow(request.requesterId)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Allow
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReject(request.requesterId)}
            className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
