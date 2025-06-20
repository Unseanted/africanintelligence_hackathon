const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const path = require("path");
const auth = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const facilitatorRoutes = require("./routes/facilitatorRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/course");
const forumRoutes = require("./routes/forum");
const notificationRoutes = require("./routes/notification");
const uploadRoutes = require("./routes/upload");
const adminServices = require("./services/adminServices");
const webpush = require("web-push");
const { clg } = require("./routes/basics");

// Configure the environment
require("dotenv").config();

// Create Express application
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Configure Web Push
if (process.env.PUBLIC_VAPID_KEY && process.env.PRIVATE_VAPID_KEY) {
  webpush.setVapidDetails(
    "mailto:test@example.com",
    process.env.PUBLIC_VAPID_KEY,
    process.env.PRIVATE_VAPID_KEY
  );
  app.set("webpush", webpush);
  console.log("Web Push configured successfully");
} else {
  console.warn("Web Push not configured. Missing VAPID keys.");
}

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/lms";
const client = new MongoClient(mongoURI);

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    // Make the database accessible to our routes
    app.locals.db = client.db();

    // Initialize API documentation
    await adminServices.initializeDefaultDocumentation(app.locals.db);

    // API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/facilitator", facilitatorRoutes);
    app.use("/api/learner", studentRoutes);
    app.use("/api/courses", courseRoutes);
    app.use("/api/forum", forumRoutes);
    app.use("/api/notifications", notificationRoutes);
    app.use("/api/upload", uploadRoutes);

    // Serve static files in production
    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "../build")));
      app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../build", "index.html"));
      });
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  try {
    await client.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
});

// Start the server
startServer().catch(console.error);
