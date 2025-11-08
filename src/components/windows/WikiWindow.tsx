"use client";

import React, { useState } from "react";
import { BaseWindow } from "./BaseWindow";

interface WikiWindowProps {
  id: string;
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, windowId: string) => void;
}

export default function WikiWindow({
  id,
  onClose,
  isMaximized,
  onToggleMaximize,
  x,
  y,
  width,
  height,
  zIndex,
  onMouseDown,
  onResizeStart,
}: WikiWindowProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <BaseWindow
      id={id}
      title="VAULT.JMILL.DEV"
      x={x}
      y={y}
      width={width}
      height={height}
      minWidth={480}
      maxWidth={1200}
      minHeight={360}
      maxHeight={900}
      isMaximized={isMaximized}
      zIndex={zIndex}
      onClose={onClose}
      onToggleMaximize={onToggleMaximize}
      onMouseDown={onMouseDown}
      onResizeStart={onResizeStart}
      data-window="true"
    >
      <div className="relative w-full h-full">
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-[#00FFFF] z-10 text-sm font-mono">
            <div className="w-10 h-10 border-2 border-[#00FFFF] border-t-transparent rounded-full animate-spin"></div>
            <span>Dialing vault.jmill.dev…</span>
          </div>
        )}
        <iframe
          src="https://vault.jmill.dev"
          title="Vault"
          className="w-full h-full border-0 bg-black"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </BaseWindow>
  );
}
