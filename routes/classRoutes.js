const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const classMiddleware = require("../middleware/classMiddleware");

// ---------------- Class Routes ----------------

// Insert a new class
router.post("/insertClass", classMiddleware.verifyToken, classController.createClass);

// Get all classes
router.get("/getAllClasses", classMiddleware.verifyToken, classController.getAllClasses);

// Get a single class by ID
router.get("/getClass/:id", classMiddleware.verifyToken, classController.getClassById);

// Update a class by ID
router.put("/updateClass/:id", classMiddleware.verifyToken, classMiddleware.verifyTeacherOrAdmin, classController.updateClass);

// Delete a class by ID
router.delete("/deleteClass/:id", classMiddleware.verifyToken, classMiddleware.verifyTeacherOrAdmin, classController.deleteClass);

module.exports = router;
