// badges.js (expanded data file)
export const BADGE_CATEGORIES = {
    STREAK: 'Streak',
    COURSE: 'Course',
    XP: 'XP',
    RANK: 'Rank',
    SPECIAL: 'Special'
  };
  
  export const BADGES = [
    // Streak Badges
    {
      id: "streak-3",
      name: "3-Day Streak",
      description: "Logged in and made progress for 3 days in a row.",
      icon: "🔥",
      category: BADGE_CATEGORIES.STREAK,
      unlock: (stats) => stats.currentStreak >= 3,
      progress: (stats) => Math.min(stats.currentStreak, 3) / 3 * 100,
      tier: 1
    },
    {
      id: "streak-7",
      name: "7-Day Streak",
      description: "Logged in and made progress for 7 days in a row.",
      icon: "🔥🔥",
      category: BADGE_CATEGORIES.STREAK,
      unlock: (stats) => stats.currentStreak >= 7,
      progress: (stats) => Math.min(stats.currentStreak, 7) / 7 * 100,
      tier: 2
    },
    {
      id: "streak-30",
      name: "Monthly Streak",
      description: "Logged in and made progress for 30 days in a row.",
      icon: "🔥🔥🔥",
      category: BADGE_CATEGORIES.STREAK,
      unlock: (stats) => stats.currentStreak >= 30,
      progress: (stats) => Math.min(stats.currentStreak, 30) / 30 * 100,
      tier: 3
    },
  
    // Course Badges
    {
      id: "course-1",
      name: "First Course",
      description: "Completed your first course.",
      icon: "📚",
      category: BADGE_CATEGORIES.COURSE,
      unlock: (stats) => stats.coursesCompleted >= 1,
      progress: (stats) => stats.coursesCompleted >= 1 ? 100 : 0,
      tier: 1
    },
    {
      id: "course-5",
      name: "Course Explorer",
      description: "Completed 5 courses.",
      icon: "🎓",
      category: BADGE_CATEGORIES.COURSE,
      unlock: (stats) => stats.coursesCompleted >= 5,
      progress: (stats) => Math.min(stats.coursesCompleted, 5) / 5 * 100,
      tier: 2
    },
    {
      id: "course-10",
      name: "Course Master",
      description: "Completed 10 courses.",
      icon: "🏫",
      category: BADGE_CATEGORIES.COURSE,
      unlock: (stats) => stats.coursesCompleted >= 10,
      progress: (stats) => Math.min(stats.coursesCompleted, 10) / 10 * 100,
      tier: 3
    },
  
    // XP Badges
    {
      id: "xp-100",
      name: "XP Starter",
      description: "Earned 100 XP.",
      icon: "✨",
      category: BADGE_CATEGORIES.XP,
      unlock: (stats) => stats.totalXp >= 100,
      progress: (stats) => Math.min(stats.totalXp, 100) / 100 * 100,
      tier: 1
    },
    {
      id: "xp-1000",
      name: "XP Master",
      description: "Earned 1,000 XP.",
      icon: "⭐",
      category: BADGE_CATEGORIES.XP,
      unlock: (stats) => stats.totalXp >= 1000,
      progress: (stats) => Math.min(stats.totalXp, 1000) / 1000 * 100,
      tier: 2
    },
    {
      id: "xp-5000",
      name: "XP Legend",
      description: "Earned 5,000 XP.",
      icon: "🌟",
      category: BADGE_CATEGORIES.XP,
      unlock: (stats) => stats.totalXp >= 5000,
      progress: (stats) => Math.min(stats.totalXp, 5000) / 5000 * 100,
      tier: 3
    },
  
    // Rank Badges
    {
      id: "weekly-top50",
      name: "Weekly Top 50",
      description: "Ranked in top 50 for the week.",
      icon: "🥉",
      category: BADGE_CATEGORIES.RANK,
      unlock: (stats) => stats.weeklyRank && stats.weeklyRank <= 50,
      progress: (stats) => stats.weeklyRank && stats.weeklyRank <= 50 ? 100 : 0,
      tier: 1
    },
    {
      id: "weekly-top10",
      name: "Weekly Top 10",
      description: "Ranked in top 10 for the week.",
      icon: "🥈",
      category: BADGE_CATEGORIES.RANK,
      unlock: (stats) => stats.weeklyRank && stats.weeklyRank <= 10,
      progress: (stats) => stats.weeklyRank && stats.weeklyRank <= 10 ? 100 : 0,
      tier: 2
    },
    {
      id: "weekly-top1",
      name: "Weekly Champion",
      description: "Ranked #1 for the week.",
      icon: "🥇",
      category: BADGE_CATEGORIES.RANK,
      unlock: (stats) => stats.weeklyRank && stats.weeklyRank === 1,
      progress: (stats) => stats.weeklyRank && stats.weeklyRank === 1 ? 100 : 0,
      tier: 3
    },
  
    // Special Badges
    {
      id: "early-adopter",
      name: "Early Adopter",
      description: "Joined the platform during beta testing.",
      icon: "🚀",
      category: BADGE_CATEGORIES.SPECIAL,
      unlock: (stats) => stats.isEarlyAdopter,
      progress: (stats) => stats.isEarlyAdopter ? 100 : 0,
      exclusive: true
    },
    {
      id: "perfect-week",
      name: "Perfect Week",
      description: "Completed all daily challenges for a week.",
      icon: "✅",
      category: BADGE_CATEGORIES.SPECIAL,
      unlock: (stats) => stats.perfectWeeks >= 1,
      progress: (stats) => stats.perfectWeeks >= 1 ? 100 : 0,
      tier: 1
    },
    {
      id: "community-contributor",
      name: "Community Contributor",
      description: "Created content shared with the community.",
      icon: "💡",
      category: BADGE_CATEGORIES.SPECIAL,
      unlock: (stats) => stats.communityContributions >= 1,
      progress: (stats) => stats.communityContributions >= 1 ? 100 : 0,
      tier: 1
    }
  ];
  
  export const getBadgeProgress = (badge, stats) => {
    if (!badge.progress) return badge.unlock(stats) ? 100 : 0;
    return badge.progress(stats);
  };