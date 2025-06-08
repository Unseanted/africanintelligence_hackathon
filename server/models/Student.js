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
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
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
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000, // Limit message length to 5000 characters
    },
    aiModel: {
      type: String,
      enum: ["gpt-4", "gpt-3.5-turbo", "claude-3-sonnet", "claude-3-haiku"],
      required: function () {
        return this.role === "assistant"; // Only required for assistant messages
      },
    },
    tokenCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model("Student", studentSchema);
