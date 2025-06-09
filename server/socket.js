const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const { Conversation, AIChatMessage } = require("./models/AssistantConvo");
const { vapid_private_key, mistral_api_key } = require("./configs/config");

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
  }

  async generateResponse(message) {
    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: this.model,
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );
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
    console.log(`User connected: ${socket.user._id }`);

    socket.on("ai:message", async (data) => {
      const {message, context} = data;
      const {conversationId, role, content, timestamp} = context;

      const conversation = await db.collection("AIConversation").findOne({conversationId: conversationId});

      if (conversation) {
        conversation.addMessage({
          conversationId: conversation._id,
          role,
          content,
          tokenCount: 0,
          timestamp,
        })
      }

      socket.emit("ai:typing", true);
      const llmContext = new LLMContext(new MockLLM(mistral_api_key));
      const response = await llmContext.generateResponse(message);
      console.log(response);
      const aiMessage = {
        conversationId: conversationId,
        role: "assistant",
        content: response.content,
        aiModel: response.model,
        tokenCount: 0,
        timestamp: response.timestamp,
      }
      socket.emit("ai:response", {
        message: response,
      });
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
      console.log(`User disconnected: ${socket.user._id}`);
    });

    // Ping-pong handler for connection testing
    socket.on("ping", (data) => {
      socket.emit("pong");
    });
  });

  return io;
};

module.exports = setupSocket;
