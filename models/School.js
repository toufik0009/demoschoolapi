// models/School.js
const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  schoolAdminName: { type: String, required: false },
  schoolAddress: { type: String, required: true },
  schoolPhone: { type: String },
  schoolEmail: { type: String },
  schoolBankAcc: { type: String },
  schoolWebsite: { type: String },
  schoolEstablishedYear: { type: String },
  schoolType: { type: String },
  schoolFees: { type: String },
  schoolRulesRegulations: { type: String },
  schoolLogo: { type: String }, 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'superAdmin' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'superAdmin' },
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('School', SchoolSchema);
