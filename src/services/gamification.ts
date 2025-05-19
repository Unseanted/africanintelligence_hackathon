import {
  UserStats,
  CourseProgress,
  XP_CONSTANTS,
  Achievement,
  Leaderboard,
} from "../types/gamification";

const XP_CONSTANTS_TYPED = XP_CONSTANTS as {
  LESSON_COMPLETE: number;
  PERFECT_SCORE_BONUS: number;
  STREAK_MULTIPLIER: number;
  MAX_STREAK_BONUS: number;
  ACHIEVEMENT_BASE: number;
};

export class GamificationService {
  private static instance: GamificationService;
  private userStats: Map<string, UserStats> = new Map();
  private leaderboards: Map<string, Leaderboard> = new Map();

  private constructor() {}

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  calculateXP(
    baseScore: number,
    streak: number,
    isPerfectScore: boolean,
    achievementsUnlocked: number
  ): number {
    let xp = XP_CONSTANTS_TYPED.LESSON_COMPLETE * baseScore;

    // Apply streak bonus
    const streakBonus = xp * (streak * XP_CONSTANTS_TYPED.STREAK_MULTIPLIER);
    xp += streakBonus;

    // Apply perfect score bonus
    if (isPerfectScore) {
      xp += XP_CONSTANTS_TYPED.PERFECT_SCORE_BONUS;
    }

    // Apply achievement bonus
    xp += achievementsUnlocked * XP_CONSTANTS_TYPED.ACHIEVEMENT_BASE;

    return Math.round(xp);
  }

  calculateLevel(xp: number): number {
    let level = 1;
    const baseXpNeeded = 1000; // Base XP needed for level 1
    const multiplier = 1.5; // Each level requires 50% more XP

    while (xp >= baseXpNeeded * Math.pow(multiplier, level - 1)) {
      level++;
    }

    return level;
  }

  updateStreak(userId: string): void {
    const stats = this.userStats.get(userId);
    if (!stats) return;

    const today = new Date();
    const lastActivity = new Date(stats.lastActivityDate);
    const daysSinceLastActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity === 1) {
      // Consecutive day
      stats.currentStreak++;
      if (stats.currentStreak > stats.longestStreak) {
        stats.longestStreak = stats.currentStreak;
      }
    } else if (daysSinceLastActivity > 1) {
      // Streak broken
      stats.currentStreak = 1;
    }

    stats.lastActivityDate = today;
    this.userStats.set(userId, stats);
  }

  updateLeaderboard(userId: string, courseId?: string): void {
    const stats = this.userStats.get(userId);
    if (!stats) return;

    // Update global leaderboard
    this.updateLeaderboardType("global", userId, stats);

    // Update course-specific leaderboard if courseId is provided
    if (courseId) {
      this.updateLeaderboardType("course", userId, stats, courseId);
    }

    // Update weekly leaderboard
    this.updateLeaderboardType("weekly", userId, stats);
  }

  private updateLeaderboardType(
    type: "global" | "course" | "weekly",
    userId: string,
    stats: UserStats,
    courseId?: string
  ): void {
    const leaderboardId = type;
    let leaderboard = this.leaderboards.get(leaderboardId);

    if (!leaderboard) {
      leaderboard = {
        id: leaderboardId,
        type,
        courseId,
        entries: [],
        lastUpdated: new Date(),
      };
    }

    // Update or add user entry
    const entryIndex = leaderboard.entries.findIndex(
      (entry) => entry.userId === userId
    );
    const entry = {
      userId,
      username: "", // Should be fetched from user service
      xp: stats.totalXp,
      streak: stats.currentStreak,
      achievements: stats.achievements.length,
      rank: 0, // Will be calculated after sorting
    };

    if (entryIndex >= 0) {
      leaderboard.entries[entryIndex] = entry;
    } else {
      leaderboard.entries.push(entry);
    }

    // Sort entries by XP and update ranks
    leaderboard.entries.sort((a, b) => b.xp - a.xp);
    leaderboard.entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    leaderboard.lastUpdated = new Date();
    this.leaderboards.set(leaderboardId, leaderboard);
  }

  checkAchievements(userId: string): Achievement[] {
    const stats = this.userStats.get(userId);
    if (!stats) return [];

    const newlyUnlocked: Achievement[] = [];
    const achievements = this.getAchievements();

    achievements.forEach((achievement) => {
      if (achievement.unlockedAt) return; // Already unlocked

      const isUnlocked = this.checkAchievementRequirements(stats, achievement);
      if (isUnlocked) {
        achievement.unlockedAt = new Date();
        stats.achievements.push(achievement);
        newlyUnlocked.push(achievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.userStats.set(userId, stats);
    }

    return newlyUnlocked;
  }

  private checkAchievementRequirements(
    stats: UserStats,
    achievement: Achievement
  ): boolean {
    switch (achievement.type) {
      case "streak_3":
        return stats.currentStreak >= 3;
      case "streak_7":
        return stats.currentStreak >= 7;
      case "streak_30":
        return stats.currentStreak >= 30;
      case "course_complete":
        return Object.values(stats.courseProgress).some(
          (progress) => progress.completedLessons.length >= achievement.target
        );
      case "perfect_score":
        return Object.values(stats.courseProgress).some(
          (progress) => progress.xp >= achievement.target
        );
      case "early_bird":
      case "night_owl":
      case "social_butterfly":
        // Implement time-based and social achievement logic
        return false;
      default:
        return false;
    }
  }

  private getAchievements(): Achievement[] {
    return [
      {
        id: "streak-3",
        title: "Getting Started",
        description: "Maintain a 3-day streak",
        icon: "🔥",
        unlockedAt: null,
        xpReward: 200,
        type: "streak_3",
        progress: 0,
        target: 3,
      },
      {
        id: "streak-7",
        title: "On Fire",
        description: "Maintain a 7-day streak",
        icon: "🔥🔥",
        unlockedAt: null,
        xpReward: 500,
        type: "streak_7",
        progress: 0,
        target: 7,
      },
      {
        id: "streak-30",
        title: "Unstoppable",
        description: "Maintain a 30-day streak",
        icon: "🔥🔥🔥",
        unlockedAt: null,
        xpReward: 1000,
        type: "streak_30",
        progress: 0,
        target: 30,
      },
      {
        id: "course-complete",
        title: "Course Master",
        description: "Complete a course",
        icon: "🎓",
        unlockedAt: null,
        xpReward: 300,
        type: "course_complete",
        progress: 0,
        target: 1,
      },
      {
        id: "perfect-score",
        title: "Perfect Score",
        description: "Get a perfect score in a lesson",
        icon: "⭐",
        unlockedAt: null,
        xpReward: 200,
        type: "perfect_score",
        progress: 0,
        target: 100,
      },
    ];
  }
}
