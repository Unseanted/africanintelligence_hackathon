const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

module.exports = mongoose.model("Student", studentSchema);
