const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const classMiddleware = require("../middleware/classMiddleware");
const extractSchoolId = require("../middleware/extractSchoolId");

// ---------------- Class Routes ----------------

// Insert a new class
router.post("/insertClass", classMiddleware.verifyToken,extractSchoolId, classController.createClass);

// Get all classes
router.get("/getAllClasses", classMiddleware.verifyToken, extractSchoolId,classController.getAllClasses);

// Get a single class by ID
router.get("/getClass/:id", classMiddleware.verifyToken,extractSchoolId, classController.getClassById);

// Update a class by ID
router.put("/updateClass/:id", classMiddleware.verifyToken,extractSchoolId, classMiddleware.verifyTeacherOrAdmin, classController.updateClass);

// Delete a class by ID
router.delete("/deleteClass/:id", classMiddleware.verifyToken,extractSchoolId, classMiddleware.verifyTeacherOrAdmin, classController.deleteClass);

module.exports = router;
