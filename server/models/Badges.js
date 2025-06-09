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
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Badges = mongoose.model('Badges', badgeSchema);

module.exports = Badges;
