const express = require("express");
const router = express.Router();
const teacherController = require("../controllers/teacherController");
const teacherMiddleware = require("../middleware/teacherMiddleware");
const upload = require('../middleware/upload');

// ---------------- Teacher Routes ----------------

// Insert a new teacher
router.post("/insertTeacher", teacherMiddleware.verifyToken, upload.single("teacherImage"), teacherController.createTeacher);

// Teacher Login
router.post("/login", teacherController.loginTeacher);

// Get all teachers
router.get("/getAllTeachers", teacherMiddleware.verifyToken, teacherController.getAllTeachers);

// Get a single teacher by ID
router.get("/getTeacher/:id", teacherMiddleware.verifyToken, teacherController.getTeacherById);

// Update a teacher by ID
router.put("/updateTeacher/:id", teacherMiddleware.verifyToken, upload.single("teacherImage"), teacherMiddleware.verifyTeacherOrAdmin, teacherController.updateTeacher);

// Delete a teacher by ID
router.delete("/deleteTeacher/:id", teacherMiddleware.verifyToken, teacherMiddleware.verifyTeacherOrAdmin, teacherController.deleteTeacher);

module.exports = router;
