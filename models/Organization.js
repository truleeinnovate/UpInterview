// const mongoose = require('mongoose');

// const OrganizationSchema = new mongoose.Schema({
//     firstname: String
// });

// const Organization = mongoose.model('Organization', OrganizationSchema);

// module.exports = { Organization };

const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  firstName: { type: String},
  lastName: { type: String},
  Email: { type: String },
  Phone: { type: String },
  username: { type: String },
  jobTitle: { type: String},
  company: { type: String },
  employees: { type: String },
  country: { type: String },
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
