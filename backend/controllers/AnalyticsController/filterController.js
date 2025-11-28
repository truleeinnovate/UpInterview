// // v1.0.0 - Ashok - Added new schema as commented
// const { FilterPreset, FilterAnalytics, FilterFieldConfig } = require('../../models/AnalyticSchemas/filterSchemas');
// const { addTenantFilter, generateTenantScopedId } = require('../../middleware/tenantMiddleware');

// // =============================================================================
// // FILTER PRESET CONTROLLERS
// // =============================================================================

// /**
//  * Get all filter presets for a user
//  */
// const getFilterPresets = async (req, res) => {
//   try {
//     const { page, reportType, isPublic } = req.query;
    
//     const filter = addTenantFilter(req, {});
    
//     if (isPublic === 'true') {
//       filter.isPublic = true;
//     } else {
//       // Get user's own presets and public presets
//       filter.$or = [
//         { userId: req.currentUser.userId },
//         { isPublic: true },
//         { sharedWith: req.currentUser.userId }
//       ];
//     }
    
//     if (page) {
//       filter['context.page'] = page;
//     }
    
//     if (reportType) {
//       filter['context.reportType'] = reportType;
//     }
    
//     const presets = await FilterPreset.find(filter)
//       .sort({ 'usage.lastUsed': -1, updatedAt: -1 })
//       .lean();
    
//     res.json({
//       success: true,
//       presets,
//       count: presets.length
//     });
//   } catch (error) {
//     console.error('Error fetching filter presets:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch filter presets',
//       message: error.message
//     });
//   }
// };

// /**
//  * Create a new filter preset
//  */
// const createFilterPreset = async (req, res) => {
//   try {
//     const { name, description, basicFilters, advancedFilters, context, tags } = req.body;
    
//     if (!name || !name.trim()) {
//       return res.status(400).json({
//         success: false,
//         error: 'Filter preset name is required'
//       });
//     }
    
//     const presetData = {
//       tenantId: req.tenantId,
//       userId: req.currentUser.userId,
//       presetId: generateTenantScopedId(req.tenantId, 'FILTER_'),
//       name: name.trim(),
//       description,
//       basicFilters: basicFilters || {},
//       advancedFilters: advancedFilters || [],
//       context: context || { page: 'dashboard' },
//       tags: tags || [],
//       usage: {
//         count: 0
//       }
//     };
    
//     const preset = new FilterPreset(presetData);
//     await preset.save();
    
//     res.status(201).json({
//       success: true,
//       preset,
//       message: 'Filter preset created successfully'
//     });
//   } catch (error) {
//     console.error('Error creating filter preset:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to create filter preset',
//       message: error.message
//     });
//   }
// };

// /**
//  * Update filter preset usage
//  */
// const updateFilterPresetUsage = async (req, res) => {
//   try {
//     const { presetId } = req.params;
//     const { executionTime, resultCount } = req.body;
    
//     const preset = await FilterPreset.findOneAndUpdate(
//       addTenantFilter(req, { presetId }),
//       {
//         $inc: { 'usage.count': 1 },
//         $set: { 
//           'usage.lastUsed': new Date(),
//           'usage.averageExecutionTime': executionTime
//         }
//       },
//       { new: true }
//     );
    
//     if (!preset) {
//       return res.status(404).json({
//         success: false,
//         error: 'Filter preset not found'
//       });
//     }
    
//     // Log analytics
//     await logFilterAnalytics(req, {
//       type: 'preset_used',
//       filters: {
//         presetId: preset.presetId,
//         presetName: preset.name
//       },
//       performance: {
//         executionTime,
//         resultCount
//       }
//     });
    
//     res.json({
//       success: true,
//       preset,
//       message: 'Usage updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating filter preset usage:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to update preset usage',
//       message: error.message
//     });
//   }
// };

// /**
//  * Delete a filter preset
//  */
// const deleteFilterPreset = async (req, res) => {
//   try {
//     const { presetId } = req.params;
    
//     const preset = await FilterPreset.findOneAndDelete(
//       addTenantFilter(req, { 
//         presetId,
//         userId: req.currentUser.userId // Users can only delete their own presets
//       })
//     );
    
