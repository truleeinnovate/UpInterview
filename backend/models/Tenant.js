const mongoose = require("mongoose");

// Ranjith added OrganizationSchema
const TenantSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: String },
    // username: { type: String },
    jobTitle: { type: String },
    company: { type: String },
    employees: { type: String },
    country: { type: String },
    type: { type: String, enum: ["organization", "individual"] },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    profileId: { type: String },
    website: { type: String },
    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "submitted",
        "payment_pending",
        "created",
        "cancelled",
        "draft",
      ],
      default: "draft",
    },
    //need to add boolean value for individaul pages wich page is submitted

    // Company Details
    industry: { type: String }, // added
    description: { type: String }, // added
    location: { type: String }, // added

    // Social Media
    socialMedia: {
      linkedin: { type: String },
      twitter: { type: String },
      facebook: { type: String },
    },

    // Branding Section
    // branding: {                         // ✅ added branding field
    //   logo: { type: String },           // ✅ logo field inside branding
    // },

    branding: {
      filename: String,
      path: String,
      contentType: String,
      publicId: String,
    },

    // Office Details
    offices: [
      // added
      {
        id: { type: Number },
        type: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        zip: { type: String },
        phone: { type: String },
      },
    ],
    subdomain: { type: String },
    fullDomain: { type: String },
    subdomainStatus: { type: String },
    subdomainAddedDate: { type: Date },
    subdomainLastVerified: { type: Date },
    usersBandWidth: { type: Number },
    totalUsers: { type: Number },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", TenantSchema);

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

// const mongoose = require('mongoose');

// const TenantSchema = new mongoose.Schema({
//   name: { type: String, required: true }, // Org or Individual name
//   type: { type: String, enum: ['organization', 'individual'], required: true },
//   subdomain: { type: String, unique: true },
//   domainEnabled: { type: Boolean, default: false },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
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
