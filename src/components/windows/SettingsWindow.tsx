"use client";

import React, { useEffect, useMemo, useState } from "react";
import { BaseWindow } from "./BaseWindow";
import { usePalette } from "@/contexts/PaletteContext";

interface SettingsWindowProps {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  zIndex: number;
  onClose: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, windowId: string) => void;
  isClosing?: boolean;
}

export const SettingsWindow: React.FC<SettingsWindowProps> = (props) => {
  const { palette, palettes, setPalette } = usePalette();
  const unlockedPalettes = useMemo(
    () => palettes.filter((p) => p.unlocked),
    [palettes]
  );
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.max(
      0,
      (unlockedPalettes.length ? unlockedPalettes : palettes).findIndex(
        (p) => p.id === palette.id
      )
    )
  );

  useEffect(() => {
    const list = unlockedPalettes.length ? unlockedPalettes : palettes;
    const idx = list.findIndex((p) => p.id === palette.id);
    setCurrentIndex(Math.max(0, idx));
  }, [palette.id, palettes, unlockedPalettes]);

  const list = unlockedPalettes.length ? unlockedPalettes : palettes;
  const current = list[currentIndex] ?? list[0];

  const goTo = (direction: "next" | "prev") => {
    const total = list.length;
    if (total === 0) return;

    const next =
      direction === "next"
        ? (currentIndex + 1) % total
        : (currentIndex - 1 + total) % total;
    const nextPalette = list[next];

    setCurrentIndex(next);
    if (nextPalette.unlocked) {
      setPalette(nextPalette.id);
    }
  };

  return (
    <BaseWindow
      {...props}
      minWidth={520}
      maxWidth={1100}
      minHeight={420}
      maxHeight={900}
      data-window="true"
    >
      <div className="p-4 space-y-6 text-foreground">
        <div className="flex items-center justify-between">
          <h2 className="text-accent text-lg font-semibold">Config</h2>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Palette</div>
              <div className="flex items-center gap-2">
                <button
                  className="w-8 h-8 border border-[color:var(--palette-border-soft)] rounded text-accent hover:border-[color:var(--palette-border)] transition-colors"
                  onClick={() => goTo("prev")}
                  aria-label="Previous palette"
                >
                  {"<"}
                </button>
                <div className="min-w-[160px] text-center text-sm font-mono">
                  {current.name}
                </div>
                <button
                  className="w-8 h-8 border border-[color:var(--palette-border-soft)] rounded text-accent hover:border-[color:var(--palette-border)] transition-colors"
                  onClick={() => goTo("next")}
                  aria-label="Next palette"
                >
                  {">"}
                </button>
              </div>
            </div>
            {current.lockedCopy && !current.unlocked && (
              <div className="text-[11px] text-accent-muted ml-auto">
                {current.lockedCopy}
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseWindow>
  );
};
