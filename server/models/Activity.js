const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "lesson_complete",
      "quiz_attempt",
      "forum_post",
      "course_enroll",
      "daily_login",
    ],
    required: true,
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: false, // e.g., lesson, quiz, forum post, course
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: Schema.Types.Mixed, // e.g., {score: 85, timeSpent: 120}
    default: {},
  },
});

module.exports = mongoose.model("Activity", activitySchema);
