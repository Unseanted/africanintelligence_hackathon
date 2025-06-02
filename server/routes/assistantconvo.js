const express = require("express");
const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} = require("../controllers/ai-chatController");
const { auth } = require("../middleware/auth.middleware");
const { validateAIChat } = require("../middleware/validation.middleware");
const {
  createAiChatValidation,
  sendAiChatMessageValidation,
} = require("../validations/ai-chatMessageValidation");
const { aiChatMessageLimiter } = require("../middleware/rate-limit.middleware");

const router = express.Router();

router.use(auth);

/**
 * @swagger
 * /api/chat/conversations:
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
  validateAIChat(createAiChatValidation),
  createConversation
);

/**
 * @swagger
 * /api/chat/conversations:
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
 * /api/chat/conversations/{conversationId}/messages:
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
 * /api/chat/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - role
 *             properties:
 *               content:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, assistant]
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       404:
 *         description: Conversation not found
 */
router.post(
  "/conversations/:conversationId/messages",
  validateAIChat(sendAiChatMessageValidation),
  aiChatMessageLimiter,
  sendMessage
);

/**
 * @swagger
 * /api/chat/conversations/{conversationId}:
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
