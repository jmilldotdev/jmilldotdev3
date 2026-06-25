"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AchievementsManager } from "@/lib/achievements";
import {
  PaletteManager,
  type PaletteWithStatus,
} from "@/lib/palettes";

interface PaletteContextValue {
  palette: PaletteWithStatus;
  palettes: PaletteWithStatus[];
  setPalette: (id: string) => void;
  refreshPalettes: () => void;
}

const PaletteContext = createContext<PaletteContextValue | undefined>(
  undefined
);

export function PaletteProvider({ children }: { children: React.ReactNode }) {
  const managerRef = useRef(PaletteManager.getInstance());
  const achievementsRef = useRef<AchievementsManager | null>(null);
  const [palettes, setPalettes] = useState<PaletteWithStatus[]>([]);
  const [activePalette, setActivePalette] = useState<PaletteWithStatus | null>(
    null
  );

  const refreshPalettes = useCallback(() => {
    const manager = managerRef.current;
    const paletteList = manager.getPalettesWithStatus();
    const active = manager.getActivePalette(paletteList);
    manager.applyPalette(active);
    setPalettes(paletteList);
    setActivePalette(active);
  }, []);

  const handleSetPalette = useCallback(
    (id: string) => {
      managerRef.current.setPalette(id);
    },
    []
  );

  useEffect(() => {
    achievementsRef.current = AchievementsManager.getInstance();
    refreshPalettes();

    const unsubscribeAchievement =
      achievementsRef.current.onAchievementUnlocked(() => {
        refreshPalettes();
      });

    const unsubscribePalette = managerRef.current.onPaletteChange(
      refreshPalettes
    );

    return () => {
      unsubscribeAchievement?.();
      unsubscribePalette?.();
    };
  }, [refreshPalettes]);

  const value = useMemo<PaletteContextValue>(() => {
    const manager = managerRef.current;
    return {
      palette:
        activePalette ??
        manager.getActivePalette(manager.getPalettesWithStatus()),
      palettes,
      setPalette: handleSetPalette,
      refreshPalettes,
    };
  }, [activePalette, handleSetPalette, palettes, refreshPalettes]);

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  );
}

export function usePalette() {
  const context = useContext(PaletteContext);
  if (!context) {
    throw new Error("usePalette must be used within a PaletteProvider");
  }
  return context;
}
