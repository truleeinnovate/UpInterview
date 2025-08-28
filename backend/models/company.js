// v1.0.0 - Ashok - commented the code to implement master manipulations
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  CompanyName: {
    type: String,
    required: true,
  },
  CreatedDate: {
    type: Date,
    default: Date.now,
  },
  CreatedBy: String,
});

companySchema.pre("save", function (next) {
  if (this.isNew) {
    this.CreatedDate = Date.now();
  }
  next();
});

// v1.0.0 <-------------------------------------------------------------
// const Company = mongoose.model("Company", companySchema);
const Company =
  mongoose.models.Company || mongoose.model("Company", companySchema);
// v1.0.0 ------------------------------------------------------------->

module.exports = { Company };
