const express = require("express");
const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} = require("../controllers/ai-assistantController");
const { auth } = require("../middleware/auth.middleware");
const {
  validateAIConversation,
} = require("../middleware/validation.middleware");
const {
  createAiConversationValidation,
  sendAiConversationMessageValidation,
} = require("../validations/ai-conversationMessageValidation");
const {
  aiConversationMessageLimiter,
} = require("../middleware/rate-limit.middleware");

const router = express.Router();

router.use(auth);

/**
 * @swagger
 * /api/assistant/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Chat]
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
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  "/conversations",
  validateAIConversation(createAiConversationValidation),
  createConversation
);

/**
 * @swagger
 * /api/assistant/conversations:
 *   get:
 *     summary: Get all conversations
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get("/conversations", getConversations);

/**
 * @swagger
 * /api/assistant/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *       404:
 *         description: Conversation not found
 */
router.get("/conversations/:conversationId/messages", getMessages);

/**
 * @swagger
 * /api/assistant/conversations/{conversationId}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       404:
 *         description: Conversation not found
 */
router.delete("/conversations/:conversationId", deleteConversation);

module.exports = router;
