const Payment = require('../models/StudentPayment');
const Student = require('../models/Students');
const mongoose = require("mongoose");

exports.createPayment = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const { studentId, amountPaid, month, includeOutstanding = false, paymentMethod = "cash", note } = req.body;

    if (!studentId || typeof amountPaid !== "number" || !month) {
      return res.status(400).json({ message: "studentId, amountPaid (number) and month are required" });
    }

    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) return res.status(404).json({ message: "Student not found" });

    const monthlyFee = student.monthlyFee || 0;
    const outstandingDue = student.outstandingDue || 0;
    let credit = student.creditBalance || 0;

    let remaining = amountPaid;

    // Credit Applied
    let creditAppliedToMonth = 0;
    if (credit > 0) {
      creditAppliedToMonth = Math.min(credit, monthlyFee);
      credit -= creditAppliedToMonth;
    }

    // Outstanding Due
    let appliedToDue = 0;
    if (includeOutstanding && outstandingDue > 0) {
      appliedToDue = Math.min(remaining, outstandingDue);
      remaining -= appliedToDue;
    }

    // Current Month Fee
    let appliedToMonth = Math.min(remaining, monthlyFee - creditAppliedToMonth);
    remaining -= appliedToMonth;

    // Extra → Credit
    credit += remaining;

    // New Due
    const monthDue = monthlyFee - (appliedToMonth + creditAppliedToMonth);
    const newOutstanding = Math.max(0, outstandingDue - appliedToDue) + monthDue;

    // Save Payment
    const payment = new Payment({
      schoolId,
      student: student._id,
      month,
      amountPaid,
      appliedToDue,
      appliedToMonth: appliedToMonth + creditAppliedToMonth,
      dueBefore: outstandingDue,
      dueAfter: newOutstanding,
      paymentMethod,
      note,
    });

    await payment.save();

    // Update Student
    student.outstandingDue = newOutstanding;
    student.creditBalance = credit;
    await student.save();

    return res.json({ message: "Payment recorded", payment, student });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getAllPayments = async (req, res) => {
  try {
    const schoolId = req.schoolId;
    const payments = await Payment.find({ schoolId })
      .populate("student", "studentName studentClass studentRoll studentPhone")
      .sort({ paymentDate: -1 }); // newest first
    return res.json({ payments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// -------------------------
// Get Payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.schoolId;
    console.log("Received ID:", id);

    if (!id) return res.status(400).json({ message: "Payment ID is required" });

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Payment ID" });
    }

    const payment = await Payment.findOne({ _id: id, schoolId }).sort({ paymentDate: -1 });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    return res.json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};