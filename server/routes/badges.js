const express = require('express');
const router = express.Router();
const Badge = require('../models/Badges');
const auth = require('../middleware/auth');
const { ObjectId } = require('mongodb');

/**
 * @swagger
 * /badges:
 *   get:
 *     summary: Get all badges for the authenticated user
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of badges
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Badge'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', auth, async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.user.userId });
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /badges/{id}:
 *   get:
 *     summary: Get a single badge by ID
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Badge ID
 *     responses:
 *       200:
 *         description: Badge details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Badge'
 *       404:
 *         description: Badge not found
 *       500:
 *         description: Server error
 */
router.get('/:id', auth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid badge ID format' });
    }
    const badge = await Badge.findById(req.params.id).populate('user');
    if (!badge) return res.status(404).json({ message: 'Badge not found' });
    res.json(badge);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /badges:
 *   post:
 *     summary: Create a new badge (admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Badge'
 *     responses:
 *       201:
 *         description: Badge created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can create badges' });
    }

    // Validate required fields
    const { name, description, criteria, imageUrl } = req.body;
    if (!name || !description || !criteria) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const badge = new Badge(req.body);
    const saved = await badge.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /badges/award/{userId}:
 *   post:
 *     summary: Award a badge to a specific user (admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to award badge to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Badge'
 *     responses:
 *       201:
 *         description: Badge awarded successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.post('/award/:userId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can award badges' });
    }

    if (!ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const badge = new Badge({
      ...req.body,
      user: req.params.userId,
      awardedBy: req.user.userId,
      awardedAt: new Date()
    });
    const saved = await badge.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /badges/user/{userId}:
 *   get:
 *     summary: Get all badges for a specific user
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of user's badges
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Badge'
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Server error
 */
router.get('/user/:userId', auth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    const userBadges = await Badge.find({ user: req.params.userId });
    res.json(userBadges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /badges/category/{category}:
 *   get:
 *     summary: Get badges by category
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [achievement, participation, excellence, milestone, special]
 *         description: Badge category
 *     responses:
 *       200:
 *         description: List of badges in category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Badge'
 *       500:
 *         description: Server error
 */
router.get('/category/:category', auth, async (req, res) => {
  try {
    const badges = await Badge.find({ category: req.params.category });
    res.json(badges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /badges/check/{badgeId}:
 *   get:
 *     summary: Check if user has earned a specific badge
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: badgeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Badge ID to check
 *     responses:
 *       200:
 *         description: Badge status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasBadge:
 *                   type: boolean
 *       400:
 *         description: Invalid badge ID
 *       500:
 *         description: Server error
 */
router.get('/check/:badgeId', auth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.badgeId)) {
      return res.status(400).json({ message: 'Invalid badge ID format' });
    }
    const badge = await Badge.findOne({
      _id: req.params.badgeId,
      user: req.user.userId
    });
    res.json({ hasBadge: !!badge });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /badges/leaderboard:
 *   get:
 *     summary: Get badge leaderboard (top 10 users)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leaderboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   count:
 *                     type: number
 *       500:
 *         description: Server error
 */
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const leaderboard = await Badge.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' }
    ]);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /badges/{id}:
 *   put:
 *     summary: Update a badge (admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Badge ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Badge'
 *     responses:
 *       200:
 *         description: Badge updated successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Badge not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can update badges' });
    }

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid badge ID format' });
    }

    const updated = await Badge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /badges/{id}:
 *   delete:
 *     summary: Delete a badge (admin only)
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Badge ID
 *     responses:
 *       200:
 *         description: Badge deleted successfully
 *       400:
 *         description: Invalid badge ID
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Badge not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Only admins can delete badges' });
    }

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid badge ID format' });
    }

    const deleted = await Badge.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Badge not found' });
    }
    res.json({ message: 'Badge deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;