//     if (!preset) {
//       return res.status(404).json({
//         success: false,
//         error: 'Filter preset not found or access denied'
//       });
//     }
    
//     res.json({
//       success: true,
//       message: 'Filter preset deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting filter preset:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to delete filter preset',
//       message: error.message
//     });
//   }
// };

// // =============================================================================
// // FILTER FIELD CONFIGURATION CONTROLLERS
// // =============================================================================

// /**
//  * Get available filter fields for a report type
//  */
// const getFilterFields = async (req, res) => {
//   try {
//     const { reportType } = req.params;
    
//     let config = await FilterFieldConfig.findOne(
//       addTenantFilter(req, { reportType })
//     ).lean();
    
//     // Return default configuration if none exists
//     if (!config) {
//       config = getDefaultFilterFields(reportType, req.tenantId);
//     }
    
//     res.json({
//       success: true,
//       data: config
//     });
//   } catch (error) {
//     console.error('Error fetching filter fields:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch filter fields',
//       message: error.message
//     });
//   }
// };

// /**
//  * Update filter field configuration
//  */
// const updateFilterFields = async (req, res) => {
//   try {
//     const { reportType } = req.params;
//     const { fields, defaultFilters } = req.body;
    
//     const configData = {
//       tenantId: req.tenantId,
//       reportType,
//       fields: fields.map((field, index) => ({
//         ...field,
//         order: index
//       })),
//       defaultFilters: defaultFilters || []
//     };
    
//     const config = await FilterFieldConfig.findOneAndUpdate(
//       addTenantFilter(req, { reportType }),
//       configData,
//       { 
//         new: true, 
//         upsert: true, 
//         runValidators: true,
//         setDefaultsOnInsert: true
//       }
//     );
    
//     res.json({
//       success: true,
//       data: config,
//       message: 'Filter fields updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating filter fields:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to update filter fields',
//       message: error.message
//     });
//   }
// };

// // =============================================================================
// // FILTER ANALYTICS CONTROLLERS
// // =============================================================================

// /**
//  * Log filter application for analytics
//  */
// const logFilterApplication = async (req, res) => {
//   try {
//     const { filters, context, performance } = req.body;
    
//     await logFilterAnalytics(req, {
//       type: 'filter_applied',
//       filters,
//       context,
//       performance
//     });
    
//     res.json({
//       success: true,
//       message: 'Filter usage logged successfully'
//     });
//   } catch (error) {
//     console.error('Error logging filter application:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to log filter usage',
//       message: error.message
//     });
//   }
// };

// /**
//  * Get filter usage analytics
//  */
// const getFilterAnalytics = async (req, res) => {
//   try {
//     const { days = 30, page, reportType } = req.query;
    
//     const cutoffDate = new Date();
//     cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
//     const filter = addTenantFilter(req, {
//       'event.timestamp': { $gte: cutoffDate }
//     });
    
//     if (page) {
//       filter['context.page'] = page;
//     }
    
//     if (reportType) {
//       filter['context.reportType'] = reportType;
//     }
    
//     const analytics = await FilterAnalytics.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: {
//             page: '$context.page',
//             eventType: '$event.type'
//           },
//           count: { $sum: 1 },
//           avgExecutionTime: { $avg: '$performance.executionTime' },
//           avgResultCount: { $avg: '$performance.resultCount' }
//         }
//       },
//       { $sort: { count: -1 } }
//     ]);
    
//     // Get most used filter fields
//     const fieldUsage = await FilterAnalytics.aggregate([
//       { $match: filter },
//       { $unwind: '$filters.advanced' },
//       {
//         $group: {
//           _id: '$filters.advanced.field',
//           count: { $sum: 1 },
//           operators: { $addToSet: '$filters.advanced.operator' }
//         }
//       },
//       { $sort: { count: -1 } },
//       { $limit: 10 }
//     ]);
    
//     // Get preset usage
//     const presetUsage = await FilterPreset.find(
//       addTenantFilter(req, {})
//     )
//     .sort({ 'usage.count': -1 })
//     .limit(10)
//     .select('name usage.count usage.lastUsed')
//     .lean();
    
//     res.json({
//       success: true,
//       analytics: {
//         summary: analytics,
//         fieldUsage,
//         presetUsage,
//         period: `${days} days`
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching filter analytics:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch filter analytics',
//       message: error.message
//     });
//   }
// };

