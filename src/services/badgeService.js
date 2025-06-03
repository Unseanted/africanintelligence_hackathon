import { BADGES } from "@/data/badges";
import { useSocket } from "@/services/socketService";

class BadgeService {
  constructor() {
    this.socket = null;
    this.unlockedBadges = new Set();
    this.stats = {
      // Streak stats
      currentStreak: 0,
      streakFreezesUsed: 0,

      // Course stats
      coursesCompleted: 0,
      completedSubjects: 0,
      fastCourseCompletions: 0,
      languagesLearned: 0,

      // XP and Rank stats
      totalXp: 0,
      weeklyRank: null,
      monthlyRank: null,
      yearlyRank: null,

      // Special stats
      isEarlyAdopter: false,
      perfectWeeks: 0,
      perfectMonths: 0,

      // Quiz stats
      perfectQuizzes: 0,
      highScoreQuizzes: 0,
      quizStreak: 0,

      // Community stats
      communityContributions: 0,
      commentLikes: 0,
      helpfulComments: 0,
      discussionsStarted: 0,
      solutionsProvided: 0,
      feedbackProvided: 0,

      // Learning stats
      certificatesEarned: 0,
      nightLessons: 0,
      morningLessons: 0,
      weekendLessons: 0,
      mobileLessons: 0,
      notesCreated: 0,
      articlesRead: 0,
      totalLearningHours: 0,
      maxDailyLearningHours: 0,
    };
  }

  initialize(socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    if (!this.socket) return;

    // Course completion events
    this.socket.on("course:completed", (data) => {
      this.stats.coursesCompleted = (this.stats.coursesCompleted || 0) + 1;

      // Track fast completion
      if (data.completionTime < 24) {
        this.stats.fastCourseCompletions =
          (this.stats.fastCourseCompletions || 0) + 1;
      }

      // Track language learning
      if (
        data.language &&
        !this.stats.languagesLearned.includes(data.language)
      ) {
        this.stats.languagesLearned = [
          ...(this.stats.languagesLearned || []),
          data.language,
        ];
      }

      // Track subject completion
      if (data.subject) {
        this.stats.completedSubjects = (this.stats.completedSubjects || 0) + 1;
      }

      this.checkCourseBadges();
    });

    // Quiz events
    this.socket.on("quiz:completed", (result) => {
      if (result.score === 100) {
        this.stats.perfectQuizzes = (this.stats.perfectQuizzes || 0) + 1;
        this.stats.quizStreak = (this.stats.quizStreak || 0) + 1;
      } else {
        this.stats.quizStreak = 0;
      }

      if (result.score >= 90) {
        this.stats.highScoreQuizzes = (this.stats.highScoreQuizzes || 0) + 1;
      }

      this.checkQuizBadges();
    });

    // Community events
    this.socket.on("comment:liked", (commentId) => {
      this.stats.commentLikes = (this.stats.commentLikes || 0) + 1;
      this.checkCommunityBadges();
    });

    this.socket.on("discussion:started", () => {
      this.stats.discussionsStarted = (this.stats.discussionsStarted || 0) + 1;
      this.checkCommunityBadges();
    });

    this.socket.on("solution:marked", () => {
      this.stats.solutionsProvided = (this.stats.solutionsProvided || 0) + 1;
      this.checkCommunityBadges();
    });

    this.socket.on("feedback:given", () => {
      this.stats.feedbackProvided = (this.stats.feedbackProvided || 0) + 1;
      this.checkCommunityBadges();
    });

    // Streak events
    this.socket.on("streak:updated", (streak) => {
      this.stats.currentStreak = streak || 0;
      this.checkStreakBadges();
    });

    this.socket.on("streak:freeze", () => {
      this.stats.streakFreezesUsed = (this.stats.streakFreezesUsed || 0) + 1;
      this.checkStreakBadges();
    });

    // Learning events
    this.socket.on("lesson:completed", (data) => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();

      // Track time-based lessons
      if (hour >= 22 || hour < 5) {
        this.stats.nightLessons = (this.stats.nightLessons || 0) + 1;
      } else if (hour >= 5 && hour < 8) {
        this.stats.morningLessons = (this.stats.morningLessons || 0) + 1;
      }

      // Track weekend lessons
      if (day === 0 || day === 6) {
        this.stats.weekendLessons = (this.stats.weekendLessons || 0) + 1;
      }

      // Track mobile lessons
      if (data.deviceType === "mobile") {
        this.stats.mobileLessons = (this.stats.mobileLessons || 0) + 1;
      }

      // Track learning hours
      const lessonHours = data.duration / 3600; // Convert seconds to hours
      this.stats.totalLearningHours =
        (this.stats.totalLearningHours || 0) + lessonHours;

      // Update max daily learning hours
      const today = new Date().toDateString();
      const dailyHours = (this.dailyLearningHours[today] || 0) + lessonHours;
      this.dailyLearningHours[today] = dailyHours;
      this.stats.maxDailyLearningHours = Math.max(
        this.stats.maxDailyLearningHours || 0,
        dailyHours
      );

      this.checkTimeBasedBadges();
    });

