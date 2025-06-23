
const mongoose = require('mongoose');

const moduleProgressSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  contentProgress: [{
    contentId: mongoose.Schema.Types.ObjectId,
    completed: Boolean,
    lastAccessedAt: Date
  }],
  quizAttempts: [{
    score: Number,
    answers: [mongoose.Schema.Types.Mixed],
    completedAt: Date
  }]
});

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseXp:  {
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
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Number,
    default: Date.now
  },
  completedAt: {
    type: Number
  },
  progress: {
    type: Number,
    default: 0
  },
  moduleProgress: [moduleProgressSchema],
  certificateIssued: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
});

// Composite index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
