const jwt = require("jsonwebtoken");
const Student = require("../models/Students");

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from "Bearer <token>"

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

// Middleware to verify Student Role (role: "student")
exports.verifyStudent = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access Denied. Student only route." });
  }
};

// Middleware to verify Admin or Student Role
exports.verifyStudentOrAdmin = (req, res, next) => {
    console.log("User Role:", req.user.role); 
  if (req.user && ["superadmin", "admin"].includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access Denied. Only Students or Admins allowed." });
  }
};
