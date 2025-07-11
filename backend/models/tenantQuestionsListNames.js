
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  label:String,
  name: { type: String },
  ownerId: { type: String },
  tenantId: String,
});

module.exports = mongoose.models.TenantQuestionsListNames || mongoose.model('TenantQuestionsListNames', listSchema);