let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
const student = require("../models/Student");
const user = require("../models/User");

const writeData = (res, timeRange) => {
  let section = {};
  let failsafeCounter = 0;
  while (section && failsafeCounter < 50) {
    section = student.getLeaderboard(20, timeRange);
    res.write(`data: ${JSON.stringify(section)}\n\n`);
    failsafeCounter++;
    break; // Remove this line if you want to keep trying until you get data
  }
};

const writeFriendsData = (res, userId) => {
  let section = {};
  let failsafeCounter = 0;
  while (section && failsafeCounter < 50) {
    const students = student.getFriendsLeaderboard(20, userId);
    section = students.map((student) => {
      const userData = user
        .findById(student.userId)
        .populate("user", "name avatar");
      return {
        id: student.userId,
        name: student.userData.name,
        avatar: student.userData.avatar,
        xp: student.xp.allTime,
        level: student.level, // Assuming level is calculated in the model
      };
    });
    res.write(`data: ${JSON.stringify(section)}\n\n`);
    failsafeCounter++;
    break; // Remove this line if you want to keep trying until you get data
  }
};

const writeCourseData = (res, courseId) => {
  let section = {};
  let failsafeCounter = 0;
  while (section && failsafeCounter < 50) {
    section = student.getCourseLeaderboard(20, courseId);
    res.write(`data: ${JSON.stringify(section)}\n\n`);
    failsafeCounter++;
  }
};

router.get("/leaderboard/allTime", auth, (req, res) => {
  const db = req.app.locals.db;

  // 1. Set SSE specific headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive"); // Important to keep the connection open

  // Optional: If you're using Nginx or other proxies, you might need this
  // res.setHeader('X-Accel-Buffering', 'no');
  // 3. Send events periodically
  const intervalId = setInterval(() => {
    // SSE message format: 'data: <your data>\n\n'
    // You can send JSON, plain text, etc. Just ensure it's a string.

    writeData(res, "allTime");

    // Optional: Send a custom event type
    // res.write(`event: customUpdate\n`);
    // res.write(`data: ${JSON.stringify({ specialData: 'This is a custom event' })}\n\n`);

    // Optional: Send an ID for event re-tries (client-side EventSource will use this)
    // res.write(`id: ${counter}\n`);
    // res.write(`data: ${JSON.stringify({ message: message })}\n\n`);
  }, 1000 * 60 * 1); // Send an event every 1 minute

  // 4. Handle client disconnection
  // When the client closes the connection (e.g., navigates away, closes tab)
  // `req.on('close')` will fire, allowing you to clean up resources.
  req.on("close", () => {
    console.log("Client disconnected. Clearing interval.");
    clearInterval(intervalId); // Stop sending events
    res.end(); // End the response
  });
});

router.get("/leaderboard/weekly", auth, (req, res) => {
  const db = req.app.locals.db;

  // 1. Set SSE specific headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive"); // Important to keep the connection open

  // Optional: If you're using Nginx or other proxies, you might need this
  // res.setHeader('X-Accel-Buffering', 'no');

  // 3. Send events periodically
  const intervalId = setInterval(() => {
    // SSE message format: 'data: <your data>\n\n'
    // You can send JSON, plain text, etc. Just ensure it's a string.
    writeData(res, "thisWeek");

    // Optional: Send a custom event type
    // res.write(`event: customUpdate\n`);
    // res.write(`data: ${JSON.stringify({ specialData: 'This is a custom event' })}\n\n`);

    // Optional: Send an ID for event re-tries (client-side EventSource will use this)
    // res.write(`id: ${counter}\n`);
    // res.write(`data: ${JSON.stringify({ message: message })}\n\n`);
  }, 1000 * 60 * 1); // Send an event every 1 minutes

  // 4. Handle client disconnection
  // When the client closes the connection (e.g., navigates away, closes tab)
  // `req.on('close')` will fire, allowing you to clean up resources.
  req.on("close", () => {
    console.log("Client disconnected. Clearing interval.");
    clearInterval(intervalId); // Stop sending events
    res.end(); // End the response
  });
});

router.get("/leaderboard/course", auth, (req, res) => {
  const db = req.app.locals.db;
  const courseId = req.query.courseId; // Assuming you pass course ID as a query parameter

  // 1. Set SSE specific headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive"); // Important to keep the connection open

  // Optional: If you're using Nginx or other proxies, you might need this
  // res.setHeader('X-Accel-Buffering', 'no');

  // 3. Send events periodically
  const intervalId = setInterval(() => {
    // SSE message format: 'data: <your data>\n\n'
    // You can send JSON, plain text, etc. Just ensure it's a string.

    // writeData(res, 'thisCourse');
    writeCourseData(res, courseId);

    // Optional: Send a custom event type
    // res.write(`event: customUpdate\n`);
    // res.write(`data: ${JSON.stringify({ specialData: 'This is a custom event' })}\n\n`);

    // Optional: Send an ID for event re-tries (client-side EventSource will use this)
    // res.write(`id: ${counter}\n`);
    // res.write(`data: ${JSON.stringify({ message: message })}\n\n`);
  }, 1000 * 60 * 1); // Send an event every 1 minutes

  // 4. Handle client disconnection
  // When the client closes the connection (e.g., navigates away, closes tab)
  // `req.on('close')` will fire, allowing you to clean up resources.
  req.on("close", () => {
    console.log("Client disconnected. Clearing interval.");
    clearInterval(intervalId); // Stop sending events
    res.end(); // End the response
  });
});

router.get("/leaderboard/friends", auth, (req, res) => {
  const db = req.app.locals.db;
  const userId = req.user.userId; // Assuming user ID is stored in req.user

  // 1. Set SSE specific headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive"); // Important to keep the connection open

  // Optional: If you're using Nginx or other proxies, you might need this
  // res.setHeader('X-Accel-Buffering', 'no');

  // 3. Send events periodically
  const intervalId = setInterval(() => {
    // SSE message format: 'data: <your data>\n\n'
    // You can send JSON, plain text, etc. Just ensure it's a string.

    writeFriendsData(res, userId);

    // Optional: Send a custom event type
    // res.write(`event: customUpdate\n`);
    // res.write(`data: ${JSON.stringify({ specialData: 'This is a custom event' })}\n\n`);

    // Optional: Send an ID for event re-tries (client-side EventSource will use this)
    // res.write(`id: ${counter}\n`);
    // res.write(`data: ${JSON.stringify({ message: message })}\n\n`);
  }, 1000 * 60 * 1); // Send an event every 1 minutes

  // 4. Handle client disconnection
  // When the client closes the connection (e.g., navigates away, closes tab)
  // `req.on('close')` will fire, allowing you to clean up resources.
  req.on("close", () => {
    console.log("Client disconnected. Clearing interval.");
    clearInterval(intervalId); // Stop sending events
    res.end(); // End the response
  });
});
