// v1.0.0 - Ashok - Added fields
// v1.0.1 - Ashok - Removed Tenant field

const mongoose = require("mongoose");

const CategoryMasterSchema = new mongoose.Schema(
  {
    CategoryName: { type: String, unique: true, required: true, index: true },
    isActive: { type: Boolean, default: true },
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
    // v1.0.0 ------------------------------------------------------->
  },
  {
    timestamps: true,
    collection: "CategoryMaster",
  }
);

const CategoryMaster = mongoose.model("CategoryMaster", CategoryMasterSchema);
module.exports = { CategoryMaster };
