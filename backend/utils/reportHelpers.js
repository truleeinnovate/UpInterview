const { ReportTemplate, DashboardConfig, TrendsConfig } = require('../models/reportSchemas');
const { ColumnConfiguration, DashboardLayout } = require('../models/columnSchemas');

/**
 * Generate default dashboard configuration for a new user
 */
const generateDefaultDashboardConfig = (tenantId, userId) => {
  return {
    tenantId,
    userId,
    configId: `DASH_${tenantId}_${userId}_${Date.now()}`,
    settings: {
      layout: {
        type: 'grid',
        columns: 4,
        spacing: 'normal'
      },
      appearance: {
        theme: 'default',
        fontSize: 'medium'
      },
      dateRange: {
        default: 'last30days',
        autoRefresh: {
          enabled: false,
          interval: '5m'
        }
      },
      defaultFilters: {
        interviewType: 'all',
        candidateStatus: 'all',
        position: 'all',
        interviewer: 'all'
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
        billableInterviews: true,
        completionRate: false,
        averageCycleTime: false
      },
      order: [
        'totalInterviews',
        'outsourcedInterviews', 
        'upcomingInterviews',
        'noShows',
        'assessmentsCompleted',
        'averageScore',
        'billableInterviews'
      ],
      positions: []
    },
    charts: {
      visible: {
        interviewsOverTime: true,
        interviewerUtilization: true,
        assessmentStats: true,
        ratingDistribution: true,
        noShowTrends: true,
        cycleTimeTrends: true,
        skillsAnalysis: false,
        geographicDistribution: false
      },
      order: [
        'interviewsOverTime',
        'interviewerUtilization',
        'assessmentStats',
        'ratingDistribution',
        'noShowTrends',
        'cycleTimeTrends'
      ],
      positions: []
    },
    exportSettings: {
      defaultFormat: 'pdf',
      includeCharts: true,
      includeFilters: true,
      paperSize: 'A4',
      orientation: 'portrait'
    }
  };
};

/**
 * Generate default trends configuration for a new user
 */
const generateDefaultTrendsConfig = (tenantId, userId) => {
  return {
    tenantId,
    userId,
    configId: `TREND_${tenantId}_${userId}_${Date.now()}`,
    settings: {
      timePeriod: {
        default: 'last30days'
      },
      comparison: {
        enabled: true,
        period: 'previous_period'
      },
      grouping: {
        timeInterval: 'weekly',
        categories: ['position', 'interviewer']
      }
    },
    sections: {
      topSkills: {
        visible: true,
        limit: 10,
        sortBy: 'frequency'
      },
      topInterviewers: {
        visible: true,
        limit: 5,
        type: 'external',
        sortBy: 'rating'
      },
      bottlenecks: {
        visible: true,
        categories: [
          { type: 'feedback_delays', enabled: true },
          { type: 'scheduling_conflicts', enabled: true },
          { type: 'assessment_delays', enabled: true },
          { type: 'no_shows', enabled: true }
        ],
        threshold: {
          high: 80,
          medium: 50
        }
      },
      performanceMetrics: {
        visible: true,
        metrics: [
          { name: 'interview_completion_rate', enabled: true, target: 90 },
          { name: 'average_feedback_time', enabled: true, target: 24 },
          { name: 'candidate_satisfaction', enabled: true, target: 4.5 }
        ]
      }
    },
    alerts: {
      enabled: false,
      conditions: []
    }
  };
};

/**
 * Create default report templates for a new tenant
 */
