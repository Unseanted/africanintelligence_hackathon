import { BADGES } from "@/data/badges";
import { useSocket } from "@/services/socketService";

class BadgeService {
  constructor() {
    this.socket = null;
    this.unlockedBadges = new Set();
    this.dailyLearningHours = {};
    
    // Initialize event-to-badge mapping
    this.eventBadgeMap = {
      'course:completed': [
        'course-1', 'course-5', 'course-10', 'course-25', 'course-50', 
        'speed-learner', 'subject-master', 'polyglot', 'fast-learner'
      ],
      'quiz:completed': [
        'quiz-perfect', 'quiz-master', 'quiz-streak-3', 'quiz-streak-5', 
        'quiz-streak-10', 'high-scorer', 'quiz-champion'
      ],
      'comment:liked': [
        'popular-commenter', 'community-star', 'helpful-advice'
      ],
      'discussion:started': [
        'discussion-leader', 'community-engager', 'conversation-starter'
      ],
      'solution:marked': [
        'problem-solver', 'solution-expert', 'community-helper'
      ],
      'feedback:given': [
        'quality-controller', 'feedback-giver'
      ],
      'streak:updated': [
        'streak-7', 'streak-30', 'streak-100', 'streak-365', 
        'streak-freezer', 'consistent-learner'
      ],
      'streak:freeze': [
        'streak-freezer', 'preservationist'
      ],
      'lesson:completed': [
        'night-owl', 'early-bird', 'weekend-warrior', 'mobile-learner',
        'dedicated-learner', 'marathon-learner'
      ],
      'certificate:earned': [
        'certified-learner', 'certified-expert', 'knowledge-master'
      ],
      'xp:earned': [
        'xp-100', 'xp-1000', 'xp-5000', 'xp-10000', 'xp-master'
      ],
      'rank:updated': [
        'top-weekly', 'top-monthly', 'top-yearly', 'elite-learner'
      ],
      'challenge:completed': [
        'perfect-week', 'perfect-month', 'champion-learner'
      ],
      'note:created': [
        'note-taker', 'organized-learner'
      ],
      'article:read': [
        'knowledge-seeker', 'bookworm'
      ]
    };

    this.stats = {
      // Streak stats
      currentStreak: 0,
      streakFreezesUsed: 0,

      // Course stats
      coursesCompleted: 0,
      completedSubjects: 0,
      fastCourseCompletions: 0,
      languagesLearned: [],

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

      this.checkBadgesByEvent('course:completed');
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

      this.checkBadgesByEvent('quiz:completed');
    });

    // Community events
    this.socket.on("comment:liked", (commentId) => {
      this.stats.commentLikes = (this.stats.commentLikes || 0) + 1;
      this.checkBadgesByEvent('comment:liked');
    });

    this.socket.on("discussion:started", () => {
      this.stats.discussionsStarted = (this.stats.discussionsStarted || 0) + 1;
      this.checkBadgesByEvent('discussion:started');
    });

    this.socket.on("solution:marked", () => {
      this.stats.solutionsProvided = (this.stats.solutionsProvided || 0) + 1;
      this.checkBadgesByEvent('solution:marked');
    });

    this.socket.on("feedback:given", () => {
      this.stats.feedbackProvided = (this.stats.feedbackProvided || 0) + 1;
      this.checkBadgesByEvent('feedback:given');
    });

    // Streak events
    this.socket.on("streak:updated", (streak) => {
      this.stats.currentStreak = streak || 0;
      this.checkBadgesByEvent('streak:updated');
    });

    this.socket.on("streak:freeze", () => {
      this.stats.streakFreezesUsed = (this.stats.streakFreezesUsed || 0) + 1;
      this.checkBadgesByEvent('streak:freeze');
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

      this.checkBadgesByEvent('lesson:completed');
    });

    // Note and article events
    this.socket.on("note:created", () => {
      this.stats.notesCreated = (this.stats.notesCreated || 0) + 1;
      this.checkBadgesByEvent('note:created');
    });

    this.socket.on("article:read", () => {
      this.stats.articlesRead = (this.stats.articlesRead || 0) + 1;
      this.checkBadgesByEvent('article:read');
    });

    // Certificate events
    this.socket.on("certificate:earned", (certId) => {
      this.stats.certificatesEarned = (this.stats.certificatesEarned || 0) + 1;
      this.checkBadgesByEvent('certificate:earned');
    });

    // XP events
    this.socket.on("xp:earned", (amount) => {
      this.stats.totalXp = (this.stats.totalXp || 0) + (amount || 0);
      this.checkBadgesByEvent('xp:earned');
    });

    // Rank events
    this.socket.on("rank:updated", (ranks) => {
      if (ranks.weekly) this.stats.weeklyRank = ranks.weekly;
      if (ranks.monthly) this.stats.monthlyRank = ranks.monthly;
      if (ranks.yearly) this.stats.yearlyRank = ranks.yearly;
      this.checkBadgesByEvent('rank:updated');
    });

    // Perfect week/month tracking
    this.socket.on("challenge:completed", (data) => {
      if (data.type === "daily" && data.period === "week") {
        this.stats.perfectWeeks = (this.stats.perfectWeeks || 0) + 1;
      } else if (data.type === "daily" && data.period === "month") {
        this.stats.perfectMonths = (this.stats.perfectMonths || 0) + 1;
      }
      this.checkBadgesByEvent('challenge:completed');
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

  checkBadgesByEvent(eventType) {
    const badgeIds = this.eventBadgeMap[eventType] || [];
    badgeIds.forEach(badgeId => {
      const badge = BADGES.find(b => b.id === badgeId);
      if (badge && badge.unlock(this.stats) && !this.unlockedBadges.has(badgeId)) {
        this.unlockBadge(badgeId);
      }
    });
  }

  // Keep the category-based methods for backward compatibility
  checkCourseBadges() {
    this.checkBadgesByEvent('course:completed');
  }

  checkQuizBadges() {
    this.checkBadgesByEvent('quiz:completed');
  }

  checkCommunityBadges() {
    const communityEvents = [
      'comment:liked',
      'discussion:started',
      'solution:marked',
      'feedback:given'
    ];
    communityEvents.forEach(event => this.checkBadgesByEvent(event));
  }

  checkStreakBadges() {
    this.checkBadgesByEvent('streak:updated');
    this.checkBadgesByEvent('streak:freeze');
  }

  checkXPBadges() {
    this.checkBadgesByEvent('xp:earned');
  }

  checkCertificationBadges() {
    this.checkBadgesByEvent('certificate:earned');
  }

  checkTimeBasedBadges() {
    this.checkBadgesByEvent('lesson:completed');
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