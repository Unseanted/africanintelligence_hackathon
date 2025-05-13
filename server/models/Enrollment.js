
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
  learner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
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
enrollmentSchema.index({ learner: 1, course: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;
