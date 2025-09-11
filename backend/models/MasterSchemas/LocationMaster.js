// v1.0.0 - Ashok - Added fields
// v1.0.1 - Ashok - Removed Tenant field

const mongoose = require("mongoose");

const LocationMasterSchema = new mongoose.Schema(
  {
    LocationName: { type: String, unique: true, required: true },
    // TimeZone: String,
    // v1.0.0 <---------------------------------------------
    // CreatedBy: String,
    // ModifiedBy: String,
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
  {
    collection: "LocationMaster",
    timestamps: true,
  }
  // v1.0.0 --------------------------------------------->
);

const LocationMaster = mongoose.model("LocationMaster", LocationMasterSchema);
module.exports = { LocationMaster };
