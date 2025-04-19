const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  // username: { type: String, required: true },
  profileId: { type: String },//changed username to profileId
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  employees: { type: String, required: true },
  country: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
}, { timestamps: true });



const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = { Organization};