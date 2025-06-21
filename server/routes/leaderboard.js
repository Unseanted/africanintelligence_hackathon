let express = require("express");
let router = express.Router();
let auth = require("../middleware/auth");
const student = require("../models/Student");
const user = require("../models/User");

const writeData = (res, timeRange) => {
  const students = student.getLeaderboard(20, timeRange);

  const section = student.map((student) => {
    const userData = user
      .findById(student.user._id)
      .populate("user", "name avatar");
    return {
      id: student.user._id,
      name: userData.name,
      avatar: userData.avatar,
      xp: student[`xp.${timeRange}`],
      level: student.level, // Assuming level is calculated in the model
    };
  });
  res.write(`data: ${JSON.stringify(section)}\n\n`);
  failsafeCounter++;
};

const writeFriendsData = (res, userId) => {
  const students = student.getFriendsLeaderboard(20, userId);
  const section = students.map((student) => {
    const userData = user
      .findById(student.user._id)
      .populate("user", "name avatar");
    return {
      id: student.user._id,
      name: userData.name,
      avatar: userData.avatar,
      xp: student.xp.allTime,
      level: student.level, // Assuming level is calculated in the model
    };
  });
  res.write(`data: ${JSON.stringify(section)}\n\n`);
};

const writeCourseData = (res, courseId) => {
  const students = student.getCourseLeaderboard(20, courseId);

  const section = student.map((student) => {
    const userData = user
      .findById(student.user._id)
      .populate("user", "name avatar");
    return {
      id: student.user._id,
      name: userData.name,
      avatar: userData.avatar,
      xp: student.xp.allTime,
      level: student.level, // Assuming level is calculated in the model
    };
  });
  res.write(`data: ${JSON.stringify(section)}\n\n`);
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
