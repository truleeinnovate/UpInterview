const mongoose = require("mongoose");
const { Schema } = mongoose;

// =============================================================================
// COLUMN CONFIGURATION SCHEMA - User column preferences per report type
// =============================================================================
// const columnConfigurationSchema = new Schema(
//   {
//     // tenantId: {
//     //   type: String,
//     //   required: true,
//     //   index: true,
//     // },
//     // ownerId: {
//     //   type: String,
//     //   required: true,
//     //   index: true,
//     // },
//     configId: {
//       type: String,
//       required: true,
//       index: true,
//     },

//     // Report/Table Type
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
//         "custom",
//       ],
//     },

//     // Column Configuration
//     columns: [
//       {
//         key: {
//           type: String,
//           required: true,
//         },
//         label: {
//           type: String,
//           required: true,
//         },
//         visible: {
//           type: Boolean,
//           default: true,
//         },
//         width: {
//           type: String,
//           default: "auto",
//           enum: [
//             "auto",
//             "100px",
//             "150px",
//             "200px",
//             "250px",
//             "300px",
//             "350px",
//             "400px",
//           ],
//         },
//         order: {
//           type: Number,
//           default: 0,
//         },
//         type: {
//           type: String,
//           enum: [
//             "text",
//             "number",
//             "date",
//             "select",
//             "array",
//             "object",
//             "boolean",
//           ],
//           default: "text",
//         },
//         sortable: {
//           type: Boolean,
//           default: true,
//         },
//         filterable: {
//           type: Boolean,
//           default: true,
//         },
//         render: String, // Custom render function name
//         description: String,
//         isCustom: {
//           type: Boolean,
//           default: false,
//         },

//         // For select type columns
//         options: [String],

//         // For custom columns
//         calculation: String, // Formula or aggregation
//         dataSource: String, // Source field or API endpoint

//         // Formatting options
//         format: {
//           dateFormat: String, // 'MM/DD/YYYY', 'DD/MM/YYYY', etc.
//           numberFormat: String, // 'currency', 'percentage', 'decimal'
//           precision: Number, // Decimal places
//           prefix: String, // Currency symbol, etc.
//           suffix: String, // Unit, percentage sign, etc.
//         },
//       },
//     ],

//     // Layout Settings
//     layout: {
//       type: {
//         type: String,
//         enum: ["table", "grid", "list", "kanban"],
//         default: "table",
//       },
//       density: {
//         type: String,
//         enum: ["compact", "normal", "comfortable"],
//         default: "normal",
//       },
//       showBorders: {
//         type: Boolean,
//         default: true,
//       },
//       showStripes: {
//         type: Boolean,
//         default: true,
//       },
//       stickyHeader: {
//         type: Boolean,
//         default: true,
//       },
//     },

//     // Sorting and Filtering
//     defaultSort: {
//       column: String,
//       direction: {
//         type: String,
//         enum: ["asc", "desc"],
//         default: "asc",
//       },
//     },

//     defaultFilters: [
//       {
//         column: String,
//         operator: String,
//         value: Schema.Types.Mixed,
//       },
//     ],

//     // Pagination
//     pagination: {
//       enabled: {
//         type: Boolean,
//         default: true,
//       },
//       pageSize: {
//         type: Number,
//         default: 25,
//         enum: [10, 25, 50, 100],
//       },
//     },

//     // Grouping Settings
//     grouping: {
//       enabled: {
//         type: Boolean,
//         default: false,
//       },
//       column: String, // Column to group by
//       expandedGroups: [String], // Which groups are expanded
//       showGroupCounts: {
//         type: Boolean,
//         default: true,
//       },
//       sortGroups: {
//         type: String,
//         enum: ["asc", "desc", "count_asc", "count_desc"],
//         default: "asc",
//       },
//     },

//     // Export Settings
//     exportSettings: {
//       includeHiddenColumns: {
//         type: Boolean,
//         default: false,
//       },
//       format: {
//         type: String,
//         enum: ["csv", "excel", "pdf", "json"],
//         default: "csv",
//       },
//     },
//     tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
//     updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
//   },
//   {
//     timestamps: true,
//   }
// );

