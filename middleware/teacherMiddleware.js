const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teachers");

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    console.log("Decoded Token:", decoded); 
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid token." });
  }
};

// Middleware to verify Teacher Role (role: "teacher")
exports.verifyTeacher = (req, res, next) => {
  if (req.user && req.user.role === "teacher") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access Denied. Teacher only route." });
  }
};

// Middleware to verify Admin or Teacher Role
exports.verifyTeacherOrAdmin = (req, res, next) => {
  console.log("User Role:", req.user.role);
  if (req.user && ["teacher", "admin"].includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access Denied. Only Teachers or Admins allowed." });
  }
};
