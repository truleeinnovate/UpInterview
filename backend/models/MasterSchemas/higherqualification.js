// v1.0.0 - Ashok - commented the code to implement master manipulations
// v1.0.1 - Ashok - Added fields

const mongoose = require("mongoose");

const qualificationSchema = new mongoose.Schema(
  {
    QualificationName: {
      type: String,
      required: true,
    },
    // v1.0.1 <------------------------------------------------------
    // CreatedDate: {
    //   type: Date,
    //   default: Date.now,
    // },
    // CreatedBy: String,
    // ModifiedDate: Date,
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
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
    },
  },
  { timestamps: true }
  // v1.0.1 ------------------------------------------------------>
);

// qualificationSchema.pre("save", function (next) {
//   if (this.isNew) {
//     this.CreatedDate = Date.now();
//   }
//   next();
// });

// v1.0.0 <---------------------------------------------------------------------------------------
// const HigherQualification = mongoose.model("HigherQualification", qualificationSchema);
const HigherQualification =
  mongoose.models.HigherQualification ||
  mongoose.model("HigherQualification", qualificationSchema);
// v1.0.0 --------------------------------------------------------------------------------------->

module.exports = { HigherQualification };
