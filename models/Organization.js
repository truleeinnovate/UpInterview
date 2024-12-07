const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  Email: { type: String, required: true },
  Phone: { type: String },
  username: { type: String, required: true },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  employees: { type: String, required: true },
  country: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  CreatedDate: { type: Date, default: Date.now },
});

const OrganizationHistorySchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
  firstName: String,
  lastName: String,
  Email: String,
  Phone: String,
  username: String,
  jobTitle: String,
  company: String,
  employees: String,
  country: String,
  ModifiedDate: { type: Date, default: Date.now },
  ModifiedBy: String,
});

const Organization = mongoose.model('Organization', OrganizationSchema);
const OrganizationHistory = mongoose.model('OrganizationHistory', OrganizationHistorySchema);

module.exports = { Organization, OrganizationHistory };