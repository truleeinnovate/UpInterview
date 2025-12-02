// models/AnalyticSchemas/reportCategory.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const reportCategorySchema = new Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
  name:       { type: String, required: true, trim: true },
  label:      { type: String, required: true, trim: true },
  description: String,
  icon:       { type: String, default: "folder" },
  color:      { type: String, default: "#6366f1" },
  order:      { type: Number, default: 0 },
  isSystem:   { type: Boolean, default: false, index: true },
  createdBy:  { type: String, default: "system" }
}, { timestamps: true });

module.exports = mongoose.model("ReportCategory", reportCategorySchema);