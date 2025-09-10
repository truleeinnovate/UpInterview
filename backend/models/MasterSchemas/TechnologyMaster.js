// v1.0.0 - Ashok - Added Category field
// v1.0.1 - Ashok - Added fields

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TechnologyMasterSchema = new Schema(
  {
    TechnologyMasterName: {
      type: String,
      required: true,
    },
    // v1.0.0 <------------------------------------
    Category: {
      type: String,
      required: true,
    },
    // v1.0.0 ------------------------------------>
    // v1.0.1 <---------------------------------------------------
    // CreatedDate: {
    //   type: Date,
    //   required: true,
    //   default: Date.now,
    // },
    // CreatedBy: {
    //   type: String,
    //   required: true,
    // },
    // ModifiedDate: {
    //   type: Date,
    //   default: Date.now,
    // },
    // ModifiedBy: {
    //   type: String,
    // },
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
  {
    collection: "TechnologyMaster", // 👈 Exact collection name in your DB
    timestamps: true,
  }
  // v1.0.1 --------------------------------------------------->
);

const TechnologyMaster = mongoose.model(
  "TechnologyMaster",
  TechnologyMasterSchema
);

module.exports = { TechnologyMaster };
