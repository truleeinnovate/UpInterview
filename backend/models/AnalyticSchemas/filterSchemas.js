const mongoose = require("mongoose");
const { Schema } = mongoose;

// =============================================================================
// FILTER PRESET SCHEMA - Saved filter combinations
// =============================================================================
const filterPresetSchema = new Schema(
  {
    // tenantId: {type: mongoose.Schema.Types.ObjectId},
      // ownerId: {
      //   type: String,
      //   required: true,
      //   index: true,
      // },
    // presetId: {
    //   type: String,
    //   required: true,
    //   index: true,
    // },
    templateId: {type: mongoose.Schema.Types.ObjectId},

    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,

    // Basic Filters
    basicFilters: {
      interviewType: {
        type: String,
        enum: ["all", "internal", "external"],
        default: "all",
      },
      candidateStatus: {
        type: String,
        enum: ["all", "active", "inactive", "cancelled"],
        default: "all",
      },
      position: {
        type: String,
        default: "all",
      },
      interviewer: {
        type: String,
        default: "all",
      },
      organization: String,
      dateRange: {
        type: String,
        enum: [
          "today",
          "yesterday",
          "last7days",
          "last30days",
          "last90days",
          "thisMonth",
          "lastMonth",
          "thisYear",
          "custom",
        ],
        default: "last30days",
      },
      customStartDate: Date,
      customEndDate: Date,
    },

    // Advanced Filters
    advancedFilters: [
      {
        id: String,
        field: {
          type: String,
          required: true,
        },
        operator: {
          type: String,
          enum: [
            "equals",
            "not_equals",
            "contains",
            "starts_with",
            "ends_with",
            "greater_than",
            "less_than",
            "between",
            "in",
            "not_in",
            "exists",
            "not_exists",
          ],
          required: true,
        },
        value: Schema.Types.Mixed,
        logic: {
          type: String,
          enum: ["AND", "OR"],
          default: "AND",
        },
      },
    ],

    // Context where filter applies
    context: {
      page: {
        type: String,
        enum: [
          "dashboard",
          "reports",
          "trends",
          "interviews",
          "interviewers",
          "assessments",
          "candidates",
        ],
        required: true,
      },
      reportType: String, // For report-specific filters
    },

    // Usage Statistics
    usage: {
      count: {
        type: Number,
        default: 0,
      },
      lastUsed: Date,
      averageExecutionTime: Number, // milliseconds
    },

    // Sharing
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [String], // User IDs

    // System flags
    isDefault: {
      type: Boolean,
      default: false,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },

    tags: [String],
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  },
  {
    timestamps: true,
  }
);

// Indexes
filterPresetSchema.index({ tenantId: 1 });
filterPresetSchema.index({ tenantId: 1, presetId: 1 }, { unique: true });
filterPresetSchema.index({ tenantId: 1, "context.page": 1 });
filterPresetSchema.index({ tenantId: 1, isPublic: 1 });

// =============================================================================
// FILTER ANALYTICS SCHEMA - Track filter usage patterns
// =============================================================================
// const filterAnalyticsSchema = new Schema(
//   {
//     tenantId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     ownerId: String,
//     sessionId: String,

//     // Filter Application Event
//     event: {
//       type: {
//         type: String,
//         enum: [
//           "filter_applied",
//           "filter_cleared",
//           "preset_used",
//           "preset_saved",
//         ],
//         required: true,
//       },
//       timestamp: {
//         type: Date,
//         default: Date.now,
//         index: true,
//       },
//     },

//     // Context Information
//     context: {
//       page: String,
//       reportType: String,
//       userAgent: String,
//       ipAddress: String,
//     },

//     // Applied Filters
//     filters: {
//       basic: Schema.Types.Mixed,
//       advanced: Schema.Types.Mixed,
//       presetId: String,
//       presetName: String,
//     },

//     // Performance Metrics
//     performance: {
//       executionTime: Number, // milliseconds
//       resultCount: Number,
//       queryComplexity: Number,
//     },

//     // Results
//     results: {
//       success: {
//         type: Boolean,
//         default: true,
//       },
//       errorMessage: String,
//       dataReturned: Number,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes for analytics
// filterAnalyticsSchema.index({ tenantId: 1, "event.timestamp": -1 });
// filterAnalyticsSchema.index({ tenantId: 1, ownerId: 1, "event.timestamp": -1 });
// filterAnalyticsSchema.index({ tenantId: 1, "context.page": 1 });

// // =============================================================================
// // FILTER FIELD CONFIGURATION SCHEMA - Available filter fields per report type
// // =============================================================================
// const filterFieldConfigSchema = new Schema(
//   {
//     tenantId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     reportType: {
//       type: String,
//       required: true,
//       enum: [
//         "interview",
//         "interviewer",
//         "assessment",
//         "candidate",
//         "organization",
//         "dashboard",
//         "trends",
//       ],
//     },

//     // Available Filter Fields
//     fields: [
//       {
//         key: {
//           type: String,
//           required: true,
//         },
//         label: {
//           type: String,
//           required: true,
//         },
//         type: {
//           type: String,
//           enum: [
//             "text",
//             "number",
//             "date",
//             "select",
//             "multiselect",
//             "boolean",
//             "range",
//           ],
//           required: true,
//         },
//         description: String,

//         // For select/multiselect fields
//         options: [String],

//         // For number/date fields
//         validation: {
//           min: Schema.Types.Mixed,
//           max: Schema.Types.Mixed,
//           step: Number,
//         },

//         // Available operators for this field
//         operators: [
//           {
//             type: String,
//             enum: [
//               "equals",
//               "not_equals",
//               "contains",
//               "starts_with",
//               "ends_with",
//               "greater_than",
//               "less_than",
//               "between",
//               "in",
//               "not_in",
//               "exists",
//               "not_exists",
//             ],
//           },
//         ],

//         // Field properties
//         isRequired: {
//           type: Boolean,
//           default: false,
//         },
//         isVisible: {
//           type: Boolean,
//           default: true,
//         },
//         order: {
//           type: Number,
//           default: 0,
//         },

//         // Database mapping
//         dbField: String, // Actual database field name
//         collection: String, // Which collection this field belongs to

//         // Custom field properties
//         isCustom: {
//           type: Boolean,
//           default: false,
//         },
//         calculation: String, // For calculated fields
//         dependencies: [String], // Other fields this depends on
//       },
//     ],

//     // Default filter configuration
//     defaultFilters: [
//       {
//         field: String,
//         operator: String,
//         value: Schema.Types.Mixed,
//       },
//     ],

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes
// filterFieldConfigSchema.index({ tenantId: 1, reportType: 1 }, { unique: true });

module.exports = {
  FilterPreset: mongoose.model("FilterPreset", filterPresetSchema),
  // FilterAnalytics: mongoose.model("FilterAnalytics", filterAnalyticsSchema),
  // FilterFieldConfig: mongoose.model(
  //   "FilterFieldConfig",
  //   filterFieldConfigSchema
  // ),
};
