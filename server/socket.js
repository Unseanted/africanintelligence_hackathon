const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const { Conversation, AIChatMessage } = require("./models/AssistantConvo");
const { vapid_private_key, mistral_api_key } = require("./configs/config");
const { Mistral } = require("@mistralai/mistralai");
const Student = require("./models/Student");
const ForumPost = require("./models/Forum");
const { sendForumNotification } = require("./routes/notification");

class LLMStrategy {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateResponse(message) {
    throw new Error("Not implemented");
  }
}

class LLMContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async generateResponse(message) {
    return this.strategy.generateResponse(message);
  }
}

class MockLLM extends LLMStrategy {
  constructor(apiKey) {
    super(apiKey);
    this.model = "mock-model";
  }

  async generateResponse(message) {
    return {
      role: "assistant",
      content: "This is a mock response",
      model: this.model,
      timestamp: new Date(),
    };
  }
}

class MistralLLM extends LLMStrategy {
  constructor(apiKey) {
    super(apiKey);
    this.model = "mistral-large-latest";
    this.client = new Mistral({ apiKey: apiKey });
  }

  async generateResponse(message) {
    const response = await this.client.chat.complete({
      model: this.model,
      messages: [{ role: "user", content: message }],
    });

    return response.choices[0].message.content;
  }
}
// Rate limiting implementation using token bucket algorithm
class RateLimiter {
  constructor(tokensPerInterval, interval) {
    this.tokensPerInterval = tokensPerInterval;
    this.interval = interval;
    this.tokens = tokensPerInterval;
    this.lastRefill = Date.now();
    this.userBuckets = new Map();
  }

  refillTokens() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd =
      Math.floor(timePassed / this.interval) * this.tokensPerInterval;

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.tokensPerInterval, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }
  }

  getUserBucket(userId) {
    if (!this.userBuckets.has(userId)) {
      this.userBuckets.set(userId, {
        tokens: this.tokensPerInterval,
        lastRefill: Date.now(),
      });
    }
    return this.userBuckets.get(userId);
  }

  refillUserTokens(userId) {
    const bucket = this.getUserBucket(userId);
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd =
      Math.floor(timePassed / this.interval) * this.tokensPerInterval;

    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(
        this.tokensPerInterval,
        bucket.tokens + tokensToAdd
      );
      bucket.lastRefill = now;
    }
  }

  async consumeToken(userId) {
    this.refillUserTokens(userId);
    const bucket = this.getUserBucket(userId);

    if (bucket.tokens > 0) {
      bucket.tokens--;
      return true;
    }
    return false;
  }
}

// Initialize rate limiter (10 messages per minute)
const rateLimiter = new RateLimiter(10, 60 * 1000);

