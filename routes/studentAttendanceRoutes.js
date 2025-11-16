const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/studentAttendanceController");
const extractSchoolId = require("../middleware/extractSchoolId");

router.post("/punch-in", extractSchoolId, attendanceController.punchIn);
router.post("/punch-out", extractSchoolId, attendanceController.punchOut);
router.get("/student/:id", extractSchoolId, attendanceController.getStudentAttendance);
router.get("/", extractSchoolId, attendanceController.getAllAttendance);

module.exports = router;
