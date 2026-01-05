const mongoose = require("mongoose");

// Define a custom validator for transaction types that's case-insensitive
const VALID_TRANSACTION_TYPES = [
  // New business-level transaction types
  "topup",
  "hold",
  "hold_adjust",
  "hold_release",
  "payout",
  "refund",
  "platform_fee",
  // Legacy directional types kept for backward compatibility
  "credit",
  "credited",
  "debited",
];

const validateTransactionType = function (value) {
  if (!value || typeof value !== "string") return false;
  return VALID_TRANSACTION_TYPES.includes(value.toLowerCase());
};

// Define a custom validator for transaction status that's case-insensitive
const validateTransactionStatus = function (value) {
  const validStatuses = ["pending", "completed", "failed"];
  return validStatuses.includes(value.toLowerCase());
};

const WalletSchema = new mongoose.Schema(
  {
    tenantId: { type: String },
    ownerId: { type: String },
    isCompany: { type: Boolean, default: false },
    currency: { type: String, default: "INR" },
    balance: { type: Number, required: true, default: 0 },
    holdAmount: { type: Number, required: true, default: 0 },
    walletCode: { type: String, unique: true },
    transactions: [
      {
        type: {
          type: String,
          required: true,
          validate: {
            validator: validateTransactionType,
            message: (props) =>
              `${props.value} is not a valid transaction type`,
          },
        },
        bucket: {
          type: String,
          enum: ["AVAILABLE", "HOLD"],
        },
        effect: {
          type: String,
          enum: ["CREDITED", "DEBITED", "NONE"],
        },
        walletId: { type: String },
        // interviewId: { type: String },
        // roundId: { type: String },
        amount: { type: Number, required: true },
        gstAmount: { type: Number, default: 0 },
        serviceCharge: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        description: { type: String },
        reason: { type: String },
        relatedInvoiceId: { type: String, required: false },
        status: {
          type: String,
          default: "completed",
          validate: {
            validator: validateTransactionStatus,
            message: (props) =>
              `${props.value} is not a valid transaction status`,
          },
        },
        metadata: { type: mongoose.Schema.Types.Mixed },
        balanceBefore: { type: Number },
        balanceAfter: { type: Number },
        holdBalanceBefore: { type: Number },
        holdBalanceAfter: { type: Number },
        createdDate: { type: Date },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Add a pre-save hook to normalize values
WalletSchema.pre("save", function (next) {
  if (this.transactions && this.transactions.length) {
    // Normalize existing transactions (for backward compatibility)
    this.transactions.forEach((transaction) => {
      // Skip if transaction is not a valid object or already processed
      if (!transaction || typeof transaction !== "object") return;

      // Set type to lowercase if it exists
      if (transaction.type && typeof transaction.type === "string") {
        transaction.type = transaction.type.toLowerCase();
      }

      // Set status to lowercase if it exists
      if (transaction.status && typeof transaction.status === "string") {
        transaction.status = transaction.status.toLowerCase();
      }

      if (transaction.bucket && typeof transaction.bucket === "string") {
        transaction.bucket = transaction.bucket.toUpperCase();
      }

      if (transaction.effect && typeof transaction.effect === "string") {
        transaction.effect = transaction.effect.toUpperCase();
      }
    });
  }
  next();
});

module.exports = mongoose.model("Wallet", WalletSchema);
