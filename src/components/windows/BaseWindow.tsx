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
  isClosing?: boolean;
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
  onMouseDown,
  onResizeStart,
  children,
  className = "",
  titleBarButtons,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  minWidth: _minWidth,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  maxWidth: _maxWidth,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  minHeight: _minHeight,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  maxHeight: _maxHeight,
  isClosing = false,
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
      className={`window-container ${
        isClosing ? "window-container-closing" : ""
      } absolute border-2 border-accent bg-[color:var(--window-surface-opaque)] ${
        isMaximized ? "inset-4" : ""
      } ${className}`}
      key={id}
      {...props}
      style={getStyle()}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between bg-accent-soft px-3 py-2 cursor-move border-b border-[color:var(--palette-border-soft)]"
        onMouseDown={!isMaximized ? onMouseDown : undefined}
      >
        <span className="text-foreground font-mono text-sm font-bold">
          {title}
        </span>
        <div className="flex gap-2 items-center">
          {titleBarButtons}
          <button
            onClick={onClose}
            className="text-foreground hover:bg-[color:var(--palette-background)] hover:text-accent w-6 h-6 border border-[color:var(--palette-border-soft)] text-xs font-mono transition-colors bg-[color:var(--palette-accent-soft)]"
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
            background:
              "linear-gradient(-45deg, transparent 30%, var(--palette-accent) 30%, var(--palette-accent) 35%, transparent 35%, transparent 65%, var(--palette-accent) 65%, var(--palette-accent) 70%, transparent 70%)",
          }}
        />
      )}
    </div>
  );
};
