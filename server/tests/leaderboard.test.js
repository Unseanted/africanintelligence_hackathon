const { Server } = require("socket.io");
const { createServer } = require("http");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const setupSocket = require("../socket");
const { vapid_private_key } = require("../configs/config");

// Mock database
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  findOne: jest.fn(),
  find: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  countDocuments: jest.fn(),
};

// Mock Student model
const mockStudents = [
  {
    _id: new ObjectId(),
    user: {
      _id: new ObjectId(),
      name: "Test User 1",
      profilePicture: "avatar1.jpg",
    },
    xp: {
      allTime: 1000,
      thisWeek: 500,
      lastWeek: 300,
    },
    level: 5,
    friends: [],
  },
  {
    _id: new ObjectId(),
    user: {
      _id: new ObjectId(),
      name: "Test User 2",
      profilePicture: "avatar2.jpg",
    },
    xp: {
      allTime: 800,
      thisWeek: 400,
      lastWeek: 200,
    },
    level: 4,
    friends: [],
  },
];

// Mock Student model methods
mockDb.find.mockResolvedValue(mockStudents);
mockDb.countDocuments.mockResolvedValue(mockStudents.length);
mockDb.findOne.mockResolvedValue(mockStudents[0]);

// Test configuration
const TEST_CONFIG = {
  port: 3001,
  updateInterval: 1000, // 1 second for faster testing
  cacheTTL: 500, // 500ms for faster testing
  maxSubscriptions: 1000,
  pageSize: 20,
};

// Helper function to create a test token
const createTestToken = (userId) => {
  return jwt.sign({ userId: userId.toString() }, vapid_private_key);
};

// Test suite
describe("Leaderboard Feature Tests", () => {
  let httpServer;
  let io;
  let clientSocket;
  let serverSocket;

  beforeAll((done) => {
    // Create HTTP server
    httpServer = createServer();

    // Setup socket server
    io = setupSocket(httpServer, mockDb);

    // Start server
    httpServer.listen(TEST_CONFIG.port, () => {
      console.log("Test server running on port", TEST_CONFIG.port);
      done();
    });
  });

  afterAll((done) => {
    // Cleanup
    io.close();
    httpServer.close();
    done();
  });

  beforeEach((done) => {
    // Create client socket
    clientSocket = io(`http://localhost:${TEST_CONFIG.port}`, {
      auth: {
        token: createTestToken(mockStudents[0]._id),
      },
    });

    // Wait for connection
    clientSocket.on("connect", () => {
      console.log("Client connected");
      done();
    });
  });

  afterEach(() => {
    // Disconnect client
    if (clientSocket) {
      clientSocket.disconnect();
    }
  });

  // Test cases
  describe("Socket Connection and Authentication", () => {
    test("should connect with valid token", (done) => {
      clientSocket.on("connect", () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });
    });

    test("should reject connection with invalid token", (done) => {
      const invalidSocket = io(`http://localhost:${TEST_CONFIG.port}`, {
        auth: {
          token: "invalid-token",
        },
      });

      invalidSocket.on("connect_error", (error) => {
        expect(error.message).toBe("Authentication error");
        invalidSocket.disconnect();
        done();
      });
    });
  });

  describe("Leaderboard Data Fetching", () => {
    test("should fetch global leaderboard data", (done) => {
      clientSocket.emit("leaderboard:subscribe", {
        type: "global",
        timeRange: "all",
        page: 1,
      });

      clientSocket.on("leaderboard:update", (data) => {
        expect(data.type).toBe("global");
        expect(data.timeRange).toBe("all");
        expect(data.data).toHaveLength(2);
        expect(data.pagination).toBeDefined();
        done();
      });
    });

    test("should fetch weekly leaderboard data", (done) => {
      clientSocket.emit("leaderboard:subscribe", {
        type: "weekly",
        page: 1,
      });

      clientSocket.on("leaderboard:update", (data) => {
        expect(data.type).toBe("weekly");
        expect(data.data).toHaveLength(2);
        expect(data.data[0].xpChange).toBeDefined();
        done();
      });
    });

    test("should fetch friends leaderboard data", (done) => {
      clientSocket.emit("leaderboard:subscribe", {
        type: "friends",
        page: 1,
      });

      clientSocket.on("leaderboard:update", (data) => {
        expect(data.type).toBe("friends");
        expect(data.data).toBeDefined();
        done();
      });
    });
  });

  describe("Pagination", () => {
    test("should handle pagination correctly", (done) => {
      clientSocket.emit("leaderboard:subscribe", {
        type: "global",
        timeRange: "all",
        page: 1,
      });

      clientSocket.on("leaderboard:update", (data) => {
        expect(data.pagination.currentPage).toBe(1);
        expect(data.pagination.totalPages).toBe(1);
        expect(data.pagination.totalItems).toBe(2);
        done();
      });
    });
  });

  describe("Real-time Updates", () => {
    test("should receive periodic updates", (done) => {
      let updateCount = 0;

      clientSocket.emit("leaderboard:subscribe", {
        type: "global",
        timeRange: "all",
        page: 1,
      });

      clientSocket.on("leaderboard:update", (data) => {
        updateCount++;
        if (updateCount >= 2) {
          expect(updateCount).toBeGreaterThanOrEqual(2);
          done();
        }
      });
    }, 5000); // Increased timeout for real-time updates
  });

  describe("Error Handling", () => {
    test("should handle invalid leaderboard type", (done) => {
      clientSocket.emit("leaderboard:subscribe", {
        type: "invalid",
        timeRange: "all",
        page: 1,
      });

      clientSocket.on("leaderboard:error", (error) => {
        expect(error.code).toBe("INVALID_LEADERBOARD_TYPE");
        done();
      });
    });

    test("should handle database errors", (done) => {
      // Mock database error
      mockDb.find.mockRejectedValueOnce(new Error("Database error"));

      clientSocket.emit("leaderboard:subscribe", {
        type: "global",
        timeRange: "all",
        page: 1,
      });

      clientSocket.on("leaderboard:error", (error) => {
        expect(error.code).toBe("FETCH_ERROR");
        done();
      });
    });
  });

  describe("Subscription Management", () => {
    test("should handle unsubscription", (done) => {
      clientSocket.emit("leaderboard:subscribe", {
        type: "global",
        timeRange: "all",
        page: 1,
      });

      // Wait for initial data
      clientSocket.on("leaderboard:update", () => {
        // Unsubscribe
        clientSocket.emit("leaderboard:unsubscribe");

        // Verify no more updates
        let updateReceived = false;
        clientSocket.on("leaderboard:update", () => {
          updateReceived = true;
        });

        // Wait for a period where we should not receive updates
        setTimeout(() => {
          expect(updateReceived).toBe(false);
          done();
        }, 2000);
      });
    });
  });
});

// Run tests
if (require.main === module) {
  console.log("Starting Leaderboard Feature Tests...");
  console.log("====================================");

  // Add custom console output
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    originalConsoleLog(new Date().toISOString(), ...args);
  };

  // Run tests with detailed output
  process.on("unhandledRejection", (error) => {
    console.error("Unhandled Promise Rejection:", error);
  });

  // Add test summary
  afterAll(() => {
    console.log("\nTest Summary:");
    console.log("=============");
    console.log("Total Tests:", expect.getState().testCount);
    console.log(
      "Passed:",
      expect.getState().testCount - expect.getState().testFailed
    );
    console.log("Failed:", expect.getState().testFailed);
  });
}
