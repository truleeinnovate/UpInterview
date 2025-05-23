const mongoose = require("mongoose");

// Schema for individual card details - simplified for recurring payments
const cardSchema = new mongoose.Schema({
  // Basic card identification (populated from Razorpay)
  cardNumber: { type: String },     // Last 4 digits only
  cardBrand: { type: String },      // Card brand (Visa, Mastercard, etc.)
  cardType: { type: String },       // Card type (credit, debit, etc.)
  
  // Payment status
  status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },
  currency: { type: String, default: 'USD' },
  
  // CRITICAL FIELDS FOR RECURRING PAYMENTS
  razorpayTokenId: { type: String, required: true },  // Token ID for auto-debit
  razorpayCustomerId: { type: String },               // Customer ID in Razorpay
  
  // Reference fields
  razorpayPaymentId: { type: String }, // ID of the last payment
  
  // Tracking
  lastUsed: { type: Date, default: Date.now } // When the card was last used
}, { _id: false }); 

// Schema for payment card records
const paymentSchema = new mongoose.Schema({
  tenantId: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cards: [cardSchema], // Array of card objects
  lastPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' }, // Last plan purchased
  lastPaymentDate: { type: Date }, // Date of the last payment
  lastPaymentId: { type: String }, // ID of the last payment
  isDefault: { type: Boolean, default: false }, // Whether this is the default payment method
}, { timestamps: true });

const PaymentCard = mongoose.model('CardPayment', paymentSchema);

module.exports = PaymentCard;