const columnConfigurationSchema = new Schema({
  tenantId:   { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
  templateId: { type: Schema.Types.ObjectId, ref: "ReportTemplate", required: true },

  // USER'S COLUMN SELECTION (overrides report defaults)
  selectedColumns: [{
    key:     String, // "candidateName", "position", "interviewDate"
    label: { type: String, required: true },
    type: { type: String, default: "text" },
    visible: { type: Boolean, default: true },
    order:   { type: Number }, // user's preferred order
    width:   String // "150px", "auto"
  }],

  // LAYOUT PREFERENCES
  // layout: {
  //   density: { type: String, enum: ["compact", "normal", "comfortable"], default: "normal" },
  //   showBorders: { type: Boolean, default: true }
  // }
}, { timestamps: true });

columnConfigurationSchema.index({ tenantId: 1, templateId: 1 }, { unique: true });

// =============================================================================
// DASHBOARD LAYOUT SCHEMA - Dashboard widget positions and configurations
// =============================================================================
// const dashboardLayoutSchema = new Schema(
//   {
//     tenantId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     ownerId: {
//       type: String,
//       required: true,
//       index: true,
//     },
//     layoutId: {
//       type: String,
//       required: true,
//       index: true,
//     },

//     name: {
//       type: String,
//       default: "Default Layout",
//     },

//     // Grid Configuration
//     grid: {
//       columns: {
//         type: Number,
//         default: 12,
//       },
//       rowHeight: {
//         type: Number,
//         default: 60,
//       },
//       margin: {
//         x: { type: Number, default: 10 },
//         y: { type: Number, default: 10 },
//       },
//       containerPadding: {
//         x: { type: Number, default: 10 },
//         y: { type: Number, default: 10 },
//       },
//     },

//     // Widget Positions
//     widgets: [
//       {
//         id: {
//           type: String,
//           required: true,
//         },
//         type: {
//           type: String,
//           enum: ["kpi", "chart", "table", "text", "custom"],
//           required: true,
//         },

//         // Position and Size
//         position: {
//           x: { type: Number, required: true },
//           y: { type: Number, required: true },
//           width: { type: Number, required: true },
//           height: { type: Number, required: true },
//         },

//         // Widget Configuration
//         config: {
//           title: String,
//           visible: { type: Boolean, default: true },

//           // KPI specific
//           kpiType: String,
//           aggregation: String,

//           // Chart specific
//           chartType: String,
//           dataSource: String,
//           xAxis: String,
//           yAxis: String,

//           // Table specific
//           columns: [String],
//           filters: Schema.Types.Mixed,

//           // Styling
//           backgroundColor: String,
//           textColor: String,
//           borderColor: String,
//           borderWidth: Number,
//           borderRadius: Number,

//           // Custom settings
//           customSettings: Schema.Types.Mixed,
//         },

//         // Responsive breakpoints
//         breakpoints: {
//           lg: {
//             x: Number,
//             y: Number,
//             w: Number,
//             h: Number,
//           },
//           md: {
//             x: Number,
//             y: Number,
//             w: Number,
//             h: Number,
//           },
//           sm: {
//             x: Number,
//             y: Number,
//             w: Number,
//             h: Number,
//           },
//           xs: {
//             x: Number,
//             y: Number,
//             w: Number,
//             h: Number,
//           },
//         },
//       },
//     ],

//     // Layout Settings
//     settings: {
//       isResizable: {
//         type: Boolean,
//         default: true,
//       },
//       isDraggable: {
//         type: Boolean,
//         default: true,
//       },
//       autoSize: {
//         type: Boolean,
//         default: false,
//       },
//       verticalCompact: {
//         type: Boolean,
//         default: true,
//       },
//       preventCollision: {
//         type: Boolean,
//         default: false,
//       },
//     },

//     isDefault: {
//       type: Boolean,
//       default: false,
//     },

//     isShared: {
//       type: Boolean,
//       default: false,
//     },

//     sharedWith: [String], // User IDs
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes
// dashboardLayoutSchema.index({ tenantId: 1, ownerId: 1 });
// dashboardLayoutSchema.index({ tenantId: 1, layoutId: 1 }, { unique: true });

module.exports = {
  ColumnConfiguration: mongoose.model(
    "ColumnConfiguration",
    columnConfigurationSchema
  ),
  // DashboardLayout: mongoose.model("DashboardLayout", dashboardLayoutSchema),
};
