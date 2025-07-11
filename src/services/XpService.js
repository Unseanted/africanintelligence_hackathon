// Core XP calculation logic
const XP_CONFIG = {
  baseXP: 100,
  multipliers: {
    quiz: 1.2,
    course: 1.5,
    challenge: 2.0,
    streak: 0.1 // 10% bonus per day streak
  },
  levelThreshold: level => 1000 * Math.pow(1.2, level - 1),
  badgeThresholds: {
    'Quick Learner': { xp: 500, type: 'total' },
    'Quiz Master': { completions: 10, type: 'quiz' },
    'Challenge Champion': { completions: 5, type: 'challenge' },
    'Course Completer': { completions: 3, type: 'course' }
  }
};

export const calculateXP = (activity) => {
  const { type, score, timeTaken, streakDays = 0 } = activity;
  
  // Base XP with type multiplier
  let xp = XP_CONFIG.baseXP * XP_CONFIG.multipliers[type] || 1;
  
  // Score bonus (0-100%)
  xp *= 1 + (score / 100);
  
  // Time bonus (faster completion = more bonus)
  if (timeTaken) {
    const timeBonus = Math.max(0, 1 - (timeTaken / activity.expectedTime));
    xp *= 1 + (timeBonus * 0.5); // Up to 50% bonus
  }
  
  // Streak bonus
  xp *= 1 + (streakDays * XP_CONFIG.multipliers.streak);
  
  return Math.round(xp);
};

export const checkLevelUp = (currentXP, currentLevel) => {
  const nextLevelXP = XP_CONFIG.levelThreshold(currentLevel + 1);
  return currentXP >= nextLevelXP ? currentLevel + 1 : currentLevel;
};

export const checkBadgeUnlock = (userStats, newXP) => {
  const unlockedBadges = [];
  const updatedStats = { ...userStats };
  
  // Update stats based on activity type
  if (updatedStats.lastActivity) {
    updatedStats[`${updatedStats.lastActivity.type}Completions`] += 1;
    updatedStats.totalXP += newXP;
  }
  
  // Check badge conditions
  Object.entries(XP_CONFIG.badgeThresholds).forEach(([badge, condition]) => {
    if (!userStats.badges.includes(badge)) {
      let conditionMet = false;
      
      if (condition.type === 'total' && updatedStats.totalXP >= condition.xp) {
        conditionMet = true;
      } 
      else if (condition.type === 'quiz' && 
               updatedStats.quizCompletions >= condition.completions) {
        conditionMet = true;
      }
      // Add other condition types...
      
      if (conditionMet) {
        unlockedBadges.push(badge);
        updatedStats.badges = [...updatedStats.badges, badge];
      }
    }
  });
  
  return { unlockedBadges, updatedStats };
};