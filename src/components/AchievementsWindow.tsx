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

  useEffect(() => {
    const manager = AchievementsManager.getInstance();
    setAchievements(manager.getAllAchievements());
    setGrid(manager.getAchievementGrid());
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = 49;

  return (
    <BaseWindow {...props} data-window="true">
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

        <div className="flex-1 flex gap-4">
          {/* 7x7 Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-7 gap-1 p-2 border border-[#00FFFF]/30 bg-black/20">
              {grid.map((row, y) =>
                row.map((achievement, x) => {
                  const key = `${y}-${x}`;
                  return (
                    <div
                      key={key}
                      className={`
                        w-12 h-12 border border-[#00FFFF]/30 flex items-center justify-center cursor-pointer
                        transition-all duration-200 relative
                        ${
                          achievement?.unlocked
                            ? "bg-[#00FFFF]/20 border-[#00FFFF] hover:bg-[#00FFFF]/30"
                            : achievement
                            ? "bg-black/50 border-[#00FFFF]/10 hover:border-[#00FFFF]/20"
                            : "bg-black/20 border-[#00FFFF]/10"
                        }
                      `}
                      onMouseEnter={() =>
                        achievement && setHoveredAchievement(achievement)
                      }
                      onMouseLeave={() => setHoveredAchievement(null)}
                    >
                      {achievement && (
                        <>
                          <achievement.icon
                            className={`w-6 h-6 ${
                              achievement.unlocked
                                ? "text-[#00FFFF]"
                                : "text-[#00FFFF]/30"
                            }`}
                          />
                          {achievement.unlocked && (
                            <div className="absolute inset-0 border border-[#00FFFF]/50 animate-pulse" />
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-64 border border-[#00FFFF]/30 bg-black/20 p-4">
            {hoveredAchievement ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 border border-[#00FFFF] flex items-center justify-center ${
                      hoveredAchievement.unlocked
                        ? "bg-[#00FFFF]/20"
                        : "bg-black/50"
                    }`}
                  >
                    <hoveredAchievement.icon
                      className={`w-8 h-8 ${
                        hoveredAchievement.unlocked
                          ? "text-[#00FFFF]"
                          : "text-[#00FFFF]/50"
                      }`}
                    />
                  </div>
                  <div
                    className={`px-2 py-1 border font-mono text-xs ${
                      hoveredAchievement.unlocked
                        ? "border-[#00FFFF] text-[#00FFFF] bg-[#00FFFF]/10"
                        : "border-[#00FFFF]/30 text-[#00FFFF]/50 bg-black/30"
                    }`}
                  >
                    {hoveredAchievement.unlocked ? "UNLOCKED" : "LOCKED"}
                  </div>
                </div>

                <h3 className="text-[#00FFFF] font-mono font-bold text-lg mb-2">
                  {hoveredAchievement.title}
                </h3>

                <p className="text-[#00FFFF]/80 font-mono text-sm leading-relaxed mb-4">
                  {hoveredAchievement.description}
                </p>

                {hoveredAchievement.unlocked &&
                  hoveredAchievement.unlockedAt && (
                    <div className="text-[#00FFFF]/60 font-mono text-xs">
                      <div>Unlocked:</div>
                      <div>
                        {hoveredAchievement.unlockedAt.toLocaleDateString()}
                      </div>
                      <div>
                        {hoveredAchievement.unlockedAt.toLocaleTimeString()}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-[#00FFFF]/60 font-mono text-sm text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 border border-[#00FFFF]/30 mx-auto mb-2 flex items-center justify-center">
                    <div className="text-[#00FFFF]/30 text-2xl">?</div>
                  </div>
                </div>
                Hover over an achievement square to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseWindow>
  );
};
