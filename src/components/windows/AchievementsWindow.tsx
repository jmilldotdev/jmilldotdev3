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
  onToggleMaximize: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onResizeStart?: (e: React.MouseEvent, windowId: string) => void;
}

export const AchievementsWindow: React.FC<AchievementsWindowProps> = (
  props
) => {
  const [hoveredAchievement, setHoveredAchievement] =
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
  const totalCount = 49;

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
          <h2 className="text-[#00FFFF] font-mono text-lg mb-2">
            Achievement Progress
          </h2>
          <div className="text-[#00FFFF]/80 font-mono text-sm">
            {unlockedCount} / {totalCount} Unlocked (
            {Math.round((unlockedCount / totalCount) * 100)}%)
          </div>
        </div>

        {/* Details Panel */}
        <div className="border border-[#00FFFF]/30 bg-black/20 p-4 mb-4">
          {hoveredAchievement ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-16 h-16 border border-[#00FFFF] flex items-center justify-center flex-shrink-0 ${
                    hoveredAchievement.unlocked
                      ? "bg-[#00FFFF]/20"
                      : "bg-black/50"
                  }`}
                >
                  <hoveredAchievement.icon
                    className={`w-10 h-10 ${
                      hoveredAchievement.unlocked
                        ? "text-[#00FFFF]"
                        : "text-[#00FFFF]/50"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#00FFFF] font-mono font-bold text-xl mb-1">
                    {hoveredAchievement.unlocked || hintedAchievements.has(hoveredAchievement.id)
                      ? hoveredAchievement.title
                      : "?????????"}
                  </h3>
                  <div
                    className={`px-2 py-1 border font-mono text-xs inline-block ${
                      hoveredAchievement.unlocked
                        ? "border-[#00FFFF] text-[#00FFFF] bg-[#00FFFF]/10"
                        : "border-[#00FFFF]/30 text-[#00FFFF]/50 bg-black/30"
                    }`}
                  >
                    {hoveredAchievement.unlocked ? "UNLOCKED" : "LOCKED"}
                  </div>
                </div>
              </div>

              <p className="text-[#00FFFF]/80 font-mono text-sm leading-relaxed mb-3">
                {hoveredAchievement.unlocked ? hoveredAchievement.description : "?????????"}
              </p>

              {/* Always render timestamp area, invisible when locked */}
              <div className={`text-[#00FFFF]/60 font-mono text-xs ${hoveredAchievement.unlocked ? '' : 'invisible'}`}>
                <div>
                  {hoveredAchievement.unlocked && hoveredAchievement.unlockedAt
                    ? `Unlocked: ${hoveredAchievement.unlockedAt.toLocaleDateString()} ${hoveredAchievement.unlockedAt.toLocaleTimeString()}`
                    : 'Unlocked: 00/00/0000 00:00:00 AM'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-3">
                <div className="w-16 h-16 border border-[#00FFFF]/30 flex items-center justify-center bg-black/30">
                  <div className="text-[#00FFFF]/30 text-3xl">?</div>
                </div>
              </div>

              <p className="text-[#00FFFF]/60 font-mono text-sm leading-relaxed mb-3">
                Hover over an achievement square to view details
              </p>

              {/* Invisible timestamp spacer */}
              <div className="text-[#00FFFF]/60 font-mono text-xs invisible">
                <div>Unlocked: 00/00/0000 00:00:00 AM</div>
              </div>
            </div>
          )}
        </div>

        {/* 5x5 Grid */}
        <div className="flex-1 flex items-center justify-center">
          <div className="grid grid-cols-5 gap-2 p-4 border border-[#00FFFF]/30 bg-black/20">
            {grid.map((row, y) =>
              row.map((achievement, x) => {
                const key = `${y}-${x}`;
                const isHinted = achievement && hintedAchievements.has(achievement.id);

                return (
                  <div
                    key={key}
                    className={`
                      w-16 h-16 border flex items-center justify-center cursor-pointer
                      transition-all duration-200 relative group overflow-hidden
                      ${
                        achievement?.unlocked
                          ? "bg-[#00FFFF]/20 border-[#00FFFF] hover:bg-[#00FFFF]/30"
                          : isHinted
                          ? "bg-black/50 border-[#00FFFF]/50 hover:border-[#00FFFF]/70"
                          : achievement
                          ? "bg-black/50 border-[#00FFFF]/30 hover:border-[#00FFFF]/50"
                          : "bg-black/20 border-[#00FFFF]/30"
                      }
                    `}
                    onMouseEnter={() =>
                      achievement && setHoveredAchievement(achievement)
                    }
                    onMouseLeave={() => setHoveredAchievement(null)}
                  >
                    {achievement && (achievement.unlocked || isHinted) && (
                      <>
                        <achievement.icon
                          className={`w-8 h-8 transition-all relative z-10 ${
                            achievement.unlocked
                              ? "text-[#00FFFF]"
                              : "text-[#00FFFF]/50"
                          }`}
                        />
                        {achievement.unlocked && (
                          <div className="absolute inset-0 border border-[#00FFFF]/50 animate-pulse" />
                        )}
                        {isHinted && !achievement.unlocked && (
                          <div className="absolute inset-0 border border-[#00FFFF]/40 animate-[pulse_2s_ease-in-out_infinite]" />
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
