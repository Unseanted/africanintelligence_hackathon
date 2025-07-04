const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const eventSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  deadline: {
    type: Date,
    required: true,
    default: Date.now,
  },
  guidelines: {
    type: String,
    required: true,
    trim: true,
  },
  media: [
    {
      type: String,
      trim: true,
    },
  ],
  location: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  mentorship: [
    {
      type: String,
      trim: true,
    },
  ],
  prizes: [
    {
      type: String,
      trim: true,
    },
  ],
  duration: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming",
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  teams: [teamSchema],
}, {timestamps: true});

eventSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Event = mongoose.model("Event", eventSchema);
const Team = mongoose.model("Team", teamSchema);

module.exports = {Event, Team};
