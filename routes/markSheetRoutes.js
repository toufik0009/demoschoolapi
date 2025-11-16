const express = require("express");
const router = express.Router();
const {
  createMarkSheet,
  updateMarkSheet,
  getAllMarkSheets,
  getMarkSheetById,
  createOrUpdateMarkSheet,
} = require("../controllers/markSheetController");

const {
  authenticateTeacher,
  authenticateAdmin,
  authenticateTeacherOrAdmin,
} = require("../middleware/auth");
const extractSchoolId = require("../middleware/extractSchoolId");

// Create (Teacher or Admin)
router.post(
  "/",
  authenticateTeacherOrAdmin,
  extractSchoolId,
  createOrUpdateMarkSheet
);


// Update marksheet by id (Teacher or Admin)
router.put("/:markSheetId/update", authenticateTeacherOrAdmin, extractSchoolId, updateMarkSheet);

// ✅ Allow both teacher & admin to list
router.get("/", authenticateTeacherOrAdmin, extractSchoolId, getAllMarkSheets);

// Get single by ID
router.get("/:id", authenticateTeacherOrAdmin, extractSchoolId, getMarkSheetById);

module.exports = router;