// // =============================================================================
// // HELPER FUNCTIONS
// // =============================================================================

// /**
//  * Log filter analytics event
//  */
// const logFilterAnalytics = async (req, eventData) => {
//   try {
//     const analyticsData = {
//       tenantId: req.tenantId,
//       userId: req.currentUser?.userId,
//       sessionId: req.sessionID,
//       event: {
//         type: eventData.type,
//         timestamp: new Date()
//       },
//       context: {
//         page: eventData.context?.page || req.path,
//         reportType: eventData.context?.reportType,
//         userAgent: req.get('User-Agent'),
//         ipAddress: req.ip
//       },
//       filters: eventData.filters || {},
//       performance: eventData.performance || {},
//       results: eventData.results || { success: true }
//     };
    
//     const analytics = new FilterAnalytics(analyticsData);
//     await analytics.save();
//   } catch (error) {
//     console.error('Error logging filter analytics:', error);
//     // Don't throw error as this is non-critical
//   }
// };

// /**
//  * Get default filter fields for a report type
//  */
// const getDefaultFilterFields = (reportType, tenantId) => {
//   const defaultConfigs = {
//     interview: {
//       fields: [
//         {
//           key: 'interviewType',
//           label: 'Interview Type',
//           type: 'select',
//           options: ['all', 'internal', 'external'],
//           operators: ['equals', 'not_equals'],
//           dbField: 'interviewerType',
//           collection: 'interviews'
//         },
//         {
//           key: 'candidateStatus',
//           label: 'Candidate Status',
//           type: 'select',
//           options: ['all', 'active', 'inactive', 'cancelled'],
//           operators: ['equals', 'not_equals'],
//           dbField: 'status',
//           collection: 'candidates'
//         },
//         {
//           key: 'position',
//           label: 'Position',
//           type: 'text',
//           operators: ['equals', 'contains', 'starts_with'],
//           dbField: 'position',
//           collection: 'interviews'
//         },
//         {
//           key: 'interviewer',
//           label: 'Interviewer',
//           type: 'text',
//           operators: ['equals', 'contains'],
//           dbField: 'interviewerName',
//           collection: 'interviews'
//         },
//         {
//           key: 'score',
//           label: 'Interview Score',
//           type: 'number',
//           operators: ['equals', 'greater_than', 'less_than', 'between'],
//           validation: { min: 0, max: 10, step: 0.1 },
//           dbField: 'score',
//           collection: 'interviews'
//         },
//         {
//           key: 'rating',
//           label: 'Interview Rating',
//           type: 'number',
//           operators: ['equals', 'greater_than', 'less_than', 'between'],
//           validation: { min: 0, max: 5, step: 0.1 },
//           dbField: 'rating',
//           collection: 'interviews'
//         },
//         {
//           key: 'date',
//           label: 'Interview Date',
//           type: 'date',
//           operators: ['equals', 'after', 'before', 'between'],
//           dbField: 'date',
//           collection: 'interviews'
//         },
//         {
//           key: 'duration',
//           label: 'Duration (minutes)',
//           type: 'number',
//           operators: ['equals', 'greater_than', 'less_than', 'between'],
//           validation: { min: 0, max: 480, step: 15 },
//           dbField: 'duration',
//           collection: 'interviews'
//         },
//         {
//           key: 'billable',
//           label: 'Billable',
//           type: 'boolean',
//           operators: ['equals'],
//           dbField: 'billable',
//           collection: 'interviews'
//         },
//         {
//           key: 'noShow',
//           label: 'No Show',
//           type: 'boolean',
//           operators: ['equals'],
//           dbField: 'noShow',
//           collection: 'interviews'
//         }
//       ]
//     },
//     interviewer: {
//       fields: [
//         {
//           key: 'type',
//           label: 'Interviewer Type',
//           type: 'select',
//           options: ['all', 'internal', 'external'],
//           operators: ['equals', 'not_equals'],
//           dbField: 'type',
//           collection: 'interviewers'
//         },
//         {
//           key: 'specialization',
//           label: 'Specialization',
//           type: 'text',
//           operators: ['equals', 'contains'],
//           dbField: 'specialization',
//           collection: 'interviewers'
//         },
//         {
//           key: 'rating',
//           label: 'Rating',
//           type: 'number',
//           operators: ['equals', 'greater_than', 'less_than', 'between'],
//           validation: { min: 0, max: 5, step: 0.1 },
//           dbField: 'rating',
//           collection: 'interviewers'
//         },
//         {
//           key: 'totalInterviews',
//           label: 'Total Interviews',
//           type: 'number',
//           operators: ['equals', 'greater_than', 'less_than', 'between'],
//           validation: { min: 0, step: 1 },
//           dbField: 'totalInterviews',
//           collection: 'interviewers'
//         },
//         {
//           key: 'availability',
//           label: 'Availability',
//           type: 'select',
//           options: ['all', 'high', 'medium', 'low'],
//           operators: ['equals', 'not_equals'],
//           dbField: 'availability',
//           collection: 'interviewers'
//         },
//         {
//           key: 'skills',
//           label: 'Skills',
//           type: 'multiselect',
//           options: ['JavaScript', 'React', 'Node.js', 'Python', 'Django', 'AWS', 'Docker'],
//           operators: ['in', 'not_in', 'contains'],
//           dbField: 'skills',
//           collection: 'interviewers'
//         }
//       ]
//     },
//     assessment: {
//       fields: [
//         {
//           key: 'type',
//           label: 'Assessment Type',
//           type: 'select',
//           options: ['all', 'technical', 'cognitive', 'personality', 'skills'],
//           operators: ['equals', 'not_equals'],
//           dbField: 'type',
//           collection: 'assessments'
//         },
//         {
//           key: 'status',
//           label: 'Status',
//           type: 'select',
//           options: ['all', 'pending', 'completed', 'failed', 'expired'],
//           operators: ['equals', 'not_equals'],
//           dbField: 'status',
//           collection: 'assessments'
//         },
//         {
//           key: 'score',
//           label: 'Score',
//           type: 'number',
//           operators: ['equals', 'greater_than', 'less_than', 'between'],
//           validation: { min: 0, max: 100, step: 1 },
//           dbField: 'score',
//           collection: 'assessments'
//         },
//         {
//           key: 'timeSpent',
//           label: 'Time Spent (minutes)',
//           type: 'number',
//           operators: ['equals', 'greater_than', 'less_than', 'between'],
//           validation: { min: 0, step: 1 },
//           dbField: 'timeSpent',
//           collection: 'assessments'
//         }
//       ]
//     },
//     candidate: {
//       fields: [
//         {
//           key: 'status',
//           label: 'Candidate Status',
//           type: 'select',
//           options: ['all', 'active', 'inactive', 'hired', 'rejected'],
//           operators: ['equals', 'not_equals'],
//           dbField: 'status',
//           collection: 'candidates'
//         },
//         {
//           key: 'stage',
//           label: 'Pipeline Stage',
//           type: 'select',
//           options: ['all', 'applied', 'screening', 'technical_interview', 'final_interview', 'offer_extended'],
//           operators: ['equals', 'not_equals'],
//           dbField: 'stage',
//           collection: 'candidates'
//         },
//         {
//           key: 'position',
//           label: 'Position',
//           type: 'text',
//           operators: ['equals', 'contains'],
//           dbField: 'position',
//           collection: 'candidates'
//         },
//         {
//           key: 'experience',
//           label: 'Experience (years)',
//           type: 'number',
//           operators: ['equals', 'greater_than', 'less_than', 'between'],
//           validation: { min: 0, max: 50, step: 1 },
//           dbField: 'experience',
//           collection: 'candidates'
//         },
//         {
//           key: 'location',
//           label: 'Location',
//           type: 'text',
//           operators: ['equals', 'contains'],
//           dbField: 'location',
//           collection: 'candidates'
//         },
//         {
//           key: 'skills',
//           label: 'Skills',
//           type: 'multiselect',
//           options: ['JavaScript', 'React', 'Python', 'Java', 'AWS', 'Docker'],
//           operators: ['in', 'not_in', 'contains'],
//           dbField: 'skills',
//           collection: 'candidates'
//         }
//       ]
//     }
//   };
  
