const Activity = require("../models/Activity");
const Student = require("../models/Student");

// Dashboard: summary stats
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [lessonCount, quizCount, forumCount, enrollCount, loginCount] =
      await Promise.all([
        Activity.countDocuments({ user: userId, type: "lesson_complete" }),
        Activity.countDocuments({ user: userId, type: "quiz_attempt" }),
        Activity.countDocuments({ user: userId, type: "forum_post" }),
        Activity.countDocuments({ user: userId, type: "course_enroll" }),
        Activity.countDocuments({ user: userId, type: "daily_login" }),
      ]);
    res.json({ lessonCount, quizCount, forumCount, enrollCount, loginCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard analytics" });
  }
};

// Recommendations: rule-based
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    // Example: recommend if user hasn't completed a lesson in 7 days
    const lastLesson = await Activity.findOne({
      user: userId,
      type: "lesson_complete",
    }).sort({ timestamp: -1 });
    const now = new Date();
    let recommendations = [];
    if (!lastLesson || now - lastLesson.timestamp > 7 * 24 * 60 * 60 * 1000) {
      recommendations.push("Complete a lesson to keep your streak!");
    }
    // Add more rules as needed
    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
};

// Performance: detailed logs
exports.getPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const activities = await Activity.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch performance analytics" });
  }
};
