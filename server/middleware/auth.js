const jwt = require("jsonwebtoken");
// const { ocn } = require("../routes/basics");
const { vapid_private_key } = require("../configs/config");

/**
 * Authentication middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
module.exports = (req, res, next) => {
  try {
    // Get token from headers
    let token = req.header("x-auth-token");
    
    // If no x-auth-token, try authorization header
    if (!token) {
      const authHeader = req.header("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // Check if no token
    if (!token) {
      console.log("Authentication failed: No token provided");
      return res.status(401).json({ 
        message: "Authentication failed. No token provided.",
        code: "NO_TOKEN"
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, vapid_private_key);
      
      if (!decoded.userId || !decoded.role) {
        console.log("Token verification failed: Missing required claims");
        return res.status(401).json({
          message: "Authentication failed. Invalid token format.",
          code: "INVALID_TOKEN_FORMAT"
        });
      }
      
      // Set user from payload
      req.user = decoded;
      next();
    } catch (jwtError) {
      console.log("Token verification failed:", jwtError.message);
      return res.status(401).json({
        message: "Authentication failed. Invalid token.",
        code: "INVALID_TOKEN",
        details: jwtError.message
      });
    }
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({
      message: "Internal server error during authentication",
      code: "AUTH_ERROR"
    });
  }
};
