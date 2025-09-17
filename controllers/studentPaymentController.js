const Payment = require('../models/StudentPayment');
const Student = require('../models/Students');
const mongoose = require('mongoose');
const { addMonths, billingMonthsSince } = require('../utils/dateHelpers');


exports.createPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { studentId, amountPaid, payDate, dueAmount, note } = req.body;

    if (!studentId || !amountPaid || !payDate) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // 🔹 Find student
    const student = await Student.findById(studentId).session(session);
    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // 🔹 Get total paid so far
    const pastPayments = await Payment.find({ studentId }).session(session);
    const totalPaidBefore = pastPayments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalPaid = totalPaidBefore + Number(amountPaid);

    // 🔹 Dates
    const lastPaymentDate = new Date(payDate);
    const nextPaymentDate = addMonths(lastPaymentDate, 1);

    // 🔹 Save new payment
    const paymentDoc = new Payment({
      studentId,
      payDate: lastPaymentDate,
      amountPaid: Number(amountPaid),
      dueAmount: dueAmount ?? 0, // take directly from frontend
      note,
    });
    await paymentDoc.save({ session });

    // 🔹 Update student summary
    student.totalPaid = totalPaid;
    student.lastPaymentDate = lastPaymentDate;
    student.nextPaymentDate = nextPaymentDate;
    student.outstanding = dueAmount ?? 0; // also trust frontend
    await student.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment: paymentDoc,
      summary: {
        totalPaid,
        outstanding: dueAmount ?? 0,
        lastPaymentDate,
        nextPaymentDate,
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("createPayment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all payments (paginated optional)
exports.getAllPayments = async (req, res) => {
  try {
    // simple pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const payments = await Payment.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Payment.countDocuments();

    return res.json({ success: true, payments, total, page, limit });
  } catch (err) {
    console.error('getAllPayments error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get one payment by id
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const payment = await Payment.findById(id).lean();
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    return res.json({ success: true, payment });
  } catch (err) {
    console.error('getPaymentById error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get payments by studentId
exports.getPaymentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid studentId' });
    }

    const payments = await Payment.find({ studentId }).sort({ date: -1 }).lean();
    return res.json({ success: true, payments });
  } catch (err) {
    console.error('getPaymentsByStudent error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const updated = await Payment.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, message: 'Payment not found' });

    return res.json({ success: true, payment: updated });
  } catch (err) {
    console.error('updatePayment error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a payment
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const deleted = await Payment.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ success: false, message: 'Payment not found' });

    return res.json({ success: true, message: 'Payment deleted' });
  } catch (err) {
    console.error('deletePayment error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

