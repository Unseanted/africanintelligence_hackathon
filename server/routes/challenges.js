const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const Challenge = require("../models/Challenges");

/**
 * @swagger
 * components:
 *   schemas:
 *     Challenge:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - points
 *         - difficulty
 *         - category
 *         - submissionFormat
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the challenge
 *         title:
 *           type: string
 *           description: The title of the challenge
 *         description:
 *           type: string
 *           description: The description of the challenge
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *             description: Array of user IDs participating in the challenge
 *         points:
 *           type: number
 *           description: Points awarded for completing the challenge
 *           default: 1000
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: The difficulty level of the challenge
 *         category:
 *           type: string
 *           description: The category of the challenge
 *         submissionFormat:
 *           type: string
 *           description: The required format for challenge submissions
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: draft
 *           description: The current status of the challenge
 *         duration:
 *           type: string
 *           description: The duration of the challenge
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the challenge was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the challenge was last updated
 */

/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: Get all challenges
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of challenges
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Challenge'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  auth,
  roleAuth(["student", "facilitator"]),
  async (req, res) => {
    try {
      const { difficulty, status } = req.query;
      const query = {};

      if (difficulty) query.difficulty = difficulty;
      if (status) query.status = status;

      const challenges = await Challenge.find(query)
        .populate("participants", "name email")
        .sort({ createdAt: -1 });

      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /challenges/{id}:
 *   get:
 *     summary: Get a challenge by ID
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Challenge details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 *       404:
 *         description: Challenge not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/:id",
  auth,
  roleAuth(["student", "facilitator"]),
  async (req, res) => {
    try {
      const challenge = await Challenge.findById(req.params.id).populate(
        "participants",
        "name email"
      );

      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      res.json(challenge);
    } catch (error) {
      console.error("Error fetching challenge:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * @swagger
 * /challenges:
 *   post:
 *     summary: Create a new challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - points
 *               - difficulty
 *               - category
 *               - submissionFormat
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the challenge
 *               description:
 *                 type: string
 *                 description: The description of the challenge
 *               points:
 *                 type: number
 *                 description: Points awarded for completing the challenge
 *                 default: 1000
 *               difficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 description: The difficulty level of the challenge
 *               category:
 *                 type: string
 *                 description: The category of the challenge
 *               submissionFormat:
 *                 type: string
 *                 description: The required format for challenge submissions
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 default: draft
 *                 description: The current status of the challenge
 *               duration:
 *                 type: string
 *                 description: The duration of the challenge
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", auth, roleAuth(["facilitator"]), async (req, res) => {
  try {
    // Remove participants and _id from request body
    const { participants, _id, ...challengeData } = req.body;

    const challenge = new Challenge(challengeData);
    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    console.error("Error creating challenge:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /challenges/{id}:
 *   put:
 *     summary: Update a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Challenge ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              title:
 *                type: string
 *                description: The title of the challenge
 *              description:
 *                type: string
 *                description: The description of the challenge
 *     responses:
 *       200:
 *         description: Challenge updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Challenge'
 *       404:
 *         description: Challenge not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/:id", auth, roleAuth(["facilitator"]), async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.json(challenge);
  } catch (error) {
    console.error("Error updating challenge:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /challenges/{id}:
 *   delete:
 *     summary: Delete a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Challenge deleted successfully
 *       404:
 *         description: Challenge not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id", auth, roleAuth(["facilitator"]), async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.json({ message: "Challenge deleted successfully" });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @swagger
 * /challenges/{id}/participate:
 *   post:
 *     summary: Participate in a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Successfully participated in challenge
 *       404:
 *         description: Challenge not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/:id/participate",
  auth,
  roleAuth(["student"]),
  async (req, res) => {
    try {
      const challenge = await Challenge.findById(req.params.id);

      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      if (challenge.participants.includes(req.user.userId)) {
        return res
          .status(400)
          .json({ message: "Already participating in this challenge" });
      }

      challenge.participants.push(req.user.userId);
      await challenge.save();

      res.json({ message: "Successfully participated in challenge" });
    } catch (error) {
      console.error("Error participating in challenge:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
