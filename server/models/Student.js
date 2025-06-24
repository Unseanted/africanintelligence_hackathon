const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Enrollment = require("./Enrollment");

const studentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrollments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    xp: {
      allTime: {
        type: Number,
        default: 0,
      },
      thisWeek: {
        type: Number,
        default: 0,
      },
      thisMonth: {
        type: Number,
        default: 0,
      },
      thisYear: {
        type: Number,
        default: 0,
      },
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Number,
      default: Date.now,
    },
    lastActive: {
      type: Number,
      default: Date.now,
    },
    level: {
      type: Number,
      default: 1,
    },
    xpToNextLevel: {
      type: Number,
    },
    challenges: {
      completed: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Challenge",
        },
      ],
      inProgress: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Challenge",
        },
      ],
    },
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],
    activity: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
studentSchema.index({ user: 1 });

studentSchema.pre("save", async function (next) {
  // Calculate xpToNextLevel
  // TODO: Implement better XP calculation
  if (!this.isModified("xp")) {
    this.xpToNextLevel = this.xp.allTime + 100;
  }
  next();
});

// TODO: Update badges

studentSchema.static.getLeaderboard = async function (
  limit = 10,
  timeRange = "allTime"
) {
  const query = {};
  if (timeRange === "thisWeek") {
    query["xp.thisWeek"] = { $gt: 0 };
  } else if (timeRange === "thisMonth") {
    query["xp.thisMonth"] = { $gt: 0 };
  } else if (timeRange === "thisYear") {
    query["xp.thisYear"] = { $gt: 0 };
  } else if (timeRange !== "allTime") {
    query["xp.allTime"] = { $gt: 0 };
  }

  return this.find(query)
    .sort({ [`xp.${timeRange}`]: -1 })
    .limit(limit)
    .populate("student", "user xp level");
};

studentSchema.static.getFriendsLeaderboard = async function (
  limit = 10,
  userId
) {
  const student = await this.findOne({ user: userId }).populate("friends");
  const friends = await this.find({
    _id: { $in: student.friends.map((friend) => friend._id) },
  })
    .sort({ [`xp.${timeRange}`]: -1 })
    .limit(limit)
    .populate("student", "user xp level");
  
  return friends;
};

studentSchema.static.getCourseLeaderboard = async function (
  limit = 10,
  courseId
) {
  const enrollments = await Enrollment.find({course: courseId}, "student courseXp").sort({"courseXp.allTime": -1}.limit(limit));
  const students = enrollments.map(async (enrollment) => {const student = await this.find({_id: enrollment.student}, "user"); return {courseXp: enrollment.courseXp, user: student.user}});
  return students;
};

module.exports = mongoose.model("Student", studentSchema);
