const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "AIConversation",
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000, // Limit message length to 5000 characters
    },
    aiModel: {
      type: String,
      enum: ["gpt-4", "gpt-3.5-turbo", "claude-3-sonnet", "claude-3-haiku"],
      required: function () {
        return this.role === "assistant"; // Only required for assistant messages
      },
    },
    tokenCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: 1 });

const aiConversationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: "New Conversation",
    },
    messages: [messageSchema],
    aiModel: {
      type: String,
      enum: ["gpt-4", "gpt-3.5-turbo", "claude-3-sonnet", "claude-3-haiku"],
      default: "gpt-3.5-turbo",
    },
    metadata: {
      totalTokens: {
        type: Number,
        default: 0, // Total tokens used in the conversation
      },
      messageCount: {
        type: Number,
        default: 0,
      },
      lastActivity: {
        type: Number,
        default: Date.now,
      },
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Number,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update metadata before saving
aiConversationSchema.pre("save", function (next) {
  this.metadata.messageCount = Math.floor(this.messages.length / 2); // Counting only assistant messages
  this.metadata.totalTokens = this.messages.reduce(
    (sum, msg) => sum + (msg.tokenCount || 0),
    0
  );
  this.metadata.lastActivity = new Date().getTime();

  // Auto-generate title from first user message if still default
  if (this.title === "New Conversation" && this.messages.length > 0) {
    const firstUserMessage = this.messages.find((msg) => msg.role === "user");
    if (firstUserMessage) {
      this.title =
        firstUserMessage.content.slice(0, 50) +
        (firstUserMessage.content.length > 50 ? "..." : "");
    }
  }

  next();
});

// Index for faster queries
aiConversationSchema.index({ userId: 1, lastMessageAt: -1 });
aiConversationSchema.index({ userId: 1, "metadata.lastActivity": -1 });

// Virtual for formatted last activity
aiConversationSchema.virtual("formattedLastActivity").get(function () {
  const now = new Date().getTime();
  const lastActivity = this.metadata.lastActivity;
  const diffInMinutes = Math.floor((now - lastActivity) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return new Date(lastActivity).toLocaleDateString();
});

// Method to add a message
aiConversationSchema.methods.addMessage = function (
  conversationId,
  role,
  content,
  aiModel = null,
  tokenCount = 0,
  timestamp = new Date().getTime()
) {
  this.messages.push({
    conversationId,
    role,
    content,
    aiModel,
    tokenCount,
    timestamp,
  });

  return this.save();
};

// Method to get recent conversations for a user
aiConversationSchema.statics.getRecentConversations = function (
  userId,
  limit = 20
) {
  return this.find({
    userId,
    isArchived: false,
  })
    .sort({ "metadata.lastActivity": -1 })
    .limit(limit)
    .select("title metadata createdAt updatedAt")
    .lean();
};

// Method to search chats
aiConversationSchema.statics.searchConversations = function (
  userId,
  query,
  limit = 10
) {
  return this.find({
    userId,
    isArchived: false,
    $or: [
      { title: { $regex: query, $options: "i" } },
      { "messages.content": { $regex: query, $options: "i" } },
    ],
  })
    .sort({ "metadata.lastActivity": -1 })
    .limit(limit)
    .select("title metadata createdAt updatedAt")
    .lean();
};

const AIConversation = mongoose.model("AIConversation", aiConversationSchema);
const AIConversationMessage = mongoose.model(
  "AIConversationMessage",
  messageSchema
);

module.exports = {
  AIConversation,
  AIConversationMessage,
};
