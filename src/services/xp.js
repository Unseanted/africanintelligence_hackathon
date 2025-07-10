import { useTourLMS } from "@/contexts/TourLMSContext";

class XPService {
  constructor() {
    this.xpActions = {
      // Course Progress
      COMPLETE_LESSON: { base: 50, max: 100 },
      COMPLETE_MODULE: { base: 100, max: 200 },
      COMPLETE_COURSE: { base: 500, max: 1000 },

      // Quiz Performance
      QUIZ_ATTEMPT: { base: 10, max: 20 },
      QUIZ_PASS: { base: 50, max: 100 },
      QUIZ_PERFECT_SCORE: { base: 100, max: 200 },

      // Challenges
      CHALLENGE_ATTEMPT: { base: 20, max: 40 },
      CHALLENGE_COMPLETE: { base: 150, max: 300 },
      CHALLENGE_PERFECT: { base: 250, max: 500 },

      // Community Engagement
      POST_COMMENT: { base: 5, max: 10 },
      RECEIVE_COMMENT_LIKE: { base: 2, max: 5 },
      GIVE_COMMENT_LIKE: { base: 1, max: 2 },
      REPORT_ACCEPTED: { base: 10, max: 20 },

      // Learning Activities
      WATCH_VIDEO: { base: 20, max: 40 },
      DOWNLOAD_RESOURCE: { base: 5, max: 10 },
      MARK_AS_COMPLETE: { base: 10, max: 20 },

      // Streak Bonuses
      DAILY_STREAK: { base: 10, multiplier: 1.1 },
      WEEKLY_STREAK: { base: 50, multiplier: 1.2 },
      MONTHLY_STREAK: { base: 200, multiplier: 1.3 }
    };

    this.levelThresholds = level => Math.floor(1000 * Math.pow(1.2, level - 1));
  }

  calculateDynamicXP(action, performance = 1) {
    const actionConfig = this.xpActions[action];
    if (!actionConfig) return 0;

    if (actionConfig.multiplier) {
      // For streak bonuses that compound
      return Math.floor(actionConfig.base * Math.pow(actionConfig.multiplier, performance - 1));
    }

    // For other actions with performance-based scaling (0-1)
    return Math.floor(
      actionConfig.base + 
      (actionConfig.max - actionConfig.base) * performance
    );
  }

  async awardXP(userId, action, metadata = {}) {
    const { token, API_URL } = useTourLMS();
    
    // Calculate dynamic XP based on performance
    const points = this.calculateDynamicXP(
      action, 
      metadata.performance || 1
    );

    try {
      const response = await fetch(`${API_URL}/xp/award`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          userId,
          action,
          metadata,
          points
        }),
      });

      if (!response.ok) throw new Error("Failed to award XP");

      const data = await response.json();
      return this.enrichXPData(data);
    } catch (error) {
      console.error("Error awarding XP:", error);
      throw error;
    }
  }

  async getUserXP(userId) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/xp/${userId}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user XP");

      const data = await response.json();
      return this.enrichXPData(data);
    } catch (error) {
      console.error("Error fetching user XP:", error);
      throw error;
    }
  }

  async getLeaderboard(limit = 10) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/xp/leaderboard?limit=${limit}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const data = await response.json();
      return data.map(user => ({
        ...user,
        ...this.enrichXPData(user)
      }));
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
  }

  async getRecentActivity(userId, limit = 5) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(
        `${API_URL}/xp/activity/${userId}?limit=${limit}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch recent activity");

      const activities = await response.json();
      return activities.map(activity => ({
        ...activity,
        date: new Date(activity.timestamp),
        formattedDate: new Date(activity.timestamp).toLocaleDateString()
      }));
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw error;
    }
  }

  async getUserAchievements(userId) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/xp/achievements/${userId}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch achievements");

      const achievements = await response.json();
      return achievements.map(achievement => ({
        ...achievement,
        unlocked: new Date(achievement.unlockedAt),
        progress: achievement.progress || 0,
        isComplete: achievement.progress >= achievement.target
      }));
    } catch (error) {
      console.error("Error fetching achievements:", error);
      throw error;
    }
  }

  enrichXPData(xpData) {
    const level = this.calculateLevel(xpData.totalXP);
    const nextLevelXP = this.levelThresholds(level + 1);
    const currentLevelXP = this.levelThresholds(level);
    const progress = ((xpData.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    return {
      ...xpData,
      level,
      nextLevelXP,
      currentLevelXP,
      progress,
      remainingXP: nextLevelXP - xpData.totalXP,
      progressPercentage: Math.min(100, Math.round(progress))
    };
  }

  calculateLevel(totalXP) {
    let level = 1;
    while (totalXP >= this.levelThresholds(level + 1)) {
      level++;
    }
    return level;
  }

  calculateQuizBonus(score, totalQuestions) {
    const percentage = (score / totalQuestions) * 100;
    if (percentage === 100) {
      return {
        action: 'QUIZ_PERFECT_SCORE',
        performance: 1
      };
    } else if (percentage >= 70) {
      return {
        action: 'QUIZ_PASS',
        performance: percentage / 100
      };
    }
    return {
      action: 'QUIZ_ATTEMPT',
      performance: percentage / 70 // Normalize to 0-1 scale based on passing threshold
    };
  }

  calculateStreakBonus(streakType, streakCount) {
    const action = streakType === 'daily' ? 'DAILY_STREAK' :
                  streakType === 'weekly' ? 'WEEKLY_STREAK' :
                  'MONTHLY_STREAK';
    
    return {
      action,
      performance: streakCount
    };
  }

  async checkLevelUp(userId) {
    const currentData = await this.getUserXP(userId);
    const newLevel = this.calculateLevel(currentData.totalXP);
    
    if (newLevel > currentData.level) {
      return {
        leveledUp: true,
        newLevel,
        reward: this.calculateDynamicXP('LEVEL_UP', newLevel)
      };
    }
    
    return { leveledUp: false };
  }
}

export const xpService = new XPService();