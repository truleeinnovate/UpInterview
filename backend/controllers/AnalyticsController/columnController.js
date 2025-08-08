const { ColumnConfiguration, DashboardLayout } = require('../../models/AnalyticSchemas/columnSchemas');
const { addTenantFilter, generateTenantScopedId } = require('../../middleware/tenantMiddleware');

// =============================================================================
// COLUMN CONFIGURATION CONTROLLERS
// =============================================================================

/**
 * Get column configuration for a specific report type
 */
const getColumnConfiguration = async (req, res) => {
  try {
    const { reportType } = req.params;
    
    const config = await ColumnConfiguration.findOne(
      addTenantFilter(req, { 
        userId: req.currentUser.userId,
        reportType 
      })
    ).lean();
    
    // Return default configuration if none exists
    if (!config) {
      const defaultConfig = getDefaultColumnConfiguration(reportType, req.tenantId, req.currentUser.userId);
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
    console.error('Error fetching column configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch column configuration',
      message: error.message
    });
  }
};

/**
 * Save column configuration
 */
const saveColumnConfiguration = async (req, res) => {
  try {
    const { reportType, columns, layout, defaultSort, defaultFilters, pagination } = req.body;
    
    const configData = {
      tenantId: req.tenantId,
      userId: req.currentUser.userId,
      configId: generateTenantScopedId(req.tenantId, 'COL_'),
      reportType,
      columns: columns.map((col, index) => ({
        ...col,
        order: index
      })),
      layout: layout || { type: 'table', density: 'normal' },
      defaultSort,
      defaultFilters,
      pagination,
      grouping: req.body.grouping || { enabled: false }
    };
    
    const config = await ColumnConfiguration.findOneAndUpdate(
      addTenantFilter(req, { 
        userId: req.currentUser.userId,
        reportType 
      }),
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
      message: 'Column configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving column configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save column configuration',
      message: error.message
    });
  }
};

/**
 * Reset column configuration to default
 */
const resetColumnConfiguration = async (req, res) => {
  try {
    const { reportType } = req.params;
    
    await ColumnConfiguration.findOneAndDelete(
      addTenantFilter(req, { 
        userId: req.currentUser.userId,
        reportType 
      })
    );
    
    const defaultConfig = getDefaultColumnConfiguration(reportType, req.tenantId, req.currentUser.userId);
    
    res.json({
      success: true,
      data: defaultConfig,
      message: 'Column configuration reset to default'
    });
  } catch (error) {
    console.error('Error resetting column configuration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset column configuration',
      message: error.message
    });
  }
};

// =============================================================================
// DASHBOARD LAYOUT CONTROLLERS
// =============================================================================

/**
 * Get dashboard layout
 */
const getDashboardLayout = async (req, res) => {
  try {
    const layout = await DashboardLayout.findOne(
      addTenantFilter(req, { 
        userId: req.currentUser.userId,
        isDefault: true 
      })
    ).lean();
    
    // Return default layout if none exists
    if (!layout) {
      const defaultLayout = getDefaultDashboardLayout(req.tenantId, req.currentUser.userId);
      return res.json({
        success: true,
        data: defaultLayout
      });
    }
    
    res.json({
      success: true,
      data: layout
    });
  } catch (error) {
    console.error('Error fetching dashboard layout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard layout',
      message: error.message
    });
  }
};

/**
 * Save dashboard layout
 */
