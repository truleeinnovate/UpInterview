// v1.0.0 - Ashok - Added new schema as commented
const { ReportTemplate, DashboardConfig, TrendsConfig, SavedQuery } = require('../../models/AnalyticSchemas/reportSchemas');
const { addTenantFilter, generateTenantScopedId } = require('../../middleware/tenantMiddleware');

// =============================================================================
// REPORT TEMPLATE CONTROLLERS
// =============================================================================

/**
 * Get all report templates for a tenant
 */
const getReportTemplates = async (req, res) => {
  try {
    const { type, status, createdBy } = req.query;
    
    const filter = addTenantFilter(req, {});
    
    // Add optional filters
    if (type && type !== 'all') filter.type = type;
    if (status && status !== 'all') filter.status = status;
    if (createdBy) filter.createdBy = createdBy;
    
    const templates = await ReportTemplate.find(filter)
      .sort({ updatedAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error fetching report templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report templates',
      message: error.message
    });
  }
};

/**
 * Get a specific report template
 */
const getReportTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const template = await ReportTemplate.findOne(
      addTenantFilter(req, { templateId })
    ).lean();
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Report template not found'
      });
    }
    
    // Increment view count
    await ReportTemplate.updateOne(
      addTenantFilter(req, { templateId }),
      { $inc: { 'usage.viewCount': 1 } }
    );
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching report template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report template',
      message: error.message
    });
  }
};

/**
 * Create a new report template
 */
const createReportTemplate = async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      tenantId: req.tenantId,
      templateId: generateTenantScopedId(req.tenantId, 'RPT_'),
      createdBy: req.currentUser.userId
    };
    
    const template = new ReportTemplate(templateData);
    await template.save();
    
    res.status(201).json({
      success: true,
      data: template,
      message: 'Report template created successfully'
    });
  } catch (error) {
    console.error('Error creating report template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create report template',
      message: error.message
    });
  }
};

/**
 * Update a report template
 */
const updateReportTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const updateData = {
      ...req.body,
      'usage.lastModified': new Date(),
      'usage.modifiedBy': req.currentUser.userId
    };
    
    const template = await ReportTemplate.findOneAndUpdate(
      addTenantFilter(req, { templateId }),
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Report template not found'
      });
    }
    
    res.json({
      success: true,
      data: template,
      message: 'Report template updated successfully'
    });
  } catch (error) {
    console.error('Error updating report template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update report template',
      message: error.message
    });
  }
};

/**
 * Delete a report template
 */
const deleteReportTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const template = await ReportTemplate.findOneAndDelete(
      addTenantFilter(req, { templateId })
    );
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Report template not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Report template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete report template',
      message: error.message
    });
  }
};

// =============================================================================
// DASHBOARD CONFIGURATION CONTROLLERS
// =============================================================================

/**
 * Get user's dashboard configuration
 */
