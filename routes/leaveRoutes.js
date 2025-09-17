const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// Apply Leave (Student/Teacher)
router.post('/apply', leaveController.applyLeave);

// Get All Leaves (Admin Only)
router.get('/all', leaveController.getAllLeaves);

// Update Leave Status (Admin Only)
router.put('/status/:leaveId', leaveController.updateLeaveStatus);

// Get Leaves for Specific User (Student or Teacher)
router.get('/:userId', leaveController.getUserLeaves);

module.exports = router;
