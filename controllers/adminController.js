const Admin = require("../models/Admins");
const School = require("../models/School");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Create Admin
exports.createAdmin = async (req, res) => {
  try {
    const { username, email, phone, password, schoolIds } = req.body; // <-- accept schoolIds

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      username,
      email,
      phone,
      password: hashedPassword,
      schoolIds,
      createdBy: req.user.id,
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
  } catch (error) {
    console.error('Error creating admin:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin Login

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 🔹 Check if all assigned schools are Paid
    const schools = await School.find({ _id: { $in: admin.schoolIds } });
    const hasUnpaidSchool = schools.some((s) => s.status.toLowerCase() !== "paid");

    if (hasUnpaidSchool) {
      return res.status(403).json({
        message: "Cannot login. One or more of your assigned schools have Unpaid status.",
      });
    }

    const token = jwt.sign(
      { userId: admin._id, role: admin.role, schoolIds: admin.schoolIds },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        image: admin.adminImage,
        name: admin.username,
        email: admin.email,
        role: admin.role,
        schoolIds: admin.schoolIds
      }
    });
  } catch (error) {
    console.error('Error logging in admin:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json({ admins });
  } catch (error) {
    console.error('Error fetching admins:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Admin ID' });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ admin });
  } catch (error) {
    console.error('Error fetching admin:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Admin by ID
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Admin ID' });
    }

    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Admin by ID
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Admin ID' });
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedAdmin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({ admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
