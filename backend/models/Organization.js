const mongoose = require('mongoose');

// Ranjith added OrganizationSchema
const OrganizationSchema = new mongoose.Schema({

  // Basic Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  // username: { type: String, required: true },
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  employees: { type: String, required: true },
  country: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  CreatedDate: { type: Date, default: Date.now },
  profileId:{ type: String },

  // Company Details
  industry: { type: String },         // added
  description: { type: String },      // added
  location: { type: String },         // added

  // Social Media
  socialMedia: {
    linkedin: { type: String },
    twitter: { type: String },
    facebook: { type: String }
  },

  // Branding Section
  branding: {                         // ✅ added branding field
    logo: { type: String },           // ✅ logo field inside branding
  },

  // Office Details
  offices: [                          // added
    {
      id: { type: Number },
      type: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zip: { type: String },
      phone: { type: String }
    }
  ],
  subdomain: { type: String },
  fullDomain: { type: String },
  subdomainStatus: { type: String },
  subdomainAddedDate: { type: Date },
  subdomainLastVerified: { type: Date }

});

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = { Organization};