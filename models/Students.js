const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  studentImage: { type: String },
  studentName: { type: String },
  studentClass: { type: String, required: true },
  studentRoll: { type: String, required: true },
  studentSection: { type: String, required: true },
  studentBlood: { type: String, required: false },
  studentEmail: { type: String, required: true, unique: true },
  studentDOB: { type: String, required: true },
  studentGender: { type: String, required: true },
  studentAddress: { type: String, required: true },
  studentCity: { type: String, required: true },
  studentState: { type: String, required: true },
  studentZip: { type: String, required: true },
  studentPhone: { type: String, required: true, unique: true },
  studentAadhaar: { type: String, required: false, unique: true },

  monthlyFee: { type: Number, required: true },
  outstandingDue: { type: Number, default: 0 },
  creditBalance: { type: Number, default: 0 },


  studentParentName: { type: String, required: true },
  studentRelationship: { type: String, required: true },
  studentParentPhone: { type: String, required: true },
  studentParentEmail: { type: String, required: true },
  studentParentOccupation: { type: String, required: true },
  studentParentAddress: { type: String, required: true },

  studentPreviousSchoolName: { type: String },
  studentPreviousSchoolAddress: { type: String },
  studentPreviousSchoolCity: { type: String },
  studentPreviousSchoolState: { type: String },
  studentPreviousSchoolZip: { type: String },
  studentPreviousSchoolAttended: { type: String },
  studentPreviousSchoolRFL: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },

  studentPassword: { type: String },

  markSheet: [{ type: mongoose.Schema.Types.ObjectId, ref: "MarkSheet" }],

  role: { type: String, default: "student" },
}, { timestamps: true });

// 🔑 Pre-save hook for default password
studentSchema.pre("save", function (next) {
  if (!this.studentPassword && this.studentDOB) {
    // studentDOB assumed as yyyy-mm-dd
    const parts = this.studentDOB.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      this.studentPassword = `${day}${month}${year}`;
    }
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);
