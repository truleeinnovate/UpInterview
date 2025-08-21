//<----v1.0.0----Venkatesh------add boolean type
const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  label:String,
  name: { type: String },
  ownerId: { type: String },
  tenantId: String,
  type: { type: Boolean },//<----v1.0.0----
});

module.exports = mongoose.models.TenantQuestionsListNames || mongoose.model('TenantQuestionsListNames', listSchema);