const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "Title must be at least 3 characters long"],
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  points: {
    type: Number,
    default: 1000,
    required: true,
    min: [0, "Points cannot be negative"],
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  submissionFormat: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  duration: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

challengeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Challenge = mongoose.model("Challenge", challengeSchema);

module.exports = Challenge;
