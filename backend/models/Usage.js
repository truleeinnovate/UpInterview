const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  usageAttributes: [{
    entitled: { type: Number, required: true },// limit
    type: { type: String, required: true },// Assessment, InternalInterviewer, OutsourceInterviewer
    utilized: { type: Number, required: true, default: 0 },//
    remaining: { type: Number, required: true, default: 0 }
  }],
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }
});

module.exports = mongoose.model('Usage', UsageSchema);
