const mongoose = require("mongoose");

const upinterviewEnterpriseContactSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String, required: true },
  workEmail: { type: String, required: true },
  jobTitle: { type: String, required: true },
  companyName: { type: String, required: true },
  companySize: { type: String, required: true },
  additionalDetails: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("upinterviewEnterpriseContact", upinterviewEnterpriseContactSchema);