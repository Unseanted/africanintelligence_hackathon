// XP Engine: Example rules for XP awards
export const XP_RULES = {
    COURSE_COMPLETE: 100,
    MODULE_COMPLETE: 20,
    QUIZ_PASS: 15,
    DAILY_LOGIN: 5,
    DISCUSSION_POST: 2,
  };
  
  export function calculateTotalXP(userActivity) {
    return (
      userActivity.courseCompletions * XP_RULES.COURSE_COMPLETE +
      userActivity.moduleCompletions * XP_RULES.MODULE_COMPLETE +
      userActivity.quizzesPassed * XP_RULES.QUIZ_PASS +
      userActivity.dailyLogins * XP_RULES.DAILY_LOGIN +
      userActivity.posts * XP_RULES.DISCUSSION_POST
    );
  }