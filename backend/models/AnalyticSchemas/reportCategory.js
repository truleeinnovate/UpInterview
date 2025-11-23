// =============================================================================
// REPORT CATEGORY SCHEMA - Categories/Folders for report templates
// =============================================================================
const reportCategorySchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    categoryId: {
      // Human-readable unique identifier (same pattern as templateId, configId, etc.)
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    icon: String,        // optional - for UI (e.g. "bar-chart", "users", "folder")
    color: String,       // optional - tailwind/hex color for UI
    order: {
      type: Number,
      default: 0,
    },
    isSystem: {
      // true = seeded standard categories (cannot be deleted/renamed by users)
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      // userId who created it (null or "system" for standard ones)
      type: String,
      default: null,
    },
    isPublic: {
      // if false → only creator + admins can see/use it (optional extra control)
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique categoryId per tenant (same pattern you already use everywhere)
reportCategorySchema.index({ tenantId: 1, categoryId: 1 }, { unique: true });
reportCategorySchema.index({ tenantId: 1, isSystem: 1 });
reportCategorySchema.index({ tenantId: 1, order: 1 });

// Virtual to get report count (useful for UI)
reportCategorySchema.virtual("reportCount", {
  ref: "ReportTemplate",
  localField: "_id",
  foreignField: "category",
  count: true,
});

module.exports.ReportCategory = mongoose.model("ReportCategory", reportCategorySchema);