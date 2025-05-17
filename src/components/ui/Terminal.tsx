"use client";

import React from "react";
import Text from "./Text";

interface TerminalLine {
  id: string;
  content: string;
}

interface TerminalProps {
  lines: TerminalLine[];
  className?: string;
  height?: string;
  autoScroll?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({
  lines,
  className = "",
  height = "h-40",
  autoScroll = true,
}) => {
  return (
    <div
      className={`font-mono ${height} overflow-hidden relative ${className}`}
    >
      <div className={`${autoScroll ? "animate-terminal-scroll" : ""} w-full`}>
        {lines.map((line) => (
          <div key={line.id} className="flex mb-1">
            <Text variant="terminal" className="break-all whitespace-pre-wrap">
              {line.content}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Terminal;
