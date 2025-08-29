// v1.0.0 - Ashok - commented the code to implement master manipulations
const mongoose = require("mongoose");

const qualificationSchema = new mongoose.Schema({
  QualificationName: {
    type: String,
    required: true,
  },
  CreatedDate: {
    type: Date,
    default: Date.now,
  },
  CreatedBy: String,
  // ModifiedDate: Date,
  // ModifiedBy: String,
});

qualificationSchema.pre("save", function (next) {
  if (this.isNew) {
    this.CreatedDate = Date.now();
  }
  next();
});

// v1.0.0 <---------------------------------------------------------------------------------------
// const HigherQualification = mongoose.model("HigherQualification", qualificationSchema);
const HigherQualification =
  mongoose.models.HigherQualification ||
  mongoose.model("HigherQualification", qualificationSchema);
// v1.0.0 --------------------------------------------------------------------------------------->

module.exports = { HigherQualification };