const getDashboardConfig = async (req, res) => {
  try {
    const config = await DashboardConfig.findOne(
      addTenantFilter(req, { userId: req.currentUser.userId })
    ).lean();
    
    // Return default config if none exists
    if (!config) {
      const defaultConfig = {
        tenantId: req.tenantId,
        userId: req.currentUser.userId,
        configId: generateTenantScopedId(req.tenantId, 'DASH_'),
        settings: {
          layout: { type: 'grid' },
          appearance: { theme: 'default' },
          dateRange: { default: 'last30days' },
          defaultFilters: {
            interviewType: 'all',
            candidateStatus: 'all',
            position: 'all'
          }
        },
        kpiCards: {
          visible: {
            totalInterviews: true,
            outsourcedInterviews: true,
            upcomingInterviews: true,
            noShows: true,
            assessmentsCompleted: true,
            averageScore: true,
            billableInterviews: true
          },
          order: ['totalInterviews', 'outsourcedInterviews', 'upcomingInterviews', 'noShows', 'assessmentsCompleted', 'averageScore', 'billableInterviews'],
          positions: []
        },
        charts: {
          visible: {
            interviewsOverTime: true,
            interviewerUtilization: true,
            assessmentStats: true,
            ratingDistribution: true,
            noShowTrends: true,
            cycleTimeTrends: true
          },
          order: ['interviewsOverTime', 'interviewerUtilization', 'assessmentStats', 'ratingDistribution', 'noShowTrends', 'cycleTimeTrends'],
          positions: []
        }
      };
      
      return res.json({
        success: true,
        data: defaultConfig
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching dashboard config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard configuration',
      message: error.message
    });
  }
};

/**
 * Save user's dashboard configuration
 */
const saveDashboardConfig = async (req, res) => {
  try {
    const configData = {
      ...req.body,
      tenantId: req.tenantId,
      userId: req.currentUser.userId
    };
    
    // Generate configId if not provided
    if (!configData.configId) {
      configData.configId = generateTenantScopedId(req.tenantId, 'DASH_');
    }
    
    const config = await DashboardConfig.findOneAndUpdate(
      addTenantFilter(req, { userId: req.currentUser.userId }),
      configData,
      { 
        new: true, 
        upsert: true, 
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );
    
    res.json({
      success: true,
      data: config,
      message: 'Dashboard configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving dashboard config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save dashboard configuration',
      message: error.message
    });
  }
};

// =============================================================================
// TRENDS CONFIGURATION CONTROLLERS
// =============================================================================

/**
 * Get user's trends configuration
 */
const getTrendsConfig = async (req, res) => {
  try {
    const config = await TrendsConfig.findOne(
      addTenantFilter(req, { userId: req.currentUser.userId })
    ).lean();
    
    // Return default config if none exists
    if (!config) {
      const defaultConfig = {
        tenantId: req.tenantId,
        userId: req.currentUser.userId,
        configId: generateTenantScopedId(req.tenantId, 'TREND_'),
        settings: {
          timePeriod: { default: 'last30days' },
          comparison: { enabled: true, period: 'previous_period' },
          grouping: { timeInterval: 'weekly' }
        },
        sections: {
          topSkills: { visible: true, limit: 10, sortBy: 'frequency' },
          topInterviewers: { visible: true, limit: 5, type: 'external', sortBy: 'rating' },
          bottlenecks: { visible: true },
          performanceMetrics: { visible: true }
        }
      };
      
      return res.json({
        success: true,
        data: defaultConfig
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching trends config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends configuration',
      message: error.message
    });
  }
};

/**
 * Save user's trends configuration
 */
const saveTrendsConfig = async (req, res) => {
  try {
    const configData = {
      ...req.body,
      tenantId: req.tenantId,
      userId: req.currentUser.userId
    };
    
    // Generate configId if not provided
    if (!configData.configId) {
      configData.configId = generateTenantScopedId(req.tenantId, 'TREND_');
    }
    
    const config = await TrendsConfig.findOneAndUpdate(
      addTenantFilter(req, { userId: req.currentUser.userId }),
      configData,
      { 
        new: true, 
        upsert: true, 
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );
    
    res.json({
      success: true,
      data: config,
      message: 'Trends configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving trends config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save trends configuration',
      message: error.message
    });
  }
};

// =============================================================================
// SAVED QUERIES CONTROLLERS
// =============================================================================

/**
 * Get user's saved queries
 */
const getSavedQueries = async (req, res) => {
  try {
    const { isPublic } = req.query;
    
    const filter = addTenantFilter(req, {});
    
    if (isPublic === 'true') {
      filter.isPublic = true;
    } else {
      // Get user's own queries and public queries
      filter.$or = [
        { userId: req.currentUser.userId },
        { isPublic: true },
        { sharedWith: req.currentUser.userId }
      ];
    }
    
    const queries = await SavedQuery.find(filter)
      .sort({ updatedAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: queries,
      count: queries.length
    });
  } catch (error) {
    console.error('Error fetching saved queries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch saved queries',
      message: error.message
    });
  }
};

/**
 * Save a new query
 */
const saveQuery = async (req, res) => {
  try {
    const queryData = {
      ...req.body,
      tenantId: req.tenantId,
      userId: req.currentUser.userId,
      queryId: generateTenantScopedId(req.tenantId, 'QRY_')
    };
    
    const savedQuery = new SavedQuery(queryData);
    await savedQuery.save();
    
    res.status(201).json({
      success: true,
      data: savedQuery,
      message: 'Query saved successfully'
    });
  } catch (error) {
    console.error('Error saving query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save query',
      message: error.message
    });
  }
};

module.exports = {
  // Report Templates
  getReportTemplates,
  getReportTemplate,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  
  // Dashboard Configuration
  getDashboardConfig,
  saveDashboardConfig,
  
  // Trends Configuration
  getTrendsConfig,
  saveTrendsConfig,
  
  // Saved Queries
  getSavedQueries,
  saveQuery
};






// v1.0.0 <------------------------------------------------NEW SCHEMA-----------------------------------------------------
// const mongoose = require('mongoose');
// const { Schema } = mongoose;
 
// // =============================================================================
// // REPORT TEMPLATE SCHEMA - Customizable report templates per tenant/user
// // =============================================================================
// const reportTemplateSchema = new Schema({
//   templateId: {
//     type: String,
//     required: true,
//     index: true
//   }, //Unique Auto Genereate No. RT-00001
//   tenantId: {
//     type: String,
//     required: true,
//     index: true
//   }, //Organization or Tenant Reference
//   name: {
//     type: String,
//     required: true
//   }, //All Open Positions
//   description: String,
//   type: {
//     type: String,
//     enum: ['interview', 'interviewer', 'assessment', 'candidate', 'position','organization', 'dashboard', 'trends', 'custom'],
//     required: true
//   },
//   category: String,
//   // Template Configuration
//   configuration: {
//     // Data Source Settings
//     dataSource: {
//       collections: {
//         type: [String],// Which collections to query: ['candidates', 'interviews', 'assessments']
//         default: []
//       }
//       dateRange: {
//         type: String,
//         enum: ['today', 'yesterday', 'last7days', 'last30days', 'last90days', 'thisMonth', 'lastMonth', 'thisYear', 'custom'],
//         default: 'last30days'
//       },
//     },
//     defaultColumns: [String],
//     availableColumns: [String],
//   },
//   // Template Status and Metadata
//   status: {
//     type: String,
//     enum: ['active', 'draft', 'archived', 'template'],
//     default: 'draft'
//   },
//   // Sharing and Permissions
//   sharing: {
//     isPublic: {
//       type: Boolean,
//       default: false
//     },
//     sharedWith: [{
//       userId: String,
//       permission: {
//         type: String,
//         enum: ['view', 'edit', 'admin'],
//         default: 'view'
//       }
//     }],
//     teamAccess: {
//       type: String,
//       enum: ['private', 'team', 'organization'],
//       default: 'private'
//     }
//   },
//   // Usage Statistics
//   usage: {
//     lastGenerated: Date,
//     generationCount: {
//       type: Number,
//       default: 0
//     },
//     viewCount: {
//       type: Number,
//       default: 0
//     },
//     favoriteCount: {
//       type: Number,
//       default: 0
//     }
//   },
//   createdBy: {
//     type: String,
//     required: true // userId who created this template
//   },
//   lastModified: Date,
//   modifiedBy: String,
//   // Template Tags and Search
//   tags: [String],
//   searchKeywords: [String]
// }, {
//   timestamps: true
// });
 
// // Indexes for Report Templates
// reportTemplateSchema.index({ tenantId: 1, templateId: 1 }, { unique: true });
// reportTemplateSchema.index({ tenantId: 1, name: 1 });
// reportTemplateSchema.index({ tenantId: 1, type: 1 });
// reportTemplateSchema.index({ tenantId: 1, createdBy: 1 });
// reportTemplateSchema.index({ tenantId: 1, status: 1 });
// reportTemplateSchema.index({ tenantId: 1, 'sharing.isPublic': 1 });
 
// // =============================================================================
// // SAVED QUERIES SCHEMA - User's saved custom queries
// // =============================================================================
// const savedQuerySchema = new Schema({
//   tenantId: {
//     type: String,
//     required: true,
//     index: true
//   },
//   userId: {
//     type: String,
//     required: true,
//     index: true
//   },
//   queryId: {
//     type: String,
//     required: true,
//     index: true
//   },//Unique Auto Genereate No. RQ-00001
//   name: {
//     type: String,
//     required: true
//   },
//   description: String,
//   // Query Configuration
//   query: {
//     collection: {
//       type: String,
//       required: true,
//       enum: ['interviews', 'interviewers', 'assessments', 'candidates', 'organizations']
//     },
//     activeColumns: [String],
//     filters: Schema.Types.Mixed,
//     aggregation: [{
//       stage: String,
//       config: Schema.Types.Mixed
//     }],
//     sort: Schema.Types.Mixed,
//     limit: Number
//   },
//   // Visualization Settings
//   visualization: {
//     type: {
//       type: String,
//       enum: ['table', 'chart', 'kpi', 'list'],
//       default: 'table'
//     },
//     chartType: String, // 'line', 'bar', 'pie', etc.
//     config: Schema.Types.Mixed
//   },
//   // Sharing
//   isPublic: {
//     type: Boolean,
//     default: false
//   },
//   sharedWith: [String], // userIds
//   // Usage
//   lastExecuted: Date,
//   executionCount: {
//     type: Number,
//     default: 0
//   },
//   tags: [String]
// }, {
//   timestamps: true
// });
 
// // Indexes for Saved Queries
// savedQuerySchema.index({ tenantId: 1, userId: 1 });
// savedQuerySchema.index({ tenantId: 1, name: 1 });
// savedQuerySchema.index({ tenantId: 1, queryId: 1 }, { unique: true });
// savedQuerySchema.index({ tenantId: 1, isPublic: 1 });
 
// // =============================================================================
// // EXPORT MODELS
// // =============================================================================
// module.exports = {
//   ReportTemplate: mongoose.model('ReportTemplate', reportTemplateSchema),
//   SavedQuery: mongoose.model('SavedQuery', savedQuerySchema)
// };
// // v1.0.0 <--------------------------------------------NEW SCHEMA-------------------------------------------------------->