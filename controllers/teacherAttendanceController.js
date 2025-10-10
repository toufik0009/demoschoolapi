const TeacherAttendance = require("../models/TeacherAttendance");
const Teacher = require("../models/Teachers");

// ✅ Mark Punch-In
exports.punchIn = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if already punched in today
    const existing = await TeacherAttendance.findOne({
      teacher: teacherId,
      date: today,
    });

    if (existing) {
      return res.status(400).json({ message: "Already punched in today" });
    }

    const attendance = new TeacherAttendance({
      teacher: teacherId,
      date: today,
      punchIn: new Date(),
      status: "Present",
    });

    await attendance.save();
    res.json({ message: "Punch-in recorded successfully", attendance });
  } catch (err) {
    console.error("Teacher Punch-in error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Mark Punch-Out
exports.punchOut = async (req, res) => {
  try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const today = new Date().toISOString().split("T")[0];
    const attendance = await TeacherAttendance.findOne({
      teacher: teacherId,
      date: today,
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ message: "No punch-in record found for today" });
    }

    if (attendance.punchOut) {
      return res.status(400).json({ message: "Already punched out today" });
    }

    attendance.punchOut = new Date();
    await attendance.save();

    res.json({ message: "Punch-out recorded successfully", attendance });
  } catch (err) {
    console.error("Teacher Punch-out error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get attendance for a specific teacher
exports.getTeacherAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const records = await TeacherAttendance.find({ teacher: id })
      .populate("teacher", "teacherName teacherRole teacherId teacherEmail")
      .sort({ date: -1 });

    res.json({ attendance: records });
  } catch (err) {
    console.error("Get teacher attendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all attendance records (for admin)
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await TeacherAttendance.find()
      .populate("teacher", "teacherName teacherRole teacherId teacherEmail")
      .sort({ date: -1 });

    res.json({ attendance: records });
  } catch (err) {
    console.error("Get all teacher attendance error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};