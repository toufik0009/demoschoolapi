const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  punchIn: {
    type: Date,
    required: true,
  },
  punchOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Late"],
    default: "Present",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("StudentAttendance", attendanceSchema);
