// controllers/superAdminController.js
const SuperAdmin = require('../models/SuperAdmin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTP } = require("../utils/sendEmail");

// Register Super Admin
exports.registerSuperAdmin = async (req, res) => {
  try {
    const { adminName, adminEmail, adminPhone, adminPassword } = req.body;

    // Check if admin already exists
    const existingAdmin = await SuperAdmin.findOne({ adminEmail });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create Super Admin
    const superAdmin = new SuperAdmin({
      adminName,
      adminEmail,
      adminPhone,
      adminPassword: hashedPassword,
    });

    await superAdmin.save();

    res.status(201).json({ message: 'Super Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login Super Admin
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { adminEmail } = req.body;

    const superAdmin = await SuperAdmin.findOne({ adminEmail });
    if (!superAdmin) {
      return res.status(404).json({ message: "Super Admin not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save OTP to DB
    superAdmin.otp = otp;
    superAdmin.otpExpires = otpExpires;
    await superAdmin.save();

    // Send OTP via Email
    await sendOTP(adminEmail, otp);

    res.status(200).json({ message: "OTP sent to email", email: adminEmail });
  } catch (error) {
    console.error("OTP send error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// controllers/authController.js
exports.verifyOTP = async (req, res) => {
  try {
    const { adminEmail, otp } = req.body;
    console.log("Verifying OTP...",req.body); // Debugging line

    const superAdmin = await SuperAdmin.findOne({ adminEmail: adminEmail });
    if (!superAdmin) return res.status(404).json({ message: "User not found" });

    const isValidOTP = superAdmin.otp === otp && new Date() < new Date(superAdmin.otpExpires);
    if (!isValidOTP) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP fields
    superAdmin.otp = null;
    superAdmin.otpExpires = null;
    await superAdmin.save();

    // Generate JWT
    const token = jwt.sign(
      { id: superAdmin._id, role: superAdmin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "OTP verified successfully",
      token,
      admin: {
        id: superAdmin._id,
        adminName: superAdmin.adminName,
        role: superAdmin.role,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
