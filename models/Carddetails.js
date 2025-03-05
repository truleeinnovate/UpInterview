
const mongoose  = require("mongoose");


const cardSchema = new mongoose.Schema({
  cardHolderName: { type: String, required: true },
  cardNumber: { type: String, required: true },
  cardexpiry: { type: String, required: true },
  cvv: { type: String, required: true },
  country: { type: String },
  zipCode: { type: String },
  status: { type: String, default: 'pending' },
  currency: { type: String, required: true },
}, { _id: false }); 

const paymentSchema = new mongoose.Schema({
  tenantId: { type: String},
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cards: [cardSchema], // Array of card objects
}, { timestamps: true });


const PaymentCard = mongoose.model('CardPayment', paymentSchema);

module.exports = PaymentCard;
