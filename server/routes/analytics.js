const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const auth = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and insights endpoints
 */

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics summary for the authenticated user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lessonCount:
 *                   type: integer
 *                   example: 12
 *                 quizCount:
 *                   type: integer
 *                   example: 8
 *                 forumCount:
 *                   type: integer
 *                   example: 5
 *                 enrollCount:
 *                   type: integer
 *                   example: 3
 *                 loginCount:
 *                   type: integer
 *                   example: 20
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch dashboard analytics
 */
router.get("/dashboard", auth, analyticsController.getDashboard);

/**
 * @swagger
 * /analytics/recommendations:
 *   get:
 *     summary: Get personalized recommendations for the authenticated user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Complete a lesson to keep your streak!"]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch recommendations
 */
router.get("/recommendations", auth, analyticsController.getRecommendations);

/**
 * @swagger
 * /analytics/performance:
 *   get:
 *     summary: Get detailed performance analytics for the authenticated user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recent user activities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60f7c2b8e1b1c2a5d8e1b1c2"
 *                       user:
 *                         type: string
 *                         example: "60f7c2b8e1b1c2a5d8e1b1c1"
 *                       type:
 *                         type: string
 *                         example: "lesson_complete"
 *                       targetId:
 *                         type: string
 *                         example: "60f7c2b8e1b1c2a5d8e1b1c3"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-07-01T12:34:56.789Z"
 *                       metadata:
 *                         type: object
 *                         example: {"score": 85, "timeSpent": 120}
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch performance analytics
 */
router.get("/performance", auth, analyticsController.getPerformance);

module.exports = router;
