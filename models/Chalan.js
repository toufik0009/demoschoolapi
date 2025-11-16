const mongoose = require("mongoose");

const chalanSchema = new mongoose.Schema(
    {
        schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
        MonthlyTuitionFee: { type: Number, default: 0 },
        AdmissionFee: { type: Number, default: 0 },
        RegistrationFee: { type: Number, default: 0 },
        RegistrationFee: { type: Number, default: 0 },
        ArtMaterial: { type: Number, default: 0 },
        Transport: { type: Number, default: 0 },
        Books: { type: Number, default: 0 },
        Uniform: { type: Number, default: 0 },
        Fine: { type: Number, default: 0 },
        Other: { type: Number, default: 0 },

        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admin" }
    },
    { timestamps: true }
)

module.exports = mongoose.model("Chalan", chalanSchema);