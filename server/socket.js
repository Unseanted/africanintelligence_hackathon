const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const axios = require("axios");
const { Conversation, AIChatMessage } = require("./models/AssistantConvo");

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

// Create rate limiter: 2 requests per minute per user
const rateLimiter = new RateLimiter(2, 60000);

const setupSocket = (server, db) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust based on your frontend URL for security
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db
        .collection("users")
        .findOne(
          { _id: new ObjectId(decoded.id) },
          { projection: { _id: 1, name: 1, email: 1 } }
        );

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  console.log("web socket ready for connection");

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    // Track online users per room
    const updateRoomOnlineCount = (room) => {
      const roomSockets = io.sockets.adapter.rooms.get(room);
      const count = roomSockets ? roomSockets.size : 0;
      io.to(room).emit("room:online_count", { room, count });
    };

    // Handle joining rooms
    socket.on("join_room", (room) => {
      if (!room || typeof room !== "string") {
        socket.emit("error", { message: "Invalid room name" });
        return;
      }

      socket.join(room);
      console.log(`User ${socket.user._id} joined room: ${room}`);
      updateRoomOnlineCount(room);
    });

    // Handle forum post creation
    socket.on("forum:create_post", (post) => {
      if (!post || !post._id || !post.title) {
        socket.emit("error", { message: "Invalid post data" });
        return;
      }

      if (post.isCommunityPost) {
        io.to("forum:community").emit("forum:new_community_post", post);
      } else if (post.courseId) {
        io.to(`forum:course:${post.courseId}`).emit(
          "forum:new_course_post",
          post
        );
      }
    });

    // Handle forum comment creation
    socket.on("forum:create_comment", ({ postId, courseId, comment }) => {
      if (!postId || !comment || !comment._id || !comment.content) {
        socket.emit("error", { message: "Invalid comment data" });
        return;
      }

      if (courseId) {
        io.to(`forum:course:${courseId}`).emit("forum:new_course_comment", {
          postId,
          comment,
        });
      } else {
        io.to("forum:community").emit("forum:new_community_comment", {
          postId,
          comment,
        });
      }
    });

    // Handle toggling likes on a forum post
    socket.on("forum:toggle_like", ({ postId, courseId }) => {
      if (!postId) {
        socket.emit("error", { message: "Invalid post ID" });
        return;
      }

      if (courseId) {
        io.to(`forum:course:${courseId}`).emit("forum:course_post_updated", {
          _id: postId,
        });
      } else {
        io.to("forum:community").emit("forum:community_post_updated", {
          _id: postId,
        });
      }
    });

    // Handle AI chat messages with rate limiting
    socket.on("ai:message", async (message) => {
      try {
        if (!message || typeof message !== "string") {
          socket.emit("error", { message: "Invalid message format" });
          return;
        }

        // Check rate limit
        const canProceed = await rateLimiter.consumeToken(socket.user._id);
        if (!canProceed) {
          socket.emit("error", {
            message:
              "Rate limit exceeded. Please wait before sending more messages.",
            code: "RATE_LIMIT_EXCEEDED",
          });
          return;
        }

        // Emit typing indicator
        socket.emit("ai:typing", true);

        // Call LLM API (example using OpenAI - replace with your preferred LLM)
        /*
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4.1",
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful AI assistant for an educational platform.",
              },
              {
                role: "user",
                content: message,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(response.data);

        */
        const mockesponse = {
          data: {
            choices: [{ message: { content: "This is a mock response" } }],
          },
        };
        const aiResponse = mockesponse.data.choices[0].message.content;

        // Store the conversation in the database
        /*  
        Conversation.addMessage({role, content, tokenCount, model})

        await db.collection("AIChatMessage").insertOne({
          userId: socket.user._id,
          message,
          response: aiResponse,
          timestamp: new Date(),
        });
        */

        // Send the response back to the client
        socket.emit("ai:response", {
          message: aiResponse,
          timestamp: new Date(),
        });
        console.log("response emitted");
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
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user._id}`);
      // Update online count for all rooms the user was in
      return;
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          // Exclude the socket's own room
          // updateRoomOnlineCount(room);
        }
      });
    });
  });

  return io;
};

module.exports = setupSocket;
