const rateLimit = require("express-rate-limit");

const aiChatMessageLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 10, // 10 messages per day
  message:
    "You have reached your daily message limit. Please try again tomorrow.",
  skip: (req) => {
    // Skip rate limiting if user is not on free subscription
    return req.user?.subscription !== "free";
  },
  keyGenerator: (req) => {
    // Use both IP and userId to track limits per user
    return `${req.ip}-${req.user?.id}`;
  },
});

module.exports = {
  aiChatMessageLimiter,
};
