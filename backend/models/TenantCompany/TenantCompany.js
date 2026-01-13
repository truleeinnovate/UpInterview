// Created by Ashok

const mongoose = require("mongoose");

const TenantCompanySchema = new mongoose.Schema(
  {
    name: { type: String },
    industry: { type: String },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  },
  { timestamps: true }
);

const TenantCompany = mongoose.model("TenantCompany", TenantCompanySchema);

module.exports = {
  TenantCompany,
};
