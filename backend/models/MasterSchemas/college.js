// v1.0.0 - Ashok - Added fields

const mongoose = require("mongoose");

const University_CollegeSchema = new mongoose.Schema(
  {
    University_CollegeName: {
      type: String,
      required: true,
    },
    // v1.0.0 <----------------------------------------------
    //   CreatedDate: {
    //     type: Date,
    //     default: Date.now,
    //   },
    //   CreatedBy: String,
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
    // v1.0.0 ---------------------------------------------->
  },
  {
    timestamps: true,
  }
);

// University_CollegeSchema.pre("save", function (next) {
//   if (this.isNew) {
//     this.CreatedDate = Date.now();
//   }
//   next();
// });

const University_CollegeName = mongoose.model(
  "University_CollegeName",
  University_CollegeSchema
);

module.exports = { University_CollegeName };
