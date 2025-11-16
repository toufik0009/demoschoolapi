const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const extractSchoolId = require("../middleware/extractSchoolId");

// Apply Leave (Student/Teacher)
router.post('/apply', extractSchoolId, leaveController.applyLeave);

// Get All Leaves (Admin Only)
router.get('/all', extractSchoolId, leaveController.getAllLeaves);

// Update Leave Status (Admin Only)
router.put('/status/:leaveId', extractSchoolId, leaveController.updateLeaveStatus);

// Get Leaves for Specific User (Student or Teacher)
router.get('/:userId', extractSchoolId, leaveController.getUserLeaves);

module.exports = router;
