"use client";

import React from "react";

interface DesktopIconProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  position: { x: number; y: number };
  isDragging: boolean;
  isWindowOpen: boolean;
  onMouseDown: (e: React.MouseEvent, iconId: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({
  id,
  name,
  icon,
  position,
  isDragging,
  isWindowOpen,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <div
      className={`absolute flex flex-col items-center group z-20 ${
        isDragging ? "cursor-grabbing select-none" : "cursor-pointer"
      }`}
      style={{
        left: position.x,
        top: position.y,
        userSelect: "none",
        transition: isDragging ? "none" : "all 0.2s ease-out",
        width: "80px", // Fixed width for consistent spacing
        height: "90px", // Fixed height including icon + label
      }}
      onMouseDown={(e) => {
        if (e.button === 0) {
          // Left mouse button only
          onMouseDown(e, id);
        }
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Icon Container */}
      <div
        className={`text-[#00FFFF] p-3 border border-[#00FFFF] transition-all flex items-center justify-center w-16 h-16 ${
          isWindowOpen
            ? "border-opacity-100 shadow-[0_0_10px_#00FFFF]"
            : "border-opacity-50 group-hover:border-opacity-100 group-hover:shadow-[0_0_10px_#00FFFF]"
        }`}
      >
        {icon}
      </div>
      
      {/* Label */}
      <span className="text-[#00FFFF] text-xs mt-1 text-center font-mono leading-tight max-w-full break-words">
        {name}
      </span>
    </div>
  );
};

// Export the component dimensions for grid calculations
export const DESKTOP_ICON_DIMENSIONS = {
  width: 80,
  height: 90,
} as const;