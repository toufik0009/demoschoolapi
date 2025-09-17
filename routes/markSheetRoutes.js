const express = require("express");
const router = express.Router();
const { createOrUpdateMarkSheet, getAllMarkSheets, getMarkSheetById } = require("../controllers/markSheetController");
const authenticateTeacher = require("../middleware/auth");
// Update marks by teacher
router.put("/:markSheetId/update", authenticateTeacher, createOrUpdateMarkSheet);

router.get("/", authenticateTeacher, getAllMarkSheets);

// Get single by ID
router.get("/:id", authenticateTeacher, getMarkSheetById);

module.exports = router;
