import {
  UserStats,
  CourseProgress,
  Achievement,
  XpReward,
  XP_CONSTANTS,
} from "../types/gamification";

export class GamificationService {
  private static instance: GamificationService;
  private userStats: Map<string, UserStats> = new Map();

  private constructor() {}

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  calculateLessonXp(
    userId: string,
    courseId: string,
    score: number,
    isPerfect: boolean
  ): XpReward[] {
    const rewards: XpReward[] = [];
    const userStats = this.getUserStats(userId);
    const courseProgress = userStats.courseProgress[courseId];

    // Base XP for completing lesson
    rewards.push({
      type: "lesson_complete",
      amount: XP_CONSTANTS.LESSON_COMPLETE,
      description: "Completed lesson",
      timestamp: new Date(),
    });

    // Perfect score bonus
    if (isPerfect) {
      rewards.push({
        type: "perfect_score",
        amount: XP_CONSTANTS.PERFECT_SCORE_BONUS,
        description: "Perfect score bonus",
        timestamp: new Date(),
      });
    }

    // Streak bonus
    const streakBonus = this.calculateStreakBonus(userStats.currentStreak);
    if (streakBonus > 0) {
      rewards.push({
        type: "streak_bonus",
        amount: streakBonus,
        description: `${userStats.currentStreak} day streak bonus`,
        timestamp: new Date(),
      });
    }

    return rewards;
  }

  private calculateStreakBonus(streak: number): number {
    const multiplier = Math.min(
      streak * XP_CONSTANTS.STREAK_MULTIPLIER,
      XP_CONSTANTS.MAX_STREAK_BONUS
    );
    return Math.floor(XP_CONSTANTS.LESSON_COMPLETE * multiplier);
  }

  updateStreak(userId: string): void {
    const userStats = this.getUserStats(userId);
    const today = new Date();
    const lastActivity = new Date(userStats.lastActivityDate);

    // Check if last activity was yesterday
    const isConsecutiveDay =
      today.getDate() - lastActivity.getDate() === 1 &&
      today.getMonth() === lastActivity.getMonth() &&
      today.getFullYear() === lastActivity.getFullYear();

    if (isConsecutiveDay) {
      userStats.currentStreak++;
      userStats.longestStreak = Math.max(
        userStats.longestStreak,
        userStats.currentStreak
      );
    } else if (today.getDate() !== lastActivity.getDate()) {
      // Reset streak if more than one day has passed
      userStats.currentStreak = 1;
    }

    userStats.lastActivityDate = today;
    this.userStats.set(userId, userStats);
  }

  checkAchievements(userId: string): Achievement[] {
    const userStats = this.getUserStats(userId);
    const newlyUnlocked: Achievement[] = [];

    userStats.achievements.forEach((achievement) => {
      if (achievement.unlockedAt) return; // Skip already unlocked achievements

      let shouldUnlock = false;
      switch (achievement.type) {
        case "streak_3":
          shouldUnlock = userStats.currentStreak >= 3;
          break;
        case "streak_7":
          shouldUnlock = userStats.currentStreak >= 7;
          break;
        case "streak_30":
          shouldUnlock = userStats.currentStreak >= 30;
          break;
        case "course_complete":
          // Check if all lessons in a course are completed
          const courseProgress = Object.values(userStats.courseProgress);
          shouldUnlock = courseProgress.some(
            (progress) => progress.completedLessons.length > 0
          );
          break;
        // Add more achievement checks as needed
      }

      if (shouldUnlock) {
        achievement.unlockedAt = new Date();
        newlyUnlocked.push(achievement);
      }
    });

    return newlyUnlocked;
  }

  private getUserStats(userId: string): UserStats {
    if (!this.userStats.has(userId)) {
      this.userStats.set(userId, {
        userId,
        totalXp: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date(),
        achievements: this.initializeAchievements(),
        courseProgress: {},
      });
    }
    return this.userStats.get(userId)!;
  }

  private initializeAchievements(): Achievement[] {
    return [
      {
        id: "first_lesson",
        title: "First Steps",
        description: "Complete your first lesson",
        icon: "🎯",
        unlockedAt: null,
        xpReward: XP_CONSTANTS.ACHIEVEMENT_BASE,
        type: "first_lesson",
        progress: 0,
        target: 1,
      },
      {
        id: "streak_3",
        title: "Getting Started",
        description: "Maintain a 3-day streak",
        icon: "🔥",
        unlockedAt: null,
        xpReward: XP_CONSTANTS.ACHIEVEMENT_BASE,
        type: "streak_3",
        progress: 0,
        target: 3,
      },
      // Add more achievements as needed
    ];
  }
}
