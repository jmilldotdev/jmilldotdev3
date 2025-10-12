import React from "react";
import { ACHIEVEMENTS_ENABLED } from "@/config";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  x: number; // Grid position (0-4)
  y: number; // Grid position (0-4)
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

const LockedIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </svg>
);

const JazzLoverIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const GoodListenerIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MatrixIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <rect x="4" y="4" width="6" height="6" rx="1" />
    <rect x="14" y="4" width="6" height="6" rx="1" />
    <rect x="4" y="14" width="6" height="6" rx="1" />
    <rect x="14" y="14" width="6" height="6" rx="1" />
  </svg>
);

// Achievement definitions - 5x5 grid (25 total)
export const ACHIEVEMENT_DEFINITIONS: Omit<
  Achievement,
  "unlocked" | "unlockedAt"
>[] = [
  // Row 0
  {
    id: "locked-0-0",
    title: "???",
    description: "This achievement is locked.",
    x: 0,
    y: 0,
    icon: LockedIcon,
  },
  {
    id: "locked-1-0",
    title: "???",
    description: "This achievement is locked.",
    x: 1,
    y: 0,
    icon: LockedIcon,
  },
  {
    id: "locked-2-0",
    title: "???",
    description: "This achievement is locked.",
    x: 2,
    y: 0,
    icon: LockedIcon,
  },
  {
    id: "locked-3-0",
    title: "???",
    description: "This achievement is locked.",
    x: 3,
    y: 0,
    icon: LockedIcon,
  },
  {
    id: "locked-4-0",
    title: "???",
    description: "This achievement is locked.",
    x: 4,
    y: 0,
    icon: LockedIcon,
  },
  // Row 1
  {
    id: "locked-0-1",
    title: "???",
    description: "This achievement is locked.",
    x: 0,
    y: 1,
    icon: LockedIcon,
  },
  {
    id: "locked-1-1",
    title: "???",
    description: "This achievement is locked.",
    x: 1,
    y: 1,
    icon: LockedIcon,
  },
  {
    id: "into-the-matrix",
    title: "Commander",
    description: "Discovered the secret command.",
    x: 2,
    y: 1,
    icon: MatrixIcon,
  },
  {
    id: "locked-3-1",
    title: "???",
    description: "This achievement is locked.",
    x: 3,
    y: 1,
    icon: LockedIcon,
  },
  {
    id: "locked-4-1",
    title: "???",
    description: "This achievement is locked.",
    x: 4,
    y: 1,
    icon: LockedIcon,
  },
  // Row 2 (center row)
  {
    id: "locked-0-2",
    title: "???",
    description: "This achievement is locked.",
    x: 0,
    y: 2,
    icon: LockedIcon,
  },
  {
    id: "good-listener",
    title: "Good Listener",
    description: "Listened to a full project from start to finish.",
    x: 1,
    y: 2,
    icon: GoodListenerIcon,
  },
  {
    id: "first-login",
    title: "First Login",
    description: "Welcome to my site.",
    x: 2,
    y: 2,
    icon: FirstLoginIcon,
  },
  {
    id: "jazz-lover",
    title: "Jazz Lover",
    description: "You can never have too much Jazz.",
    x: 3,
    y: 2,
    icon: JazzLoverIcon,
  },
  {
    id: "locked-4-2",
    title: "???",
    description: "This achievement is locked.",
    x: 4,
    y: 2,
    icon: LockedIcon,
  },
  // Row 3
  {
    id: "locked-0-3",
    title: "???",
    description: "This achievement is locked.",
    x: 0,
    y: 3,
    icon: LockedIcon,
  },
  {
    id: "locked-1-3",
    title: "???",
    description: "This achievement is locked.",
    x: 1,
    y: 3,
    icon: LockedIcon,
  },
  {
    id: "locked-2-3",
    title: "???",
    description: "This achievement is locked.",
    x: 2,
    y: 3,
    icon: LockedIcon,
  },
  {
    id: "locked-3-3",
    title: "???",
    description: "This achievement is locked.",
    x: 3,
    y: 3,
    icon: LockedIcon,
  },
  {
    id: "locked-4-3",
    title: "???",
    description: "This achievement is locked.",
    x: 4,
    y: 3,
    icon: LockedIcon,
  },
  // Row 4
  {
    id: "locked-0-4",
    title: "???",
    description: "This achievement is locked.",
    x: 0,
    y: 4,
    icon: LockedIcon,
  },
  {
    id: "locked-1-4",
    title: "???",
    description: "This achievement is locked.",
    x: 1,
    y: 4,
    icon: LockedIcon,
  },
  {
    id: "locked-2-4",
    title: "???",
    description: "This achievement is locked.",
    x: 2,
    y: 4,
    icon: LockedIcon,
  },
  {
    id: "locked-3-4",
    title: "???",
    description: "This achievement is locked.",
    x: 3,
    y: 4,
    icon: LockedIcon,
  },
  {
    id: "locked-4-4",
    title: "???",
    description: "This achievement is locked.",
    x: 4,
    y: 4,
    icon: LockedIcon,
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
    return this.achievements.length;
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

  // Create a 5x5 grid representation
  getAchievementGrid(): (Achievement | null)[][] {
    const grid: (Achievement | null)[][] = Array(5)
      .fill(null)
      .map(() => Array(5).fill(null));

    this.achievements.forEach((achievement) => {
      if (
        achievement.x >= 0 &&
        achievement.x < 5 &&
        achievement.y >= 0 &&
        achievement.y < 5
      ) {
        grid[achievement.y][achievement.x] = achievement;
      }
    });

    return grid;
  }

  // Get cardinal neighbors (up, down, left, right) of an achievement
  getCardinalNeighbors(achievement: Achievement): Achievement[] {
    const neighbors: Achievement[] = [];
    const directions = [
      { x: 0, y: -1 }, // up
      { x: 0, y: 1 },  // down
      { x: -1, y: 0 }, // left
      { x: 1, y: 0 },  // right
    ];

    directions.forEach(({ x: dx, y: dy }) => {
      const neighborX = achievement.x + dx;
      const neighborY = achievement.y + dy;

      const neighbor = this.achievements.find(
        (a) => a.x === neighborX && a.y === neighborY
      );

      if (neighbor) {
        neighbors.push(neighbor);
      }
    });

    return neighbors;
  }
}

/**
 * Unlock an achievement if achievements are enabled.
 * This is the recommended way to unlock achievements throughout the app.
 *
 * @param achievementId - The ID of the achievement to unlock
 * @returns true if the achievement was unlocked, false otherwise
 */
export function unlockAchievement(achievementId: string): boolean {
  if (!ACHIEVEMENTS_ENABLED) {
    return false;
  }

  const manager = AchievementsManager.getInstance();
  return manager.unlock(achievementId);
}
