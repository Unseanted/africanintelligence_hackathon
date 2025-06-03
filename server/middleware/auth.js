const jwt = require("jsonwebtoken");
// const { ocn } = require("../routes/basics");
const { vapid_private_key } = require("../configs/config");

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token =
      req.header("x-auth-token") || req.header("authorization").split(" ")[1];

    // Check if no token
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, vapid_private_key);

    // Set user from payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Token is not valid",
    });
  }
};
