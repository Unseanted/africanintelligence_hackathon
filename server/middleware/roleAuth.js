const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role) && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized for this action" });
    }

    next();
  };
};

module.exports = roleAuth;
