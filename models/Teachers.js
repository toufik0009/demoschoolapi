const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },

  teacherImage: { type: String, required: false },
  teacherName: { type: String, required: false },
  teacherEmail: { type: String, required: true, unique: true },
  teacherDOJ: { type: String },
  teacherDOB: { type: String },
  teacherPhone: { type: String, required: true, unique: true },
  teacherGender: { type: String },

  teacherClasses: {
    type: [String],
    default: []
  },
  teacherSections: {
    type: [String],
    default: []
  },
  teacherSubjects: {
    type: [String],
    default: []
  },

  teacherSalary: { type: String },
  teacherPassword: { type: String },

  teacherParentName: { type: String },
  teacherExperience: { type: String },
  teacherAadharNumber: { type: String },
  teacherReligion: { type: String },
  teacherEducation: { type: String },
  teacherBloodGroup: { type: String },
  teacherResidentialAddress: { type: String },
  teacherCity: { type: String },
  teacherState: { type: String },
  teacherZip: { type: String },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },

  role: { type: String, default: "teacher" },
}, { timestamps: true });

// ✅ Pre-save hook to set teacherPassword from teacherDOB
teacherSchema.pre("save", function (next) {
  if (this.teacherDOB && !this.teacherPassword) {
    // teacherDOB is in format YYYY-MM-DD
    const [year, month, day] = this.teacherDOB.split("-");
    this.teacherPassword = `${day}${month}${year}`; // DDMMYYYY
  }
  next();
});

module.exports = mongoose.model("Teacher", teacherSchema);
