const mongoose = require("mongoose");
const { Schema } = mongoose;

// =============================================================================
// REPORT TEMPLATE SCHEMA - Customizable report templates per tenant/user
// =============================================================================
const reportTemplateSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    templateId: {
      type: String,
      required: true,
      index: true,
    },
    createdBy: {
      type: String,
      required: true, // userId who created this template
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        "interview",
        "interviewer",
        "assessment",
        "candidate",
        "organization",
        "dashboard",
        "trends",
        "custom",
      ],
      required: true,
    },
    category: String,

    // Template Configuration
    configuration: {
      // Data Source Settings
      dataSource: {
        collections: [String], // Which collections to query: ['interviews', 'assessments']
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
        customDateRange: {
          startDate: Date,
          endDate: Date,
        },
        filters: {
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
          status: String,
        },
      },

      // Layout Configuration
      layout: {
        format: {
          type: String,
          enum: ["dashboard", "table", "chart", "summary", "kanban"],
          default: "dashboard",
        },
        style: {
          type: String,
          enum: ["grid", "list", "compact"],
          default: "grid",
        },
        theme: {
          type: String,
          enum: ["default", "dark", "high-contrast"],
          default: "default",
        },

        // Sections Configuration
        sections: [
          {
            id: String,
            type: {
              type: String,
              enum: ["kpi", "chart", "table", "text", "filter"],
            },
            title: String,
            position: {
              row: Number,
              column: Number,
              width: Number,
              height: Number,
            },
            visible: {
              type: Boolean,
              default: true,
            },
            config: {
              // KPI Configuration
              kpiType: String, // 'totalInterviews', 'averageScore', etc.
              chartType: String, // 'line', 'bar', 'pie', etc.
              dataKey: String,
              aggregation: String, // 'sum', 'avg', 'count'

              // Chart Configuration
              xAxis: String,
              yAxis: String,
              groupBy: String,
              colors: [String],

              // Table Configuration
              columns: [
                {
                  key: String,
                  label: String,
                  visible: { type: Boolean, default: true },
                  width: { type: String, default: "auto" },
                  order: { type: Number, default: 0 },
                  sortable: Boolean,
                  filterable: Boolean,
                  type: {
                    type: String,
                    enum: [
                      "text",
                      "number",
                      "date",
                      "select",
                      "array",
                      "object",
                    ],
                    default: "text",
                  },
                  render: String, // Function name for custom rendering
                  description: String,
                },
              ],

              // Custom settings
              customSettings: Schema.Types.Mixed,
            },
          },
        ],
      },

      // Scheduling Configuration
      scheduling: {
        frequency: {
          type: String,
          enum: ["manual", "daily", "weekly", "monthly", "quarterly"],
          default: "manual",
        },
        dayOfWeek: Number, // 0-6 for weekly
        dayOfMonth: Number, // 1-31 for monthly
        time: String, // HH:MM format
        timezone: String,
        recipients: [String], // email addresses
        autoExport: {
          enabled: {
            type: Boolean,
            default: false,
          },
          format: {
            type: String,
            enum: ["pdf", "csv", "excel", "json"],
            default: "pdf",
          },
        },
      },
    },

    // Template Status and Metadata
    status: {
      type: String,
      enum: ["active", "draft", "archived", "template"],
      default: "draft",
    },

    // Sharing and Permissions
    sharing: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      sharedWith: [
        {
          userId: String,
          permission: {
            type: String,
            enum: ["view", "edit", "admin"],
            default: "view",
          },
        },
      ],
      teamAccess: {
        type: String,
        enum: ["private", "team", "organization"],
        default: "private",
      },
    },

    // Usage Statistics
    usage: {
      lastGenerated: Date,
      generationCount: {
        type: Number,
        default: 0,
      },
      lastModified: Date,
      modifiedBy: String,
      viewCount: {
        type: Number,
        default: 0,
      },
      favoriteCount: {
        type: Number,
        default: 0,
      },
    },

    // Template Tags and Search
    tags: [String],
    searchKeywords: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for Report Templates
reportTemplateSchema.index({ tenantId: 1, templateId: 1 }, { unique: true });
reportTemplateSchema.index({ tenantId: 1, type: 1 });
reportTemplateSchema.index({ tenantId: 1, createdBy: 1 });
reportTemplateSchema.index({ tenantId: 1, status: 1 });
reportTemplateSchema.index({ tenantId: 1, "sharing.isPublic": 1 });

