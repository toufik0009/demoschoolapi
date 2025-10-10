const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema({
  gradeName: {
    type: String,
    required: true,
  },
  fromMarks: {
    type: Number,
    required: true,
  },
  toMarks: {
    type: Number,
    required: true,
  },
  gradeStatus: {
    type: String,
    required: true,
  },
});

const marksGradingSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    className: {
      type: String,
      default: "All",
    },
    grades: [gradeSchema],
  },
  { timestamps: true }
);

// ✅ FIX: Must export a Mongoose model
module.exports = mongoose.model("MarksGrading", marksGradingSchema);
