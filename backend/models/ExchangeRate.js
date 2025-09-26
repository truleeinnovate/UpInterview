const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  baseCurrency: {
    type: String,
    required: true,
    default: 'USD'
  },
  targetCurrency: {
    type: String,
    required: true,
    default: 'INR'
  },
  rate: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

// Create a compound index to ensure only one rate per day
// exchangeRateSchema.index({ baseCurrency: 1, targetCurrency: 1, date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } }, { unique: true });

// Add a static method to get today's rate
// exchangeRateSchema.statics.getTodaysRate = async function(baseCurrency = 'USD', targetCurrency = 'INR') {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   return this.findOne({
//     baseCurrency,
//     targetCurrency,
//     date: { $gte: today }
//   }).sort({ date: -1 });
// };

// Add a static method to store today's rate
exchangeRateSchema.statics.storeTodaysRate = async function(rate, baseCurrency = 'USD', targetCurrency = 'INR') {
  return this.create({
    baseCurrency,
    targetCurrency,
    rate,
    date: new Date()
  });
};

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
