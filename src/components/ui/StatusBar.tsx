"use client";

import React from "react";

interface StatusBarProps {
  progress?: number;
  color?: string;
  className?: string;
  animate?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  progress = 75,
  color = "bg-secondary",
  className = "",
  animate = true,
}) => {
  return (
    <div
      className={`h-5 bg-black bg-opacity-60 relative overflow-hidden ${className}`}
    >
      <div
        className={`h-full ${color} ${animate ? "animate-pulse-width" : ""}`}
        style={{
          width: `${progress}%`,
          opacity: animate ? 0.6 : 0.8,
        }}
      />
    </div>
  );
};

export default StatusBar;
