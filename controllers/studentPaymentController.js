const Payment = require('../models/StudentPayment');
const Student = require('../models/Students');
const mongoose = require("mongoose");

exports.createPayment = async (req, res) => {
  try {
    const { studentId, amountPaid, month, includeOutstanding = false, paymentMethod = "cash", note } = req.body;

    if (!studentId || typeof amountPaid !== "number" || !month) {
      return res.status(400).json({ message: "studentId, amountPaid (number) and month are required" });
    }

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const monthlyFee = student.monthlyFee || 0;
    const outstandingDue = student.outstandingDue || 0;
    let credit = student.creditBalance || 0;

    let remaining = amountPaid;

    // Step 1: Use credit first for this month
    let creditAppliedToMonth = 0;
    if (credit > 0) {
      creditAppliedToMonth = Math.min(credit, monthlyFee);
      credit -= creditAppliedToMonth;
    }

    // Step 2: Apply to outstanding due if included
    let appliedToDue = 0;
    if (includeOutstanding && outstandingDue > 0) {
      appliedToDue = Math.min(remaining, outstandingDue);
      remaining -= appliedToDue;
    }

    // Step 3: Apply remaining to current month's fee
    let appliedToMonth = Math.min(remaining, monthlyFee - creditAppliedToMonth);
    remaining -= appliedToMonth;

    // Step 4: Any leftover goes to credit
    credit += remaining;

    // Step 5: Calculate new outstanding (month's due minus paid)
    const monthDue = monthlyFee - (appliedToMonth + creditAppliedToMonth);
    const newOutstanding = Math.max(0, outstandingDue - appliedToDue) + monthDue;

    // Step 6: Create payment record
    const payment = new Payment({
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

    // Step 7: Update student
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
    const payments = await Payment.find()
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
    console.log("Received ID:", id);

    if (!id) return res.status(400).json({ message: "Payment ID is required" });

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Payment ID" });
    }

     const payment = await Payment.find({ student: id }).sort({ paymentDate: -1 });

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    return res.json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};