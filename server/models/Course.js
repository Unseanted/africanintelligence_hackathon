const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "document"],
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
});

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  options: [
    {
      text: {
        type: String,
        required: true,
        trim: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
    },
  ],
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  questions: [questionSchema],
});

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  content: [contentSchema],
  quiz: quizSchema,
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "Title must be at least 3 characters long"],
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, "Short description cannot exceed 200 characters"],
  },
  fullDescription: {
    type: String,
    default: "",
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
    required: true,
  },
  duration: {
    type: String,
    default: "",
  },
  prerequisites: {
    type: String,
    default: "",
    trim: true,
  },
  learningOutcomes: {
    type: String,
    default: "",
    trim: true,
  },
  thumbnail: {
    type: String,
    default: "photo-1563237739-e42da07697ce",
  },
  facilitator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  forum: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Forum",
  },
  enrollments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
    },
  ],
  announcements: [
    {
      type: String,
      trim: true,
    },
  ],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        required: true,
        trim: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  modules: [moduleSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

courseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

courseSchema.methods.getEnrollmentCount = async function () {
  return this.enrollments.length;
};

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
