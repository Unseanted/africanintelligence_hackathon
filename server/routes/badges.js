const express = require('express');
const router = express.Router();
const Badge = require('../models/badge');
const auth = require('../middleware/auth');
let { ObjectId } = require('mongodb');

// Get all badges
router.get('/', auth, async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.user.userId });
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single badge by ID
router.get('/:id', async (req, res) => {
  try {
    const badge = await Badge.findById(req.params.id).populate('user');
    if (!badge) return res.status(404).json({ message: 'Badge not found' });
    res.json(badge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new badge (admin only)
router.post('/', async (req, res) => {
  try {
    const badge = new Badge(req.body);
    const saved = await badge.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Award a badge to a specific user
router.post('/award/:userId', async (req, res) => {
  try {
    const badge = new Badge({
      ...req.body,
      user: req.params.userId,
    });
    const saved = await badge.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all badges for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const userBadges = await Badge.find({ user: req.params.userId });
    res.json(userBadges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a badge by ID
router.put('/:id', async (req, res) => {
  try {
    const updated = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a badge by ID
router.delete('/:id', async (req, res) => {
  try {
    await Badge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Badge deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;