import React from "react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  x: number; // Grid position (0-6)
  y: number; // Grid position (0-6)
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface AchievementProgress {
  [achievementId: string]: {
    unlocked: boolean;
    unlockedAt: string;
  };
}

const ACHIEVEMENTS_STORAGE_KEY = "jmill-achievements";

// Icon components
const FirstLoginIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Omit<
  Achievement,
  "unlocked" | "unlockedAt"
>[] = [
  {
    id: "first-login",
    title: "First Login",
    description: "Welcome to my site.",
    x: 3, // Center of 7x7 grid
    y: 3,
    icon: FirstLoginIcon,
  },
];

export class AchievementsManager {
  private static instance: AchievementsManager;
  private achievements: Achievement[] = [];
  private listeners: ((achievement: Achievement) => void)[] = [];

  private constructor() {
    this.loadAchievements();
  }

  static getInstance(): AchievementsManager {
    if (!AchievementsManager.instance) {
      AchievementsManager.instance = new AchievementsManager();
    }
    return AchievementsManager.instance;
  }

  private loadAchievements() {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      this.achievements = ACHIEVEMENT_DEFINITIONS.map((def) => ({
        ...def,
        unlocked: false,
        unlockedAt: undefined,
      }));
      return;
    }

    const saved = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    const progress: AchievementProgress = saved ? JSON.parse(saved) : {};

    this.achievements = ACHIEVEMENT_DEFINITIONS.map((def) => ({
      ...def,
      unlocked: progress[def.id]?.unlocked || false,
      unlockedAt: progress[def.id]?.unlockedAt
        ? new Date(progress[def.id].unlockedAt)
        : undefined,
    }));
  }

  private saveAchievements() {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
      return;
    }

    const progress: AchievementProgress = {};
    this.achievements.forEach((achievement) => {
      if (achievement.unlocked) {
        progress[achievement.id] = {
          unlocked: true,
          unlockedAt: achievement.unlockedAt!.toISOString(),
        };
      }
    });
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(progress));
  }

  unlock(achievementId: string): boolean {
    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement || achievement.unlocked) {
      return false;
    }

    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    this.saveAchievements();

    // Notify listeners
    this.listeners.forEach((listener) => listener(achievement));
    return true;
  }

  getAchievement(id: string): Achievement | undefined {
    return this.achievements.find((a) => a.id === id);
  }

  getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  getUnlockedCount(): number {
    return this.achievements.filter((a) => a.unlocked).length;
  }

  getTotalCount(): number {
    return 49; // Total planned achievements
  }

  onAchievementUnlocked(listener: (achievement: Achievement) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Reset all achievements
  resetAll(): void {
    // Reset all achievements to unlocked: false
    this.achievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      unlocked: false,
      unlockedAt: undefined,
    }));

    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
    }

    // Notify listeners that achievements have been reset (optional)
    // You could add a separate reset listener system if needed
  }

  // Create a 7x7 grid representation
  getAchievementGrid(): (Achievement | null)[][] {
    const grid: (Achievement | null)[][] = Array(7)
      .fill(null)
      .map(() => Array(7).fill(null));

    this.achievements.forEach((achievement) => {
      if (
        achievement.x >= 0 &&
        achievement.x < 7 &&
        achievement.y >= 0 &&
        achievement.y < 7
      ) {
        grid[achievement.y][achievement.x] = achievement;
      }
    });

    return grid;
  }
}
