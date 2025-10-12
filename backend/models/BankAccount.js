const mongoose = require("mongoose");

const BankAccountSchema = new mongoose.Schema(
  {
    // User/Owner information
    tenantId: { type: String },
    ownerId: { type: String, required: true },
    
    // Account holder information
    accountHolderName: { type: String, required: true },
    
    // Bank account details
    bankName: { type: String, required: true },
    accountType: {
      type: String,
      enum: ["savings", "checking", "current"],
      default: "savings"
    },
    accountNumber: { type: String, required: true },
    routingNumber: { type: String }, // For US banks (ACH)
    ifscCode: { type: String }, // For Indian banks
    swiftCode: { type: String }, // For international transfers
    
    // Additional bank details
    branchName: { type: String },
    bankAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    
    // Razorpay specific fields
    razorpayFundAccountId: { type: String }, // Razorpay's fund account ID after verification
    razorpayContactId: { type: String }, // Razorpay's contact ID for this account holder
    
    // Account status and verification
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "failed", "inactive"],
      default: "pending"
    },
    verificationDate: { type: Date },
    verificationMethod: { type: String }, // penny drop, manual, etc.
    
    // Default account flag
    isDefault: { type: Boolean, default: false },
    
    // Security and compliance
    isActive: { type: Boolean, default: true },
    lastUsedDate: { type: Date },
    
    // Metadata
    metadata: { type: mongoose.Schema.Types.Mixed },
    notes: { type: String },
    
    // Masked account number for display
    maskedAccountNumber: { type: String },
    
    // Timestamps
    createdBy: { type: String },
    updatedBy: { type: String }
  },
  { 
    timestamps: true 
  }
);

// Indexes for faster queries
BankAccountSchema.index({ ownerId: 1, isActive: 1 });
BankAccountSchema.index({ razorpayFundAccountId: 1 });
BankAccountSchema.index({ ownerId: 1, isDefault: 1 });

// Pre-save hook to mask account number
BankAccountSchema.pre("save", function(next) {
  if (this.accountNumber && !this.maskedAccountNumber) {
    const accountLength = this.accountNumber.length;
    if (accountLength > 4) {
      this.maskedAccountNumber = "••••" + this.accountNumber.slice(-4);
    } else {
      this.maskedAccountNumber = "••••";
    }
  }
  
  // Ensure only one default account per owner
  if (this.isDefault) {
    this.constructor.updateMany(
      { ownerId: this.ownerId, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    ).exec();
  }
  
  next();
});

// Method to get display name
BankAccountSchema.methods.getDisplayName = function() {
  return `${this.bankName} - ${this.maskedAccountNumber}`;
};

// Method to check if account can be used for withdrawals
BankAccountSchema.methods.canWithdraw = function() {
  return this.isActive && this.isVerified && this.verificationStatus === "verified";
};

// Static method to get default account
BankAccountSchema.statics.getDefaultAccount = async function(ownerId) {
  return this.findOne({ 
    ownerId, 
    isDefault: true, 
    isActive: true,
    isVerified: true,
    verificationStatus: "verified"
  });
};

// Static method to get all active accounts
BankAccountSchema.statics.getActiveAccounts = async function(ownerId) {
  return this.find({ 
    ownerId, 
    isActive: true 
  }).sort({ isDefault: -1, _id: -1 });
};

module.exports = mongoose.model("BankAccount", BankAccountSchema);
