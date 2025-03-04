const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  Email: { type: String },
  Phone: { type: String },
  username: { type: String },
  jobTitle: { type: String },
  company: { type: String },
  employees: { type: String },
  country: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  CreatedDate: { type: Date, default: Date.now },
});

const Organization = mongoose.model('Organization', OrganizationSchema);
module.exports = { Organization};