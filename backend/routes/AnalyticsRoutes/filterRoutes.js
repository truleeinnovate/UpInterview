const express = require('express');
const router = express.Router();
const {
  getFilterPresets,
  createFilterPreset,
  updateFilterPresetUsage,
  deleteFilterPreset,
  getFilterFields,
  updateFilterFields,
  logFilterApplication,
  getFilterAnalytics
} = require('../../controllers/AnalyticsController/filterController');

const { tenantMiddleware, userPermissionMiddleware } = require('../../middleware/tenantMiddleware');

// Apply tenant middleware to all routes
router.use(tenantMiddleware);

// =============================================================================
// FILTER PRESET ROUTES
// =============================================================================

// GET /api/filters/presets - Get all saved filter presets
router.get('/presets', 
  userPermissionMiddleware('reports', 'read'),
  getFilterPresets
);

// POST /api/filters/presets - Save a new filter preset
router.post('/presets', 
  userPermissionMiddleware('reports', 'create'),
  createFilterPreset
);

// POST /api/filters/presets/:presetId/usage - Update preset usage count
router.post('/presets/:presetId/usage', 
  userPermissionMiddleware('reports', 'read'),
  updateFilterPresetUsage
);

// DELETE /api/filters/presets/:presetId - Delete a filter preset
router.delete('/presets/:presetId', 
  userPermissionMiddleware('reports', 'delete'),
  deleteFilterPreset
);

// =============================================================================
// FILTER FIELD CONFIGURATION ROUTES
// =============================================================================

// GET /api/filters/fields/:reportType - Get available filter fields for report type
router.get('/fields/:reportType', 
  userPermissionMiddleware('reports', 'read'),
  getFilterFields
);

// PUT /api/filters/fields/:reportType - Update filter field configuration
router.put('/fields/:reportType', 
  userPermissionMiddleware('settings', 'update'),
  updateFilterFields
);

// =============================================================================
// FILTER APPLICATION AND ANALYTICS ROUTES
// =============================================================================

// POST /api/filters/applied - Log applied filters for analytics
router.post('/applied', 
  userPermissionMiddleware('reports', 'read'),
  logFilterApplication
);

// GET /api/filters/analytics - Get filter usage analytics
router.get('/analytics', 
  userPermissionMiddleware('reports', 'read'),
  getFilterAnalytics
);

// =============================================================================
// FILTER VALIDATION AND TESTING ROUTES
// =============================================================================

// POST /api/filters/validate - Validate filter configuration
router.post('/validate', 
  userPermissionMiddleware('reports', 'read'),
  async (req, res) => {
    try {
      const { filters, reportType } = req.body;
      
      // Get field configuration for validation
      const fieldConfig = await getFilterFields(req, res);
      
      const errors = [];
      const warnings = [];
      
      // Validate basic filters
      if (filters.basic) {
        Object.entries(filters.basic).forEach(([key, filter]) => {
          const field = fieldConfig.fields.find(f => f.key === key);
          if (!field) {
            errors.push(`Unknown filter field: ${key}`);
            return;
          }
          
          if (!field.operators.includes(filter.operator)) {
            errors.push(`Invalid operator '${filter.operator}' for field '${key}'`);
          }
          
          // Type validation
          if (field.type === 'number' && isNaN(filter.value)) {
            errors.push(`Field '${key}' expects a number value`);
          }
          
          if (field.type === 'date' && !Date.parse(filter.value)) {
            errors.push(`Field '${key}' expects a valid date`);
          }
        });
      }
      
      // Validate advanced filters
      if (filters.advanced && Array.isArray(filters.advanced)) {
        filters.advanced.forEach((filter, index) => {
          if (!filter.field) {
            errors.push(`Advanced filter ${index + 1}: Field is required`);
          }
          
          if (!filter.operator) {
            errors.push(`Advanced filter ${index + 1}: Operator is required`);
          }
          
          if (!filter.value) {
            warnings.push(`Advanced filter ${index + 1}: Value is empty`);
          }
        });
      }
      
      res.json({
        success: errors.length === 0,
        valid: errors.length === 0,
        errors,
        warnings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Filter validation failed',
        message: error.message
      });
    }
  }
);

// POST /api/filters/test - Test filter query performance
router.post('/test', 
  userPermissionMiddleware('reports', 'read'),
  async (req, res) => {
    try {
      const { filters, reportType, sampleSize = 100 } = req.body;
      
      const startTime = Date.now();
      
      // This would run the actual query in a real implementation
      // For now, return mock performance data
      const mockResults = {
        executionTime: Math.random() * 1000 + 100, // 100-1100ms
        resultCount: Math.floor(Math.random() * sampleSize),
        queryComplexity: filters.advanced ? filters.advanced.length + 1 : 1,
        indexesUsed: ['tenantId_1', 'status_1', 'createdAt_-1'],
        estimatedCost: Math.random() * 10
      };
      
      res.json({
        success: true,
        performance: mockResults,
        recommendations: [
          mockResults.executionTime > 500 ? 'Consider adding indexes for better performance' : null,
          mockResults.queryComplexity > 5 ? 'Complex query - consider simplifying filters' : null
        ].filter(Boolean)
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Filter test failed',
        message: error.message
      });
    }
  }
);

module.exports = router;