// =============================================================================
// DASHBOARD CONFIGURATION SCHEMA - User dashboard preferences
// =============================================================================
const dashboardConfigSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    configId: {
      type: String,
      required: true,
      index: true,
    },

    // Dashboard Settings
    settings: {
      // Layout Preferences
      layout: {
        type: {
          type: String,
          enum: ["grid", "list", "compact", "custom"],
          default: "grid",
        },
        columns: {
          type: Number,
          default: 4,
          min: 1,
          max: 6,
        },
        spacing: {
          type: String,
          enum: ["tight", "normal", "loose"],
          default: "normal",
        },
      },

      // Theme and Appearance
      appearance: {
        theme: {
          type: String,
          enum: ["default", "dark", "high-contrast", "custom"],
          default: "default",
        },
        colorScheme: {
          primary: String,
          secondary: String,
          accent: String,
        },
        fontSize: {
          type: String,
          enum: ["small", "medium", "large"],
          default: "medium",
        },
      },

      // Date Range Preferences
      dateRange: {
        default: {
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
        customRange: {
          startDate: Date,
          endDate: Date,
        },
        autoRefresh: {
          enabled: {
            type: Boolean,
            default: false,
          },
          interval: {
            type: String,
            enum: ["30s", "1m", "5m", "15m", "30m", "1h"],
            default: "5m",
          },
        },
      },

      // Default Filters
      defaultFilters: {
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
      },
    },

    // KPI Cards Configuration
    kpiCards: {
      visible: {
        totalInterviews: { type: Boolean, default: true },
        outsourcedInterviews: { type: Boolean, default: true },
        upcomingInterviews: { type: Boolean, default: true },
        noShows: { type: Boolean, default: true },
        assessmentsCompleted: { type: Boolean, default: true },
        averageScore: { type: Boolean, default: true },
        billableInterviews: { type: Boolean, default: true },
        completionRate: { type: Boolean, default: false },
        averageCycleTime: { type: Boolean, default: false },
      },
      order: [String], // Array of KPI card IDs in display order
      customKPIs: [
        {
          id: String,
          name: String,
          query: Schema.Types.Mixed,
          calculation: String,
          format: String,
          visible: Boolean,
        },
      ],
    },

    // Charts Configuration
    charts: {
      visible: {
        interviewsOverTime: { type: Boolean, default: true },
        interviewerUtilization: { type: Boolean, default: true },
        assessmentStats: { type: Boolean, default: true },
        ratingDistribution: { type: Boolean, default: true },
        noShowTrends: { type: Boolean, default: true },
        cycleTimeTrends: { type: Boolean, default: true },
        skillsAnalysis: { type: Boolean, default: false },
        geographicDistribution: { type: Boolean, default: false },
      },
      order: [String], // Array of chart IDs in display order
      customCharts: [
        {
          id: String,
          name: String,
          type: String, // 'line', 'bar', 'pie', etc.
          dataSource: String,
          config: Schema.Types.Mixed,
          visible: Boolean,
        },
      ],
    },

    // Widget Positions (for custom layouts)
    widgetPositions: [
      {
        widgetId: String,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
      },
    ],

    // Export Preferences
    exportSettings: {
      defaultFormat: {
        type: String,
        enum: ["pdf", "csv", "excel", "json", "png"],
        default: "pdf",
      },
      includeCharts: {
        type: Boolean,
        default: true,
      },
      includeFilters: {
        type: Boolean,
        default: true,
      },
      paperSize: {
        type: String,
        enum: ["A4", "Letter", "Legal"],
        default: "A4",
      },
      orientation: {
        type: String,
        enum: ["portrait", "landscape"],
        default: "portrait",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for Dashboard Configuration
dashboardConfigSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
dashboardConfigSchema.index({ tenantId: 1, configId: 1 }, { unique: true });

// =============================================================================
// TRENDS CONFIGURATION SCHEMA - Trends page preferences
// =============================================================================
const trendsConfigSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    configId: {
      type: String,
      required: true,
      index: true,
    },

    // Trends Settings
    settings: {
      // Time Period for Trends
      timePeriod: {
        default: {
          type: String,
          enum: [
            "last7days",
            "last30days",
            "last90days",
            "last6months",
            "lastyear",
            "custom",
          ],
          default: "last30days",
        },
        customRange: {
          startDate: Date,
          endDate: Date,
        },
      },

      // Comparison Settings
      comparison: {
        enabled: {
          type: Boolean,
          default: true,
        },
        period: {
          type: String,
          enum: ["previous_period", "same_period_last_year", "custom"],
          default: "previous_period",
        },
        customComparisonRange: {
          startDate: Date,
          endDate: Date,
        },
      },

      // Grouping and Aggregation
      grouping: {
        timeInterval: {
          type: String,
          enum: ["daily", "weekly", "monthly", "quarterly"],
          default: "weekly",
        },
        categories: [String], // ['position', 'interviewer', 'organization']
      },
    },

    // Visible Trend Sections
    sections: {
      topSkills: {
        visible: { type: Boolean, default: true },
        limit: { type: Number, default: 10 },
        sortBy: {
          type: String,
          enum: ["frequency", "growth", "demand"],
          default: "frequency",
        },
      },

      topInterviewers: {
        visible: { type: Boolean, default: true },
        limit: { type: Number, default: 5 },
        type: {
          type: String,
          enum: ["all", "internal", "external"],
          default: "external",
        },
        sortBy: {
          type: String,
          enum: ["rating", "interviews", "feedback_time"],
          default: "rating",
        },
      },

      bottlenecks: {
        visible: { type: Boolean, default: true },
        categories: [
          {
            type: String,
            enum: [
              "feedback_delays",
              "scheduling_conflicts",
              "assessment_delays",
              "no_shows",
            ],
            enabled: Boolean,
          },
        ],
        threshold: {
          high: Number,
          medium: Number,
        },
      },

      performanceMetrics: {
        visible: { type: Boolean, default: true },
        metrics: [
          {
            name: String,
            enabled: Boolean,
            target: Number,
          },
        ],
      },

      customTrends: [
        {
          id: String,
          name: String,
          description: String,
          query: Schema.Types.Mixed,
          visualization: {
            type: String,
            config: Schema.Types.Mixed,
          },
          visible: Boolean,
        },
      ],
    },

    // Alert Settings
    alerts: {
      enabled: {
        type: Boolean,
        default: false,
      },
      conditions: [
        {
          metric: String,
          operator: {
            type: String,
            enum: ["greater_than", "less_than", "equals", "percentage_change"],
          },
          value: Number,
          period: String,
          notification: {
            email: Boolean,
            inApp: Boolean,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for Trends Configuration
trendsConfigSchema.index({ tenantId: 1, userId: 1 }, { unique: true });
trendsConfigSchema.index({ tenantId: 1, configId: 1 }, { unique: true });

// =============================================================================
// SAVED QUERIES SCHEMA - User's saved custom queries
// =============================================================================
const savedQuerySchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    queryId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },
    description: String,

    // Query Configuration
    query: {
      collection: {
        type: String,
        required: true,
        enum: [
          "interviews",
          "interviewers",
          "assessments",
          "candidates",
          "organizations",
        ],
      },
      filters: Schema.Types.Mixed,
      aggregation: [
        {
          stage: String,
          config: Schema.Types.Mixed,
        },
      ],
      sort: Schema.Types.Mixed,
      limit: Number,
    },

    // Visualization Settings
    visualization: {
      type: {
        type: String,
        enum: ["table", "chart", "kpi", "list"],
        default: "table",
      },
      chartType: String, // 'line', 'bar', 'pie', etc.
      config: Schema.Types.Mixed,
    },

    // Sharing
    isPublic: {
      type: Boolean,
      default: false,
    },
    sharedWith: [String], // userIds

    // Usage
    lastExecuted: Date,
    executionCount: {
      type: Number,
      default: 0,
    },

    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes for Saved Queries
savedQuerySchema.index({ tenantId: 1, userId: 1 });
savedQuerySchema.index({ tenantId: 1, queryId: 1 }, { unique: true });
savedQuerySchema.index({ tenantId: 1, isPublic: 1 });

// =============================================================================
// EXPORT MODELS
// =============================================================================
module.exports = {
  ReportTemplate: mongoose.model("ReportTemplate", reportTemplateSchema),
  DashboardConfig: mongoose.model("DashboardConfig", dashboardConfigSchema),
  TrendsConfig: mongoose.model("TrendsConfig", trendsConfigSchema),
  SavedQuery: mongoose.model("SavedQuery", savedQuerySchema),
};
