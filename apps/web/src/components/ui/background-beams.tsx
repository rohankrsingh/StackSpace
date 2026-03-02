"use client";

import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundBeams = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden rounded-md", className)}>
      <div className="absolute inset-0 w-full h-full bg-slate-950 z-20 [mask-image:radial-gradient(ellipse_20%_50%_at_50%_0%,transparent_20%,#000)] pointer-events-none" />

      <svg
        className="absolute h-full w-full inset-0 opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 1200 900"
      >
        <defs>
          <filter id="coloredNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" seed="2" />
          </filter>
        </defs>
        <rect width="1200" height="900" fill="url(#noise)" />
        {/* Animated beams */}
        <line x1="0" y1="450" x2="1200" y2="450" stroke="url(#grad1)" strokeWidth="1" opacity="0.1" />
        <line x1="600" y1="0" x2="600" y2="900" stroke="url(#grad2)" strokeWidth="1" opacity="0.1" />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            <stop offset="50%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {children && <div className="relative z-30">{children}</div>}
    </div>
  );
};

export const Spotlight = ({
  className,
  fill = "white",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      className={cn(
        "animate-pulse pointer-events-none absolute z-[1] h-full w-full inset-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3840 2400"
    >
      <g fill={fill} opacity="0.15">
        <circle cx="1920" cy="1200" r="400" />
      </g>
      <g fill={fill} opacity="0.1">
        <circle cx="1200" cy="800" r="300" />
        <circle cx="2640" cy="1600" r="350" />
      </g>
    </svg>
  );
};

export const HeroBackground = () => {
  return (
    <div className="h-screen w-full bg-slate-950 relative flex items-center justify-center overflow-hidden">
      <BackgroundBeams className="h-full w-full absolute inset-0" />
      <Spotlight className="absolute inset-0" fill="white" />
      <div className="relative z-30" />
    </div>
  );
};
