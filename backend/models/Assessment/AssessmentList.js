const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema({
  categoryOrTechnology: String,
  name: { type: String, unique: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  type: {
    type: String,
    enum: ["custom", "standard"],
    default: "custom",
  },
});

module.exports =
  mongoose.models.AssessmentList ||
  mongoose.model("AssessmentList", ListSchema);
