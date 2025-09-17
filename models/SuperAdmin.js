const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
  adminName: { type: String, required: true },
  adminEmail: { type: String, required: true, unique: true },
  adminPhone: { type: String },
  adminPassword: { type: String, required: true },
  role: { type: String, default: "superadmin" },
  otp: { type: String },
  otpExpires: { type: Date },
  adminStatus: { type: String, default: 'active' },
  createdBy: { type: String },
  status: { type: String, default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('SuperAdmin', SuperAdminSchema);
