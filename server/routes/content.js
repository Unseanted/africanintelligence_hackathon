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
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [quiz, article, lesson]
 *         description: Filter by content type
 *       - in: query
 *         name: visible
 *         schema:
 *           type: boolean
 *         description: Filter by visibility
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
 *               visible:
 *                 type: boolean
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
 * /content/{contentId}:
 *   get:
 *     summary: Get content item by id
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
 *         description: Content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 *       500:
 *         description: Failed to fetch content
 */
router.get("/:contentId", auth, contentController.getContentById);

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
 * /content/{contentId}/collaborators:
 *   get:
 *     summary: List all collaborators for a content item
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
 *         description: List of content collaborators
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 *       500:
 *         description: Failed to fetch collaborators
 */
router.get(
  "/:contentId/collaborators",
  auth,
  contentController.getCollaborators
);

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
 *               message:
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
 *       404:
 *         description: Content not found
 *       500:
 *         description: Failed to create version
 */
router.post("/:contentId/versions", auth, contentController.createVersion);

/**
 * @swagger
 * /content/{contentId}/visibility:
 *   put:
 *     summary: Update content visibility
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
 *               visible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Visibility changed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 *       500:
 *         description: Failed to update content
 */
router.put(
  "/:contentId/visibility",
  auth,
  contentController.setContentVisibility
);

/**
 * @swagger
 * /content/{contentId}/collaborators:
 *   put:
 *     summary: Add collaborators
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
 *               collaborators:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Collaborators added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 *       500:
 *         description: Failed to add collaborators
 */
router.put(
  "/:contentId/collaborators",
  auth,
  contentController.addCollaborators
);

/**
 * @swagger
 * /content/{contentId}/revert:
 *   put:
 *     summary: Revert content version
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
 *               versionNumber:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Content version reverted
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content or version not found
 *       500:
 *         description: Failed to revert version
 */
router.put("/:contentId/revert", auth, contentController.revertVersion);

module.exports = router;
