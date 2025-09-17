const mongoose = require("mongoose");

const markSheetSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },

    // classId can stay string if you don’t have Class model yet
    classId: { type: String, required: true },

    examType: {
      type: String,
      required: true,
      enum: ["Unit Test", "Mid Term", "Final Exam", "Class Test", "Other"],
    },
    sessionYear: { type: String, required: true },

    subjects: [
      {
        subjectName: { type: String, required: true },
        maxMarks: { type: Number, required: true },
        obtainedMarks: { type: Number, required: true },
        grade: { type: String },
        remarks: { type: String },
      },
    ],

    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String },
    resultStatus: {
      type: String,
      enum: ["Pass", "Fail"],
      required: true,
    },

    // ✅ Dynamic reference: can be Teacher OR Admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
      required: true,
    },
    createdByModel: {
      type: String,
      required: true,
      enum: ["Teacher", "Admin"], // must match actual mongoose.model names
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "updatedByModel",
    },
    updatedByModel: {
      type: String,
      enum: ["Teacher", "Admin"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarkSheet", markSheetSchema);
