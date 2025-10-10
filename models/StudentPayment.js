const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  month: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  appliedToDue: { type: Number, default: 0 },
  appliedToMonth: { type: Number, default: 0 },
  dueBefore: { type: Number, default: 0 },
  dueAfter: { type: Number, default: 0 },
  paymentMethod: { type: String, default: "cash" },
  paymentDate: { type: Date, default: Date.now },
  note: { type: String },
});

const Payment = mongoose.model("StudentPayment", paymentSchema);
module.exports = Payment;
