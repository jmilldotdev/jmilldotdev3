"use client";

import React from "react";

interface BaseWindowProps {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onToggleMaximize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
  titleBarButtons?: React.ReactNode;
}

export const BaseWindow: React.FC<BaseWindowProps> = ({
  id: _id,
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
  children,
  className = "",
  titleBarButtons
}) => {
  return (
    <div
      className={`window-container absolute border-2 border-[#00FFFF] bg-black/40 backdrop-blur-sm ${
        isMaximized ? 'inset-4' : ''
      } ${className}`}
      style={isMaximized ? {
        zIndex: zIndex
      } : {
        left: x,
        top: y,
        width: width,
        height: height,
        zIndex: zIndex
      }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between bg-[#00FFFF] bg-opacity-20 px-3 py-2 cursor-move"
        onMouseDown={!isMaximized ? onMouseDown : undefined}
      >
        <span className="text-black font-mono text-sm font-bold">
          {title}
        </span>
        <div className="flex gap-2 items-center">
          {titleBarButtons}
          <button
            onClick={onToggleMaximize}
            className="text-black hover:bg-black hover:text-[#00FFFF] w-6 h-6 border border-black text-xs font-mono transition-colors"
          >
            {isMaximized ? '□' : '■'}
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
      <div className="h-full overflow-hidden" style={{ height: 'calc(100% - 40px)' }}>
        {children}
      </div>
    </div>
  );
};