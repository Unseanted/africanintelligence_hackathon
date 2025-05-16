export interface UserStats {
  userId: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  achievements: Achievement[];
  courseProgress: Record<string, CourseProgress>;
}

export interface CourseProgress {
  courseId: string;
  xp: number;
  completedLessons: string[];
  currentStreak: number;
  lastActivityDate: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date | null;
  xpReward: number;
  type: AchievementType;
  progress: number;
  target: number;
}

export type AchievementType =
  | "first_lesson"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "course_complete"
  | "perfect_score"
  | "early_bird"
  | "night_owl"
  | "social_butterfly";

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl?: string;
  xp: number;
  streak: number;
  achievements: number;
  rank: number;
}

export interface Leaderboard {
  id: string;
  type: "global" | "course" | "weekly";
  courseId?: string;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface XpReward {
  type: "lesson_complete" | "streak_bonus" | "achievement" | "perfect_score";
  amount: number;
  description: string;
  timestamp: Date;
}

// XP calculation constants
export const XP_CONSTANTS = {
  LESSON_COMPLETE: 100,
  PERFECT_SCORE_BONUS: 50,
  STREAK_MULTIPLIER: 0.1, // 10% bonus per day in streak
  MAX_STREAK_BONUS: 2, // Maximum 200% bonus
  ACHIEVEMENT_BASE: 200,
} as const;

// Add type for XP constants
export type XPConstants = {
  [K in keyof typeof XP_CONSTANTS]: number;
};
