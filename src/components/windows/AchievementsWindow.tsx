"use client";

import { useState, useEffect } from "react";
import { BaseWindow } from "./BaseWindow";
import { Achievement, AchievementsManager } from "@/lib/achievements";

interface AchievementsWindowProps {
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

export const AchievementsWindow: React.FC<AchievementsWindowProps> = (
  props
) => {
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [grid, setGrid] = useState<(Achievement | null)[][]>([]);
  const [hintedAchievements, setHintedAchievements] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const manager = AchievementsManager.getInstance();
    setAchievements(manager.getAllAchievements());
    setGrid(manager.getAchievementGrid());

    // Calculate which achievements should show hints (neighbors of unlocked ones)
    const hinted = new Set<string>();
    manager.getAllAchievements().forEach((achievement) => {
      if (achievement.unlocked) {
        const neighbors = manager.getCardinalNeighbors(achievement);
        neighbors.forEach((neighbor) => {
          if (!neighbor.unlocked) {
            hinted.add(neighbor.id);
          }
        });
      }
    });
    setHintedAchievements(hinted);
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <BaseWindow
      {...props}
      minWidth={600}
      maxWidth={1200}
      minHeight={500}
      maxHeight={900}
      data-window="true"
    >
      <div className="p-4 h-full flex flex-col">
        {/* Header Stats */}
        <div className="mb-4">
          <h2 className="text-accent font-mono text-lg mb-2">
            Achievement Progress
          </h2>
          <div className="text-accent-muted font-mono text-sm">
            {unlockedCount} / {totalCount} Unlocked (
            {Math.round((unlockedCount / totalCount) * 100)}%)
          </div>
        </div>

        {/* Details Panel */}
        <div className="border border-[color:var(--palette-border-soft)] bg-[color:var(--palette-surface-muted)] p-4 mb-4">
          {selectedAchievement ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-16 h-16 border border-[color:var(--palette-border)] flex items-center justify-center flex-shrink-0 ${
                    selectedAchievement.unlocked
                      ? "bg-accent-soft"
                      : "bg-[color:var(--palette-surface-muted)]"
                  }`}
                >
                  <selectedAchievement.icon
                    className={`w-10 h-10 ${
                      selectedAchievement.unlocked
                        ? "text-accent"
                        : "text-accent-muted"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-accent font-mono font-bold text-xl mb-1">
                    {selectedAchievement.unlocked || hintedAchievements.has(selectedAchievement.id)
                      ? selectedAchievement.title
                      : "?????????"}
                  </h3>
                  <div
                    className={`px-2 py-1 border font-mono text-xs inline-block ${
                      selectedAchievement.unlocked
                        ? "border-[color:var(--palette-border)] text-accent bg-accent-soft"
                        : "border-[color:var(--palette-border-soft)] text-accent-muted bg-[color:var(--palette-surface-muted)]"
                    }`}
                  >
                    {selectedAchievement.unlocked ? "UNLOCKED" : "LOCKED"}
                  </div>
                </div>
              </div>

              <p className="text-accent-muted font-mono text-sm leading-relaxed mb-3">
                {selectedAchievement.unlocked ? selectedAchievement.description : "?????????"}
              </p>

              {/* Always render timestamp area, invisible when locked */}
              <div className={`text-accent-muted font-mono text-xs ${selectedAchievement.unlocked ? '' : 'invisible'}`}>
                <div>
                  {selectedAchievement.unlocked && selectedAchievement.unlockedAt
                    ? `Unlocked: ${selectedAchievement.unlockedAt.toLocaleDateString()} ${selectedAchievement.unlockedAt.toLocaleTimeString()}`
                    : 'Unlocked: 00/00/0000 00:00:00 AM'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-3">
                <div className="w-16 h-16 border border-[color:var(--palette-border-soft)] flex items-center justify-center bg-[color:var(--palette-surface-muted)]">
                  <div className="text-accent-muted text-3xl">?</div>
                </div>
              </div>

              <p className="text-accent-muted font-mono text-sm leading-relaxed mb-3">
                Tap an achievement square to view details
              </p>

              {/* Invisible timestamp spacer */}
              <div className="text-accent-muted font-mono text-xs invisible">
                <div>Unlocked: 00/00/0000 00:00:00 AM</div>
              </div>
            </div>
          )}
        </div>

        {/* 5x5 Grid */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-5 gap-2 p-4 border border-[color:var(--palette-border-soft)] bg-[color:var(--palette-surface-muted)]">
            {grid.map((row, y) =>
              row.map((achievement, x) => {
                const key = `${y}-${x}`;
                const isHinted = achievement && hintedAchievements.has(achievement.id);
                const isSelected = selectedAchievement?.id === achievement?.id;

                return (
                  <div
                    key={key}
                    role={achievement ? "button" : undefined}
                    tabIndex={achievement ? 0 : undefined}
                    className={`
                      w-16 h-16 border flex items-center justify-center cursor-pointer
                      transition-all duration-200 relative group overflow-hidden
                      ${
                        achievement?.unlocked
                          ? "bg-accent-soft border-[color:var(--palette-border)] hover:bg-[color:var(--palette-accent-muted)]"
                          : isHinted
                          ? "bg-[color:var(--palette-surface-muted)] border-[color:var(--palette-accent-muted)] hover:border-[color:var(--palette-border)]"
                          : achievement
                          ? "bg-[color:var(--palette-surface-muted)] border-[color:var(--palette-border-soft)] hover:border-[color:var(--palette-border)]"
                          : "bg-[color:var(--palette-surface-muted)] border-[color:var(--palette-border-soft)]"
                      }
                      ${isSelected ? "shadow-[0_0_14px_var(--palette-accent)]" : ""}
                    `}
                    onMouseEnter={() =>
                      achievement && setSelectedAchievement(achievement)
                    }
                    onMouseLeave={() => {
                      if (window.matchMedia("(hover: hover)").matches) {
                        setSelectedAchievement(null);
                      }
                    }}
                    onClick={() =>
                      achievement && setSelectedAchievement(achievement)
                    }
                    onKeyDown={(event) => {
                      if (
                        achievement &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        setSelectedAchievement(achievement);
                      }
                    }}
                  >
                    {achievement && (achievement.unlocked || isHinted) && (
                      <>
                        <achievement.icon
                          className={`w-8 h-8 transition-all relative z-10 ${
                            achievement.unlocked
                              ? "text-accent"
                              : "text-accent-muted"
                          }`}
                        />
                        {achievement.unlocked && (
                          <div className="absolute inset-0 border border-[color:var(--palette-accent-muted)] animate-pulse" />
                        )}
                        {isHinted && !achievement.unlocked && (
                          <div className="absolute inset-0 border border-[color:var(--palette-border-soft)] animate-[pulse_2s_ease-in-out_infinite]" />
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </BaseWindow>
  );
};
