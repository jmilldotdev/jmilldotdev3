"use client";

import { BaseWindow } from "./BaseWindow";
import CommandLine from "../CommandLine";

interface TerminalWindowProps {
  id: string;
  title?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onToggleMaximize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, windowId: string) => void;
  onOpenWikiWindow?: (slug?: string) => void;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  id,
  title = "TERM.CMD",
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
  onOpenWikiWindow,
}) => {
  return (
    <BaseWindow
      id={id}
      title={title}
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
      className="terminal-window"
    >
      <div className="h-full bg-black p-4 font-mono">
        <CommandLine onOpenWikiWindow={onOpenWikiWindow} />
      </div>
    </BaseWindow>
  );
};