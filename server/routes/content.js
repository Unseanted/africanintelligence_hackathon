const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");
const auth = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Content management endpoints
 */

/**
 * @swagger
 * /content:
 *   get:
 *     summary: List all content items
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of content
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Content'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch content
 */
router.get("/", auth, contentController.listContent);

/**
 * @swagger
 * /content:
 *   post:
 *     summary: Create new content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [quiz, article, lesson]
 *               collaborators:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Content created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to create content
 */
router.post("/", auth, contentController.createContent);

/**
 * @swagger
 * /content/{contentId}/versions:
 *   get:
 *     summary: List all versions for a content item
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of content versions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContentVersion'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch versions
 */
router.get("/:contentId/versions", auth, contentController.listVersions);

/**
 * @swagger
 * /content/{contentId}/versions:
 *   post:
 *     summary: Submit a new version for a content item
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullContent:
 *                 type: string
 *     responses:
 *       201:
 *         description: Version created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentVersion'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to create version
 */
router.post("/:contentId/versions", auth, contentController.createVersion);

/**
 * @swagger
 * /content/{contentId}/versions/{versionId}:
 *   patch:
 *     summary: Update a version for a content item
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: versionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullContent:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending_review, approved, needs_revision, rejected]
 *     responses:
 *       200:
 *         description: Version updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentVersion'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to update version
 */
router.patch(
  "/:contentId/versions/:versionId",
  auth,
  contentController.updateVersion
);

/**
 * @swagger
 * /content/{contentId}/pull-requests:
 *   get:
 *     summary: List pull requests for a content item
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pull requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PullRequest'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch pull requests
 */
router.get("/:contentId/pull-requests", auth, contentController.listPRs);

/**
 * @swagger
 * /content/{contentId}/pull-requests:
 *   post:
 *     summary: Create a pull request for a content item
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sourceVersion:
 *                 type: string
 *               targetVersion:
 *                 type: string
 *               reviewers:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Pull request created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PullRequest'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to create pull request
 */
router.post("/:contentId/pull-requests", auth, contentController.createPR);

/**
 * @swagger
 * /pull-requests/{prId}:
 *   patch:
 *     summary: Update a pull request status
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, needs_revision, approved, merged, rejected]
 *     responses:
 *       200:
 *         description: Pull request updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PullRequest'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to update pull request
 */
router.patch("/pull-requests/:prId", auth, contentController.updatePR);

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: List notifications for the user
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch notifications
 */
router.get("/notifications", auth, contentController.listNotifications);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a notification
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to create notification
 */
router.post("/notifications", auth, contentController.createNotification);

module.exports = router;
