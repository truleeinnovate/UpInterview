// v1.0.0 - Ashok - Added fields

const mongoose = require("mongoose");

const RoleMasterSchema = new mongoose.Schema(
  {
    RoleName: { type: String, required: true },
    // v1.0.0 <-------------------------------------------------------
    // CreatedDate: { type: Date, default: Date.now },
    // CreatedBy: String,
    // ModifiedDate: { type: Date, default: Date.now },
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
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },
  },
  { timestamps: true }
  // v1.0.0 ------------------------------------------------------->
);

const RoleMaster = mongoose.model("rolemasters", RoleMasterSchema);
module.exports = { RoleMaster };
