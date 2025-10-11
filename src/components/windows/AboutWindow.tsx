"use client";

import React from "react";
import { BaseWindow } from "./BaseWindow";
import AboutContent from "@/components/AboutContent";

interface AboutWindowProps {
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
  onResizeStart: (e: React.MouseEvent, windowId: string) => void;
}

export const AboutWindow: React.FC<AboutWindowProps> = ({
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
}) => {
  return (
    <BaseWindow
      id={id}
      title={title}
      x={x}
      y={y}
      width={width}
      height={height}
      minWidth={400}
      maxWidth={1000}
      minHeight={400}
      maxHeight={800}
      isMaximized={isMaximized}
      zIndex={zIndex}
      onClose={onClose}
      onToggleMaximize={onToggleMaximize}
      onMouseDown={onMouseDown}
      onResizeStart={onResizeStart}
      data-window="true"
    >
      <div className="p-6 text-[#00FFFF] font-mono">
        <AboutContent />

        {/* System Specs */}
        <div className="space-y-3 border-t border-[#00FFFF] border-opacity-30 pt-4 mt-6">
          <h2 className="text-md font-semibold">SYSTEM SPECIFICATIONS:</h2>
          <ul className="space-y-1 text-sm pl-2">
            <li>
              <span className="opacity-75">Neural Processing Unit:</span>{" "}
              Active
            </li>
            <li>
              <span className="opacity-75">Memory Core:</span> 64GB Quantum
              RAM
            </li>
            <li>
              <span className="opacity-75">Storage:</span> 2TB Holographic
              Drive
            </li>
            <li>
              <span className="opacity-75">Network:</span> Quantum
              Entanglement Enabled
            </li>
          </ul>
          <div className="mt-4 pt-2 border-t border-[#00FFFF] border-opacity-20">
            <p className="text-sm font-semibold">
              STATUS: <span className="text-green-400">OPERATIONAL</span>
            </p>
          </div>
        </div>
      </div>
    </BaseWindow>
  );
};
