// v1.0.0 - Ashok - Added new fields
// v1.0.1 - Ashok - Removed Tenant field

const mongoose = require("mongoose");

const skillsSchema = new mongoose.Schema(
  {
    SkillName: {
      type: String,
      required: true,
    },
    // v1.0.0 <-------------------------------------------
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
    collection: "skills", // 👈 Use lowercase to match your actual collection name
    timestamps: true,
  }
  // v1.0.0 ------------------------------------------->
);

const Skills = mongoose.model("Skills", skillsSchema);

module.exports = { Skills };
