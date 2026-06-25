import { AchievementsManager } from "@/lib/achievements";

export interface PaletteDefinition {
  id: string;
  name: string;
  description: string;
  accent: string;
  accentMuted: string;
  accentSoft: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  mutedText: string;
  warm: string;
  warmSoft: string;
  glow: string;
  previewGradient: string;
  unlockedByAchievement?: string;
}

export type PaletteWithStatus = PaletteDefinition & {
  unlocked: boolean;
  lockedCopy?: string;
};

export const PALETTE_STORAGE_KEY = "jmill-palette";
export const PALETTE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const DEFAULT_PALETTE_ID = "neon-cyan";

export const PALETTES: PaletteDefinition[] = [
  {
    id: DEFAULT_PALETTE_ID,
    name: "Neon Cyan",
    description: "Default vector glow inspired by old-school terminals.",
    accent: "#00FFFF",
    accentMuted: "rgba(0, 255, 255, 0.72)",
    accentSoft: "rgba(0, 255, 255, 0.18)",
    background: "#01050D",
    surface: "rgba(0, 6, 16, 0.92)",
    surfaceMuted: "rgba(0, 12, 24, 0.78)",
    border: "#00FFFF",
    text: "#E6FFFF",
    mutedText: "rgba(230, 255, 255, 0.72)",
    warm: "#FF4800",
    warmSoft: "rgba(255, 72, 0, 0.18)",
    glow: "0 0 16px rgba(0, 255, 255, 0.28)",
    previewGradient:
      "linear-gradient(135deg, rgba(0,255,255,0.18) 0%, rgba(0,255,255,0.05) 100%)",
  },
  {
    id: "nocturne-brass",
    name: "Nocturne Brass",
    description:
      "Smoked jazz lounge golds unlocked by those who really love the jam.",
    accent: "#F5C84C",
    accentMuted: "rgba(245, 200, 76, 0.8)",
    accentSoft: "rgba(245, 200, 76, 0.16)",
    background: "#0D0A11",
    surface: "rgba(18, 14, 22, 0.95)",
    surfaceMuted: "rgba(24, 18, 30, 0.78)",
    border: "#F5C84C",
    text: "#F8F1DD",
    mutedText: "rgba(248, 241, 221, 0.74)",
    warm: "#FF7A50",
    warmSoft: "rgba(255, 122, 80, 0.16)",
    glow: "0 0 16px rgba(245, 200, 76, 0.25)",
    previewGradient:
      "linear-gradient(135deg, rgba(245,200,76,0.22) 0%, rgba(255,122,80,0.12) 100%)",
    unlockedByAchievement: "jazz-lover",
  },
];

export class PaletteManager {
  private static instance: PaletteManager;
  private paletteId: string;
  private listeners: Array<() => void> = [];

  private constructor() {
    this.paletteId = this.loadPaletteId();
  }

  static getInstance(): PaletteManager {
    if (!PaletteManager.instance) {
      PaletteManager.instance = new PaletteManager();
    }
    return PaletteManager.instance;
  }

  private loadPaletteId(): string {
    if (typeof window === "undefined") {
      return DEFAULT_PALETTE_ID;
    }

    const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (stored) return stored;

    const cookiePalette = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${PALETTE_STORAGE_KEY}=`))
      ?.split("=")[1];

    return cookiePalette ? decodeURIComponent(cookiePalette) : DEFAULT_PALETTE_ID;
  }

  private persistPaletteId(id: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(PALETTE_STORAGE_KEY, id);
    document.cookie = `${PALETTE_STORAGE_KEY}=${encodeURIComponent(
      id
    )}; Max-Age=${PALETTE_COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
  }

  getPalettesWithStatus(): PaletteWithStatus[] {
    const achievements = AchievementsManager.getInstance();

    return PALETTES.map((palette) => {
      const requirement = palette.unlockedByAchievement
        ? achievements.getAchievement(palette.unlockedByAchievement)
        : null;
      const unlocked = !palette.unlockedByAchievement || !!requirement?.unlocked;

      return {
        ...palette,
        unlocked,
        lockedCopy: palette.unlockedByAchievement
          ? `Unlock “${requirement?.title || palette.unlockedByAchievement}”`
          : undefined,
      };
    });
  }

  getActivePalette(palettes: PaletteWithStatus[] = this.getPalettesWithStatus()) {
    const active = palettes.find(
      (palette) => palette.id === this.paletteId && palette.unlocked
    );

    if (active) {
      return active;
    }

    const firstUnlocked = palettes.find((palette) => palette.unlocked);
    const fallback = firstUnlocked || { ...PALETTES[0], unlocked: true };
    this.paletteId = fallback.id;
    this.persistPaletteId(fallback.id);
    return fallback;
  }

  setPalette(paletteId: string) {
    const palettes = this.getPalettesWithStatus();
    const next = palettes.find((palette) => palette.id === paletteId);
    const active = next?.unlocked ? next : this.getActivePalette(palettes);

    this.paletteId = active.id;
    this.persistPaletteId(active.id);
    this.applyPalette(active);
    this.notify();

    return active;
  }

  applyPalette(palette: PaletteDefinition | PaletteWithStatus) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--palette-accent", palette.accent);
    root.style.setProperty("--palette-accent-muted", palette.accentMuted);
    root.style.setProperty("--palette-accent-soft", palette.accentSoft);
    root.style.setProperty("--palette-background", palette.background);
    root.style.setProperty("--palette-surface", palette.surface);
    root.style.setProperty("--palette-surface-muted", palette.surfaceMuted);
    root.style.setProperty("--palette-border", palette.border);
    root.style.setProperty("--palette-border-soft", palette.accentSoft);
    root.style.setProperty("--palette-text", palette.text);
    root.style.setProperty("--palette-muted-text", palette.mutedText);
    root.style.setProperty("--palette-warm", palette.warm);
    root.style.setProperty("--palette-warm-soft", palette.warmSoft);
    root.style.setProperty("--palette-glow", palette.glow);
    root.style.setProperty("--palette-preview", palette.previewGradient);
  }

  onPaletteChange(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}
