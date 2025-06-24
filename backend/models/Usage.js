const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  usageAttributes: [{
    entitle: { type: String, required: true },
    type: { type: String, required: true },
    utilized: { type: Number, required: true, default: 0 },
    remaining: { type: Number, required: true }
  }],
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }
});

module.exports = mongoose.model('Usage', UsageSchema);
