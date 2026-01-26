// Created by Ashok

const mongoose = require("mongoose");

const TenantCompanySchema = new mongoose.Schema(
  {
    name: { type: String },
    industry: { type: String },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },
    website: { type: String },
    primaryContactName: { type: String },
    primaryContactEmail: { type: String },
    description: { type: String },
    address: {
      addressLineOne: { type: String },
      addressLineTwo: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zip: { type: String },
    },
  },
  { timestamps: true },
);

const TenantCompany = mongoose.model("TenantCompany", TenantCompanySchema);

module.exports = {
  TenantCompany,
};
