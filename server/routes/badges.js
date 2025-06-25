const express = require("express");
const router = express.Router();
const Badge = require("../models/Badge");
const Student = require("../models/Student");
const User = require("../models/User");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { ObjectId } = require("mongodb");

/**
 * @swagger
 * components:
 *   schemas:
 *     Badge:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - imageUrl
 *         - category
 *         - criteria
 *         - user_id
 *         - awardedBy
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the badge
 *         description:
 *           type: string
 *           description: Description of the badge
 *         imageUrl:
 *           type: string
 *           description: URL of the badge image
 *         category:
 *           type: string
 *           enum: [achievement, participation, excellence, milestone, special]
 *           description: Category of the badge
 *         criteria:
 *           type: string
 *           description: Criteria for earning the badge
 *         points:
 *           type: number
 *           description: Points awarded with this badge
 *         user_id:
 *           type: string
 *           description: ID of the user who earned the badge    
 *         status:
 *           type: string
 *           enum: [active, revoked, pending]
 *           description: Current status of the badge
 *         expiryDate:
 *           type: string
 *           format: date-time
 *           description: Expiration date of the badge (optional)
 */

/**
 * @swagger
 * /badges:
 *   get:
 *     summary: Get all badges
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
router.get("/", auth, async (req, res) => {
  try {
    const query = req.query.category
    const badges = await Badge.find({query});
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
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
router.get("/:id", auth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid badge ID format" });
    }
    const badge = await Badge.findById(req.params.id);
    if (!badge) return res.status(404).json({ message: "Badge not found" });
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
router.post("/", auth, roleAuth(["admin"]), async (req, res) => {
  try {

    // Validate required fields
    const { title, description, criteria, expiryDate } = req.body;
    if (!title || !description || !criteria) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const badge = await Badge.create({...req.body, expiryDate: new Date(expiryDate).getTime()});

    res.status(201).json(badge);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /badges/{badgeId}/check:
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
router.get("/:badgeId/check", auth, roleAuth(["student"]), async (req, res) => {
  try {
    const badge = await Badge.findOne({
      _id: req.params.badgeId,
    });
    const student = await Student.findOne({
      user: req.user.userId,});
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.badges.includes(req.params.badgeId)) {
      return res.status(200).json({ hasBadge: true });
    }
    return res.status(200).json({ hasBadge: false });
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
router.put("/:id", auth, roleAuth(["admin"]), async (req, res) => {
  try {

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid badge ID format" });
    }

    const updated = await Badge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Badge not found" });
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
router.delete("/:id", auth, roleAuth(["admin"]), async (req, res) => {
  try {

    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid badge ID format" });
    }

    const deleted = await Badge.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Badge not found" });
    }
    res.json({ message: "Badge deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
