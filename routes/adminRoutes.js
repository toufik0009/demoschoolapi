const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, verifySuperAdmin } = require("../middleware/adminMiddleware");


// Admin Login
router.post("/login", adminController.loginAdmin);

// ============================
// Protected Routes (Token Required)
// ============================

// Create a new Admin (only SuperAdmin can create)
router.post("/create", verifyToken, verifySuperAdmin, adminController.createAdmin);

// Get all Admins
router.get("/getAllAdmin", verifyToken, adminController.getAllAdmins);

// Get Admin by ID
router.get("getAdmin/:id", verifyToken, adminController.getAdminById);

// Update Admin by ID
router.put("updateAdmin/:id", verifyToken, adminController.updateAdmin);

// Delete Admin by ID (only SuperAdmin can delete)
router.delete("deleteAdmin/:id", verifyToken, verifySuperAdmin, adminController.deleteAdmin);

module.exports = router;
