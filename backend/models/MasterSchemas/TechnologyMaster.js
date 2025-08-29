// v1.0.0 - Ashok - Added Category field
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
    CreatedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    CreatedBy: {
      type: String,
      required: true,
    },
    ModifiedDate: {
      type: Date,
      default: Date.now,
    },
    ModifiedBy: {
      type: String,
    },
  },
  {
    collection: "TechnologyMaster", // 👈 Exact collection name in your DB
  }
);

const TechnologyMaster = mongoose.model(
  "TechnologyMaster",
  TechnologyMasterSchema
);

module.exports = { TechnologyMaster };