const saveDashboardLayout = async (req, res) => {
  try {
    const { widgets, grid, settings, name } = req.body;
    
    const layoutData = {
      tenantId: req.tenantId,
      userId: req.currentUser.userId,
      layoutId: generateTenantScopedId(req.tenantId, 'LAYOUT_'),
      name: name || 'Default Layout',
      widgets,
      grid: grid || { columns: 12, rowHeight: 60 },
      settings: settings || { isResizable: true, isDraggable: true },
      isDefault: true
    };
    
    const layout = await DashboardLayout.findOneAndUpdate(
      addTenantFilter(req, { 
        userId: req.currentUser.userId,
        isDefault: true 
      }),
      layoutData,
      { 
        new: true, 
        upsert: true, 
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );
    
    res.json({
      success: true,
      data: layout,
      message: 'Dashboard layout saved successfully'
    });
  } catch (error) {
    console.error('Error saving dashboard layout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save dashboard layout',
      message: error.message
    });
  }
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get default column configuration for a report type
 */
const getDefaultColumnConfiguration = (reportType, tenantId, userId) => {
  const defaultConfigs = {
    interview: {
      columns: [
        { key: 'id', label: 'Interview ID', visible: true, width: 'auto', order: 0, type: 'text', sortable: true, filterable: true },
        { key: 'candidateName', label: 'Candidate', visible: true, width: 'auto', order: 1, type: 'text', sortable: true, filterable: true },
        { key: 'interviewerName', label: 'Interviewer', visible: true, width: 'auto', order: 2, type: 'text', sortable: true, filterable: true },
        { key: 'position', label: 'Position', visible: true, width: 'auto', order: 3, type: 'text', sortable: true, filterable: true },
        { key: 'date', label: 'Date', visible: true, width: '150px', order: 4, type: 'date', sortable: true, filterable: true },
        { key: 'status', label: 'Status', visible: true, width: '120px', order: 5, type: 'select', sortable: true, filterable: true },
        { key: 'score', label: 'Score', visible: true, width: '100px', order: 6, type: 'number', sortable: true, filterable: true },
        { key: 'interviewerType', label: 'Type', visible: true, width: '100px', order: 7, type: 'select', sortable: true, filterable: true }
      ]
    },
    interviewer: {
      columns: [
        { key: 'name', label: 'Name', visible: true, width: 'auto', order: 0, type: 'text', sortable: true, filterable: true },
        { key: 'type', label: 'Type', visible: true, width: '100px', order: 1, type: 'select', sortable: true, filterable: true },
        { key: 'specialization', label: 'Specialization', visible: true, width: 'auto', order: 2, type: 'text', sortable: true, filterable: true },
        { key: 'totalInterviews', label: 'Total Interviews', visible: true, width: '150px', order: 3, type: 'number', sortable: true, filterable: true },
        { key: 'rating', label: 'Rating', visible: true, width: '100px', order: 4, type: 'number', sortable: true, filterable: true },
        { key: 'skills', label: 'Skills', visible: true, width: 'auto', order: 5, type: 'array', sortable: false, filterable: true }
      ]
    },
    assessment: {
      columns: [
        { key: 'candidateName', label: 'Candidate', visible: true, width: 'auto', order: 0, type: 'text', sortable: true, filterable: true },
        { key: 'type', label: 'Assessment Type', visible: true, width: '150px', order: 1, type: 'text', sortable: true, filterable: true },
        { key: 'status', label: 'Status', visible: true, width: '120px', order: 2, type: 'select', sortable: true, filterable: true },
        { key: 'score', label: 'Score', visible: true, width: '100px', order: 3, type: 'number', sortable: true, filterable: true },
        { key: 'completedDate', label: 'Completed Date', visible: true, width: '150px', order: 4, type: 'date', sortable: true, filterable: true }
      ]
    },
    candidate: {
      columns: [
        { key: 'name', label: 'Name', visible: true, width: 'auto', order: 0, type: 'text', sortable: true, filterable: true },
        { key: 'position', label: 'Position', visible: true, width: 'auto', order: 1, type: 'text', sortable: true, filterable: true },
        { key: 'stage', label: 'Current Stage', visible: true, width: '150px', order: 2, type: 'text', sortable: true, filterable: true },
        { key: 'status', label: 'Status', visible: true, width: '120px', order: 3, type: 'select', sortable: true, filterable: true },
        { key: 'appliedDate', label: 'Applied Date', visible: true, width: '150px', order: 4, type: 'date', sortable: true, filterable: true }
      ]
    },
    organization: {
      columns: [
        { key: 'name', label: 'Organization', visible: true, width: 'auto', order: 0, type: 'text', sortable: true, filterable: true },
        { key: 'industry', label: 'Industry', visible: true, width: '150px', order: 1, type: 'text', sortable: true, filterable: true },
        { key: 'interviewsCompleted', label: 'Interviews Completed', visible: true, width: '180px', order: 2, type: 'number', sortable: true, filterable: true },
        { key: 'activePositions', label: 'Active Positions', visible: true, width: '150px', order: 3, type: 'number', sortable: true, filterable: true }
      ]
    }
  };
  
  const config = defaultConfigs[reportType] || defaultConfigs.interview;
  
  return {
    tenantId,
    userId,
    configId: generateTenantScopedId(tenantId, 'COL_'),
    reportType,
    ...config,
    layout: { type: 'table', density: 'normal', showBorders: true, showStripes: true },
    pagination: { enabled: true, pageSize: 25 }
  };
};

/**
 * Get default dashboard layout
 */
const getDefaultDashboardLayout = (tenantId, userId) => {
  return {
    tenantId,
    userId,
    layoutId: generateTenantScopedId(tenantId, 'LAYOUT_'),
    name: 'Default Layout',
    grid: {
      columns: 12,
      rowHeight: 60,
      margin: { x: 10, y: 10 },
      containerPadding: { x: 10, y: 10 }
    },
    widgets: [
      // KPI Cards Row
      { id: 'totalInterviews', type: 'kpi', position: { x: 0, y: 0, width: 3, height: 2 }, config: { kpiType: 'totalInterviews', visible: true } },
      { id: 'outsourcedInterviews', type: 'kpi', position: { x: 3, y: 0, width: 3, height: 2 }, config: { kpiType: 'outsourcedInterviews', visible: true } },
      { id: 'upcomingInterviews', type: 'kpi', position: { x: 6, y: 0, width: 3, height: 2 }, config: { kpiType: 'upcomingInterviews', visible: true } },
      { id: 'averageScore', type: 'kpi', position: { x: 9, y: 0, width: 3, height: 2 }, config: { kpiType: 'averageScore', visible: true } },
      
      // Charts Row
      { id: 'interviewsOverTime', type: 'chart', position: { x: 0, y: 2, width: 6, height: 4 }, config: { chartType: 'line', visible: true } },
      { id: 'assessmentStats', type: 'chart', position: { x: 6, y: 2, width: 6, height: 4 }, config: { chartType: 'pie', visible: true } }
    ],
    settings: {
      isResizable: true,
      isDraggable: true,
      autoSize: false,
      verticalCompact: true,
      preventCollision: false
    },
    isDefault: true
  };
};

module.exports = {
  getColumnConfiguration,
  saveColumnConfiguration,
  resetColumnConfiguration,
  getDashboardLayout,
  saveDashboardLayout
};