const mongoose = require("mongoose");

// Define a custom validator for transaction types that's case-insensitive
const validateTransactionType = function (value) {
  const validTypes = ["credit", "debit", "hold"];
  return validTypes.includes(value.toLowerCase());
};

// Define a custom validator for transaction status that's case-insensitive
const validateTransactionStatus = function (value) {
  const validStatuses = ["pending", "completed", "failed"];
  return validStatuses.includes(value.toLowerCase());
};

const WalletSchema = new mongoose.Schema(
  {
    tenantId: { type: String },
    ownerId: String,
    balance: { type: Number, required: true, default: 0 },
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
        amount: { type: Number, required: true },
        description: { type: String },
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
    });
  }
  next();
});

module.exports = mongoose.model("Wallet", WalletSchema);
