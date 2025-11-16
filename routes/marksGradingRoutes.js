const express = require('express');
const {
  createOrUpdateGrades,
  getAllGrades,
  getGradesByClass,
  deleteGradesByClass,
} = require ('../controllers/marksGradingController');

const router = express.Router();
const { adminAuth } = require("../middleware/adminMiddleware");

router.post("/add",adminAuth, createOrUpdateGrades);
router.get("/all",adminAuth, getAllGrades);
router.get("/:className",adminAuth, getGradesByClass);
router.delete("/:className",adminAuth, deleteGradesByClass);

module.exports = router;