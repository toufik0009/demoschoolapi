// middleware/auth.js
const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teachers");
const Admin = require("../models/Admins");

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) throw new Error("No token provided");

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    throw new Error("Invalid token format");

  const token = parts[1];
  return jwt.verify(token, process.env.JWT_SECRET);
};

const authenticateTeacher = async (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    const teacher = await Teacher.findById(decoded.userId);
    if (!teacher) throw new Error("Invalid teacher token");

    req.user = teacher;
    req.role = "teacher";
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: " + err.message });
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    const decoded = verifyToken(req);
    const admin = await Admin.findById(decoded.userId);
    if (!admin) throw new Error("Invalid admin token");

    req.user = admin;
    req.role = "admin";
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: " + err.message });
  }
};

// ✅ New: Combined middleware (Teacher OR Admin)
const authenticateTeacherOrAdmin = async (req, res, next) => {
  try {
    const decoded = verifyToken(req);

    // Try teacher first
    const teacher = await Teacher.findById(decoded.userId);
    if (teacher) {
      req.user = teacher;
      req.role = "teacher";
      return next();
    }

    // If not teacher, try admin
    const admin = await Admin.findById(decoded.userId);
    if (admin) {
      req.user = admin;
      req.role = "admin";
      return next();
    }

    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: " + err.message });
  }
};

module.exports = {
  authenticateTeacher,
  authenticateAdmin,
  authenticateTeacherOrAdmin,
};
