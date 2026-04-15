"use client";

import React from "react";
import { motion } from "motion/react";
import { Button } from "../ui";

interface JoinLobbyProps {
  roomName?: string;
  userName: string;
  onCancel: () => void;
  rejected?: boolean;
  rejectionReason?: string;
}

/**
 * Full-screen waiting lobby shown to a guest who has sent a join-request
 * and is waiting for the room owner to approve/reject them.
 */
export function JoinLobby({ roomName, userName, onCancel, rejected, rejectionReason }: JoinLobbyProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 max-w-sm w-full mx-4 text-center"
      >
        {/* Avatar / Icon */}
        <div className="relative">
          <motion.div
            animate={rejected ? {} : { scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className={`flex items-center justify-center w-24 h-24 rounded-full border-2 text-3xl font-bold select-none
              ${rejected
                ? "border-destructive/60 bg-destructive/10 text-destructive"
                : "border-primary/40 bg-primary/10 text-primary"
              }`}
          >
            {userName.charAt(0).toUpperCase()}
          </motion.div>

          {!rejected && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="absolute -inset-2"
            >
              <div className="w-full h-full rounded-full border-2 border-dashed border-primary/30" />
            </motion.div>
          )}
        </div>

        {/* Status Text */}
        {rejected ? (
          <>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-destructive">Access Denied</p>
              <p className="text-sm text-muted-foreground">
                {rejectionReason || "The host declined your request to join."}
              </p>
            </div>
            <Button variant="outline" onClick={onCancel} className="w-full max-w-xs">
              Back to Dashboard
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-xl font-semibold">Waiting for host…</p>
              <p className="text-sm text-muted-foreground">
                You&rsquo;ve asked to join{roomName ? ` "${roomName}"` : " this room"}.
                <br />
                The host will let you in shortly.
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-1.5">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay, ease: "easeInOut" }}
                  className="w-2 h-2 rounded-full bg-primary"
                />
              ))}
            </div>

            <Button variant="ghost" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