    // Note and article events
    this.socket.on("note:created", () => {
      this.stats.notesCreated = (this.stats.notesCreated || 0) + 1;
    });

    this.socket.on("article:read", () => {
      this.stats.articlesRead = (this.stats.articlesRead || 0) + 1;
    });

    // Certificate events
    this.socket.on("certificate:earned", (certId) => {
      this.stats.certificatesEarned = (this.stats.certificatesEarned || 0) + 1;
      this.checkCertificationBadges();
    });

    // XP events
    this.socket.on("xp:earned", (amount) => {
      this.stats.totalXp = (this.stats.totalXp || 0) + (amount || 0);
      this.checkXPBadges();
    });

    // Rank events
    this.socket.on("rank:updated", (ranks) => {
      if (ranks.weekly) this.stats.weeklyRank = ranks.weekly;
      if (ranks.monthly) this.stats.monthlyRank = ranks.monthly;
      if (ranks.yearly) this.stats.yearlyRank = ranks.yearly;
      this.checkRankBadges();
    });

    // Perfect week/month tracking
    this.socket.on("challenge:completed", (data) => {
      if (data.type === "daily" && data.period === "week") {
        this.stats.perfectWeeks = (this.stats.perfectWeeks || 0) + 1;
      } else if (data.type === "daily" && data.period === "month") {
        this.stats.perfectMonths = (this.stats.perfectMonths || 0) + 1;
      }
    });
  }

  updateStats(newStats) {
    // Ensure all stats are numbers and have default values
    this.stats = {
      ...this.stats,
      ...Object.entries(newStats).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]:
            typeof value === "number"
              ? value
              : Array.isArray(value)
              ? value
              : typeof value === "boolean"
              ? value
              : value === null
              ? 0
              : 0,
        }),
        {}
      ),
    };
    this.checkAllBadges();
  }

  checkAllBadges() {
    BADGES.forEach((badge) => {
      if (badge.unlock(this.stats) && !this.unlockedBadges.has(badge.id)) {
        this.unlockBadge(badge.id);
      }
    });
  }

  checkCourseBadges() {
    const courseBadges = BADGES.filter((badge) => badge.category === "Course");
    courseBadges.forEach((badge) => {
      if (badge.unlock(this.stats) && !this.unlockedBadges.has(badge.id)) {
        this.unlockBadge(badge.id);
      }
    });
  }

  checkQuizBadges() {
    const quizBadges = BADGES.filter((badge) => badge.category === "Quiz");
    quizBadges.forEach((badge) => {
      if (badge.unlock(this.stats) && !this.unlockedBadges.has(badge.id)) {
        this.unlockBadge(badge.id);
      }
    });
  }

  checkCommunityBadges() {
    const communityBadges = BADGES.filter(
      (badge) => badge.category === "Community"
    );
    communityBadges.forEach((badge) => {
      if (badge.unlock(this.stats) && !this.unlockedBadges.has(badge.id)) {
        this.unlockBadge(badge.id);
      }
    });
  }

  checkStreakBadges() {
    const streakBadges = BADGES.filter((badge) => badge.category === "Streak");
    streakBadges.forEach((badge) => {
      if (badge.unlock(this.stats) && !this.unlockedBadges.has(badge.id)) {
        this.unlockBadge(badge.id);
      }
    });
  }

  checkXPBadges() {
    const xpBadges = BADGES.filter((badge) => badge.category === "XP");
    xpBadges.forEach((badge) => {
      if (badge.unlock(this.stats) && !this.unlockedBadges.has(badge.id)) {
        this.unlockBadge(badge.id);
      }
    });
  }

  checkCertificationBadges() {
    const certBadges = BADGES.filter(
      (badge) => badge.category === "Certification"
    );
    certBadges.forEach((badge) => {
      if (badge.unlock(this.stats) && !this.unlockedBadges.has(badge.id)) {
        this.unlockBadge(badge.id);
      }
    });
  }

  checkTimeBasedBadges() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 22 || hour < 5) {
      this.stats.nightLessons = (this.stats.nightLessons || 0) + 1;
    } else if (hour >= 5 && hour < 8) {
      this.stats.morningLessons = (this.stats.morningLessons || 0) + 1;
    }

    const timeBadges = BADGES.filter(
      (badge) => badge.id === "night-owl" || badge.id === "early-bird"
    );
    timeBadges.forEach((badge) => {
      if (badge.unlock(this.stats) && !this.unlockedBadges.has(badge.id)) {
        this.unlockBadge(badge.id);
      }
    });
  }

  unlockBadge(badgeId) {
    if (this.unlockedBadges.has(badgeId)) return;

    this.unlockedBadges.add(badgeId);
    if (this.socket) {
      this.socket.emit("badge:unlocked", badgeId);
    }
  }

  getUnlockedBadges() {
    return Array.from(this.unlockedBadges);
  }

  isBadgeUnlocked(badgeId) {
    return this.unlockedBadges.has(badgeId);
  }

  getStats() {
    return { ...this.stats };
  }
}

export const badgeService = new BadgeService();
