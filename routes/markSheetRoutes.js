const express = require("express");
const router = express.Router();
const {
  createOrUpdateMarkSheet,
  getAllMarkSheets,
  getMarkSheetById,
} = require("../controllers/markSheetController");

const {
  authenticateTeacher,
  authenticateAdmin,
  authenticateTeacherOrAdmin,
} = require("../middleware/auth");

// Update marks by teacher
router.put("/:markSheetId/update", authenticateTeacher, createOrUpdateMarkSheet);

// ✅ Allow both teacher & admin
router.get("/", authenticateTeacherOrAdmin, getAllMarkSheets);

// Get single by ID
router.get("/:id", authenticateTeacherOrAdmin, getMarkSheetById);

module.exports = router;
