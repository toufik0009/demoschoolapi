const jwt = require('jsonwebtoken');
const School = require('../models/School');

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

// Middleware to verify SuperAdmin role (role: "superadmin")
exports.verifySuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    return res.status(403).json({ success: false, message: "Access Denied. SuperAdmin only." });
  }
};