//   const config = defaultConfigs[reportType] || defaultConfigs.interview;
  
//   return {
//     tenantId,
//     reportType,
//     ...config,
//     defaultFilters: []
//   };
// };

// /**
//  * Apply filters to MongoDB query
//  */
// const applyFiltersToQuery = (baseQuery, filters, tenantId) => {
//   const query = { ...baseQuery, tenantId };
  
//   // Apply basic filters
//   if (filters.basic) {
//     Object.entries(filters.basic).forEach(([key, filterConfig]) => {
//       if (filterConfig.value && filterConfig.value !== 'all') {
//         switch (filterConfig.operator) {
//           case 'equals':
//             query[key] = filterConfig.value;
//             break;
//           case 'not_equals':
//             query[key] = { $ne: filterConfig.value };
//             break;
//           case 'contains':
//             query[key] = { $regex: filterConfig.value, $options: 'i' };
//             break;
//           case 'greater_than':
//             query[key] = { $gt: filterConfig.value };
//             break;
//           case 'less_than':
//             query[key] = { $lt: filterConfig.value };
//             break;
//           case 'between':
//             if (filterConfig.value.from && filterConfig.value.to) {
//               query[key] = { 
//                 $gte: filterConfig.value.from, 
//                 $lte: filterConfig.value.to 
//               };
//             }
//             break;
//         }
//       }
//     });
//   }
  
