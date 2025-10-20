const mongoose = require("mongoose");

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    // Request identification
    withdrawalCode: { 
      type: String, 
      required: true, 
      unique: true 
    },
    
    // User/Owner information
    tenantId: { type: String },
    ownerId: { 
      type: String, 
      required: true 
    },
    
    // Amount details
    amount: { 
      type: Number, 
      required: true,
      min: 1 // Minimum withdrawal amount
    },
    currency: { 
      type: String, 
      default: "INR" 
    },
    
    // Bank account reference
    bankAccountId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "BankAccount",
      required: true 
    },
    
    // Withdrawal status tracking
    status: {
      type: String,
      enum: [
        "pending",          // Initial request
        "processing",       // Being processed
        "queued",          // Queued for payout
        "initiated",       // Payout initiated with Razorpay
        "completed",       // Successfully transferred
        "failed",          // Transfer failed
        "cancelled",       // Cancelled by user
        "reversed",        // Reversed/Refunded
        "on_hold"          // On hold for review
      ],
      default: "pending"
    },
    
    // Razorpay payout details
    razorpayPayoutId: { type: String },
    razorpayFundAccountId: { type: String },
    razorpayContactId: { type: String },
    razorpayReferenceId: { type: String },
    razorpayUtr: { type: String }, // Unique Transaction Reference for bank transfers
    
    // Processing details
    processedAt: { type: Date },
    completedAt: { type: Date },
    failedAt: { type: Date },
    cancelledAt: { type: Date },
    
    // Fee and net amount
    processingFee: { 
      type: Number, 
      default: 0 
    },
    tax: { 
      type: Number, 
      default: 0 
    },
    netAmount: { type: Number }, // Amount after fees
    
    // Failure/Cancellation details
    failureReason: { type: String },
    cancellationReason: { type: String },
    
    // Processing mode
    mode: {
      type: String,
      enum: ["IMPS", "NEFT", "RTGS", "UPI", "card", "manual"],
      default: "manual" // Changed default to manual for superadmin processing
    },
    
    // Expected timeline
    expectedCompletionDate: { type: Date },
    actualCompletionDate: { type: Date },
    
    // Wallet transaction reference
    walletTransactionId: { type: String },
    
    // Admin review
    requiresReview: { 
      type: Boolean, 
      default: false 
    },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
    
    // IP and security tracking
    requestIp: { type: String },
    userAgent: { type: String },
    
    // Retry information
    retryCount: { 
      type: Number, 
      default: 0 
    },
    lastRetryAt: { type: Date },
    
    // Metadata
    metadata: { type: mongoose.Schema.Types.Mixed },
    notes: { type: String },
    
    // Timestamps
    createdBy: { type: String },
    updatedBy: { type: String }
  },
  { 
    timestamps: true,
    collection: 'withdrawalrequests' // Explicitly set to match your MongoDB collection
  }
);

// Indexes
WithdrawalRequestSchema.index({ ownerId: 1, status: 1 });
WithdrawalRequestSchema.index({ withdrawalCode: 1 });
WithdrawalRequestSchema.index({ razorpayPayoutId: 1 });
WithdrawalRequestSchema.index({ status: 1, createdAt: -1 });
WithdrawalRequestSchema.index({ ownerId: 1, createdAt: -1 });

// Pre-save hook to generate withdrawal code (as fallback) and set other defaults
WithdrawalRequestSchema.pre("save", async function(next) {
  // Only generate if not already provided (fallback mechanism)
  if (!this.withdrawalCode) {
    const lastWithdrawal = await this.constructor.findOne({})
      .sort({ _id: -1 })
      .select("withdrawalCode")
      .lean();
    
    let nextNumber = 50001; // Start from 50001
    if (lastWithdrawal && lastWithdrawal.withdrawalCode) {
      const match = lastWithdrawal.withdrawalCode.match(/WD-(\d+)/);
      if (match) {
        const lastNumber = parseInt(match[1], 10);
        nextNumber = lastNumber >= 50001 ? lastNumber + 1 : 50001;
      }
    }
    this.withdrawalCode = `WD-${String(nextNumber).padStart(6, "0")}`;
  }
  
  // Calculate net amount if not set
  if (!this.netAmount && this.amount) {
    this.netAmount = this.amount - (this.processingFee || 0) - (this.tax || 0);
  }
  
  // Set expected completion date based on mode
  if (!this.expectedCompletionDate && this.mode) {
    const now = new Date();
    switch(this.mode) {
      case "IMPS":
        this.expectedCompletionDate = new Date(now.getTime() + 30 * 60000); // 30 minutes
        break;
      case "UPI":
        this.expectedCompletionDate = new Date(now.getTime() + 15 * 60000); // 15 minutes
        break;
      case "NEFT":
        this.expectedCompletionDate = new Date(now.getTime() + 2 * 3600000); // 2 hours
        break;
      case "RTGS":
        this.expectedCompletionDate = new Date(now.getTime() + 1 * 3600000); // 1 hour
        break;
      case "manual":
        this.expectedCompletionDate = new Date(now.getTime() + 48 * 3600000); // 48 hours for manual processing
        break;
      default:
        this.expectedCompletionDate = new Date(now.getTime() + 24 * 3600000); // 24 hours
    }
  }
  
  next();
});

// Method to check if withdrawal can be cancelled
WithdrawalRequestSchema.methods.canCancel = function() {
  return ["pending", "queued"].includes(this.status);
};

// Method to check if withdrawal can be retried
WithdrawalRequestSchema.methods.canRetry = function() {
  return this.status === "failed" && this.retryCount < 3;
};

// Static method to get pending withdrawals
WithdrawalRequestSchema.statics.getPendingWithdrawals = async function(ownerId) {
  return this.find({ 
    ownerId, 
    status: { $in: ["pending", "processing", "queued", "initiated"] }
  }).sort({ createdAt: -1 });
};

// Static method to get withdrawal summary
WithdrawalRequestSchema.statics.getWithdrawalSummary = async function(ownerId) {
  const result = await this.aggregate([
    { $match: { ownerId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" }
      }
    }
  ]);
  
  return result.reduce((acc, curr) => {
    acc[curr._id] = {
      count: curr.count,
      totalAmount: curr.totalAmount
    };
    return acc;
  }, {});
};

module.exports = mongoose.model("WithdrawalRequest", WithdrawalRequestSchema);
