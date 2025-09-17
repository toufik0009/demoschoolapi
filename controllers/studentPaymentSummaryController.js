// controllers/studentPaymentSummaryController.js
const Payment = require('../models/StudentPayment');
const Student = require('../models/Students');
const { addMonths, billingMonthsSince } = require('../utils/dateHelpers');

exports.getStudentPaymentSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // fetch payments
    const payments = await Payment.find({ studentId: id }).sort({ date: -1 }).lean();
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.todayPay) || 0), 0);

    const lastPaymentDate = payments.length ? payments[0].date : null;
    const nextPaymentDate = lastPaymentDate ? addMonths(lastPaymentDate, 1) : student.feeStartDate || null;

    const expectedMonths = billingMonthsSince(student.feeStartDate || student.createdAt, new Date());
    const expectedTotal = (student.monthlyFee || 0) * expectedMonths;
    const outstanding = expectedTotal - totalPaid;

    return res.json({
      success: true,
      data: {
        payments,
        totalPaid,
        lastPaymentDate,
        nextPaymentDate,
        expectedTotal,
        expectedMonths,
        outstanding,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
