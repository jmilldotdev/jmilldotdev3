import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Script from "next/script";
import QuickSwitcher from "@/components/QuickSwitcher";
import { getQuickSwitcherData } from "@/lib/quick-switcher-data";
import { DesktopProvider } from "@/contexts/DesktopContext";
import { PaletteProvider } from "@/contexts/PaletteContext";
import {
  PALETTE_COOKIE_MAX_AGE,
  PALETTE_STORAGE_KEY,
  PALETTES,
  type PaletteDefinition,
} from "@/lib/palettes";

export const metadata: Metadata = {
  title: "jmill",
  description: "jmill's digital shrine to himself.",
};

interface LayoutProps {
  children: React.ReactNode;
}

type PaletteStyle = React.CSSProperties & Record<string, string>;

const getPaletteStyle = (palette: PaletteDefinition): PaletteStyle =>
  ({
    "--palette-accent": palette.accent,
    "--palette-accent-muted": palette.accentMuted,
    "--palette-accent-soft": palette.accentSoft,
    "--palette-background": palette.background,
    "--palette-surface": palette.surface,
    "--palette-surface-muted": palette.surfaceMuted,
    "--palette-border": palette.border,
    "--palette-border-soft": palette.accentSoft,
    "--palette-text": palette.text,
    "--palette-muted-text": palette.mutedText,
    "--palette-warm": palette.warm,
    "--palette-warm-soft": palette.warmSoft,
    "--palette-glow": palette.glow,
    "--palette-preview": palette.previewGradient,
  } as PaletteStyle);

const paletteBootScript = `
(() => {
  try {
    const storageKey = ${JSON.stringify(PALETTE_STORAGE_KEY)};
    const achievementStorageKey = "jmill-achievements";
    const cookieMaxAge = ${PALETTE_COOKIE_MAX_AGE};
    const palettes = ${JSON.stringify(
      PALETTES.map(
        ({
          id,
          accent,
          accentMuted,
          accentSoft,
          background,
          surface,
          surfaceMuted,
          border,
          text,
          mutedText,
          warm,
          warmSoft,
          glow,
          previewGradient,
          unlockedByAchievement,
        }) => ({
          id,
          accent,
          accentMuted,
          accentSoft,
          background,
          surface,
          surfaceMuted,
          border,
          text,
          mutedText,
          warm,
          warmSoft,
          glow,
          previewGradient,
          unlockedByAchievement,
        })
      )
    )};
    const storedPaletteId = localStorage.getItem(storageKey);
    const palette = palettes.find((candidate) => candidate.id === storedPaletteId);
    if (!palette) return;

    if (palette.unlockedByAchievement) {
      const achievements = JSON.parse(
        localStorage.getItem(achievementStorageKey) || "{}"
      );
      if (!achievements[palette.unlockedByAchievement]?.unlocked) return;
    }

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
    document.cookie =
      storageKey +
      "=" +
      encodeURIComponent(palette.id) +
      "; Max-Age=" +
      cookieMaxAge +
      "; Path=/; SameSite=Lax";
  } catch {
  }
})();
`;

const Layout = async ({ children }: LayoutProps) => {
  const { pageMetadata, tagData } = getQuickSwitcherData();
  const cookieStore = await cookies();
  const paletteCookie = cookieStore.get(PALETTE_STORAGE_KEY)?.value;
  const initialPalette = PALETTES.find(
    (palette) => palette.id === paletteCookie
  );
  const initialPaletteStyle = initialPalette
    ? getPaletteStyle(initialPalette)
    : undefined;

  return (
    <html
      lang="en"
      style={initialPaletteStyle}
      suppressHydrationWarning
    >
      <head>
        <script
          id="palette-boot"
          dangerouslySetInnerHTML={{ __html: paletteBootScript }}
        />
      </head>
      <Script
        defer
        src="https://umami-tawny-theta.vercel.app/script.js"
        data-website-id="016992b7-62de-4ef5-84aa-b0274ddaabb0"
      />
      <body className="min-h-screen bg-[color:var(--palette-background)] text-foreground">
        <DesktopProvider>
          <PaletteProvider>
            <QuickSwitcher pageMetadata={pageMetadata} tagData={tagData}>
              <div
                id="app"
                className="grid grid-rows-[80px_1fr] h-screen p-2.5 gap-2.5"
              >
                <Header />
                <main className="relative border border-[color:var(--palette-border-soft)] bg-[color:var(--palette-surface-muted)] flex flex-col justify-start overflow-auto">
                  {children}
                </main>
              </div>
            </QuickSwitcher>
          </PaletteProvider>
        </DesktopProvider>
      </body>
    </html>
  );
};

export default Layout;
