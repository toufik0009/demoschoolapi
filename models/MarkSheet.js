const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subjectName: { type: String, required: true },
    maxMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    grade: { type: String },
    remarks: { type: String },
  },
  { _id: false }
);

const markSheetSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    // classId can stay string if you don’t have Class model yet
    classId: { type: String, required: true },
    section: { type: String }, // controller references section so keep it
    examType: {
      type: String,
      required: true,
      enum: ["Unit Test", "Mid Term", "Final Exam", "Class Test", "Other"],
    },
    examDate: { type: Date }, // keep as Date to allow comparison
    sessionYear: { type: String, required: true },

    subjects: [subjectSchema],

    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String },
    resultStatus: {
      type: String,
      enum: ["Pass", "Fail"],
      required: true,
    },

    // Dynamic reference: can be Teacher OR Admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
    },
    createdByModel: {
      type: String,
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

// NOTE: unique compound index on array element is not straightforward,
// we'll enforce uniqueness rules in controller (safer & more flexible).

module.exports = mongoose.model("MarkSheet", markSheetSchema);
