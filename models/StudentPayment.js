// models/StudentPayment.js
const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    payDate: { type: Date, required: true }, 
    amountPaid: { type: Number, required: true }, 
    dueAmount: { type: Number, default: 0 }, 

    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentPayment", PaymentSchema);
