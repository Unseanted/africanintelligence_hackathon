import { useTourLMS } from "@/contexts/TourLMSContext";

class ReputationService {
  constructor() {
    this.reputationLevels = {
      NEW_USER: { min: 0, max: 10, title: "New User" },
      ACTIVE_MEMBER: { min: 11, max: 50, title: "Active Member" },
      TRUSTED_MEMBER: { min: 51, max: 100, title: "Trusted Member" },
      EXPERT: { min: 101, max: 500, title: "Expert" },
      MODERATOR: { min: 501, max: Infinity, title: "Moderator" },
    };

    this.reputationActions = {
      POST_COMMENT: 1,
      RECEIVE_LIKE: 2,
      GIVE_LIKE: 0.5,
      RECEIVE_REPORT: -5,
      REPORT_ACCEPTED: 2,
      REPORT_REJECTED: -1,
    };
  }

  async updateReputation(userId, action, metadata = {}) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/reputation/update`, {
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
        throw new Error("Failed to update reputation");
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating reputation:", error);
      throw error;
    }
  }

  async getReputationLevel(userId) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/reputation/${userId}`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reputation");
      }

      const { score } = await response.json();
      return this.calculateReputationLevel(score);
    } catch (error) {
      console.error("Error fetching reputation:", error);
      throw error;
    }
  }

  calculateReputationLevel(score) {
    for (const [level, range] of Object.entries(this.reputationLevels)) {
      if (score >= range.min && score <= range.max) {
        return {
          level,
          title: range.title,
          score,
        };
      }
    }
    return {
      level: "NEW_USER",
      title: "New User",
      score,
    };
  }

  async reportContent(contentId, contentType, reason) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/moderation/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          contentId,
          contentType,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting report:", error);
      throw error;
    }
  }

  async moderateContent(contentId, action, reason) {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/moderation/${contentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          action,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to moderate content");
      }

      return await response.json();
    } catch (error) {
      console.error("Error moderating content:", error);
      throw error;
    }
  }

  async getModerationQueue() {
    const { token, API_URL } = useTourLMS();
    try {
      const response = await fetch(`${API_URL}/moderation/queue`, {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch moderation queue");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
      throw error;
    }
  }
}

export const reputationService = new ReputationService();
