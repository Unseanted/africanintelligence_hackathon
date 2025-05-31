import { useTourLMS } from "@/contexts/TourLMSContext";

class BadgeService {
  constructor() {
    this.badges = {
      // Learning Progress Badges
      FIRST_LESSON: {
        id: "FIRST_LESSON",
        title: "First Steps",
        description: "Complete your first lesson",
        icon: "🎯",
        xpReward: 50,
        type: "PROGRESS",
      },
      COURSE_MASTER: {
        id: "COURSE_MASTER",
        title: "Course Master",
        description: "Complete an entire course",
        icon: "🎓",
        xpReward: 200,
        type: "PROGRESS",
      },
      PERFECT_SCORE: {
        id: "PERFECT_SCORE",
        title: "Perfect Score",
        description: "Get 100% on any quiz",
        icon: "💯",
        xpReward: 100,
        type: "PROGRESS",
      },

      // Streak Badges
      THREE_DAY_STREAK: {
        id: "THREE_DAY_STREAK",
        title: "Consistent Learner",
        description: "Maintain a 3-day learning streak",
        icon: "🔥",
        xpReward: 50,
        type: "STREAK",
      },
      WEEKLY_WARRIOR: {
        id: "WEEKLY_WARRIOR",
        title: "Weekly Warrior",
        description: "Maintain a 7-day learning streak",
        icon: "⚔️",
        xpReward: 100,
        type: "STREAK",
      },
      MONTHLY_MASTER: {
        id: "MONTHLY_MASTER",
        title: "Monthly Master",
        description: "Maintain a 30-day learning streak",
        icon: "👑",
        xpReward: 500,
        type: "STREAK",
      },

      // Community Badges
      SOCIAL_BUTTERFLY: {
        id: "SOCIAL_BUTTERFLY",
        title: "Social Butterfly",
        description: "Post 10 comments",
        icon: "🦋",
        xpReward: 50,
        type: "COMMUNITY",
      },
      HELPFUL_SOUL: {
        id: "HELPFUL_SOUL",
        title: "Helpful Soul",
        description: "Receive 10 likes on your comments",
        icon: "💝",
        xpReward: 100,
        type: "COMMUNITY",
      },
      DISCUSSION_LEADER: {
        id: "DISCUSSION_LEADER",
        title: "Discussion Leader",
        description: "Start 5 discussion threads",
        icon: "💬",
        xpReward: 150,
        type: "COMMUNITY",
      },

      // Special Achievement Badges
      EARLY_BIRD: {
        id: "EARLY_BIRD",
        title: "Early Bird",
        description: "Complete a lesson before 9 AM",
        icon: "🌅",
        xpReward: 30,
        type: "SPECIAL",
      },
      NIGHT_OWL: {
        id: "NIGHT_OWL",
        title: "Night Owl",
        description: "Complete a lesson after 9 PM",
        icon: "🦉",
        xpReward: 30,
        type: "SPECIAL",
      },
      SPEED_LEARNER: {
        id: "SPEED_LEARNER",
        title: "Speed Learner",
        description: "Complete 5 lessons in one day",
        icon: "⚡",
        xpReward: 200,
        type: "SPECIAL",
      },
    };
  }

  async checkAndAwardBadges(userId, action, metadata = {}) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/badges/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          userId,
          action,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check badges");
      }

      const { newBadges } = await response.json();
      return newBadges;
    } catch (error) {
      console.error("Error checking badges:", error);
      return [];
    }
  }

  async getUserBadges(userId) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/badges/${userId}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user badges");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user badges:", error);
      return [];
    }
  }

  async getBadgeProgress(userId) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/badges/progress/${userId}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch badge progress");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching badge progress:", error);
      return {};
    }
  }

  getBadgeById(badgeId) {
    return this.badges[badgeId];
  }

  getAllBadges() {
    return Object.values(this.badges);
  }

  getBadgesByType(type) {
    return Object.values(this.badges).filter((badge) => badge.type === type);
  }
}

export const badgeService = new BadgeService();
