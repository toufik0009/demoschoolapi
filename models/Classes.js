const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    marks: { type: String, required: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "teacher" }],
});

const classSchema = new mongoose.Schema(
    {
        schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
        className: { type: String, required: true },
        sections: { type: String },

        subjects: [subjectSchema],

        totalBoys: [{ type: mongoose.Schema.Types.ObjectId, ref: "student" }],
        totalGirls: [{ type: mongoose.Schema.Types.ObjectId, ref: "student" }],
        totalOthers: [{ type: mongoose.Schema.Types.ObjectId, ref: "student" }],

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