const createDefaultReportTemplates = async (tenantId, createdBy) => {
  const defaultTemplates = [
    {
      tenantId,
      templateId: `RPT_${tenantId}_001`,
      createdBy,
      name: 'Weekly Interview Summary',
      description: 'Summary of all interviews conducted in the past week',
      type: 'interview',
      category: 'summary',
      configuration: {
        dataSource: {
          collections: ['interviews'],
          dateRange: 'last7days',
          filters: {
            interviewType: 'all',
            candidateStatus: 'all'
          }
        },
        layout: {
          format: 'dashboard',
          style: 'grid',
          sections: [
            {
              id: 'kpi_section',
              type: 'kpi',
              title: 'Key Metrics',
              position: { row: 1, column: 1, width: 4, height: 1 },
              visible: true,
              config: {
                kpiType: 'totalInterviews'
              }
            },
            {
              id: 'chart_section',
              type: 'chart',
              title: 'Interview Trends',
              position: { row: 2, column: 1, width: 2, height: 2 },
              visible: true,
              config: {
                chartType: 'line',
                xAxis: 'date',
                yAxis: 'count'
              }
            }
          ]
        },
        scheduling: {
          frequency: 'weekly',
          dayOfWeek: 1,
          time: '09:00'
        }
      },
      status: 'active'
    },
    {
      tenantId,
      templateId: `RPT_${tenantId}_002`,
      createdBy,
      name: 'Interviewer Performance Report',
      description: 'Performance metrics for all interviewers',
      type: 'interviewer',
      category: 'performance',
      configuration: {
        dataSource: {
          collections: ['interviews', 'interviewers'],
          dateRange: 'last30days',
          filters: {
            interviewType: 'all'
          }
        },
        layout: {
          format: 'table',
          style: 'list'
        },
        scheduling: {
          frequency: 'monthly',
          dayOfMonth: 1,
          time: '08:00'
        }
      },
      status: 'active'
    },
    {
      tenantId,
      templateId: `RPT_${tenantId}_003`,
      createdBy,
      name: 'Assessment Analytics',
      description: 'Analysis of assessment results and trends',
      type: 'assessment',
      category: 'analytics',
      configuration: {
        dataSource: {
          collections: ['assessments'],
          dateRange: 'last30days'
        },
        layout: {
          format: 'chart',
          style: 'grid'
        },
        scheduling: {
          frequency: 'monthly'
        }
      },
      status: 'active'
    }
  ];

  try {
    const createdTemplates = await ReportTemplate.insertMany(defaultTemplates);
    console.log(`✅ Created ${createdTemplates.length} default report templates for tenant ${tenantId}`);
    return createdTemplates;
  } catch (error) {
    console.error('❌ Error creating default report templates:', error);
    throw error;
  }
};

/**
 * Initialize user configurations (dashboard and trends)
 */
const initializeUserConfigurations = async (tenantId, userId) => {
  try {
    // Create default dashboard config
    const dashboardConfig = new DashboardConfig(
      generateDefaultDashboardConfig(tenantId, userId)
    );
    await dashboardConfig.save();

    // Create default trends config
    const trendsConfig = new TrendsConfig(
      generateDefaultTrendsConfig(tenantId, userId)
    );
    await trendsConfig.save();

    console.log(`✅ Initialized configurations for user ${userId} in tenant ${tenantId}`);
    
    return {
      dashboardConfig,
      trendsConfig
    };
  } catch (error) {
    console.error('❌ Error initializing user configurations:', error);
    throw error;
  }
};

/**
 * Apply user filters to a MongoDB query
 */
const applyUserFilters = (baseQuery, userFilters, tenantId) => {
  const query = { ...baseQuery, tenantId };

  if (userFilters.interviewType && userFilters.interviewType !== 'all') {
    query.interviewerType = userFilters.interviewType;
  }

  if (userFilters.candidateStatus && userFilters.candidateStatus !== 'all') {
    query.status = userFilters.candidateStatus;
  }

  if (userFilters.position && userFilters.position !== 'all') {
    query.position = userFilters.position;
  }

  if (userFilters.interviewer && userFilters.interviewer !== 'all') {
    query.interviewerId = userFilters.interviewer;
  }

  if (userFilters.organization) {
    query.organizationId = userFilters.organization;
  }

  return query;
};

/**
 * Apply date range filter to query
 */
const applyDateRangeFilter = (query, dateRange, customRange = null) => {
  const now = new Date();
  let startDate, endDate;

  switch (dateRange) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      break;
    case 'yesterday':
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'last7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case 'last30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case 'last90days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'thisYear':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      break;
    case 'custom':
      if (customRange && customRange.startDate && customRange.endDate) {
        startDate = new Date(customRange.startDate);
        endDate = new Date(customRange.endDate);
      }
      break;
    default:
      return query;
  }

  if (startDate && endDate) {
    query.createdAt = {
      $gte: startDate,
      $lte: endDate
    };
  }

  return query;
};

/**
 * Validate report template configuration
 */
const validateReportTemplate = (template) => {
  const errors = [];

  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required');
  }

  if (!template.type || !['interview', 'interviewer', 'assessment', 'candidate', 'organization', 'dashboard', 'trends', 'custom'].includes(template.type)) {
    errors.push('Valid template type is required');
  }

  if (!template.configuration || !template.configuration.dataSource) {
    errors.push('Data source configuration is required');
  }

  if (template.configuration && template.configuration.scheduling) {
    const scheduling = template.configuration.scheduling;
    if (scheduling.frequency === 'weekly' && (scheduling.dayOfWeek < 0 || scheduling.dayOfWeek > 6)) {
      errors.push('Day of week must be between 0-6 for weekly scheduling');
    }
    if (scheduling.frequency === 'monthly' && (scheduling.dayOfMonth < 1 || scheduling.dayOfMonth > 31)) {
      errors.push('Day of month must be between 1-31 for monthly scheduling');
    }
  }

  return errors;
};

module.exports = {
  generateDefaultDashboardConfig,
  generateDefaultTrendsConfig,
  createDefaultReportTemplates,
  initializeUserConfigurations,
  applyUserFilters,
  applyDateRangeFilter,
  validateReportTemplate
};