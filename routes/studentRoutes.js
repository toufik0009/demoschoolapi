const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const studentMiddleware = require("../middleware/studentMiddleware");
const upload = require('../middleware/upload');
const extractSchoolId = require("../middleware/extractSchoolId");

// ---------------- Student Routes ----------------

router.post("/login", studentController.studentLogin);

// Insert a new student
router.post(
  "/insertStudent",
  studentMiddleware.verifyToken,
  extractSchoolId,
  upload.single("studentImage"),
  studentController.createStudent
);

// Get all students
router.get(
  "/getAllStudents",
  studentMiddleware.verifyToken,
  extractSchoolId,
  studentController.getAllStudents
);

// Get a single student by ID
router.get(
  "/getStudent/:id",
  studentMiddleware.verifyToken,
  extractSchoolId,
  studentController.getStudentById
);

// Update a student by ID
router.put(
  "/updateStudent/:id",
  studentMiddleware.verifyToken,
  extractSchoolId,
  upload.single("studentImage"),
  studentMiddleware.verifyStudentOrAdmin,
  studentController.updateStudent
);

// Delete a student by ID
router.delete(
  "/deleteStudent/:id",
  studentMiddleware.verifyToken,
  extractSchoolId,
  studentMiddleware.verifyStudentOrAdmin,
  studentController.deleteStudent
);

module.exports = router;
