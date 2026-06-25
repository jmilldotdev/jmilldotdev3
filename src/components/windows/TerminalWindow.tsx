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
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, windowId: string) => void;
  onOpenWikiWindow?: (slug?: string) => void;
  isClosing?: boolean;
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
  onClose,  onMouseDown,
  onResizeStart,
  onOpenWikiWindow,
  isClosing = false,
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
      maxWidth={800}
      minHeight={300}
      maxHeight={700}
      isMaximized={isMaximized}
      zIndex={zIndex}
      onClose={onClose}
      onMouseDown={onMouseDown}
      onResizeStart={onResizeStart}
      isClosing={isClosing}
      className="terminal-window"
    >
      <div className="h-full bg-black p-4 font-mono">
        <CommandLine onOpenWikiWindow={onOpenWikiWindow} />
      </div>
    </BaseWindow>
  );
};
