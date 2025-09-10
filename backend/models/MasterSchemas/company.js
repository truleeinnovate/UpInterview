// v1.0.0 - Ashok - commented the code to implement master manipulations

const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    CompanyName: {
      type: String,
      required: true,
    },
    // v1.0.0 <-----------------------------------------
    // CreatedDate: {
    //   type: Date,
    //   default: Date.now,
    // },
    // CreatedBy: String,
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
    // v1.0.0 ----------------------------------------->
  },
  { timestamps: true }
);

// companySchema.pre("save", function (next) {
//   if (this.isNew) {
//     this.CreatedDate = Date.now();
//   }
//   next();
// });

// v1.0.0 <-------------------------------------------------------------
// const Company = mongoose.model("Company", companySchema);
const Company =
  mongoose.models.Company || mongoose.model("Company", companySchema);
// v1.0.0 ------------------------------------------------------------->

module.exports = { Company };
