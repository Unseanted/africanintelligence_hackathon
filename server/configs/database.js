const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

class DatabaseConnection {
  constructor() {
    this.mongooseConnection = null;
    this.mongoClient = null;
    this.isConnected = false;
    this.retryCount = 0;
  }

  async connect() {
    try {
      const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/lms";

      // Connect using Mongoose
      this.mongooseConnection = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      });

      // Connect using MongoDB native driver
      this.mongoClient = new MongoClient(mongoURI);
      await this.mongoClient.connect();

      this.isConnected = true;
      this.retryCount = 0;
      console.log("Successfully connected to MongoDB");

      // Set up connection error handlers
      this.setupErrorHandlers();

      return {
        mongoose: this.mongooseConnection,
        mongoClient: this.mongoClient,
      };
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);

      if (this.retryCount < MAX_RETRIES) {
        this.retryCount++;
        console.log(
          `Retrying connection (${this.retryCount}/${MAX_RETRIES})...`
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
        return this.connect();
      } else {
        throw new Error("Failed to connect to MongoDB after maximum retries");
      }
    }
  }

  setupErrorHandlers() {
    mongoose.connection.on("error", async (error) => {
      console.error("Mongoose connection error:", error);
      this.isConnected = false;
      await this.handleDisconnect();
    });

    mongoose.connection.on("disconnected", async () => {
      console.log("Mongoose disconnected");
      this.isConnected = false;
      await this.handleDisconnect();
    });

    process.on("SIGINT", async () => {
      await this.close();
      process.exit(0);
    });
  }

  async handleDisconnect() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Attempting to reconnect (${this.retryCount}/${MAX_RETRIES})...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      await this.connect();
    } else {
      console.error("Maximum reconnection attempts reached");
      process.exit(1);
    }
  }

  async close() {
    try {
      if (this.mongooseConnection) {
        await mongoose.connection.close();
      }
      if (this.mongoClient) {
        await this.mongoClient.close();
      }
      console.log("Database connections closed");
    } catch (error) {
      console.error("Error closing database connections:", error);
    }
  }

  isConnected() {
    return this.isConnected;
  }
}

const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
