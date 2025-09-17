const Leave = require('../models/Leave');

// Apply Leave
exports.applyLeave = async (req, res) => {
  const { userId, userType, fromDate, toDate, reason } = req.body;

  try {
    const leave = new Leave({ userId, userType, fromDate, toDate, reason });
    await leave.save();
    res.status(201).json({ success: true, message: 'Leave applied successfully.', leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// Get All Leaves (Admin Only)
exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ appliedAt: -1 });
    res.json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// Approve or Reject Leave (Admin Only)
exports.updateLeaveStatus = async (req, res) => {
  const { leaveId } = req.params;
  const { status } = req.body; // Expected values: 'Approved' | 'Rejected'
console.log("dd",status,leaveId)
  try {
    const leave = await Leave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true }
    );

    if (!leave)
      return res.status(404).json({ success: false, message: 'Leave not found' });

    res.json({ success: true, message: 'Leave status updated', leave });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// Get Leaves for Specific User (Student or Teacher)
exports.getUserLeaves = async (req, res) => {
  const { userId } = req.params;

  try {
    const leaves = await Leave.find({ userId }).sort({ appliedAt: -1 });
    res.json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};
