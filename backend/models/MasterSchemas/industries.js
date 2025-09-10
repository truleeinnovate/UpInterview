// v1.0.0 - Ashok - Added fields
// v1.0.1 - Ashok - Removed Tenant field

const mongoose = require("mongoose");

const IndustrySchema = new mongoose.Schema(
  {
    IndustryName: {
      type: String,
      required: true,
    },
    // v1.0.0 <-------------------------------------------------------
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      default: null,
    },
  },
  { timestamps: true }
  // v1.0.0 ------------------------------------------------------->
);

const Industry = mongoose.model("Industry", IndustrySchema);

module.exports = { Industry };
