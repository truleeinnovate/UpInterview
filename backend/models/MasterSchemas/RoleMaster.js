// v1.0.0 - Ashok - Added fields
// v1.0.1 - Ashok - Removed Tenant field

const mongoose = require("mongoose");

const RoleMasterSchema = new mongoose.Schema(
  {
    roleName: { type: String, required: true },
    roleLabel: { type: String, required: true },
    roleCategory: { type: String, required: true },
    // v1.0.0 <-------------------------------------------------------
    // CreatedDate: { type: Date, default: Date.now },
    // CreatedBy: String,
    // ModifiedDate: { type: Date, default: Date.now },
    relatedRoles: [{ type: String }],
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

const RoleMaster = mongoose.model("rolemasters", RoleMasterSchema);
module.exports = { RoleMaster };