//   // Apply advanced filters
//   if (filters.advanced && Array.isArray(filters.advanced)) {
//     const advancedConditions = [];
    
//     filters.advanced.forEach(filter => {
//       if (filter.field && filter.value) {
//         const condition = {};
        
//         switch (filter.operator) {
//           case 'equals':
//             condition[filter.field] = filter.value;
//             break;
//           case 'not_equals':
//             condition[filter.field] = { $ne: filter.value };
//             break;
//           case 'contains':
//             condition[filter.field] = { $regex: filter.value, $options: 'i' };
//             break;
//           case 'greater_than':
//             condition[filter.field] = { $gt: filter.value };
//             break;
//           case 'less_than':
//             condition[filter.field] = { $lt: filter.value };
//             break;
//           case 'between':
//             if (filter.value.from && filter.value.to) {
//               condition[filter.field] = { 
//                 $gte: filter.value.from, 
//                 $lte: filter.value.to 
//               };
//             }
//             break;
//           case 'in':
//             condition[filter.field] = { $in: Array.isArray(filter.value) ? filter.value : [filter.value] };
//             break;
//           case 'not_in':
//             condition[filter.field] = { $nin: Array.isArray(filter.value) ? filter.value : [filter.value] };
//             break;
//         }
        
//         if (Object.keys(condition).length > 0) {
//           advancedConditions.push(condition);
//         }
//       }
//     });
    
//     if (advancedConditions.length > 0) {
//       // Group conditions by logic operator
//       const andConditions = [];
//       const orConditions = [];
      
//       filters.advanced.forEach((filter, index) => {
//         if (advancedConditions[index]) {
//           if (filter.logic === 'OR') {
//             orConditions.push(advancedConditions[index]);
//           } else {
//             andConditions.push(advancedConditions[index]);
//           }
//         }
//       });
      
//       if (andConditions.length > 0) {
//         query.$and = (query.$and || []).concat(andConditions);
//       }
      
//       if (orConditions.length > 0) {
//         query.$or = orConditions;
//       }
//     }
//   }
  
//   return query;
// };

// module.exports = {
//   getFilterPresets,
//   createFilterPreset,
//   updateFilterPresetUsage,
//   deleteFilterPreset,
//   getFilterFields,
//   updateFilterFields,
//   logFilterApplication,
//   getFilterAnalytics,
//   applyFiltersToQuery,
//   logFilterAnalytics
// };


// // v1.0.0 <-------------------------------------------------NEW SCHEMA----------------------------------------------------
// // const mongoose = require('mongoose');
// // const { Schema } = mongoose;
 
