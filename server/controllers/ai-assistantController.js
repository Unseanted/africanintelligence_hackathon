const { Request, Response } = require("express");
const {
  AIConversation,
  AIConversationMessage,
} = require("../models/AssistantConvo");
const Joi = require("joi");

const createConversationSchema = Joi.object({
  title: Joi.string().max(100).optional(),
  aiModel: Joi.string().valid("gpt-3.5-turbo", "gpt-4", "gpt-3.5-turbo", "claude-3-sonnet", "claude-3-haiku", "mistral-large-latest").optional(),
});

async function createConversation(req, res) {
  try {
    const { error, value } = createConversationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { title = "New Conversation", aiModel = "mistral-large-latest" } = value;
    const userId = req.user.userId;

    const conversation = new AIConversation({
      userId,
      title,
      aiModel,
      messages: [],
    });

    await conversation.save();

    res.status(201).json({
      success: true,
      message: "conversation created successfully",
      conversation: {
        id: conversation._id,
        title: conversation.title,
        aiModel: conversation.aiModel,
        createdAt: conversation.createdAt,
        metadata: conversation.metadata,
        isArchived: conversation.isArchived,
        messages: conversation.messages,
      },
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
    });
  }
}

async function getConversations(req, res) {
  try {
    const userId = req.user._id;

    const conversations = await AIConversation.find({ userId })
      .sort({ lastMessageAt: -1 })
      .limit(50);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching conversations" });
  }
}

async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify conversation ownership
    const conversation = await AIConversation.findOne({
      _id: conversationId,
      userId,
      isArchived: false,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await AIConversationMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
}

async function deleteConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify conversation ownership
    const conversation = await AIConversation.findOne({
      _id: conversationId,
      userId,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Delete conversation and its messages
    await Promise.all([
      AIConversation.findByIdAndDelete(conversationId),
      AIConversationMessage.deleteMany({ conversationId }),
    ]);

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting conversation" });
  }
}

module.exports = {
  createConversation,
  getConversations,
  getMessages,
  deleteConversation,
};