const setupSocket = (server, db) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, vapid_private_key);
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(decoded.userId) });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  console.log("Socket server is running");

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    socket.on("ai:message", async (data) => {
      const { message, context } = data;
      const { conversationId, role, timestamp } = context;

      const conversation = await db
        .collection("AIConversation")
        .findOne({ conversationId: conversationId });

      if (conversation) {
        conversation.addMessage({
          conversationId: conversation._id,
          role,
          content: message,
          tokenCount: 0,
          timestamp,
        });
      }

      socket.emit("ai:typing", true);
      const llmContext = new LLMContext(new MistralLLM(mistral_api_key));
      const response = await llmContext.generateResponse(message);
      const aiMessage = {
        conversationId: conversationId,
        role: "assistant",
        content: response,
        aiModel: llmContext.model,
        tokenCount: 0,
        timestamp: new Date(),
      };
      socket.emit("ai:response", {
        message: aiMessage,
      });
      console.log(aiMessage);
      socket.emit("ai:typing", false);

      // Store the conversation in the database
      if (conversation) {
        conversation.addMessage(aiMessage);
      }
    });

    /*socket.on("ai:message", async (data) => {
      try {
        // Check rate limit
        const canProceed = await rateLimiter.consumeToken(
          socket.user._id.toString()
        );
        if (!canProceed) {
          socket.emit("error", {
            message:
              "Rate limit exceeded. Please wait before sending more messages.",
            code: "RATE_LIMIT_EXCEEDED",
          });
          return;
        }

        // Turn on typing indicator
        socket.emit("ai:typing", true);

        
        // Extract message and context
        const { message, context = {} } = data;
        const { courseId, lessonId } = context;

        // Prepare conversation context
        let systemMessage =
          "You are an AI learning assistant for an online learning platform.";
        if (courseId) {
          const course = await db
            .collection("courses")
            .findOne({ _id: new ObjectId(courseId) });
          if (course) {
            systemMessage += ` The user is currently studying the course "${course.title}".`;
          }
        }
        if (lessonId) {
          const lesson = await db
            .collection("lessons")
            .findOne({ _id: new ObjectId(lessonId) });
          if (lesson) {
            systemMessage += ` They are specifically working on the lesson "${lesson.title}".`;
          }
        }
        

        // Call OpenAI API
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemMessage },
              { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const aiResponse = response.data.choices[0].message.content;

        // Store the conversation in the database
        await db.collection("ai_chat_messages").insertOne({
          userId: socket.user._id,
          message,
          response: aiResponse,
          context: {
            courseId: courseId ? new ObjectId(courseId) : null,
            lessonId: lessonId ? new ObjectId(lessonId) : null,
          },
          timestamp: new Date(),
        });

        // Send the response back to the client
        socket.emit("ai:response", {
          message: aiResponse,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("AI chat error:", error);

        // Handle specific OpenAI API errors
        if (error.response?.status === 429) {
          socket.emit("error", {
            message: "OpenAI API rate limit exceeded. Please try again later.",
            code: "OPENAI_RATE_LIMIT",
          });
        } else {
          socket.emit("error", {
            message: "Failed to process AI message",
            code: "AI_ERROR",
          });
        }
      } finally {
        // Turn off typing indicator
        socket.emit("ai:typing", false);
      }
    }); */

    // Handle disconnection
    socket.on("disconnect", () => {
      // Clean up subscriptions
      if (socket.leaderboardSubscription) {
        const { type, timeRange } = socket.leaderboardSubscription;
        const subscriptionKey = `${socket.id}-${type}-${timeRange}`;
        activeSubscriptions.delete(subscriptionKey);
      }
      console.log(`User disconnected: ${socket.user._id}`);
    });

    // Ping-pong handler for connection testing
    socket.on("ping", (data) => {
      socket.emit("pong");
    });

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      socket.emit("error", {
        message: "Connection error",
        code: "CONNECTION_ERROR",
      });
    });

    // --- FORUM SOCKET EVENTS ---
    // Helper: calculate forum stats
    async function getForumStats(posts) {
      const totalTopics = posts.length;
      const totalPosts = posts.reduce(
        (acc, post) => acc + (post.comments ? post.comments.length : 0),
        0
      );
      const activeUsers = new Set(posts.map((post) => post.authorId.toString()))
        .size;
      const onlineNow = 42; // Dummy value
      return { totalTopics, totalPosts, activeUsers, onlineNow };
    }

    // Helper: get users to notify for forum activity
    async function getUsersToNotify(courseId = null) {
      try {
        let users = [];

        if (courseId) {
          // Get users enrolled in the specific course
          const enrollments = await db
            .collection("enrollments")
            .find({
              courseId: new ObjectId(courseId),
            })
            .toArray();
          users = enrollments.map((enrollment) =>
            enrollment.studentId.toString()
          );
        } else {
          // Get all active users for community forum
          const allUsers = await db
            .collection("users")
            .find({
              role: { $in: ["student", "facilitator"] },
            })
            .toArray();
          users = allUsers.map((user) => user._id.toString());
        }

        return users;
      } catch (error) {
        console.error("Error getting users to notify:", error);
        return [];
      }
    }

    // forum:get_data - send all posts and stats
    socket.on("forum:get_data", async () => {
      try {
        const posts = await ForumPost.find({}).lean();
        const categories = [...new Set(posts.map((post) => post.category))];
        const stats = await getForumStats(posts);
        socket.emit("forum:data", { posts, categories, stats });
      } catch (err) {
        socket.emit("error", { message: "Failed to fetch forum data." });
      }
    });

    // forum:create_post - create a new post
    socket.on("forum:create_post", async (data) => {
      try {
        const { title, content, category } = data;
        const post = await ForumPost.create({
          title,
          content,
          category,
          authorId: socket.user._id,
          comments: [],
          likes: 0,
        });
        const postObj = post.toObject();
        io.emit("forum:new_post", postObj);

        // Send notifications to relevant users
        const usersToNotify = await getUsersToNotify();
        if (usersToNotify.length > 0) {
          await sendForumNotification(
            db,
            post._id.toString(),
            socket.user._id.toString(),
            null, // community forum
            usersToNotify,
            false // isReply
          );
        }

        // Optionally, update stats for all
        const posts = await ForumPost.find({}).lean();
        const stats = await getForumStats(posts);
        io.emit("forum:stats", stats);
      } catch (err) {
        socket.emit("error", { message: "Failed to create post." });
      }
    });

    // forum:create_comment - add a comment to a post
    socket.on("forum:create_comment", async (data) => {
      try {
        const { postId, content } = data;
        const comment = {
          authorId: socket.user._id,
          content,
          createdAt: new Date(),
        };
        const post = await ForumPost.findByIdAndUpdate(
          postId,
          { $push: { comments: comment } },
          { new: true }
        );
        if (post) {
          io.emit("forum:new_comment", { postId, comment });

          // Send notifications to relevant users
          const usersToNotify = await getUsersToNotify();
          if (usersToNotify.length > 0) {
            await sendForumNotification(
              db,
              postId,
              socket.user._id.toString(),
              null, // community forum
              usersToNotify,
              true // isReply
            );
          }

          // Optionally, update stats for all
          const posts = await ForumPost.find({}).lean();
          const stats = await getForumStats(posts);
          io.emit("forum:stats", stats);
        }
      } catch (err) {
        socket.emit("error", { message: "Failed to add comment." });
      }
    });

    // forum:toggle_like - like/unlike a post (idempotent)
    socket.on("forum:toggle_like", async (data) => {
      try {
        const { postId } = data;
        const userId = socket.user._id;
        const post = await ForumPost.findById(postId);
        if (!post) return socket.emit("error", { message: "Post not found." });
        const likedIdx = post.likedBy.findIndex(
          (id) => id.toString() === userId.toString()
        );
        if (likedIdx === -1) {
          post.likedBy.push(userId);
        } else {
          post.likedBy.splice(likedIdx, 1);
        }
        post.likes = post.likedBy.length;
        await post.save();
        io.emit("forum:post_updated", { _id: post._id, likes: post.likes });
      } catch (err) {
        socket.emit("error", { message: "Failed to toggle like." });
      }
    });
    // --- END FORUM SOCKET EVENTS ---
  });

  return io;
};

module.exports = setupSocket;
