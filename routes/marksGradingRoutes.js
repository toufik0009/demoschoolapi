const express = require('express');
const {
  createOrUpdateGrades,
  getAllGrades,
  getGradesByClass,
  deleteGradesByClass,
} = require ('../controllers/marksGradingController');

const router = express.Router();

router.post("/add", createOrUpdateGrades);
router.get("/all", getAllGrades);
router.get("/:className", getGradesByClass);
router.delete("/:className", deleteGradesByClass);

module.exports = router;