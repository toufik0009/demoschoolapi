const jwt = require("jsonwebtoken");
const Class = require("../models/Classes");

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid token." });
  }
};

// Middleware to verify Class Role (role: "class")
exports.verifyClass = (req, res, next) => {
  if (req.user && req.user.role === "class") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access Denied. Class only route." });
  }
};

// Middleware to verify Teacher or Admin Role
exports.verifyTeacherOrAdmin = (req, res, next) => {
  console.log("User Role:", req.user.role);
  if (req.user && ["teacher", "admin"].includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access Denied. Only Teacher or Admins allowed." });
  }
};
