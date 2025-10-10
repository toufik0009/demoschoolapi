const express = require("express");
const router = express.Router();
const teacherAttendance = require("../controllers/teacherAttendanceController");

router.post("/punch-in", teacherAttendance.punchIn);
router.post("/punch-out", teacherAttendance.punchOut);
router.get("/teacher/:id", teacherAttendance.getTeacherAttendance);
router.get("/", teacherAttendance.getAllAttendance);

module.exports = router;
