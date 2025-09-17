const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const studentMiddleware = require("../middleware/studentMiddleware");
const upload = require('../middleware/upload');

// ---------------- Student Routes ----------------

router.post("/login", studentController.studentLogin);

// Insert a new student
router.post("/insertStudent", studentMiddleware.verifyToken, upload.single("studentImage"), studentController.createStudent);

// Get all students
router.get("/getAllStudents", studentMiddleware.verifyToken, studentController.getAllStudents);

// Get a single student by ID
router.get("/getStudent/:id", studentMiddleware.verifyToken, studentController.getStudentById);

// Update a student by ID
router.put("/updateStudent/:id", studentMiddleware.verifyToken, studentMiddleware.verifyStudentOrAdmin, studentController.updateStudent);

// Delete a student by ID
router.delete("/deleteStudent/:id", studentMiddleware.verifyToken, studentMiddleware.verifyStudentOrAdmin, studentController.deleteStudent);

module.exports = router;
