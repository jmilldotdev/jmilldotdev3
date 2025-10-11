"use client";

import React from "react";
import Image from "next/image";
import { BaseWindow } from "./BaseWindow";

interface JazzWindowProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onToggleMaximize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent, windowId: string) => void;
}

export const JazzWindow: React.FC<JazzWindowProps> = ({
  id,
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
}) => {
  return (
    <BaseWindow
      id={id}
      title={"🚗🎷"}
      x={x}
      y={y}
      width={width}
      height={height}
      isMaximized={isMaximized}
      zIndex={zIndex}
      onClose={onClose}
      onToggleMaximize={onToggleMaximize}
      onMouseDown={onMouseDown}
      onResizeStart={onResizeStart}
    >
      <div
        className="p-4 overflow-auto h-full flex items-center justify-center cursor-pointer"
        onClick={() =>
          globalThis.open("https://selfdrivingjazz.com", "_blank")
        }
      >
        <Image
          src="/IO5M.gif"
          alt="Jazz"
          width={400}
          height={300}
          className="max-w-full max-h-full object-contain"
          unoptimized
        />
      </div>
    </BaseWindow>
  );
};
