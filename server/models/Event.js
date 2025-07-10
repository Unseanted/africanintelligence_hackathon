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

const eventSchema = new mongoose.Schema(
  {
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
        title: {
          type: String,
          required: true,
          trim: true,
        },
        category: {
          type: String,
          required: true,
          enum: [
            "cash",
            "experience",
            "recognition",
            "resources",
            "opportunity",
            "other",
          ],
          default: "other",
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        eligibility: {
          type: String,
          trim: true,
          default: "Open to all participants",
        },
        rank: {
          type: Number,
          min: 1,
          default: 1,
        },
      },
    ],
    duration: {
      type: String,
      default: "",
    },
    capacity: {
      type: Number,
      min: [1, "Capacity must be at least 1"],
      default: null, // null means unlimited capacity
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
  },
  { timestamps: true }
);

// Method to update event status based on current time
eventSchema.methods.updateStatus = function () {
  const now = new Date();
  const eventDate = new Date(this.date);

  // Calculate end date based on duration (if duration is provided)
  let endDate = eventDate;
  if (this.duration) {
    // Parse duration string (e.g., "2 hours", "1 day", "30 minutes")
    const durationMatch = this.duration.match(
      /(\d+)\s*(hour|day|minute|week)s?/i
    );
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();

      switch (unit) {
        case "minute":
          endDate = new Date(eventDate.getTime() + value * 60 * 1000);
          break;
        case "hour":
          endDate = new Date(eventDate.getTime() + value * 60 * 60 * 1000);
          break;
        case "day":
          endDate = new Date(eventDate.getTime() + value * 24 * 60 * 60 * 1000);
          break;
        case "week":
          endDate = new Date(
            eventDate.getTime() + value * 7 * 24 * 60 * 60 * 1000
          );
          break;
      }
    }
  } else {
    // Default to 2 hours if no duration specified
    endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
  }

  if (now < eventDate) {
    this.status = "upcoming";
  } else if (now >= eventDate && now <= endDate) {
    this.status = "ongoing";
  } else {
    this.status = "completed";
  }

  return this.status;
};

// Method to check if registration is still open
eventSchema.methods.isRegistrationOpen = function () {
  const now = new Date();
  const deadline = new Date(this.deadline);
  return now <= deadline;
};

// Method to check if event has capacity
eventSchema.methods.hasCapacity = function () {
  if (!this.capacity) return true; // Unlimited capacity
  return this.participants.length < this.capacity;
};

// Method to get remaining capacity
eventSchema.methods.getRemainingCapacity = function () {
  if (!this.capacity) return null; // Unlimited
  return Math.max(0, this.capacity - this.participants.length);
};

// Pre-save middleware to update status before saving
eventSchema.pre("save", function (next) {
  this.updateStatus();
  this.updatedAt = Date.now();
  next();
});

// Static method to update status for all events
eventSchema.statics.updateAllEventStatuses = async function () {
  const events = await this.find({});
  for (const event of events) {
    const oldStatus = event.status;
    event.updateStatus();
    if (oldStatus !== event.status) {
      await event.save();
    }
  }
};

const Event = mongoose.model("Event", eventSchema);
const Team = mongoose.model("Team", teamSchema);

module.exports = { Event, Team };