// // // =============================================================================
// // // FILTER PRESET SCHEMA - Saved filter combinations
// // // =============================================================================
// // const filterPresetSchema = new Schema({
// //   tenantId: {
// //     type: String,
// //     required: true,
// //     index: true
// //   },
// //   userId: {
// //     type: String,
// //     required: true,
// //     index: true
// //   },
// //   presetId: {
// //     type: String,
// //     required: true,
// //     index: true
// //   },//Unique Auto Genereate No. RF-00001
// //   // Basic Filters
// //   basicFilters: {
// //     type: Map,
// //     of: Schema.Types.Mixed,
// //     default: {}
// //   },
// //   // Context where filter applies
// //   context: {
// //     page: {
// //       type: String,
// //       enum: ['dashboard', 'reports', 'trends', 'interviews', 'interviewers', 'assessments', 'candidates'],
// //       required: true
// //     },
// //     reportType: String // For report-specific filters
// //   },
// //   // Usage Statistics
// //   usage: {
// //     count: {
// //       type: Number,
// //       default: 0
// //     },
// //     lastUsed: Date,
// //     averageExecutionTime: Number // milliseconds
// //   },
// //   // Sharing
// //   isPublic: {
// //     type: Boolean,
// //     default: false
// //   },
// //   sharedWith: [String], // User IDs
// //   // System flags
// //   isDefault: {
// //     type: Boolean,
// //     default: false
// //   },
// //   isSystem: {
// //     type: Boolean,
// //     default: false
// //   },
// //   tags: [String]
// // }, {
// //   timestamps: true
// // });
 
// // // Indexes
// // filterPresetSchema.index({ tenantId: 1, userId: 1 });
// // filterPresetSchema.index({ tenantId: 1, presetId: 1 }, { unique: true });
// // filterPresetSchema.index({ tenantId: 1, 'context.page': 1 });
// // filterPresetSchema.index({ tenantId: 1, isPublic: 1 });
 
// // // =============================================================================
// // // FILTER FIELD CONFIGURATION SCHEMA - Available filter fields per report type
// // // =============================================================================
// // const filterFieldConfigSchema = new Schema({
// //   tenantId: {
// //     type: String,
// //     required: true,
// //     index: true
// //   },
// //   reportType: {
// //     type: String,
// //     required: true,
// //     enum: ['interview', 'interviewer', 'assessment', 'candidate', 'organization', 'dashboard', 'trends']
// //   },
// //   // Available Filter Fields
// //   fields: [{
// //     key: {
// //       type: String,
// //       required: true
// //     },
// //     label: {
// //       type: String,
// //       required: true
// //     },
// //     type: {
// //       type: String,
// //       enum: ['text', 'number', 'date', 'select', 'multiselect', 'boolean', 'range'],
// //       required: true
// //     },
// //     description: String,
// //     // For select/multiselect fields
// //     options: [{
// //       value: String,
// //       label: String
// //     }],
// //     // For number/date fields
// //     validation: {
// //       min: Schema.Types.Mixed,
// //       max: Schema.Types.Mixed,
// //       step: Number
// //     },
// //     // Available operators for this field
// //     operators: [{
// //       type: String,
// //       enum: ['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'between', 'in', 'not_in', 'exists', 'not_exists']
// //     }],
// //     // Field properties
// //     isRequired: {
// //       type: Boolean,
// //       default: false
// //     },
// //     isVisible: {
// //       type: Boolean,
// //       default: true
// //     },
// //     order: {
// //       type: Number,
// //       default: 0
// //     },
// //     // Database mapping
// //     dbField: String, // Actual database field name
// //     collection: String, // Which collection this field belongs to
// //     // Custom field properties
// //     isCustom: {
// //       type: Boolean,
// //       default: false
// //     },
// //     calculation: String, // For calculated fields
// //     dependencies: [String] // Other fields this depends on
// //   }],
// //   // Default filter configuration
// //   defaultFilters: [{
// //     field: String,
// //     operator: String,
// //     value: Schema.Types.Mixed
// //   }],
// //   isActive: {
// //     type: Boolean,
// //     default: true
// //   }
// // }, {
// //   timestamps: true
// // });
 
// // // Indexes
// // filterFieldConfigSchema.index({ tenantId: 1, reportType: 1 }, { unique: true });
 
// // module.exports = {
// //   FilterPreset: mongoose.model('FilterPreset', filterPresetSchema),
// //   FilterFieldConfig: mongoose.model('FilterFieldConfig', filterFieldConfigSchema)
// // }
// // v1.0.0 ---------------------------------------------NEW SCHEMA--------------------------------------------------->