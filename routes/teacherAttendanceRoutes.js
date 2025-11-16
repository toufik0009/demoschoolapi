const express = require("express");
const router = express.Router();
const teacherAttendance = require("../controllers/teacherAttendanceController");
const extractSchoolId = require("../middleware/extractSchoolId");

router.post("/punch-in", extractSchoolId, teacherAttendance.punchIn);
router.post("/punch-out", extractSchoolId, teacherAttendance.punchOut);
router.get("/teacher/:id", extractSchoolId, teacherAttendance.getTeacherAttendance);
router.get("/", extractSchoolId, teacherAttendance.getAllAttendance);

module.exports = router;
