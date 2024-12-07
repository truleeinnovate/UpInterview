const mongoose = require('mongoose');

const LinkedInDetailsSchema = new mongoose.Schema({
  linkedInId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  profilePicture: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('LinkedInDetails', LinkedInDetailsSchema);