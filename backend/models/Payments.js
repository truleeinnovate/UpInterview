const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    paymentCode: { type: String, unique: true },
    tenantId: { type: String },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: false,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR", required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "authorized",
        "captured",
        "failed",
        "refunded",
        "charged",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "bank_transfer", "wallet", "upi"],
      required: true,
    },
    paymentGateway: { type: String, default: "razorpay" },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },
    razorpayCustomerId: { type: String },
    // transactionId: { type: String, sparse: true },
    transactionId: { type: String },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'CardPayment' },
    //isRecurring: { type: Boolean, default: false },
    subscriptionId: { type: String }, // For recurring payments
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
    receiptId: { type: mongoose.Schema.Types.ObjectId, ref: "Receipt" },
    billingCycle: { type: String, enum: ["monthly", "annual"] },
    transactionDate: { type: Date, default: Date.now },
    paidAt: { type: Date },
    metadata: { type: Object },
    notes: { type: String },
  },
  { timestamps: true }
);

// Create a sparse index on transactionId to allow multiple null values
PaymentSchema.index({ transactionId: 1 }, { sparse: true });

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
