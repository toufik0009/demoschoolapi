const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/studentAttendanceController");

router.post("/punch-in", attendanceController.punchIn);
router.post("/punch-out", attendanceController.punchOut);
router.get("/student/:id", attendanceController.getStudentAttendance);
router.get("/", attendanceController.getAllAttendance);

module.exports = router;
