const { body, param } = require("express-validator");

const createAiConversationValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
];

const sendAiConversationMessageValidation = [
  param("conversationId").isMongoId().withMessage("Invalid conversation ID"),
  body("content").trim().notEmpty().withMessage("Message content is required"),
  body("role").isIn(["user", "assistant"]).withMessage("Invalid message role"),
];

module.exports = {
  createAiConversationValidation,
  sendAiConversationMessageValidation,
};
