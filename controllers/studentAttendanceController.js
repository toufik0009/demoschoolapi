const StudentAttendance = require("../models/StudentAttendance");
const Student = require("../models/Students");

// ✅ PUNCH-IN
exports.punchIn = async (req, res) => {
  try {
    const { studentId } = req.body;
    const schoolId = req.schoolId;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Validate student belongs to this school
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ message: "Student not found in this school" });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if already punched-in today
    const existing = await StudentAttendance.findOne({
      schoolId,
      student: studentId,
      date: today,
    });

    if (existing) {
      return res.status(400).json({ message: "Already punched in today" });
    }

    const attendance = new StudentAttendance({
      schoolId,
      student: studentId,
      date: today,
      punchIn: new Date(),
      status: "Present",
    });

    await attendance.save();

    res.json({ message: "Punch-in recorded successfully", attendance });
  } catch (err) {
    console.error("Punch-in error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ PUNCH-OUT
exports.punchOut = async (req, res) => {
  try {
    const { studentId } = req.body;
    const schoolId = req.schoolId;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const today = new Date().toISOString().split("T")[0];

    const attendance = await StudentAttendance.findOne({
      schoolId,
      student: studentId,
      date: today,
    });

    if (!attendance) {
      return res.status(404).json({
        message: "No punch-in record found for today",
      });
    }

    if (attendance.punchOut) {
      return res.status(400).json({ message: "Already punched out today" });
    }

    attendance.punchOut = new Date();
    await attendance.save();

    res.json({ message: "Punch-out recorded successfully", attendance });
  } catch (err) {
    console.error("Punch-out error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ GET STUDENT ATTENDANCE (with school filter)
exports.getStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.schoolId;

    const records = await StudentAttendance.find({
      student: id,
      schoolId,
    })
      .populate("student", "studentName studentClass studentRoll")
      .sort({ date: -1 });

    res.json({ attendance: records });
  } catch (err) {
    console.error("Get student attendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ GET ALL ATTENDANCE (school-wise)
exports.getAllAttendance = async (req, res) => {
  try {
    const schoolId = req.schoolId;

    const records = await StudentAttendance.find({ schoolId })
      .populate("student", "studentName studentClass studentRoll")
      .sort({ date: -1 });

    res.json({ attendance: records });
  } catch (err) {
    console.error("Get all attendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
