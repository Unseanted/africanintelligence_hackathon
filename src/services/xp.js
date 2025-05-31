import { useTourLMS } from "@/contexts/TourLMSContext";

class XPService {
  constructor() {
    this.xpActions = {
      // Course Progress
      COMPLETE_LESSON: 50,
      COMPLETE_MODULE: 100,
      COMPLETE_COURSE: 500,

      // Quiz Performance
      QUIZ_ATTEMPT: 10,
      QUIZ_PASS: 50,
      QUIZ_PERFECT_SCORE: 100,

      // Community Engagement
      POST_COMMENT: 5,
      RECEIVE_COMMENT_LIKE: 2,
      GIVE_COMMENT_LIKE: 1,
      REPORT_ACCEPTED: 10,

      // Learning Activities
      WATCH_VIDEO: 20,
      DOWNLOAD_RESOURCE: 5,
      MARK_AS_COMPLETE: 10,

      // Streak Bonuses
      DAILY_STREAK: 10,
      WEEKLY_STREAK: 50,
      MONTHLY_STREAK: 200,
    };

    this.levelThresholds = [
      { level: 1, xp: 0 },
      { level: 2, xp: 100 },
      { level: 3, xp: 300 },
      { level: 4, xp: 600 },
      { level: 5, xp: 1000 },
      { level: 6, xp: 1500 },
      { level: 7, xp: 2200 },
      { level: 8, xp: 3000 },
      { level: 9, xp: 4000 },
      { level: 10, xp: 5000 },
    ];
  }

  async awardXP(userId, action, metadata = {}) {
    const { token, API_URL } = useTourLMS();
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
          points: this.xpActions[action] || 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to award XP");
      }

      const data = await response.json();
      return {
        ...data,
        level: this.calculateLevel(data.totalXP),
        nextLevelXP: this.getNextLevelXP(data.totalXP),
      };
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

      if (!response.ok) {
        throw new Error("Failed to fetch user XP");
      }

      const data = await response.json();
      return {
        ...data,
        level: this.calculateLevel(data.totalXP),
        nextLevelXP: this.getNextLevelXP(data.totalXP),
      };
    } catch (error) {
      console.error("Error fetching user XP:", error);
      throw error;
    }
  }

  calculateLevel(totalXP) {
    for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
      if (totalXP >= this.levelThresholds[i].xp) {
        return this.levelThresholds[i].level;
      }
    }
    return 1;
  }

  getNextLevelXP(currentXP) {
    const currentLevel = this.calculateLevel(currentXP);
    const nextLevel = this.levelThresholds.find(
      (threshold) => threshold.level === currentLevel + 1
    );
    return nextLevel ? nextLevel.xp - currentXP : 0;
  }

  getLevelProgress(currentXP) {
    const currentLevel = this.calculateLevel(currentXP);
    const currentLevelThreshold = this.levelThresholds.find(
      (threshold) => threshold.level === currentLevel
    );
    const nextLevelThreshold = this.levelThresholds.find(
      (threshold) => threshold.level === currentLevel + 1
    );

    if (!nextLevelThreshold) {
      return 100; // Max level reached
    }

    const xpForCurrentLevel = currentXP - currentLevelThreshold.xp;
    const xpNeededForNextLevel =
      nextLevelThreshold.xp - currentLevelThreshold.xp;
    return (xpForCurrentLevel / xpNeededForNextLevel) * 100;
  }

  async getLeaderboard(limit = 10) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/xp/leaderboard?limit=${limit}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const data = await response.json();
      return data.map((user) => ({
        ...user,
        level: this.calculateLevel(user.totalXP),
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

      if (!response.ok) {
        throw new Error("Failed to fetch recent activity");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      throw error;
    }
  }

  async getAchievements(userId) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/xp/achievements/${userId}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching achievements:", error);
      throw error;
    }
  }

  calculateStreakBonus(streakType, streakCount) {
    switch (streakType) {
      case "DAILY":
        return this.xpActions.DAILY_STREAK * streakCount;
      case "WEEKLY":
        return this.xpActions.WEEKLY_STREAK * streakCount;
      case "MONTHLY":
        return this.xpActions.MONTHLY_STREAK * streakCount;
      default:
        return 0;
    }
  }

  calculateQuizBonus(score, totalQuestions) {
    const percentage = (score / totalQuestions) * 100;
    if (percentage === 100) {
      return this.xpActions.QUIZ_PERFECT_SCORE;
    } else if (percentage >= 70) {
      return this.xpActions.QUIZ_PASS;
    }
    return this.xpActions.QUIZ_ATTEMPT;
  }
}

export const xpService = new XPService();
