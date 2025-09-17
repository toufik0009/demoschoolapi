// middleware/auth.js
const jwt = require("jsonwebtoken");
const Teacher = require("../models/Teachers");

const authenticateTeacher = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decoded.userId);
    console.log("ggg",teacher)
    if (!teacher) return res.status(401).json({ message: "Invalid token" });

    req.user = teacher; // attach teacher to request
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authenticateTeacher;
