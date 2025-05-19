const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

class WebSocketHandler {
  constructor(server, db) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });
    this.db = db;
    this.activeChallenges = new Map();
    this.teamScores = new Map();
    this.setupAuth();
    this.setupEventHandlers();
  }

  setupAuth() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication error"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await this.db
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
  }

  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.user._id}`);

      // Team Management
      socket.on("team:join", async ({ teamId }) => {
        try {
          const team = await this.db
            .collection("teams")
            .findOne({ _id: new ObjectId(teamId) });
          if (!team) {
            socket.emit("error", { message: "Team not found" });
            return;
          }

          // Add user to team
          await this.db
            .collection("teams")
            .updateOne(
              { _id: new ObjectId(teamId) },
              { $addToSet: { members: socket.user._id } }
            );

          socket.join(`team:${teamId}`);
          this.io.to(`team:${teamId}`).emit("team:update", {
            type: "member_joined",
            userId: socket.user._id,
            userName: socket.user.name,
          });
        } catch (error) {
          socket.emit("error", { message: "Failed to join team" });
        }
      });

      // Challenge Management
      socket.on("challenge:start", async ({ challengeId }) => {
        try {
          const challenge = await this.db
            .collection("challenges")
            .findOne({ _id: new ObjectId(challengeId) });
          if (!challenge) {
            socket.emit("error", { message: "Challenge not found" });
            return;
          }

          // Start challenge timer
          const endTime = Date.now() + challenge.duration * 60 * 1000;
          this.activeChallenges.set(challengeId, {
            endTime,
            participants: new Set([socket.user._id]),
          });

          socket.join(`challenge:${challengeId}`);
          this.io.to(`challenge:${challengeId}`).emit("challenge:update", {
            type: "started",
            endTime,
            challenge,
          });

          // Set timeout for challenge end
          setTimeout(
            () => this.endChallenge(challengeId),
            challenge.duration * 60 * 1000
          );
        } catch (error) {
          socket.emit("error", { message: "Failed to start challenge" });
        }
      });

      // Solution Submission
      socket.on("challenge:submit", async ({ challengeId, solution }) => {
        try {
          const challenge = await this.db
            .collection("challenges")
            .findOne({ _id: new ObjectId(challengeId) });
          if (!challenge) {
            socket.emit("error", { message: "Challenge not found" });
            return;
          }

          // Score the solution
          const score = await this.scoreSolution(challenge, solution);

          // Update team score
          const team = await this.db.collection("teams").findOne({
            members: socket.user._id,
          });

          if (team) {
            const currentScore = this.teamScores.get(team._id.toString()) || 0;
            this.teamScores.set(team._id.toString(), currentScore + score);

            // Update leaderboard
            this.io.emit("leaderboard:update", {
              teamId: team._id,
              teamName: team.name,
              score: currentScore + score,
            });
          }

          socket.emit("challenge:update", {
            type: "solution_submitted",
            score,
          });
        } catch (error) {
          socket.emit("error", { message: "Failed to submit solution" });
        }
      });

      // Disconnect
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user._id}`);
      });
    });
  }

  async scoreSolution(challenge, solution) {
    // Implement scoring logic based on challenge type
    // This is a placeholder implementation
    let score = 0;

    switch (challenge.type) {
      case "llm_integration":
        score = this.scoreLLMIntegration(solution);
        break;
      case "api_handling":
        score = this.scoreAPIHandling(solution);
        break;
      case "material_processing":
        score = this.scoreMaterialProcessing(solution);
        break;
      default:
        score = 0;
    }

    return score;
  }

  scoreLLMIntegration(solution) {
    // Score based on:
    // - API integration quality
    // - Error handling
    // - Rate limiting implementation
    // - Context management
    return Math.floor(Math.random() * 100); // Placeholder
  }

  scoreAPIHandling(solution) {
    // Score based on:
    // - Request handling
    // - Error management
    // - Rate limit compliance
    return Math.floor(Math.random() * 100); // Placeholder
  }

  scoreMaterialProcessing(solution) {
    // Score based on:
    // - Processing efficiency
    // - Summary quality
    // - Content organization
    return Math.floor(Math.random() * 100); // Placeholder
  }

  async endChallenge(challengeId) {
    const challenge = this.activeChallenges.get(challengeId);
    if (!challenge) return;

    // Calculate final scores and rankings
    const rankings = Array.from(this.teamScores.entries())
      .map(([teamId, score]) => ({ teamId, score }))
      .sort((a, b) => b.score - a.score);

    // Emit final results
    this.io.to(`challenge:${challengeId}`).emit("challenge:update", {
      type: "ended",
      rankings,
    });

    // Cleanup
    this.activeChallenges.delete(challengeId);
    this.teamScores.clear();
  }
}

module.exports = WebSocketHandler;
