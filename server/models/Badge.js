const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true
  },
  category: { 
    type: String,
    required: true,
    enum: ['streak', 'course', 'xp', 'rank', 'special', 'quiz', 'achievement', 'community', 'certification'],
    default: 'achievement'
  },
  criteria: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 0
  },
  awardedAt: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['active', 'revoked', 'pending'],
    default: 'active'
  },
  expiryDate: {
    type: Number,
    required: false
  },
  // metadata: {
  //   type: Map,
  //   of: mongoose.Schema.Types.Mixed,
  //   default: {}
  // }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for faster queries
badgeSchema.index({ user_id: 1, category: 1 });
badgeSchema.index({ awardedAt: -1 });

// Virtual for checking if badge is expired
badgeSchema.virtual('isExpired').get(function () {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Method to check if badge is valid
badgeSchema.methods.isValid = function () {
  return this.status === 'active' && !this.isExpired;
};

const Badge = mongoose.model('Badges', badgeSchema);

module.exports = Badge;
