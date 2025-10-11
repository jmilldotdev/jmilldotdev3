"use client";

import React, { useRef } from "react";

interface BaseWindowProps {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number | "auto";
  height: number | "auto";
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onToggleMaximize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, windowId: string) => void;
  children: React.ReactNode;
  className?: string;
  titleBarButtons?: React.ReactNode;
  "data-window"?: string;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export const BaseWindow: React.FC<BaseWindowProps> = ({
  id,
  title,
  x,
  y,
  width,
  height,
  isMaximized,
  zIndex,
  onClose,
  onToggleMaximize,
  onMouseDown,
  onResizeStart,
  children,
  className = "",
  titleBarButtons,
  minWidth = 300,
  maxWidth,
  minHeight = 200,
  maxHeight,
  ...props
}) => {
  const windowRef = useRef<HTMLDivElement>(null);

  const getStyle = () => {
    if (isMaximized) {
      return { zIndex };
    }

    return {
      left: x,
      top: y,
      width: typeof width === "number" ? width : "auto",
      height: typeof height === "number" ? height : "auto",
      zIndex,
    };
  };

  return (
    <div
      ref={windowRef}
      className={`window-container absolute border-2 border-[#00FFFF] bg-black/95 backdrop-blur-sm ${
        isMaximized ? "inset-4" : ""
      } ${className}`}
      key={id}
      {...props}
      style={getStyle()}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between bg-[#00FFFF] bg-opacity-20 px-3 py-2 cursor-move"
        onMouseDown={!isMaximized ? onMouseDown : undefined}
      >
        <span className="text-black font-mono text-sm font-bold">{title}</span>
        <div className="flex gap-2 items-center">
          {titleBarButtons}
          <button
            onClick={onToggleMaximize}
            className="text-black hover:bg-black hover:text-[#00FFFF] w-6 h-6 border border-black text-xs font-mono transition-colors"
          >
            {isMaximized ? "□" : "■"}
          </button>
          <button
            onClick={onClose}
            className="text-black hover:bg-black hover:text-[#00FFFF] w-6 h-6 border border-black text-xs font-mono transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-auto" style={{ height: "calc(100% - 40px)" }}>
        {children}
      </div>

      {/* Resize Handle - Bottom Right Corner */}
      {!isMaximized && onResizeStart && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity z-50"
          onMouseDown={(e) => onResizeStart(e, id)}
          style={{
            background: 'linear-gradient(-45deg, transparent 30%, #00FFFF 30%, #00FFFF 35%, transparent 35%, transparent 65%, #00FFFF 65%, #00FFFF 70%, transparent 70%)',
          }}
        />
      )}
    </div>
  );
};
