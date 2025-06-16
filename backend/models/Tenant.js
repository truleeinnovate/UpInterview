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
  profileId:{ type: String },
  website:{type:String},
  status: { type: String, enum: ['active', 'inactive','submitted','payment_pending','created','cancelled', ], default: 'draft' },
  isEmailVerified: { type: Boolean, default: false },
//need to add boolean value for individaul pages wich page is submitted

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

}, { timestamps: true });

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = { Organization};



// const mongoose = require('mongoose');
 
// const TenantSchema = new mongoose.Schema({
//   name: { type: String, required: true }, // Org or Individual name
//   type: { type: String, enum: ['organization', 'individual'], required: true },
 
//   subdomain: { type: String, unique: true, required: true }, // e.g., abc.interview.app
//   domainEnabled: { type: Boolean, default: false },
 
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Creator
 
//   email: { type: String, required: true },
//   phone: { type: String },
//   country: { type: String },
//   timezone: { type: String },
 
//   // Plan & Billing
//   plan: { type: String, enum: ['basic', 'advanced', 'enterprise'], default: 'basic' },
//   planStatus: { type: String, enum: ['trial', 'active', 'expired', 'cancelled'], default: 'trial' },
//   trialEndsAt: { type: Date },
//   subscriptionId: { type: String }, // Stripe or payment gateway ID
 
//   // Limits
//   usageLimits: {
//     assessments: { type: Number, default: 5 },
//     interviews: { type: Number, default: 5 },
//     users: { type: Number, default: 5 },
//     bandwidthMB: { type: Number, default: 10 },
//     internalInterviewers: { type: Number, default: 5 }
//   },
 
//   // Status & Metadata
//   status: { type: String, enum: ['active', 'pending', 'suspended', 'expired'], default: 'active' },
//   createdAt: { type: Date, default: Date.now },
//   updatedAt: { type: Date, default: Date.now },
//   lastActiveAt: { type: Date },
//   notes: { type: String }
// });
 
// module.exports = mongoose.model('Tenant', TenantSchema);